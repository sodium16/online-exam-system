# 🎓 Online Examination System — DBMS Mini Project
### MERN Stack + MySQL with Admin Dashboard

---

## 📋 Overview

A complete online examination platform with:
- **Student Portal**: Register, take exams, view results, leaderboards, analytics
- **Admin Portal**: Create exams per department, build question banks, manage students
- **Auto-grading**: Instant evaluation with triggers
- **Department-based access**: Different exams for different departments
- **Stored procedures**: Leaderboard, difficulty reports, top scorers

---

## 📁 Project Structure

```
online-exam-system/
├── database/
│   ├── schema.sql              ← 7 tables (students, admin, departments, exams, questions, answers, scores)
│   ├── triggers.sql            ← 5 triggers (auto-evaluate, auto-grade, prevent duplicates, recalc totals)
│   ├── stored_procedures.sql   ← 6 SPs (leaderboard, history, difficulty report, etc.)
│   └── seed.sql                ← Sample data (5 students, 3 exams, 8 questions, departments)
│
├── backend/
│   ├── config/
│   │   └── db.js               ← MySQL pool connection
│   ├── controllers/
│   │   ├── authController.js   ← Student & admin login/register
│   │   ├── adminController.js  ← Exam/question/student/dept CRUD
│   │   ├── examController.js   ← Exam taking (with dept filtering)
│   │   └── scoreController.js  ← Results & reports
│   ├── middleware/
│   │   └── auth.js             ← JWT protect + adminProtect
│   ├── routes/
│   │   ├── auth.js             ← /api/auth/*
│   │   ├── admin.js            ← /api/admin/* (protected)
│   │   ├── exams.js            ← /api/exams/*
│   │   └── scores.js           ← /api/scores/*
│   ├── .env                    ← Config (DB_PASSWORD, JWT_SECRET)
│   ├── generate-admin-hash.js  ← Helper: generate bcrypt hash
│   ├── package.json
│   └── server.js               ← Express entry point
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.js  ← Global auth state (student + admin)
    │   ├── components/
    │   │   ├── Layout.js       ← Student sidebar
    │   │   └── admin/
    │   │       └── AdminLayout.js  ← Admin sidebar
    │   ├── pages/
    │   │   ├── Login.js, Register.js, Dashboard.js
    │   │   ├── ExamList.js, ExamRoom.js, Result.js
    │   │   ├── History.js, Leaderboard.js, Reports.js
    │   │   └── admin/
    │   │       ├── AdminLogin.js      ← Admin sign in
    │   │       ├── AdminDashboard.js  ← Stats & overview
    │   │       ├── AdminExams.js      ← Create/manage exams
    │   │       ├── AdminExamDetail.js ← Question builder
    │   │       ├── AdminStudents.js   ← Student mgmt
    │   │       └── AdminDepts.js      ← Department mgmt
    │   ├── App.js              ← Routing (student + admin)
    │   ├── index.js
    │   └── index.css           ← Global styles (dark theme)
    └── package.json
```

---

## 🗄️ DATABASE DESIGN

### 7 Tables:

#### 1. **admin**
```
admin_id (PK), full_name, email (UNIQUE), password_hash, created_at
```
Single admin account — no self-registration.

#### 2. **departments**
```
dept_id (PK), name (UNIQUE), code (UNIQUE), created_at
Examples: Computer Science (CS), Electronics (EC), Mechanical (ME)
```
Controls which exams are visible to which students.

#### 3. **students**
```
student_id (PK), full_name, email (UNIQUE), password_hash,
roll_number (UNIQUE), dept_id (FK), semester (1-8),
is_active (default TRUE), created_at, updated_at
```
Student records linked to a department.

#### 4. **exams**
```
exam_id (PK), title, subject, description, dept_id (FK, nullable),
total_marks (auto-computed), pass_marks (auto-computed),
pass_percent (default 40), duration_min, start_time, end_time,
is_active (default TRUE), created_at

CONSTRAINT: end_time > start_time
```
- **dept_id = NULL** → visible to ALL departments
- **dept_id = N** → visible only to students in that department
- **total_marks** and **pass_marks** are auto-calculated by triggers when questions are added/removed

