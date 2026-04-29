const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const fetchUser = require('../middleware/fetchUser');

router.get('/download-invoice/:orderId', fetchUser, invoiceController.downloadInvoice);

module.exports = router;
