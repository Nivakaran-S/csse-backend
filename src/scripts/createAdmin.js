const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/users.model.ts');
const Doctor = require('../models/doctor.model.ts');

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ userName: 'admin@medicare.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create admin user
    const adminUser = new User({
      userName: 'admin@medicare.com',
      password: hashedPassword,
      role: 'Admin',
      entityId: null // Admin doesn't need entity reference
    });

    await adminUser.save();
    console.log('Admin user created successfully');
    console.log('Email: admin@medicare.com');
    console.log('Password: admin123');

  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await mongoose.connection.close();
  }
};

createAdmin();