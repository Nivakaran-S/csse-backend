const mongoose = require('mongoose');
const { Schema } = mongoose;

// ============================================
// CASH PAYMENT RECEIPT MODEL
// ============================================

const CashPaymentReceiptSchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  patientName: { 
    type: String, 
    required: true 
  },
  patientId: { 
    type: String, 
    required: true 
  },
  patientEmail: { 
    type: String, 
    required: true 
  },
  patientPhone: { 
    type: String, 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  depositReference: { 
    type: String, 
    required: true 
  },
  bankName: { 
    type: String, 
    required: true 
  },
  branchName: { 
    type: String, 
    required: true 
  },
  depositDate: { 
    type: Date, 
    required: true 
  },
  transactionId: { 
    type: String, 
    required: true 
  },
  receiptNumber: { 
    type: String, 
    required: true, 
    unique: true 
  },
  notes: { 
    type: String 
  },
  paymentSlipUrl: { 
    type: String 
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Declined', 'Under Review'], 
    default: 'Pending' 
  },
  adminNotes: { 
    type: String 
  },
  submittedAt: { 
    type: Date, 
    default: Date.now 
  },
  reviewedAt: { 
    type: Date 
  },
  reviewedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  }
});

// Create and export the model
const CashPaymentReceipt = mongoose.model('CashPaymentReceipt', CashPaymentReceiptSchema);

module.exports = CashPaymentReceipt;