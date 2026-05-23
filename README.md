# 🎓 Online Examination System
### DBMS Mini Project — MERN Stack + MySQL

---

## 📁 Complete File Structure

```
online-exam-system/
├── database/
│   ├── schema.sql              ← Tables (5 tables)
│   ├── triggers.sql            ← 3 triggers
│   ├── stored_procedures.sql   ← 5 stored procedures
│   └── seed.sql                ← Sample data
│
├── backend/
│   ├── config/
│   │   └── db.js               ← MySQL connection pool
│   ├── controllers/
│   │   ├── authController.js   ← Register, Login, Me
│   │   ├── examController.js   ← Exam CRUD + submit
│   │   └── scoreController.js  ← Scores, leaderboard, reports
│   ├── middleware/
│   │   └── auth.js             ← JWT protect middleware
│   ├── routes/
│   │   ├── auth.js
│   │   ├── exams.js
│   │   └── scores.js
│   ├── .env                    ← Environment variables
│   ├── package.json
│   └── server.js               ← Express entry point
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.js  ← Global auth state
    │   ├── components/
    │   │   └── Layout.js       ← Sidebar + navigation
    │   ├── pages/
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   ├── Dashboard.js
    │   │   ├── ExamList.js
    │   │   ├── ExamRoom.js     ← Exam taking (timer, navigator)
    │   │   ├── Result.js       ← Score + question breakdown
    │   │   ├── History.js      ← Attempt history
    │   │   ├── Leaderboard.js  ← Per-exam + overall rankings
    │   │   └── Reports.js      ← Charts (Bar, Pie, Radar)
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    └── package.json
```

---

## 🗄️ DATABASE DESIGN

### Table 1 — `students`
| Field | Type | Constraints |
|-------|------|-------------|
| student_id | INT | PRIMARY KEY, AUTO_INCREMENT |
| full_name | VARCHAR(100) | NOT NULL |
| email | VARCHAR(150) | NOT NULL, UNIQUE |
| password_hash | VARCHAR(255) | NOT NULL |
| roll_number | VARCHAR(30) | NOT NULL, UNIQUE |
| branch | VARCHAR(80) | NOT NULL |
| semester | TINYINT | NOT NULL, CHECK (1–8) |
| is_active | BOOLEAN | DEFAULT TRUE |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |

### Table 2 — `exams`
| Field | Type | Constraints |
|-------|------|-------------|
| exam_id | INT | PRIMARY KEY, AUTO_INCREMENT |
| title | VARCHAR(200) | NOT NULL |
| subject | VARCHAR(100) | NOT NULL |
| total_marks | INT | NOT NULL |
| pass_marks | INT | NOT NULL, CHECK (≤ total_marks) |
| duration_min | INT | NOT NULL |
| start_time | DATETIME | NOT NULL |
| end_time | DATETIME | CHECK (end > start) |
| is_active | BOOLEAN | DEFAULT TRUE |

### Table 3 — `questions`
| Field | Type | Constraints |
|-------|------|-------------|
| question_id | INT | PRIMARY KEY, AUTO_INCREMENT |
| exam_id | INT | FK → exams(exam_id) ON DELETE CASCADE |
| question_text | TEXT | NOT NULL |
| option_a/b/c/d | VARCHAR(300) | NOT NULL |
| correct_option | CHAR(1) | CHECK IN ('A','B','C','D') |
| marks | INT | DEFAULT 1 |
| difficulty | ENUM | 'Easy','Medium','Hard' |
| topic | VARCHAR(100) | |

### Table 4 — `answers`
| Field | Type | Constraints |
|-------|------|-------------|
| answer_id | INT | PRIMARY KEY, AUTO_INCREMENT |
| student_id | INT | FK → students |
| exam_id | INT | FK → exams |
| question_id | INT | FK → questions |
| chosen_option | CHAR(1) | CHECK IN ('A','B','C','D') |
| is_correct | BOOLEAN | DEFAULT FALSE (set by trigger) |
| marks_awarded | INT | DEFAULT 0 (set by trigger) |
| UNIQUE | | (student_id, exam_id, question_id) |

