
const {httpGetPatientById} = require('../controllers/patient.controller')

const express = require('express')

const PatientRouter = express.Router()

PatientRouter.get('/:id', httpGetPatientById)


module.exports = PatientRouter