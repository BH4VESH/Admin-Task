const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    selectedSeconds: { type: Number, required: true },
    selectedStopCount: { type: Number, required: true },
});

module.exports = mongoose.model('setting', settingSchema);