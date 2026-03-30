// server.js
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ================= PORT HANDLING (AUTO FIX) =================
let PORT = process.env.PORT || 4000;

const startServer = (port) => {
    app.listen(port, () => {
        console.log(`✅ Server running on port ${port}`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`⚠️ Port ${port} busy, trying ${port + 1}`);
            startServer(port + 1);
        } else {
            console.error(err);
        }
    });
};

// ================= MIDDLEWARE =================
app.use(express.json());
app.use(cors({origin: 'https://shopper-frontend-1548.onrender.com','https://shopper-admin-hm3y.onrender.com'}));

// ================= CLOUDINARY SETUP =================
const { v2: cloudinary } = require('cloudinary');
const CloudinaryStorage = require('multer-storage-cloudinary').CloudinaryStorage || require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: require('cloudinary'),
    folder: 'ecommerce_products',
    allowedFormats: ['jpg', 'jpeg', 'png'],
    filename: function (req, file, cb) {
        cb(undefined, file.fieldname + '_' + Date.now());
    }
});

const upload = multer({ storage });

// ================= MONGODB CONNECTION =================
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

// ================= ROUTES =================
app.get("/", (req, res) => {
    res.send("🚀 API Running...");
});

// ================= PRODUCT MODEL =================
const Product = mongoose.model("Product", {
    id: Number,
    name: String,
    image: String,
    category: String,
    new_price: Number,
    old_price: Number,
    date: { type: Date, default: Date.now },
    available: { type: Boolean, default: true }
});

// ================= USER MODEL =================
const Users = mongoose.model("Users", {
    name: String,
    email: { type: String, unique: true },
    password: String,
    cartData: Object,
    date: { type: Date, default: Date.now }
});

// ================= UPLOAD IMAGE =================
app.post("/upload", upload.single('product'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: 0, message: "Upload failed" });
    }
    res.json({ success: 1, image_url: req.file.secure_url || req.file.url });
});

// ================= ADD PRODUCT =================
app.post('/addproduct', async (req, res) => {
    try {
        const products = await Product.find({});
        const id = products.length ? products.slice(-1)[0].id + 1 : 1;

        const product = new Product({
            id,
            name: req.body.name,
            image: req.body.image_url,
            category: req.body.category,
            new_price: Number(req.body.new_price),
            old_price: Number(req.body.old_price)
        });

        await product.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ================= REMOVE PRODUCT =================
app.post('/removeproduct', async (req, res) => {
    await Product.findOneAndDelete({ id: req.body.id });
    res.json({ success: true });
});

// ================= GET PRODUCTS =================
app.get('/allproducts', async (req, res) => {
    res.json(await Product.find({}));
});

// ================= AUTH =================
app.post('/signup', async (req, res) => {
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

    const token = jwt.sign({ user: { id: user._id } }, "secret");
    res.json({ success: true, token });
});

app.post('/login', async (req, res) => {
    const user = await Users.findOne({ email: req.body.email });
    if (!user) return res.json({ success: false, errors: "Wrong email" });

    if (user.password !== req.body.password)
        return res.json({ success: false, errors: "Wrong password" });

    const token = jwt.sign({ user: { id: user._id } }, "secret");
    res.json({ success: true, token });
});

// ================= AUTH MIDDLEWARE =================
const fetchUser = (req, res, next) => {
    const token = req.header("auth-token");
    if (!token) return res.status(401).send("Access denied");

    try {
        const data = jwt.verify(token, "secret");
        req.user = data.user;
        next();
    } catch {
        res.status(401).send("Invalid token");
    }
};

// ================= CART =================
app.post('/addtocart', fetchUser, async (req, res) => {
    const user = await Users.findById(req.user.id);
    user.cartData[req.body.itemId] += 1;
    await user.save();
    res.send("Added");
});

app.post('/removefromcart', fetchUser, async (req, res) => {
    const user = await Users.findById(req.user.id);
    if (user.cartData[req.body.itemId] > 0)
        user.cartData[req.body.itemId] -= 1;
    await user.save();
    res.send("Removed");
});

app.post('/getcart', fetchUser, async (req, res) => {
    const user = await Users.findById(req.user.id);
    res.json(user.cartData);
});

// ================= COLLECTIONS =================
app.get('/newcollections', async (req, res) => {
    const products = await Product.find({});
    res.json(products.slice(-8));
});

app.get('/popularinwomen', async (req, res) => {
    const products = await Product.find({ category: "women" });
    res.json(products.slice(0, 4));
});

// ================= START =================
connectDB().then(() => {
    startServer(PORT);
});
