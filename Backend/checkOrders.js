const mongoose = require('mongoose');
const Order = require('./models/Order');
require('dotenv').config();

const connectDB = require('./config/db');

async function checkOrders() {
    await connectDB();
    const orders = await Order.find();
    console.log("Total Orders:", orders.length);
    console.log(orders);
    process.exit(0);
}

checkOrders();
