const { pool } = require('../src/config/database');

async function addTempPasswordColumn() {
    try {
        const connection = await pool.getConnection();
        
        console.log('🔄 Adicionando coluna temp_password...');
        
        await connection.query(`
            ALTER TABLE students ADD COLUMN IF NOT EXISTS temp_password VARCHAR(255) NULL
        `);
        
        console.log('✅ Coluna temp_password adicionada com sucesso!');
        
        connection.release();
        process.exit(0);
    } catch (error) {
        if (error.message.includes('Duplicate column')) {
            console.log('ℹ️  Coluna temp_password já existe');
            process.exit(0);
        }
        console.error('❌ Erro:', error.message);
        process.exit(1);
    }
}

addTempPasswordColumn();
