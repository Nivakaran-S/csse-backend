const Staff = require('../models/staff.model');
const Schedule = require('../models/schedule.model');
const Department = require('../models/department.model');

// Get all staff members
const getAllStaff = async (req, res) => {
    try {
        const staff = await Staff.find({ isActive: true })
            .populate('department', 'name')
            .sort({ firstName: 1 });
        res.status(200).json(staff);
    } catch (error) {
        console.error('Error fetching staff:', error);
        res.status(500).json({ message: 'Error fetching staff members' });
    }
};

// Get staff by department
const getStaffByDepartment = async (req, res) => {
    try {
        const { departmentId } = req.params;
        const staff = await Staff.find({ 
            department: departmentId, 
            isActive: true 
        }).populate('department', 'name');
        res.status(200).json(staff);
    } catch (error) {
        console.error('Error fetching staff by department:', error);
        res.status(500).json({ message: 'Error fetching staff by department' });
    }
};

// Create new staff member
const createStaff = async (req, res) => {
    try {
        const staffData = req.body;
        const staff = new Staff(staffData);
        await staff.save();
        await staff.populate('department', 'name');
        res.status(201).json(staff);
    } catch (error) {
        console.error('Error creating staff:', error);
        res.status(500).json({ message: 'Error creating staff member' });
    }
};

// Update staff member
const updateStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const staff = await Staff.findByIdAndUpdate(id, req.body, { new: true })
            .populate('department', 'name');
        if (!staff) {
            return res.status(404).json({ message: 'Staff member not found' });
        }
        res.status(200).json(staff);
    } catch (error) {
        console.error('Error updating staff:', error);
        res.status(500).json({ message: 'Error updating staff member' });
    }
};

// Delete staff member (soft delete)
const deleteStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const staff = await Staff.findByIdAndUpdate(id, { isActive: false }, { new: true });
        if (!staff) {
            return res.status(404).json({ message: 'Staff member not found' });
        }
        res.status(200).json({ message: 'Staff member deactivated successfully' });
    } catch (error) {
        console.error('Error deleting staff:', error);
        res.status(500).json({ message: 'Error deleting staff member' });
    }
};

module.exports = {
    getAllStaff,
    getStaffByDepartment,
    createStaff,
    updateStaff,
    deleteStaff
};
