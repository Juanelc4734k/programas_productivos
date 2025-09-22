-- Insertar datos de ejemplo para la plataforma de Montebello
USE montebello_platform;

-- Insertar usuarios de ejemplo
INSERT INTO users (email, password_hash, document_number, first_name, last_name, phone, address, vereda, user_type, email_verified) VALUES
('admin@montebello.gov.co', '$2b$10$example_hash_admin', '12345678', 'Carlos', 'Rodríguez', '3001234567', 'Alcaldía Municipal', 'Centro', 'admin', TRUE),
('funcionario1@montebello.gov.co', '$2b$10$example_hash_func1', '23456789', 'María', 'González', '3002345678', 'Secretaría de Agricultura', 'Centro', 'official', TRUE),
('campesino1@email.com', '$2b$10$example_hash_camp1', '34567890', 'José', 'Martínez', '3003456789', 'Finca La Esperanza', 'El Progreso', 'farmer', TRUE),
('campesino2@email.com', '$2b$10$example_hash_camp2', '45678901', 'Ana', 'López', '3004567890', 'Finca El Mirador', 'La Esperanza', 'farmer', TRUE),
('campesino3@email.com', '$2b$10$example_hash_camp3', '56789012', 'Pedro', 'Ramírez', '3005678901', 'Finca San José', 'San José', 'farmer', TRUE);

-- Insertar programas productivos
INSERT INTO programs (name, description, start_date, end_date, budget, status, created_by) VALUES
('Café Sostenible', 'Mejoramiento de cultivos de café con técnicas sostenibles y certificación orgánica', '2024-01-15', '2024-12-15', 450000000.00, 'active', 1),
('Agricultura Familiar', 'Fortalecimiento de la agricultura familiar con diversificación de cultivos', '2024-03-01', '2025-02-28', 320000000.00, 'active', 1),
('Ganadería Sostenible', 'Implementación de sistemas silvopastoriles y mejoramiento genético', '2024-04-15', '2025-04-15', 580000000.00, 'active', 1),
('Cultivos Alternativos', 'Promoción de cultivos alternativos como cacao, aguacate y frutales', '2024-06-01', '2025-05-31', 280000000.00, 'active', 1);

-- Insertar beneficiarios en programas
INSERT INTO program_beneficiaries (program_id, user_id, enrollment_date, status, progress_percentage) VALUES
(1, 3, '2024-01-20', 'active', 75.00),
(1, 4, '2024-01-25', 'active', 68.50),
(2, 4, '2024-03-05', 'active', 45.00),
(2, 5, '2024-03-10', 'active', 52.30),
(3, 5, '2024-04-20', 'active', 30.00);

-- Insertar proyectos específicos
INSERT INTO projects (program_id, beneficiary_id, name, description, start_date, expected_end_date, status, progress_percentage, budget_allocated, budget_used) VALUES
(1, 3, 'Mejoramiento Cafetal Finca La Esperanza', 'Renovación de 2 hectáreas de café con variedades resistentes', '2024-02-01', '2024-11-30', 'in_progress', 75.00, 8500000.00, 6375000.00),
(1, 4, 'Certificación Orgánica Café El Mirador', 'Proceso de certificación orgánica para 1.5 hectáreas', '2024-02-15', '2024-12-15', 'in_progress', 68.50, 6200000.00, 4247000.00),
(2, 4, 'Diversificación Agrícola El Mirador', 'Implementación de cultivos de plátano y yuca', '2024-03-15', '2025-01-15', 'in_progress', 45.00, 4500000.00, 2025000.00),
(3, 5, 'Sistema Silvopastoril San José', 'Establecimiento de sistema silvopastoril en 3 hectáreas', '2024-05-01', '2025-03-01', 'in_progress', 30.00, 12000000.00, 3600000.00);

-- Insertar etapas de proyectos
INSERT INTO project_stages (project_id, stage_name, description, start_date, end_date, status) VALUES
(1, 'Preparación del terreno', 'Limpieza y preparación del suelo', '2024-02-01', '2024-02-28', 'completed'),
(1, 'Siembra', 'Siembra de nuevas variedades de café', '2024-03-01', '2024-04-15', 'completed'),
(1, 'Mantenimiento', 'Cuidado y mantenimiento de los cultivos', '2024-04-16', '2024-10-31', 'in_progress'),
(1, 'Cosecha', 'Primera cosecha del nuevo cultivo', '2024-11-01', '2024-11-30', 'pending'),
(2, 'Documentación', 'Preparación de documentos para certificación', '2024-02-15', '2024-03-15', 'completed'),
(2, 'Inspección inicial', 'Primera inspección del organismo certificador', '2024-03-16', '2024-04-30', 'completed'),
(2, 'Implementación de prácticas', 'Aplicación de prácticas orgánicas', '2024-05-01', '2024-10-31', 'in_progress'),
(2, 'Inspección final', 'Inspección final para certificación', '2024-11-01', '2024-12-15', 'pending');

