import prisma from '../config/prisma.js';

export const generateOTP = async (email) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  // Set expiry to 10 minutes from now (600 seconds)
  const expiresAt = new Date(Date.now() + (process.env.OTP_EXPIRY || 600) * 1000);

  // Remove any existing unverified OTP records for this email to prevent clutter
  await prisma.oTPRecord.deleteMany({ 
    where: { 
      email, 
      verified: false 
    } 
  });

  await prisma.oTPRecord.create({
    data: {
      email,
      otp,
      expiresAt,
    }
  });

  return otp;
};

export const verifyOTP = async (email, otp) => {
  const record = await prisma.oTPRecord.findFirst({ 
    where: { email, otp } 
  });

  if (!record) {
    return { valid: false, message: 'Invalid OTP' };
  }

  if (new Date() > record.expiresAt) {
    return { valid: false, message: 'OTP has expired' };
  }

  if (record.attempts >= (process.env.MAX_OTP_ATTEMPTS || 3)) {
    return { valid: false, message: 'Maximum attempts exceeded. Please request a new OTP.' };
  }

  await prisma.oTPRecord.update({
    where: { id: record.id },
    data: { verified: true }
  });

  return { valid: true };
};
