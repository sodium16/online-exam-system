-- ============================================================
--  SEED DATA — for testing
-- ============================================================
USE online_exam_db;

-- Students (passwords are bcrypt hash of "Test@1234")
INSERT INTO students (full_name, email, password_hash, roll_number, branch, semester) VALUES
('Arjun Sharma',   'arjun@example.com',   '$2b$10$dummyhash1exampleonly', 'CS21001', 'Computer Science', 5),
('Priya Nair',     'priya@example.com',   '$2b$10$dummyhash2exampleonly', 'CS21002', 'Computer Science', 5),
('Rahul Mehta',    'rahul@example.com',   '$2b$10$dummyhash3exampleonly', 'EC21001', 'Electronics',      3),
('Sneha Reddy',    'sneha@example.com',   '$2b$10$dummyhash4exampleonly', 'ME21001', 'Mechanical',       4),
('Vikram Patel',   'vikram@example.com',  '$2b$10$dummyhash5exampleonly', 'CS21003', 'Computer Science', 5);

-- Exams
INSERT INTO exams (title, subject, description, total_marks, pass_marks, duration_min, start_time, end_time) VALUES
('DBMS Mid-Term',        'Database Systems',    'Covers SQL, ER Model, Normalization',  50, 20, 60, '2025-06-10 09:00:00', '2025-06-10 10:00:00'),
('Data Structures Quiz', 'Data Structures',     'Arrays, Linked Lists, Trees, Graphs',  30, 12, 30, '2025-06-12 11:00:00', '2025-06-12 11:30:00'),
('OS Fundamentals',      'Operating Systems',   'Process, Memory, File System',         40, 16, 45, '2025-06-15 14:00:00', '2025-06-15 14:45:00');

-- Questions for Exam 1
INSERT INTO questions (exam_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks, difficulty, topic) VALUES
(1, 'What does SQL stand for?',
   'Structured Query Language', 'Simple Query Language',
   'Sequential Query Language', 'Standard Query Language', 'A', 2, 'Easy', 'SQL Basics'),
(1, 'Which normal form eliminates partial dependencies?',
   '1NF', '2NF', '3NF', 'BCNF', 'B', 2, 'Medium', 'Normalization'),
(1, 'A foreign key references the ___ of another table.',
   'Foreign key', 'Primary key', 'Composite key', 'Candidate key', 'B', 2, 'Easy', 'Keys'),
(1, 'Which JOIN returns only matching rows from both tables?',
   'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'FULL JOIN', 'C', 2, 'Easy', 'Joins'),
(1, 'ACID stands for?',
   'Atomicity, Concurrency, Isolation, Durability',
   'Atomicity, Consistency, Isolation, Durability',
   'Atomicity, Consistency, Independence, Durability',
   'Availability, Consistency, Isolation, Durability', 'B', 2, 'Medium', 'Transactions');
