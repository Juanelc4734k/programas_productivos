-- Crear base de datos para la plataforma de Montebello
CREATE DATABASE IF NOT EXISTS montebello_platform;
USE montebello_platform;

-- Tabla de usuarios
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    document_number VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    vereda VARCHAR(100),
    user_type ENUM('farmer', 'official', 'admin') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de programas productivos
CREATE TABLE programs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    budget DECIMAL(15,2),
    status ENUM('planning', 'active', 'completed', 'suspended') DEFAULT 'planning',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Tabla de beneficiarios por programa
CREATE TABLE program_beneficiaries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    program_id INT NOT NULL,
    user_id INT NOT NULL,
    enrollment_date DATE NOT NULL,
    status ENUM('enrolled', 'active', 'completed', 'withdrawn') DEFAULT 'enrolled',
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (program_id) REFERENCES programs(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY unique_program_user (program_id, user_id)
);

-- Tabla de proyectos específicos dentro de programas
CREATE TABLE projects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    program_id INT NOT NULL,
    beneficiary_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    expected_end_date DATE NOT NULL,
    actual_end_date DATE NULL,
    status ENUM('planning', 'in_progress', 'completed', 'suspended') DEFAULT 'planning',
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    budget_allocated DECIMAL(12,2),
    budget_used DECIMAL(12,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (program_id) REFERENCES programs(id),
    FOREIGN KEY (beneficiary_id) REFERENCES users(id)
);

-- Tabla de etapas de proyecto
CREATE TABLE project_stages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    stage_name VARCHAR(100) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- Tabla de evidencias (fotos, videos, documentos)
CREATE TABLE project_evidence (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    stage_id INT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type ENUM('image', 'video', 'document') NOT NULL,
    file_size INT,
    description TEXT,
    uploaded_by INT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (stage_id) REFERENCES project_stages(id),
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- Tabla de trámites
CREATE TABLE procedures (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    procedure_type ENUM('supplies_request', 'technical_assistance', 'program_enrollment', 'certificate_request') NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('submitted', 'in_review', 'approved', 'rejected', 'completed') DEFAULT 'submitted',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    reviewed_by INT NULL,
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

-- Tabla de documentos de trámites
CREATE TABLE procedure_documents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    procedure_id INT NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    document_path VARCHAR(500) NOT NULL,
    document_type VARCHAR(100),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (procedure_id) REFERENCES procedures(id)
);

-- Tabla de noticias y anuncios
CREATE TABLE news (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    category ENUM('news', 'announcement', 'event', 'training') NOT NULL,
    published_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Tabla de capacitaciones
CREATE TABLE trainings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    training_type ENUM('video', 'document', 'course', 'workshop') NOT NULL,
    content_path VARCHAR(500),
    duration_hours DECIMAL(4,2),
    max_participants INT,
    start_date DATETIME,
    end_date DATETIME,
    location VARCHAR(255),
    instructor VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de inscripciones a capacitaciones
CREATE TABLE training_enrollments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    training_id INT NOT NULL,
    user_id INT NOT NULL,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completion_date TIMESTAMP NULL,
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    status ENUM('enrolled', 'in_progress', 'completed', 'withdrawn') DEFAULT 'enrolled',
    FOREIGN KEY (training_id) REFERENCES trainings(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY unique_training_user (training_id, user_id)
);

-- Tabla de evaluaciones y retroalimentación
CREATE TABLE evaluations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    evaluation_type ENUM('program', 'training', 'service', 'platform') NOT NULL,
    reference_id INT, -- ID del programa, capacitación, etc.
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comments TEXT,
    suggestions TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabla de notificaciones
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type ENUM('info', 'warning', 'success', 'error') DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_users_document ON users(document_number);
CREATE INDEX idx_users_type ON users(user_type);
CREATE INDEX idx_programs_status ON programs(status);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_procedures_status ON procedures(status);
CREATE INDEX idx_procedures_type ON procedures(procedure_type);
CREATE INDEX idx_news_category ON news(category);
CREATE INDEX idx_news_published ON news(published_date);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
