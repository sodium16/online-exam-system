const db = require('../config/db');

// GET /api/exams — list exams visible to the logged-in student's department
const getAllExams = async (req, res) => {
  try {
    const [student] = await db.query('SELECT dept_id FROM students WHERE student_id = ?', [req.student.student_id]);
    if (!student.length) return res.status(404).json({ message: 'Student not found' });
    const deptId = student[0].dept_id;

    const [rows] = await db.query(
      `SELECT e.*, d.name AS dept_name, d.code AS dept_code,
         (SELECT COUNT(*) FROM questions q WHERE q.exam_id = e.exam_id) AS question_count
       FROM exams e
       LEFT JOIN departments d ON d.dept_id = e.dept_id
       WHERE e.is_active = TRUE
         AND (e.dept_id IS NULL OR e.dept_id = ?)
       ORDER BY e.start_time DESC`,
      [deptId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/exams/:id
const getExamById = async (req, res) => {
  try {
    const [exam] = await db.query(
      `SELECT e.*, d.name AS dept_name FROM exams e
       LEFT JOIN departments d ON d.dept_id = e.dept_id
       WHERE e.exam_id = ?`, [req.params.id]);
    if (!exam.length) return res.status(404).json({ message: 'Exam not found' });

    const [score] = await db.query(
      'SELECT score_id FROM scores WHERE student_id = ? AND exam_id = ?',
      [req.student.student_id, req.params.id]);

    res.json({ ...exam[0], already_attempted: score.length > 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/exams/:id/questions  (hides correct answers)
const getExamQuestions = async (req, res) => {
  try {
    const [score] = await db.query(
      'SELECT score_id FROM scores WHERE student_id = ? AND exam_id = ?',
      [req.student.student_id, req.params.id]);
    if (score.length)
      return res.status(403).json({ message: 'You have already submitted this exam.' });

    const [rows] = await db.query(
      `SELECT question_id, question_text, option_a, option_b, option_c, option_d, marks, difficulty, topic
       FROM questions WHERE exam_id = ? ORDER BY RAND()`, [req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/exams/:id/submit
const submitExam = async (req, res) => {
  const { answers, time_taken_min } = req.body;
  if (!answers || !Array.isArray(answers))
    return res.status(400).json({ message: 'Answers array required' });
  try {
    await db.query('CALL sp_submit_exam(?,?,?,?)', [
      req.student.student_id, req.params.id, time_taken_min || 0,
      JSON.stringify(answers.map(a => ({ question_id: a.question_id, chosen: a.chosen_option }))),
    ]);
    const [scoreRows] = await db.query(
      'SELECT * FROM scores WHERE student_id = ? AND exam_id = ?',
      [req.student.student_id, req.params.id]);
    res.status(201).json({ message: 'Exam submitted!', score: scoreRows[0] });
  } catch (err) {
    if (err.message.includes('already submitted'))
      return res.status(409).json({ message: err.message });
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllExams, getExamById, getExamQuestions, submitExam };
