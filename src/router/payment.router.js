const express = require('express');
const { 
  processPayment, 
  getPaymentsByUserId, 
  verifyCashPayment 
} = require('../controllers/payment.controller');

const router = express.Router();

// POST /api/payments - Process a new payment
router.post('/', processPayment);

// GET /api/payments/user - Get payments by user ID
router.get('/user', getPaymentsByUserId);

// PUT /api/payments/verify - Verify cash payment (Admin action)
router.put('/verify', verifyCashPayment);

module.exports = router;