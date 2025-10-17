const doctorAvailability = {
  D001: ['09:00', '10:00', '11:00'],
  D002: ['13:00', '14:00'],
  D003: [], // Unavailable
};

function isDoctorAvailable(doctorId, timeSlot) {
  return doctorAvailability[doctorId]?.includes(timeSlot);
}

module.exports = { isDoctorAvailable };
