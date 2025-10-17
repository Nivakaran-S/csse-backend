const Diagnosis = require("../models/diagnosis.model");

// ✅ Create Diagnosis
const createDiagnosis = async (req, res) => {
  try {
    const { patientId, patientName, symptoms, diagnosis, remarks, diagnosisDate, severity } = req.body;

    if (!patientId || !patientName || !symptoms || !diagnosis || !diagnosisDate || !severity) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const newDiagnosis = await Diagnosis.create({
      patientId,
      patientName,
      symptoms,
      diagnosis,
      remarks,
      diagnosisDate,
      severity,
    });

    res.status(201).json(newDiagnosis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get all diagnoses
const getDiagnoses = async (req, res) => {
  try {
    const diagnoses = await Diagnosis.find().sort({ createdAt: -1 });
    res.status(200).json(diagnoses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update diagnosis
const updateDiagnosis = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Diagnosis.findByIdAndUpdate(id, req.body, { new: true });

    if (!updated) return res.status(404).json({ message: "Diagnosis not found" });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Delete diagnosis
const deleteDiagnosis = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Diagnosis.findByIdAndDelete(id);

    if (!deleted) return res.status(404).json({ message: "Diagnosis not found" });
    res.status(200).json({ message: "Diagnosis deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createDiagnosis,
  getDiagnoses,
  updateDiagnosis,
  deleteDiagnosis,
};
