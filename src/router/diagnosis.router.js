const express = require("express");
const router = express.Router();
const {
  createDiagnosis,
  getDiagnoses,
  updateDiagnosis,
  deleteDiagnosis,
} = require("../controllers/diagnosis.controller");

router.post("/", createDiagnosis);
router.get("/", getDiagnoses);
router.put("/:id", updateDiagnosis);
router.delete("/:id", deleteDiagnosis);

module.exports = router;
