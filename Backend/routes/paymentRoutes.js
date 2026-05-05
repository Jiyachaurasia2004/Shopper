const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const fetchUser = require('../middleware/fetchUser');

router.post('/create-order', fetchUser,  paymentController.createOrder);
router.post('/verify-payment', fetchUser, paymentController.verifyPayment);
router.get('/my-orders', fetchUser, paymentController.getUserOrders);
router.get('/get-key', paymentController.getRazorpayKey);

// Webhook (No auth needed, Razorpay will call this)
router.post('/webhook', paymentController.handleWebhook);

// Cancellation & Refunds
router.post('/cancel', fetchUser, paymentController.cancelOrder);
router.post('/refund', fetchUser, paymentController.initiateRefund);

module.exports = router;

