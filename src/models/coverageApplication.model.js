const mongoose = require('mongoose');
const { Schema } = mongoose;

// ============================================
// COVERAGE APPLICATION MODEL
// ============================================

const CoverageApplicationSchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  patientName: { 
    type: String, 
    required: true 
  },
  patientEmail: { 
    type: String, 
    required: true 
  },
  policyId: { 
    type: String, 
    required: true 
  },
  provider: { 
    type: String, 
    required: true 
  },
  coverageType: { 
    type: String, 
    required: true,
    enum: ['Full', 'Partial', 'Emergency Only', 'Dental', 'Vision']
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Declined'], 
    default: 'Pending' 
  },
  adminNotes: { 
    type: String 
  },
  applicationDate: { 
    type: Date, 
    default: Date.now 
  },
  approvedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  },
  approvedDate: { 
    type: Date 
  }
});

module.exports = mongoose.model('CoverageApplication', CoverageApplicationSchema);
