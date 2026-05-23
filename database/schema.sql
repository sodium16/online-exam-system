-- ============================================================
--  ONLINE EXAMINATION SYSTEM — DATABASE SCHEMA
--  MySQL 8.0+
-- ============================================================

CREATE DATABASE IF NOT EXISTS online_exam_db;
USE online_exam_db;

-- ============================================================
-- TABLE 1: students
-- ============================================================
CREATE TABLE IF NOT EXISTS students (
  student_id    INT           AUTO_INCREMENT PRIMARY KEY,
  full_name     VARCHAR(100)  NOT NULL,
  email         VARCHAR(150)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  roll_number   VARCHAR(30)   NOT NULL UNIQUE,
  branch        VARCHAR(80)   NOT NULL,
  semester      TINYINT       NOT NULL CHECK (semester BETWEEN 1 AND 8),
  profile_pic   VARCHAR(255)  DEFAULT NULL,
  is_active     BOOLEAN       DEFAULT TRUE,
  created_at    DATETIME      DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE 2: exams
-- ============================================================
CREATE TABLE IF NOT EXISTS exams (
  exam_id       INT           AUTO_INCREMENT PRIMARY KEY,
  title         VARCHAR(200)  NOT NULL,
  subject       VARCHAR(100)  NOT NULL,
  description   TEXT,
  total_marks   INT           NOT NULL DEFAULT 100,
  pass_marks    INT           NOT NULL DEFAULT 40,
  duration_min  INT           NOT NULL COMMENT 'Duration in minutes',
  start_time    DATETIME      NOT NULL,
  end_time      DATETIME      NOT NULL,
  is_active     BOOLEAN       DEFAULT TRUE,
  created_by    VARCHAR(100)  DEFAULT 'Admin',
  created_at    DATETIME      DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_marks CHECK (pass_marks <= total_marks),
  CONSTRAINT chk_time  CHECK (end_time > start_time)
);

-- ============================================================
-- TABLE 3: questions
-- ============================================================
CREATE TABLE IF NOT EXISTS questions (
  question_id   INT           AUTO_INCREMENT PRIMARY KEY,
  exam_id       INT           NOT NULL,
  question_text TEXT          NOT NULL,
  option_a      VARCHAR(300)  NOT NULL,
  option_b      VARCHAR(300)  NOT NULL,
  option_c      VARCHAR(300)  NOT NULL,
  option_d      VARCHAR(300)  NOT NULL,
  correct_option CHAR(1)      NOT NULL CHECK (correct_option IN ('A','B','C','D')),
  marks         INT           NOT NULL DEFAULT 1,
  difficulty    ENUM('Easy','Medium','Hard') DEFAULT 'Medium',
  topic         VARCHAR(100),
  created_at    DATETIME      DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (exam_id) REFERENCES exams(exam_id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE 4: answers  (one row per question per attempt)
-- ============================================================
CREATE TABLE IF NOT EXISTS answers (
  answer_id     INT           AUTO_INCREMENT PRIMARY KEY,
  student_id    INT           NOT NULL,
  exam_id       INT           NOT NULL,
  question_id   INT           NOT NULL,
  chosen_option CHAR(1)       CHECK (chosen_option IN ('A','B','C','D')),
  is_correct    BOOLEAN       DEFAULT FALSE,
  marks_awarded INT           DEFAULT 0,
  answered_at   DATETIME      DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id)  REFERENCES students(student_id)  ON DELETE CASCADE,
  FOREIGN KEY (exam_id)     REFERENCES exams(exam_id)        ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE,
  UNIQUE KEY uq_attempt (student_id, exam_id, question_id)
);

-- ============================================================
-- TABLE 5: scores  (one row per student per exam)
-- ============================================================
CREATE TABLE IF NOT EXISTS scores (
  score_id        INT     AUTO_INCREMENT PRIMARY KEY,
  student_id      INT     NOT NULL,
  exam_id         INT     NOT NULL,
  total_score     INT     DEFAULT 0,
  total_attempted INT     DEFAULT 0,
  total_correct   INT     DEFAULT 0,
  percentage      DECIMAL(5,2) DEFAULT 0.00,
  grade           CHAR(2) DEFAULT 'F',
  passed          BOOLEAN DEFAULT FALSE,
  time_taken_min  INT     DEFAULT 0,
  submitted_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  FOREIGN KEY (exam_id)    REFERENCES exams(exam_id)       ON DELETE CASCADE,
  UNIQUE KEY uq_score (student_id, exam_id)
);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX idx_answers_student  ON answers (student_id);
CREATE INDEX idx_answers_exam     ON answers (exam_id);
CREATE INDEX idx_scores_exam      ON scores  (exam_id);
CREATE INDEX idx_questions_exam   ON questions (exam_id);
