import nodemailer from 'nodemailer';
import { google } from 'googleapis';

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground' // Required redirect URI for playground tokens
);

if (process.env.GOOGLE_REFRESH_TOKEN) {
  oAuth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
}

export const sendEmail = async (to, subject, htmlContent) => {
  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.GMAIL_USER,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });

    const mailOptions = {
      from: `Levora Academy <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
    };

    const result = await transporter.sendMail(mailOptions);
    return { success: true, data: result };
  } catch (error) {
    console.error('Email send exception:', error);
    return { success: false, error: error.message };
  }
};

export const admissionConfirmationEmail = (studentName, courseTitle, studentId) => {
  return `
    <h2>Welcome to LEVORA ACADEMY!</h2>
    <p>Dear ${studentName},</p>
    <p>Your admission to <strong>${courseTitle}</strong> has been confirmed.</p>
    <p>Your Student ID: <strong>${studentId}</strong></p>
    <p>Please keep this ID safe for future reference.</p>
    <p>Best regards,<br/>LEVORA ACADEMY Team</p>
  `;
};

export const feeReceiptEmail = (studentName, amount, receiptUrl) => {
  return `
    <h2>Fee Receipt - LEVORA ACADEMY</h2>
    <p>Dear ${studentName},</p>
    <p>Your fee payment of <strong>₹${amount}</strong> has been received.</p>
    <p><a href="${receiptUrl}">Download Receipt</a></p>
    <p>Best regards,<br/>LEVORA ACADEMY Team</p>
  `;
};

export const passwordResetEmail = (resetLink) => {
  return `
    <h2>Password Reset Request</h2>
    <p>Click the link below to reset your password:</p>
    <p><a href="${resetLink}">Reset Password</a></p>
    <p>This link expires in 1 hour.</p>
  `;
};

export const otpEmail = (otpCode) => {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 0; width: 100%;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); margin: 0 auto;">
        <tr>
          <td style="background-color: #0B1F3A; padding: 40px 0; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px;">LEVORA ACADEMY</h1>
          </td>
        </tr>
        <tr>
          <td style="padding: 40px 40px;">
            <h2 style="color: #1e293b; font-size: 24px; font-weight: 600; margin-top: 0; margin-bottom: 20px;">Verify your email address</h2>
            <p style="color: #475569; font-size: 16px; line-height: 24px; margin-bottom: 30px;">
              Hello!<br><br>
              Thank you for starting your application with Levora Academy. Please use the verification code below to securely complete your registration process.
            </p>
            
            <div style="text-align: center; margin: 40px 0;">
              <div style="display: inline-block; background: linear-gradient(135deg, #fefce8 0%, #fef9c3 100%); border: 2px dashed #eab308; padding: 20px 40px; border-radius: 12px;">
                <span style="font-family: monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #0B1F3A;">
                  ${otpCode}
                </span>
              </div>
            </div>
            
            <p style="color: #64748b; font-size: 14px; line-height: 22px; margin-bottom: 30px;">
              <strong>Note:</strong> This verification code is valid for the next 10 minutes. Please do not share this code with anyone.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            
            <p style="color: #94a3b8; font-size: 13px; line-height: 20px; margin: 0;">
              If you didn't request this email, there's nothing to worry about — you can safely ignore it. Someone might have mistyped their email address.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background-color: #f1f5f9; padding: 20px; text-align: center;">
            <p style="color: #64748b; font-size: 12px; margin: 0;">
              &copy; ${new Date().getFullYear()} Levora Academy. All rights reserved.
            </p>
          </td>
        </tr>
      </table>
    </div>
  `;
};

export const approvalEmail = (userName) => {
  return `
    <h2>Registration Approved - LEVORA ACADEMY</h2>
    <p>Dear ${userName},</p>
    <p>Your registration at Levora Academy has been approved by the administration.</p>
    <p>You can now log in to your dashboard using your credentials.</p>
    <p>Best regards,<br/>LEVORA ACADEMY Team</p>
  `;
};

export const rejectionEmail = (userName) => {
  return `
    <h2>Registration Update - LEVORA ACADEMY</h2>
    <p>Dear ${userName},</p>
    <p>We regret to inform you that your registration at Levora Academy has been declined.</p>
    <p>If you believe this is a mistake, please contact our support team.</p>
    <p>Best regards,<br/>LEVORA ACADEMY Team</p>
  `;
};

export const subscriptionCredentialsEmail = (email, password) => {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 0; width: 100%;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); margin: 0 auto;">
        <tr>
          <td style="background-color: #0B1F3A; padding: 40px 0; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px;">LEVORA ACADEMY</h1>
          </td>
        </tr>
        <tr>
          <td style="padding: 40px 40px;">
            <h2 style="color: #1e293b; font-size: 24px; font-weight: 600; margin-top: 0; margin-bottom: 20px;">Your Subscription Credentials</h2>
            <p style="color: #475569; font-size: 16px; line-height: 24px; margin-bottom: 30px;">
              Thank you for your purchase!<br><br>
              You can now log in to your account to access your premium study materials. Here are your temporary login credentials:
            </p>
            
            <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
              <p style="margin: 0 0 10px 0; color: #334155;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 0; color: #334155;"><strong>Password:</strong> <span style="font-family: monospace; font-size: 18px; font-weight: 600; background-color: #e2e8f0; padding: 2px 8px; border-radius: 4px;">${password}</span></p>
            </div>
            
            <p style="color: #64748b; font-size: 14px; line-height: 22px; margin-bottom: 30px;">
              <strong>Important:</strong> You will be required to change your password immediately upon your first login for security purposes.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            <p style="color: #94a3b8; font-size: 13px; line-height: 20px; margin: 0;">
              If you have any questions, please reply to this email or contact our support team.
            </p>
          </td>
        </tr>
      </table>
    </div>
  `;
};
