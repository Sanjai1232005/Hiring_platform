const express = require('express');
const router = express.Router();
const rolefitController = require('../controllers/rolefit.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorizeRole = require('../middlewares/role.middleware');

// HR: get role-fit profiles for all final-round candidates in a job
router.get('/job/:jobId', authenticate, authorizeRole('hr'), rolefitController.getRoleFitByJob);

// Student: get own role-fit for a job they applied to
router.get('/me/:jobId', authenticate, rolefitController.getMyRoleFit);

// Reference: list all archetypes
router.get('/archetypes', authenticate, rolefitController.getArchetypes);

module.exports = router;
