const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://jiya:jiya123@cluster0.p7uay.mongodb.net/shopper");
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