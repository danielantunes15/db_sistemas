// As chaves SUPABASE_URL e SUPABASE_KEY vêm do ficheiro 'config.js'
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Variável global para guardar os sites carregados da DB
let sites = [];

// Elementos DOM
const sitesContainer = document.getElementById('sites-container');
const addSiteBtn = document.getElementById('add-site-btn');
const siteModal = document.getElementById('site-modal');
const closeModalBtn = document.getElementById('close-modal');
const cancelBtn = document.getElementById('cancel-btn');
const siteForm = document.getElementById('site-form');
const modalTitle = document.getElementById('modal-title');
const submitBtn = siteForm.querySelector('button[type="submit"]');
const submitBtnText = document.getElementById('submit-text');
const loadingSpinner = document.getElementById('loading-spinner');

// Elementos DOM das Estatísticas
const totalSystemsEl = document.getElementById('total-systems');
const onlineSystemsEl = document.getElementById('online-systems');
const offlineSystemsEl = document.getElementById('offline-systems');

// Variáveis de estado
let editingSiteId = null;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    renderSites(); 
    setupEventListeners();
});

// Configurar event listeners
function setupEventListeners() {
    addSiteBtn.addEventListener('click', openAddModal);
    closeModalBtn.addEventListener('click', closeSiteModal);
    cancelBtn.addEventListener('click', closeSiteModal);
    siteForm.addEventListener('submit', handleFormSubmit);
    
    siteModal.addEventListener('click', function(e) {
        if (e.target === siteModal) {
            closeSiteModal();
        }
    });
}

// Função para atualizar os cartões de estatísticas
function updateStats() {
    const total = sites.length;
    const online = sites.filter(s => s.status === 'online').length;
    const offline = total - online;
    
    totalSystemsEl.textContent = total;
    onlineSystemsEl.textContent = online;
    offlineSystemsEl.textContent = offline;
}

// Renderizar sites na tela (agora é async)
async function renderSites() {
    // 1. Carregar dados do Supabase
    // Pedimos explicitamente a coluna 'supabaseurl' (minúsculas)
    const { data, error } = await sb.from('sites').select('*').order('created_at', { ascending: false });
    
    if (error) {
        console.error('Erro ao carregar sites:', error);
        sitesContainer.innerHTML = `<div class="empty-state"><h3>Erro ao carregar dados.</h3><p>${error.message}</p></div>`;
        return;
    }
    
    sites = data; 
    updateStats();

    // 3. Renderizar HTML
    if (sites.length === 0) {
        sitesContainer.innerHTML = `
            <div class="empty-state">
                <h3>Nenhum site cadastrado</h3>
                <p>Comece adicionando seu primeiro site ao painel.</p>
                <button class="btn btn-primary" id="add-first-site">Adicionar Site</button>
            </div>
        `;
        document.getElementById('add-first-site').addEventListener('click', openAddModal);
        return;
    }

    sitesContainer.innerHTML = '';
    
    sites.forEach(site => {
        const siteCard = document.createElement('div');
        siteCard.className = 'site-card';
        // Usamos site.name, site.url, etc. Os dados vêm do Supabase
        siteCard.innerHTML = `
            <div class="site-header">
                <div class="site-name">${site.name}</div>
                <div class="site-status">
                    <div class="status-dot ${site.status === 'online' ? '' : 'offline'}"></div>
                    <span>${site.status === 'online' ? 'Online' : 'Offline'}</span>
                </div>
            </div>
            <div class="site-body">
                <div class="site-info">
                    <p>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm7.5-6.923c-.67.204-1.335.82-1.887 1.855A7.97 7.97 0 0 0 5.145 4H7.5V1.077zM4.09 4a9.267 9.267 0 0 1 .64-1.539 6.7 6.7 0 0 1 .597-.933A7.025 7.025 0 0 0 2.255 4H4.09zm-.582 3.5c.03-.877.138-1.718.312-2.5H1.674a6.958 6.958 0 0 0-.656 2.5h2.49zM4.847 5a12.5 12.5 0 0 0-.338 2.5H7.5V5H4.847zM8.5 5v2.5h2.99a12.495 12.495 0 0 0-.337-2.5H8.5zM4.51 8.5a12.5 12.5 0 0 0 .337 2.5H7.5V8.5H4.51zm3.99 0V11h2.653c.187-.765.306-1.608.338-2.5H8.5zM5.145 12c.138.386.295.744.468 1.068.552 1.035 1.218 1.65 1.887 1.855V12H5.145zm.182 2.472a6.696 6.696 0 0 1-.597-.933A9.268 9.268 0 0 1 4.09 12H2.255a7.024 7.024 0 0 0 3.072 2.472zM3.82 11a13.652 13.652 0 0 1-.312-2.5h-2.49c.062.89.291 1.733.656 2.5H3.82zm6.853 3.472A7.024 7.024 0 0 0 13.745 12H11.91a9.27 9.27 0 0 1-.64 1.539 6.688 6.688 0 0 1-.597.933zM8.5 12v2.923c.67-.204 1.335-.82 1.887-1.855.173-.324.33-.682.468-1.068H8.5zm3.68-1h2.146c.365-.767.594-1.61.656-2.5h-2.49a13.65 13.65 0 0 1-.312 2.5zm2.802-3.5a6.959 6.959 0 0 0-.656-2.5H12.18c.174.782.282 1.623.312 2.5h2.49zM11.27 2.461c.247.464.462.98.64 1.539h1.835a7.024 7.024 0 0 0-3.072-2.472c.218.284.418.598.597.933zM10.855 4a7.966 7.966 0 0 0-.468-1.068C9.835 1.897 9.17 1.282 8.5 1.077V4h2.355z"/></svg>
                        ${site.url}
                    </p>
                    ${site.description ? `<p>${site.description}</p>` : ''}
                </div>
                <div class="site-actions">
                    <button class="btn btn-primary visit-site" data-url="${site.url}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/><path fill-rule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/></svg>
                        Visitar
                    </button>
                    <button class="btn btn-outline edit-site" data-id="${site.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/></svg>
                        Editar
                    </button>
                    <button class="btn btn-danger delete-site" data-id="${site.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>
                        Excluir
                    </button>
                </div>
            </div>
        `;
        
        sitesContainer.appendChild(siteCard);
    });
    
    setupCardEventListeners();
}

