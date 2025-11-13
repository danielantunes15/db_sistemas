// Validação do formulário de contato
function validateForm() {
    const form = document.getElementById('contactForm');
    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const subject = document.getElementById('subject');
    const message = document.getElementById('message');
    
    let isValid = true;
    
    // Reset errors
    clearErrors();
    
    // Validar nome
    if (name.value.trim() === '') {
        showError('nameError', 'Por favor, informe seu nome');
        isValid = false;
    }
    
    // Validar email
    if (email.value.trim() === '') {
        showError('emailError', 'Por favor, informe seu email');
        isValid = false;
    } else if (!isValidEmail(email.value)) {
        showError('emailError', 'Por favor, informe um email válido');
        isValid = false;
    }
    
    // Validar assunto
    if (subject.value === '') {
        showError('subjectError', 'Por favor, selecione um assunto');
        isValid = false;
    }
    
    // Validar mensagem
    if (message.value.trim() === '') {
        showError('messageError', 'Por favor, escreva sua mensagem');
        isValid = false;
    } else if (message.value.trim().length < 10) {
        showError('messageError', 'A mensagem deve ter pelo menos 10 caracteres');
        isValid = false;
    }
    
    return isValid;
}

// Validar formato de email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Mostrar erro
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
}

// Limpar erros
function clearErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.textContent = '';
    });
}

// Envio do formulário
function handleFormSubmit(event) {
    event.preventDefault();
    
    if (validateForm()) {
        const submitBtn = document.querySelector('.btn-submit');
        const formData = new FormData(document.getElementById('contactForm'));
        
        // Simular envio (em produção, substituir por AJAX/Fetch)
        submitBtn.classList.add('loading');
        
        setTimeout(() => {
            submitBtn.classList.remove('loading');
            alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
            document.getElementById('contactForm').reset();
        }, 2000);
    }
}

// FAQ Accordion
function setupFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            // Fechar outros itens
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Alternar item atual
            item.classList.toggle('active');
        });
    });
}

// Máscara de telefone
function setupPhoneMask() {
    const phoneInput = document.getElementById('phone');
    
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length <= 10) {
                value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
            } else {
                value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
            }
            
            e.target.value = value;
        });
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }
    
    setupFAQAccordion();
    setupPhoneMask();
    
    // Adicionar ano atual no footer (mantido para funcionalidade, mesmo que o HTML tenha sido atualizado)
    const currentYear = new Date().getFullYear();
    const yearElement = document.querySelector('.footer-bottom p');
    if (yearElement) {
        yearElement.innerHTML = `&copy; ${currentYear} Gomes Treinamentos. Todos os direitos reservados.`;
    }
});