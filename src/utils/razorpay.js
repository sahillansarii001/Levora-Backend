import crypto from 'crypto';
import razorpay from '../config/razorpay.js';

const createOrder = async (amount, currency = 'INR', receipt) => {
  try {
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency,
      receipt,
      payment_capture: 1,
    });
    return { success: true, order };
  } catch (error) {
    console.error('Order creation error:', error);
    return { success: false, error: error.message };
  }
};

const verifyPayment = (orderId, paymentId, signature) => {
  try {
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${orderId}|${paymentId}`);
    const generated_signature = hmac.digest('hex');

    if (generated_signature === signature) {
      return { success: true, verified: true };
    } else {
      return { success: true, verified: false };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = {
  createOrder,
  verifyPayment,
};
