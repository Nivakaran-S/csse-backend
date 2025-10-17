const User = require('../models/users.model');
const Doctor = require('../models/doctor.model');

const getDoctorDetailsById = async (id) => {
  try {
    const cleanId = id.replace(/^:/, '').trim();
    const user = await User.findById(cleanId);
    
    if (!user) {
      console.error("User not found");
      return null;
    }

    if (user.role !== 'Doctor') {
      console.error("User is not a doctor");
      return null;
    }

    const doctor = await Doctor.findById(user.entityId);

    return [doctor, user];
  } catch (err) {
    console.error("Error fetching doctor by ID:", err);
    return null;
  }
};

const httpGetDoctorById = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const doctorDetails = await getDoctorDetailsById(doctorId);
    
    if (!doctorDetails) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    
    return res.status(200).json(doctorDetails);
  } catch (err) {
    console.error("Error in getting doctor details", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get all doctors
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ isActive: true });
    res.status(200).json({ doctors });
  } catch (err) {
    console.error('Error fetching doctors:', err);
    res.status(500).json({ error: 'Server error while fetching doctors.' });
  }
};

// Get doctors by department
const getDoctorsByDepartment = async (req, res) => {
  try {
    const { department } = req.params;
    const doctors = await Doctor.find({ department, isActive: true });
    res.status(200).json({ doctors });
  } catch (err) {
    console.error('Error fetching doctors:', err);
    res.status(500).json({ error: 'Server error while fetching doctors.' });
  }
};

// Get available time slots for a specific doctor
const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    const doctor = await Doctor.findOne({ doctorId, isActive: true });
    
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found.' });
    }

    // Get booked slots for this doctor on the specified date
    const Appointment = require('../models/appointment.model');
    const bookedSlots = await Appointment.find({
      doctorId,
      date: new Date(date)
    }).select('timeSlot');

    const bookedTimes = bookedSlots.map(slot => slot.timeSlot);
    const availableSlots = doctor.availableTimeSlots.filter(
      slot => !bookedTimes.includes(slot)
    );

    res.status(200).json({ 
      availableSlots,
      allSlots: doctor.availableTimeSlots,
      bookedSlots: bookedTimes
    });
  } catch (err) {
    console.error('Error fetching available slots:', err);
    res.status(500).json({ error: 'Server error while fetching available slots.' });
  }
};

// Update existing doctor with appointment fields (Migration)
const migrateDoctor = async (req, res) => {
  try {
    const { email } = req.params;
    const { doctorId, department, specialization, availableTimeSlots, workingDays } = req.body;

    const doctor = await Doctor.findOneAndUpdate(
      { email },
      {
        $set: {
          doctorId,
          department,
          specialization,
          availableTimeSlots,
          workingDays,
          isActive: true
        }
      },
      { new: true }
    );

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found.' });
    }

    res.status(200).json({ message: 'Doctor updated successfully!', doctor });
  } catch (err) {
    console.error('Error updating doctor:', err);
    res.status(500).json({ error: 'Server error while updating doctor.' });
  }
};

// Seed initial doctors (for development/testing)
const seedDoctors = async (req, res) => {
  try {
    const doctors = [
      {
        firstName: 'John',
        lastName: 'Smith',
        email: '[email protected]',
        phoneNumber: '+1-555-0101',
        gender: 'Male',
        doctorId: 'D001',
        department: 'Cardiology',
        specialization: 'Heart Surgery',
        availableTimeSlots: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'],
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      },
      {
        firstName: 'Emily',
        lastName: 'Johnson',
        email: '[email protected]',
        phoneNumber: '+1-555-0102',
        gender: 'Female',
        doctorId: 'D002',
        department: 'Cardiology',
        specialization: 'Interventional Cardiology',
        availableTimeSlots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
        workingDays: ['Monday', 'Wednesday', 'Friday']
      },
      {
        firstName: 'Michael',
        lastName: 'Williams',
        email: '[email protected]',
        phoneNumber: '+1-555-0103',
        gender: 'Male',
        doctorId: 'D003',
        department: 'Neurology',
        specialization: 'Brain Surgery',
        availableTimeSlots: ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00'],
        workingDays: ['Tuesday', 'Thursday', 'Friday']
      },
      {
        firstName: 'Sarah',
        lastName: 'Brown',
        email: '[email protected]',
        phoneNumber: '+1-555-0104',
        gender: 'Female',
        doctorId: 'D004',
        department: 'Orthopedics',
        specialization: 'Joint Replacement',
        availableTimeSlots: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      }
    ];

    // Clear existing and insert new
    await Doctor.deleteMany({});
    await Doctor.insertMany(doctors);
    
    res.status(201).json({ message: 'Doctors seeded successfully!', doctors });
  } catch (err) {
    console.error('Error seeding doctors:', err);
    res.status(500).json({ error: 'Server error while seeding doctors.' });
  }
};



module.exports = {
  httpGetDoctorById,
  getAllDoctors,
  getDoctorsByDepartment,
  getAvailableSlots,
  migrateDoctor,
  seedDoctors
};