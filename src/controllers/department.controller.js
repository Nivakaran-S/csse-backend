const Department = require('../models/department.model');

// Get all departments
exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true });
    res.status(200).json({ departments });
  } catch (err) {
    console.error('Error fetching departments:', err);
    res.status(500).json({ error: 'Server error while fetching departments.' });
  }
};

// Seed initial departments (for development/testing)
exports.seedDepartments = async (req, res) => {
  try {
    const departments = [
      {
        name: 'Cardiology',
        description: 'Specialized care in cardiovascular health and heart-related conditions'
      },
      {
        name: 'Neurology',
        description: 'Expert treatment for neurological disorders and brain health'
      },
      {
        name: 'Orthopedics',
        description: 'Comprehensive care for musculoskeletal system and joint health'
      }
    ];

    await Department.deleteMany({});
    await Department.insertMany(departments);
    
    res.status(201).json({ message: 'Departments seeded successfully!', departments });
  } catch (err) {
    console.error('Error seeding departments:', err);
    res.status(500).json({ error: 'Server error while seeding departments.' });
  }
};

// Add this to src/controllers/department.controller.js

// Create a new department
exports.createDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Department name is required.' });
    }

    // Check if department already exists
    const existing = await Department.findOne({ name });
    if (existing) {
      return res.status(409).json({ error: 'Department already exists.' });
    }

    const department = new Department({
      name,
      description: description || '',
      isActive: true
    });

    await department.save();

    res.status(201).json({ 
      message: 'Department created successfully!', 
      department 
    });
  } catch (err) {
    console.error('Error creating department:', err);
    res.status(500).json({ error: 'Server error while creating department.' });
  }
};