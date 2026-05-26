import twilio from 'twilio';

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

const sendSMS = async (to, message) => {
  try {
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE,
      to,
    });
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('SMS send error:', error);
    return { success: false, error: error.message };
  }
};

const sendOTP = async (phone, otp) => {
  const message = `Your LEVORA ACADEMY OTP is: ${otp}. Valid for 10 minutes.`;
  return sendSMS(phone, message);
};

const sendFeeReminder = async (phone, amount, dueDate) => {
  const message = `Reminder: Fee payment of ₹${amount} is due on ${dueDate}. Pay now on LEVORA ACADEMY portal.`;
  return sendSMS(phone, message);
};

module.exports = {
  sendSMS,
  sendOTP,
  sendFeeReminder,
};
