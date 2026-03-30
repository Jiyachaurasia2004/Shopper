const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cors = require('cors');
const bcrypt = require('bcrypt');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

const app = express();
const port = 4000;

app.use(express.json());
app.use(cors());

// ✅ CLOUDINARY CONFIG
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// ✅ MULTER STORAGE (CLOUDINARY)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ecommerce_products',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

const upload = multer({ storage });

// ✅ MONGODB CONNECTION
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// ✅ ROOT API
app.get("/", (req, res) => {
  res.send("API Running");
});

// ✅ IMAGE UPLOAD
app.post("/upload", upload.single('product'), (req, res) => {
  res.json({
    success: 1,
    image_url: req.file.path
  });
});

// ✅ PRODUCT SCHEMA
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

// ✅ ADD PRODUCT
app.post('/addproduct', async (req, res) => {
  let products = await Product.find({});
  let id = products.length ? products.slice(-1)[0].id + 1 : 1;

  const product = new Product({
    id,
    name: req.body.name,
    image: req.body.image,
    category: req.body.category,
    new_price: req.body.new_price,
    old_price: req.body.old_price,
  });

  await product.save();
  res.json({ success: true });
});

// ✅ DELETE PRODUCT
app.post('/removeproduct', async (req, res) => {
  await Product.findOneAndDelete({ id: req.body.id });
  res.json({ success: true });
});

// ✅ GET ALL PRODUCTS
app.get('/allproducts', async (req, res) => {
  const products = await Product.find({});
  res.send(products);
});

// ✅ NEW COLLECTION
app.get('/newcollections', async (req, res) => {
  let products = await Product.find({});
  let newcollection = products.slice(-8);
  res.send(newcollection);
});

// ✅ POPULAR WOMEN
app.get('/popularinwomen', async (req, res) => {
  let products = await Product.find({ category: "women" });
  res.send(products.slice(0, 4));
});

// ✅ USER SCHEMA
const Users = mongoose.model('Users', {
  name: String,
  email: { type: String, unique: true },
  password: String,
  cartData: Object,
  date: { type: Date, default: Date.now }
});

// ✅ SIGNUP
app.post('/signup', async (req, res) => {
  const existing = await Users.findOne({ email: req.body.email });

  if (existing) {
    return res.json({ success: false, message: "User already exists" });
  }

  let cart = {};
  for (let i = 0; i < 300; i++) cart[i] = 0;

  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  const user = new Users({
    name: req.body.username,
    email: req.body.email,
    password: hashedPassword,
    cartData: cart,
  });

  await user.save();

  const token = jwt.sign(
    { user: { id: user._id } },
    process.env.JWT_SECRET
  );

  res.json({ success: true, token });
});

// ✅ LOGIN
app.post('/login', async (req, res) => {
  const user = await Users.findOne({ email: req.body.email });

  if (!user) {
    return res.json({ success: false, message: "User not found" });
  }

  const isMatch = await bcrypt.compare(req.body.password, user.password);

  if (!isMatch) {
    return res.json({ success: false, message: "Wrong password" });
  }

  const token = jwt.sign(
    { user: { id: user._id } },
    process.env.JWT_SECRET
  );

  res.json({ success: true, token });
});

// ✅ AUTH MIDDLEWARE
const fetchUser = async (req, res, next) => {
  const token = req.header('auth-token');

  if (!token) {
    return res.status(401).send("No token");
  }

  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    req.user = data.user;
    next();
  } catch {
    res.status(401).send("Invalid token");
  }
};

// ✅ ADD TO CART
app.post('/addtocart', fetchUser, async (req, res) => {
  let userData = await Users.findById(req.user.id);

  userData.cartData[req.body.itemId] += 1;

  await Users.findByIdAndUpdate(req.user.id, {
    cartData: userData.cartData
  });

  res.send("Added");
});

// ✅ REMOVE FROM CART
app.post('/removefromcart', fetchUser, async (req, res) => {
  let userData = await Users.findById(req.user.id);

  if (userData.cartData[req.body.itemId] > 0) {
    userData.cartData[req.body.itemId] -= 1;
  }

  await Users.findByIdAndUpdate(req.user.id, {
    cartData: userData.cartData
  });

  res.send("Removed");
});

// ✅ GET CART
app.post('/getcart', fetchUser, async (req, res) => {
  let userData = await Users.findById(req.user.id);
  res.json(userData.cartData);
});

// ✅ START SERVER
app.listen(port, () => {
  console.log("Server running on port " + port);
});