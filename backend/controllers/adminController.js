const bcrypt = require('bcryptjs');
const db     = require('../config/db');

// ── OVERVIEW ─────────────────────────────────────────────────
// GET /api/admin/overview
const getOverview = async (req, res) => {
  try {
    const [[stats]] = await db.query('CALL sp_admin_overview()');
    const [recentExams] = await db.query(
      `SELECT e.*, d.name AS dept_name, d.code AS dept_code,
        (SELECT COUNT(*) FROM questions q WHERE q.exam_id = e.exam_id) AS question_count,
        (SELECT COUNT(*) FROM scores   s WHERE s.exam_id = e.exam_id) AS attempt_count
       FROM exams e LEFT JOIN departments d ON d.dept_id = e.dept_id
       ORDER BY e.created_at DESC LIMIT 5`);
    const [recentStudents] = await db.query(
      `SELECT s.student_id, s.full_name, s.email, s.roll_number, s.created_at,
              d.name AS dept_name, d.code AS dept_code
       FROM students s JOIN departments d ON d.dept_id = s.dept_id
       ORDER BY s.created_at DESC LIMIT 5`);
    res.json({ stats: stats[0], recentExams, recentStudents });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── DEPARTMENTS ──────────────────────────────────────────────
// GET /api/admin/departments
const getDepartments = async (_req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT d.*, COUNT(s.student_id) AS student_count,
              COUNT(DISTINCT e.exam_id) AS exam_count
       FROM departments d
       LEFT JOIN students s ON s.dept_id = d.dept_id
       LEFT JOIN exams    e ON e.dept_id = d.dept_id
       GROUP BY d.dept_id ORDER BY d.name`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/admin/departments
const createDepartment = async (req, res) => {
  const { name, code } = req.body;
  if (!name || !code) return res.status(400).json({ message: 'Name and code required' });
  try {
    const [r] = await db.query('INSERT INTO departments (name, code) VALUES (?,?)', [name, code.toUpperCase()]);
    res.status(201).json({ dept_id: r.insertId, name, code: code.toUpperCase() });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Department already exists' });
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/admin/departments/:id
const deleteDepartment = async (req, res) => {
  try {
    await db.query('DELETE FROM departments WHERE dept_id = ?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── EXAMS ────────────────────────────────────────────────────
// GET /api/admin/exams
const getAllExams = async (_req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT e.*, d.name AS dept_name, d.code AS dept_code,
        (SELECT COUNT(*) FROM questions q WHERE q.exam_id = e.exam_id) AS question_count,
        (SELECT COUNT(*) FROM scores   s WHERE s.exam_id = e.exam_id) AS attempt_count,
        (SELECT ROUND(AVG(percentage),1) FROM scores s WHERE s.exam_id = e.exam_id) AS avg_score
       FROM exams e LEFT JOIN departments d ON d.dept_id = e.dept_id
       ORDER BY e.created_at DESC`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/admin/exams
const createExam = async (req, res) => {
  const { title, subject, description, dept_id, pass_percent, duration_min, start_time, end_time } = req.body;
  if (!title || !subject || !duration_min || !start_time || !end_time)
    return res.status(400).json({ message: 'title, subject, duration_min, start_time, end_time required' });
  try {
    const [r] = await db.query(
      `INSERT INTO exams (title, subject, description, dept_id, pass_percent, duration_min, start_time, end_time, total_marks, pass_marks)
       VALUES (?,?,?,?,?,?,?,?,0,0)`,
      [title, subject, description || null, dept_id || null, pass_percent || 40, duration_min, start_time, end_time]);
    const [exam] = await db.query(
      `SELECT e.*, d.name AS dept_name FROM exams e LEFT JOIN departments d ON d.dept_id = e.dept_id WHERE e.exam_id = ?`,
      [r.insertId]);
    res.status(201).json(exam[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/admin/exams/:id
const updateExam = async (req, res) => {
  const { title, subject, description, dept_id, pass_percent, duration_min, start_time, end_time, is_active } = req.body;
  try {
    await db.query(
      `UPDATE exams SET title=?, subject=?, description=?, dept_id=?, pass_percent=?,
       duration_min=?, start_time=?, end_time=?, is_active=?,
       pass_marks = CEIL(total_marks * ? / 100)
       WHERE exam_id = ?`,
      [title, subject, description, dept_id || null, pass_percent || 40,
       duration_min, start_time, end_time, is_active ?? 1, pass_percent || 40, req.params.id]);
    res.json({ message: 'Updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/admin/exams/:id
const deleteExam = async (req, res) => {
  try {
    await db.query('DELETE FROM exams WHERE exam_id = ?', [req.params.id]);
    res.json({ message: 'Exam deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── QUESTIONS ────────────────────────────────────────────────
// GET /api/admin/exams/:id/questions
const getQuestions = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM questions WHERE exam_id = ? ORDER BY question_id', [req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/admin/exams/:id/questions
const addQuestion = async (req, res) => {
  const { question_text, option_a, option_b, option_c, option_d, correct_option, marks, difficulty, topic } = req.body;
  if (!question_text || !option_a || !option_b || !option_c || !option_d || !correct_option)
    return res.status(400).json({ message: 'All question fields required' });
  try {
    const [r] = await db.query(
      `INSERT INTO questions (exam_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks, difficulty, topic)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [req.params.id, question_text, option_a, option_b, option_c, option_d,
       correct_option.toUpperCase(), marks || 1, difficulty || 'Medium', topic || null]);
    // Trigger recalc_total_on_question_insert fires automatically
    const [exam] = await db.query('SELECT total_marks, pass_marks FROM exams WHERE exam_id = ?', [req.params.id]);
    res.status(201).json({ question_id: r.insertId, ...req.body, exam_totals: exam[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/admin/questions/:qid
const updateQuestion = async (req, res) => {
  const { question_text, option_a, option_b, option_c, option_d, correct_option, marks, difficulty, topic } = req.body;
  try {
    await db.query(
      `UPDATE questions SET question_text=?, option_a=?, option_b=?, option_c=?, option_d=?,
       correct_option=?, marks=?, difficulty=?, topic=? WHERE question_id=?`,
      [question_text, option_a, option_b, option_c, option_d,
       correct_option.toUpperCase(), marks, difficulty, topic, req.params.qid]);
    res.json({ message: 'Question updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/admin/questions/:qid
const deleteQuestion = async (req, res) => {
  try {
    const [q] = await db.query('SELECT exam_id FROM questions WHERE question_id = ?', [req.params.qid]);
    await db.query('DELETE FROM questions WHERE question_id = ?', [req.params.qid]);
    // Trigger recalc_total_on_question_delete fires automatically
    if (q.length) {
      const [exam] = await db.query('SELECT total_marks, pass_marks FROM exams WHERE exam_id = ?', [q[0].exam_id]);
      return res.json({ message: 'Deleted', exam_totals: exam[0] });
    }
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── STUDENTS ─────────────────────────────────────────────────
// GET /api/admin/students
const getAllStudents = async (_req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT s.*, d.name AS dept_name, d.code AS dept_code,
        (SELECT COUNT(*) FROM scores sc WHERE sc.student_id = s.student_id) AS exam_count,
        (SELECT ROUND(AVG(percentage),1) FROM scores sc WHERE sc.student_id = s.student_id) AS avg_score
       FROM students s JOIN departments d ON d.dept_id = s.dept_id
       ORDER BY s.created_at DESC`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/admin/students/:id/toggle
const toggleStudent = async (req, res) => {
  try {
    await db.query('UPDATE students SET is_active = NOT is_active WHERE student_id = ?', [req.params.id]);
    res.json({ message: 'Toggled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/reports/leaderboard/:examId
const getLeaderboard = async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  try {
    const [rows] = await db.query('CALL sp_get_leaderboard(?,?)', [req.params.examId, limit]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getOverview, getDepartments, createDepartment, deleteDepartment,
  getAllExams, createExam, updateExam, deleteExam,
  getQuestions, addQuestion, updateQuestion, deleteQuestion,
  getAllStudents, toggleStudent, getLeaderboard,
};
