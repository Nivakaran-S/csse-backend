const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
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
        unique: true
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        enum: ['Manager', 'Nurse', 'Receptionist', 'Technician', 'Administrator', 'Doctor']
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    availability: [{
        dayOfWeek: {
            type: String,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        },
        startTime: String,
        endTime: String,
        isAvailable: {
            type: Boolean,
            default: true
        }
    }],
    createdTimestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Staff', staffSchema);