// Função separada para configurar listeners dos cartões
function setupCardEventListeners() {
    document.querySelectorAll('.visit-site').forEach(button => {
        button.addEventListener('click', function() {
            const url = this.getAttribute('data-url');
            window.open(url, '_blank');
        });
    });
    
    document.querySelectorAll('.edit-site').forEach(button => {
        button.addEventListener('click', function() {
            const siteId = this.getAttribute('data-id');
            openEditModal(siteId);
        });
    });
    
    document.querySelectorAll('.delete-site').forEach(button => {
        button.addEventListener('click', function() {
            const siteId = this.getAttribute('data-id');
            deleteSite(siteId);
        });
    });
}


// Abrir modal para adicionar site
function openAddModal() {
    editingSiteId = null;
    modalTitle.textContent = 'Adicionar Novo Site';
    siteForm.reset();
    siteModal.classList.add('active');
    document.getElementById('site-name').value = '';
    document.getElementById('site-url').value = '';
    document.getElementById('supabase-url').value = ''; 
    document.getElementById('supabase-key').value = ''; 
    document.getElementById('site-description').value = '';
}

// Abrir modal para editar site
function openEditModal(siteId) {
    const site = sites.find(s => s.id === siteId);
    if (!site) return;
    
    editingSiteId = siteId;
    modalTitle.textContent = 'Editar Site';
    
    document.getElementById('site-name').value = site.name;
    document.getElementById('site-url').value = site.url;
    // **CORREÇÃO AQUI**
    // Lê de 'site.supabaseurl' (minúsculas)
    document.getElementById('supabase-url').value = site.supabaseurl || ''; 
    document.getElementById('supabase-key').value = '';
    document.getElementById('site-description').value = site.description || '';
    
    siteModal.classList.add('active');
}

// Fechar modal
function closeSiteModal() {
    siteModal.classList.remove('active');
    editingSiteId = null;
}

// Mostrar/Esconder o spinner de carregamento
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

// Manipular envio do formulário (agora é async)
async function handleFormSubmit(e) {
    e.preventDefault();
    setLoading(true);
    
    // **CORREÇÃO AQUI**
    // A chave do objeto agora é 'supabaseurl' (minúsculas)
    const formData = {
        name: document.getElementById('site-name').value,
        url: document.getElementById('site-url').value,
        supabaseurl: document.getElementById('supabase-url').value, 
        description: document.getElementById('site-description').value,
        status: 'online'
    };
    
    let error;
    
    if (editingSiteId) {
        error = await updateSite(editingSiteId, formData);
    } else {
        error = await addSite(formData);
    }
    
    setLoading(false);
    
    if (error) {
        // O erro não deve mais acontecer, mas se acontecer, será mostrado
        alert('Erro ao salvar sistema: ' + error.message);
    } else {
        closeSiteModal();
        await renderSites(); // Recarrega a lista do Supabase
    }
}

// Adicionar novo site (agora é async)
async function addSite(siteData) {
    const { error } = await sb.from('sites').insert([siteData]);
    return error;
}

// Atualizar site existente (agora é async)
async function updateSite(siteId, siteData) {
    const { error } = await sb.from('sites').update(siteData).eq('id', siteId);
    return error;
}

// Excluir site (agora é async)
async function deleteSite(siteId) {
    if (confirm('Tem certeza que deseja excluir este site?')) {
        const { error } = await sb.from('sites').delete().eq('id', siteId);
        
        if (error) {
            alert('Erro ao excluir site: ' + error.message);
        } else {
            await renderSites(); 
        }
    }
}