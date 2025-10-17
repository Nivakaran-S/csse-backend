const bcrypt = require("bcryptjs");

const User = require("./users.model");
const Doctor = require('./doctor.model');
const Patient = require('./patient.model');

const createDoctor = async (doctorData) => {
  try {
    const newDoctor = new Doctor(doctorData);
    await newDoctor.save();
    return newDoctor._id;
  } catch (err) {
    throw new Error(`Failed to create doctor: ${err.message}`);
  }
};

const createPatient = async (patientData) => {
  try {
    const newPatient = new Patient(patientData);
    await newPatient.save();
    return newPatient._id;
  } catch (err) {
    throw new Error(`Failed to create patient: ${err.message}`);
  }
};

const registerDoctor = async (data) => {
  try {
    console.log("Register Doctor - Received data:", data);
    
    // ✅ Validate userName exists
    if (!data.userName) {
      throw new Error("userName is required");
    }

    // ✅ Validate department and doctorId
    if (!data.department) {
      throw new Error("department is required");
    }

    if (!data.doctorId) {
      throw new Error("doctorId is required");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    // ✅ Create doctor with ALL fields including department info
    const doctorId = await createDoctor({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      gender: data.gender,
      doctorId: data.doctorId,
      department: data.department,
      specialization: data.specialization || '',
      availableTimeSlots: data.availableTimeSlots || ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'],
      workingDays: data.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      isActive: true
    });

    console.log("Doctor created with ID:", doctorId);

    const newUser = new User({
      userName: data.userName,
      password: hashedPassword,
      entityId: doctorId,
      role: "Doctor",
    });

    console.log("Creating user with userName:", newUser.userName);

    await newUser.save();
    return "Doctor created successfully";
  } catch (err) {
    console.log("Error in creating doctor", err);
    throw err;
  }
};

const registerPatient = async (data) => {
  try {
    console.log("Register Patient - Received data:", data);
    
    // ✅ Validate userName exists
    if (!data.userName) {
      throw new Error("userName is required");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const patientId = await createPatient({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      gender: data.gender
    });

    console.log("Patient created with ID:", patientId);

    const newUser = new User({
      userName: data.userName,
      password: hashedPassword,
      entityId: patientId,
      role: "Patient",
    });

    console.log("Creating user with userName:", newUser.userName);

    await newUser.save();
    return "Patient created successfully";
  } catch (err) {
    console.log("Error in creating patient", err);
    throw err;
  }
};

const getAllUsers = async () => {
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

  return populatedUsers;
};

const updateDoctor = async (doctorId, updatedData) => {
  try {
    const doctorUser = await User.findById(doctorId);
    if (!doctorUser) {
      throw new Error("User not found");
    }

    const actualDoctorId = doctorUser.entityId;
    const doctor = await Doctor.findById(actualDoctorId);

    if (!doctor) {
      throw new Error("Doctor not found");
    }

    if (updatedData.firstName) doctor.firstName = updatedData.firstName;
    if (updatedData.lastName) doctor.lastName = updatedData.lastName;
    if (updatedData.email) doctor.email = updatedData.email;
    if (updatedData.phoneNumber) doctor.phoneNumber = updatedData.phoneNumber;
    if (updatedData.gender) doctor.gender = updatedData.gender;
    if (updatedData.department) doctor.department = updatedData.department;
    if (updatedData.specialization) doctor.specialization = updatedData.specialization;
    if (updatedData.availableTimeSlots) doctor.availableTimeSlots = updatedData.availableTimeSlots;
    if (updatedData.workingDays) doctor.workingDays = updatedData.workingDays;

    await doctor.save();

    const user = await User.findOne({ entityId: actualDoctorId, role: "Doctor" });
    if (!user) {
      throw new Error("User record for doctor not found");
    }

    if (updatedData.userName) user.userName = updatedData.userName;
    if (updatedData.password) {
      const hashedPassword = await bcrypt.hash(updatedData.password, 10);
      user.password = hashedPassword;
    }

    await user.save();
    return "Doctor updated successfully";
  } catch (err) {
    console.error("Error updating doctor:", err);
    throw err;
  }
};

const updatePatient = async (patientId, updatedData) => {
  try {
    const patientUser = await User.findById(patientId);
    if (!patientUser) {
      throw new Error("User not found");
    }

    const actualPatientId = patientUser.entityId;
    const patient = await Patient.findById(actualPatientId);

    if (!patient) {
      throw new Error("Patient not found");
    }

    if (updatedData.firstName) patient.firstName = updatedData.firstName;
    if (updatedData.lastName) patient.lastName = updatedData.lastName;
    if (updatedData.email) patient.email = updatedData.email;
    if (updatedData.phoneNumber) patient.phoneNumber = updatedData.phoneNumber;
    if (updatedData.gender) patient.gender = updatedData.gender;

    await patient.save();

    const user = await User.findOne({ entityId: actualPatientId, role: "Patient" });
    if (!user) {
      throw new Error("User record for patient not found");
    }

    if (updatedData.userName) user.userName = updatedData.userName;
    if (updatedData.password) {
      const hashedPassword = await bcrypt.hash(updatedData.password, 10);
      user.password = hashedPassword;
    }

    await user.save();
    return "Patient updated successfully";
  } catch (err) {
    console.error("Error updating patient:", err);
    throw err;
  }
};

module.exports = {
  registerDoctor,
  registerPatient,
  getAllUsers,
  updateDoctor,
  updatePatient
};