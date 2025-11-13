// Dados simulados para o painel de gerenciamento
const simulatedMetrics = {
    sales: 'R$ 4.500,00',
    students: '128',
    courses: '7',
    satisfaction: '4.8'
};

const simulatedCourses = [
    { id: 1, title: "NR 10 - Instalações Elétricas", duration: "40h", price: "R$ 299,90", activeStudents: 55, progress: "90%" },
    { id: 2, title: "NR 35 - Trabalho em Altura", duration: "16h", price: "R$ 189,90", activeStudents: 32, progress: "70%" },
    { id: 7, title: "NR 23 - Proteção Contra Incêndios", duration: "12h", price: "R$ 179,90", activeStudents: 25, progress: "50%" },
    { id: 4, title: "NR 12 - Segurança em Máquinas", duration: "24h", price: "R$ 279,90", activeStudents: 10, progress: "40%" }
];

const simulatedStudents = [
    { name: "Daniel Antunes", email: "daniel@email.com", date: "01/10/2025", courses: 3, avgProgress: "60%" },
    { name: "Mariana Silva", email: "mariana@email.com", date: "25/09/2025", courses: 1, avgProgress: "100%" },
    { name: "Roberto Junior", email: "roberto@email.com", date: "10/08/2025", courses: 2, avgProgress: "85%" },
    { name: "Fernanda Lima", email: "fernanda@email.com", date: "05/10/2025", courses: 1, avgProgress: "15%" }
];

// 1. Função de Inicialização do Dashboard
function initAdminDashboard() {
    loadMetrics();
    loadCourseTable();
    loadStudentTable();
    setupNavigation();
}

// 2. Carrega as Métricas
function loadMetrics() {
    document.getElementById('metric-sales').textContent = simulatedMetrics.sales;
    document.getElementById('metric-students').textContent = simulatedMetrics.students;
    document.getElementById('metric-courses').textContent = simulatedMetrics.courses;
    document.getElementById('metric-satisfaction').textContent = simulatedMetrics.satisfaction;
}

// 3. Carrega a Tabela de Cursos
function loadCourseTable() {
    const tableBody = document.getElementById('course-table-body');
    tableBody.innerHTML = '';
    
    simulatedCourses.forEach(course => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${course.id}</td>
            <td>${course.title}</td>
            <td>${course.duration}</td>
            <td>${course.price}</td>
            <td>${course.activeStudents} (${course.progress})</td>
            <td>
                <button class="btn-action btn-edit">Editar</button>
                <button class="btn-action btn-delete">Excluir</button>
            </td>
        `;
    });
}

// 4. Carrega a Tabela de Alunos
function loadStudentTable() {
    const tableBody = document.getElementById('student-table-body');
    tableBody.innerHTML = '';

    simulatedStudents.forEach(student => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${student.name}</td>
            <td>${student.email}</td>
            <td>${student.date}</td>
            <td>${student.courses}</td>
            <td>${student.avgProgress}</td>
        `;
    });
}

// 5. Função para alternar entre as seções (Overview, Cursos, Alunos)
function showSection(viewId) {
    // Esconde todas as seções
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });

    // Mostra a seção desejada
    const targetSection = document.getElementById(viewId);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Atualiza o estado ativo na navegação
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.classList.remove('active');
    });
    const activeLink = document.querySelector(`.sidebar-nav a[data-view="${viewId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }

    // Atualiza o título e subtítulo
    document.querySelector('.main-content-admin h1').textContent = 
        viewId === 'overview' ? 'Dashboard Administrativo' : 
        viewId === 'courses' ? 'Gestão de Cursos' : 
        viewId === 'students' ? 'Alunos Inscritos' :
        'Upload de Conteúdo';
    
    document.querySelector('.admin-subtitle').textContent = 
        viewId === 'overview' ? 'Bem-vindo(a), Gerente Clovis Gomes. Status do sistema em tempo real.' :
        'Gerencie as informações detalhadamente.';
}

// 6. Configura a navegação
function setupNavigation() {
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const view = this.getAttribute('data-view');
            showSection(view);
        });
    });
}

// 7. Simula o envio do formulário de upload
function handleUploadSubmit(event) {
    event.preventDefault();
    const moduleTitle = document.getElementById('moduleTitle').value;
    alert(`SIMULAÇÃO DE SUCESSO: O módulo "${moduleTitle}" foi enviado! (Aguardando implementação do servidor).`);
    // Limpar formulário após a simulação
    document.querySelector('.content-upload-form form').reset();
}

// Define showSection e handleUploadSubmit globalmente
window.showSection = showSection;
window.handleUploadSubmit = handleUploadSubmit; 


// 8. Inicializa tudo ao carregar a página
document.addEventListener('DOMContentLoaded', initAdminDashboard);

// (A função logout() deve estar em js/login.js)