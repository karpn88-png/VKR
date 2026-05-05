--Автообновление даты в таблице VKR
CREATE OR REPLACE FUNCTION trg_set_vkr_updated_date()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_date := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_vkr_updated_date ON VKR;

CREATE TRIGGER trg_vkr_updated_date
BEFORE UPDATE ON VKR
FOR EACH ROW
EXECUTE FUNCTION trg_set_vkr_updated_date();

--Автонумерация версии ВКР
CREATE OR REPLACE FUNCTION trg_set_stage_result_version()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  max_ver smallint;
BEGIN
  IF NEW.version_number IS NULL OR NEW.version_number < 1 THEN
    SELECT COALESCE(MAX(version_number), 0)
      INTO max_ver
    FROM Completing_VKR_Stage_Result
    WHERE stage_ID = NEW.stage_ID
      AND student_ID = NEW.student_ID;

    NEW.version_number := max_ver + 1;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_stage_result_version ON Completing_VKR_Stage_Result;

CREATE TRIGGER trg_stage_result_version
BEFORE INSERT ON Completing_VKR_Stage_Result
FOR EACH ROW
EXECUTE FUNCTION trg_set_stage_result_version();

--Уведомление для преподавателя: студент выполнил этап
CREATE OR REPLACE FUNCTION trg_notify_stage_submitted()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  vkr_id uuid;
  teacher_user_id uuid;
