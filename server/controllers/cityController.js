const Zone = require('../models/city');

// Controller to save a new zone
exports.createZone = async (req, res) => {
  try {
    const {country_id, name, coordinates } = req.body;
    const zone = new Zone({country_id, name, coordinates });
    await zone.save();
  
    console.log("data saved")
    res.status(200).send(zone)
  } catch (err) {
    console.error('Error saving zone:', err);
    res.status(500).json({ error: 'Failed to save zone' });
  }
};

exports.getAllZones = async (req, res) => {
    try {
      const zones = await Zone.find();
      res.status(200).send(zones);
    } catch (err) {
      console.error('Error fetching zones:', err);
      res.status(500).json({ error: 'Failed to fetch zones' });
    }
  };

  exports.updateZone = async (req, res) => {
    const { id } = req.params; 
    const {name , coordinates } = req.body; 
    try {
      const updatedZone = await Zone.findByIdAndUpdate(id, {name, coordinates }, { new: true });
      if (!updatedZone) {
        return res.status(404).json({ error: 'Zone not found' });
      }
      res.send(updatedZone);
    } catch (error) {
      console.error('Error updating zone:', error);
      res.status(500).json({ error: 'Failed to update zone' });
    }
  };
  