#### 5. **questions**
```
question_id (PK), exam_id (FK), question_text, option_a, option_b, option_c, option_d,
correct_option (ENUM: A/B/C/D), marks (default 1), difficulty (ENUM: Easy/Medium/Hard),
topic, created_at
```
Question bank for exams. Marks are summed into exam.total_marks by trigger.

#### 6. **answers**
```
answer_id (PK), student_id (FK), exam_id (FK), question_id (FK),
chosen_option (ENUM: A/B/C/D, nullable), is_correct (auto-set by trigger),
marks_awarded (auto-set by trigger), answered_at
UNIQUE: (student_id, exam_id, question_id)
```
One row per question per student attempt. Auto-evaluated by trigger.

#### 7. **scores**
```
score_id (PK), student_id (FK), exam_id (FK),
total_score, total_attempted, total_correct, percentage,
grade (A+/A/B/C/D/F), passed (boolean), time_taken_min,
submitted_at, UNIQUE: (student_id, exam_id)
```
One row per student per exam. Auto-populated and updated by triggers.

---

## ⚡ TRIGGERS (5 total)

| Trigger | Event | What it does |
|---------|-------|-------------|
| `auto_evaluate_answer` | AFTER INSERT on answers | Sets `is_correct` and `marks_awarded` by comparing chosen vs correct option |
| `update_score_on_answer` | AFTER UPDATE on answers | Syncs scores table, calculates percentage, grade (A+/A/B/C/D/F), pass status |
| `prevent_duplicate_exam_attempt` | BEFORE INSERT on answers | Blocks re-submission (one attempt per exam per student) |
| `recalc_total_on_question_insert` | AFTER INSERT on questions | Auto-updates `exams.total_marks` and `exams.pass_marks` when question added |
| `recalc_total_on_question_delete` | AFTER DELETE on questions | Auto-updates `exams.total_marks` and `exams.pass_marks` when question removed |

**Key benefit**: Admin adds 5 questions × 10 marks → total_marks automatically becomes 50. No manual entry needed.

---

## 📦 STORED PROCEDURES (6 total)

| Procedure | Purpose |
|-----------|---------|
| `sp_get_leaderboard(exam_id, limit)` | Top N scorers for a specific exam (with ranking) |
| `sp_get_attempt_history(student_id)` | All exam attempts for a student (exam title, subject, score, grade, date) |
| `sp_subject_difficulty_report()` | Wrong-answer % per subject & difficulty level (identifies tough topics) |
| `sp_submit_exam(student_id, exam_id, time_taken, answers_json)` | Atomic exam submission (JSON array of answers) |
| `sp_top_scorers_overall(limit)` | Top N students across ALL exams (avg%, cumulative score, pass count) |
| `sp_admin_overview()` | Dashboard stats: total students, exams, questions, attempts, avg score |

---

## 🚀 STEP-BY-STEP SETUP

### Step 1 — Install MySQL (if not done)

**Windows/Mac/Linux:**
1. Download from https://dev.mysql.com/downloads/mysql/
2. Install MySQL Community Server 8.0
3. Remember your root password

**Or use XAMPP (easier):**
1. Download from https://www.apachefriends.org/
2. Install & run XAMPP
3. Start MySQL module

---

### Step 2 — Install MySQL Workbench (GUI)

1. Download from https://dev.mysql.com/downloads/workbench/
2. Install it
3. Open Workbench
4. Click **+** to add connection:
   - Name: `LocalDB`
   - Host: `127.0.0.1`
   - Port: `3306`
   - Username: `root`
   - Password: (your MySQL password)
5. Click **Test Connection** → **OK**

---

### Step 3 — Create Database & Tables

1. In Workbench, double-click your connection to open it
2. File → Open SQL Script → select `database/schema.sql`
3. Press **Ctrl+Shift+Enter** (or click ⚡ button) to run
4. You should see `online_exam_db` appear in the left panel under Schemas
5. Expand it → you'll see 7 tables: `admin`, `departments`, `students`, `exams`, `questions`, `answers`, `scores`

---

### Step 4 — Add Triggers

1. File → Open SQL Script → select `database/triggers.sql`
2. Press **Ctrl+Shift+Enter**
3. To verify: expand `online_exam_db → Triggers` in left panel
   - You should see all 5 triggers listed

---

### Step 5 — Add Stored Procedures

1. File → Open SQL Script → select `database/stored_procedures.sql`
2. Press **Ctrl+Shift+Enter**
3. To verify: expand `online_exam_db → Stored Procedures`
   - You should see all 6 SPs listed

