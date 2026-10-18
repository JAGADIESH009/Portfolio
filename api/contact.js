const emailjs = require('@emailjs/nodejs');

// In-memory rate limiting store (IP -> array of request timestamps)
// Max 5 submissions per 10-minute window per IP
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;
const rateLimitMap = new Map();

// Periodic cleanup of stale rate-limit entries to avoid memory growth
function cleanupRateLimitStore() {
  const now = Date.now();
  for (const [ip, timestamps] of rateLimitMap.entries()) {
    const valid = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
    if (valid.length === 0) {
      rateLimitMap.delete(ip);
    } else {
      rateLimitMap.set(ip, valid);
    }
  }
}

function checkRateLimit(ip) {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const recent = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    const oldest = recent[0];
    const retryAfterSec = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - oldest)) / 1000);
    return { limited: true, retryAfter: Math.max(1, retryAfterSec) };
  }

  recent.push(now);
  rateLimitMap.set(ip, recent);

  // Trigger occasional cleanup when map grows
  if (rateLimitMap.size > 200) {
    cleanupRateLimitStore();
  }

  return { limited: false };
}

function getClientIp(req) {
  const xForwardedFor = req.headers['x-forwarded-for'];
  if (typeof xForwardedFor === 'string') {
    return xForwardedFor.split(',')[0].trim();
  }
  return req.headers['x-real-ip'] || (req.socket && req.socket.remoteAddress) || '127.0.0.1';
}

function parseBody(req) {
  const body = req.body;
  if (!body) return {};
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return null;
    }
  }
  return body;
}

function stripControlChars(str) {
  if (typeof str !== 'string') return '';
  // Strip control characters (null bytes, bell, escape, etc.) preserving normal whitespace
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

function isAllowedOrigin(origin) {
  if (!origin) return true; // Direct/same-origin navigation or serverless dev
  try {
    const url = new URL(origin);
    const hostname = url.hostname.toLowerCase();
    // Allow localhost, local IP, Vercel deployments, or portfolio custom domains
    return (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.endsWith('.vercel.app') ||
      hostname === 'jagadiesh.me' ||
      hostname.endsWith('.jagadiesh.me')
    );
  } catch {
    return false;
  }
}

module.exports = async function handler(req, res) {
  // Always set defense-in-depth security response headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');

  // 1. Handle HTTP methods
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  // 2. Origin & CORS check to block cross-site abuse
  const origin = req.headers.origin;
  if (origin && !isAllowedOrigin(origin)) {
    return res.status(403).json({ success: false, error: 'Forbidden: unauthorized origin' });
  }
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }

  // 3. IP-based rate limiting
  const clientIp = getClientIp(req);
  const rateLimitStatus = checkRateLimit(clientIp);
  if (rateLimitStatus.limited) {
    res.setHeader('Retry-After', String(rateLimitStatus.retryAfter));
    return res.status(429).json({
      success: false,
      error: 'Too many requests. Please wait a few minutes before trying again.'
    });
  }

  try {
    // 4. Safe body parsing
    const body = parseBody(req);
    if (body === null) {
      return res.status(400).json({ success: false, error: 'Invalid JSON payload' });
    }

    // 5. Bot honeypot check: website_url should remain completely empty
    if (body.website_url) {
      // Silently accept without processing to fool automated scrapers
      return res.status(200).json({ success: true });
    }

    let { name, email, phone, subject, message, time } = body;

    // 6. Strict type checking and control character sanitization
    name = stripControlChars(typeof name === 'string' ? name.trim() : '');
    email = stripControlChars(typeof email === 'string' ? email.trim() : '');
    phone = stripControlChars(typeof phone === 'string' ? phone.trim() : '');
    subject = stripControlChars(typeof subject === 'string' && subject.trim() ? subject.trim() : 'New Inquiry');
    message = stripControlChars(typeof message === 'string' ? message.trim() : '');

    // 7. Input validation
    if (!name || name.length < 2) {
      return res.status(400).json({ success: false, error: 'Name must be at least 2 characters long' });
    }
    if (name.length > 100) {
      return res.status(400).json({ success: false, error: 'Name exceeds maximum length of 100 characters' });
    }

    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    if (!email || !emailRegex.test(email) || email.length > 150) {
      return res.status(400).json({ success: false, error: 'Please provide a valid email address' });
    }

    if (phone && phone.length > 30) {
      return res.status(400).json({ success: false, error: 'Phone number exceeds maximum length of 30 characters' });
    }

    if (subject.length > 200) {
      return res.status(400).json({ success: false, error: 'Subject exceeds maximum length of 200 characters' });
    }

    if (!message || message.length < 5) {
      return res.status(400).json({ success: false, error: 'Message must be at least 5 characters long' });
    }
    if (message.length > 5000) {
      return res.status(400).json({ success: false, error: 'Message exceeds maximum length of 5000 characters' });
    }

    // 8. Server-side environment variable validation
    const SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
    const TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID;
    const PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
    const PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY;

    if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY || !PRIVATE_KEY) {
      // Log missing variable details strictly on server logs; NEVER leak to client response
      const missingVars = [
        !SERVICE_ID && 'EMAILJS_SERVICE_ID',
        !TEMPLATE_ID && 'EMAILJS_TEMPLATE_ID',
        !PUBLIC_KEY && 'EMAILJS_PUBLIC_KEY',
        !PRIVATE_KEY && 'EMAILJS_PRIVATE_KEY',
      ].filter(Boolean);

      console.error('EmailJS configuration error: Missing required environment variables:', missingVars.join(', '));
      return res.status(500).json({
        success: false,
        error: 'Unable to process your request at this time. Please try again later.'
      });
    }

    const templateParams = {
      name,
      email,
      phone,
      subject,
      message,
      time: typeof time === 'string' && time.trim() ? stripControlChars(time.trim()) : new Date().toLocaleString(),
    };

    const options = {
      publicKey: PUBLIC_KEY,
      privateKey: PRIVATE_KEY,
    };

    // 9. Send email using official EmailJS Node.js SDK
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, options);

    return res.status(200).json({ success: true });

  } catch (error) {
    // Log complete technical error details strictly server-side
    const errorDetails = error && error.text ? error.text : (error && error.message ? error.message : String(error));
    console.error('Contact API error:', errorDetails);

    // Return sanitized generic error message to client without leaking internals
    return res.status(500).json({
      success: false,
      error: 'Unable to send your message right now. Please try again later.'
    });
  }
};
