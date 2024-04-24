const Setting = require('../models/setting');

exports.saveSetting = async (req, res) => {
    try {
        const {selectedSeconds, selectedStopCount } = req.body;
        console.log(req.body)
        const updatedSetting = { selectedSeconds, selectedStopCount };
        const setting = await Setting.findOneAndUpdate(
            {},
            updatedSetting,
            { new: true }
        );
        if (!setting) {
            const newSetting = new Setting(updatedSetting);
            await newSetting.save();
            res.status(201).json({ message: 'Setting saved successfully', setting: newSetting });
        } else {
            res.status(200).json({ message: 'Setting updated successfully', setting });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error saving setting' });
    }
};

exports.getSetting = async (req, res) => {
    try {
      const setting = await Setting.find();
      res.status(200).send(setting);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch setting' });
    }
  };