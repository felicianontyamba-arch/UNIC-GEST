const express = require('express');
const bcrypt = require('bcryptjs');
const PDFDocument = require('pdfkit');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// ✅ ADMIN: Alterar senha de estudante
router.post('/admin/change-student-password', authenticateToken, async (req, res) => {
    try {
        const { studentId, newPassword } = req.body;

        // Verificar se é admin
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Apenas admins podem alterar senhas de estudantes' });
        }

        if (!studentId || !newPassword || newPassword.length < 6) {
            return res.status(400).json({ error: 'ID do estudante e senha (mín 6 caracteres) são obrigatórios' });
        }

        const hash = await bcrypt.hash(newPassword, 10);
        const connection = await pool.getConnection();

        const [result] = await connection.query(
            'UPDATE students SET password = ? WHERE id = ?',
            [hash, studentId]
        );

        connection.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Estudante não encontrado' });
        }

        res.json({ 
            success: true,
            message: `✅ Senha do estudante atualizada com sucesso e salva no XAMPP!`
        });
    } catch (error) {
        console.error('Erro ao alterar senha:', error);
        res.status(500).json({ error: 'Erro ao alterar senha' });
    }
});

// ✅ ADMIN: Alterar senha de outro admin
router.post('/admin/change-admin-password', authenticateToken, async (req, res) => {
    try {
        const { adminId, newPassword } = req.body;

        // Verificar se é admin
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Apenas admins podem fazer isto' });
        }

        if (!adminId || !newPassword || newPassword.length < 6) {
            return res.status(400).json({ error: 'ID e senha (mín 6 caracteres) são obrigatórios' });
        }

        const hash = await bcrypt.hash(newPassword, 10);
        const connection = await pool.getConnection();

        const [result] = await connection.query(
            'UPDATE admins SET password = ? WHERE id = ?',
            [hash, adminId]
        );

        connection.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Admin não encontrado' });
        }

        res.json({ 
            success: true,
            message: '✅ Senha do admin atualizada!'
        });
    } catch (error) {
        console.error('Erro ao alterar senha:', error);
        res.status(500).json({ error: 'Erro ao alterar senha' });
    }
});

// ✅ NOTA: Estudantes NÃO podem alterar suas próprias senhas
// ✅ Apenas o ADMIN pode alterar senhas através da rota admin/change-student-password

// ✅ ADMIN: Listar todos os estudantes (para gerenciar senhas)
router.get('/admin/students-password-management', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Apenas admins podem acessar isto' });
        }

        const connection = await pool.getConnection();
        const [students] = await connection.query(
            'SELECT id, nome, email, curso, semestre, created_at FROM students ORDER BY nome'
        );
        connection.release();

        res.json(students);
    } catch (error) {
        console.error('Erro ao listar estudantes:', error);
        res.status(500).json({ error: 'Erro ao listar estudantes' });
    }
});

