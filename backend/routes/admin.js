const express = require('express');
const router  = express.Router();
const { adminProtect } = require('../middleware/auth');
const {
  getOverview, getDepartments, createDepartment, deleteDepartment,
  getAllExams, createExam, updateExam, deleteExam,
  getQuestions, addQuestion, updateQuestion, deleteQuestion,
  getAllStudents, toggleStudent, getLeaderboard,
} = require('../controllers/adminController');

router.use(adminProtect); // all admin routes are protected

router.get('/overview', getOverview);

// Departments
router.get('/departments',        getDepartments);
router.post('/departments',       createDepartment);
router.delete('/departments/:id', deleteDepartment);

// Exams
router.get('/exams',          getAllExams);
router.post('/exams',         createExam);
router.put('/exams/:id',      updateExam);
router.delete('/exams/:id',   deleteExam);

// Questions
router.get('/exams/:id/questions',    getQuestions);
router.post('/exams/:id/questions',   addQuestion);
router.put('/questions/:qid',         updateQuestion);
router.delete('/questions/:qid',      deleteQuestion);

// Students
router.get('/students',                   getAllStudents);
router.patch('/students/:id/toggle',      toggleStudent);

// Reports
router.get('/reports/leaderboard/:examId', getLeaderboard);

module.exports = router;
