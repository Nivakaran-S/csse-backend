const CashPaymentReceipt = require('../models/cashPaymentReceipt.model');
const User = require('../models/users.model');

// ============================================
// CASH PAYMENT RECEIPT MANAGEMENT
// ============================================

// Submit cash payment receipt
const submitCashPaymentReceipt = async (req, res) => {
  try {
    const {
      userId,
      patientName,
      patientId,
      patientEmail,
      patientPhone,
      amount,
      depositReference,
      bankName,
      branchName,
      depositDate,
      transactionId,
      receiptNumber,
      notes,
      paymentSlipUrl
    } = req.body;

    // Validate required fields
    if (!userId || !patientName || !patientId || !amount || !depositReference || !bankName || !transactionId || !receiptNumber) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Validate userId format (should be a valid MongoDB ObjectId)
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if receipt number already exists
    const existingReceipt = await CashPaymentReceipt.findOne({ receiptNumber });
    if (existingReceipt) {
      return res.status(400).json({
        success: false,
        message: 'Receipt number already exists'
      });
    }

    // Create new cash payment receipt
    const cashReceipt = new CashPaymentReceipt({
      userId,
      patientName,
      patientId,
      patientEmail,
      patientPhone,
      amount,
      depositReference,
      bankName,
      branchName,
      depositDate: new Date(depositDate),
      transactionId,
      receiptNumber,
      notes,
      paymentSlipUrl,
      status: 'Pending'
    });

    await cashReceipt.save();

    return res.status(201).json({
      success: true,
      message: 'Cash payment receipt submitted successfully',
      data: {
        id: cashReceipt._id,
        receiptNumber: cashReceipt.receiptNumber,
        status: cashReceipt.status,
        submittedAt: cashReceipt.submittedAt
      }
    });
  } catch (err) {
    console.log('Error submitting cash payment receipt', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Error submitting cash payment receipt'
    });
  }
};

// Get user's cash payment receipts
const getUserCashPaymentReceipts = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId format
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    const receipts = await CashPaymentReceipt.find({ userId })
      .sort({ submittedAt: -1 });

    return res.status(200).json({
      success: true,
      data: receipts
    });
  } catch (err) {
    console.log('Error fetching user cash payment receipts', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Error fetching cash payment receipts'
    });
  }
};

// Admin: Get all cash payment receipts
const getAllCashPaymentReceipts = async (req, res) => {
  try {
    const receipts = await CashPaymentReceipt.find()
      .populate('userId', 'userName firstName lastName email')
      .populate('reviewedBy', 'userName')
      .sort({ submittedAt: -1 });

    const formattedReceipts = receipts.map(receipt => ({
      id: receipt._id,
      userId: receipt.userId,
      patientName: receipt.patientName,
      patientId: receipt.patientId,
      patientEmail: receipt.patientEmail,
      amount: receipt.amount,
      depositReference: receipt.depositReference,
      bankName: receipt.bankName,
      branchName: receipt.branchName,
      depositDate: receipt.depositDate,
      transactionId: receipt.transactionId,
      receiptNumber: receipt.receiptNumber,
      status: receipt.status,
      adminNotes: receipt.adminNotes,
      submittedAt: receipt.submittedAt,
      reviewedAt: receipt.reviewedAt,
      reviewedBy: receipt.reviewedBy
    }));

    return res.status(200).json({
      success: true,
      data: formattedReceipts
    });
  } catch (err) {
    console.log('Error fetching all cash payment receipts', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Error fetching cash payment receipts'
    });
  }
};

// Admin: Update cash payment receipt status
const updateCashPaymentReceiptStatus = async (req, res) => {
  try {
    const { receiptId, status, adminNotes, reviewedBy } = req.body;

    if (!receiptId || !status) {
      return res.status(400).json({
        success: false,
        message: 'Receipt ID and status are required'
      });
    }

    const receipt = await CashPaymentReceipt.findById(receiptId);
    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: 'Cash payment receipt not found'
      });
    }

    receipt.status = status;
    receipt.adminNotes = adminNotes || '';
    receipt.reviewedAt = new Date();
    receipt.reviewedBy = reviewedBy;

    await receipt.save();

    return res.status(200).json({
      success: true,
      message: `Cash payment receipt ${status.toLowerCase()} successfully`,
      data: {
        id: receipt._id,
        receiptNumber: receipt.receiptNumber,
        status: receipt.status,
        adminNotes: receipt.adminNotes
      }
    });
  } catch (err) {
    console.log('Error updating cash payment receipt status', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Error updating cash payment receipt status'
    });
  }
};

// ============================================
// EXPORTS
// ============================================

module.exports = {
  submitCashPaymentReceipt,
  getUserCashPaymentReceipts,
  getAllCashPaymentReceipts,
  updateCashPaymentReceiptStatus
};