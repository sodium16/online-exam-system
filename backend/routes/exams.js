const express = require('express');
const router  = express.Router();
const { getAllExams, getExamById, getExamQuestions, submitExam } = require('../controllers/examController');
const { protect } = require('../middleware/auth');

router.get('/',               protect, getAllExams);
router.get('/:id',            protect, getExamById);
router.get('/:id/questions',  protect, getExamQuestions);
router.post('/:id/submit',    protect, submitExam);

module.exports = router;
