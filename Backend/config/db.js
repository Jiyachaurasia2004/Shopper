const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.ONLINE_MONGO_URI);
        console.log("✅ Connected to Online MongoDB");
    } catch (err) {
        console.log("⚠️ Online DB failed, trying local...");
        try {
            await mongoose.connect(process.env.LOCAL_MONGO_URI || "mongodb://127.0.0.1:27017/ecommerce");
            console.log("✅ Connected to Local MongoDB");
        } catch {
            console.error("❌ Both DB connections failed");
            process.exit(1);
        }
    }
};

module.exports = connectDB;
