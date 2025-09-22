
-- Base de datos: programas_productivos
-- Generado el: 2025-06-10
CREATE DATABASE IF NOT EXISTS programas_productivos CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE programas_productivos;

-- Tabla: usuarios
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100),
    documento_identidad VARCHAR(20),
    correo VARCHAR(100),
    telefono VARCHAR(20),
    tipo_usuario ENUM('campesino', 'funcionario', 'admin'),
    contrasena VARCHAR(255),
    fecha_registro TIMESTAMP
) ENGINE=InnoDB;

-- Tabla: categorias_programas
CREATE TABLE categorias_programas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100),
    descripcion TEXT
) ENGINE=InnoDB;

-- Tabla: programas
CREATE TABLE programas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100),
    descripcion TEXT,
    categoria VARCHAR(100),
    fecha_inicio DATE,
    fecha_fin DATE,
    estado ENUM('activo','finalizado','en espera'),
    cupos INT,
    categoria_id INT,
    FOREIGN KEY (categoria_id) REFERENCES categorias_programas(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Tabla: inscripciones
CREATE TABLE inscripciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT,
    programa_id INT,
    fecha_inscripcion TIMESTAMP,
    estado ENUM('pendiente','aprobado','rechazado'),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (programa_id) REFERENCES programas(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Tabla: capacitaciones
CREATE TABLE capacitaciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(150),
    descripcion TEXT,
    modalidad ENUM('virtual','presencial'),
    fecha DATE,
    hora TIME,
    lugar VARCHAR(100),
    cupos INT,
    estado ENUM('activa','finalizada')
) ENGINE=InnoDB;

-- Tabla: asistencia_capacitaciones
CREATE TABLE asistencia_capacitaciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT,
    capacitacion_id INT,
    asistencia TINYINT(1),
    justificacion TEXT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (capacitacion_id) REFERENCES capacitaciones(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Tabla: tramites
CREATE TABLE tramites (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT,
    tipo_tramite VARCHAR(100),
    descripcion TEXT,
    estado ENUM('enviado','en revisión','aprobado','rechazado'),
    fecha_solicitud TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Tabla: chatbot_logs
CREATE TABLE chatbot_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT,
    pregunta_usuario TEXT,
    respuesta_bot TEXT,
    fecha_interaccion TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Tabla: chatbot_faq
CREATE TABLE chatbot_faq (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pregunta VARCHAR(255),
    respuesta TEXT,
    categoria VARCHAR(100)
) ENGINE=InnoDB;
