const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

exports.sendOrderConfirmation = async (userEmail, order, invoicePath) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: `Order Confirmation - #${order.orderId}`,
            html: `
                <h1>Thank you for your order!</h1>
                <p>Hi,</p>
                <p>Your order #${order.orderId} has been successfully placed.</p>
                <p>Amount Paid: ₹${order.amount}</p>
                <p>We will notify you once it's shipped.</p>
            `,
            attachments: invoicePath ? [
                {
                    filename: `invoice-${order.orderId}.pdf`,
                    path: invoicePath,
                    contentType: 'application/pdf'
                }
            ] : []
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${userEmail}`);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

exports.sendStatusUpdate = async (userEmail, order, status) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: `Order Status Update - #${order.orderId}`,
            html: `
                <h1>Order Status Update</h1>
                <p>Hi,</p>
                <p>Your order #${order.orderId} status has been updated to: <strong>${status.toUpperCase()}</strong></p>
                <p>You can track your order in your account dashboard.</p>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Status update email sent to ${userEmail}`);
    } catch (error) {
        console.error('Error sending status update email:', error);
    }
};