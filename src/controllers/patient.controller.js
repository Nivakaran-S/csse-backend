const User = require('../models/users.model');
const Patient = require('../models/patient.model');

const getPatientDetailsById = async (id) => {
  try {
    const cleanId = id.replace(/^:/, '').trim();
    const user = await User.findById(cleanId);
    
    if (!user) {
      console.error("User not found");
      return null;
    }

    if (user.role !== 'Patient') {
      console.error("User is not a patient");
      return null;
    }

    const patient = await Patient.findById(user.entityId);

    return [patient, user];
  } catch (err) {
    console.error("Error fetching patient by ID:", err);
    return null;
  }
};

const httpGetPatientById = async (req, res) => {
  try {
    const patientId = req.params.id;
    const patientDetails = await getPatientDetailsById(patientId);
    
    if (!patientDetails) {
      return res.status(404).json({ message: "Patient not found" });
    }
    
    return res.status(200).json(patientDetails);
  } catch (err) {
    console.error("Error in getting patient details", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  httpGetPatientById
};