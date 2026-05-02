const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

const { body, validationResult } = require('express-validator');

const fetchUser = require('../middleware/fetchUser');
const adminAuth = require('../middleware/adminAuth');

router.post('/addproduct', [
    fetchUser,
    adminAuth,
    body('name').notEmpty().withMessage('Name is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('new_price').isNumeric().withMessage('New price must be a number'),
    body('old_price').isNumeric().withMessage('Old price must be a number'),
    body('stock').isNumeric().withMessage('Stock must be a number'),
], (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
}, productController.addProduct);
router.post('/removeproduct', fetchUser, adminAuth, productController.removeProduct);
router.post('/updateproduct', fetchUser, adminAuth, productController.updateProduct);
router.get('/allproducts', productController.getAllProducts);
router.get('/newcollections', productController.getNewCollections);
router.get('/popularinwomen', productController.getPopularInWomen);

module.exports = router;
