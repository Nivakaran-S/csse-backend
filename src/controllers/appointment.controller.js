const Appointment = require('../models/appointment.model');

exports.createAppointment = async (req, res) => {
  try {
    const { patientId, doctorId, department, date, timeSlot, patientDetails } = req.body;

    // Validation
    if (!patientId || !doctorId || !department || !date || !timeSlot) {
      return res.status(400).json({ error: 'All appointment fields are required.' });
    }

    if (!patientDetails || !patientDetails.fullName || !patientDetails.email || !patientDetails.phone) {
      return res.status(400).json({ error: 'Patient details (name, email, phone) are required.' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(patientDetails.email)) {
      return res.status(400).json({ error: 'Invalid email address.' });
    }

    // Normalize email to lowercase for consistency
    patientDetails.email = patientDetails.email.toLowerCase().trim();

    // Check if time slot is already booked
    const existing = await Appointment.findOne({ 
      doctorId, 
      date: new Date(date), 
      timeSlot 
    });
    
    if (existing) {
      return res.status(409).json({ error: 'This time slot is already booked. Please select another time.' });
    }

    // Create new appointment
    const appointment = new Appointment({ 
      patientId, 
      doctorId, 
      department, 
      date: new Date(date), 
      timeSlot,
      patientDetails
    });
    
    await appointment.save();

    res.status(201).json({ 
      message: 'Appointment confirmed successfully!', 
      appointment 
    });
    
  } catch (err) {
    console.error('Error creating appointment:', err);
    res.status(500).json({ error: 'Server error while saving appointment. Please try again.' });
  }
};

// Get all appointments
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ date: 1, timeSlot: 1 });
    res.status(200).json({ appointments });
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ error: 'Server error while fetching appointments.' });
  }
};

// Get appointments by patient ID (UPDATED - now uses patientId instead of email)
exports.getAppointmentsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    if (!patientId) {
      return res.status(400).json({ error: 'Patient ID is required.' });
    }

    const appointments = await Appointment.find({ 
      patientId: patientId 
    }).sort({ date: 1, timeSlot: 1 });
    
    res.status(200).json({ appointments });
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ error: 'Server error while fetching appointments.' });
  }
};

// OPTIONAL: Keep this as backup if you still want to search by email
exports.getAppointmentsByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase().trim();

    const appointments = await Appointment.find({ 
      'patientDetails.email': normalizedEmail 
    }).sort({ date: 1, timeSlot: 1 });
    
    res.status(200).json({ appointments });
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ error: 'Server error while fetching appointments.' });
  }
};

// Get appointments by doctor
exports.getAppointmentsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    if (!doctorId) {
      return res.status(400).json({ error: 'Doctor ID is required.' });
    }

    const appointments = await Appointment.find({ doctorId }).sort({ date: 1, timeSlot: 1 });
    res.status(200).json({ appointments });
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ error: 'Server error while fetching appointments.' });
  }
};