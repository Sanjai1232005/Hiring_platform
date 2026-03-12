const express = require('express');
const router = express.Router();

// Import HR controller and authentication middleware
const hrController = require('../controllers/hr.controller');
const authenticate = require('../middlewares/auth.middleware');


//Get HR Profile
router.get('/getProfile',authenticate, hrController.getHRProfile);

//Profile stats
router.get('/profile-stats', authenticate, hrController.getProfileStats);

//Update HR Profile
router.put('/updateProfile',authenticate, hrController.updateHRProfile);

//Create Job and Get Jobs by HR
router.post('/create',authenticate, hrController.createJob)

//Get Jobs by HR
router.post('/getjob', authenticate, hrController.getJobsByHR)


module.exports = router;