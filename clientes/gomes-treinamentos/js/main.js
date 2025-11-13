// Funções utilitárias globais
function toggleMenu() {
    const nav = document.querySelector('.nav');
    nav.classList.toggle('active');
}

// Redireciona o botão de Login para a nova página dedicada
function redirectToLoginPage() {
    window.location.href = 'login-aluno.html';
}

// Modal de cadastro
function openRegisterModal() {
    // Implementação do modal de cadastro
    alert('A tela de cadastro será implementada aqui. Por enquanto, utilize a página de Login.');
}

// Configuração de eventos globais
document.addEventListener('DOMContentLoaded', function() {
    // Configurar botões de autenticação
    const loginBtn = document.querySelector('.btn-login');
    const registerBtn = document.querySelector('.btn-register');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', redirectToLoginPage);
    }
    
    if (registerBtn) {
        registerBtn.addEventListener('click', openRegisterModal);
    }
    
    // Adicionar ano atual no footer
    const currentYear = new Date().getFullYear();
    const yearElement = document.querySelector('.footer-bottom p');
    if (yearElement) {
        yearElement.innerHTML = `&copy; ${currentYear} Gomes Treinamentos. Todos os direitos reservados.`;
    }
});