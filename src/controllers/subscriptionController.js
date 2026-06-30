import prisma from '../config/prisma.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import razorpay from '../config/razorpay.js';
import { sendEmail, subscriptionCredentialsEmail } from '../utils/sendEmail.js';

export const createOrder = async (req, res) => {
  try {
    const { amount, email } = req.body;
    
    if (!amount) {
      return res.status(400).json({ success: false, message: 'Amount is required' });
    }
    
    if (email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email already registered. Please login to purchase a subscription.' });
      }
    }

    const options = {
      amount: parseInt(amount) * 100, // amount in the smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };
    
    const order = await razorpay.orders.create(options);
    
    if (!order) {
      return res.status(500).json({ success: false, message: 'Failed to create order' });
    }
    
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, error: error });
  }
};

export const purchaseSubscription = async (req, res) => {
  try {
    const { email, plan, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
    
    if (!email || !plan || !razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Verify Signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;
    if (!isAuthentic) {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    let user = await prisma.user.findUnique({ where: { email } });
    
    let generatedPassword = null;
    if (!user) {
      // Generate a random password of 8 characters
      generatedPassword = crypto.randomBytes(4).toString('hex');
      const hashedPassword = await bcrypt.hash(generatedPassword, 10);
      
      user = await prisma.user.create({
        data: {
          name: email.split('@')[0],
          email,
          password: hashedPassword,
          role: 'user',
          needsPasswordReset: true,
          isSubscribed: true,
          subscriptionPlan: plan,
          materialsAccess: true,
          subscriptionExpiry: new Date(new Date().setFullYear(new Date().getFullYear() + 1)) // 1 year from now
        }
      });
      
      // Send email with credentials
      const emailHtml = subscriptionCredentialsEmail(email, generatedPassword);
      await sendEmail(email, 'Your Levora Academy Subscription Credentials', emailHtml);

    } else {
      let updateData = {
        isSubscribed: true,
        subscriptionPlan: plan,
        materialsAccess: true,
        subscriptionExpiry: new Date(new Date().setFullYear(new Date().getFullYear() + 1)) // 1 year from now
      };
      
      if (user.needsPasswordReset) {
        generatedPassword = crypto.randomBytes(4).toString('hex');
        updateData.password = await bcrypt.hash(generatedPassword, 10);
      }

      user = await prisma.user.update({
        where: { email },
        data: updateData
      });
      
      if (generatedPassword) {
        const emailHtml = subscriptionCredentialsEmail(email, generatedPassword);
        await sendEmail(email, 'Your Levora Academy Subscription Credentials', emailHtml);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Subscription purchased successfully',
      data: {
        userId: user.id,
        email: user.email,
        isNewUser: !!generatedPassword
      }
    });

  } catch (error) {
    console.error('Error in purchaseSubscription:', error);
    res.status(500).json({ success: false, message: error.message, stack: error.stack });
  }
};
