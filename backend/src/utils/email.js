import nodemailer from 'nodemailer';

/**
 * Send email using nodemailer
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text email content
 * @param {string} options.html - HTML email content
 * @returns {Promise<void>}
 */
export const sendEmail = async (options) => {
  // Resolve configuration from env (supports both EMAIL_* and SMTP_* plus FROM_*)
  const host = process.env.EMAIL_HOST || process.env.SMTP_HOST;
  const port = Number(process.env.EMAIL_PORT || process.env.SMTP_PORT || 587);
  const user = process.env.EMAIL_USERNAME || process.env.SMTP_USER;
  const pass = process.env.EMAIL_PASSWORD || process.env.SMTP_PASS;
  const fromName = process.env.EMAIL_FROM_NAME || process.env.FROM_NAME || 'Babyfiction';
  const fromAddress = process.env.EMAIL_FROM_ADDRESS || process.env.FROM_EMAIL;

  // If required values are missing, log and exit early (do not throw)
  if (!host || !user || !pass || !fromAddress) {
    console.warn('[email] Missing SMTP configuration. Email not sent.', {
      host: Boolean(host), user: Boolean(user), pass: Boolean(pass), fromAddress: Boolean(fromAddress)
    });
    return;
  }

  // Create a transporter
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // 465 = SSL, 587 = STARTTLS
    auth: { user, pass }
  });

  // Define email options
  const mailOptions = {
    from: `${fromName} <${fromAddress}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html
  };

  // Send the email
  await transporter.sendMail(mailOptions);
};

export default sendEmail;