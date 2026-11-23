import nodemailer from 'nodemailer';

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

  const cleanEmail = email.trim().toLowerCase();
  const name = recipientName || 'Campus Member';

  const htmlTemplate = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; border: 1px solid #e2e8f0; border-radius: 20px; background-color: #ffffff; color: #1e293b;">
      <div style="margin-bottom: 24px; text-align: left;">
        <h1 style="color: #371B7A; font-size: 26px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">
          Back<span style="color: #EA580C;">2U</span>
        </h1>
        <p style="color: #64748b; font-size: 13px; font-weight: 500; margin: 4px 0 0 0;">
          Campus Lost &amp; Found Portal
        </p>
      </div>
      
      <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 16px; padding: 24px; margin-bottom: 24px; border-left: 4px solid #371B7A;">
        <h2 style="color: #1e1b4b; font-size: 18px; font-weight: 700; margin: 0 0 8px 0;">
          Verify Your College Email Address
        </h2>
        <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0;">
          Hello <strong>${name}</strong>,<br/>
          Thank you for joining Back2U! Please click the verification button below to activate your account. You will be automatically verified and redirected to the login page.
        </p>
      </div>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${verificationLink}" target="_blank" rel="noopener noreferrer" style="background-color: #371B7A; color: #ffffff; padding: 15px 36px; text-decoration: none; border-radius: 9999px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 6px 16px rgba(55, 27, 122, 0.28); transition: all 0.2s;">
          Verify Email &amp; Proceed to Login &rarr;
        </a>
      </div>

      <p style="color: #64748b; font-size: 13px; line-height: 1.6; margin-bottom: 20px;">
        This verification link will expire in 24 hours. If you did not request this verification, you can safely ignore this email.
      </p>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 32px;">
        <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin: 0 0 8px 0;">
          Having trouble clicking the button? Copy and paste this URL into your browser:
        </p>
        <a href="${verificationLink}" style="color: #371B7A; font-size: 12px; word-break: break-all; text-decoration: underline;">
          ${verificationLink}
        </a>
      </div>
    </div>
  `;

  // 1. GMAIL / CUSTOM SMTP VIA NODEMAILER (Recommended: Works for ANY recipient without needing a custom domain)
  const emailUser = process.env.EMAIL_USER || process.env.GMAIL_USER || process.env.SMTP_USER;
  const emailPass = process.env.EMAIL_PASS || process.env.GMAIL_PASS || process.env.SMTP_PASS;

  if (emailUser && emailPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPass, // Google 16-character App Password
        },
      });

      const info = await transporter.sendMail({
        from: `"Back2U Campus Portal" <${emailUser}>`,
        to: cleanEmail,
        subject: 'Verify your Back2U Campus Account',
        html: htmlTemplate,
      });

      return res.status(200).json({
        success: true,
        provider: 'Nodemailer (Gmail)',
        messageId: info.messageId,
      });
    } catch (smtpErr) {
      console.error('Nodemailer SMTP Error:', smtpErr);
      // Fall through to other providers if SMTP fails
    }
  }

  // 2. RESEND API
  const resendApiKey = process.env.RESEND_API_KEY;
  const resendFrom = process.env.RESEND_FROM_EMAIL || 'Back2U Campus <onboarding@resend.dev>';

  if (resendApiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: resendFrom,
          to: [cleanEmail],
          subject: 'Verify your Back2U Campus Account',
          html: htmlTemplate,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        return res.status(200).json({ success: true, provider: 'Resend', id: data.id });
      } else {
        console.error('Resend API response error:', data);
        // If it's the domain restriction error, explain clearly
        const isDomainRestriction = data.message && data.message.includes('Testing domain restriction');
        if (isDomainRestriction) {
          return res.status(400).json({
            success: false,
            error: 'RESEND_DOMAIN_RESTRICTION',
            message: 'Resend onboarding@resend.dev can only send to your own registered account email. To send to any recipient without domain verification, please add EMAIL_USER and EMAIL_PASS (Gmail App Password) in your Vercel Environment Variables, or verify a custom domain in Resend and set RESEND_FROM_EMAIL.',
          });
        }
        return res.status(400).json({ success: false, error: data.message });
      }
    } catch (err) {
      console.error('Resend catch error:', err);
    }
  }

  // 3. EMAILJS REST API
  const emailjsServiceId = process.env.VITE_EMAILJS_SERVICE_ID || process.env.EMAILJS_SERVICE_ID;
  const emailjsTemplateId = process.env.VITE_EMAILJS_TEMPLATE_ID || process.env.EMAILJS_TEMPLATE_ID;
  const emailjsPublicKey = process.env.VITE_EMAILJS_PUBLIC_KEY || process.env.EMAILJS_PUBLIC_KEY;

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
            to_email: cleanEmail,
            to_name: name,
            verification_link: verificationLink,
            link: verificationLink,
            app_name: 'Back2U - Campus Lost & Found',
          },
        }),
      });

      if (response.ok) {
        return res.status(200).json({ success: true, provider: 'EmailJS' });
      }
    } catch (err) {
      console.error('EmailJS error:', err);
    }
  }

  // If no working provider was configured
  return res.status(400).json({
    success: false,
    error: 'NO_EMAIL_PROVIDER_CONFIGURED',
    message: 'No email service configured. Please add EMAIL_USER and EMAIL_PASS (Gmail App Password) in Vercel Environment Variables to send verification links to any student or user email address.',
  });
}
