const express = require('express');
const {
    getAllStaff,
    getStaffByDepartment,
    createStaff,
    updateStaff,
    deleteStaff
} = require('../controllers/staff.controller');

const staffRouter = express.Router();

// Staff routes
staffRouter.get('/', getAllStaff);
staffRouter.get('/department/:departmentId', getStaffByDepartment);
staffRouter.post('/', createStaff);
staffRouter.put('/:id', updateStaff);
staffRouter.delete('/:id', deleteStaff);

module.exports = staffRouter;
