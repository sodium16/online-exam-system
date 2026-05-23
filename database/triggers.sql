-- ============================================================
--  TRIGGERS 
-- ============================================================
USE online_exam_db;

DELIMITER $$

-- -----------------------------------------------------------
-- TRIGGER 1: auto_evaluate_answer
-- BEFORE INSERT on answers
-- Sets is_correct + marks_awarded automatically
-- -----------------------------------------------------------

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
-- AFTER UPDATE on answers — keeps scores table in sync
-- -----------------------------------------------------------
CREATE TRIGGER update_score_on_answer
AFTER UPDATE ON answers
FOR EACH ROW
BEGIN
  DECLARE v_score     INT     DEFAULT 0;
  DECLARE v_attempted INT     DEFAULT 0;
  DECLARE v_correct   INT     DEFAULT 0;
  DECLARE v_total_marks INT   DEFAULT 0;
  DECLARE v_pass_pct  TINYINT DEFAULT 40;
  DECLARE v_pct       DECIMAL(5,2) DEFAULT 0;
  DECLARE v_grade     CHAR(2) DEFAULT 'F';
  DECLARE v_passed    BOOLEAN DEFAULT FALSE;

  SELECT COALESCE(SUM(marks_awarded),0), COUNT(*), COALESCE(SUM(is_correct),0)
    INTO v_score, v_attempted, v_correct
    FROM answers WHERE student_id = NEW.student_id AND exam_id = NEW.exam_id;

  SELECT total_marks, pass_percent INTO v_total_marks, v_pass_pct
    FROM exams WHERE exam_id = NEW.exam_id;

  IF v_total_marks > 0 THEN
    SET v_pct = (v_score / v_total_marks) * 100;
  END IF;

  SET v_grade = CASE
    WHEN v_pct >= 90 THEN 'A+'
    WHEN v_pct >= 80 THEN 'A'
    WHEN v_pct >= 70 THEN 'B'
    WHEN v_pct >= 60 THEN 'C'
    WHEN v_pct >= 50 THEN 'D'
    ELSE 'F'
  END;

  SET v_passed = (v_pct >= v_pass_pct);

  INSERT INTO scores (student_id, exam_id, total_score, total_attempted, total_correct, percentage, grade, passed)
  VALUES (NEW.student_id, NEW.exam_id, v_score, v_attempted, v_correct, v_pct, v_grade, v_passed)
  ON DUPLICATE KEY UPDATE
    total_score = v_score, total_attempted = v_attempted,
    total_correct = v_correct, percentage = v_pct, grade = v_grade, passed = v_passed;
END$$

-- -----------------------------------------------------------
-- TRIGGER 3: prevent_duplicate_attempt
-- -----------------------------------------------------------
CREATE TRIGGER prevent_duplicate_exam_attempt
BEFORE INSERT ON answers
FOR EACH ROW
BEGIN
  DECLARE cnt INT;
  SELECT COUNT(*) INTO cnt FROM scores
   WHERE student_id = NEW.student_id AND exam_id = NEW.exam_id;
  IF cnt > 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Student has already submitted this exam.';
  END IF;
END$$

-- -----------------------------------------------------------
-- TRIGGER 4: recalc_exam_total_marks
-- AFTER INSERT on questions — auto-updates exams.total_marks
-- and exams.pass_marks based on pass_percent
-- -----------------------------------------------------------
CREATE TRIGGER recalc_total_on_question_insert
AFTER INSERT ON questions
FOR EACH ROW
BEGIN
  DECLARE v_total    INT;
  DECLARE v_pass_pct TINYINT;
  SELECT COALESCE(SUM(marks),0) INTO v_total FROM questions WHERE exam_id = NEW.exam_id;
  SELECT pass_percent INTO v_pass_pct FROM exams WHERE exam_id = NEW.exam_id;
  UPDATE exams
     SET total_marks = v_total,
         pass_marks  = CEIL(v_total * v_pass_pct / 100)
   WHERE exam_id = NEW.exam_id;
END$$

-- -----------------------------------------------------------
-- TRIGGER 5: recalc on question DELETE
-- -----------------------------------------------------------
CREATE TRIGGER recalc_total_on_question_delete
AFTER DELETE ON questions
FOR EACH ROW
BEGIN
  DECLARE v_total    INT;
  DECLARE v_pass_pct TINYINT;
  SELECT COALESCE(SUM(marks),0) INTO v_total FROM questions WHERE exam_id = OLD.exam_id;
  SELECT pass_percent INTO v_pass_pct FROM exams WHERE exam_id = OLD.exam_id;
  UPDATE exams
     SET total_marks = v_total,
         pass_marks  = CEIL(v_total * v_pass_pct / 100)
   WHERE exam_id = OLD.exam_id;
END$$

DELIMITER ;