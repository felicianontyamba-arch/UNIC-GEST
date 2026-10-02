(function () {
    localStorage.removeItem('unicAdminAccount');
    localStorage.removeItem('unicStudentAccounts');

    const DEFAULT_STUDENTS = [
        {
            id: 1,
            nome: 'Feliciano Sanjukila',
            email: 'feliciano@unic.ao',
            curso: 'Eng. Informática',
            semestre: '3º Semestre',
            telefone: '+244 923 456 789'
        },
        {
            id: 2,
            nome: 'Maria Santos',
            email: 'maria@unic.ao',
            curso: 'Administração',
            semestre: '2º Semestre',
            telefone: '+244 934 567 890'
        },
        {
            id: 3,
            nome: 'Pedro Costa',
            email: 'pedro@unic.ao',
            curso: 'Direito',
            semestre: '4º Semestre',
            telefone: '+244 945 678 901'
        }
    ];

    function setActiveStudent(student) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('studentName', student.nome);
        localStorage.setItem('studentEmail', student.email);
        localStorage.setItem('studentCourse', student.curso || 'Eng. Informática');
        localStorage.setItem('studentSemester', student.semestre || '1º Semestre');
    }

    function logoutStudent() {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('studentName');
        localStorage.removeItem('studentEmail');
        localStorage.removeItem('studentCourse');
        localStorage.removeItem('studentSemester');
    }

    function loginStudent() {
        return null;
    }

    function loginAdmin() {
        return null;
    }

    window.UnicUserManager = {
        DEFAULT_STUDENTS,
        setActiveStudent,
        logoutStudent,
        loginStudent,
        loginAdmin
    };
})();
