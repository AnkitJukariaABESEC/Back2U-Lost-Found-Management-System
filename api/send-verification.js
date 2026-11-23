export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, verificationLink, recipientName } = req.body || {};

  if (!email || !verificationLink) {
    return res.status(400).json({ error: 'Email and verification link are required' });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const emailjsServiceId = process.env.VITE_EMAILJS_SERVICE_ID || process.env.EMAILJS_SERVICE_ID;
  const emailjsTemplateId = process.env.VITE_EMAILJS_TEMPLATE_ID || process.env.EMAILJS_TEMPLATE_ID;
  const emailjsPublicKey = process.env.VITE_EMAILJS_PUBLIC_KEY || process.env.EMAILJS_PUBLIC_KEY;

  // 1. Send via Resend API (3,000 free emails/month, fastest Vercel integration)
  if (resendApiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Back2U Campus <onboarding@resend.dev>',
          to: [email],
          subject: 'Verify your Back2U Campus Account',
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 32px 24px; border: 1px solid #e2e8f0; border-radius: 20px; background-color: #ffffff;">
              <div style="margin-bottom: 24px;">
                <h1 style="color: #371B7A; font-size: 24px; font-weight: 800; margin: 0;">Back<span style="color: #EA580C;">2U</span></h1>
                <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">Campus Lost & Found Registry</p>
              </div>
              <h2 style="color: #1e1b4b; font-size: 18px; font-weight: 700; margin-bottom: 12px;">Verify your college email address</h2>
              <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
                Hello <strong>${recipientName || 'Campus Member'}</strong>,<br/>
                Please click the button below to verify your email address. Clicking the link will automatically verify your account and redirect you to the login page:
              </p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${verificationLink}" style="background-color: #371B7A; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 9999px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(55, 27, 122, 0.25);">
                  Verify Email & Redirect to Login →
                </a>
              </div>
              <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin-top: 32px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
                If the button above does not work, copy and paste this link into your browser:<br/>
                <a href="${verificationLink}" style="color: #371B7A; word-break: break-all;">${verificationLink}</a>
              </p>
            </div>
          `,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        return res.status(200).json({ success: true, provider: 'Resend', id: data.id });
      } else {
        return res.status(400).json({ success: false, error: data.message });
      }
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // 2. Send via EmailJS API
  if (emailjsServiceId && emailjsTemplateId && emailjsPublicKey) {
    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: emailjsServiceId,
          template_id: emailjsTemplateId,
          user_id: emailjsPublicKey,
          template_params: {
            to_email: email,
            to_name: recipientName || 'Campus Member',
            verification_link: verificationLink,
            link: verificationLink,
            app_name: 'Back2U - Campus Lost & Found',
          },
        }),
      });

      if (response.ok) {
        return res.status(200).json({ success: true, provider: 'EmailJS' });
      } else {
        const text = await response.text();
        return res.status(400).json({ success: false, error: text });
      }
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // 3. Fallback: FormSubmit
  try {
    const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(email)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        _subject: 'Verify your Back2U Campus Account',
        name: 'Back2U Campus Lost & Found',
        message: `Click the link below to verify your email and redirect to login:\n\n${verificationLink}`,
        verification_url: verificationLink,
      }),
    });

    if (response.ok) {
      return res.status(200).json({ success: true, provider: 'FormSubmit' });
    }
  } catch (err) {
    // ignore
  }

  return res.status(400).json({
    success: false,
    error: 'NO_CONFIG',
    message: 'To send emails directly to your personal inbox, please add your RESEND_API_KEY in Vercel Environment Variables.',
  });
}
