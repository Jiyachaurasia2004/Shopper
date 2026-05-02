const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        const uri = process.env.ONLINE_MONGO_URI;
        if (!uri) throw new Error("ONLINE_MONGO_URI not found in .env");
        await mongoose.connect(uri);
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

const Product = mongoose.model("Product", new mongoose.Schema({
    stock: { type: Number, default: 10 }
}));

const updateStock = async () => {
    await connectDB();
    const result = await Product.updateMany({ $or: [{ stock: { $exists: false } }, { stock: 0 }] }, { $set: { stock: 10 } });
    console.log(`Updated ${result.modifiedCount} products with stock 10`);
    process.exit(0);
};

updateStock();
