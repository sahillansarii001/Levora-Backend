import express from 'express';
const router = express.Router();
import { purchaseSubscription, createOrder } from '../controllers/subscriptionController.js';

router.post('/create-order', createOrder);
router.post('/purchase', purchaseSubscription);

export default router;
