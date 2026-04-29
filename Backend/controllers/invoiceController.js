const PDFDocument = require('pdfkit');
const Order = require('../models/Order');
const path = require('path');

exports.downloadInvoice = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const order = await Order.findById(orderId).populate('userId', 'name email');

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Check if the requesting user owns the order
        if (order.userId._id.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: "Not authorized to view this invoice" });
        }

        const invoiceName = `invoice-${orderId}.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${invoiceName}"`);

        const doc = new PDFDocument({ margin: 50 });
        doc.pipe(res);

        // Header
        doc.fontSize(20).text('Invoice', { align: 'center' });
        doc.moveDown();

        // Order Details
        doc.fontSize(12).text(`Order ID: ${order._id}`);
        doc.text(`Date: ${new Date(order.date).toLocaleDateString()}`);
        doc.text(`Payment ID: ${order.paymentId || 'N/A'}`);
        doc.text(`Status: ${order.status.toUpperCase()}`);
        doc.moveDown();

        // Customer Details
        doc.text(`Customer Name: ${order.address.name}`);
        doc.text(`Phone: ${order.address.phone}`);
        doc.text(`Address: ${order.address.street}, ${order.address.city}, ${order.address.pincode}`);
        doc.moveDown();

        // Items Table Header
        doc.font('Helvetica-Bold');
        doc.text('Item', 50, doc.y);
        doc.text('Qty', 350, doc.y);
        doc.text('Price', 450, doc.y);
        doc.moveDown();
        doc.font('Helvetica');

        // Items
        let yPos = doc.y;
        order.items.forEach(item => {
            doc.text(item.name, 50, yPos);
            doc.text(item.quantity.toString(), 350, yPos);
            doc.text(`Rs. ${item.new_price}`, 450, yPos);
            yPos += 20;
        });

        doc.y = yPos + 20;
        doc.moveDown();
        
        // Total Amount
        doc.font('Helvetica-Bold');
        doc.text(`Total Amount: Rs. ${order.amount}`, { align: 'right' });

        doc.end();

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};
