// Funções de Logout para uso em Dashboard e Admin
function logout() {
    alert('Sessão encerrada. Redirecionando para a página inicial.');
    window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    // Função para mostrar mensagem de feedback
    function showMessage(type, message) {
        let msgElement = document.querySelector('.login-message');
        if (!msgElement) {
            msgElement = document.createElement('div');
            msgElement.className = 'login-message';
            loginForm.before(msgElement);
        }
        msgElement.className = `login-message ${type}`;
        msgElement.textContent = message;
        msgElement.style.display = 'block';
    }

    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Oculta mensagens antigas
            document.querySelectorAll('.login-message').forEach(el => el.style.display = 'none');
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();
            
            // Simulação de Loading
            const submitBtn = document.querySelector('.btn-submit');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Verificando...';

            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Entrar';
                
                // Credenciais de teste: admin/admin (Aluno) e gerente/gerente (Admin)
                if (username === 'admin' && password === 'admin') {
                    showMessage('success', 'Login de Aluno realizado. Redirecionando...');
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 500);
                    
                } else if (username === 'gerente' && password === 'gerente') {
                    showMessage('success', 'Login de Administrador realizado. Redirecionando para o Painel...');
                    setTimeout(() => {
                        window.location.href = 'admin.html';
                    }, 500);
                }
                else {
                    showMessage('error', 'Usuário ou Senha inválidos. Tente "admin" para aluno ou "gerente" para administrador.');
                }
            }, 1000); // Simula 1 segundo de requisição
        });
    }
});