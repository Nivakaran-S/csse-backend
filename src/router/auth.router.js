
const {register,
    login, 
    httpRegisterDoctor,
    httpGetAllUsers,
    httpRegisterPatient,
    httpUpdatePatient,
    httpUpdateDoctor} = require('../controllers/auth.controller')

const express = require('express');

const Userrouter = express.Router();



Userrouter.post('/login', login)
Userrouter.post('/register/doctor', httpRegisterDoctor)
Userrouter.post('/register/patient', httpRegisterPatient)
Userrouter.get('/', httpGetAllUsers)
Userrouter.post('/update/patient', httpUpdatePatient)
Userrouter.post('/update/doctor', httpUpdateDoctor)

module.exports = Userrouter;

