const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const db     = require('../config/db');

// POST /api/auth/register
const register = async (req, res) => {
  const { full_name, email, password, roll_number, branch, semester } = req.body;
  if (!full_name || !email || !password || !roll_number || !branch || !semester)
    return res.status(400).json({ message: 'All fields are required' });

  try {
    const [existing] = await db.query(
      'SELECT student_id FROM students WHERE email = ? OR roll_number = ?',
      [email, roll_number]
    );
    if (existing.length > 0)
      return res.status(409).json({ message: 'Email or Roll Number already exists' });

    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      `INSERT INTO students (full_name, email, password_hash, roll_number, branch, semester)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [full_name, email, hash, roll_number, branch, semester]
    );

    const token = jwt.sign(
      { student_id: result.insertId, email, full_name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({ token, student: { student_id: result.insertId, full_name, email, roll_number, branch, semester } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'Email and password required' });

  try {
    const [rows] = await db.query(
      'SELECT * FROM students WHERE email = ? AND is_active = TRUE',
      [email]
    );
    if (rows.length === 0)
      return res.status(401).json({ message: 'Invalid credentials' });

    const student = rows[0];
    const match   = await bcrypt.compare(password, student.password_hash);
    if (!match)
      return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { student_id: student.student_id, email: student.email, full_name: student.full_name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const { password_hash, ...safe } = student;
    res.json({ token, student: safe });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT student_id, full_name, email, roll_number, branch, semester, created_at FROM students WHERE student_id = ?',
      [req.student.student_id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { register, login, getMe };
