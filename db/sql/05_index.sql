BEGIN;

-- Расширения для поиска --

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Индексы на внешние ключи --

CREATE INDEX IF NOT EXISTS idx_students_user_id
ON students(user_id);

CREATE INDEX IF NOT EXISTS idx_teachers_user_id
ON teachers(user_id);

CREATE INDEX IF NOT EXISTS idx_vkr_student_id
ON vkr(student_id);

CREATE INDEX IF NOT EXISTS idx_vkr_teacher_id
ON vkr(teacher_id);

CREATE INDEX IF NOT EXISTS idx_vkr_stages_vkr_id
ON vkr_stages(vkr_id);

CREATE INDEX IF NOT EXISTS idx_stage_result_stage_id
ON completing_vkr_stage_result(stage_id);

CREATE INDEX IF NOT EXISTS idx_stage_result_student_id
ON completing_vkr_stage_result(student_id);

CREATE INDEX IF NOT EXISTS idx_completing_file_stage_result
ON completing_file(completing_vkr_stage_result_id);

CREATE INDEX IF NOT EXISTS idx_work_check_stage_result
ON work_check(completing_vkr_stage_result_id);

CREATE INDEX IF NOT EXISTS idx_work_check_user
ON work_check(user_id);

CREATE INDEX IF NOT EXISTS idx_comment_user
ON comment(user_id);

