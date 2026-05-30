const db = require('../config/db');

// GET /api/scores/history  — attempt history via stored procedure
const getAttemptHistory = async (req, res) => {
  try {
    const [rows] = await db.query('CALL sp_get_attempt_history(?)', [req.student.student_id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/scores/leaderboard/:examId
const getLeaderboard = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  try {
    const [rows] = await db.query('CALL sp_get_leaderboard(?, ?)', [req.params.examId, limit]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/scores/top-overall
const getTopScorers = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  try {
    const [rows] = await db.query('CALL sp_top_scorers_overall(?)', [limit]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/scores/difficulty-report
const getDifficultyReport = async (req, res) => {
  try {
    const [rows] = await db.query('CALL sp_subject_difficulty_report()');
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/scores/result/:examId
const getMyResult = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT s.*, e.title, e.subject, e.total_marks, e.pass_marks
       FROM scores s JOIN exams e ON e.exam_id = s.exam_id
       WHERE s.student_id = ? AND s.exam_id = ?`,
      [req.student.student_id, req.params.examId]
    );
    if (!rows.length) return res.status(404).json({ message: 'Result not found' });

    // Also get per-question breakdown
    const [breakdown] = await db.query(
      `SELECT a.question_id, q.question_text, a.chosen_option,
              q.correct_option, a.is_correct, a.marks_awarded, q.marks, q.topic,
              q.option_a, q.option_b, q.option_c, q.option_d
       FROM answers a JOIN questions q ON q.question_id = a.question_id
       WHERE a.student_id = ? AND a.exam_id = ?`,
      [req.student.student_id, req.params.examId]
    );

    res.json({ result: rows[0], breakdown });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAttemptHistory, getLeaderboard, getTopScorers, getDifficultyReport, getMyResult };
