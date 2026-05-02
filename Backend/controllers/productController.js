const Product = require('../models/Product');

exports.addProduct = async (req, res) => {
    try {
        const products = await Product.find({});
        const id = products.length ? products.slice(-1)[0].id + 1 : 1;

        const product = new Product({
            id,
            name: req.body.name,
            image: req.body.image_url,
            category: req.body.category,
            new_price: Number(req.body.new_price),
            old_price: Number(req.body.old_price),
            stock: Number(req.body.stock || 0)
        });

        await product.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.removeProduct = async (req, res) => {
    try {
        await Product.findOneAndDelete({ id: req.body.id });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getNewCollections = async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products.slice(-8));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPopularInWomen = async (req, res) => {
    try {
        const products = await Product.find({ category: "women" });
        res.json(products.slice(0, 4));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { id, name, category, new_price, old_price, stock, image_url } = req.body;
        const product = await Product.findOneAndUpdate({ id }, {
            name,
            category,
            new_price: Number(new_price),
            old_price: Number(old_price),
            stock: Number(stock),
            image: image_url
        }, { new: true });
        
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });
        res.json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
