module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    let { name, email, phone, subject, message, time } = req.body || {};

    if (!name || typeof name !== 'string') return res.status(400).json({ success: false, error: 'Name is required' });
    if (!email || typeof email !== 'string') return res.status(400).json({ success: false, error: 'Email is required' });
    if (!message || typeof message !== 'string') return res.status(400).json({ success: false, error: 'Message is required' });

    name = name.trim();
    email = email.trim();
    phone = typeof phone === 'string' ? phone.trim() : '';
    subject = typeof subject === 'string' ? subject.trim() : 'New Inquiry';
    message = message.trim();

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: 'Name, email, and message are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email format' });
    }

    if (name.length > 100 || email.length > 150 || subject.length > 200 || message.length > 5000) {
      return res.status(400).json({ success: false, error: 'Input excessively large' });
    }

    const SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
    const TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID;
    const PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
    const PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY; // Optional, bypasses non-browser restriction if provided

    if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
      console.error('EmailJS credentials are not fully configured in environment variables.');
      return res.status(500).json({ success: false, error: 'Server configuration error: Missing EmailJS environment variables.' });
    }

    // Construct the correct EmailJS REST API payload
    const payload = {
      service_id: SERVICE_ID,
      template_id: TEMPLATE_ID,
      user_id: PUBLIC_KEY,
      template_params: {
        name,
        email,
        phone,
        subject,
        message,
        time: time || new Date().toLocaleString()
      }
    };

    // If a private key is provided, it acts as the access token for non-browser environments
    if (PRIVATE_KEY) {
      payload.accessToken = PRIVATE_KEY;
    }

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      return res.status(200).json({ success: true });
    } else {
      const errorText = await response.text();
      console.error('EmailJS API Error:', errorText);
      
      // Provide a clear error message that points to the exact dashboard setting required
      let errorMessage = 'Unable to send your message right now. Please try again.';
      if (response.status === 403 || errorText.includes('non-browser')) {
         errorMessage = 'EmailJS Security Error: API access from non-browser environments is currently disabled. Please enable "Allow API requests from non-browser applications" in https://dashboard.emailjs.com/admin/account/security';
      }
      
      return res.status(response.status).json({ success: false, error: errorMessage });
    }
  } catch (error) {
    console.error('API endpoint error:', error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}