### Table 5 — `scores`
| Field | Type | Constraints |
|-------|------|-------------|
| score_id | INT | PRIMARY KEY, AUTO_INCREMENT |
| student_id | INT | FK → students |
| exam_id | INT | FK → exams |
| total_score | INT | DEFAULT 0 |
| percentage | DECIMAL(5,2) | DEFAULT 0.00 |
| grade | CHAR(2) | A+/A/B/C/D/F |
| passed | BOOLEAN | |
| time_taken_min | INT | |
| UNIQUE | | (student_id, exam_id) |

---

## ⚡ TRIGGERS

| Trigger | Event | Purpose |
|---------|-------|---------|
| `auto_evaluate_answer` | AFTER INSERT on answers | Auto-sets is_correct and marks_awarded |
| `update_score_on_answer` | AFTER UPDATE on answers | Syncs scores table, calculates grade/percentage |
| `prevent_duplicate_exam_attempt` | BEFORE INSERT on answers | Blocks re-attempts |

---

## 📦 STORED PROCEDURES

| Procedure | Purpose |
|-----------|---------|
| `sp_get_leaderboard(exam_id, limit)` | Top N scorers for a specific exam |
| `sp_get_attempt_history(student_id)` | Full exam history for a student |
| `sp_subject_difficulty_report()` | Wrong-answer % per subject/difficulty |
| `sp_submit_exam(...)` | Atomic exam submission (JSON answers) |
| `sp_top_scorers_overall(limit)` | Top N students across all exams |

---

## 🚀 STEP-BY-STEP SETUP INSTRUCTIONS

---

### STEP 1 — Install MySQL (if not installed)

