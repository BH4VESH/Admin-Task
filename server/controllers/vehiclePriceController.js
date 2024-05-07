const Data = require('../models/vehiclePriceModel');

exports.createData = async (req, res) => {
  try {
    const { countryId, cityId, vehicleId } = req.body;

    const existingData = await Data.findOne({ countryId, cityId, vehicleId });

    if (existingData) {
      return res.status(400).json({ success: false, message: 'Same country, city, and vehicle already exists.' });
    }
    const data = new Data(req.body);
    await data.save();
    res.json({ success: true, message: "Data added successfully" });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ error: 'Error saving data' });
  }
};
