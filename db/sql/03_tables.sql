CREATE TABLE IF NOT EXISTS Users (
    user_ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    login VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    status user_status NOT NULL,
    created_date TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE Roles (
    role_ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE User_Roles (
    user_role_ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_ID UUID NOT NULL,
    role_ID UUID NOT NULL
);

CREATE TABLE IF NOT EXISTS STUDENTS (
    student_ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    last_name VARCHAR(100)  NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    patronymic VARCHAR(100),
    group_number VARCHAR(20) NOT NULL,
    study_program_name TEXT NOT NULL,
	e_mail VARCHAR(100) NOT NULL,
	phone_number VARCHAR(50),
	additional_contact TEXT,
	user_ID UUID NOT NULL,
	education_level education_level NOT NULL
);

CREATE TABLE IF NOT EXISTS Teachers (
    teacher_ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    last_name VARCHAR(100)  NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    patronymic VARCHAR(100),
	profile_photo TEXT,
    department VARCHAR(200) NOT NULL,
    profile TEXT,
	time_table TEXT,
	office_number VARCHAR(30),
	phone_number VARCHAR(50),
	e_mail VARCHAR(100) NOT NULL,
	website TEXT,
	additional_contact TEXT,
	additional_information TEXT, 
	user_ID UUID NOT NULL
);

CREATE TABLE IF NOT EXISTS VKR (
    VKR_ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    year SMALLINT  NOT NULL,
    work_title VARCHAR(255) NOT NULL,
    studies_area VARCHAR(255) NOT NULL,
	description TEXT,
    key_words TEXT NOT NULL,
    student_ID UUID NOT NULL,
	teacher_ID UUID NOT NULL,
	status vkr_status NOT NULL, 
	created_date TIMESTAMPTZ NOT NULL DEFAULT now(),
	updated_date TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS VKR_Stages(
    stage_ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stage_name VARCHAR(100) NOT NULL,
	description TEXT,
	start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
	finish_date TIMESTAMPTZ DEFAULT now(),
	stage_status stage_status NOT NULL, 
	VKR_ID UUID NOT NULL	
);

CREATE TABLE IF NOT EXISTS Completing_VKR_Stage_Result (
    completing_VKR_stage_result_ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version_number SMALLINT  NOT NULL,
	finish_date TIMESTAMPTZ DEFAULT now(),
	student_comment TEXT,
	stage_ID UUID NOT NULL,
	student_ID UUID NOT NULL
);

CREATE TABLE IF NOT EXISTS Completing_File (
    completing_file_ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(1024) NOT NULL,
    storage_path TEXT NOT NULL,
    file_type VARCHAR(128) NOT NULL,
	file_size BIGINT NOT NULL,
	upload_date TIMESTAMPTZ NOT NULL DEFAULT now(),
	completing_VKR_stage_result_ID UUID NOT NULL
);

CREATE TABLE IF NOT EXISTS Work_Check (
    check_ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	completing_VKR_stage_result_ID UUID NOT NULL,
	check_type check_type NOT NULL, 
	check_status check_status NOT NULL, 
	final_comment TEXT,
	check_start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
	check_finish_date TIMESTAMPTZ NULL,
	user_ID UUID NOT NULL	
);

CREATE TABLE IF NOT EXISTS Comment (
    comment_ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	text TEXT NOT NULL,
	created_date TIMESTAMPTZ NOT NULL DEFAULT now(),
	user_ID UUID NOT NULL,
	completing_VKR_stage_result_ID UUID NOT NULL
);

CREATE TABLE IF NOT EXISTS Notifications (
    notification_ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	notification_type notification_type NOT NULL, 
	notification_data JSONB NOT NULL, 
	is_read BOOLEAN NOT NULL DEFAULT false,
	created_date TIMESTAMPTZ NOT NULL DEFAULT now(),
	user_ID UUID NOT NULL	
);

CREATE TABLE IF NOT EXISTS VKR_Topic (
    topic_ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	topic_title VARCHAR(1024) NOT NULL,
	studies_area VARCHAR(255) NOT NULL,
	description TEXT,
	topic_status topic_status NOT NULL,
	teacher_ID UUID NOT NULL
);

CREATE TABLE IF NOT EXISTS VKR_Archive (
    VKR_archive_ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    year SMALLINT  NOT NULL,
	title VARCHAR(512) NOT NULL,
	studies_area VARCHAR(255) NOT NULL,
	description TEXT,
	key_words VARCHAR(512) NOT NULL,
	added_to_archive_date TIMESTAMPTZ NOT NULL DEFAULT now(),
	student_ID UUID NOT NULL,
	teacher_ID UUID NOT NULL,
	user_ID UUID NOT NULL
);

CREATE TABLE IF NOT EXISTS Archive_File (
    archive_file_ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(1024) NOT NULL,
    storage_path TEXT NOT NULL,
    file_type VARCHAR(128) NOT NULL,
	file_size BIGINT NOT NULL,
	upload_date TIMESTAMPTZ NOT NULL DEFAULT now(),
	VKR_archive_ID UUID NOT NULL
);

CREATE TABLE IF NOT EXISTS Useful_Resources (
    useful_resource_ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	title VARCHAR(512) NOT NULL,
	description TEXT,
	resource_type resource_category NOT NULL,
	published_date TIMESTAMPTZ NOT NULL DEFAULT now(),
	user_ID UUID NOT NULL
);

CREATE TABLE IF NOT EXISTS Resource_File (
    resource_file_ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(1024) NOT NULL,
    storage_path TEXT NOT NULL,
    file_type VARCHAR(128) NOT NULL,
	file_size BIGINT NOT NULL,
	upload_date TIMESTAMPTZ NOT NULL DEFAULT now(),
	useful_resource_ID UUID NOT NULL
);