// ✅ ADMIN: Gerar PDF com credenciais e instruções
router.post('/admin/generate-password-pdf', authenticateToken, async (req, res) => {
    try {
        const { studentId } = req.body;

        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Apenas admins podem fazer isto' });
        }

        if (!studentId) {
            return res.status(400).json({ error: 'ID do estudante é obrigatório' });
        }

        const connection = await pool.getConnection();
        const [students] = await connection.query(
            'SELECT id, nome, email, curso, semestre, temp_password FROM students WHERE id = ?',
            [studentId]
        );

        if (students.length === 0) {
            connection.release();
            return res.status(404).json({ error: 'Estudante não encontrado' });
        }

        const student = students[0];
        let newPassword = student.temp_password;

        // Se não existir senha temporária, gerar nova
        if (!newPassword) {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            newPassword = '';
            for (let i = 0; i < 10; i++) {
                newPassword += chars[Math.floor(Math.random() * chars.length)];
            }

            // Hash para armazenar como senha principal
            const hash = await bcrypt.hash(newPassword, 10);
            
            // Guardar AMBOS: hash na coluna password e plaintext em temp_password
            await connection.query(
                'UPDATE students SET password = ?, temp_password = ? WHERE id = ?',
                [hash, newPassword, studentId]
            );
        } else {
            // Senha já existe, confirmar que está também hashed em password
            const hash = await bcrypt.hash(newPassword, 10);
            await connection.query(
                'UPDATE students SET password = ? WHERE id = ?',
                [hash, studentId]
            );
        }

        connection.release();

        // Gerar PDF profissional
        const doc = new PDFDocument({ margin: 50, size: 'A4' });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Credenciais_${student.nome.replace(/\s+/g, '_')}.pdf"`);

        doc.pipe(res);

        // Cores
        const primaryColor = '#0f172a';
        const accentColor = '#ef4444';
        const successColor = '#10b981';
        const lightGray = '#f3f4f6';

        // ===== CABEÇALHO =====
        // Fundo de cabeçalho
        doc.rect(0, 0, doc.page.width, 100).fill(primaryColor);

        // Texto do cabeçalho
        doc.fontSize(36).font('Helvetica-Bold').fillColor('#ffffff').text('UNIC GEST', 50, 25, { align: 'left' });
        doc.fontSize(12).font('Helvetica').fillColor('#cbd5e1').text('Sistema de Gestão Académica', 50, 65);

        doc.moveDown(3);

        // ===== SEÇÃO PRINCIPAL =====
        // Boas-vindas
        doc.fontSize(16).font('Helvetica-Bold').fillColor(primaryColor).text('🎓 Bem-vindo ao UNIC GEST!');
        doc.fontSize(10).font('Helvetica').fillColor('#475569').moveDown(0.3);
        doc.text('Caro(a) estudante, as suas credenciais de acesso foram geradas. Guarde-as com segurança.');
        doc.moveDown(1);

        // ===== INFORMAÇÕES DO ESTUDANTE =====
        // Box com fundo
        doc.rect(50, doc.y, 495, 100).fill(lightGray);
        
        doc.fontSize(11).font('Helvetica-Bold').fillColor(primaryColor).text('INFORMAÇÕES DO ESTUDANTE', 60, doc.y + 10);
        
        doc.fontSize(10).font('Helvetica').fillColor('#334155');
        doc.text(`Nome: ${student.nome}`, 60, doc.y + 5);
        doc.text(`Email: ${student.email}`, 60, doc.y + 20);
        doc.text(`Curso: ${student.curso}`, 60, doc.y + 35);
        doc.text(`Semestre: ${student.semestre || 'N/A'}`, 60, doc.y + 50);
        
        doc.moveDown(6.5);

        // ===== CREDENCIAIS DE ACESSO =====
        doc.fontSize(14).font('Helvetica-Bold').fillColor(primaryColor).text('🔐 Credenciais de Acesso');
        doc.moveDown(0.5);

        // Guardar posição Y atual
        const credentialsBoxY = doc.y;

        // Box com credenciais - fundo branco
        doc.rect(50, credentialsBoxY, 495, 110).fill('#ffffff').strokeColor(accentColor).lineWidth(2).stroke();
        
        // Email
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#334155').text('Email:', 65, credentialsBoxY + 15);
        doc.fontSize(11).font('Helvetica-Bold').fillColor(primaryColor).text(student.email, 65, credentialsBoxY + 30);

        // Divisão visual
        doc.strokeColor('#e5e7eb').lineWidth(1).moveTo(65, credentialsBoxY + 50).lineTo(520, credentialsBoxY + 50).stroke();

        // Senha - DESTAQUE MÁXIMO
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#334155').text('Senha:', 65, credentialsBoxY + 60);
        
        // Box vermelho para a senha
        doc.rect(65, credentialsBoxY + 72, 420, 28).fill(accentColor);
        doc.fontSize(16).font('Helvetica-Bold').fillColor('#ffffff').text(newPassword, 75, credentialsBoxY + 78, {
            width: 400,
            align: 'center'
        });
        
        doc.moveDown(8);

        // ===== COMO ACESSAR =====
        doc.fontSize(12).font('Helvetica-Bold').fillColor(primaryColor).text('📍 Como Acessar o Sistema?');
        doc.fontSize(10).font('Helvetica').fillColor('#475569').moveDown(0.5);

        const steps = [
            `1. Abra o navegador: http://127.0.0.1:5000/estudante-login.html`,
            `2. Introduza o seu Email acima`,
            `3. Introduza a sua Senha (em vermelho)`,
            `4. Clique em "Entrar" e aceda ao seu Dashboard!`
        ];

        steps.forEach(step => {
            doc.text(step, { indent: 20 });
        });

        doc.moveDown(1);

        // ===== FUNCIONALIDADES =====
        doc.fontSize(12).font('Helvetica-Bold').fillColor(primaryColor).text('✨ O que Pode Fazer?');
        doc.fontSize(9).font('Helvetica').fillColor('#475569').moveDown(0.3);

        const features = [
            '📊 Acompanhe suas notas e progresso académico',
            '📋 Consulte tarefas, prazos e avaliações',
            '📅 Veja horários, calendário académico e eventos',
            '🔔 Receba notificações e lembretes importantes',
            '📄 Aceda a documentos e recursos da disciplina',
            '💬 Comunique com professores e colegas'
        ];

        features.forEach(feature => {
            doc.text(feature, { indent: 20 });
        });

        doc.moveDown(1);

        // ===== CONSIDERAÇÕES IMPORTANTES =====
        doc.fontSize(12).font('Helvetica-Bold').fillColor(accentColor).text('⚠️  Considerações Importantes');
        doc.fontSize(9).font('Helvetica').fillColor('#475569').moveDown(0.3);

        const considerations = [
            '🔒 Guarde bem a sua senha - não a partilhe com ninguém',
            '🔑 Esta senha foi gerada especialmente para si pelo admin',
            '📧 Caso esqueça a senha, contacte o administrador do sistema',
            '⏰ Tem acesso 24/7 ao sistema de gestão académica',
            '🖥️  Use navegadores modernos (Chrome, Firefox, Edge, Safari)',
            '🌐 Recomenda-se utilizar http://127.0.0.1:5000 para acesso',
            '✓ Mudar de senha após o primeiro acesso é recomendado',
            '👨‍💼 Apoio técnico disponível com o administrador'
        ];

        considerations.forEach(consideration => {
            doc.text(consideration, { indent: 20 });
        });

        // ===== RODAPÉ =====
        doc.moveDown(1.5);
        doc.strokeColor('#e5e7eb').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
        doc.moveDown(0.5);

        doc.fontSize(8).font('Helvetica').fillColor('#9ca3af').text(
            `UNIC GEST © 2024 | Documento Confidencial | Gerado em ${new Date().toLocaleString('pt-PT')}`,
            { align: 'center' }
        );
        doc.text('Este documento contém informações confidenciais. Destrua após uso.', { align: 'center' });

        doc.end();

    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        res.status(500).json({ error: 'Erro ao gerar PDF' });
    }
});

module.exports = router;
