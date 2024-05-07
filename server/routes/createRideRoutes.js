const express = require('express');
const router = express.Router();
const createRideController = require('../controllers/createRideController');

// Route to create a new zone
router.post('/searchUser', createRideController.searchUsers);
router.post('/getVehiclePrice', createRideController.getVehiclePrice);
router.post('/saveRide', createRideController.saveRide);
// router.post1('/save')
// router.post('/saveRide', createRideController.saveRide);
// router.get('/get', settingController.getSetting);


module.exports = router;