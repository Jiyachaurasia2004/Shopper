const Order = require('../models/Order');
const path = require('path');
const fs = require('fs');
const { generateInvoicePDF } = require('../utils/invoiceGenerator');

exports.downloadInvoice = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Check if the requesting user owns the order
        if (order.userId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: "Not authorized to view this invoice" });
        }

        const tempPath = path.join(__dirname, `../upload/invoice-${orderId}.pdf`);
        await generateInvoicePDF(order, tempPath);

        res.download(tempPath, `invoice-${orderId}.pdf`, (err) => {
            if (err) {
                console.error("Error downloading file:", err);
            }
            // Delete temp file after sending
            if (fs.existsSync(tempPath)) {
                fs.unlinkSync(tempPath);
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};
