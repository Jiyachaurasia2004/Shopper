// server.js (Refactored)
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const connectDB = require('./config/db');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');

const app = express();

// ================= PORT HANDLING (AUTO FIX) =================
let PORT = process.env.PORT || 4000;

const startServer = (port) => {
    app.listen(port, () => {
        console.log(`✅ Server running on port ${port}`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`⚠️ Port ${port} busy, trying ${Number(port) + 1}`);
            startServer(Number(port) + 1);
        } else {
            console.error(err);
        }
    });
};

// ================= MIDDLEWARE =================
app.use(express.json());
app.use(cookieParser());
app.use(cors());

// ================= ROUTES =================
app.get("/", (req, res) => {
    res.send("🚀 API Running...");
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/invoice', invoiceRoutes);
app.use('/', uploadRoutes); // keeping root as the previous setup used /upload directly

// To map old frontend calls to the new /api namespace, we'll re-export routes on old paths for backward compatibility.
// If the frontend is completely updated, we can remove these.
app.use('/', authRoutes);
app.use('/', productRoutes);

// ================= START =================
connectDB().then(() => {
    startServer(PORT);
});