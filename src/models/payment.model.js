const mongoose = require('mongoose');
const { Schema } = mongoose;

// ============================================
// PAYMENT MODEL
// ============================================

const PaymentSchema = new Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    default: 55.00
  },
  method: {
    type: String,
    required: true,
    enum: ['Coverage', 'CreditCard', 'Cash']
  },
  status: {
    type: String,
    required: true,
    enum: ['Processed', 'PendingVerification', 'Failed', 'CoverageRejected'],
    default: 'PendingVerification'
  },
  date: {
    type: Date,
    default: Date.now
  },
  details: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for efficient queries
PaymentSchema.index({ userId: 1, date: -1 });

// Create and export the model
const Payment = mongoose.model('Payment', PaymentSchema);

module.exports = Payment;