// Animação dos números
function animateNumbers() {
    const numberElements = document.querySelectorAll('.number');
    
    numberElements.forEach(element => {
        const target = parseInt(element.getAttribute('data-count'));
        const duration = 2000; // 2 segundos
        const step = target / (duration / 16); // 60 FPS
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current);
        }, 16);
    });
}

// Intersection Observer para animação dos números
function setupNumberAnimation() {
    const numbersSection = document.querySelector('.about-numbers');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateNumbers();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    if (numbersSection) {
        observer.observe(numbersSection);
    }
}

// Efeito de hover nas cards da equipe
function setupTeamHoverEffects() {
    const teamMembers = document.querySelectorAll('.team-member');
    
    teamMembers.forEach(member => {
        member.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
            this.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
        });
        
        member.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = 'var(--box-shadow)';
        });
    });
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    setupNumberAnimation();
    setupTeamHoverEffects();
    
    // Adicionar ano atual no footer (mantido para funcionalidade, mesmo que o HTML tenha sido atualizado)
    const currentYear = new Date().getFullYear();
    const yearElement = document.querySelector('.footer-bottom p');
    if (yearElement) {
        yearElement.innerHTML = `&copy; ${currentYear} Gomes Treinamentos. Todos os direitos reservados.`;
    }
});