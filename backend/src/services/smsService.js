import fetch from 'node-fetch';

/**
 * SMS Service supporting multiple providers
 * - Twilio (International)
 * - Africa's Talking (Africa-focused)
 * - Console logging (Development)
 */

const SMS_PROVIDER = process.env.SMS_PROVIDER || 'console'; // 'twilio', 'africastalking', or 'console'

/**
 * Format phone number to E.164 format
 * South African numbers: +27XXXXXXXXX
 */
const formatPhoneNumber = (phone) => {
  if (!phone) return null;
  
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // If starts with 0, replace with 27 (South Africa)
  if (cleaned.startsWith('0')) {
    cleaned = '27' + cleaned.substring(1);
  }
  
  // If doesn't start with country code, assume South Africa
  if (!cleaned.startsWith('27') && !cleaned.startsWith('+')) {
    cleaned = '27' + cleaned;
  }
  
  // Add + prefix
  return '+' + cleaned.replace(/^\+/, '');
};

/**
 * Send SMS via Twilio
 */
const sendViaTwilio = async (to, message) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    throw new Error('Twilio credentials not configured');
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      To: to,
      From: fromNumber,
      Body: message,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Twilio error: ${error.message || response.statusText}`);
  }

  return await response.json();
};

/**
 * Send SMS via Africa's Talking
 */
const sendViaAfricasTalking = async (to, message) => {
  const apiKey = process.env.AFRICASTALKING_API_KEY;
  const username = process.env.AFRICASTALKING_USERNAME;
  const from = process.env.AFRICASTALKING_FROM || 'Babyfiction';

  if (!apiKey || !username) {
    throw new Error('Africa\'s Talking credentials not configured');
  }

  const url = 'https://api.africastalking.com/version1/messaging';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'apiKey': apiKey,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
    body: new URLSearchParams({
      username: username,
      to: to,
      message: message,
      from: from,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Africa's Talking error: ${error || response.statusText}`);
  }

  return await response.json();
};

/**
 * Log SMS to console (Development mode)
 */
const logToConsole = (to, message) => {
  console.log('\n📱 SMS would be sent:');
  console.log('To:', to);
  console.log('Message:', message);
  console.log('---\n');
  return { messageId: 'dev-' + Date.now(), status: 'logged' };
};

/**
 * Main SMS sending function
 */
export const sendSMS = async (to, message) => {
  try {
    // Format phone number
    const formattedPhone = formatPhoneNumber(to);
    
    if (!formattedPhone) {
      console.error('Invalid phone number:', to);
      return null;
    }

    // Truncate message if too long (160 chars for single SMS)
    const truncatedMessage = message.length > 160 
      ? message.substring(0, 157) + '...' 
      : message;

    // Send via configured provider
    switch (SMS_PROVIDER.toLowerCase()) {
      case 'twilio':
        return await sendViaTwilio(formattedPhone, truncatedMessage);
      
      case 'africastalking':
        return await sendViaAfricasTalking(formattedPhone, truncatedMessage);
      
      case 'console':
      default:
        return logToConsole(formattedPhone, truncatedMessage);
    }
  } catch (error) {
    console.error('SMS sending failed:', error);
    throw error;
  }
};

/**
 * Send order confirmation SMS
 */
export const sendOrderConfirmationSMS = async (phone, orderId, total) => {
  const message = `Babyfiction: Order #${orderId} confirmed! Total: R${total.toFixed(2)}. We'll notify you when it ships. Thank you!`;
  
  try {
    await sendSMS(phone, message);
    console.log(`Order confirmation SMS sent to ${phone}`);
  } catch (error) {
    console.error('Failed to send order confirmation SMS:', error);
    // Don't throw - SMS failure shouldn't break order creation
  }
};

/**
 * Send order status update SMS
 */
export const sendOrderStatusSMS = async (phone, orderId, status) => {
  const statusMessages = {
    processing: `Babyfiction: Your order #${orderId} is being processed. We'll update you soon!`,
    shipped: `Babyfiction: Great news! Your order #${orderId} has been shipped and is on its way to you.`,
    delivered: `Babyfiction: Your order #${orderId} has been delivered. Enjoy your purchase!`,
    cancelled: `Babyfiction: Your order #${orderId} has been cancelled. Contact us if you have questions.`,
  };

  const message = statusMessages[status.toLowerCase()] || 
    `Babyfiction: Your order #${orderId} status: ${status}`;

  try {
    await sendSMS(phone, message);
    console.log(`Order status SMS sent to ${phone}: ${status}`);
  } catch (error) {
    console.error('Failed to send order status SMS:', error);
    // Don't throw - SMS failure shouldn't break status update
  }
};

/**
 * Send order shipped SMS with tracking
 */
export const sendOrderShippedSMS = async (phone, orderId, trackingNumber) => {
  const message = trackingNumber
    ? `Babyfiction: Order #${orderId} shipped! Tracking: ${trackingNumber}. Track at babyfiction.com/orders/${orderId}`
    : `Babyfiction: Order #${orderId} has been shipped! Track at babyfiction.com/orders/${orderId}`;

  try {
    await sendSMS(phone, message);
    console.log(`Shipping notification SMS sent to ${phone}`);
  } catch (error) {
    console.error('Failed to send shipping SMS:', error);
  }
};

/**
 * Send delivery confirmation SMS
 */
export const sendDeliveryConfirmationSMS = async (phone, orderId) => {
  const message = `Babyfiction: Your order #${orderId} has been delivered! We hope you love it. Rate your experience at babyfiction.com`;

  try {
    await sendSMS(phone, message);
    console.log(`Delivery confirmation SMS sent to ${phone}`);
  } catch (error) {
    console.error('Failed to send delivery SMS:', error);
  }
};

/**
 * Send promotional SMS (with opt-out)
 */
export const sendPromotionalSMS = async (phone, message) => {
  const fullMessage = `${message} Reply STOP to unsubscribe.`;

  try {
    await sendSMS(phone, fullMessage);
    console.log(`Promotional SMS sent to ${phone}`);
  } catch (error) {
    console.error('Failed to send promotional SMS:', error);
  }
};

export default {
  sendSMS,
  sendOrderConfirmationSMS,
  sendOrderStatusSMS,
  sendOrderShippedSMS,
  sendDeliveryConfirmationSMS,
  sendPromotionalSMS,
  formatPhoneNumber,
};
