// js/auth.js
// Inicializa o cliente Supabase
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('login-email');
const passwordInput = document.getElementById('login-password');
const messageEl = document.getElementById('auth-message');
const submitBtn = loginForm.querySelector('button[type="submit"]');
const submitBtnText = document.getElementById('submit-text');
const loadingSpinner = document.getElementById('loading-spinner');
const toggleRegisterLink = document.getElementById('toggle-register');

let isRegistering = false;

function setLoading(isLoading) {
    if (isLoading) {
        submitBtn.disabled = true;
        submitBtnText.style.display = 'none';
        loadingSpinner.style.display = 'block';
    } else {
        submitBtn.disabled = false;
        submitBtnText.style.display = 'inline';
        loadingSpinner.style.display = 'none';
    }
}

function showMessage(message, isError = true) {
    messageEl.textContent = message;
    messageEl.style.color = isError ? 'var(--danger-color)' : 'var(--success-color)';
}

// Lida com o Login/Registro
async function handleAuthSubmit(e) {
    e.preventDefault();
    setLoading(true);
    showMessage('', false);
    
    const email = emailInput.value;
    const password = passwordInput.value;

    if (isRegistering) {
        // O Supabase faz o hash da senha automaticamente aqui
        const { data, error } = await sb.auth.signUp({
            email: email,
            password: password
        });

        if (error) {
            showMessage(error.message);
        } else {
            showMessage('Cadastro realizado! Verifique seu email para confirmar.', false);
        }

    } else {
        // Login normal
        const { data, error } = await sb.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            showMessage("Email ou senha incorretos.");
        } else {
            window.location.href = 'index.html';
        }
    }
    
    setLoading(false);
}

function toggleRegisterMode(e) {
    e.preventDefault();
    isRegistering = !isRegistering;
    
    if (isRegistering) {
        submitBtnText.textContent = 'Cadastrar';
        toggleRegisterLink.textContent = 'Já tem uma conta? Faça login';
    } else {
        submitBtnText.textContent = 'Entrar';
        toggleRegisterLink.textContent = 'Não tem uma conta? Cadastre-se';
    }
    showMessage('', false);
}

loginForm.addEventListener('submit', handleAuthSubmit);
toggleRegisterLink.addEventListener('click', toggleRegisterMode);