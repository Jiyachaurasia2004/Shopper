const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const fetchUser = require('../middleware/fetchUser');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/addtocart', fetchUser, authController.addToCart);
router.post('/removefromcart', fetchUser, authController.removeFromCart);
router.post('/getcart', fetchUser, authController.getCart);

module.exports = router;
