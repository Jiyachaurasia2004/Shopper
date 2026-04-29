const Users = require('../models/User');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
    try {
        const exist = await Users.findOne({ email: req.body.email });
        if (exist) return res.status(400).json({ success: false, errors: "User exists" });

        let cart = {};
        for (let i = 0; i < 300; i++) cart[i] = 0;

        const user = new Users({
            name: req.body.username,
            email: req.body.email,
            password: req.body.password,
            cartData: cart
        });

        await user.save();

        const token = jwt.sign({ user: { id: user._id } }, process.env.JWT_SECRET || "secret");
        res.json({ success: true, token });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const user = await Users.findOne({ email: req.body.email });
        if (!user) return res.json({ success: false, errors: "Wrong email" });

        if (user.password !== req.body.password)
            return res.json({ success: false, errors: "Wrong password" });

        const token = jwt.sign({ user: { id: user._id } }, process.env.JWT_SECRET || "secret");
        res.json({ success: true, token });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addToCart = async (req, res) => {
    try {
        const user = await Users.findById(req.user.id);
        user.cartData[req.body.itemId] += 1;
        // Mongoose doesn't detect changes in Mixed objects/nested items sometimes
        user.markModified('cartData');
        await user.save();
        res.send("Added");
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.removeFromCart = async (req, res) => {
    try {
        const user = await Users.findById(req.user.id);
        if (user.cartData[req.body.itemId] > 0)
            user.cartData[req.body.itemId] -= 1;
        user.markModified('cartData');
        await user.save();
        res.send("Removed");
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getCart = async (req, res) => {
    try {
        const user = await Users.findById(req.user.id);
        res.json(user.cartData);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
