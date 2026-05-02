const mongoose = require('mongoose');
require('dotenv').config();

const promoteUser = async (email) => {
    try {
        await mongoose.connect(process.env.ONLINE_MONGO_URI);
        console.log("Connected to MongoDB");
        
        const User = mongoose.model('User', new mongoose.Schema({
            email: String,
            role: { type: String, default: 'user' }
        }));

        const user = await User.findOneAndUpdate({ email: email }, { role: 'admin' }, { new: true });
        if (user) {
            console.log(`User ${email} promoted to admin successfully!`);
        } else {
            console.log(`User ${email} not found.`);
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

promoteUser('jiyachaurasia25@gmail.com');
