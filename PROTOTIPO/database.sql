-- Criação do banco de dados O Tempo
CREATE DATABASE IF NOT EXISTS otempo_db;
USE otempo_db;

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
    curso VARCHAR(255) NOT NULL,
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

-- Tabela de Lembretes
CREATE TABLE IF NOT EXISTS reminders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    task_id INT,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    data_lembrete DATETIME,
    lido BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- Tabela de Documentos
CREATE TABLE IF NOT EXISTS documents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    task_id INT,
    nome_arquivo VARCHAR(255),
    caminho_arquivo VARCHAR(500),
    tipo_documento VARCHAR(100),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- Inserir admin padrão (email: admin@otempo.com, senha: admin123)
INSERT INTO admins (email, password, nome) VALUES 
('admin@otempo.com', '$2a$10$t3JXVffwVV9QX0GCMEaSpe14qKePPHTqx.ef4U61eBGlnK7QIgN/a', 'Administrador O Tempo');

-- Alguns dados de exemplo
INSERT INTO students (nome, email, curso, semestre, telefone) VALUES 
('João Silva', 'joao@unic.ao', 'Engenharia Informática', '3º Semestre', '+244 923 456 789'),
('Maria Santos', 'maria@unic.ao', 'Administração', '2º Semestre', '+244 934 567 890'),
('Pedro Costa', 'pedro@unic.ao', 'Direito', '4º Semestre', '+244 945 678 901');

INSERT INTO tasks (student_id, titulo, descricao, data_prazo, status) VALUES 
(1, 'Projeto de Programação', 'Desenvolver aplicação web', '2026-09-20', 'em andamento'),
(1, 'Trabalho de Banco de Dados', 'Modelar banco de dados', '2026-09-25', 'pendente'),
(2, 'Relatório de Contabilidade', 'Análise financeira Q3', '2026-09-18', 'pendente'),
(3, 'Pesquisa Jurídica', 'Estudar casos de direito civil', '2026-09-22', 'concluído');
