const express = require('express');
const router  = express.Router();
const {
  getAttemptHistory, getLeaderboard, getTopScorers,
  getDifficultyReport, getMyResult
} = require('../controllers/scoreController');
const { protect } = require('../middleware/auth');

router.get('/history',              protect, getAttemptHistory);
router.get('/top-overall',          protect, getTopScorers);
router.get('/difficulty-report',    protect, getDifficultyReport);
router.get('/result/:examId',       protect, getMyResult);
router.get('/leaderboard/:examId',  protect, getLeaderboard);

module.exports = router;
