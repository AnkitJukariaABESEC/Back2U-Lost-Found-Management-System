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
   * Dispatches a 6-digit OTP code to the recipient's real email address.
   * Uses EmailJS REST API or Supabase Auth.
   */
  async sendOtpEmail(recipientEmail, otpCode, recipientName = 'Campus Member') {
    // 1. Try EmailJS REST API (No npm package needed, works via standard browser fetch)
    if (EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY) {
      try {
        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            service_id: EMAILJS_SERVICE_ID,
            template_id: EMAILJS_TEMPLATE_ID,
            user_id: EMAILJS_PUBLIC_KEY,
            template_params: {
              to_email: recipientEmail,
              to_name: recipientName,
              otp_code: otpCode,
              app_name: 'Back2U - Campus Lost & Found',
            },
          }),
        });

        if (response.ok) {
          return {
            success: true,
            provider: 'EmailJS',
            message: `Real email successfully dispatched to ${recipientEmail}. Please check your inbox and spam folder!`,
          };
        } else {
          const errText = await response.text();
          console.warn('EmailJS error:', errText);
        }
      } catch (err) {
        console.warn('EmailJS dispatch failed:', err);
      }
    }

    // 2. Try Supabase Auth OTP if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.signInWithOtp({
          email: recipientEmail,
        });

        if (!error) {
          return {
            success: true,
            provider: 'Supabase',
            message: `Supabase authentication email dispatched to ${recipientEmail}!`,
          };
        } else {
          console.warn('Supabase OTP error:', error);
        }
      } catch (err) {
        console.warn('Supabase OTP failed:', err);
      }
    }

    // 3. Fallback: Demo Simulated Mode with clear guidance
    return {
      success: true,
      provider: 'SIMULATED',
      message: `Demo Mode: Real email delivery requires free EmailJS or Supabase keys in .env. Your verification code is ready below.`,
    };
  },
};
