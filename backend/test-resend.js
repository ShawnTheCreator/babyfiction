/**
 * Test Resend Email Sending
 * Run: node backend/test-resend.js
 */

import 'dotenv/config';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
  console.log('🧪 Testing Resend Email...\n');
  
  // Check configuration
  console.log('Configuration:');
  console.log('- RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ Set' : '❌ Missing');
  console.log('- EMAIL_FROM_ADDRESS:', process.env.EMAIL_FROM_ADDRESS || 'onboarding@resend.dev');
  console.log('- EMAIL_FROM_NAME:', process.env.EMAIL_FROM_NAME || 'Babyfiction');
  console.log('');

  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY not found in environment variables!');
    process.exit(1);
  }

  try {
    const fromAddress = process.env.EMAIL_FROM_ADDRESS || 'onboarding@resend.dev';
    const fromName = process.env.EMAIL_FROM_NAME || 'Babyfiction';
    
    console.log('📧 Sending test email...\n');
    
    const { data, error } = await resend.emails.send({
      from: `${fromName} <${fromAddress}>`,
      to: 'shawnchareka7@gmail.com', // Change this to your email
      subject: 'Test Email from Babyfiction',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; background: #f5f5f5; }
              .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; }
              h1 { color: #000; }
              .success { background: #d4edda; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0; }
              .info { background: #d1ecf1; color: #0c5460; padding: 15px; border-radius: 5px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>🎉 Resend Email Test</h1>
              
              <div class="success">
                <strong>✅ Success!</strong><br>
                If you're reading this, Resend is working correctly!
              </div>
              
              <div class="info">
                <strong>📧 Email Details:</strong><br>
                From: ${fromName} &lt;${fromAddress}&gt;<br>
                Sent: ${new Date().toLocaleString()}<br>
                Service: Resend API
              </div>
              
              <h2>Next Steps:</h2>
              <ol>
                <li>Check if this email went to spam</li>
                <li>If in spam, mark as "Not Spam"</li>
                <li>Add ${fromAddress} to your contacts</li>
                <li>For production, verify your own domain</li>
              </ol>
              
              <p style="color: #666; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
                © ${new Date().getFullYear()} Babyfiction. All rights reserved.
              </p>
            </div>
          </body>
        </html>
      `,
      text: `
        🎉 Resend Email Test
        
        ✅ Success! If you're reading this, Resend is working correctly!
        
        Email Details:
        From: ${fromName} <${fromAddress}>
        Sent: ${new Date().toLocaleString()}
        Service: Resend API
        
        Next Steps:
        1. Check if this email went to spam
        2. If in spam, mark as "Not Spam"
        3. Add ${fromAddress} to your contacts
        4. For production, verify your own domain
        
        © ${new Date().getFullYear()} Babyfiction. All rights reserved.
      `
    });

    if (error) {
      console.error('❌ Error sending email:');
      console.error(error);
      process.exit(1);
    }

    console.log('✅ Email sent successfully!');
    console.log('');
    console.log('Email ID:', data.id);
    console.log('');
    console.log('📋 Next Steps:');
    console.log('1. Check your inbox: shawnchareka7@gmail.com');
    console.log('2. Check spam folder if not in inbox');
    console.log('3. Check Resend dashboard: https://resend.com/emails');
    console.log('4. Search for email ID:', data.id);
    console.log('');
    console.log('💡 Tip: If email is in spam, mark as "Not Spam" and add sender to contacts');
    
  } catch (error) {
    console.error('❌ Unexpected error:');
    console.error(error);
    process.exit(1);
  }
}

testEmail();
