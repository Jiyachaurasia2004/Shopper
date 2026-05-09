const razorpayInstance = require('../config/razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const emailService = require('../services/emailService');
const { generateInvoicePDF } = require('../utils/invoiceGenerator');
const path = require('path');
const fs = require('fs');

// Create Razorpay Order
exports.createOrder = async (req, res) => {
    try {
        const { amount, items, address } = req.body;

        // Check stock before creating order
        for (const item of items) {
            const product = await Product.findOne({ id: item.id });
            if (!product || product.stock < item.quantity) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Insufficient stock for ${item.name}. Available: ${product ? product.stock : 0}` 
                });
            }
        }
        
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
exports.deleteOrder = async (req, res) => {
    try {

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Check ownership
        if (order.userId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized"
            });
        }

        await Order.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: "Order deleted successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
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
            const updatedOrder = await Order.findByIdAndUpdate(dbOrderId, {
                status: "confirmed",
                paymentId: razorpay_payment_id,
                $push: { history: { status: "confirmed", message: "Payment verified successfully" } }
            }, { new: true });

            // Reduce stock atomically to prevent race conditions
            for (const item of updatedOrder.items) {
                const result = await Product.findOneAndUpdate(
                    { id: item.id, stock: { $gte: item.quantity } },
                    { $inc: { stock: -item.quantity } },
                    { new: true }
                );
                
                if (!result) {
                    console.error(`Oversell detected for product ${item.id}. Manual intervention needed.`);
                }
            }

            // Send Email
            const user = await User.findById(updatedOrder.userId);
            if (user) {
                const tempPath = path.join(__dirname, `../upload/invoice-${updatedOrder._id}.pdf`);
                await generateInvoicePDF(updatedOrder, tempPath);
                await emailService.sendOrderConfirmation(user.email, updatedOrder, tempPath);
                if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
            }

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

// Handle Razorpay Webhook
exports.handleWebhook = async (req, res) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if (signature === digest) {
        const event = req.body.event;
        const payload = req.body.payload;

        if (event === 'payment.captured') {
            const razorpayOrderId = payload.payment.entity.order_id;
            const order = await Order.findOne({ orderId: razorpayOrderId });

            if (order && order.status === 'pending') {
                order.status = 'confirmed';
                order.paymentId = payload.payment.entity.id;
                order.history.push({ status: 'confirmed', message: 'Payment confirmed via webhook' });
                await order.save();

                // Reduce stock atomically if not already done
                for (const item of order.items) {
                    await Product.findOneAndUpdate(
                        { id: item.id, stock: { $gte: item.quantity } },
                        { $inc: { stock: -item.quantity } }
                    );
                }

                // Send email
                const user = await User.findById(order.userId);
                if (user) {
                    const tempPath = path.join(__dirname, `../upload/invoice-${order._id}.pdf`);
                    await generateInvoicePDF(order, tempPath);
                    await emailService.sendOrderConfirmation(user.email, order, tempPath);
                    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
                }
            }
        } else if (event === 'refund.processed') {
            const razorpayPaymentId = payload.refund.entity.payment_id;
            const order = await Order.findOne({ paymentId: razorpayPaymentId });
            if (order) {
                order.status = 'refunded';
                order.history.push({ status: 'refunded', message: 'Refund processed successfully' });
                await order.save();

                // Restore stock
                for (const item of order.items) {
                    await Product.findOneAndUpdate(
                        { id: item.id },
                        { $inc: { stock: item.quantity } }
                    );
                }
            }
        }
        res.json({ status: 'ok' });
    } else {
        res.status(400).send('Invalid signature');
    }
};

// Initiate Refund
exports.initiateRefund = async (req, res) => {
    try {
        const { orderId } = req.body;
        const order = await Order.findById(orderId);

        if (!order || !order.paymentId) {
            return res.status(404).json({ success: false, message: "Order or payment not found" });
        }

        const refund = await razorpayInstance.payments.refund(order.paymentId, {
            amount: order.amount * 100, // full refund
            speed: "normal",
            notes: { reason: "User requested cancellation" }
        });

        order.status = 'refunded';
        order.refundId = refund.id;
        order.history.push({ status: 'refunded', message: 'Refund initiated' });
        await order.save();

        // Restore stock
        for (const item of order.items) {
            await Product.findOneAndUpdate(
                { id: item.id },
                { $inc: { stock: item.quantity } }
            );
        }

        res.json({ success: true, refund });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Cancel Order (User)
exports.cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.body;
        const order = await Order.findById(orderId);

        if (!order) return res.status(404).json({ success: false, message: "Order not found" });
        
        // Only allow cancellation if pending or confirmed
        if (!['pending', 'confirmed'].includes(order.status)) {
            return res.status(400).json({ success: false, message: "Order cannot be cancelled at this stage" });
        }

        if (order.status === 'confirmed') {
            // Need to initiate refund
            return exports.initiateRefund(req, res);
        }

        order.status = 'cancelled';
        order.history.push({ status: 'cancelled', message: 'Cancelled by user' });
        await order.save();

        res.json({ success: true, message: "Order cancelled successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Razorpay Key
exports.getRazorpayKey = async (req, res) => {
    res.json({ key: process.env.RAZORPAY_KEY_ID });
};