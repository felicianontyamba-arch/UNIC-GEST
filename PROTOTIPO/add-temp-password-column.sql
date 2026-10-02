-- Adicionar coluna temp_password à tabela students
ALTER TABLE students ADD COLUMN temp_password VARCHAR(255) NULL AFTER password;

-- Adicionar índice para facilitar buscas
ALTER TABLE students ADD INDEX idx_temp_password (temp_password);
