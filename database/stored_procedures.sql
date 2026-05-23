-- ============================================================
--  STORED PROCEDURES v2
-- ============================================================
USE online_exam_db;

DELIMITER $$

-- SP 1: sp_get_leaderboard
CREATE PROCEDURE sp_get_leaderboard(IN p_exam_id INT, IN p_limit INT)
BEGIN
  SELECT
    ROW_NUMBER() OVER (ORDER BY s.total_score DESC, s.submitted_at ASC) AS `rank`,
    st.student_id, st.full_name, st.roll_number,
    d.name AS department, d.code AS dept_code,
    s.total_score, s.percentage, s.grade, s.total_correct, s.time_taken_min, s.submitted_at
  FROM scores s
  JOIN students   st ON st.student_id = s.student_id
  JOIN departments d  ON d.dept_id    = st.dept_id
  WHERE s.exam_id = p_exam_id
  ORDER BY s.total_score DESC, s.submitted_at ASC
  LIMIT p_limit;
END$$

-- SP 2: sp_get_attempt_history
CREATE PROCEDURE sp_get_attempt_history(IN p_student_id INT)
BEGIN
  SELECT e.exam_id, e.title AS exam_title, e.subject,
    d.name AS department, d.code AS dept_code,
    s.total_score, e.total_marks, s.percentage, s.grade,
    s.passed, s.total_correct, s.total_attempted, s.time_taken_min, s.submitted_at
  FROM scores s
  JOIN exams e        ON e.exam_id  = s.exam_id
  LEFT JOIN departments d ON d.dept_id = e.dept_id
  WHERE s.student_id = p_student_id
  ORDER BY s.submitted_at DESC;
END$$

-- SP 3: sp_subject_difficulty_report
CREATE PROCEDURE sp_subject_difficulty_report()
BEGIN
  SELECT e.subject, d.name AS department, q.difficulty,
    COUNT(q.question_id)   AS total_questions,
    COALESCE(SUM(a.is_correct),0) AS correct_answers,
    COUNT(a.answer_id)     AS total_attempts,
    ROUND((1 - COALESCE(SUM(a.is_correct),0) / NULLIF(COUNT(a.answer_id),0)) * 100, 2) AS wrong_pct
  FROM questions q
  JOIN exams e ON e.exam_id = q.exam_id
  LEFT JOIN departments d  ON d.dept_id = e.dept_id
  LEFT JOIN answers a ON a.question_id = q.question_id
  GROUP BY e.subject, d.name, q.difficulty
  ORDER BY wrong_pct DESC;
END$$

-- SP 4: sp_submit_exam (atomic JSON-based submission)
CREATE PROCEDURE sp_submit_exam(
  IN p_student_id INT, IN p_exam_id INT,
  IN p_time_taken INT, IN p_answers JSON)
BEGIN
  DECLARE i INT DEFAULT 0;
  DECLARE arr_len INT;
  DECLARE v_qid INT;
  DECLARE v_opt CHAR(1);
  SET arr_len = JSON_LENGTH(p_answers);
  START TRANSACTION;
  WHILE i < arr_len DO
    SET v_qid = JSON_UNQUOTE(JSON_EXTRACT(p_answers, CONCAT('$[',i,'].question_id')));
    SET v_opt = JSON_UNQUOTE(JSON_EXTRACT(p_answers, CONCAT('$[',i,'].chosen')));
    INSERT IGNORE INTO answers (student_id, exam_id, question_id, chosen_option)
    VALUES (p_student_id, p_exam_id, v_qid, v_opt);
    SET i = i + 1;
  END WHILE;
  UPDATE scores SET time_taken_min = p_time_taken
   WHERE student_id = p_student_id AND exam_id = p_exam_id;
  COMMIT;
END$$

-- SP 5: sp_top_scorers_overall
CREATE PROCEDURE sp_top_scorers_overall(IN p_limit INT)
BEGIN
  SELECT st.student_id, st.full_name, st.roll_number,
    d.name AS department, d.code AS dept_code,
    COUNT(s.exam_id)           AS exams_attempted,
    ROUND(AVG(s.percentage),2) AS avg_percentage,
    SUM(s.total_score)         AS cumulative_score,
    SUM(s.passed)              AS exams_passed
  FROM scores s
  JOIN students    st ON st.student_id = s.student_id
  JOIN departments d  ON d.dept_id     = st.dept_id
  GROUP BY st.student_id
  ORDER BY avg_percentage DESC, cumulative_score DESC
  LIMIT p_limit;
END$$

-- SP 6: sp_admin_overview  — single call for admin dashboard stats
CREATE PROCEDURE sp_admin_overview()
BEGIN
  SELECT
    (SELECT COUNT(*) FROM students WHERE is_active = TRUE) AS total_students,
    (SELECT COUNT(*) FROM exams    WHERE is_active = TRUE) AS total_exams,
    (SELECT COUNT(*) FROM questions)                       AS total_questions,
    (SELECT COUNT(*) FROM scores)                          AS total_attempts,
    (SELECT ROUND(AVG(percentage),1) FROM scores)          AS overall_avg_pct,
    (SELECT COUNT(*) FROM scores WHERE passed = TRUE)      AS total_passed,
    (SELECT COUNT(*) FROM departments)                     AS total_departments;
END$$

DELIMITER ;