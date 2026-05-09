const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const fetchUser = require('../middleware/fetchUser');
const adminAuth = require('../middleware/adminAuth');

const { body, validationResult } = require('express-validator');

router.get('/stats', fetchUser, adminAuth, adminController.getStats);
router.get('/orders', fetchUser, adminAuth, adminController.getAllOrders);
router.put('/orders/:id/status', [
    fetchUser,
    adminAuth,
    body('status').isIn(['pending', 'confirmed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'])
        .withMessage('Invalid status')
], (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
}, adminController.updateOrderStatus);

module.exports = router;