const express = require('express');
const router = express.Router();
const vehicle_priceController = require('../controllers/vehicle_priceController');


router.post('/add', vehicle_priceController.createData);

module.exports = router;
