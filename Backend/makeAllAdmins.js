const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();
const connectDB = require('./config/db');

async function makeAllAdmin() {
    await connectDB();
    const result = await User.updateMany({}, { $set: { role: 'admin' } });
    console.log("Updated all users to admin:", result);
    process.exit(0);
}

makeAllAdmin();
