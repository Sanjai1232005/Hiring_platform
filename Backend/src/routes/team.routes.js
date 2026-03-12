const express = require('express');
const router = express.Router();
const teamController = require('../controllers/team.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorizeRole = require('../middlewares/role.middleware');

// Get final-round candidates for team forming
router.get('/candidates/:jobId', authenticate, authorizeRole('hr'), teamController.getFinalCandidates);

// Auto-form balanced teams
router.post('/auto-form', authenticate, authorizeRole('hr'), teamController.autoFormTeams);

// Get all teams for a job
router.get('/job/:jobId', authenticate, authorizeRole('hr'), teamController.getTeamsByJob);

// Update a team
router.put('/:teamId', authenticate, authorizeRole('hr'), teamController.updateTeam);

// Delete a team
router.delete('/:teamId', authenticate, authorizeRole('hr'), teamController.deleteTeam);

module.exports = router;
