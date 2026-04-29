const express = require('express');
const router = express.Router();
const upload = require('../config/cloudinary');

router.post("/upload", upload.single('product'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: 0, message: "Upload failed" });
    }
    res.json({ success: 1, image_url: req.file.secure_url || req.file.url });
});

module.exports = router;
