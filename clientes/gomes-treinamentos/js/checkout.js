// Função para obter parâmetros da URL
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Inicialização e População do Resumo
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('checkoutForm');
    const messageDiv = document.getElementById('checkout-message');

    // 1. Popula o Resumo com dados da URL
    const courseTitle = getUrlParameter('title') || 'Curso Padrão';
    const coursePrice = getUrlParameter('price') || 'R$ 0,00';
    
    document.getElementById('summary-course-title').textContent = courseTitle;
    document.getElementById('summary-course-price').textContent = coursePrice;
    document.getElementById('summary-subtotal').textContent = coursePrice;
    document.getElementById('summary-total-price').textContent = coursePrice;

    // 2. Lógica de Validação e Simulação de Cadastro/Compra
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Simulação de Validação
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm_password').value;
        const email = document.getElementById('email').value;

        if (password.length < 6) {
            showMessage('error', 'A senha deve ter no mínimo 6 caracteres.');
            return;
        }
        
        if (password !== confirmPassword) {
            showMessage('error', 'As senhas não coincidem.');
            return;
        }

        // 3. Simulação de Criação do Cliente e Acesso
        
        const submitBtn = form.querySelector('.btn-primary');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processando Pagamento e Cadastro...';
        messageDiv.style.display = 'none';

        setTimeout(() => {
            // Sucesso Simulado
            submitBtn.disabled = false;
            submitBtn.textContent = 'Compra Finalizada!';
            
            showMessage('success', `Parabéns, ${document.getElementById('name').value}! Seu cadastro foi criado com sucesso. Seu login é: ${email}`);
            
            // Redirecionamento para a página de login/dashboard após a compra
            setTimeout(() => {
                alert('Redirecionando para a área de login para você iniciar o curso!');
                window.location.href = 'login-aluno.html';
            }, 3000);

        }, 2000); // Simula 2 segundos de processamento
    });
    
    // 4. Função para exibir mensagens
    function showMessage(type, message) {
        messageDiv.className = `checkout-message ${type}`;
        messageDiv.textContent = message;
        messageDiv.style.display = 'block';
    }
});