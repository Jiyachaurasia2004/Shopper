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
        const totalRevenue = orders.reduce((acc, order) => acc + order.amount, 0);

        // Orders per day (last 7 days)
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);
        
        const dailyOrders = await Order.aggregate([
            { $match: { date: { $gte: last7Days } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    count: { $sum: 1 },
                    revenue: { $sum: "$amount" }
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
        const orders = await Order.find().sort({ date: -1 }).populate('userId', 'name email');
        res.json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Order Status (Admin)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId, status, message } = req.body;
        const order = await Order.findById(orderId);

        if (!order) return res.status(404).json({ success: false, message: "Order not found" });

        order.status = status;
        order.history.push({ status, message: message || `Status updated to ${status}` });
        await order.save();

        // ➕ Restore stock if order is cancelled or refunded
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

        res.json({ success: true, message: "Order status updated and stock managed" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};