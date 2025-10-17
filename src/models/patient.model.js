const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
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
        default: Date.now  // ✅ FIXED: Changed from Date.now() to Date.now
    }
});

module.exports = mongoose.model('Patient', PatientSchema);