const razorpayInstance = require('../config/razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

// Create Razorpay Order
exports.createOrder = async (req, res) => {
    try {
        const { amount, items, address } = req.body;
        
        // Amount should be in paise
        const options = {
            amount: amount * 100, 
            currency: "INR",
            receipt: `receipt_order_${Date.now()}`
        };

        const order = await razorpayInstance.orders.create(options);
        
        if (!order) return res.status(500).send("Some error occurred");

        // Save initial pending order to DB
        const newOrder = new Order({
            userId: req.user.id, // from auth middleware
            items,
            amount: amount,
            address,
            orderId: order.id,
            status: "pending"
        });
        await newOrder.save();

        res.json({ success: true, order, dbOrderId: newOrder._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Verify Payment
exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, dbOrderId } = req.body;

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret')
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            // Payment is successful
            await Order.findByIdAndUpdate(dbOrderId, {
                status: "paid",
                paymentId: razorpay_payment_id
            });
            return res.status(200).json({ success: true, message: "Payment verified successfully" });
        } else {
            return res.status(400).json({ success: false, message: "Invalid signature sent!" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Fetch User Orders
exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id }).sort({ date: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Razorpay Key
exports.getRazorpayKey = async (req, res) => {
    res.json({ key: process.env.RAZORPAY_KEY_ID });
};

