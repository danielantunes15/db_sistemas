// js/auth.js
// Inicializa o cliente Supabase
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('login-email');
const passwordInput = document.getElementById('login-password');
const loginTypeSelect = document.getElementById('login-type');
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
    const loginType = loginTypeSelect.value;

    if (isRegistering) {
        // Cadastro - apenas para empresas por enquanto
        if (loginType === 'empresa') {
            const { data, error } = await sb.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        tipo_usuario: 'empresa',
                        created_at: new Date().toISOString()
                    }
                }
            });

            if (error) {
                showMessage(error.message);
            } else {
                showMessage('Cadastro realizado! Verifique seu email para confirmar.', false);
                // Limpar formulário após cadastro bem-sucedido
                loginForm.reset();
            }
        } else {
            showMessage('Cadastro de administradores não permitido via formulário.');
        }
    } else {
        // Login
        const { data, error } = await sb.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            showMessage("Email ou senha incorretos.");
        } else {
            // Verificar se o tipo de usuário corresponde ao selecionado
            const userType = data.user.user_metadata?.tipo_usuario || 'empresa';
            
            if (userType !== loginType) {
                showMessage(`Este email não tem acesso como ${loginType === 'empresa' ? 'Empresa' : 'Administrador'}.`);
                await sb.auth.signOut();
            } else {
                // Salvar tipo no sessionStorage para usar no dashboard
                sessionStorage.setItem('userType', loginType);
                sessionStorage.setItem('userEmail', data.user.email);
                window.location.href = 'index.html';
            }
        }
    }
    
    setLoading(false);
}

function toggleRegisterMode(e) {
    e.preventDefault();
    isRegistering = !isRegistering;
    
    if (isRegistering) {
        document.getElementById('form-title').textContent = 'Criar Conta';
        document.getElementById('form-subtitle').textContent = 'Crie sua conta para começar a monitorar seus sistemas.';
        submitBtnText.textContent = 'Cadastrar';
        toggleRegisterLink.textContent = 'Já tem uma conta? Faça login';
        // No cadastro, só permitir tipo empresa
        loginTypeSelect.value = 'empresa';
        loginTypeSelect.disabled = true;
    } else {
        document.getElementById('form-title').textContent = 'Acesse sua conta';
        document.getElementById('form-subtitle').textContent = 'Bem-vindo de volta! Por favor, insira seus dados.';
        submitBtnText.textContent = 'Entrar';
        toggleRegisterLink.textContent = 'Não tem uma conta? Cadastre-se';
        loginTypeSelect.disabled = false;
    }
    showMessage('', false);
}

loginForm.addEventListener('submit', handleAuthSubmit);
toggleRegisterLink.addEventListener('click', toggleRegisterMode);

// Atualizar interface quando mudar o tipo de login
loginTypeSelect.addEventListener('change', function() {
    showMessage('', false);
});