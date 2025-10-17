const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const User = require('../models/users.model');
const Admin = require('../models/admin.model');
const Staff = require('../models/staff.model');
const Department = require('../models/department.model');
const Schedule = require('../models/schedule.model');

async function seedData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Admin.deleteMany({});
    await Staff.deleteMany({});
    await Department.deleteMany({});
    await Schedule.deleteMany({});
    
    // Drop indexes to avoid conflicts
    try {
      await Staff.collection.dropIndexes();
    } catch (error) {
      console.log('No indexes to drop or error dropping indexes:', error.message);
    }
    
    console.log('Cleared existing data');

    // Create departments
    const departments = await Department.insertMany([
      { name: 'Emergency', description: 'Emergency Department' },
      { name: 'Cardiology', description: 'Heart and Cardiovascular Care' },
      { name: 'Pediatrics', description: 'Children\'s Healthcare' },
      { name: 'Surgery', description: 'Surgical Services' },
      { name: 'Radiology', description: 'Medical Imaging' }
    ]);
    console.log('Created departments');

    // Create admin
    const admin = new Admin({
      firstName: 'John',
      lastName: 'Smith',
      email: 'admin@medicare.com',
      phoneNumber: '555-0101',
      position: 'Healthcare Manager',
      permissions: ['schedule_staff', 'manage_staff', 'view_reports', 'manage_departments']
    });
    await admin.save();

    // Create admin user account
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = new User({
      userName: 'admin@medicare.com',
      password: hashedPassword,
      entityId: admin._id,
      role: 'Admin'
    });
    await adminUser.save();
    console.log('Created admin user');

    // Create staff members
    const staffMembers = await Staff.insertMany([
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@medicare.com',
        phoneNumber: '555-0102',
        role: 'Nurse',
        department: departments[0]._id, // Emergency
        availability: [
          { dayOfWeek: 'Monday', startTime: '08:00', endTime: '16:00', isAvailable: true },
          { dayOfWeek: 'Tuesday', startTime: '08:00', endTime: '16:00', isAvailable: true },
          { dayOfWeek: 'Wednesday', startTime: '08:00', endTime: '16:00', isAvailable: true },
          { dayOfWeek: 'Thursday', startTime: '08:00', endTime: '16:00', isAvailable: true },
          { dayOfWeek: 'Friday', startTime: '08:00', endTime: '16:00', isAvailable: true }
        ]
      },
      {
        firstName: 'Michael',
        lastName: 'Brown',
        email: 'michael.brown@medicare.com',
        phoneNumber: '555-0103',
        role: 'Technician',
        department: departments[4]._id, // Radiology
        availability: [
          { dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00', isAvailable: true },
          { dayOfWeek: 'Tuesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
          { dayOfWeek: 'Wednesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
          { dayOfWeek: 'Thursday', startTime: '09:00', endTime: '17:00', isAvailable: true },
          { dayOfWeek: 'Friday', startTime: '09:00', endTime: '17:00', isAvailable: true }
        ]
      },
      {
        firstName: 'Emily',
        lastName: 'Davis',
        email: 'emily.davis@medicare.com',
        phoneNumber: '555-0104',
        role: 'Receptionist',
        department: departments[1]._id, // Cardiology
        availability: [
          { dayOfWeek: 'Monday', startTime: '08:00', endTime: '16:00', isAvailable: true },
          { dayOfWeek: 'Tuesday', startTime: '08:00', endTime: '16:00', isAvailable: true },
          { dayOfWeek: 'Wednesday', startTime: '08:00', endTime: '16:00', isAvailable: true },
          { dayOfWeek: 'Thursday', startTime: '08:00', endTime: '16:00', isAvailable: true },
          { dayOfWeek: 'Friday', startTime: '08:00', endTime: '16:00', isAvailable: true }
        ]
      },
      {
        firstName: 'Robert',
        lastName: 'Wilson',
        email: 'robert.wilson@medicare.com',
        phoneNumber: '555-0105',
        role: 'Manager',
        department: departments[2]._id, // Pediatrics
        availability: [
          { dayOfWeek: 'Monday', startTime: '07:00', endTime: '15:00', isAvailable: true },
          { dayOfWeek: 'Tuesday', startTime: '07:00', endTime: '15:00', isAvailable: true },
          { dayOfWeek: 'Wednesday', startTime: '07:00', endTime: '15:00', isAvailable: true },
          { dayOfWeek: 'Thursday', startTime: '07:00', endTime: '15:00', isAvailable: true },
          { dayOfWeek: 'Friday', startTime: '07:00', endTime: '15:00', isAvailable: true }
        ]
      },
      {
        firstName: 'Lisa',
        lastName: 'Anderson',
        email: 'lisa.anderson@medicare.com',
        phoneNumber: '555-0106',
        role: 'Nurse',
        department: departments[3]._id, // Surgery
        availability: [
          { dayOfWeek: 'Monday', startTime: '06:00', endTime: '14:00', isAvailable: true },
          { dayOfWeek: 'Tuesday', startTime: '06:00', endTime: '14:00', isAvailable: true },
          { dayOfWeek: 'Wednesday', startTime: '06:00', endTime: '14:00', isAvailable: true },
          { dayOfWeek: 'Thursday', startTime: '06:00', endTime: '14:00', isAvailable: true },
          { dayOfWeek: 'Friday', startTime: '06:00', endTime: '14:00', isAvailable: true }
        ]
      },
      // Additional Emergency Department Staff
      {
        firstName: 'David',
        lastName: 'Martinez',
        email: 'david.martinez@medicare.com',
        phoneNumber: '555-0107',
        role: 'Doctor',
        department: departments[0]._id, // Emergency
        availability: [
          { dayOfWeek: 'Monday', startTime: '20:00', endTime: '08:00', isAvailable: true },
          { dayOfWeek: 'Tuesday', startTime: '20:00', endTime: '08:00', isAvailable: true },
          { dayOfWeek: 'Wednesday', startTime: '20:00', endTime: '08:00', isAvailable: true },
          { dayOfWeek: 'Thursday', startTime: '20:00', endTime: '08:00', isAvailable: true },
          { dayOfWeek: 'Friday', startTime: '20:00', endTime: '08:00', isAvailable: true }
        ]
      },
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@medicare.com',
        phoneNumber: '555-0108',
        role: 'Nurse',
        department: departments[0]._id, // Emergency
        availability: [
          { dayOfWeek: 'Monday', startTime: '14:00', endTime: '22:00', isAvailable: true },
          { dayOfWeek: 'Tuesday', startTime: '14:00', endTime: '22:00', isAvailable: true },
          { dayOfWeek: 'Wednesday', startTime: '14:00', endTime: '22:00', isAvailable: true },
          { dayOfWeek: 'Thursday', startTime: '14:00', endTime: '22:00', isAvailable: true },
          { dayOfWeek: 'Friday', startTime: '14:00', endTime: '22:00', isAvailable: true }
        ]
      },
      // Additional Cardiology Staff
      {
        firstName: 'Dr. James',
        lastName: 'Thompson',
        email: 'james.thompson@medicare.com',
        phoneNumber: '555-0109',
        role: 'Doctor',
        department: departments[1]._id, // Cardiology
        availability: [
          { dayOfWeek: 'Monday', startTime: '08:00', endTime: '16:00', isAvailable: true },
          { dayOfWeek: 'Tuesday', startTime: '08:00', endTime: '16:00', isAvailable: true },
          { dayOfWeek: 'Wednesday', startTime: '08:00', endTime: '16:00', isAvailable: true },
          { dayOfWeek: 'Thursday', startTime: '08:00', endTime: '16:00', isAvailable: true },
          { dayOfWeek: 'Friday', startTime: '08:00', endTime: '16:00', isAvailable: true }
        ]
      },
      {
        firstName: 'Maria',
        lastName: 'Garcia',
        email: 'maria.garcia@medicare.com',
        phoneNumber: '555-0110',
        role: 'Technician',
        department: departments[1]._id, // Cardiology
        availability: [
          { dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00', isAvailable: true },
          { dayOfWeek: 'Tuesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
          { dayOfWeek: 'Wednesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
          { dayOfWeek: 'Thursday', startTime: '09:00', endTime: '17:00', isAvailable: true },
          { dayOfWeek: 'Friday', startTime: '09:00', endTime: '17:00', isAvailable: true }
        ]
      },
      // Additional Pediatrics Staff
      {
        firstName: 'Dr. Jennifer',
        lastName: 'Lee',
        email: 'jennifer.lee@medicare.com',
        phoneNumber: '555-0111',
        role: 'Doctor',
        department: departments[2]._id, // Pediatrics
        availability: [
          { dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00', isAvailable: true },
          { dayOfWeek: 'Tuesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
          { dayOfWeek: 'Wednesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
          { dayOfWeek: 'Thursday', startTime: '09:00', endTime: '17:00', isAvailable: true },
          { dayOfWeek: 'Friday', startTime: '09:00', endTime: '17:00', isAvailable: true }
        ]
      },
      {
        firstName: 'Kevin',
        lastName: 'White',
        email: 'kevin.white@medicare.com',
        phoneNumber: '555-0112',
        role: 'Nurse',
        department: departments[2]._id, // Pediatrics
        availability: [
          { dayOfWeek: 'Monday', startTime: '07:00', endTime: '15:00', isAvailable: true },
          { dayOfWeek: 'Tuesday', startTime: '07:00', endTime: '15:00', isAvailable: true },
          { dayOfWeek: 'Wednesday', startTime: '07:00', endTime: '15:00', isAvailable: true },
          { dayOfWeek: 'Thursday', startTime: '07:00', endTime: '15:00', isAvailable: true },
          { dayOfWeek: 'Friday', startTime: '07:00', endTime: '15:00', isAvailable: true }
        ]
      },
      // Additional Surgery Staff
      {
        firstName: 'Dr. Michael',
        lastName: 'Chen',
        email: 'michael.chen@medicare.com',
        phoneNumber: '555-0113',
        role: 'Doctor',
        department: departments[3]._id, // Surgery
        availability: [
          { dayOfWeek: 'Monday', startTime: '07:00', endTime: '15:00', isAvailable: true },
          { dayOfWeek: 'Tuesday', startTime: '07:00', endTime: '15:00', isAvailable: true },
          { dayOfWeek: 'Wednesday', startTime: '07:00', endTime: '15:00', isAvailable: true },
          { dayOfWeek: 'Thursday', startTime: '07:00', endTime: '15:00', isAvailable: true },
          { dayOfWeek: 'Friday', startTime: '07:00', endTime: '15:00', isAvailable: true }
        ]
      },
      {
        firstName: 'Amanda',
        lastName: 'Taylor',
        email: 'amanda.taylor@medicare.com',
        phoneNumber: '555-0114',
        role: 'Technician',
        department: departments[3]._id, // Surgery
        availability: [
          { dayOfWeek: 'Monday', startTime: '08:00', endTime: '16:00', isAvailable: true },
          { dayOfWeek: 'Tuesday', startTime: '08:00', endTime: '16:00', isAvailable: true },
          { dayOfWeek: 'Wednesday', startTime: '08:00', endTime: '16:00', isAvailable: true },
          { dayOfWeek: 'Thursday', startTime: '08:00', endTime: '16:00', isAvailable: true },
          { dayOfWeek: 'Friday', startTime: '08:00', endTime: '16:00', isAvailable: true }
        ]
      },
      // Additional Radiology Staff
      {
        firstName: 'Dr. Patricia',
        lastName: 'Williams',
        email: 'patricia.williams@medicare.com',
        phoneNumber: '555-0115',
        role: 'Doctor',
        department: departments[4]._id, // Radiology
        availability: [
          { dayOfWeek: 'Monday', startTime: '08:00', endTime: '16:00', isAvailable: true },
          { dayOfWeek: 'Tuesday', startTime: '08:00', endTime: '16:00', isAvailable: true },
          { dayOfWeek: 'Wednesday', startTime: '08:00', endTime: '16:00', isAvailable: true },
          { dayOfWeek: 'Thursday', startTime: '08:00', endTime: '16:00', isAvailable: true },
          { dayOfWeek: 'Friday', startTime: '08:00', endTime: '16:00', isAvailable: true }
        ]
      },
      {
        firstName: 'Christopher',
        lastName: 'Brown',
        email: 'christopher.brown@medicare.com',
        phoneNumber: '555-0116',
        role: 'Technician',
        department: departments[4]._id, // Radiology
        availability: [
          { dayOfWeek: 'Monday', startTime: '10:00', endTime: '18:00', isAvailable: true },
          { dayOfWeek: 'Tuesday', startTime: '10:00', endTime: '18:00', isAvailable: true },
          { dayOfWeek: 'Wednesday', startTime: '10:00', endTime: '18:00', isAvailable: true },
          { dayOfWeek: 'Thursday', startTime: '10:00', endTime: '18:00', isAvailable: true },
          { dayOfWeek: 'Friday', startTime: '10:00', endTime: '18:00', isAvailable: true }
        ]
      },
      // Additional Support Staff
      {
        firstName: 'Rachel',
        lastName: 'Davis',
        email: 'rachel.davis@medicare.com',
        phoneNumber: '555-0117',
        role: 'Receptionist',
        department: departments[0]._id, // Emergency
        availability: [
          { dayOfWeek: 'Monday', startTime: '06:00', endTime: '14:00', isAvailable: true },
          { dayOfWeek: 'Tuesday', startTime: '06:00', endTime: '14:00', isAvailable: true },
          { dayOfWeek: 'Wednesday', startTime: '06:00', endTime: '14:00', isAvailable: true },
          { dayOfWeek: 'Thursday', startTime: '06:00', endTime: '14:00', isAvailable: true },
          { dayOfWeek: 'Friday', startTime: '06:00', endTime: '14:00', isAvailable: true }
        ]
      },
      {
        firstName: 'Daniel',
        lastName: 'Miller',
        email: 'daniel.miller@medicare.com',
        phoneNumber: '555-0118',
        role: 'Manager',
        department: departments[1]._id, // Cardiology
        availability: [
          { dayOfWeek: 'Monday', startTime: '08:00', endTime: '16:00', isAvailable: true },
          { dayOfWeek: 'Tuesday', startTime: '08:00', endTime: '16:00', isAvailable: true },
          { dayOfWeek: 'Wednesday', startTime: '08:00', endTime: '16:00', isAvailable: true },
          { dayOfWeek: 'Thursday', startTime: '08:00', endTime: '16:00', isAvailable: true },
          { dayOfWeek: 'Friday', startTime: '08:00', endTime: '16:00', isAvailable: true }
        ]
      },
      {
        firstName: 'Jessica',
        lastName: 'Wilson',
        email: 'jessica.wilson@medicare.com',
        phoneNumber: '555-0119',
        role: 'Nurse',
        department: departments[4]._id, // Radiology
        availability: [
          { dayOfWeek: 'Monday', startTime: '12:00', endTime: '20:00', isAvailable: true },
          { dayOfWeek: 'Tuesday', startTime: '12:00', endTime: '20:00', isAvailable: true },
          { dayOfWeek: 'Wednesday', startTime: '12:00', endTime: '20:00', isAvailable: true },
          { dayOfWeek: 'Thursday', startTime: '12:00', endTime: '20:00', isAvailable: true },
          { dayOfWeek: 'Friday', startTime: '12:00', endTime: '20:00', isAvailable: true }
        ]
      }
    ]);
    console.log('Created staff members');

    // Create some sample schedules
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const sampleSchedules = await Schedule.insertMany([
      {
        staffId: staffMembers[0]._id,
        departmentId: departments[0]._id,
        shiftDate: tomorrow,
        shiftType: 'Morning',
        startTime: '08:00',
        endTime: '16:00',
        status: 'Scheduled',
        createdBy: adminUser._id,
        notes: 'Regular morning shift'
      },
      {
        staffId: staffMembers[1]._id,
        departmentId: departments[4]._id,
        shiftDate: nextWeek,
        shiftType: 'Afternoon',
        startTime: '12:00',
        endTime: '20:00',
        status: 'Scheduled',
        createdBy: adminUser._id,
        notes: 'Radiology afternoon shift'
      },
      {
        staffId: staffMembers[2]._id,
        departmentId: departments[1]._id,
        shiftDate: tomorrow,
        shiftType: 'Morning',
        startTime: '09:00',
        endTime: '17:00',
        status: 'Confirmed',
        createdBy: adminUser._id,
        notes: 'Cardiology reception'
      }
    ]);
    console.log('Created sample schedules');

    console.log('Data seeding completed successfully!');
    console.log('\nAdmin Login Credentials:');
    console.log('Email: admin@medicare.com');
    console.log('Password: admin123');
    console.log('\nYou can now login to the admin panel at /admin');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding function
seedData();
