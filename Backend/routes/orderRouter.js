const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const fetchUser = require('../middleware/fetchUser');

// Get specific order details (tracking)
router.get('/:id', fetchUser, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });
        
        // Security check: ensure user owns the order or is admin
        if (order.userId.toString() !== req.user.id) {
            // Check if user is admin (optional, if we want admins to use this route too)
            // For now, only owner can view tracking via this route
            return res.status(403).json({ success: false, message: "Not authorized" });
        }
        
        res.json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;