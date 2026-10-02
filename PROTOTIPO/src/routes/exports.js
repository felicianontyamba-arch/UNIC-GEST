const express = require('express');
const csv = require('csv-stringify');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/students/csv', authenticateToken, async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [students] = await connection.query('SELECT * FROM students');
        connection.release();

        const csvData = [
            ['ID', 'Nome', 'Email', 'Curso', 'Semestre', 'Telefone', 'Data de Registro']
        ];

        students.forEach(student => {
            csvData.push([
                student.id,
                student.nome,
                student.email,
                student.curso,
                student.semestre,
                student.telefone,
                new Date(student.created_at).toLocaleDateString('pt-BR')
            ]);
        });

        const csvContent = csvData.map(row => row.join(',')).join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=estudantes.csv');
        res.send(csvContent);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/tasks/csv', authenticateToken, async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [tasks] = await connection.query(`
            SELECT t.*, s.nome as estudante_nome 
            FROM tasks t 
            LEFT JOIN students s ON t.student_id = s.id
        `);
        connection.release();

        const csvData = [
            ['ID', 'Estudante', 'Título', 'Descrição', 'Data de Prazo', 'Status', 'Data de Criação']
        ];

        tasks.forEach(task => {
            csvData.push([
                task.id,
                task.estudante_nome || 'N/A',
                task.titulo,
                task.descricao || '',
                new Date(task.data_prazo).toLocaleDateString('pt-BR'),
                task.status,
                new Date(task.created_at).toLocaleDateString('pt-BR')
            ]);
        });

        const csvContent = csvData.map(row => row.join(',')).join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=tarefas.csv');
        res.send(csvContent);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/performance/csv', authenticateToken, async (req, res) => {
    try {
        const connection = await pool.getConnection();

        const [performance] = await connection.query(`
            SELECT 
                s.id,
                s.nome,
                s.email,
                s.curso,
                COUNT(t.id) as total_tarefas,
                SUM(CASE WHEN t.status = 'concluído' THEN 1 ELSE 0 END) as tarefas_concluidas,
                ROUND(SUM(CASE WHEN t.status = 'concluído' THEN 1 ELSE 0 END) / COUNT(t.id) * 100, 2) as taxa_conclusao
            FROM students s
            LEFT JOIN tasks t ON s.id = t.student_id
            GROUP BY s.id, s.nome, s.email, s.curso
        `);

        connection.release();

        const csvData = [
            ['ID', 'Nome', 'Email', 'Curso', 'Total de Tarefas', 'Tarefas Concluídas', 'Taxa de Conclusão (%)']
        ];

        performance.forEach(row => {
            csvData.push([
                row.id,
                row.nome,
                row.email,
                row.curso,
                row.total_tarefas,
                row.tarefas_concluidas,
                row.taxa_conclusao || 0
            ]);
        });

        const csvContent = csvData.map(row => row.join(',')).join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=relatorio_desempenho.csv');
        res.send(csvContent);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/students/excel', authenticateToken, async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [students] = await connection.query('SELECT * FROM students');
        connection.release();

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Estudantes');

        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Nome', key: 'nome', width: 25 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Curso', key: 'curso', width: 25 },
            { header: 'Semestre', key: 'semestre', width: 15 },
            { header: 'Telefone', key: 'telefone', width: 20 },
            { header: 'Data de Registro', key: 'created_at', width: 20 }
        ];

        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEF4444' } };
        worksheet.getRow(1).alignment = { horizontal: 'center', vertical: 'center' };

        students.forEach((student, index) => {
            worksheet.addRow({
                id: student.id,
                nome: student.nome,
                email: student.email,
                curso: student.curso,
                semestre: student.semestre,
                telefone: student.telefone,
                created_at: new Date(student.created_at).toLocaleDateString('pt-BR')
            });

            if ((index + 2) % 2 === 0) {
                worksheet.getRow(index + 2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
            }
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=estudantes.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/tasks/excel', authenticateToken, async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [tasks] = await connection.query(`
            SELECT t.*, s.nome as estudante_nome 
            FROM tasks t 
            LEFT JOIN students s ON t.student_id = s.id
        `);
        connection.release();

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Tarefas');

        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Estudante', key: 'estudante_nome', width: 25 },
            { header: 'Título', key: 'titulo', width: 30 },
            { header: 'Descrição', key: 'descricao', width: 35 },
            { header: 'Data de Prazo', key: 'data_prazo', width: 18 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Data de Criação', key: 'created_at', width: 20 }
        ];

        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEF4444' } };
        worksheet.getRow(1).alignment = { horizontal: 'center', vertical: 'center' };

        tasks.forEach((task, index) => {
            worksheet.addRow({
                id: task.id,
                estudante_nome: task.estudante_nome || 'N/A',
                titulo: task.titulo,
                descricao: task.descricao || '',
                data_prazo: new Date(task.data_prazo).toLocaleDateString('pt-BR'),
                status: task.status,
                created_at: new Date(task.created_at).toLocaleDateString('pt-BR')
            });

            if ((index + 2) % 2 === 0) {
                worksheet.getRow(index + 2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
            }
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=tarefas.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/performance/excel', authenticateToken, async (req, res) => {
    try {
        const connection = await pool.getConnection();

        const [performance] = await connection.query(`
            SELECT 
                s.id,
                s.nome,
                s.email,
                s.curso,
                COUNT(t.id) as total_tarefas,
                SUM(CASE WHEN t.status = 'concluído' THEN 1 ELSE 0 END) as tarefas_concluidas,
                ROUND(SUM(CASE WHEN t.status = 'concluído' THEN 1 ELSE 0 END) / COUNT(t.id) * 100, 2) as taxa_conclusao
            FROM students s
            LEFT JOIN tasks t ON s.id = t.student_id
            GROUP BY s.id, s.nome, s.email, s.curso
        `);

        connection.release();

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Desempenho');

        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Nome', key: 'nome', width: 25 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Curso', key: 'curso', width: 25 },
            { header: 'Total de Tarefas', key: 'total_tarefas', width: 18 },
            { header: 'Tarefas Concluídas', key: 'tarefas_concluidas', width: 18 },
            { header: 'Taxa de Conclusão (%)', key: 'taxa_conclusao', width: 20 }
        ];

        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10B981' } };
        worksheet.getRow(1).alignment = { horizontal: 'center', vertical: 'center' };

        performance.forEach((row, index) => {
            worksheet.addRow({
                id: row.id,
                nome: row.nome,
                email: row.email,
                curso: row.curso,
                total_tarefas: row.total_tarefas,
                tarefas_concluidas: row.tarefas_concluidas,
                taxa_conclusao: row.taxa_conclusao || 0
            });

            if ((index + 2) % 2 === 0) {
                worksheet.getRow(index + 2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
            }
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=relatorio_desempenho.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/students/pdf', authenticateToken, async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [students] = await connection.query('SELECT * FROM students');
        connection.release();

        const doc = new PDFDocument({ margin: 50, size: 'A4' });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=estudantes.pdf');

        doc.pipe(res);

        doc.fontSize(20).font('Helvetica-Bold').text('O Tempo', 50, 50);
        doc.fontSize(12).font('Helvetica').text('Relatório de Estudantes', 50, 75);
        doc.fontSize(10).fillColor('#666').text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 50, 95);
        doc.moveTo(50, 110).lineTo(545, 110).stroke();

        let yPosition = 130;
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#000');

        students.forEach((student, index) => {
            if (yPosition > 700) {
                doc.addPage();
                yPosition = 50;
            }

            doc.fillColor('#ef4444').text(`${index + 1}. ${student.nome}`, 50, yPosition, { width: 495 });
            yPosition += 20;

            doc.fontSize(10).fillColor('#666');
            doc.text(`Email: ${student.email}`, 60, yPosition);
            yPosition += 16;
            doc.text(`Curso: ${student.curso} | Semestre: ${student.semestre}`, 60, yPosition);
            yPosition += 16;
            doc.text(`Telefone: ${student.telefone || 'N/A'}`, 60, yPosition);
            yPosition += 16;
            doc.text(`Registrado em: ${new Date(student.created_at).toLocaleDateString('pt-BR')}`, 60, yPosition);
            yPosition += 25;

            doc.fontSize(11).font('Helvetica-Bold').fillColor('#000');
        });

        doc.end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/tasks/pdf', authenticateToken, async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [tasks] = await connection.query(`
            SELECT t.*, s.nome as estudante_nome 
            FROM tasks t 
            LEFT JOIN students s ON t.student_id = s.id
        `);
        connection.release();

        const doc = new PDFDocument({ margin: 50, size: 'A4' });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=tarefas.pdf');

        doc.pipe(res);

        doc.fontSize(20).font('Helvetica-Bold').text('O Tempo', 50, 50);
        doc.fontSize(12).font('Helvetica').text('Relatório de Tarefas', 50, 75);
        doc.fontSize(10).fillColor('#666').text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 50, 95);
        doc.moveTo(50, 110).lineTo(545, 110).stroke();

        let yPosition = 130;
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#000');

        tasks.forEach((task, index) => {
            if (yPosition > 700) {
                doc.addPage();
                yPosition = 50;
            }

            doc.fillColor('#ef4444').text(`${index + 1}. ${task.titulo}`, 50, yPosition, { width: 495 });
            yPosition += 18;

            doc.fontSize(9).fillColor('#666');
            doc.text(`Estudante: ${task.estudante_nome || 'N/A'}`, 60, yPosition);
            yPosition += 14;
            doc.text(`Descrição: ${task.descricao || 'Sem descrição'}`, 60, yPosition, { width: 450, align: 'left' });
            yPosition += 30;
            doc.text(`Prazo: ${new Date(task.data_prazo).toLocaleDateString('pt-BR')} | Status: ${task.status}`, 60, yPosition);
            yPosition += 20;

            doc.fontSize(10).font('Helvetica-Bold').fillColor('#000');
        });

        doc.end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/performance/pdf', authenticateToken, async (req, res) => {
    try {
        const connection = await pool.getConnection();

        const [performance] = await connection.query(`
            SELECT 
                s.id,
                s.nome,
                s.email,
                s.curso,
                COUNT(t.id) as total_tarefas,
                SUM(CASE WHEN t.status = 'concluído' THEN 1 ELSE 0 END) as tarefas_concluidas,
                ROUND(SUM(CASE WHEN t.status = 'concluído' THEN 1 ELSE 0 END) / COUNT(t.id) * 100, 2) as taxa_conclusao
            FROM students s
            LEFT JOIN tasks t ON s.id = t.student_id
            GROUP BY s.id, s.nome, s.email, s.curso
        `);

        connection.release();

        const doc = new PDFDocument({ margin: 50, size: 'A4' });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=relatorio_desempenho.pdf');

        doc.pipe(res);

        doc.fontSize(20).font('Helvetica-Bold').text('O Tempo', 50, 50);
        doc.fontSize(12).font('Helvetica').text('Relatório de Desempenho', 50, 75);
        doc.fontSize(10).fillColor('#666').text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 50, 95);
        doc.moveTo(50, 110).lineTo(545, 110).stroke();

        let yPosition = 130;
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#000');

        performance.forEach((row, index) => {
            if (yPosition > 700) {
                doc.addPage();
                yPosition = 50;
            }

            doc.fillColor('#10b981').text(`${index + 1}. ${row.nome}`, 50, yPosition);
            yPosition += 18;

            doc.fontSize(9).fillColor('#666');
            doc.text(`Email: ${row.email} | Curso: ${row.curso}`, 60, yPosition);
            yPosition += 14;
            doc.text(`Total de Tarefas: ${row.total_tarefas} | Concluídas: ${row.tarefas_concluidas} | Taxa de Conclusão: ${row.taxa_conclusao || 0}%`, 60, yPosition);
            yPosition += 25;

            doc.fontSize(10).font('Helvetica-Bold').fillColor('#000');
        });

        doc.end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
