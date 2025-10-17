const {
    login, 
    httpRegisterDoctor,
    httpRegisterPatient,
    httpRegisterAdmin,
    httpGetAllUsers,
    httpUpdatePatient,
    httpUpdateDoctor,
    httpUpdateAdmin
} = require('../controllers/auth.controller');

const express = require('express');

const Userrouter = express.Router();

// ==================== LOGIN ====================
Userrouter.post('/login', login);

// ==================== REGISTRATION ROUTES ====================
Userrouter.post('/register/patient', httpRegisterPatient);
Userrouter.post('/register/doctor', httpRegisterDoctor);
Userrouter.post('/register/admin', httpRegisterAdmin);

// ==================== UPDATE ROUTES ====================
Userrouter.put('/update/patient', httpUpdatePatient);
Userrouter.put('/update/doctor', httpUpdateDoctor);
Userrouter.put('/update/admin', httpUpdateAdmin);

// ==================== GET ALL USERS ====================
Userrouter.get('/', httpGetAllUsers);

module.exports = Userrouter;