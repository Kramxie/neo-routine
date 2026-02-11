/**
 * Email Service Utility
 * Handles sending emails for verification, password reset, etc.
 * Uses Gmail with Nodemailer
 */

import nodemailer from 'nodemailer';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Create Gmail transporter
const createTransporter = () => {
  // Check if Gmail credentials are configured
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    return null;
  }
  
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use STARTTLS
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
    // Force IPv4 to avoid IPv6 connection issues
    family: 4,
    // Fix SSL certificate issues (for development)
    tls: {
      rejectUnauthorized: false
    }
  });
};

/**
 * Send email verification code (6-digit)
 * @param {string} email - User's email address
 * @param {string} name - User's name
 * @param {string} code - 6-digit verification code
 */
export async function sendVerificationEmail(email, name, code) {
  const transporter = createTransporter();
  
  // If no Gmail credentials, fallback to console logging
  if (!transporter) {
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('📧 EMAIL VERIFICATION CODE (NO GMAIL CONFIGURED)');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`To: ${email}`);
    console.log(`Name: ${name}`);
    console.log(`🔢 VERIFICATION CODE: ${code}`);
    console.log('═══════════════════════════════════════════════════════');
    console.log('⚠️  Set GMAIL_USER and GMAIL_APP_PASSWORD in .env to send real emails');
    console.log('');
    return { success: true, message: 'Email logged to console (Gmail not configured)', code };
  }

  try {
    const mailOptions = {
      from: `"Neo Routine" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Your Neo Routine Verification Code',
      html: getVerificationCodeEmailTemplate(name, code),
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${email}`);
    return { success: true, message: 'Verification email sent' };
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    // Fallback to console logging if email fails
    console.log('');
    console.log(`🔢 VERIFICATION CODE (email failed): ${code}`);
    console.log('');
    return { success: false, message: 'Failed to send email', error: error.message };
  }
}

/**
 * Send password reset email
 * @param {string} email - User's email address
 * @param {string} name - User's name
 * @param {string} token - Reset token
 */
export async function sendPasswordResetEmail(email, name, token) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;
  const transporter = createTransporter();
  
  // If no Gmail credentials, fallback to console logging
  if (!transporter) {
    console.log('═══════════════════════════════════════════════════════');
    console.log('🔑 PASSWORD RESET (NO GMAIL CONFIGURED)');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`To: ${email}`);
    console.log(`Name: ${name}`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log('═══════════════════════════════════════════════════════');
    return { success: true, message: 'Email logged to console (Gmail not configured)' };
  }

  try {
    const mailOptions = {
      from: `"Neo Routine" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Reset Your Neo Routine Password',
      html: getPasswordResetEmailTemplate(name, resetUrl),
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${email}`);
    return { success: true, message: 'Password reset email sent' };
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    console.log(`🔗 RESET URL (email failed): ${resetUrl}`);
    return { success: false, message: 'Failed to send email', error: error.message };
  }
}

/**
 * Generate password reset email HTML template
 */
function getPasswordResetEmailTemplate(name, resetUrl) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 40px 20px;">
      <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #1e293b; margin: 16px 0 0 0; font-size: 24px;">Neo<span style="color: #0ea5e9;">Routine</span></h1>
        </div>
        
        <h2 style="color: #1e293b; font-size: 20px; margin-bottom: 16px;">Hi ${name},</h2>
        <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
          We received a request to reset your password. Click the button below to create a new password.
        </p>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Reset Password
          </a>
        </div>
        
        <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
          Or copy this link: <a href="${resetUrl}" style="color: #0ea5e9;">${resetUrl}</a>
        </p>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
        
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">
          This link expires in 1 hour. If you didn't request a password reset, you can ignore this email.
        </p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate verification code email HTML template
 */
function getVerificationCodeEmailTemplate(name, code) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Verification Code</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 40px 20px;">
      <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <!-- Logo -->
        <div style="text-align: center; margin-bottom: 32px;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="#0ea5e9">
            <path d="M12 2C12 2 5 10 5 15C5 18.866 8.134 22 12 22C15.866 22 19 18.866 19 15C19 10 12 2 12 2Z"/>
          </svg>
          <h1 style="color: #1e293b; margin: 16px 0 0 0; font-size: 24px;">Neo<span style="color: #0ea5e9;">Routine</span></h1>
        </div>
        
        <!-- Content -->
        <h2 style="color: #1e293b; font-size: 20px; margin-bottom: 16px;">Hi ${name},</h2>
        <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
          Welcome to Neo Routine! Use the code below to verify your email address.
        </p>
        
        <!-- Code Box -->
        <div style="text-align: center; margin: 32px 0;">
          <div style="display: inline-block; background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); padding: 4px; border-radius: 12px;">
            <div style="background: white; padding: 20px 40px; border-radius: 10px;">
              <span style="font-family: 'SF Mono', Monaco, 'Courier New', monospace; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #1e293b;">${code}</span>
            </div>
          </div>
        </div>
        
        <p style="color: #64748b; font-size: 14px; line-height: 1.6; text-align: center;">
          Enter this code on the verification page to complete your registration.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
        
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">
          This code expires in 10 minutes. If you didn't create an account, you can ignore this email.
        </p>
      </div>
    </body>
    </html>
  `;
}

export { getVerificationCodeEmailTemplate };
