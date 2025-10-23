import nodemailer from 'nodemailer';

// Email configuration
const createTransporter = () => {
  // For development: use Ethereal (fake SMTP) or configure real SMTP
  // For production: use SendGrid, AWS SES, or other email service
  
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  if (isDevelopment && !process.env.EMAIL_HOST) {
    // Development: Log emails to console instead of sending
    return {
      sendMail: async (options) => {
        console.log('\n📧 Email would be sent:');
        console.log('To:', options.to);
        console.log('Subject:', options.subject);
        console.log('Body:', options.html || options.text);
        console.log('---\n');
        return { messageId: 'dev-' + Date.now() };
      }
    };
  }

  // Production or configured SMTP
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (to, resetToken, userName) => {
  const transporter = createTransporter();
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'Babyfiction'}" <${process.env.EMAIL_FROM || 'noreply@babyfiction.com'}>`,
    to,
    subject: 'Password Reset Request - Babyfiction',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #000; color: #fff; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 8px; margin-top: 20px; }
            .button { display: inline-block; background: #000; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Babyfiction</h1>
            </div>
            <div class="content">
              <h2>Password Reset Request</h2>
              <p>Hi ${userName || 'there'},</p>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              <p style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </p>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #666;">${resetUrl}</p>
              <p><strong>This link will expire in 1 hour.</strong></p>
              <p>If you didn't request a password reset, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Babyfiction. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Password Reset Request
      
      Hi ${userName || 'there'},
      
      We received a request to reset your password. Click the link below to create a new password:
      
      ${resetUrl}
      
      This link will expire in 1 hour.
      
      If you didn't request a password reset, you can safely ignore this email.
      
      © ${new Date().getFullYear()} Babyfiction. All rights reserved.
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

/**
 * Send order confirmation email
 */
export const sendOrderConfirmationEmail = async (to, order, userName) => {
  const transporter = createTransporter();
  
  const orderUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders/${order._id}`;
  
  // Format items list
  const itemsHtml = order.items.map(item => {
    const product = item.product;
    const name = typeof product === 'object' ? product.name : 'Product';
    const price = typeof product === 'object' ? product.price : item.price;
    return `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">R${(price * item.quantity).toFixed(2)}</td>
      </tr>
    `;
  }).join('');

  const subtotal = order.pricing?.subtotal || 0;
  const shipping = order.pricing?.shipping || 0;
  const tax = order.pricing?.tax || 0;
  const total = order.pricing?.total || 0;

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'Babyfiction'}" <${process.env.EMAIL_FROM || 'noreply@babyfiction.com'}>`,
    to,
    subject: `Order Confirmation #${order._id} - Babyfiction`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #000; color: #fff; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 8px; margin-top: 20px; }
            .order-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .order-table th { background: #f0f0f0; padding: 10px; text-align: left; }
            .totals { margin-top: 20px; }
            .totals-row { display: flex; justify-content: space-between; padding: 8px 0; }
            .totals-row.total { font-weight: bold; font-size: 18px; border-top: 2px solid #333; padding-top: 12px; margin-top: 12px; }
            .button { display: inline-block; background: #000; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Babyfiction</h1>
            </div>
            <div class="content">
              <h2>Order Confirmation</h2>
              <p>Hi ${userName || 'there'},</p>
              <p>Thank you for your order! We've received your order and will process it shortly.</p>
              
              <p><strong>Order Number:</strong> #${order._id}</p>
              <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
              
              <h3>Order Items</h3>
              <table class="order-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th style="text-align: center;">Quantity</th>
                    <th style="text-align: right;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
              
              <div class="totals">
                <div class="totals-row">
                  <span>Subtotal:</span>
                  <span>R${subtotal.toFixed(2)}</span>
                </div>
                <div class="totals-row">
                  <span>Shipping:</span>
                  <span>${shipping === 0 ? 'Free' : 'R' + shipping.toFixed(2)}</span>
                </div>
                <div class="totals-row">
                  <span>Tax (15% VAT):</span>
                  <span>R${tax.toFixed(2)}</span>
                </div>
                <div class="totals-row total">
                  <span>Total:</span>
                  <span>R${total.toFixed(2)}</span>
                </div>
              </div>
              
              <p style="text-align: center;">
                <a href="${orderUrl}" class="button">View Order Details</a>
              </p>
              
              <p><strong>Shipping Address:</strong></p>
              <p>
                ${order.shippingAddress?.street || ''}<br>
                ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.province || ''} ${order.shippingAddress?.postalCode || ''}<br>
                ${order.shippingAddress?.country || 'South Africa'}
              </p>
              
              <p>We'll send you another email when your order ships.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Babyfiction. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Order Confirmation
      
      Hi ${userName || 'there'},
      
      Thank you for your order! We've received your order and will process it shortly.
      
      Order Number: #${order._id}
      Order Date: ${new Date(order.createdAt).toLocaleDateString()}
      
      Order Items:
      ${order.items.map(item => {
        const product = item.product;
        const name = typeof product === 'object' ? product.name : 'Product';
        const price = typeof product === 'object' ? product.price : item.price;
        return `- ${name} x${item.quantity} - R${(price * item.quantity).toFixed(2)}`;
      }).join('\n')}
      
      Subtotal: R${subtotal.toFixed(2)}
      Shipping: ${shipping === 0 ? 'Free' : 'R' + shipping.toFixed(2)}
      Tax (15% VAT): R${tax.toFixed(2)}
      Total: R${total.toFixed(2)}
      
      View your order: ${orderUrl}
      
      We'll send you another email when your order ships.
      
      © ${new Date().getFullYear()} Babyfiction. All rights reserved.
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    throw error;
  }
};

export default {
  sendPasswordResetEmail,
  sendOrderConfirmationEmail,
};
