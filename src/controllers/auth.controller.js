// src/controllers/auth.controller.js - FIXED LOGIN

const User = require('../models/users.model');
const Patient = require('../models/patient.model');
const Doctor = require('../models/doctor.model');
const Admin = require('../models/admin.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ==================== UNIFIED LOGIN ====================
const login = async (req, res) => {
  try {
    const { userName, password } = req.body; // Keep as userName for backward compatibility

    // Validation
    if (!userName || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Normalize input
    const normalizedInput = userName.toLowerCase().trim();

    console.log("Login attempt for:", normalizedInput);

    // Find user by userName (case-insensitive) - this works with existing data
    const user = await User.findOne({ 
      userName: { $regex: new RegExp(`^${normalizedInput.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
    });
    
    if (!user) {
      console.log('User not found:', normalizedInput);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('User found:', { id: user._id, role: user.role, userName: user.userName });

    // Verify password - THE MOST COMMON ISSUE
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log('Password mismatch for user:', normalizedInput);
      console.log('Stored hash:', user.password);
      console.log('Input password length:', password.length);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if user is active and fetch entity details
    let entityDetails = null;
    let isActive = true;

    try {
      switch (user.role) {
        case 'Patient':
          entityDetails = await Patient.findById(user.entityId)
            .select('firstName lastName email phoneNumber gender');
          break;
        case 'Doctor':
          entityDetails = await Doctor.findById(user.entityId)
            .select('firstName lastName email phoneNumber gender department specialization doctorId isActive');
          isActive = entityDetails?.isActive !== false;
          break;
        case 'Admin':
          entityDetails = await Admin.findById(user.entityId)
            .select('firstName lastName email phoneNumber position permissions isActive');
          isActive = entityDetails?.isActive !== false;
          break;
        default:
          console.warn('Unknown role:', user.role);
      }

      if (!entityDetails) {
        console.error('Entity details not found for user:', user._id);
        return res.status(404).json({ message: 'User profile not found. Please contact support.' });
      }

      if (!isActive) {
        console.log('Inactive user attempted login:', user._id);
        return res.status(403).json({ message: 'Your account has been deactivated. Please contact support.' });
      }

    } catch (err) {
      console.error('Error fetching entity details:', err);
      return res.status(500).json({ message: 'Error retrieving user profile' });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        entityId: user.entityId
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000  // 24 hours
    });

    console.log('Login successful for:', normalizedInput);

    // Return success response
    return res.status(200).json({
      message: "Login successful",
      role: user.role,              
      userId: user._id,
      entityId: user.entityId,
      user: {
        firstName: entityDetails.firstName || 'User',
        lastName: entityDetails.lastName || '',
        email: entityDetails.email || normalizedInput
      }
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: 'Server error during login' });
  }
};

// ==================== PATIENT REGISTRATION ====================
const httpRegisterPatient = async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, password, gender, userName } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !phoneNumber || !password || !gender) {
      return res.status(400).json({ 
        message: 'All fields (firstName, lastName, email, phoneNumber, password, gender) are required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already exists in Patient
    const existingPatient = await Patient.findOne({ 
      email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') }
    });
    if (existingPatient) {
      return res.status(409).json({ message: 'Patient with this email already exists' });
    }

    // Use userName if provided, otherwise use email
    const userNameToUse = userName ? userName.toLowerCase().trim() : normalizedEmail;

    // Check if userName already exists in User
    const existingUser = await User.findOne({ 
      userName: { $regex: new RegExp(`^${userNameToUse}$`, 'i') }
    });
    if (existingUser) {
      return res.status(409).json({ message: 'User account with this email already exists' });
    }

    // Create Patient record first
    const patient = new Patient({
      firstName,
      lastName,
      email: normalizedEmail,
      phoneNumber,
      gender
    });
    await patient.save();
    console.log('Patient created with ID:', patient._id);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User account
    const user = new User({
      userName: userNameToUse,
      password: hashedPassword,
      entityId: patient._id,
      role: 'Patient'
    });
    await user.save();
    console.log('User created with ID:', user._id);

    res.status(201).json({ 
      message: 'Patient registered successfully',
      patient: {
        id: patient._id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email
      }
    });
  } catch (err) {
    console.error("Error in creating patient", err);
    return res.status(500).json({ message: err.message || 'Error creating patient' });
  }
};

// ==================== DOCTOR REGISTRATION ====================
const httpRegisterDoctor = async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      phoneNumber, 
      password, 
      gender,
      doctorId,
      department,
      specialization,
      availableTimeSlots,
      workingDays,
      userName
    } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !phoneNumber || !password || !gender) {
      return res.status(400).json({ 
        message: 'All fields (firstName, lastName, email, phoneNumber, password, gender) are required' 
      });
    }

    if (!department) {
      return res.status(400).json({ message: 'Department is required' });
    }

    if (!doctorId) {
      return res.status(400).json({ message: 'Doctor ID is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already exists in Doctor
    const existingDoctor = await Doctor.findOne({ 
      email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') }
    });
    if (existingDoctor) {
      return res.status(409).json({ message: 'Doctor with this email already exists' });
    }

    // Use userName if provided, otherwise use email
    const userNameToUse = userName ? userName.toLowerCase().trim() : normalizedEmail;

    // Check if userName already exists in User
    const existingUser = await User.findOne({ 
      userName: { $regex: new RegExp(`^${userNameToUse}$`, 'i') }
    });
    if (existingUser) {
      return res.status(409).json({ message: 'User account with this email already exists' });
    }

    // Check if doctorId already exists
    const existingDoctorId = await Doctor.findOne({ doctorId });
    if (existingDoctorId) {
      return res.status(409).json({ message: 'Doctor ID already exists. Please use a unique ID.' });
    }

    // Create Doctor record first
    const doctor = new Doctor({
      firstName,
      lastName,
      email: normalizedEmail,
      phoneNumber,
      gender,
      doctorId,
      department,
      specialization: specialization || '',
      availableTimeSlots: availableTimeSlots || ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'],
      workingDays: workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      isActive: true
    });
    await doctor.save();
    console.log('Doctor created with ID:', doctor._id);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User account
    const user = new User({
      userName: userNameToUse,
      password: hashedPassword,
      entityId: doctor._id,
      role: 'Doctor'
    });
    await user.save();
    console.log('User created with ID:', user._id);

    res.status(201).json({ 
      message: 'Doctor registered successfully',
      doctor: {
        id: doctor._id,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        email: doctor.email,
        doctorId: doctor.doctorId,
        department: doctor.department
      }
    });
  } catch (err) {
    console.error("Error in creating doctor", err);
    return res.status(500).json({ message: err.message || 'Error creating doctor' });
  }
};

// ==================== ADMIN REGISTRATION ====================
const httpRegisterAdmin = async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      phoneNumber, 
      password,
      position,
      permissions,
      userName
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phoneNumber || !password) {
      return res.status(400).json({ 
        message: 'All fields (firstName, lastName, email, phoneNumber, password) are required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already exists in Admin
    const existingAdmin = await Admin.findOne({ 
      email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') }
    });
    if (existingAdmin) {
      return res.status(409).json({ message: 'Admin with this email already exists' });
    }

    // Use userName if provided, otherwise use email
    const userNameToUse = userName ? userName.toLowerCase().trim() : normalizedEmail;

    // Check if userName already exists in User
    const existingUser = await User.findOne({ 
      userName: { $regex: new RegExp(`^${userNameToUse}$`, 'i') }
    });
    if (existingUser) {
      return res.status(409).json({ message: 'User account with this email already exists' });
    }

    // Create Admin record first
    const admin = new Admin({
      firstName,
      lastName,
      email: normalizedEmail,
      phoneNumber,
      position: position || 'Healthcare Manager',
      permissions: permissions || ['schedule_staff', 'manage_staff', 'view_reports', 'manage_departments'],
      isActive: true
    });
    await admin.save();
    console.log('Admin created with ID:', admin._id);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User account
    const user = new User({
      userName: userNameToUse,
      password: hashedPassword,
      entityId: admin._id,
      role: 'Admin'
    });
    await user.save();
    console.log('User created with ID:', user._id);

    res.status(201).json({ 
      message: 'Admin registered successfully',
      admin: {
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        position: admin.position
      }
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ message: error.message || 'Error creating admin' });
  }
};

// ==================== UPDATE FUNCTIONS ====================
const httpUpdatePatient = async (req, res) => {
  try {
    const { patientId, firstName, lastName, email, phoneNumber, gender, userName, password } = req.body;

    if (!patientId) {
      return res.status(400).json({ message: 'Patient ID is required' });
    }

    // Find the user by ID
    const patientUser = await User.findById(patientId);
    if (!patientUser || patientUser.role !== 'Patient') {
      return res.status(404).json({ message: 'Patient user not found' });
    }

    // Update Patient record
    const patient = await Patient.findById(patientUser.entityId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient record not found' });
    }

    if (firstName) patient.firstName = firstName;
    if (lastName) patient.lastName = lastName;
    if (email) patient.email = email.toLowerCase().trim();
    if (phoneNumber) patient.phoneNumber = phoneNumber;
    if (gender) patient.gender = gender;

    await patient.save();

    // Update User record
    if (userName) patientUser.userName = userName.toLowerCase().trim();
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      patientUser.password = hashedPassword;
    }

    await patientUser.save();

    res.status(200).json({ 
      message: 'Patient updated successfully',
      patient: {
        id: patient._id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email
      }
    });
  } catch (err) {
    console.error("Error in updating patient", err);
    return res.status(500).json({ message: err.message || 'Error updating patient' });
  }
};

const httpUpdateDoctor = async (req, res) => {
  try {
    const { 
      doctorId, 
      firstName, 
      lastName, 
      email, 
      phoneNumber, 
      gender,
      department,
      specialization,
      availableTimeSlots,
      workingDays,
      userName, 
      password 
    } = req.body;

    if (!doctorId) {
      return res.status(400).json({ message: 'Doctor ID is required' });
    }

    // Find the user by ID
    const doctorUser = await User.findById(doctorId);
    if (!doctorUser || doctorUser.role !== 'Doctor') {
      return res.status(404).json({ message: 'Doctor user not found' });
    }

    // Update Doctor record
    const doctor = await Doctor.findById(doctorUser.entityId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor record not found' });
    }

    if (firstName) doctor.firstName = firstName;
    if (lastName) doctor.lastName = lastName;
    if (email) doctor.email = email.toLowerCase().trim();
    if (phoneNumber) doctor.phoneNumber = phoneNumber;
    if (gender) doctor.gender = gender;
    if (department) doctor.department = department;
    if (specialization) doctor.specialization = specialization;
    if (availableTimeSlots) doctor.availableTimeSlots = availableTimeSlots;
    if (workingDays) doctor.workingDays = workingDays;

    await doctor.save();

    // Update User record
    if (userName) doctorUser.userName = userName.toLowerCase().trim();
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      doctorUser.password = hashedPassword;
    }

    await doctorUser.save();

    res.status(200).json({ 
      message: 'Doctor updated successfully',
      doctor: {
        id: doctor._id,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        email: doctor.email,
        department: doctor.department
      }
    });
  } catch (err) {
    console.error("Error in updating doctor", err);
    return res.status(500).json({ message: err.message || 'Error updating doctor' });
  }
};

const httpUpdateAdmin = async (req, res) => {
  try {
    const { 
      adminId, 
      firstName, 
      lastName, 
      email, 
      phoneNumber,
      position,
      permissions,
      userName, 
      password 
    } = req.body;

    if (!adminId) {
      return res.status(400).json({ message: 'Admin ID is required' });
    }

    // Find the user by ID
    const adminUser = await User.findById(adminId);
    if (!adminUser || adminUser.role !== 'Admin') {
      return res.status(404).json({ message: 'Admin user not found' });
    }

    // Update Admin record
    const admin = await Admin.findById(adminUser.entityId);
    if (!admin) {
      return res.status(404).json({ message: 'Admin record not found' });
    }

    if (firstName) admin.firstName = firstName;
    if (lastName) admin.lastName = lastName;
    if (email) admin.email = email.toLowerCase().trim();
    if (phoneNumber) admin.phoneNumber = phoneNumber;
    if (position) admin.position = position;
    if (permissions) admin.permissions = permissions;

    await admin.save();

    // Update User record
    if (userName) adminUser.userName = userName.toLowerCase().trim();
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      adminUser.password = hashedPassword;
    }

    await adminUser.save();

    res.status(200).json({ 
      message: 'Admin updated successfully',
      admin: {
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        position: admin.position
      }
    });
  } catch (err) {
    console.error("Error in updating admin", err);
    return res.status(500).json({ message: err.message || 'Error updating admin' });
  }
};

// ==================== GET ALL USERS ====================
const httpGetAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdTimestamp: -1 }).lean();

    const populatedUsers = await Promise.all(
      users.map(async (user) => {
        const role = user.role;
        const userId = user.entityId;

        let details = null;

        try {
          if (role === 'Doctor') {
            details = await Doctor.findById(userId)
              .select('firstName lastName email phoneNumber gender doctorId department specialization createdTimestamp')
              .lean();
          } else if (role === 'Patient') {
            details = await Patient.findById(userId)
              .select('firstName lastName email phoneNumber gender createdTimestamp')
              .lean();
          } else if (role === 'Admin') {
            details = await Admin.findById(userId)
              .select('firstName lastName email phoneNumber position permissions createdTimestamp')
              .lean();
          }
        } catch (err) {
          console.error(`Error populating user ${user._id}:`, err);
        }

        return {
          ...user,
          userDetails: details || null,
        };
      })
    );

    res.status(200).json(populatedUsers);
  } catch (err) {
    console.error("Error in getting all users", err);
    return res.status(500).json({ message: err.message || 'Error fetching users' });
  }
};

module.exports = {
  login,
  httpRegisterDoctor,
  httpRegisterPatient,
  httpRegisterAdmin,
  httpGetAllUsers,
  httpUpdatePatient,
  httpUpdateDoctor,
  httpUpdateAdmin
};
