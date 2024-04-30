const User = require('../models/userModel');
const {mongoose } = require('mongoose');

exports.searchUsers = async (req, res) => {
    const { countryId, phone } = req.body;
    console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
    console.log(req.body)
    console.log(countryId)
    console.log(phone)

    try {
        const users = await User.aggregate([
            {
                $match: {
                    $and: [
                        { countryId: new mongoose.Types.ObjectId(countryId) },
                        { phone: { $regex: phone, $options: 'i' } }
                    ]
                }
            },
        ]);
        if (users.length > 0) {
            res.json({ success: true, users, message: 'Users found success' });
        } else {
            res.json({ success: false, message: 'No users found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};