---

### Step 6 — Load Sample Data

1. File → Open SQL Script → select `database/seed.sql`
2. Press **Ctrl+Shift+Enter**
3. This adds:
   - 6 departments (CS, EC, ME, CE, CH, IT)
   - 1 admin user
   - 5 sample students
   - 3 sample exams (2 dept-specific, 1 for all)
   - 8 sample questions

---

### Step 7 — Setup Backend

1. Open terminal in `backend/` folder
2. Edit `.env`:
   ```
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_actual_mysql_password
   DB_NAME=online_exam_db
   JWT_SECRET=any_long_random_string_like_abc123xyz456
   JWT_EXPIRES_IN=7d
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start server:
   ```bash
   npm run dev
   ```
5. You should see: `Server on port 5000`
6. Test it: open http://localhost:5000
   - Should show: `{"status":"Online Exam API v2 ✅"}`

---

### Step 8 — Setup Frontend

1. Open **new terminal** in `frontend/` folder
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start React:
   ```bash
   npm start
   ```
4. Browser opens → http://localhost:3000
5. You'll see login page

---

### Step 9 — Test the System

#### **As a Student:**
1. Go to http://localhost:3000/register
2. Fill form:
   - Name: Your name
   - Email: test@example.com
   - Password: Test@1234
   - Roll No: CS21001
   - Department: Computer Science
   - Semester: 5
3. Click **Create Account**
4. You'll be logged in to Dashboard
5. Go to **Exams** → click **DBMS Mid-Term** → **Start Exam**
6. Answer 5 questions → **Submit Exam**
7. View result with breakdown
8. Check **Leaderboard** and **Reports**

#### **As Admin:**
1. Go to http://localhost:3000/admin/login
2. Email: `admin@examportal.com`
3. Password: `Admin@1234` (default seed password)
4. You'll see Admin Dashboard with stats
5. Go to **Exams & Questions** → click **DBMS Mid-Term** → **Questions**
6. Try adding/editing/deleting a question
7. Watch **Total Marks** auto-update!
8. Go to **Students** → search/filter/block students
9. Go to **Departments** → add new departments

---

### Step 10 — Verify Triggers & Stored Procedures

**In MySQL Workbench**, run these queries to see them in action:

```sql
USE online_exam_db;

-- See auto-graded answers
SELECT * FROM answers LIMIT 5;

-- See auto-calculated scores
SELECT * FROM scores;

-- Run stored procedures manually
CALL sp_get_leaderboard(1, 10);
CALL sp_get_attempt_history(1);
CALL sp_top_scorers_overall(5);
CALL sp_subject_difficulty_report();
CALL sp_admin_overview();
```

---

## 🔐 Authentication

### Student Flow:
```
/register → Create account → /login → Dashboard → Exams → Submit → Result
```

### Admin Flow:
```
/admin/login → Dashboard → Manage Exams → Add Questions → Manage Students/Depts
```

Both use **JWT tokens** stored in `localStorage`. Token expires after 7 days.

---

## 🎯 Key Features

### Student Features:
- ✅ Register with department selection
- ✅ Browse exams (filtered by department)
- ✅ Take exam with live countdown timer
- ✅ Question navigator grid
- ✅ Auto-graded results with breakdown
- ✅ Attempt history with all past scores
- ✅ Leaderboard (per exam + overall)
- ✅ Analytics dashboard (charts, difficulty report)

### Admin Features:
- ✅ Create exams assigned to specific departments or all
- ✅ Add/edit/delete questions
- ✅ Auto total marks calculation (sum of question marks)
- ✅ Set pass percentage (auto-calculates pass_marks)
- ✅ Manage departments
- ✅ View all students (search, filter, block/unblock)
- ✅ See exam leaderboard with top scorers
- ✅ Overview dashboard with real-time stats

---

## 🛠️ Troubleshooting

| Error | Solution |
|-------|----------|
| `ER_ACCESS_DENIED` | Check `DB_PASSWORD` in `.env` matches your MySQL password |
| `ECONNREFUSED 3306` | MySQL not running. Start it: XAMPP Control Panel → Start MySQL |
| `Cannot find module 'mysql2'` | Run `npm install` in the correct folder |
| `Port 3000 in use` | Kill it: `npx kill-port 3000` |
| `Port 5000 in use` | Kill it: `npx kill-port 5000` |
| CORS error | Make sure backend runs on 5000, frontend on 3000 |
| Exam total marks = 0 | Make sure you added questions AND backend/db are connected |
| Can't toggle student active | Make sure you're logged in as admin |

---

## 📊 Database Queries for Viva/Report

```sql
-- Top 5 scorers in DBMS exam
CALL sp_get_leaderboard(1, 5);

