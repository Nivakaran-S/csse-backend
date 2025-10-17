const Payment = require('../models/payment.model');
const { v4: uuidv4 } = require('uuid');

// ============================================
// PAYMENT CONTROLLER
// ============================================

/**
 * Process payment based on method
 */
const processPayment = async (req, res) => {
  try {
    const { method, details } = req.body;
    const userId = 'PAT123'; // Mock user ID
    const amount = 55.00; // Fixed amount
    const transactionId = uuidv4();

    // Validate required fields
    if (!method || !details) {
      return res.status(400).json({
        success: false,
        message: 'Method and details are required'
      });
    }

    let paymentData;
    let status;

    switch (method) {
      case 'CreditCard':
        const result = await processCreditCard(details);
        status = result.status;
        paymentData = {
          transactionId,
          userId,
          amount,
          method,
          status,
          details: {
            lastFourDigits: result.lastFourDigits,
            cardType: result.cardType,
            expiryDate: result.expiryDate
          }
        };
        break;

      case 'Coverage':
        const coverageResult = await processCoverage(details);
        status = coverageResult.status;
        paymentData = {
          transactionId,
          userId,
          amount,
          method,
          status,
          details: {
            policyId: coverageResult.policyId,
            serviceReference: coverageResult.serviceReference
          }
        };
        break;

      case 'Cash':
        const cashResult = processCash(details);
        status = cashResult.status;
        paymentData = {
          transactionId,
          userId,
          amount,
          method,
          status,
          details: {
            depositReference: cashResult.depositReference,
            depositSlipUrl: cashResult.depositSlipUrl
          }
        };
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid payment method'
        });
    }

    // Save payment to database
    const payment = new Payment(paymentData);
    await payment.save();

    return res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        transactionId,
        status,
        amount,
        method
      }
    });

  } catch (error) {
    console.error('Payment processing error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

/**
 * Process credit card payment with 80% success rate
 */
const processCreditCard = async (details) => {
  // Validate credit card details
  if (!details.cardNumber || !details.expiryDate || !details.cvv) {
    throw new Error('Invalid credit card details');
  }

  // Extract last 4 digits
  const lastFourDigits = details.cardNumber.slice(-4);
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Simulate 80% success rate
  const isSuccess = Math.random() < 0.8;

  return {
    status: isSuccess ? 'Processed' : 'Failed',
    lastFourDigits,
    cardType: details.cardType || 'Visa',
    expiryDate: details.expiryDate
  };
};

/**
 * Process coverage payment with 85% success rate
 */
const processCoverage = async (details) => {
  // Validate coverage details
  if (!details.policyId || !details.serviceReference) {
    throw new Error('Invalid coverage details');
  }

  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simulate 85% success rate
  const isSuccess = Math.random() < 0.85;

  return {
    status: isSuccess ? 'Processed' : 'CoverageRejected',
    policyId: details.policyId,
    serviceReference: details.serviceReference
  };
};

/**
 * Process cash payment (immediate persistence)
 */
const processCash = (details) => {
  // Validate cash details
  if (!details.depositReference) {
    throw new Error('Deposit reference is required');
  }

  return {
    status: 'PendingVerification',
    depositReference: details.depositReference,
    depositSlipUrl: details.depositSlipUrl || 'https://example.com/deposit-slip.pdf'
  };
};

/**
 * Get payments by user ID
 */
const getPaymentsByUserId = async (req, res) => {
  try {
    const userId = 'PAT123'; // Mock user ID
    
    const payments = await Payment.find({ userId })
      .sort({ date: -1 })
      .select('-__v')
      .lean();

    return res.status(200).json({
      success: true,
      data: payments
    });

  } catch (error) {
    console.error('Get payments error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

/**
 * Verify cash payment (Admin action)
 */
const verifyCashPayment = async (req, res) => {
  try {
    const { transactionId, finalStatus } = req.body;

    if (!transactionId || !finalStatus) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID and final status are required'
      });
    }

    if (!['Processed', 'Failed'].includes(finalStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Final status must be either Processed or Failed'
      });
    }

    const payment = await Payment.findOneAndUpdate(
      { transactionId, method: 'Cash' },
      { status: finalStatus },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found or not a cash payment'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Payment status updated successfully',
      data: {
        transactionId: payment.transactionId,
        status: payment.status
      }
    });

  } catch (error) {
    console.error('Verify cash payment error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

// ============================================
// EXPORTS
// ============================================

module.exports = {
  processPayment,
  getPaymentsByUserId,
  verifyCashPayment
};