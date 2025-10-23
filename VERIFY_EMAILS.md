# How to Verify Email Functionality

## 🔍 Development Mode (Current Setup)

Since SMTP is not configured, emails are **logged to the backend console** instead of being sent.

### How to See Emails:

1. **Check your backend terminal** where you ran `npm run dev`
2. **Look for email output** that looks like this:

```
================================================================================
📧 EMAIL (Development Mode - SMTP not configured)
================================================================================
To: user@example.com
Subject: Password Reset Request
--------------------------------------------------------------------------------
Text Content:
You requested a password reset. Click the link below to reset your password:
http://localhost:3000/auth/reset-password?token=abc123...

This link expires in 1 hour.
--------------------------------------------------------------------------------
HTML Content:
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; }
...
================================================================================
```

### Test Email Features:

#### 1. **Password Reset Email**
```bash
# Trigger: Request password reset
1. Go to http://localhost:3000/auth/forgot-password
2. Enter email: admin@example.com
3. Click "Send Reset Link"
4. Check backend console for email output
5. Copy the reset token from the URL
6. Use it to reset password
```

#### 2. **Order Confirmation Email**
```bash
# Trigger: Place an order
1. Login as customer
2. Add items to cart
3. Complete checkout
4. Check backend console for order confirmation email
```

#### 3. **Newsletter Welcome Email**
```bash
# Trigger: Subscribe to newsletter
1. Go to footer
2. Enter email in newsletter form
3. Click Subscribe
4. Check backend console for welcome email
```

## 📧 Production Mode (Real Emails)

To send actual emails, configure SMTP in your `.env` file:

### Option 1: Gmail (Recommended for Testing)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Create app password for "Mail"
   - Copy the 16-character password

3. **Add to `.env`**:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
EMAIL_FROM_ADDRESS=your-email@gmail.com
EMAIL_FROM_NAME=Babyfiction
```

4. **Restart backend**:
```bash
cd backend
npm run dev
```

### Option 2: SendGrid (Recommended for Production)

1. **Sign up**: https://sendgrid.com
2. **Create API Key**
3. **Add to `.env`**:
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USERNAME=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
EMAIL_FROM_ADDRESS=noreply@yourdomain.com
EMAIL_FROM_NAME=Babyfiction
```

### Option 3: Mailtrap (Recommended for Testing)

1. **Sign up**: https://mailtrap.io
2. **Get credentials** from inbox settings
3. **Add to `.env`**:
```env
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USERNAME=your-mailtrap-username
EMAIL_PASSWORD=your-mailtrap-password
EMAIL_FROM_ADDRESS=noreply@babyfiction.com
EMAIL_FROM_NAME=Babyfiction
```

## 🧪 Testing Email Links

### Password Reset Flow:

1. **Request reset**:
   - Go to `/auth/forgot-password`
   - Enter email: `admin@example.com`
   - Click "Send Reset Link"

2. **Check console output**:
   ```
   📧 EMAIL (Development Mode)
   To: admin@example.com
   Subject: Password Reset Request
   
   Reset link: http://localhost:3000/auth/reset-password?token=abc123...
   ```

3. **Copy the token** from the URL

4. **Test the link**:
   - Go to: `http://localhost:3000/auth/reset-password?token=YOUR_TOKEN`
   - Enter new password
   - Submit form
   - Should successfully reset password

### Quick Test Script:

Create `backend/test-email.js`:
```javascript
import { sendEmail } from './src/utils/email.js';

await sendEmail({
  to: 'test@example.com',
  subject: 'Test Email',
  text: 'This is a test email from Babyfiction',
  html: '<h1>Test Email</h1><p>This is a test email from Babyfiction</p>'
});

console.log('Email sent! Check console output or inbox.');
```

Run it:
```bash
node backend/test-email.js
```

## 📋 Email Features in Your App

### Currently Implemented:

1. **Password Reset** ✅
   - Trigger: `/auth/forgot-password`
   - Contains: Reset link with 1-hour token
   - Template: Professional HTML + plain text

2. **Order Confirmation** ✅
   - Trigger: Complete checkout
   - Contains: Order details, items, total
   - Template: Professional HTML + plain text

3. **Newsletter Welcome** ✅
   - Trigger: Subscribe to newsletter
   - Contains: Welcome message, WELCOME10 code
   - Template: Professional HTML + plain text

### Email Templates:

All emails include:
- Professional HTML design
- Plain text fallback
- Responsive layout
- Brand colors
- Clear CTAs
- Unsubscribe links (where applicable)

## 🔧 Troubleshooting

### Email not showing in console?

1. **Check backend is running**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Trigger email action** (forgot password, place order, etc.)

3. **Look for email output** in terminal

4. **If still not showing**:
   - Check for errors in console
   - Verify email service is being called
   - Check `backend/src/utils/email.js`

### Email links not working?

1. **Check FRONTEND_URL** in `.env`:
   ```env
   FRONTEND_URL=http://localhost:3000
   ```

2. **Verify token** is included in URL

3. **Check token expiry** (1 hour for password reset)

4. **Try generating new token**

### Gmail not working?

1. **Enable 2FA** first
2. **Use App Password**, not regular password
3. **Allow less secure apps** (if needed)
4. **Check spam folder**

## 📊 Email Monitoring

### Development:
- All emails logged to console
- No actual emails sent
- Perfect for testing

### Production:
- Use email service (SendGrid, Mailgun, etc.)
- Monitor delivery rates
- Track opens/clicks
- Handle bounces

## 🎯 Next Steps

1. **Test in development**: Check console logs
2. **Configure SMTP**: For real email testing
3. **Use Mailtrap**: For safe testing without spamming
4. **Deploy with SendGrid**: For production emails

---

**Current Status**: Development mode active - all emails logged to console! ✅

Check your backend terminal to see email output.
