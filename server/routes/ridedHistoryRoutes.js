const express = require('express');
const router = express.Router();
const rideHistoryController = require('../controllers/rideHistoryController');
const userProfilePic = require('../middleware/userProfilePic');

router.get('/getRideList', rideHistoryController.getRideList);
router.post('/search', rideHistoryController.searchRides);

module.exports = router;