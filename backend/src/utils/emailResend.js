/**
 * Modern Email Service using Resend API
 * Much simpler and more reliable than SMTP
 * 
 * Setup:
 * 1. Sign up at https://resend.com (free)
 * 2. Get API key from https://resend.com/api-keys
 * 3. Add to .env: RESEND_API_KEY=re_your_key_here
 * 4. Set EMAIL_FROM_ADDRESS=onboarding@resend.dev (or your domain)
 */

import { Resend } from 'resend';
import { sendEmail as sendSMTPEmail } from './email.js';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/**
 * Send email using Resend API
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text email content
 * @param {string} options.html - HTML email content
 * @returns {Promise<void>}
 */
// sendEmail (Resend with SMTP fallback)
export const sendEmail = async (options) => {
  const fromName = (process.env.EMAIL_FROM_NAME || 'Babyfiction').trim();
  const fromAddress = (process.env.EMAIL_FROM_ADDRESS || 'onboarding@resend.dev').trim();

  // Basic validation
  if (!options || !options.to || !options.subject) {
    throw new Error('Missing required email fields: to and subject');
  }

  // If Resend is not configured, use SMTP (or dev log)
  if (!resend || !process.env.RESEND_API_KEY) {
    try {
      await sendSMTPEmail({
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
      return;
    } catch (smtpErr) {
      console.log('\n' + '='.repeat(80));
      console.log('📧 EMAIL (Development Mode - Resend & SMTP not configured)');
      console.log('='.repeat(80));
      console.log('From:', `${fromName} <${fromAddress}>`);
      console.log('To:', options.to);
      console.log('Subject:', options.subject);
      console.log('-'.repeat(80));
      console.log('Text Content:');
      console.log(options.text || 'No text content');
      if (typeof options.html === 'string' && options.html.length) {
        console.log('-'.repeat(80));
        console.log('HTML Content (preview):');
        console.log(options.html.substring(0, 500) + '...');
      }
      console.log('='.repeat(80));
      console.log('💡 Configure emails via RESEND_API_KEY or SMTP_* / EMAIL_* env vars.');
      console.log('='.repeat(80) + '\n');
      return;
    }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `${fromName} <${fromAddress}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    if (error) {
      console.error('❌ Resend API Error:', error);
      // Fallback to SMTP when Resend returns an error
      try {
        await sendSMTPEmail({
          to: options.to,
          subject: options.subject,
          text: options.text,
          html: options.html,
        });
        return;
      } catch (smtpErr) {
        throw new Error(`Failed to send email via Resend and SMTP: ${error.message}`);
      }
    }

    console.log(`✅ Email sent successfully to ${options.to} (ID: ${data.id})`);
    return data;
  } catch (error) {
    console.error('❌ Email sending failed:', error?.message || error);
    // Final fallback to SMTP when Resend throws
    try {
      await sendSMTPEmail({
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
      return;
    } catch {
      throw error;
    }
  }
};

export default sendEmail;