CREATE INDEX IF NOT EXISTS idx_comment_stage_result
ON comment(completing_vkr_stage_result_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user
ON notifications(user_id);

CREATE INDEX IF NOT EXISTS idx_vkr_archive_student
ON vkr_archive(student_id);

CREATE INDEX IF NOT EXISTS idx_vkr_archive_teacher
ON vkr_archive(teacher_id);

CREATE INDEX IF NOT EXISTS idx_vkr_archive_user
ON vkr_archive(user_id);

CREATE INDEX IF NOT EXISTS idx_archive_file_archive
ON archive_file(vkr_archive_id);

CREATE INDEX IF NOT EXISTS idx_useful_resources_user
ON useful_resources(user_id);

CREATE INDEX IF NOT EXISTS idx_resource_file_resource
ON resource_file(useful_resource_id);

CREATE INDEX IF NOT EXISTS idx_vkr_topic_teacher
ON vkr_topic(teacher_id);

CREATE INDEX IF NOT EXISTS idx_user_roles_user
ON user_roles(user_id);

CREATE INDEX IF NOT EXISTS idx_user_roles_role
ON user_roles(role_id);

-- Композитные индексы --

-- Последняя версия этапа
CREATE INDEX IF NOT EXISTS idx_stage_version
ON completing_vkr_stage_result(stage_id, version_number DESC);

-- Лента комментариев по этапу
CREATE INDEX IF NOT EXISTS idx_comment_stage_date
ON comment(completing_vkr_stage_result_id, created_date DESC);

-- Непрочитанные уведомления
CREATE INDEX IF NOT EXISTS idx_notifications_unread
ON notifications(user_id, created_date DESC)
WHERE is_read = false;


--  Индексы для фильтрации --

CREATE INDEX IF NOT EXISTS idx_vkr_year
ON vkr(year);

CREATE INDEX IF NOT EXISTS idx_vkr_status
ON vkr(status);

CREATE INDEX IF NOT EXISTS idx_vkr_area
ON vkr(studies_area);

CREATE INDEX IF NOT EXISTS idx_vkr_archive_year
ON vkr_archive(year);

CREATE INDEX IF NOT EXISTS idx_vkr_archive_area
ON vkr_archive(studies_area);

CREATE INDEX IF NOT EXISTS idx_work_check_status
ON work_check(check_status);

CREATE INDEX IF NOT EXISTS idx_teachers_department
ON teachers(department);

CREATE INDEX IF NOT EXISTS idx_teachers_profile
ON teachers(profile);

-- Полнотекстовый поиск (FTS) --

-- VKR_Topic
ALTER TABLE vkr_topic
ADD COLUMN IF NOT EXISTS search_tsv tsvector
GENERATED ALWAYS AS (
  to_tsvector('russian',
    coalesce(topic_title,'') || ' ' ||
    coalesce(description,'') || ' ' ||
    coalesce(studies_area,'')
  )
) STORED;

CREATE INDEX IF NOT EXISTS idx_vkr_topic_search
ON vkr_topic USING GIN (search_tsv);


-- VKR_Archive
ALTER TABLE vkr_archive
ADD COLUMN IF NOT EXISTS search_tsv tsvector
GENERATED ALWAYS AS (
  to_tsvector('russian',
    coalesce(title,'') || ' ' ||
    coalesce(description,'') || ' ' ||
    coalesce(key_words,'') || ' ' ||
    coalesce(studies_area,'')
  )
) STORED;

CREATE INDEX IF NOT EXISTS idx_vkr_archive_search
ON vkr_archive USING GIN (search_tsv);

-- Поиск по строке (trigram) --

CREATE INDEX IF NOT EXISTS idx_teachers_name_trgm
ON teachers USING GIN (last_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_vkr_topic_title_trgm
ON vkr_topic USING GIN (topic_title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_vkr_archive_title_trgm
ON vkr_archive USING GIN (title gin_trgm_ops);

COMMIT;

-- Уникальность (UNIQUE) --

ALTER TABLE students
ADD CONSTRAINT uq_students_user UNIQUE (user_id);

ALTER TABLE teachers
ADD CONSTRAINT uq_teachers_user UNIQUE (user_id);

ALTER TABLE completing_vkr_stage_result
ADD CONSTRAINT uq_stage_version UNIQUE (stage_id, version_number);

ALTER TABLE vkr_topic
ADD CONSTRAINT uq_teacher_topic_title UNIQUE (teacher_id, topic_title);

ALTER TABLE vkr_archive
ADD CONSTRAINT uq_archive_work UNIQUE (year, title, student_id);

ALTER TABLE User_Roles
ADD CONSTRAINT uq_user_role UNIQUE (user_ID, role_ID);

-- Ограничения (CHECK) --

-- Ограничения на дату, чтобы не была будущей
CREATE OR REPLACE FUNCTION not_in_future(ts TIMESTAMPTZ)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT ts <= (now() + interval '5 minutes');
$$;
--users
ALTER TABLE Users
ADD CONSTRAINT chk_users_login_not_blank
CHECK (length(btrim(login)) > 0);

ALTER TABLE Users
ADD CONSTRAINT chk_users_password_hash_not_blank
CHECK (length(btrim(password_hash)) > 0);

ALTER TABLE Users
ADD CONSTRAINT chk_users_created_not_future
CHECK (not_in_future(created_date));
--students
ALTER TABLE STUDENTS
ADD CONSTRAINT chk_students_last_name_not_blank
CHECK (length(btrim(last_name)) > 0);

ALTER TABLE STUDENTS
ADD CONSTRAINT chk_students_first_name_not_blank
CHECK (length(btrim(first_name)) > 0);

ALTER TABLE STUDENTS
ADD CONSTRAINT chk_students_group_not_blank
CHECK (length(btrim(group_number)) > 0);

ALTER TABLE STUDENTS
ADD CONSTRAINT chk_students_program_not_blank
CHECK (length(btrim(study_program_name)) > 0);

ALTER TABLE STUDENTS
ADD CONSTRAINT chk_students_email_format
CHECK (e_mail ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$');

ALTER TABLE STUDENTS
ADD CONSTRAINT chk_students_phone_format
CHECK (phone_number ~ '^[0-9+()\\-\\s]{6,30}$');

ALTER TABLE STUDENTS
ADD CONSTRAINT chk_students_additional_contact_not_blank
CHECK (additional_contact IS NULL OR length(btrim(additional_contact)) > 0);
--teachears
ALTER TABLE Teachers
ADD CONSTRAINT chk_teachers_last_name_not_blank
CHECK (length(btrim(last_name)) > 0);

ALTER TABLE Teachers
ADD CONSTRAINT chk_teachers_first_name_not_blank
CHECK (length(btrim(first_name)) > 0);

ALTER TABLE Teachers
ADD CONSTRAINT chk_teachers_department_not_blank
CHECK (length(btrim(department)) > 0);

ALTER TABLE Teachers
ADD CONSTRAINT chk_teachers_profile_not_blank
CHECK (length(btrim(profile)) > 0);

ALTER TABLE Teachers
ADD CONSTRAINT chk_teachers_email_format
CHECK (e_mail ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$');

ALTER TABLE Teachers
ADD CONSTRAINT chk_teachers_phone_format
CHECK (phone_number ~ '^[0-9+()\\-\\s]{6,30}$');


ALTER TABLE Teachers
ADD CONSTRAINT chk_teachers_website_not_blank
CHECK (website IS NULL OR length(btrim(website)) > 0);
--vkr
ALTER TABLE VKR
ADD CONSTRAINT chk_vkr_year_range
CHECK (year BETWEEN 2000 AND 2100);

ALTER TABLE VKR
ADD CONSTRAINT chk_vkr_title_not_blank
CHECK (length(btrim(work_title)) > 0);

ALTER TABLE VKR
ADD CONSTRAINT chk_vkr_area_not_blank
CHECK (length(btrim(studies_area)) > 0);

ALTER TABLE VKR
ADD CONSTRAINT chk_vkr_keywords_not_blank
CHECK (length(btrim(key_words)) > 0);

ALTER TABLE VKR
ADD CONSTRAINT chk_vkr_created_not_future
CHECK (not_in_future(created_date));

ALTER TABLE VKR
ADD CONSTRAINT chk_vkr_updated_not_future
CHECK (not_in_future(updated_date));

ALTER TABLE VKR
ADD CONSTRAINT chk_vkr_updated_not_before_created
CHECK (updated_date >= created_date);
--vkr_stages
ALTER TABLE VKR_Stages
ADD CONSTRAINT chk_stage_name_not_blank
CHECK (length(btrim(stage_name)) > 0);

ALTER TABLE VKR_Stages
ADD CONSTRAINT chk_stage_start_not_future
CHECK (not_in_future(start_date));

ALTER TABLE VKR_Stages
ADD CONSTRAINT chk_stage_finish_not_future
CHECK (finish_date IS NULL OR not_in_future(finish_date));

ALTER TABLE VKR_Stages
ADD CONSTRAINT chk_stage_finish_not_before_start
CHECK (finish_date IS NULL OR finish_date >= start_date);
--completing_vkr_stage_result
ALTER TABLE Completing_VKR_Stage_Result
ADD CONSTRAINT chk_stage_result_version_positive
CHECK (version_number >= 1);

ALTER TABLE Completing_VKR_Stage_Result
ADD CONSTRAINT chk_stage_result_finish_not_future
CHECK (finish_date IS NULL OR not_in_future(finish_date));

ALTER TABLE Completing_VKR_Stage_Result
ADD CONSTRAINT chk_stage_result_student_comment_not_blank
CHECK (student_comment IS NULL OR length(btrim(student_comment)) > 0);
--completing_file
ALTER TABLE Completing_File
ADD CONSTRAINT chk_completing_file_filename_not_blank
CHECK (length(btrim(filename)) > 0);

ALTER TABLE Completing_File
ADD CONSTRAINT chk_completing_file_size_positive
CHECK (file_size > 0);

ALTER TABLE Completing_File
ADD CONSTRAINT chk_completing_file_type_not_blank
CHECK (length(btrim(file_type)) > 0);

ALTER TABLE Completing_File
ADD CONSTRAINT chk_completing_file_storage_path_not_blank
CHECK (length(btrim(storage_path)) > 0);

ALTER TABLE Completing_File
ADD CONSTRAINT chk_completing_file_upload_not_future
CHECK (not_in_future(upload_date));
--work_check
ALTER TABLE Work_Check
ADD CONSTRAINT chk_work_check_start_not_future
CHECK (not_in_future(check_start_date));

ALTER TABLE Work_Check
ADD CONSTRAINT chk_work_check_finish_not_future
CHECK (check_finish_date IS NULL OR not_in_future(check_finish_date));

ALTER TABLE Work_Check
ADD CONSTRAINT chk_work_check_finish_not_before_start
CHECK (check_finish_date IS NULL OR check_finish_date >= check_start_date);

ALTER TABLE Work_Check
ADD CONSTRAINT chk_work_check_final_comment_not_blank
CHECK (final_comment IS NULL OR length(btrim(final_comment)) > 0);
--comment
ALTER TABLE Comment
ADD CONSTRAINT chk_comment_text_not_blank
CHECK (length(btrim(text)) > 0);

--notifications
ALTER TABLE Notifications
ADD CONSTRAINT chk_notifications_created_not_future
CHECK (not_in_future(created_date));

ALTER TABLE Notifications
ADD CONSTRAINT chk_notification_data_is_object
CHECK (jsonb_typeof(notification_data) = 'object');
--vkr_topic
ALTER TABLE VKR_Topic
ADD CONSTRAINT chk_topic_title_not_blank
CHECK (length(btrim(topic_title)) > 0);

ALTER TABLE VKR_Topic
ADD CONSTRAINT chk_topic_area_not_blank
CHECK (length(btrim(studies_area)) > 0);

ALTER TABLE VKR_Topic
ADD CONSTRAINT chk_topic_description_not_blank
CHECK (description IS NULL OR length(btrim(description)) > 0);

--vkt-archive
ALTER TABLE VKR_Archive
ADD CONSTRAINT chk_vkr_archive_year_range
CHECK (year BETWEEN 2000 AND 2100);

ALTER TABLE VKR_Archive
ADD CONSTRAINT chk_vkr_archive_title_not_blank
CHECK (length(btrim(title)) > 0);

ALTER TABLE VKR_Archive
ADD CONSTRAINT chk_vkr_archive_area_not_blank
CHECK (length(btrim(studies_area)) > 0);

ALTER TABLE VKR_Archive
ADD CONSTRAINT chk_vkr_archive_keywords_not_blank
CHECK (length(btrim(key_words)) > 0);

ALTER TABLE VKR_Archive
ADD CONSTRAINT chk_vkr_archive_added_not_future
CHECK (not_in_future(added_to_archive_date));

ALTER TABLE VKR_Archive
ADD CONSTRAINT chk_vkr_archive_description_not_blank
CHECK (description IS NULL OR length(btrim(description)) > 0);

--archive_file
ALTER TABLE Archive_File
ADD CONSTRAINT chk_archive_file_filename_not_blank
CHECK (length(btrim(filename)) > 0);

ALTER TABLE Archive_File
ADD CONSTRAINT chk_archive_file_storage_path_not_blank
CHECK (length(btrim(storage_path)) > 0);

ALTER TABLE Archive_File
ADD CONSTRAINT chk_archive_file_type_not_blank
CHECK (length(btrim(file_type)) > 0);

ALTER TABLE Archive_File
ADD CONSTRAINT chk_archive_file_size_positive
CHECK (file_size > 0);

ALTER TABLE Archive_File
ADD CONSTRAINT chk_archive_file_upload_not_future
CHECK (not_in_future(upload_date));

--useful_resources
ALTER TABLE Useful_Resources
ADD CONSTRAINT chk_useful_resource_title_not_blank
CHECK (length(btrim(title)) > 0);

ALTER TABLE Useful_Resources
ADD CONSTRAINT chk_useful_resource_description_not_blank
CHECK (description IS NULL OR length(btrim(description)) > 0);

ALTER TABLE Useful_Resources
ADD CONSTRAINT chk_useful_resource_published_not_future
CHECK (not_in_future(published_date));

--resource_file
ALTER TABLE Resource_File
ADD CONSTRAINT chk_resource_file_filename_not_blank
CHECK (length(btrim(filename)) > 0);

ALTER TABLE Resource_File
ADD CONSTRAINT chk_resource_file_storage_path_not_blank
CHECK (length(btrim(storage_path)) > 0);

ALTER TABLE Resource_File
ADD CONSTRAINT chk_resource_file_type_not_blank
CHECK (length(btrim(file_type)) > 0);

ALTER TABLE Resource_File
ADD CONSTRAINT chk_resource_file_size_positive
CHECK (file_size > 0);

ALTER TABLE Resource_File
ADD CONSTRAINT chk_resource_file_upload_not_future
CHECK (not_in_future(upload_date));

