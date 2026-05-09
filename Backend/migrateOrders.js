const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('./config/db');

async function migrate() {
    await connectDB();
    const db = mongoose.connection.db;
    const result = await db.collection('orders').updateMany(
        {},
        { $rename: { "amount": "totalAmount", "date": "createdAt" } }
    );
    console.log("Migration result:", result);
    process.exit(0);
}

migrate();
