-- Criar base de dados
CREATE DATABASE IF NOT EXISTS `otempo_db`;
USE `otempo_db`;

-- Tabela de Administradores
CREATE TABLE IF NOT EXISTS admins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nome VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Estudantes
CREATE TABLE IF NOT EXISTS students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    curso VARCHAR(255),
    semestre VARCHAR(50),
    telefone VARCHAR(20),
    taxa_conclusao DECIMAL(5, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de Tarefas
CREATE TABLE IF NOT EXISTS tasks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    data_prazo DATE,
    status ENUM('pendente', 'em andamento', 'concluído', 'atrasado') DEFAULT 'pendente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Inserir dados de teste
-- Inserir dados de teste (idempotente: não falha se já existir)
INSERT INTO students (nome, email, password, curso, semestre) VALUES 
('João Silva', 'joao@unic.ao', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/DiK', 'Engenharia Informática', '3º Semestre'),
('Maria Santos', 'maria@unic.ao', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/DiK', 'Administração', '2º Semestre'),
('Pedro Costa', 'pedro@unic.ao', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/DiK', 'Direito', '4º Semestre')
ON DUPLICATE KEY UPDATE 
    password = VALUES(password),
    nome = VALUES(nome),
    curso = VALUES(curso),
    semestre = VALUES(semestre);

INSERT INTO admins (email, password, nome) VALUES 
('admin@otempo.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/DiK', 'Administrador')
ON DUPLICATE KEY UPDATE 
    password = VALUES(password),
    nome = VALUES(nome);

-- Ensure demo accounts for local testing (will update existing rows or insert)
INSERT INTO admins (email, password, nome)
VALUES ('admin@otempo.com', '$2a$10$Lxs7y5acMhdk3acBjYIU9OAwV56EAhQPuVFPXgAnJ7vB4q8v37D7y', 'Administrador')
ON DUPLICATE KEY UPDATE password = VALUES(password), nome = VALUES(nome);

INSERT INTO students (nome, email, password, curso, semestre)
VALUES ('Feliciano Sanjukila', 'feliciano@unic.ao', '$2a$10$ArNdNMJDIO/HbZubEuXmGeXTrpaiU7IZIyvOGq6f88qzH/wdO6vZC', 'Eng. Informática', '3º Semestre')
ON DUPLICATE KEY UPDATE password = VALUES(password), nome = VALUES(nome), curso = VALUES(curso), semestre = VALUES(semestre);

-- Verificação
SELECT 'Base de dados criada!' as mensagem;
SELECT COUNT(*) as total_students FROM students;
SELECT COUNT(*) as total_admins FROM admins;
