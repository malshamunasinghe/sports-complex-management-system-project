const express = require('express');
const router = express.Router();
const bookingController = require('../Controllers/bookingController');

router.get('/', bookingController.getAllBookings);          // GET all bookings
router.get('/:id', bookingController.getBookingById);       // GET booking by ID
router.post('/', bookingController.addBooking);             // ADD new booking
router.put('/:id', bookingController.updateBooking);        // UPDATE booking
router.delete('/:id', bookingController.deleteBooking);     // DELETE booking

module.exports = router;
