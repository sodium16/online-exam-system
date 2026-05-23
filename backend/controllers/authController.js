const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const db     = require('../config/db');

const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// ── ADMIN LOGIN ─────────────────────────────────────────────
// POST /api/auth/admin/login
const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'Email and password required' });
  try {
    const [rows] = await db.query('SELECT * FROM admin WHERE email = ?', [email]);
    if (!rows.length) return res.status(401).json({ message: 'Invalid credentials' });
    const admin = rows[0];
    if (!(await bcrypt.compare(password, admin.password_hash)))
      return res.status(401).json({ message: 'Invalid credentials' });
    const token = signToken({ admin_id: admin.admin_id, email: admin.email, full_name: admin.full_name, isAdmin: true });
    res.json({ token, admin: { admin_id: admin.admin_id, full_name: admin.full_name, email: admin.email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── STUDENT REGISTER ────────────────────────────────────────
// POST /api/auth/register
const register = async (req, res) => {
  const { full_name, email, password, roll_number, dept_id, semester } = req.body;
  if (!full_name || !email || !password || !roll_number || !dept_id || !semester)
    return res.status(400).json({ message: 'All fields are required' });
  try {
    const [existing] = await db.query(
      'SELECT student_id FROM students WHERE email = ? OR roll_number = ?', [email, roll_number]);
    if (existing.length) return res.status(409).json({ message: 'Email or Roll Number already exists' });

    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO students (full_name, email, password_hash, roll_number, dept_id, semester) VALUES (?,?,?,?,?,?)',
      [full_name, email, hash, roll_number, dept_id, semester]);

    const [dept] = await db.query('SELECT name, code FROM departments WHERE dept_id = ?', [dept_id]);
    const token = signToken({ student_id: result.insertId, email, full_name, isAdmin: false });
    res.status(201).json({
      token,
      student: { student_id: result.insertId, full_name, email, roll_number, dept_id, semester, department: dept[0] }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── STUDENT LOGIN ────────────────────────────────────────────
// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
  try {
    const [rows] = await db.query(
      `SELECT s.*, d.name AS dept_name, d.code AS dept_code
       FROM students s JOIN departments d ON d.dept_id = s.dept_id
       WHERE s.email = ? AND s.is_active = TRUE`, [email]);
    if (!rows.length) return res.status(401).json({ message: 'Invalid credentials' });
    const student = rows[0];

    if (!(await bcrypt.compare(password, student.password_hash)))
      return res.status(401).json({ message: 'Invalid credentials' });
    const token = signToken({ student_id: student.student_id, email: student.email, full_name: student.full_name, isAdmin: false });
    const { password_hash, ...safe } = student;
    res.json({ token, student: safe });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT s.student_id, s.full_name, s.email, s.roll_number, s.dept_id, s.semester, s.created_at,
              d.name AS dept_name, d.code AS dept_code
       FROM students s JOIN departments d ON d.dept_id = s.dept_id
       WHERE s.student_id = ?`, [req.student.student_id]);
    if (!rows.length) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/auth/departments  — public, for registration dropdown
const getDepartments = async (_req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM departments ORDER BY name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { adminLogin, register, login, getMe, getDepartments };
