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
    console.log('===========================================================');
    console.log('[EMAIL] VERIFICATION CODE (NO GMAIL CONFIGURED)');
    console.log('===========================================================');
    console.log('To: ' + email);
    console.log('Name: ' + name);
    console.log('[CODE] VERIFICATION CODE: ' + code);
    console.log('===========================================================');
    console.log('[WARN] Set GMAIL_USER and GMAIL_APP_PASSWORD in .env to send real emails');
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
    console.log('[EMAIL] Verification email sent to ' + email);
    return { success: true, message: 'Verification email sent' };
  } catch (error) {
    console.error('[EMAIL] Failed to send email:', error.message);
    // Fallback to console logging if email fails
    console.log('');
    console.log('[EMAIL] VERIFICATION CODE (email failed): ' + code);
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
    console.log('');
    console.log('===========================================================');
    console.log('[EMAIL] PASSWORD RESET LINK (NO GMAIL CONFIGURED)');
    console.log('===========================================================');
    console.log('To: ' + email);
    console.log('Name: ' + name);
    console.log('');
    console.log('>>> CLICK THIS LINK TO RESET PASSWORD:');
    console.log(resetUrl);
    console.log('');
    console.log('===========================================================');
    console.log('[WARN] Set GMAIL_USER and GMAIL_APP_PASSWORD in .env');
    console.log('===========================================================');
    console.log('');
    return { success: true, fallback: true, resetUrl, message: 'Email logged to console (Gmail not configured)' };
  }

  try {
    console.log('[EMAIL] Attempting to send password reset email to:', email);
    
    const mailOptions = {
      from: `"Neo Routine" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Reset Your Neo Routine Password',
      html: getPasswordResetEmailTemplate(name, resetUrl),
      text: `Hi ${name},\n\nYou requested to reset your password.\n\nClick this link to reset it: ${resetUrl}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, please ignore this email.\n\n- Neo Routine Team`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('[EMAIL] Password reset email SENT successfully!');
    console.log('[EMAIL] Message ID:', info.messageId);
    console.log('[EMAIL] Response:', info.response);
    return { success: true, messageId: info.messageId, message: 'Password reset email sent' };
  } catch (error) {
    console.error('[EMAIL] ========================================');
    console.error('[EMAIL] FAILED TO SEND PASSWORD RESET EMAIL');
    console.error('[EMAIL] ========================================');
    console.error('[EMAIL] Error code:', error.code);
    console.error('[EMAIL] Error message:', error.message);
    console.error('[EMAIL] Full error:', error);
    console.error('[EMAIL] ========================================');
    console.log('');
    console.log('[EMAIL] FALLBACK - Use this reset URL manually:');
    console.log(resetUrl);
    console.log('');
    return { success: false, fallback: true, resetUrl, message: 'Failed to send email', error: error.message };
  }
}

/**
 * Generate password reset email HTML template
 * Modern, clean design matching Neo Routine branding
 */
function getPasswordResetEmailTemplate(name, resetUrl) {
  const currentYear = new Date().getFullYear();
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Reset Your Password - Neo Routine</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f0f9ff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  
  <!-- Wrapper Table -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f0f9ff;">
    <tr>
      <td style="padding: 40px 20px;">
        
        <!-- Main Card -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(14, 165, 233, 0.12); overflow: hidden;">
          
          <!-- Header with Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); padding: 32px 40px; text-align: center;">
              <!-- Water Drop Icon -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td style="width: 56px; height: 56px; background: rgba(255,255,255,0.2); border-radius: 50%; text-align: center; vertical-align: middle;">
                    <img src="https://img.icons8.com/fluency/48/water.png" alt="" width="32" height="32" style="display: inline-block; vertical-align: middle;">
                  </td>
                </tr>
              </table>
              <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 16px 0 0 0; letter-spacing: -0.5px;">
                Neo<span style="font-weight: 400;">Routine</span>
              </h1>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <!-- Greeting -->
              <h2 style="color: #0f172a; font-size: 22px; font-weight: 600; margin: 0 0 8px 0;">
                Hi ${name || 'there'},
              </h2>
              <p style="color: #64748b; font-size: 16px; line-height: 1.7; margin: 0 0 24px 0;">
                We received a request to reset the password for your Neo Routine account. No worries - it happens to the best of us!
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center; padding: 8px 0 24px 0;">
                    <a href="${resetUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 40px; border-radius: 12px; box-shadow: 0 4px 14px rgba(14, 165, 233, 0.4);">
                      Reset My Password
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Expiry Notice -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #f8fafc; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="vertical-align: top; padding-right: 12px;">
                          <span style="display: inline-block; width: 24px; height: 24px; background: #fef3c7; border-radius: 50%; text-align: center; line-height: 24px; font-size: 14px;">&#9200;</span>
                        </td>
                        <td>
                          <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin: 0;">
                            <strong style="color: #0f172a;">This link expires in 1 hour.</strong><br>
                            For security reasons, you'll need to request a new link after that.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Alternative Link -->
              <p style="color: #94a3b8; font-size: 13px; line-height: 1.6; margin: 0 0 8px 0;">
                Button not working? Copy and paste this link into your browser:
              </p>
              <p style="color: #0ea5e9; font-size: 13px; line-height: 1.6; margin: 0; word-break: break-all;">
                <a href="${resetUrl}" style="color: #0ea5e9; text-decoration: underline;">${resetUrl}</a>
              </p>
            </td>
          </tr>
          
          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 0;">
            </td>
          </tr>
          
          <!-- Security Notice -->
          <tr>
            <td style="padding: 24px 40px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="vertical-align: top; padding-right: 12px;">
                    <span style="display: inline-block; width: 20px; height: 20px; background: #fee2e2; border-radius: 50%; text-align: center; line-height: 20px; font-size: 12px;">&#128274;</span>
                  </td>
                  <td>
                    <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 0;">
                      If you didn't request this password reset, please ignore this email. Your password will remain unchanged and your account is secure.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; font-size: 12px; line-height: 1.6; margin: 0 0 8px 0;">
                Sent with care by <strong style="color: #64748b;">Neo Routine</strong>
              </p>
              <p style="color: #cbd5e1; font-size: 11px; margin: 0;">
                Redesigning habits. One drop at a time.
              </p>
              <p style="color: #cbd5e1; font-size: 11px; margin: 12px 0 0 0;">
                &copy; ${currentYear} Neo Routine. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
        <!-- End Main Card -->
        
      </td>
    </tr>
  </table>
  <!-- End Wrapper -->
  
</body>
</html>
  `.trim();
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
