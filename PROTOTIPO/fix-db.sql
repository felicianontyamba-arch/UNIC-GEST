-- Adicionar coluna password se não existir
USE otempo_db;

-- Adicionar coluna password à tabela students
ALTER TABLE students ADD COLUMN IF NOT EXISTS password VARCHAR(255) AFTER email;

-- Adicionar coluna password à tabela admins (se não existir)
ALTER TABLE admins ADD COLUMN IF NOT EXISTS password VARCHAR(255) AFTER email;

-- Limpar dados antigos (opcional)
DELETE FROM students;
DELETE FROM admins;

-- Inserir estudantes com hashes corretos
INSERT INTO students (nome, email, password, curso, semestre) VALUES 
('João Silva', 'joao@unic.ao', '$2a$10$JgZ6N6adF3c1R50q3ZZJ7OyzJZyh3RDyu/CMTNjweg5mUfVbQTZUW', 'Engenharia Informática', '3º Semestre'),
('Maria Santos', 'maria@unic.ao', '$2a$10$Lc.9MK4qBKwbAQDjGYYmm.u09MSR9CCBzLcKbJXIZTAFo7efaT5dK', 'Administração', '2º Semestre'),
('Pedro Costa', 'pedro@unic.ao', '$2a$10$BYk.5LNl07YA.xaAIazAY.s7NtzbPe2iODP0u5xldS.1S53PySERS', 'Direito', '4º Semestre');

-- Inserir admin com hash correto
INSERT INTO admins (email, password, nome) VALUES 
('admin@otempo.com', '$2a$10$t3JXVffwVV9QX0GCMEaSpe14qKePPHTqx.ef4U61eBGlnK7QIgN/a', 'Administrador');

-- Verificar dados inseridos
SELECT 'ESTUDANTES INSERIDOS:' as mensagem;
SELECT id, nome, email FROM students;
SELECT 'ADMINS INSERIDOS:' as mensagem;
SELECT id, email FROM admins;
