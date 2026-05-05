BEGIN;

-- ===== Users связи =====

ALTER TABLE students
ADD CONSTRAINT fk_students_user
FOREIGN KEY (user_id)
REFERENCES users(user_id)
ON UPDATE CASCADE
ON DELETE RESTRICT;

ALTER TABLE teachers
ADD CONSTRAINT fk_teachers_user
FOREIGN KEY (user_id)
REFERENCES users(user_id)
ON UPDATE CASCADE
ON DELETE RESTRICT;

-- ===== VKR =====

ALTER TABLE vkr
ADD CONSTRAINT fk_vkr_student
FOREIGN KEY (student_id)
REFERENCES students(student_id)
ON UPDATE CASCADE
ON DELETE RESTRICT;

ALTER TABLE vkr
ADD CONSTRAINT fk_vkr_teacher
FOREIGN KEY (teacher_id)
REFERENCES teachers(teacher_id)
ON UPDATE CASCADE
ON DELETE RESTRICT;

-- ===== Этапы =====

ALTER TABLE vkr_stages
ADD CONSTRAINT fk_vkr_stages_vkr
FOREIGN KEY (vkr_id)
REFERENCES vkr(vkr_id)
ON UPDATE CASCADE
ON DELETE CASCADE;

ALTER TABLE completing_vkr_stage_result
ADD CONSTRAINT fk_stage_result_stage
FOREIGN KEY (stage_id)
REFERENCES vkr_stages(stage_id)
ON UPDATE CASCADE
ON DELETE CASCADE;

ALTER TABLE completing_vkr_stage_result
ADD CONSTRAINT fk_stage_result_student
FOREIGN KEY (student_id)
REFERENCES students(student_id)
ON UPDATE CASCADE
ON DELETE RESTRICT;

ALTER TABLE completing_file
ADD CONSTRAINT fk_completing_file_stage_result
FOREIGN KEY (completing_vkr_stage_result_id)
REFERENCES completing_vkr_stage_result(completing_vkr_stage_result_id)
ON UPDATE CASCADE
ON DELETE CASCADE;

-- ===== Проверки и комментарии =====

ALTER TABLE work_check
ADD CONSTRAINT fk_work_check_stage_result
FOREIGN KEY (completing_vkr_stage_result_id)
REFERENCES completing_vkr_stage_result(completing_vkr_stage_result_id)
ON UPDATE CASCADE
ON DELETE CASCADE;

ALTER TABLE work_check
ADD CONSTRAINT fk_work_check_user
FOREIGN KEY (user_id)
REFERENCES users(user_id)
ON UPDATE CASCADE
ON DELETE RESTRICT;

ALTER TABLE comment
ADD CONSTRAINT fk_comment_stage_result
FOREIGN KEY (completing_vkr_stage_result_id)
REFERENCES completing_vkr_stage_result(completing_vkr_stage_result_id)
ON UPDATE CASCADE
ON DELETE CASCADE;

ALTER TABLE comment
ADD CONSTRAINT fk_comment_user
FOREIGN KEY (user_id)
REFERENCES users(user_id)
ON UPDATE CASCADE
ON DELETE RESTRICT;

-- ===== Уведомления =====

ALTER TABLE notifications
ADD CONSTRAINT fk_notifications_user
FOREIGN KEY (user_id)
REFERENCES users(user_id)
ON UPDATE CASCADE
ON DELETE RESTRICT;

-- ===== Архив =====

ALTER TABLE vkr_archive
ADD CONSTRAINT fk_vkr_archive_student
FOREIGN KEY (student_id)
REFERENCES students(student_id)
ON UPDATE CASCADE
ON DELETE RESTRICT;

ALTER TABLE vkr_archive
ADD CONSTRAINT fk_vkr_archive_teacher
FOREIGN KEY (teacher_id)
REFERENCES teachers(teacher_id)
ON UPDATE CASCADE
ON DELETE RESTRICT;

ALTER TABLE vkr_archive
ADD CONSTRAINT fk_vkr_archive_user
FOREIGN KEY (user_id)
REFERENCES users(user_id)
ON UPDATE CASCADE
ON DELETE RESTRICT;

ALTER TABLE archive_file
ADD CONSTRAINT fk_archive_file_archive
FOREIGN KEY (vkr_archive_id)
REFERENCES vkr_archive(vkr_archive_id)
ON UPDATE CASCADE
ON DELETE CASCADE;

-- ===== Полезные ресурсы =====

ALTER TABLE useful_resources
ADD CONSTRAINT fk_useful_resources_user
FOREIGN KEY (user_id)
REFERENCES users(user_id)
ON UPDATE CASCADE
ON DELETE RESTRICT;

ALTER TABLE resource_file
ADD CONSTRAINT fk_resource_file_resource
FOREIGN KEY (useful_resource_id)
REFERENCES useful_resources(useful_resource_id)
ON UPDATE CASCADE
ON DELETE CASCADE;

ALTER TABLE User_Roles
ADD CONSTRAINT fk_user_roles_user
FOREIGN KEY (user_ID)
REFERENCES Users(user_ID)
ON DELETE CASCADE;

ALTER TABLE User_Roles
ADD CONSTRAINT fk_user_roles_role
FOREIGN KEY (role_ID)
REFERENCES Roles(role_ID)
ON DELETE CASCADE;

COMMIT;