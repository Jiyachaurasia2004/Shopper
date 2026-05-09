const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const emailService = require('../services/emailService');

// Get Dashboard Stats
exports.getStats = async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const totalUsers = await User.countDocuments();
        const totalProducts = await Product.countDocuments();
        
        const orders = await Order.find({ status: { $ne: 'cancelled' } });
        const totalRevenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);

        // Orders per day (last 7 days)
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);
        
        const dailyOrders = await Order.aggregate([
            { $match: { createdAt: { $gte: last7Days } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 },
                    revenue: { $sum: "$totalAmount" }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        res.json({
            success: true,
            stats: {
                totalOrders,
                totalUsers,
                totalProducts,
                totalRevenue
            },
            dailyOrders
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get All Orders (Admin)
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 }).populate('userId', 'name email');
        console.log("Admin Orders Fetched:", orders.length);
        res.json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Order Status (Admin)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status, message } = req.body;
        const { id: orderId } = req.params;
        const order = await Order.findById(orderId);

        if (!order) return res.status(404).json({ success: false, message: "Order not found" });

        // Validate status transitions
        const validTransitions = {
            pending: ['confirmed', 'cancelled'],
            confirmed: ['shipped', 'cancelled'],
            shipped: ['out_for_delivery'],
            out_for_delivery: ['delivered'],
            delivered: ['refunded'],
            cancelled: ['refunded'],
            refunded: []
        };

        if (!validTransitions[order.status].includes(status)) {
            return res.status(400).json({ 
                success: false, 
                message: `Invalid status transition from ${order.status} to ${status}` 
            });
        }

        order.status = status;
        order.history.push({ status, message: message || `Status updated to ${status}` });

        // Update specific timestamps based on status
        if (status === 'confirmed') order.confirmedAt = Date.now();
        if (status === 'shipped') order.shippedAt = Date.now();
        if (status === 'out_for_delivery') order.outForDeliveryAt = Date.now();
        if (status === 'delivered') order.deliveredAt = Date.now();

        await order.save();

        // Restore stock if order is cancelled or refunded
        if (status === 'cancelled' || status === 'refunded') {
            for (const item of order.items) {
                await Product.findOneAndUpdate(
                    { id: item.id },
                    { $inc: { stock: item.quantity } }
                );
            }
        }

        // Send status update email
        const user = await User.findById(order.userId);
        if (user) {
            await emailService.sendStatusUpdate(user.email, order, status);
        }

        res.json({ success: true, message: "Order status updated successfully", order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};