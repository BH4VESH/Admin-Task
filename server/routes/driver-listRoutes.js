const express = require('express');
const router = express.Router();
const Driver_listController = require('../controllers/driver-list-Controller');
const driver_list_profile = require('../middleware/driver_list_profile');

router.post('/add', driver_list_profile, Driver_listController.createDriver);
router.get('/get', Driver_listController.getDriver);
router.get('/getShort',Driver_listController.getShortDriver);
router.delete('/delete/:id', Driver_listController.deleteDriver);
router.put('/edit/:id', driver_list_profile, Driver_listController.updateDriver);
router.get('/search', Driver_listController.searchDriver);
router.put('/service/:id', Driver_listController.addService);
router.get('/status/:id', Driver_listController.addStatus);
// router.get('/status', Driver_listController);


module.exports = router;
