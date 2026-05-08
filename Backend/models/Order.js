const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    items: Array,
    amount: { type: Number, required: true },
    address: { type: Object, required: true },
    status: { 
        type: String, 
        default: "pending",
        enum: ["pending", "confirmed", "shipped", "out_for_delivery", "delivered", "cancelled", "refunded"]
    },
    paymentId: { type: String },
    orderId: { type: String },
    refundId: { type: String },
    history: [
        {
            status: String,
            message: String,
            updatedAt: { type: Date, default: Date.now }
        }
    ],
    trackingNumber: { type: String },
    date: { type: Date, default: Date.now }
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;