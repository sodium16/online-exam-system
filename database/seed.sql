-- ============================================================
--  SEED DATA
-- ============================================================
USE online_exam_db;

-- Departments
INSERT IGNORE INTO departments (name, code) VALUES
  ('Computer Science',      'CS'),
  ('Electronics',           'EC'),
  ('Mechanical',            'ME'),
  ('Civil',                 'CE'),
  ('Chemical',              'CH'),
  ('Information Technology','IT');

-- Admin account  (email: admin@examportal.com  password: Admin@1234)
-- Hash for "Admin@1234" — regenerate with node -e "const b=require('bcryptjs');b.hash('Admin@1234',10).then(console.log)"
INSERT IGNORE INTO admin (full_name, email, password_hash) VALUES
  ('System Admin', 'admin@examportal.com',
   '$2b$10$Wh4bMkB6vBqN3YlR8ZcGQOW0lK9mXpTfJ1sUeDhAiYvOcRn7gP2Ci');

-- Students (password for all: Test@1234)
INSERT IGNORE INTO students (full_name, email, password_hash, roll_number, dept_id, semester) VALUES
  ('Arjun Sharma',  'arjun@example.com',  '$2b$10$Wh4bMkB6vBqN3YlR8ZcGQOW0lK9mXpTfJ1sUeDhAiYvOcRn7gP2Ci', 'CS21001', 1, 5),
  ('Priya Nair',    'priya@example.com',  '$2b$10$Wh4bMkB6vBqN3YlR8ZcGQOW0lK9mXpTfJ1sUeDhAiYvOcRn7gP2Ci', 'CS21002', 1, 5),
  ('Rahul Mehta',   'rahul@example.com',  '$2b$10$Wh4bMkB6vBqN3YlR8ZcGQOW0lK9mXpTfJ1sUeDhAiYvOcRn7gP2Ci', 'EC21001', 2, 3),
  ('Sneha Reddy',   'sneha@example.com',  '$2b$10$Wh4bMkB6vBqN3YlR8ZcGQOW0lK9mXpTfJ1sUeDhAiYvOcRn7gP2Ci', 'ME21001', 3, 4),
  ('Vikram Patel',  'vikram@example.com', '$2b$10$Wh4bMkB6vBqN3YlR8ZcGQOW0lK9mXpTfJ1sUeDhAiYvOcRn7gP2Ci', 'IT21001', 6, 5);

-- CS Exam (dept_id=1) — Always open (starts 1 day ago, ends 30 days from now)
INSERT INTO exams (title, subject, description, dept_id, pass_percent, duration_min, start_time, end_time) VALUES
  ('DBMS Mid-Term', 'Database Systems', 'Covers SQL, ER Model, Normalization', 1, 40, 60,
   DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY));

-- EC Exam (dept_id=2)
INSERT INTO exams (title, subject, description, dept_id, pass_percent, duration_min, start_time, end_time) VALUES
  ('Signals & Systems Quiz', 'Electronics', 'Fourier, Laplace, Z-Transform', 2, 40, 45,
   DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY));

-- Open exam (dept_id = NULL)
INSERT INTO exams (title, subject, description, dept_id, pass_percent, duration_min, start_time, end_time) VALUES
  ('Aptitude Test', 'General Aptitude', 'Logical reasoning and quantitative aptitude', NULL, 50, 30,
   DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY));

-- Questions for DBMS exam (exam_id=1), 10 marks each → total_marks auto = 50
INSERT INTO questions (exam_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks, difficulty, topic) VALUES
(1,'What does SQL stand for?','Structured Query Language','Simple Query Language','Sequential Query Language','Standard Query Language','A',10,'Easy','SQL Basics'),
(1,'Which normal form eliminates partial dependencies?','1NF','2NF','3NF','BCNF','B',10,'Medium','Normalization'),
(1,'A foreign key references the ___ of another table.','Foreign key','Primary key','Composite key','Candidate key','B',10,'Easy','Keys'),
(1,'Which JOIN returns only matching rows from both tables?','LEFT JOIN','RIGHT JOIN','INNER JOIN','FULL JOIN','C',10,'Easy','Joins'),
(1,'ACID stands for?',
 'Atomicity Concurrency Isolation Durability',
 'Atomicity Consistency Isolation Durability',
 'Atomicity Consistency Independence Durability',
 'Availability Consistency Isolation Durability','B',10,'Medium','Transactions');

-- Questions for EC exam (exam_id=2)
INSERT INTO questions (exam_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks, difficulty, topic) VALUES
(2,'Fourier series represents a signal as a sum of?','Polynomials','Sinusoids','Exponentials','Logarithms','B',5,'Easy','Fourier'),
(2,'The Laplace transform of a unit step function is?','1/s','1/s²','s','1','A',5,'Medium','Laplace'),
(2,'Z-transform is used for ___ signals.','Continuous','Discrete','Analog','Optical','B',5,'Easy','Z-Transform');
