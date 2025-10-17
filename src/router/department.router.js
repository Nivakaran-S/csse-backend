const express = require('express');
const router = express.Router();
const { 
  getAllDepartments, 
  createDepartment,  // ADD THIS
  seedDepartments 
} = require('../controllers/department.controller');

// Note: Routes are prefixed with /api/department in app.js
router.get('/', getAllDepartments);
router.post('/', createDepartment);  // ADD THIS LINE
router.post('/seed', seedDepartments);

module.exports = router;