BEGIN
  -- stage -> vkr
  SELECT s.VKR_ID INTO vkr_id
  FROM VKR_Stages s
  WHERE s.stage_ID = NEW.stage_ID;

  -- vkr -> teacher -> teacher user
  SELECT t.user_ID INTO teacher_user_id
  FROM VKR v
  JOIN Teachers t ON t.teacher_ID = v.teacher_ID
  WHERE v.VKR_ID = vkr_id;

  INSERT INTO Notifications(notification_type, notification_data, user_ID)
  VALUES (
    'STAGE_SUBMITTED'::notification_type,
    jsonb_build_object(
      'stage_ID', NEW.stage_ID,
      'student_ID', NEW.student_ID,
      'stage_result_ID', NEW.completing_VKR_stage_result_ID,
      'version_number', NEW.version_number
    ),
    teacher_user_id
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_stage_submitted_notify ON Completing_VKR_Stage_Result;

CREATE TRIGGER trg_stage_submitted_notify
AFTER INSERT ON Completing_VKR_Stage_Result
FOR EACH ROW
EXECUTE FUNCTION trg_notify_stage_submitted();

--Уведомление студенту: проверка начата
CREATE OR REPLACE FUNCTION trg_notify_check_started()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  student_user_id uuid;
BEGIN
  SELECT st.user_ID INTO student_user_id
  FROM Completing_VKR_Stage_Result r
  JOIN STUDENTS st ON st.student_ID = r.student_ID
  WHERE r.completing_VKR_stage_result_ID = NEW.completing_VKR_stage_result_ID;

  INSERT INTO Notifications(notification_type, notification_data, user_ID)
  VALUES (
    'CHECK_STARTED'::notification_type,
    jsonb_build_object(
      'check_ID', NEW.check_ID,
      'stage_result_ID', NEW.completing_VKR_stage_result_ID,
      'status', NEW.check_status::text
    ),
    student_user_id
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_started_notify ON Work_Check;

CREATE TRIGGER trg_check_started_notify
AFTER INSERT ON Work_Check
FOR EACH ROW
EXECUTE FUNCTION trg_notify_check_started();

--Уведомление студенту: результат проверки
CREATE OR REPLACE FUNCTION trg_notify_check_result()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  student_user_id uuid;
  ntype notification_type;
BEGIN
  -- интересуют только смены статуса
  IF NEW.check_status = OLD.check_status THEN
    RETURN NEW;
  END IF;

  IF NEW.check_status = 'PASSED'::check_status THEN
    ntype := 'CHECK_PASSED'::notification_type;
  ELSIF NEW.check_status = 'FAILED'::check_status THEN
    ntype := 'CHECK_FAILED'::notification_type;
  ELSE
    -- NEEDS_REVISION/IN_PROGRESS/PENDING можно не уведомлять или уведомлять отдельно — пока пропустим
    RETURN NEW;
  END IF;

  SELECT st.user_ID INTO student_user_id
  FROM Completing_VKR_Stage_Result r
  JOIN STUDENTS st ON st.student_ID = r.student_ID
  WHERE r.completing_VKR_stage_result_ID = NEW.completing_VKR_stage_result_ID;

  INSERT INTO Notifications(notification_type, notification_data, user_ID)
  VALUES (
    ntype,
    jsonb_build_object(
      'check_ID', NEW.check_ID,
      'stage_result_ID', NEW.completing_VKR_stage_result_ID,
      'status', NEW.check_status::text
    ),
    student_user_id
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_result_notify ON Work_Check;

CREATE TRIGGER trg_check_result_notify
AFTER UPDATE OF check_status ON Work_Check
FOR EACH ROW
EXECUTE FUNCTION trg_notify_check_result();

--Уведомления студенту, преподавателю: новые комментарий
CREATE OR REPLACE FUNCTION trg_notify_new_comment()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  vkr_id uuid;
  student_user_id uuid;
  teacher_user_id uuid;
  recipient uuid;
BEGIN
  -- получить stage_ID и student_ID из результата
  SELECT st.user_ID INTO student_user_id
  FROM Completing_VKR_Stage_Result r
  JOIN STUDENTS st ON st.student_ID = r.student_ID
  WHERE r.completing_VKR_stage_result_ID = NEW.completing_VKR_stage_result_ID;

  SELECT s.VKR_ID INTO vkr_id
  FROM Completing_VKR_Stage_Result r
  JOIN VKR_Stages s ON s.stage_ID = r.stage_ID
  WHERE r.completing_VKR_stage_result_ID = NEW.completing_VKR_stage_result_ID;

  SELECT t.user_ID INTO teacher_user_id
  FROM VKR v
  JOIN Teachers t ON t.teacher_ID = v.teacher_ID
  WHERE v.VKR_ID = vkr_id;

  -- определить получателя
  IF NEW.user_ID = student_user_id THEN
    recipient := teacher_user_id;
  ELSE
    recipient := student_user_id;
  END IF;

  INSERT INTO Notifications(notification_type, notification_data, user_ID)
  VALUES (
    'NEW_COMMENT'::notification_type,
    jsonb_build_object(
      'comment_ID', NEW.comment_ID,
      'stage_result_ID', NEW.completing_VKR_stage_result_ID
    ),
    recipient
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_new_comment_notify ON Comment;

CREATE TRIGGER trg_new_comment_notify
AFTER INSERT ON Comment
FOR EACH ROW
EXECUTE FUNCTION trg_notify_new_comment();

--триггер "файл загружен"
CREATE OR REPLACE FUNCTION trg_notify_file_uploaded()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  vkr_id uuid;
  teacher_user_id uuid;
BEGIN
  SELECT s.VKR_ID INTO vkr_id
  FROM Completing_VKR_Stage_Result r
  JOIN VKR_Stages s ON s.stage_ID = r.stage_ID
  WHERE r.completing_VKR_stage_result_ID = NEW.completing_VKR_stage_result_ID;

  SELECT t.user_ID INTO teacher_user_id
  FROM VKR v
  JOIN Teachers t ON t.teacher_ID = v.teacher_ID
  WHERE v.VKR_ID = vkr_id;

  INSERT INTO Notifications(notification_type, notification_data, user_ID)
  VALUES (
    'FILE_UPLOADED'::notification_type,
    jsonb_build_object(
      'file_ID', NEW.completing_file_ID,
      'filename', NEW.filename,
      'stage_result_ID', NEW.completing_VKR_stage_result_ID
    ),
    teacher_user_id
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_completing_file_uploaded_notify ON Completing_File;

CREATE TRIGGER trg_completing_file_uploaded_notify
AFTER INSERT ON Completing_File
FOR EACH ROW
EXECUTE FUNCTION trg_notify_file_uploaded();