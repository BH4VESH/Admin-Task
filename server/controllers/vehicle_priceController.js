const Data = require('../models/vehicle_price');

exports.createData = async (req, res) => {
  try {
    const data = new Data(req.body);
    await data.save();
    res.json({ success: true, message: "Data added successfully" });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ error: 'Error saving data' });
  }
};