#### Option A: MySQL Community Server (Recommended)
1. Go to → https://dev.mysql.com/downloads/mysql/
2. Download **MySQL Community Server 8.0** for your OS (Windows/macOS/Linux)
3. Run the installer → choose "Developer Default" setup
4. Set a root password (remember it — you'll need it later!)
5. Finish installation

#### Option B: XAMPP (Easiest for beginners)
1. Go to → https://www.apachefriends.org/
2. Download and install XAMPP
3. Open XAMPP Control Panel → Start **MySQL**
4. Default credentials: user = `root`, password = `` (empty)

---

### STEP 2 — Install MySQL Workbench (GUI Interface)

1. Go to → https://dev.mysql.com/downloads/workbench/
2. Download MySQL Workbench 8.0 for your OS
3. Install it
4. Open MySQL Workbench
5. Under "MySQL Connections" click the **+** button
6. Fill in:
   - Connection Name: `LocalDB`
   - Hostname: `127.0.0.1`
   - Port: `3306`
   - Username: `root`
7. Click **Test Connection** → enter your password
8. Click **OK**

> 💡 **Alternative to Workbench**: You can also use **phpMyAdmin** (comes with XAMPP) at http://localhost/phpmyadmin

---

### STEP 3 — Create the Database & Tables

1. Open MySQL Workbench → double-click your connection
2. Click **File → Open SQL Script**
3. Open `database/schema.sql`
4. Press **Ctrl+Shift+Enter** (or click the lightning ⚡ button) to run ALL
5. You should see: `online_exam_db` appear in the left panel under Schemas
6. You'll see 5 tables: `students`, `exams`, `questions`, `answers`, `scores`

---

### STEP 4 — Add Triggers

1. Click **File → Open SQL Script**
2. Open `database/triggers.sql`
3. Press **Ctrl+Shift+Enter** to run
4. To verify: in the left panel expand `online_exam_db → Triggers`
   - You should see: `auto_evaluate_answer`, `update_score_on_answer`, `prevent_duplicate_exam_attempt`

---

### STEP 5 — Add Stored Procedures

1. Click **File → Open SQL Script**
2. Open `database/stored_procedures.sql`
3. Press **Ctrl+Shift+Enter** to run
4. To verify: expand `online_exam_db → Stored Procedures`
   - You should see all 5 procedures listed

---

### STEP 6 — Load Sample Data

1. Click **File → Open SQL Script**
2. Open `database/seed.sql`
3. Press **Ctrl+Shift+Enter** to run
4. This adds:
   - 5 sample students
   - 3 sample exams
   - 5 sample questions for Exam 1

---

### STEP 7 — Configure the Backend

1. Open a terminal in the `backend/` folder
2. Edit `.env` file — change these values:
   ```
   DB_PASSWORD=your_actual_mysql_root_password
   JWT_SECRET=any_long_random_string_here_like_abc123xyz456
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm run dev
   ```
5. You should see: `Server started on port 5000`
6. Test it: open browser → http://localhost:5000
   - Should show: `{"status":"Online Exam API running ✅"}`

---

### STEP 8 — Start the Frontend

1. Open a **new terminal** in the `frontend/` folder
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React app:
   ```bash
   npm start
   ```
4. Browser opens → http://localhost:3000
5. You'll see the Login page

---

### STEP 9 — Test the Application

1. Go to http://localhost:3000/register
2. Create your account (use any email + roll number)
3. Login → you'll be taken to the Dashboard
4. Click **Exams** → start DBMS Mid-Term
5. Answer all questions → Submit
6. View your Result and Leaderboard

---

### STEP 10 — Verify Triggers in Workbench

After submitting an exam, run these queries in Workbench to verify triggers worked:

```sql
USE online_exam_db;

-- Check answers were auto-evaluated (trigger 1 + 2)
SELECT * FROM answers;

-- Check scores were auto-populated (trigger 2)
SELECT * FROM scores;

-- Run stored procedure manually
CALL sp_get_leaderboard(1, 10);
CALL sp_get_attempt_history(1);
CALL sp_subject_difficulty_report();
CALL sp_top_scorers_overall(5);
```

---

## 🔑 KEY QUERIES (for your viva/report)

```sql
-- Top scorers for an exam
CALL sp_get_leaderboard(1, 5);

-- Subject difficulty analysis
CALL sp_subject_difficulty_report();

-- Student attempt history
CALL sp_get_attempt_history(1);

-- Overall top performers
CALL sp_top_scorers_overall(10);

-- Manual: students who passed
SELECT s.full_name, sc.percentage, sc.grade
FROM scores sc JOIN students s ON s.student_id = sc.student_id
WHERE sc.passed = TRUE ORDER BY sc.percentage DESC;

-- Manual: question-wise accuracy
SELECT q.question_text, q.difficulty,
  SUM(a.is_correct) as correct, COUNT(*) as total,
  ROUND(SUM(a.is_correct)/COUNT(*)*100, 1) as accuracy_pct
FROM answers a JOIN questions q ON q.question_id = a.question_id
GROUP BY a.question_id ORDER BY accuracy_pct ASC;
```

---

## 🖥️ FRONTEND SCREENS SUMMARY

| Screen | Route | Description |
|--------|-------|-------------|
| Login | `/login` | Email + password form |
| Register | `/register` | Full student registration form |
| Dashboard | `/dashboard` | Stats, upcoming exams, recent results |
| Exam List | `/exams` | Browse exams with pending/completed filter |
| Exam Room | `/exams/:id` | Timer, question navigator, MCQ options |
| Result | `/result/:examId` | Score circle, grade, per-question breakdown |
| History | `/history` | Table of all attempts (from stored procedure) |
| Leaderboard | `/leaderboard/:examId` | Top scorers with medals |
| Reports | `/reports` | Bar, Pie, Radar charts + difficulty table |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Recharts |
| Backend | Node.js, Express.js |
| Database | MySQL 8.0 |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| DB Driver | mysql2 (Promise-based) |

---

## 🐛 Common Errors & Fixes

| Error | Fix |
|-------|-----|
| `ER_ACCESS_DENIED` | Wrong password in `.env` |
| `ECONNREFUSED 3306` | MySQL not running — start it in XAMPP/Services |
| `Cannot find module` | Run `npm install` in the correct folder |
| `Port 3000 in use` | Kill it: `npx kill-port 3000` |
| `CORS error` | Make sure backend is on port 5000 and proxy is set in frontend package.json |
| Trigger not firing | Make sure you ran `triggers.sql` with correct DELIMITER |
