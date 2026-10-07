const emailjs = require('@emailjs/nodejs');

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

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const body = parseBody(req);
    if (body === null) {
      return res.status(400).json({ success: false, error: 'Invalid JSON body' });
    }

    let { name, email, phone, subject, message, time } = body;

    // Validation: name, email, message required; phone + subject optional
    if (!name || typeof name !== 'string') return res.status(400).json({ success: false, error: 'Name is required' });
    if (!email || typeof email !== 'string') return res.status(400).json({ success: false, error: 'Email is required' });
    if (!message || typeof message !== 'string') return res.status(400).json({ success: false, error: 'Message is required' });

    name = name.trim();
    email = email.trim();
    phone = typeof phone === 'string' ? phone.trim() : '';
    subject = typeof subject === 'string' && subject.trim() ? subject.trim() : 'New Inquiry';
    message = message.trim();

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: 'Name, email, and message are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email format' });
    }

    if (name.length > 100 || email.length > 150 || phone.length > 30 || subject.length > 200 || message.length > 5000) {
      return res.status(400).json({ success: false, error: 'Input excessively large' });
    }

    const SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
    const TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID;
    const PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
    const PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY;

    // Report only the *names* of missing variables — never their values.
    const missing = [
      ['EMAILJS_SERVICE_ID', SERVICE_ID],
      ['EMAILJS_TEMPLATE_ID', TEMPLATE_ID],
      ['EMAILJS_PUBLIC_KEY', PUBLIC_KEY],
      ['EMAILJS_PRIVATE_KEY', PRIVATE_KEY],
    ].filter(([, value]) => !value).map(([key]) => key);

    if (missing.length) {
      console.error('EmailJS configuration missing env vars:', missing.join(', '));
      return res.status(500).json({ success: false, error: `Server configuration error: missing ${missing.join(', ')}` });
    }

    const templateParams = {
      name,
      email,
      phone,
      subject,
      message,
      time: typeof time === 'string' && time.trim() ? time.trim() : new Date().toLocaleString(),
    };

    const options = {
      publicKey: PUBLIC_KEY,
      privateKey: PRIVATE_KEY,
    };

    // Use the official Node SDK as requested
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, options);

    return res.status(200).json({ success: true });

  } catch (error) {
    // Note: EmailJSResponseStatus errors have .text property, JS errors have .message
    const errorDetails = error && error.text ? error.text : (error && error.message ? error.message : String(error));
    console.error('Contact API error:', errorDetails);
    return res.status(500).json({ success: false, error: errorDetails });
  }
};
