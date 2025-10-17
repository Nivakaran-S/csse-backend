const Admin = require('../models/admin.model');
const User = require('../models/users.model');

// Get all admins
const getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.find({ isActive: true }).select('-__v');
        res.status(200).json(admins);
    } catch (error) {
        console.error('Error fetching admins:', error);
        res.status(500).json({ message: 'Error fetching admins' });
    }
};

// Get admin by ID
const getAdminById = async (req, res) => {
    try {
        const { id } = req.params;
        const admin = await Admin.findById(id).select('-__v');
        
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        
        res.status(200).json(admin);
    } catch (error) {
        console.error('Error fetching admin:', error);
        res.status(500).json({ message: 'Error fetching admin' });
    }
};

// Delete admin (soft delete)
const deleteAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Soft delete the admin
        const admin = await Admin.findByIdAndUpdate(
            id, 
            { isActive: false }, 
            { new: true }
        );
        
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Also deactivate the associated user account
        await User.findOneAndUpdate(
            { entityId: id, role: 'Admin' },
            { $set: { isActive: false } }
        );
        
        res.status(200).json({ message: 'Admin deactivated successfully' });
    } catch (error) {
        console.error('Error deleting admin:', error);
        res.status(500).json({ message: 'Error deleting admin' });
    }
};

module.exports = {
    getAllAdmins,
    getAdminById,
    deleteAdmin
};