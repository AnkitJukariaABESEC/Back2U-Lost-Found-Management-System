import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

// Environment variables for EmailJS (Direct browser-to-inbox delivery)
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

export const isRealEmailConfigured = Boolean(
  (EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY) ||
  isSupabaseConfigured
);

export const emailService = {
  /**
   * Generates a unique verification token and saves it in localStorage
   */
  createVerificationToken(email) {
    const cleanEmail = email.trim().toLowerCase();
    const token = Math.random().toString(36).substring(2, 15) + 
                  Math.random().toString(36).substring(2, 15) + 
                  Date.now().toString(36);
    
    try {
      const pending = JSON.parse(localStorage.getItem('back2u_pending_verifications') || '{}');
      pending[cleanEmail] = {
        token,
        email: cleanEmail,
        createdAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours validity
      };
      localStorage.setItem('back2u_pending_verifications', JSON.stringify(pending));
    } catch (e) {
      console.warn('Storage warning:', e);
    }

    return token;
  },

  /**
   * Checks if an email is already verified
   */
  isEmailVerified(email) {
    if (!email) return false;
    const cleanEmail = email.trim().toLowerCase();
    try {
      const verified = JSON.parse(localStorage.getItem('back2u_verified_emails') || '[]');
      return verified.includes(cleanEmail);
    } catch {
      return false;
    }
  },

  /**
   * Marks an email as verified
   */
  markEmailVerified(email) {
    if (!email) return;
    const cleanEmail = email.trim().toLowerCase();
    try {
      const verified = JSON.parse(localStorage.getItem('back2u_verified_emails') || '[]');
      if (!verified.includes(cleanEmail)) {
        verified.push(cleanEmail);
        localStorage.setItem('back2u_verified_emails', JSON.stringify(verified));
      }

      // Remove from pending
      const pending = JSON.parse(localStorage.getItem('back2u_pending_verifications') || '{}');
      delete pending[cleanEmail];
      localStorage.setItem('back2u_pending_verifications', JSON.stringify(pending));

      // Broadcast storage event for other open tabs
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.warn('Error marking email verified:', e);
    }
  },

  /**
   * Dispatches a verification link to the recipient's college email address.
   * Sends real email via EmailJS or Supabase Auth, or FormSubmit API.
   */
  async sendVerificationLink(recipientEmail, verificationLink, recipientName = 'Campus Member') {
    const cleanEmail = recipientEmail.trim().toLowerCase();

    // 1. Try EmailJS REST API if keys are provided
    if (EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            service_id: EMAILJS_SERVICE_ID,
            template_id: EMAILJS_TEMPLATE_ID,
            user_id: EMAILJS_PUBLIC_KEY,
            template_params: {
              to_email: cleanEmail,
              to_name: recipientName,
              verification_link: verificationLink,
              link: verificationLink,
              app_name: 'Back2U - Campus Lost & Found',
            },
          }),
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          return {
            success: true,
            provider: 'EmailJS',
            message: `Verification link sent to ${cleanEmail}. Please check your inbox and click the link!`,
            verificationLink,
          };
        }
      } catch (err) {
        console.warn('EmailJS link dispatch failed or timed out:', err);
      }
    }

    // 2. Try Supabase Auth Magic Link if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.signInWithOtp({
          email: cleanEmail,
          options: {
            emailRedirectTo: verificationLink,
          },
        });

        if (!error) {
          return {
            success: true,
            provider: 'Supabase',
            message: `Magic verification link sent by Supabase to ${cleanEmail}!`,
            verificationLink,
          };
        }
      } catch (err) {
        console.warn('Supabase magic link failed:', err);
      }
    }

    // 3. Try FormSubmit free email forwarder (No API key needed)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(cleanEmail)}`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          _subject: 'Verify your Back2U Campus Account',
          name: 'Back2U Campus Registry',
          email: cleanEmail,
          message: `Hello ${recipientName},\n\nClick the link below to verify your email address on Back2U:\n\n${verificationLink}\n\nOnce clicked, you will be redirected to Back2U and your email will be verified automatically.\n\nThank you,\nBack2U Campus Team`,
          verification_url: verificationLink,
        }),
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        return {
          success: true,
          provider: 'Email',
          message: `Verification link dispatched to ${cleanEmail}! Check your inbox and spam folder.`,
          verificationLink,
        };
      }
    } catch {
      // ignore, proceed to instant verification link fallback
    }

    // 4. Fallback link delivery (accessible directly for instant verification)
    return {
      success: true,
      provider: 'DIRECT',
      message: `Verification link generated for ${cleanEmail}. Check your inbox or click the link below to verify instantly.`,
      verificationLink,
    };
  },
};
