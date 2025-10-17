const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    }, 
    email: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        required: true,
    },
    createdTimestamp: {
        type: Date,
        default: Date.now
    },
    // New fields for appointment system
    doctorId: {
        type: String,
        required: true,
        unique: true
    },
    department: {
        type: String,
        required: true
    },
    specialization: {
        type: String,
        default: ''
    },
    availableTimeSlots: [{
        type: String
    }],
    workingDays: [{
        type: String
    }],
    isActive: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('Doctor', DoctorSchema);
