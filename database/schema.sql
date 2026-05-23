-- ============================================================
--  ONLINE EXAMINATION SYSTEM 
-- ============================================================

DROP DATABASE IF EXISTS online_exam_db;
CREATE DATABASE online_exam_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE online_exam_db;

-- ============================================================
-- TABLE 1: admin  (single admin, no self-registration)
-- ============================================================
CREATE TABLE admin (
  admin_id      INT           AUTO_INCREMENT PRIMARY KEY,
  full_name     VARCHAR(100)  NOT NULL,
  email         VARCHAR(150)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  created_at    DATETIME      DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE 2: departments
-- ============================================================
CREATE TABLE departments (
  dept_id    INT          AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL UNIQUE,
  code       VARCHAR(20)  NOT NULL UNIQUE,
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE 3: students
-- ============================================================
CREATE TABLE students (
  student_id    INT           AUTO_INCREMENT PRIMARY KEY,
  full_name     VARCHAR(100)  NOT NULL,
  email         VARCHAR(150)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  roll_number   VARCHAR(30)   NOT NULL UNIQUE,
  dept_id       INT           NOT NULL,
  semester      TINYINT       NOT NULL CHECK (semester BETWEEN 1 AND 8),
  is_active     BOOLEAN       DEFAULT TRUE,
  created_at    DATETIME      DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);

-- ============================================================
-- TABLE 4: exams
--   dept_id NULL  = visible to ALL departments
--   dept_id set   = visible only to that department
-- ============================================================
CREATE TABLE exams (
  exam_id       INT           AUTO_INCREMENT PRIMARY KEY,
  title         VARCHAR(200)  NOT NULL,
  subject       VARCHAR(100)  NOT NULL,
  description   TEXT,
  dept_id       INT           DEFAULT NULL COMMENT 'NULL = all departments',
  total_marks   INT           NOT NULL DEFAULT 0  COMMENT 'Auto-computed from questions',
  pass_marks    INT           NOT NULL DEFAULT 0,
  pass_percent  TINYINT       NOT NULL DEFAULT 40 COMMENT 'Pass % threshold',
  duration_min  INT           NOT NULL,
  start_time    DATETIME      NOT NULL,
  end_time      DATETIME      NOT NULL,
  is_active     BOOLEAN       DEFAULT TRUE,
  created_at    DATETIME      DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_time CHECK (end_time > start_time),
  FOREIGN KEY (dept_id) REFERENCES departments(dept_id) ON DELETE SET NULL
);

-- ============================================================
-- TABLE 5: questions
-- ============================================================
CREATE TABLE questions (
  question_id    INT           AUTO_INCREMENT PRIMARY KEY,
  exam_id        INT           NOT NULL,
  question_text  TEXT          NOT NULL,
  option_a       VARCHAR(400)  NOT NULL,
  option_b       VARCHAR(400)  NOT NULL,
  option_c       VARCHAR(400)  NOT NULL,
  option_d       VARCHAR(400)  NOT NULL,
  correct_option CHAR(1)       NOT NULL CHECK (correct_option IN ('A','B','C','D')),
  marks          INT           NOT NULL DEFAULT 1,
  difficulty     ENUM('Easy','Medium','Hard') DEFAULT 'Medium',
  topic          VARCHAR(100),
  created_at     DATETIME      DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (exam_id) REFERENCES exams(exam_id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE 6: answers
-- ============================================================
CREATE TABLE answers (
  answer_id      INT     AUTO_INCREMENT PRIMARY KEY,
  student_id     INT     NOT NULL,
  exam_id        INT     NOT NULL,
  question_id    INT     NOT NULL,
  chosen_option  CHAR(1) CHECK (chosen_option IN ('A','B','C','D')),
  is_correct     BOOLEAN DEFAULT FALSE,
  marks_awarded  INT     DEFAULT 0,
  answered_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id)  REFERENCES students(student_id)  ON DELETE CASCADE,
  FOREIGN KEY (exam_id)     REFERENCES exams(exam_id)        ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE,
  UNIQUE KEY uq_attempt (student_id, exam_id, question_id)
);

-- ============================================================
-- TABLE 7: scores
-- ============================================================
CREATE TABLE scores (
  score_id        INT          AUTO_INCREMENT PRIMARY KEY,
  student_id      INT          NOT NULL,
  exam_id         INT          NOT NULL,
  total_score     INT          DEFAULT 0,
  total_attempted INT          DEFAULT 0,
  total_correct   INT          DEFAULT 0,
  percentage      DECIMAL(5,2) DEFAULT 0.00,
  grade           CHAR(2)      DEFAULT 'F',
  passed          BOOLEAN      DEFAULT FALSE,
  time_taken_min  INT          DEFAULT 0,
  submitted_at    DATETIME     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  FOREIGN KEY (exam_id)    REFERENCES exams(exam_id)       ON DELETE CASCADE,
  UNIQUE KEY uq_score (student_id, exam_id)
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_answers_student ON answers  (student_id);
CREATE INDEX idx_answers_exam    ON answers  (exam_id);
CREATE INDEX idx_scores_exam     ON scores   (exam_id);
CREATE INDEX idx_questions_exam  ON questions(exam_id);
CREATE INDEX idx_exams_dept      ON exams    (dept_id);
CREATE INDEX idx_students_dept   ON students (dept_id);