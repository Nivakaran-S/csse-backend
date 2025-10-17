const express = require('express');
const {
  applyForCoverage,
  getCoverageStatus,
  getAllCoverageApplications,
  updateCoverageStatus
} = require('../controllers/coverage.controller');

const coverageRouter = express.Router();

// User routes
coverageRouter.post('/apply', applyForCoverage);
coverageRouter.get('/status/:userId', getCoverageStatus);

// Admin routes
coverageRouter.get('/admin/applications', getAllCoverageApplications);
coverageRouter.put('/admin/status', updateCoverageStatus);

module.exports = coverageRouter;