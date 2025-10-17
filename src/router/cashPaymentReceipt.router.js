const express = require('express');
const {
  submitCashPaymentReceipt,
  getUserCashPaymentReceipts,
  getAllCashPaymentReceipts,
  updateCashPaymentReceiptStatus
} = require('../controllers/cashPaymentReceipt.controller');

const router = express.Router();

// Submit cash payment receipt
router.post('/submit', submitCashPaymentReceipt);

// Get user's cash payment receipts
router.get('/user/:userId', getUserCashPaymentReceipts);

// Admin: Get all cash payment receipts
router.get('/admin/all', getAllCashPaymentReceipts);

// Admin: Update cash payment receipt status
router.put('/admin/status', updateCashPaymentReceiptStatus);

module.exports = router;