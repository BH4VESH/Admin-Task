const mongoose = require('mongoose');

const zoneSchema = new mongoose.Schema({

  country_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Country', required: true },
  name: { type: String, required: true },
  coordinates: [{ lat: Number, lng: Number }]
});

module.exports = mongoose.model('Zone', zoneSchema);
