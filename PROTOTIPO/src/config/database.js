const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'otempo_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function ensureStudentProfileColumns() {
    const connection = await pool.getConnection();
    try {
        await connection.query(
            'ALTER TABLE students ADD COLUMN IF NOT EXISTS morada VARCHAR(255) NULL AFTER telefone'
        );
        await connection.query(
            'ALTER TABLE students ADD COLUMN IF NOT EXISTS semestre VARCHAR(50) NULL AFTER curso'
        );
        await connection.query(
            'ALTER TABLE students ADD COLUMN IF NOT EXISTS trimestre VARCHAR(50) NULL AFTER semestre'
        );
        await connection.query(
            'ALTER TABLE students ADD COLUMN IF NOT EXISTS disciplinas TEXT NULL AFTER trimestre'
        );
        await connection.query(
            'ALTER TABLE students ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at'
        );
    } catch (error) {
        if (!String(error.message || '').includes('Duplicate column') && !String(error.message || '').includes('already exists')) {
            console.warn('Aviso ao preparar colunas do perfil do estudante:', error.message);
        }
    } finally {
        connection.release();
    }
}

async function ensureAcademicCatalogTables() {
    const connection = await pool.getConnection();
    try {
        await connection.query(`
            CREATE TABLE IF NOT EXISTS courses (
                id INT PRIMARY KEY AUTO_INCREMENT,
                nome VARCHAR(255) NOT NULL,
                codigo VARCHAR(50) DEFAULT NULL,
                descricao TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS subjects (
                id INT PRIMARY KEY AUTO_INCREMENT,
                course_id INT NOT NULL,
                nome VARCHAR(255) NOT NULL,
                codigo VARCHAR(50) DEFAULT NULL,
                professor VARCHAR(255) DEFAULT NULL,
                creditos INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
            )
        `);

        await connection.query(
            'ALTER TABLE tasks ADD COLUMN IF NOT EXISTS disciplina VARCHAR(255) NULL AFTER titulo'
        );
        await connection.query(
            'ALTER TABLE tasks ADD COLUMN IF NOT EXISTS data_inicio DATE NULL AFTER data_prazo'
        );
        await connection.query(
            'ALTER TABLE tasks ADD COLUMN IF NOT EXISTS data_fim DATE NULL AFTER data_inicio'
        );
    } catch (error) {
        console.warn('Aviso ao preparar o catálogo académico:', error.message);
    } finally {
        connection.release();
    }
}

async function ensureNotificationsTable() {
    const connection = await pool.getConnection();
    try {
        await connection.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                type VARCHAR(50) DEFAULT 'info',
                title VARCHAR(255) DEFAULT NULL,
                message TEXT DEFAULT NULL,
                is_read TINYINT(1) DEFAULT 0,
                meta JSON DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES students(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);
    } catch (error) {
        console.warn('Aviso ao preparar tabela notifications:', error.message);
    } finally {
        connection.release();
    }
}

async function clearDemoTasks() {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.query('SELECT COUNT(*) AS total FROM tasks');
        const total = Number(rows?.[0]?.total || 0);
        if (total > 0) {
            await connection.query('DELETE FROM tasks');
            console.log('🧹 Demo task data cleared to keep new accounts empty.');
        }
    } catch (error) {
        console.warn('Aviso ao limpar tarefas de demonstração:', error.message);
    } finally {
        connection.release();
    }
}

ensureStudentProfileColumns().catch((error) => {
    console.warn('Não foi possível validar colunas do perfil do estudante:', error.message);
});
ensureAcademicCatalogTables().catch((error) => {
    console.warn('Não foi possível validar o catálogo académico:', error.message);
});
ensureNotificationsTable().catch((error) => {
    console.warn('Não foi possível garantir a tabela notifications:', error.message);
});
clearDemoTasks().catch((error) => {
    console.warn('Não foi possível limpar tarefas de demonstração:', error.message);
});

module.exports = { pool, ensureStudentProfileColumns, ensureAcademicCatalogTables, clearDemoTasks };
