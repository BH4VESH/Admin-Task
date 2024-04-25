const express = require('express');
const router = express.Router();
const vehicle_priceController = require('../controllers/vehiclePriceController');


router.post('/add', vehicle_priceController.createData);

module.exports = router;
