const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
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
    position: {
        type: String,
        required: true,
        default: 'Healthcare Manager'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    permissions: [{
        type: String,
        enum: ['schedule_staff', 'manage_staff', 'view_reports', 'manage_departments']
    }],
    createdTimestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Admin', adminSchema);
