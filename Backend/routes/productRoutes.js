const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.post('/addproduct', productController.addProduct);
router.post('/removeproduct', productController.removeProduct);
router.get('/allproducts', productController.getAllProducts);
router.get('/newcollections', productController.getNewCollections);
router.get('/popularinwomen', productController.getPopularInWomen);

module.exports = router;