-- Insertar trámites de ejemplo
INSERT INTO procedures (user_id, procedure_type, title, description, status, submitted_at, reviewed_by) VALUES
(3, 'supplies_request', 'Solicitud de semillas de café', 'Solicito 500 plántulas de café variedad Castillo para renovación de cultivo', 'approved', '2024-01-10 09:30:00', 2),
(4, 'technical_assistance', 'Asistencia técnica para manejo de plagas', 'Requiero asesoría para control de broca del café', 'in_review', '2024-01-15 14:20:00', 2),
(5, 'program_enrollment', 'Inscripción Programa Ganadería Sostenible', 'Deseo inscribirme al programa de ganadería sostenible', 'approved', '2024-04-01 10:15:00', 2),
(3, 'certificate_request', 'Certificado de participación Café Sostenible', 'Solicito certificado de participación en el programa', 'completed', '2024-01-20 16:45:00', 2);

-- Insertar noticias y anuncios
INSERT INTO news (title, content, excerpt, category, published_date, created_by) VALUES
('Nueva convocatoria para programa de café', 'Se abre nueva convocatoria para el programa de mejoramiento de cultivos de café sostenible. Los interesados pueden inscribirse hasta el 31 de enero.', 'Se abre inscripción para el programa de mejoramiento de cultivos de café...', 'announcement', '2025-01-08', 1),
('Entrega de insumos agrícolas', 'Este viernes 10 de enero se realizará la entrega de semillas y fertilizantes en la sede de la alcaldía. Los beneficiarios deben presentarse con su documento de identidad.', 'Este viernes se realizará la entrega de semillas y fertilizantes...', 'event', '2025-01-05', 1),
('Capacitación en manejo de cultivos', 'El próximo 15 de enero se realizará capacitación sobre manejo sostenible del café en el salón comunal de la vereda El Progreso.', 'Capacitación sobre manejo sostenible del café el 15 de enero...', 'training', '2025-01-03', 2),
('Resultados programa agricultura familiar', 'El programa de agricultura familiar ha beneficiado a 89 familias campesinas con excelentes resultados en diversificación de cultivos.', 'Excelentes resultados del programa de agricultura familiar...', 'news', '2024-12-20', 1);

-- Insertar capacitaciones
INSERT INTO trainings (title, description, training_type, duration_hours, max_participants, start_date, end_date, location, instructor, is_active) VALUES
('Manejo Sostenible del Café', 'Técnicas modernas para el cultivo sostenible de café', 'workshop', 8.0, 30, '2025-01-15 08:00:00', '2025-01-15 17:00:00', 'Salón Comunal El Progreso', 'Ing. Carlos Mendoza', TRUE),
('Diversificación de Cultivos', 'Estrategias para diversificar la producción agrícola', 'course', 16.0, 25, '2025-01-20 08:00:00', '2025-01-21 17:00:00', 'Centro de Capacitación Municipal', 'Ing. Ana Herrera', TRUE),
('Sistemas Silvopastoriles', 'Implementación de sistemas ganaderos sostenibles', 'workshop', 6.0, 20, '2025-01-25 09:00:00', '2025-01-25 16:00:00', 'Finca Demostrativa San José', 'Dr. Miguel Torres', TRUE);

-- Insertar inscripciones a capacitaciones
INSERT INTO training_enrollments (training_id, user_id, enrollment_date, status) VALUES
(1, 3, '2025-01-08 10:30:00', 'enrolled'),
(1, 4, '2025-01-08 11:15:00', 'enrolled'),
(2, 4, '2025-01-09 09:20:00', 'enrolled'),
(2, 5, '2025-01-09 14:45:00', 'enrolled'),
(3, 5, '2025-01-10 16:30:00', 'enrolled');

-- Insertar evaluaciones
INSERT INTO evaluations (user_id, evaluation_type, reference_id, rating, comments, suggestions, submitted_at) VALUES
(3, 'program', 1, 5, 'Excelente programa, he aprendido mucho sobre técnicas sostenibles', 'Sería bueno tener más capacitaciones prácticas en campo', '2024-12-15 10:30:00'),
(4, 'training', 1, 4, 'Muy buena capacitación, instructor muy conocedor', 'Más tiempo para preguntas y respuestas', '2024-11-20 15:45:00'),
(5, 'platform', NULL, 4, 'La plataforma es fácil de usar', 'Mejorar la velocidad de carga en dispositivos móviles', '2024-12-10 09:15:00');

-- Insertar notificaciones
INSERT INTO notifications (user_id, title, message, notification_type, is_read) VALUES
(3, 'Aprobación de trámite', 'Su solicitud de semillas de café ha sido aprobada', 'success', TRUE),
(3, 'Próxima capacitación', 'Recuerde la capacitación de manejo sostenible del café el 15 de enero', 'info', FALSE),
(4, 'Revisión de trámite', 'Su solicitud de asistencia técnica está en revisión', 'info', FALSE),
(4, 'Nueva convocatoria', 'Se abrió nueva convocatoria para programa de café sostenible', 'info', TRUE),
(5, 'Inscripción confirmada', 'Su inscripción al programa de ganadería sostenible ha sido confirmada', 'success', TRUE);
