// Dados dos cursos
const coursesData = [
    {
        id: 1,
        title: "NR 10 - Segurança em Instalações Elétricas",
        category: "nr10",
        duration: "40 horas",
        level: "Básico ao Avançado",
        price: "R$ 299,90",
        description: "Curso completo para trabalhadores que atuam com eletricidade",
        icon: "⚡"
    },
    {
        id: 2,
        title: "NR 35 - Trabalho em Altura",
        category: "nr35",
        duration: "16 horas",
        level: "Básico",
        price: "R$ 189,90",
        description: "Treinamento essencial para atividades em altura",
        icon: "🧗"
    },
    {
        id: 3,
        title: "NR 33 - Espaços Confinados",
        category: "nr33",
        duration: "20 horas",
        level: "Básico",
        price: "R$ 249,90",
        description: "Capacitação para trabalho seguro em espaços confinados",
        icon: "🚪"
    },
    {
        id: 7,
        title: "NR 23 - Proteção Contra Incêndios",
        category: "bombeiro",
        duration: "12 horas",
        level: "Básico",
        price: "R$ 179,90",
        description: "Treinamento essencial em brigada de incêndio e prevenção",
        icon: "🔥"
    },
    {
        id: 4,
        title: "NR 12 - Segurança no Trabalho em Máquinas",
        category: "outros",
        duration: "24 horas",
        level: "Básico",
        price: "R$ 279,90",
        description: "Treinamento para operação segura de máquinas e equipamentos",
        icon: "⚙️"
    },
    {
        id: 5,
        title: "NR 6 - Equipamentos de Proteção Individual",
        category: "outros",
        duration: "8 horas",
        level: "Básico",
        price: "R$ 149,90",
        description: "Capacitação sobre uso correto de EPIs",
        icon: "🛡️"
    },
    {
        id: 6,
        title: "NR 10 - Reciclagem",
        category: "nr10",
        duration: "20 horas",
        level: "Reciclagem",
        price: "R$ 199,90",
        description: "Reciclagem obrigatória para profissionais da área elétrica",
        icon: "⚡"
    }
];

// Função para renderizar cursos (mantida)
function renderCourses(courses) {
    const container = document.getElementById('courses-container');
    container.innerHTML = '';
    
    if (courses.length === 0) {
        container.innerHTML = '<p style="text-align: center; grid-column: 1 / -1;">Nenhum curso encontrado para o filtro/busca selecionada.</p>';
        return;
    }

    courses.forEach(course => {
        const courseElement = document.createElement('div');
        courseElement.className = 'course-item';
        courseElement.setAttribute('data-category', course.category);
        
        courseElement.innerHTML = `
            <div class="course-image">
                <span>${course.icon}</span>
            </div>
            <div class="course-content">
                <span class="course-category">${course.category === 'bombeiro' ? 'BOMBEIRO / INCÊNDIO' : course.category.toUpperCase()}</span>
                <h3>${course.title}</h3>
                <p>${course.description}</p>
                <div class="course-meta">
                    <div class="course-duration">
                        <span>⏱️</span>
                        <span>${course.duration}</span>
                    </div>
                    <div class="course-level">
                        <span>📊</span>
                        <span>${course.level}</span>
                    </div>
                </div>
                <div class="course-price">${course.price}</div>
                <button class="btn-course" onclick="viewCourseDetails(${course.id})">Ver Detalhes</button>
            </div>
        `;
        
        container.appendChild(courseElement);
    });
}

// Função para filtrar cursos (mantida)
function filterCourses(category) {
    if (category === 'all') {
        renderCourses(coursesData);
    } else {
        const filteredCourses = coursesData.filter(course => course.category === category);
        renderCourses(filteredCourses);
    }
}

// Função para buscar cursos (mantida)
function searchCourses(query) {
    const filteredCourses = coursesData.filter(course => 
        course.title.toLowerCase().includes(query.toLowerCase()) ||
        course.description.toLowerCase().includes(query.toLowerCase())
    );
    renderCourses(filteredCourses);
}

// Função ATUALIZADA para visualizar detalhes do curso
function viewCourseDetails(courseId) {
    const course = coursesData.find(c => c.id === courseId);
    if (course) {
        // Redireciona para a página de detalhes com o ID do curso
        window.location.href = `detalhes-curso.html?id=${course.id}`;
    }
}

// Inicialização (mantida)
document.addEventListener('DOMContentLoaded', function() {
    // Renderizar todos os cursos inicialmente
    renderCourses(coursesData);

    // Configurar filtros
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remover classe active de todos os botões
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Adicionar classe active ao botão clicado
            this.classList.add('active');
            // Filtrar cursos
            const filter = this.getAttribute('data-filter');
            filterCourses(filter);
        });
    });

    // Configurar busca
    const searchInput = document.getElementById('course-search');
    searchInput.addEventListener('input', function() {
        searchCourses(this.value);
    });
});