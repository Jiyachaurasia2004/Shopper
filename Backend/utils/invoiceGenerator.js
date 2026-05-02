const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

exports.generateInvoicePDF = (order, outputPath) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            
            // If outputPath is provided, pipe to file, otherwise we can't easily return a stream here without complicating things.
            // For email attachment, we'll save to a temp file.
            const stream = fs.createWriteStream(outputPath);
            doc.pipe(stream);

            // Header
            doc.fontSize(20).text('Invoice', { align: 'center' });
            doc.moveDown();

            // Order Details
            doc.fontSize(12).text(`Order ID: ${order.orderId || order._id}`);
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
                doc.text(item.quantity ? item.quantity.toString() : '1', 350, yPos);
                doc.text(`Rs. ${item.new_price}`, 450, yPos);
                yPos += 20;
            });

            doc.y = yPos + 20;
            doc.moveDown();
            
            // Total Amount
            doc.font('Helvetica-Bold');
            doc.text(`Total Amount: Rs. ${order.amount}`, { align: 'right' });

            doc.end();
            stream.on('finish', () => resolve(outputPath));
            stream.on('error', reject);
        } catch (error) {
            reject(error);
        }
    });
};
