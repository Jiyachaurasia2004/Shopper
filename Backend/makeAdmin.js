const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();
const connectDB = require('./config/db');

async function grantAdmin() {
    await connectDB();
    // find a test user or any user and make them admin
    const user = await User.findOneAndUpdate(
        { email: 'jiya' }, // Or adjust to your real admin email, I'll update all for now for testing! Actually wait, I will update 'jiya' or 'test@test.com'
        { $set: { role: 'admin' } },
        { new: true }
    );
    if (!user) {
        // Just make the first user an admin
        const firstUser = await User.findOne();
        if (firstUser) {
            firstUser.role = 'admin';
            await firstUser.save();
            console.log("Made first user admin:", firstUser.email);
        } else {
            console.log("No users found");
        }
    } else {
        console.log("Made user admin:", user.email);
    }
    process.exit(0);
}

grantAdmin();