-- Student attempt history
CALL sp_get_attempt_history(1);

-- Subject difficulty (which topics have high wrong answer %)
CALL sp_subject_difficulty_report();

-- Overall top performers
CALL sp_top_scorers_overall(10);

-- Admin dashboard stats
CALL sp_admin_overview();

-- Manually: Students who passed
SELECT s.full_name, sc.percentage, sc.grade, sc.submitted_at
FROM scores sc
JOIN students s ON s.student_id = sc.student_id
WHERE sc.passed = TRUE
ORDER BY sc.percentage DESC;

-- Manually: Question accuracy (wrong answer %)
SELECT q.question_text, q.difficulty,
  COUNT(*) AS attempts,
  SUM(a.is_correct) AS correct,
  ROUND((1 - SUM(a.is_correct)/COUNT(*)) * 100, 1) AS wrong_pct
FROM answers a
JOIN questions q ON q.question_id = a.question_id
GROUP BY a.question_id
ORDER BY wrong_pct DESC;

-- Department-wise exam visibility
SELECT e.title, e.subject, d.name AS department, COUNT(s.student_id) AS eligible_students
FROM exams e
LEFT JOIN departments d ON d.dept_id = e.dept_id
LEFT JOIN students s ON (e.dept_id IS NULL OR e.dept_id = s.dept_id)
GROUP BY e.exam_id;
```

---

## 📝 Sample Credentials (from seed.sql)

### Admin:
```
Email:    admin@examportal.com
Password: Admin@1234
```

### Students:
```
Email:    arjun@example.com  | Roll: CS21001  | Dept: CS
Email:    priya@example.com  | Roll: CS21002  | Dept: CS
Email:    rahul@example.com  | Roll: EC21001  | Dept: EC
Email:    sneha@example.com  | Roll: ME21001  | Dept: ME
Email:    vikram@example.com | Roll: IT21001  | Dept: IT

Password: (all) Test@1234
```

### Exams in Database:
```
1. DBMS Mid-Term       (CS Dept) — 5 questions × 10 marks = 50 total
2. Signals & Systems   (EC Dept) — 3 questions × 5 marks = 15 total
3. Aptitude Test       (All Depts) — Open to everyone
```

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + React Router v6 + Recharts (charts) |
| **Backend** | Node.js + Express.js |
| **Database** | MySQL 8.0 |
| **Auth** | JWT + bcryptjs |
| **Styling** | Custom CSS (dark theme) |

---

## 📦 Package Dependencies

**Backend (`npm install`):**
- `express` — Web framework
- `mysql2` — MySQL driver (promise-based)
- `bcryptjs` — Password hashing
- `jsonwebtoken` — JWT auth
- `cors` — Cross-origin requests
- `dotenv` — Environment variables
- `nodemon` — Dev auto-reload

**Frontend (`npm install`):**
- `react` — UI library
- `react-router-dom` — Routing
- `axios` — HTTP requests
- `recharts` — Charts & graphs

---

## 🚢 Deployment Notes

Before deploying to production:

1. Change `JWT_SECRET` to a strong random string
2. Change admin password in database
3. Set `NODE_ENV=production`
4. Use a real MySQL host (not localhost)
5. Enable HTTPS
6. Configure CORS properly (don't use `*`)
7. Add rate limiting to API
8. Set up backups for database

---

## ✅ Checklist for Project Submission

- [ ] Database schema with 7 tables created
- [ ] 5 triggers implemented and tested
- [ ] 6 stored procedures created and working
- [ ] Backend API endpoints functional
- [ ] Admin dashboard for exam/question management
- [ ] Student portal with exam taking
- [ ] Auto-grading via triggers working
- [ ] Department-based access control
- [ ] Leaderboards (per-exam + overall)
- [ ] Reports with charts
- [ ] README with setup instructions