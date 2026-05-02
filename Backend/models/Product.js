const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    id: Number,
    name: String,
    image: String,
    category: String,
    new_price: Number,
    old_price: Number,
    stock: { type: Number, default: 10 },
    date: { type: Date, default: Date.now },
    available: { type: Boolean, default: true }
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
