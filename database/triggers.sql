-- ============================================================
--  TRIGGERS
-- ============================================================
USE online_exam_db;

DELIMITER $$

-- -----------------------------------------------------------
-- TRIGGER 1: auto_evaluate_answer
-- Fires AFTER an answer row is inserted.
-- Sets is_correct and marks_awarded automatically.
-- -----------------------------------------------------------
DELIMITER $$

CREATE TRIGGER auto_evaluate_answer
BEFORE INSERT ON answers
FOR EACH ROW
BEGIN
  DECLARE correct CHAR(1);
  DECLARE pts INT;

  SELECT correct_option, marks
    INTO correct, pts
    FROM questions
   WHERE question_id = NEW.question_id;

  IF NEW.chosen_option = correct THEN
    SET NEW.is_correct = TRUE;
    SET NEW.marks_awarded = pts;
  ELSE
    SET NEW.is_correct = FALSE;
    SET NEW.marks_awarded = 0;
  END IF;
END$$

-- -----------------------------------------------------------
-- TRIGGER 2: update_score_on_answer
-- Fires AFTER an answer row is updated (evaluation done).
-- Keeps the scores table in sync.
-- -----------------------------------------------------------
CREATE TRIGGER update_score_on_answer
AFTER INSERT ON answers
FOR EACH ROW
BEGIN
  DECLARE v_total_score     INT DEFAULT 0;
  DECLARE v_total_attempted INT DEFAULT 0;
  DECLARE v_total_correct   INT DEFAULT 0;
  DECLARE v_total_marks     INT DEFAULT 0;
  DECLARE v_pass_marks      INT DEFAULT 0;
  DECLARE v_percentage      DECIMAL(5,2) DEFAULT 0;
  DECLARE v_grade           CHAR(2) DEFAULT 'F';
  DECLARE v_passed          BOOLEAN DEFAULT FALSE;

  -- Aggregate for this student + exam
  SELECT  COALESCE(SUM(marks_awarded), 0),
          COUNT(*),
          COALESCE(SUM(is_correct), 0)
    INTO  v_total_score, v_total_attempted, v_total_correct
    FROM  answers
   WHERE  student_id = NEW.student_id
     AND  exam_id    = NEW.exam_id;

  SELECT total_marks, pass_marks
    INTO v_total_marks, v_pass_marks
    FROM exams WHERE exam_id = NEW.exam_id;

  IF v_total_marks > 0 THEN
    SET v_percentage = (v_total_score / v_total_marks) * 100;
  END IF;

  -- Grade logic
  SET v_grade = CASE
    WHEN v_percentage >= 90 THEN 'A+'
    WHEN v_percentage >= 80 THEN 'A'
    WHEN v_percentage >= 70 THEN 'B'
    WHEN v_percentage >= 60 THEN 'C'
    WHEN v_percentage >= 50 THEN 'D'
    ELSE 'F'
  END;

  SET v_passed = (v_total_score >= v_pass_marks);

  INSERT INTO scores (student_id, exam_id, total_score, total_attempted,
                      total_correct, percentage, grade, passed)
  VALUES (NEW.student_id, NEW.exam_id, v_total_score, v_total_attempted,
          v_total_correct, v_percentage, v_grade, v_passed)
  ON DUPLICATE KEY UPDATE
    total_score     = v_total_score,
    total_attempted = v_total_attempted,
    total_correct   = v_total_correct,
    percentage      = v_percentage,
    grade           = v_grade,
    passed          = v_passed;
END$$

-- -----------------------------------------------------------
-- TRIGGER 3: prevent_duplicate_exam_attempt
-- Fires BEFORE inserting an answer; blocks re-attempts.
-- -----------------------------------------------------------
CREATE TRIGGER prevent_duplicate_exam_attempt
BEFORE INSERT ON answers
FOR EACH ROW
BEGIN
  DECLARE attempt_count INT;

  SELECT COUNT(*) INTO attempt_count
    FROM scores
   WHERE student_id = NEW.student_id
     AND exam_id    = NEW.exam_id;

  IF attempt_count > 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Student has already submitted this exam.';
  END IF;
END$$

DELIMITER ;
