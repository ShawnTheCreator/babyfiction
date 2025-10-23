# Email Setup for Render Hosted Backend

## 🚀 Current Situation

Your backend is hosted on **Render**, so you can't see console logs locally. You need to either:
1. View Render logs to see email output
2. Configure real SMTP to send actual emails

---

## Option 1: View Render Logs (Quick Check)

### Access Render Logs:

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Select your backend service**
3. **Click "Logs" tab**
4. **Trigger an email action** (forgot password, etc.)
5. **Watch logs in real-time** for email output:

```
================================================================================
📧 EMAIL (Development Mode - SMTP not configured)
================================================================================
To: admin@example.com
Subject: Password Reset Request
...
```

### Steps to Test:

1. **Open Render logs** in one browser tab
2. **Open your app** in another tab
3. **Go to forgot password**: `https://your-app.netlify.app/auth/forgot-password`
4. **Enter email**: `admin@example.com`
5. **Click "Send Reset Link"**
6. **Check Render logs** - you'll see the email content with the reset link
7. **Copy the reset link** from logs
8. **Test it** in your browser

---

## Option 2: Configure Gmail SMTP (Recommended)

This will send **real emails** instead of logging to console.

### Step 1: Generate Gmail App Password

1. **Go to Google Account**: https://myaccount.google.com
2. **Enable 2-Factor Authentication** (if not already enabled)
3. **Go to App Passwords**: https://myaccount.google.com/apppasswords
4. **Select "Mail"** and generate password
5. **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)

### Step 2: Add Environment Variables to Render

1. **Go to Render Dashboard**
2. **Select your backend service**
3. **Go to "Environment" tab**
4. **Add these variables**:

```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
EMAIL_FROM_ADDRESS=your-email@gmail.com
EMAIL_FROM_NAME=Babyfiction
```

**Important**: Remove spaces from app password! `abcd efgh ijkl mnop` → `abcdefghijklmnop`

### Step 3: Redeploy

1. **Click "Manual Deploy"** or
2. **Push to GitHub** (triggers auto-deploy)
3. **Wait for deployment** to complete

### Step 4: Test

1. **Go to forgot password** page
2. **Enter your email**
3. **Check your inbox** for reset email
4. **Click the link** to reset password

---

## Option 3: Use Mailtrap (Best for Testing)

Mailtrap captures all emails in a test inbox - perfect for development!

### Step 1: Sign Up

1. **Go to**: https://mailtrap.io
2. **Sign up** for free account
3. **Go to "Email Testing"** → "Inboxes"
4. **Click your inbox** → "SMTP Settings"

### Step 2: Get Credentials

You'll see something like:
```
Host: smtp.mailtrap.io
Port: 2525
Username: 1a2b3c4d5e6f7g
Password: 9h8i7j6k5l4m3n
```

### Step 3: Add to Render

In Render Environment variables:
```
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USERNAME=1a2b3c4d5e6f7g
EMAIL_PASSWORD=9h8i7j6k5l4m3n
EMAIL_FROM_ADDRESS=noreply@babyfiction.com
EMAIL_FROM_NAME=Babyfiction
```

### Step 4: Test

1. **Redeploy** your backend
2. **Trigger email** (forgot password, etc.)
3. **Check Mailtrap inbox** - email appears there!
4. **Click links** in Mailtrap to test functionality

**Benefits**:
- ✅ See actual email HTML rendering
- ✅ Test all links
- ✅ No spam risk
- ✅ Free for testing

---

## Option 4: Use SendGrid (Production Ready)

For production, use a professional email service.

### Step 1: Sign Up

1. **Go to**: https://sendgrid.com
2. **Sign up** (free tier: 100 emails/day)
3. **Verify your email**

### Step 2: Create API Key

1. **Go to Settings** → **API Keys**
2. **Create API Key**
3. **Copy the key** (starts with `SG.`)

### Step 3: Add to Render

```
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USERNAME=apikey
EMAIL_PASSWORD=SG.your-api-key-here
EMAIL_FROM_ADDRESS=noreply@yourdomain.com
EMAIL_FROM_NAME=Babyfiction
```

### Step 4: Verify Sender (Important!)

1. **Go to Settings** → **Sender Authentication**
2. **Verify single sender** (your email)
3. **Check email** and click verification link
4. **Use verified email** as `EMAIL_FROM_ADDRESS`

---

## Quick Comparison

| Option | Best For | Setup Time | Cost | Email Delivery |
|--------|----------|------------|------|----------------|
| **Render Logs** | Quick check | 1 min | Free | Console only |
| **Gmail** | Testing | 5 min | Free | Real emails |
| **Mailtrap** | Development | 5 min | Free | Test inbox |
| **SendGrid** | Production | 10 min | Free tier | Real emails |

---

## Recommended Setup

### For Development/Testing:
```
Use Mailtrap
- Safe testing
- See rendered emails
- Test all links
- No spam risk
```

### For Production:
```
Use SendGrid or similar
- Professional delivery
- Analytics
- High deliverability
- Scalable
```

---

## Current Environment Variables Needed

Add these to **Render Dashboard** → **Environment**:

### Minimum Required:
```env
EMAIL_HOST=smtp.gmail.com (or smtp.mailtrap.io)
EMAIL_PORT=587 (or 2525 for Mailtrap)
EMAIL_USERNAME=your-username
EMAIL_PASSWORD=your-password
EMAIL_FROM_ADDRESS=your-email@example.com
EMAIL_FROM_NAME=Babyfiction
```

### Also Verify These Exist:
```env
FRONTEND_URL=https://your-app.netlify.app
JWT_SECRET=your-secret-key
MONGODB_URI=your-mongodb-connection-string
```

---

## Testing Checklist

After configuring SMTP:

- [ ] Add environment variables to Render
- [ ] Redeploy backend
- [ ] Test password reset email
- [ ] Test order confirmation email
- [ ] Test newsletter welcome email
- [ ] Verify links work correctly
- [ ] Check email appears professional
- [ ] Test on mobile device

---

## Troubleshooting

### Emails not sending?

1. **Check Render logs** for errors:
   - Go to Render Dashboard → Logs
   - Look for email-related errors

2. **Verify environment variables**:
   - All EMAIL_* variables set correctly
   - No typos in credentials
   - No extra spaces

3. **Test SMTP credentials**:
   - Try logging into SMTP server manually
   - Verify username/password are correct

### Gmail not working?

1. **2FA must be enabled** first
2. **Use App Password**, not regular password
3. **Remove spaces** from app password
4. **Check "Less secure app access"** if needed

### Links not working?

1. **Check FRONTEND_URL** in Render:
   ```
   FRONTEND_URL=https://your-app.netlify.app
   ```
   (No trailing slash!)

2. **Verify token generation** in logs

3. **Check token expiry** (1 hour for password reset)

---

## Quick Start (Recommended)

**Use Mailtrap for immediate testing:**

1. Sign up at https://mailtrap.io
2. Get SMTP credentials
3. Add to Render environment variables
4. Redeploy
5. Test forgot password
6. Check Mailtrap inbox
7. Done! ✅

**Time: 5 minutes**

---

## Next Steps

1. **Choose your email solution** (Mailtrap recommended for testing)
2. **Add environment variables** to Render
3. **Redeploy** your backend
4. **Test email functionality**
5. **Verify links work**

Need help? Check Render logs for any errors!
