// Dados simulados dos cursos (incluindo campos para o certificado)
const studentCourses = [
    {
        id: 1,
        title: "NR 10 - Segurança em Instalações e Serviços em Eletricidade - Básico",
        duration: "40 (quarenta) horas/aula",
        completionDate: "08 de Outubro de 2025",
        progress: 75,
        description: "Treinamento em eletricidade e riscos elétricos",
        nextLesson: "Módulo 4: Bloqueio e Sinalização"
    },
    {
        id: 2,
        title: "NR 35 - Trabalho em Altura",
        duration: "16 (dezesseis) horas/aula",
        completionDate: "15 de Setembro de 2025",
        progress: 100, // Concluído
        description: "Curso concluído e certificado disponível",
        nextLesson: "Concluído"
    },
    {
        id: 3,
        title: "NR 23 - Proteção Contra Incêndios",
        duration: "12 (doze) horas/aula",
        completionDate: "01 de Novembro de 2025",
        progress: 100, // Concluído para teste
        description: "Treinamento essencial em brigada de incêndio e prevenção",
        nextLesson: "Concluído"
    }
];

// FUNÇÃO CHAVE: Gera a URL e abre a janela de impressão
function generateCertificate(courseId) {
    const course = studentCourses.find(c => c.id === courseId);
    
    if (!course || course.progress !== 100) {
        alert("O curso não está 100% completo.");
        return;
    }
    
    // Dados Dinâmicos
    const studentName = 'DANIEL ANTUNES'; 
    const certNum = `2025-${course.id}-${Math.floor(Math.random() * 9000 + 1000)}`;
    const hoursPart = course.duration; 

    // Constrói a URL com todos os parâmetros necessários
    const url = `certificado.html?name=${encodeURIComponent(studentName)}&course=${encodeURIComponent(course.title)}&hours=${encodeURIComponent(hoursPart)}&date=${encodeURIComponent(course.completionDate)}&cert=${encodeURIComponent(certNum)}`;

    // Abre a nova janela/aba, que irá disparar o window.print()
    window.open(url, '_blank');
}

function accessCourse(courseId) {
    alert(`Redirecionando para a sala de aula do curso ID: ${courseId}. (Aqui seria o player de vídeo)`);
}

function renderDashboardCourses() {
    const container = document.getElementById('courses-dashboard-container');
    container.innerHTML = '';

    studentCourses.forEach(course => {
        const isCompleted = course.progress === 100;
        const buttonAction = isCompleted ? `generateCertificate(${course.id})` : `accessCourse(${course.id})`;
        const buttonText = isCompleted ? 'Gerar Certificado (PDF)' : 'Continuar Curso';
        
        const courseElement = document.createElement('div');
        courseElement.className = 'course-card-dashboard';
        
        courseElement.innerHTML = `
            <h3>${course.title}</h3>
            <p>${course.description}</p>
            
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${course.progress}%; background-color: ${isCompleted ? 'var(--success-color)' : 'var(--accent-color)'};"></div>
            </div>
            
            <p class="progress-text">${course.progress}% Completo</p>
            
            <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #eee; font-size: 0.95rem;">
                <strong>Próxima Ação:</strong> ${course.nextLesson}
            </div>
            
            <button class="btn-primary" onclick="${buttonAction}" ${isCompleted ? '' : ''}>
                ${buttonText}
            </button>
        `;
        
        container.appendChild(courseElement);
    });
    
    // Atualiza o resumo
    document.getElementById('total-courses').textContent = studentCourses.length.toString().padStart(2, '0');
    const completed = studentCourses.filter(c => c.progress === 100).length;
    document.getElementById('completed-courses').textContent = completed.toString().padStart(2, '0');
    
    // Atualiza o nome do aluno na dashboard
    const heroTitle = document.querySelector('.dashboard-hero h1');
    if (heroTitle) {
        heroTitle.textContent = "Bem-vindo(a), Daniel Antunes!";
    }
}

document.addEventListener('DOMContentLoaded', function() {
    renderDashboardCourses();
});

// A função logout (necessária para dashboard.html) está no js/login.js, 
// então garantimos que ambos os scripts estejam carregados no dashboard.html.