const mongoose = require("mongoose");

const diagnosisSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      required: true,
    },
    patientName: {
      type: String,
      required: true,
    },
    symptoms: {
      type: String,
      required: true,
    },
    diagnosis: {
      type: String,
      required: true,
    },
    remarks: {
      type: String,
    },
    diagnosisDate: {
      type: Date,
      required: true,
    },
    severity: {
      type: String,
      enum: ["Mild", "Moderate", "Severe"],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Diagnosis", diagnosisSchema);
