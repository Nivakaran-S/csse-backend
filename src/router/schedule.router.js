const express = require('express');
const {
    getAllSchedules,
    getSchedulesByDateRange,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    getAvailableStaff
} = require('../controllers/schedule.controller');

const scheduleRouter = express.Router();

// Schedule routes
scheduleRouter.get('/', getAllSchedules);
scheduleRouter.get('/date-range/:startDate/:endDate', getSchedulesByDateRange);
scheduleRouter.get('/available-staff', getAvailableStaff);
scheduleRouter.post('/', createSchedule);
scheduleRouter.put('/:id', updateSchedule);
scheduleRouter.delete('/:id', deleteSchedule);

module.exports = scheduleRouter;
