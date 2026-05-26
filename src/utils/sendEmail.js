import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (to, subject, htmlContent) => {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.SENDER_EMAIL || 'onboarding@resend.dev',
      to,
      subject,
      html: htmlContent,
    });
    
    if (error) {
      console.error('Resend email error:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
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
    <h2>Your Levora Academy Verification Code</h2>
    <p>Please use the following 6-digit code to complete your registration:</p>
    <h1 style="color: #0B1F3A; letter-spacing: 5px;">${otpCode}</h1>
    <p>This code will expire in 10 minutes.</p>
    <p>If you did not request this code, please ignore this email.</p>
  `;
};
