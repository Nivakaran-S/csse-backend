const express = require('express');
const { httpGetDoctorById } = require('../controllers/doctor.controller');
const { 
  getAllDoctors, 
  getDoctorsByDepartment, 
  getAvailableSlots,
  migrateDoctor,
  seedDoctors 
} = require('../controllers/doctor.controller');

const DoctorRouter = express.Router();

// Specific routes MUST come before parameterized routes
DoctorRouter.get('/doctors', getAllDoctors);
DoctorRouter.get('/doctors/department/:department', getDoctorsByDepartment);
DoctorRouter.post('/doctors/seed', seedDoctors);
DoctorRouter.put('/doctors/migrate/:email', migrateDoctor);
DoctorRouter.get('/doctors/:doctorId/slots', getAvailableSlots);

// Generic parameterized route comes last
DoctorRouter.get('/:id', httpGetDoctorById);

module.exports = DoctorRouter;