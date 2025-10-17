const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userName: {  // Keep as userName (camelCase)
        type: String,
        required: true,
        unique: true   
    },
    password: {
        type: String,
        required: true
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'role',
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ['Patient', 'Doctor', 'Admin'],   
    },
    createdTimestamp: {
        type: Date,
        default: Date.now  // ✅ FIXED: Changed from Date.now() to Date.now
    }
});

module.exports = mongoose.model('User', userSchema);