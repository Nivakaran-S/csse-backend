const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',
        required: true
    },
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    shiftDate: {
        type: Date,
        required: true
    },
    shiftType: {
        type: String,
        required: true,
        enum: ['Morning', 'Afternoon', 'Evening', 'Night', 'Full Day']
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Scheduled', 'Confirmed', 'Cancelled', 'Completed'],
        default: 'Scheduled'
    },
    notes: {
        type: String,
        default: ''
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdTimestamp: {
        type: Date,
        default: Date.now
    },
    updatedTimestamp: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient querying
scheduleSchema.index({ staffId: 1, shiftDate: 1 });
scheduleSchema.index({ departmentId: 1, shiftDate: 1 });
scheduleSchema.index({ shiftDate: 1, status: 1 });

module.exports = mongoose.model('Schedule', scheduleSchema);
