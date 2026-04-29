const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const fetchUser = require('../middleware/fetchUser');

router.post('/create-order', fetchUser, paymentController.createOrder);
router.post('/verify-payment', fetchUser, paymentController.verifyPayment);
router.get('/my-orders', fetchUser, paymentController.getUserOrders);
router.get('/get-key', paymentController.getRazorpayKey);

module.exports = router;

