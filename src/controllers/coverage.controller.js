const CoverageApplication = require('../models/coverageApplication.model');
const User = require('../models/users.model');

// Apply for healthcare coverage
const applyForCoverage = async (req, res) => {
  try {
    const { userId, policyId, provider, coverageType } = req.body;

    if (!userId || !policyId || !provider || !coverageType) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate userId format (should be a valid MongoDB ObjectId)
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user already has a pending application
    const existingApplication = await CoverageApplication.findOne({
      userId,
      status: 'Pending'
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending coverage application'
      });
    }

    // Create new coverage application
    const coverageApplication = new CoverageApplication({
      userId,
      patientName: user.userName,
      patientEmail: user.email || 'Not provided',
      policyId,
      provider,
      coverageType,
      status: 'Pending'
    });

    await coverageApplication.save();

    return res.status(201).json({
      success: true,
      message: 'Coverage application submitted successfully',
      data: {
        id: coverageApplication._id,
        status: coverageApplication.status,
        applicationDate: coverageApplication.applicationDate
      }
    });
  } catch (err) {
    console.log("Error applying for coverage", err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Error applying for coverage'
    });
  }
};

// Get user's coverage application status
const getCoverageStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId format
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    const application = await CoverageApplication.findOne({ userId })
      .sort({ applicationDate: -1 });

    if (!application) {
      // Return success with None status instead of 404
      return res.status(200).json({
        success: true,
        data: {
          status: 'None',
          message: 'No coverage application found. Please apply for coverage.'
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: application._id,
        status: application.status,
        policyId: application.policyId,
        provider: application.provider,
        coverageType: application.coverageType,
        applicationDate: application.applicationDate,
        adminNotes: application.adminNotes,
        approvedDate: application.approvedDate
      }
    });
  } catch (err) {
    console.log("Error getting coverage status", err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Error getting coverage status'
    });
  }
};

// Get all coverage applications for admin
const getAllCoverageApplications = async (req, res) => {
  try {
    const applications = await CoverageApplication.find()
      .populate('userId', 'userName firstName lastName email phoneNumber')
      .sort({ applicationDate: -1 });

    const applicationList = applications.map(app => ({
      id: app._id,
      userId: app.userId,
      patientName: app.patientName,
      patientEmail: app.patientEmail,
      policyId: app.policyId,
      provider: app.provider,
      coverageType: app.coverageType,
      status: app.status,
      applicationDate: app.applicationDate,
      adminNotes: app.adminNotes,
      approvedBy: app.approvedBy,
      approvedDate: app.approvedDate
    }));

    return res.status(200).json({
      success: true,
      data: applicationList
    });
  } catch (err) {
    console.log("Error getting coverage applications", err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Error getting coverage applications'
    });
  }
};

// Update coverage application status (admin only)
const updateCoverageStatus = async (req, res) => {
  try {
    const { applicationId, status, adminNotes, approvedBy } = req.body;

    if (!applicationId || !status) {
      return res.status(400).json({
        success: false,
        message: 'Application ID and status are required'
      });
    }

    const validStatuses = ['Pending', 'Approved', 'Declined'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: Pending, Approved, Declined'
      });
    }

    const updateData = {
      status,
      adminNotes: adminNotes || ''
    };

    if (status === 'Approved' || status === 'Declined') {
      updateData.approvedBy = approvedBy;
      updateData.approvedDate = new Date();
    }

    const application = await CoverageApplication.findByIdAndUpdate(
      applicationId,
      updateData,
      { new: true }
    ).populate('userId', 'userName firstName lastName email phoneNumber');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Coverage application not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: `Coverage application ${status.toLowerCase()} successfully`,
      data: {
        id: application._id,
        status: application.status,
        patientName: application.patientName,
        adminNotes: application.adminNotes,
        approvedDate: application.approvedDate
      }
    });
  } catch (err) {
    console.log("Error updating coverage status", err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Error updating coverage status'
    });
  }
};

module.exports = {
  applyForCoverage,
  getCoverageStatus,
  getAllCoverageApplications,
  updateCoverageStatus
};