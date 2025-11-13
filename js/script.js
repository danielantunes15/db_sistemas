// js/script.js
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let sites = [];
let currentUser = null;

// Elementos DOM
const sitesContainer = document.getElementById('sites-container');
const addSiteBtn = document.getElementById('add-site-btn');
const siteModal = document.getElementById('site-modal');
const closeModalBtn = document.getElementById('close-modal');
const cancelBtn = document.getElementById('cancel-btn');
const siteForm = document.getElementById('site-form');
const modalTitle = document.getElementById('modal-title');
const logoutBtn = document.getElementById('logout-btn');
const userEmailEl = document.getElementById('user-email');
const userAvatarEl = document.getElementById('user-avatar');

const totalSystemsEl = document.getElementById('total-systems');
const onlineSystemsEl = document.getElementById('online-systems');
const offlineSystemsEl = document.getElementById('offline-systems');

let editingSiteId = null;

document.addEventListener('DOMContentLoaded', function() {
    checkUserSession();
});

// VERIFICAÇÃO DE SEGURANÇA
async function checkUserSession() {
    const { data: { session } } = await sb.auth.getSession();
    
    if (!session) {
        // Redireciona se não estiver logado
        window.location.href = 'login.html';
        return;
    }
    
    currentUser = session.user;
    
    if (userEmailEl) userEmailEl.textContent = currentUser.email;
    if (userAvatarEl) userAvatarEl.textContent = currentUser.email.substring(0, 2).toUpperCase();
    
    renderSites(); 
    setupEventListeners();
}

function setupEventListeners() {
    addSiteBtn.addEventListener('click', openAddModal);
    closeModalBtn.addEventListener('click', closeSiteModal);
    cancelBtn.addEventListener('click', closeSiteModal);
    siteForm.addEventListener('submit', handleFormSubmit);
    
    logoutBtn.addEventListener('click', async () => {
        await sb.auth.signOut();
        window.location.href = 'login.html';
    });
    
    siteModal.addEventListener('click', function(e) {
        if (e.target === siteModal) closeSiteModal();
    });
}

function updateStats() {
    const total = sites.length;
    const online = sites.filter(s => s.status === 'online').length;
    const offline = total - online;
    
    totalSystemsEl.textContent = total;
    onlineSystemsEl.textContent = online;
    offlineSystemsEl.textContent = offline;
}

async function renderSites() {
    // RLS garante que só vem os sites do usuário
    const { data, error } = await sb.from('sites').select('*').order('created_at', { ascending: false });
    
    if (error) {
        console.error('Erro:', error);
        return;
    }
    
    sites = data; 
    updateStats();

    if (sites.length === 0) {
        sitesContainer.innerHTML = `
            <div class="empty-state">
                <h3>Nenhum site cadastrado</h3>
                <p>Adicione seu primeiro sistema.</p>
            </div>
        `;
        return;
    }

    sitesContainer.innerHTML = '';
    
    sites.forEach(site => {
        const siteCard = document.createElement('div');
        siteCard.className = 'site-card';
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
                    <p><strong>URL:</strong> ${site.url}</p>
                    ${site.description ? `<p>${site.description}</p>` : ''}
                </div>
                <div class="site-actions">
                    <button class="btn btn-primary visit-site" data-url="${site.url}">Visitar</button>
                    <button class="btn btn-outline edit-site" data-id="${site.id}">Editar</button>
                    <button class="btn btn-danger delete-site" data-id="${site.id}">Excluir</button>
                </div>
            </div>
        `;
        sitesContainer.appendChild(siteCard);
    });
    
    setupCardEventListeners();
}

function setupCardEventListeners() {
    document.querySelectorAll('.visit-site').forEach(btn => {
        btn.addEventListener('click', function() { window.open(this.getAttribute('data-url'), '_blank'); });
    });
    document.querySelectorAll('.edit-site').forEach(btn => {
        btn.addEventListener('click', function() { openEditModal(this.getAttribute('data-id')); });
    });
    document.querySelectorAll('.delete-site').forEach(btn => {
        btn.addEventListener('click', function() { deleteSite(this.getAttribute('data-id')); });
    });
}

function openAddModal() {
    editingSiteId = null;
    modalTitle.textContent = 'Adicionar Novo Sistema';
    siteForm.reset();
    siteModal.classList.add('active');
}

function openEditModal(siteId) {
    const site = sites.find(s => s.id === siteId);
    if (!site) return;
    editingSiteId = siteId;
    modalTitle.textContent = 'Editar Site';
    document.getElementById('site-name').value = site.name;
    document.getElementById('site-url').value = site.url;
    document.getElementById('site-description').value = site.description || '';
    siteModal.classList.add('active');
}

function closeSiteModal() {
    siteModal.classList.remove('active');
}

async function handleFormSubmit(e) {
    e.preventDefault();
    const btn = siteForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    
    const formData = {
        name: document.getElementById('site-name').value,
        url: document.getElementById('site-url').value,
        description: document.getElementById('site-description').value,
        status: 'unknown'
    };
    
    let error;
    if (editingSiteId) {
        delete formData.status;
        error = await updateSite(editingSiteId, formData);
    } else {
        error = await addSite(formData);
    }
    
    btn.disabled = false;
    if (error) alert('Erro: ' + error.message);
    else {
        closeSiteModal();
        await renderSites();
    }
}

async function addSite(siteData) {
    const { error } = await sb.from('sites').insert([siteData]);
    return error;
}

async function updateSite(siteId, siteData) {
    const { error } = await sb.from('sites').update(siteData).eq('id', siteId);
    return error;
}

async function deleteSite(siteId) {
    if (confirm('Excluir este site?')) {
        const { error } = await sb.from('sites').delete().eq('id', siteId);
        if (!error) await renderSites();
    }
}