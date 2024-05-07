const mongoose = require('mongoose');

const saveRideSchema = new mongoose.Schema({
    userId: String,
    countryId: String,
    cityId: String,
    vehicleId: String,
    totalDistanceKm: Number,
    totalDurationMin: Number,
    fromLocation: String,
    toLocation: String,
    stopValue: [String],
    estimeteFare: Number,
    paymentOption: String,
    bookingOption: String,
    scheduledDate: Date, 
    scheduledTimeSeconds: Number,
});

module.exports = mongoose.model('SaveRide', saveRideSchema);


