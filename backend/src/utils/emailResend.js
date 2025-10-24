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
export const sendEmail = async (options) => {
  const fromName = process.env.EMAIL_FROM_NAME || 'Babyfiction';
  const fromAddress = process.env.EMAIL_FROM_ADDRESS || 'onboarding@resend.dev';

  // If Resend is not configured, log to console in development
  if (!resend || !process.env.RESEND_API_KEY) {
    console.log('\n' + '='.repeat(80));
    console.log('📧 EMAIL (Development Mode - Resend not configured)');
    console.log('='.repeat(80));
    console.log('From:', `${fromName} <${fromAddress}>`);
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    console.log('-'.repeat(80));
    console.log('Text Content:');
    console.log(options.text || 'No text content');
    if (options.html) {
      console.log('-'.repeat(80));
      console.log('HTML Content (preview):');
      console.log(options.html.substring(0, 500) + '...');
    }
    console.log('='.repeat(80));
    console.log('💡 To send real emails:');
    console.log('   1. Sign up at https://resend.com');
    console.log('   2. Get API key');
    console.log('   3. Add RESEND_API_KEY to environment variables');
    console.log('='.repeat(80) + '\n');
    return;
  }

  try {
    // Send email using Resend API
    const { data, error } = await resend.emails.send({
      from: `${fromName} <${fromAddress}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    if (error) {
      console.error('❌ Resend API Error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log(`✅ Email sent successfully to ${options.to} (ID: ${data.id})`);
    return data;
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    throw error;
  }
};

export default sendEmail;
