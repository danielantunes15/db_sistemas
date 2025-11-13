// js/script.js
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let sites = [];
let currentUser = null;

// === Elementos DOM ===

// Elementos originais
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

// Novos Elementos (Financeiro)
const financeModal = document.getElementById('finance-modal');
const closeFinanceModalBtn = document.getElementById('close-finance-modal');
const paymentListEl = document.getElementById('payment-list-content');
const financeSiteNameEl = document.getElementById('finance-site-name');

// Novos Elementos (Chamados)
const openChamadosBtn = document.getElementById('open-chamados-btn');
const closeChamadosBtn = document.getElementById('close-chamados-modal');
const chamadosModal = document.getElementById('chamados-modal');
const novoChamadoBtn = document.getElementById('novo-chamado-btn');
const cancelChamadoBtn = document.getElementById('cancel-chamado-btn');
const chamadoForm = document.getElementById('chamado-form');
const chamadosListContainer = document.getElementById('chamados-list-container');
const chamadoSiteSelect = document.getElementById('chamado-site');


let editingSiteId = null;

// === INICIALIZAÇÃO ===

document.addEventListener('DOMContentLoaded', function() {
    checkUserSession();
});

// === AUTENTICAÇÃO E SESSÃO ===

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
    
    // Funções principais
    await renderSites(); // Espera carregar os sites antes de setar os listeners
    setupEventListeners();
}

function setupEventListeners() {
    // Listeners originais
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

    // === Novos Listeners ===

    // Financeiro
    closeFinanceModalBtn.addEventListener('click', closeFinanceModal);
    financeModal.addEventListener('click', function(e) {
        if (e.target === financeModal) closeFinanceModal();
    });

    // Chamados
    openChamadosBtn.addEventListener('click', openChamadosModal);
    closeChamadosBtn.addEventListener('click', closeChamadosModal);
    chamadosModal.addEventListener('click', function(e) {
        if (e.target === chamadosModal) closeChamadosModal();
    });

    novoChamadoBtn.addEventListener('click', () => {
        chamadoForm.style.display = 'block';
        chamadoForm.reset();
        loadUserSitesForSelect(); // Carrega sites no select
    });

    cancelChamadoBtn.addEventListener('click', () => {
        chamadoForm.style.display = 'none';
    });

    chamadoForm.addEventListener('submit', handleChamadoSubmit);
}

// === SITES (CRUD E RENDER) ===

function updateStats() {
    const total = sites.length;
    // Simulação de status (já que o original não detalhava a verificação)
    const online = sites.filter(s => s.status === 'online').length; 
    const offline = sites.filter(s => s.status !== 'online').length; 
    
    totalSystemsEl.textContent = total;
    onlineSystemsEl.textContent = online; // Ajuste conforme sua lógica de status
    offlineSystemsEl.textContent = offline; // Ajuste conforme sua lógica de status
}

async function renderSites() {
    // RLS garante que só vem os sites do usuário
    const { data, error } = await sb.from('sites').select('*').order('created_at', { ascending: false });
    
    if (error) {
        console.error('Erro ao buscar sites:', error);
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
        // Status Padrão (você deve ter uma Edge Function atualizando isso)
        const statusText = site.status === 'online' ? 'Online' : (site.status === 'offline' ? 'Offline' : 'Verificando...');
        const statusClass = site.status === 'online' ? '' : 'offline';

        siteCard.innerHTML = `
            <div class="site-header">
                <div class="site-name">${site.name}</div>
                <div class="site-status">
                    <div class="status-dot ${statusClass}"></div>
                    <span>${statusText}</span>
                </div>
            </div>
            <div class="site-body">
                <div class="site-info">
                    <p><strong>URL:</strong> <a href="${site.url}" target="_blank">${site.url}</a></p>
                    ${site.description ? `<p>${site.description}</p>` : ''}
                </div>
                <div class="site-actions">
                    <button class="btn btn-primary visit-site" data-url="${site.url}">Visitar</button>
                    <button class="btn btn-outline edit-site" data-id="${site.id}">Editar</button>
                    <button class="btn btn-success finance-site" data-id="${site.id}">Financeiro</button>
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
    // NOVO LISTENER
    document.querySelectorAll('.finance-site').forEach(btn => {
        btn.addEventListener('click', function() { openFinanceModal(this.getAttribute('data-id')); });
    });
}

// Modal de Adicionar/Editar Site
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

// Submit do formulário de Site
async function handleFormSubmit(e) {
    e.preventDefault();
    const btn = siteForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    
    const formData = {
        name: document.getElementById('site-name').value,
        url: document.getElementById('site-url').value,
        description: document.getElementById('site-description').value,
        // user_id é adicionado automaticamente pelo RLS ou pela Edge Function
    };
    
    let error;
    if (editingSiteId) {
        // Atualizar site
        error = (await sb.from('sites').update(formData).eq('id', editingSiteId)).error;
    } else {
        // Adicionar novo site (status 'unknown' é uma boa prática)
        formData.status = 'unknown'; 
        error = (await sb.from('sites').insert([formData])).error;
    }
    
    btn.disabled = false;
    if (error) {
        alert('Erro: ' + error.message);
    } else {
        closeSiteModal();
        await renderSites(); // Recarrega os sites
    }
}

// CRUD de Site
async function deleteSite(siteId) {
    if (confirm('Tem certeza que deseja excluir este sistema?')) {
        const { error } = await sb.from('sites').delete().eq('id', siteId);
        if (error) {
            alert('Erro ao excluir: ' + error.message);
        } else {
            await renderSites(); // Recarrega os sites
        }
    }
}


// === MÓDULO FINANCEIRO ===

function closeFinanceModal() {
    financeModal.classList.remove('active');
}

async function openFinanceModal(siteId) {
    const site = sites.find(s => s.id === siteId);
    if (!site) return;

    financeSiteNameEl.textContent = site.name;
    paymentListEl.innerHTML = '<li>Carregando faturas...</li>';
    financeModal.classList.add('active');

    // Buscar as faturas no Supabase
    const { data: faturas, error } = await sb.from('faturas')
        .select('*')
        .eq('site_id', siteId)
        .order('data_vencimento', { ascending: false });

    if (error) {
        paymentListEl.innerHTML = '<li>Erro ao buscar faturas.</li>';
        console.error('Erro financeiro:', error);
        return;
    }

    if (faturas.length === 0) {
        paymentListEl.innerHTML = '<li>Nenhuma fatura encontrada para este sistema.</li>';
        return;
    }

    // Renderiza a lista de faturas
    paymentListEl.innerHTML = '';
    faturas.forEach(fatura => {
        let statusText = fatura.status_pagamento;
        let statusClass = 'status-pending'; // Padrão

        const dataVencimento = new Date(fatura.data_vencimento + 'T00:00:00'); // Garante data local
        const hoje = new Date();
        hoje.setHours(0,0,0,0); // Zera a hora para comparação

        if (fatura.status_pagamento === 'pago') {
            statusText = 'Pago';
            statusClass = 'status-paid';
        } else if (dataVencimento < hoje) {
            statusText = 'Atrasado';
            statusClass = 'status-pending'; // Pode usar a mesma classe ou criar uma 'status-overdue'
        } else {
            statusText = 'Pendente';
        }

        paymentListEl.innerHTML += `
            <li>
                <div class="payment-info">
                    <strong>${fatura.descricao} (R$ ${fatura.valor})</strong>
                    <span>Vencimento: ${dataVencimento.toLocaleDateString('pt-BR')}</span>
                </div>
                <span class="payment-status ${statusClass}">${statusText}</span>
            </li>
        `;
    });
}


// === MÓDULO DE CHAMADOS ===

function openChamadosModal() {
    chamadosModal.classList.add('active');
    loadUserChamados();
    // O select é carregado só ao clicar em "novo chamado"
}

function closeChamadosModal() {
    chamadosModal.classList.remove('active');
    chamadoForm.style.display = 'none'; // Esconde o form ao fechar
}

// Carrega os sites do usuário no <select> do formulário
function loadUserSitesForSelect() {
    chamadoSiteSelect.innerHTML = '<option value="">Nenhum (Geral)</option>'; // Reseta
    if (sites.length > 0) {
        sites.forEach(site => {
            chamadoSiteSelect.innerHTML += `<option value="${site.id}">${site.name}</option>`;
        });
    }
}

// Carrega a lista de chamados existentes do usuário
async function loadUserChamados() {
    chamadosListContainer.innerHTML = '<p>Carregando chamados...</p>';

    const { data: chamados, error } = await sb.from('chamados')
        .select(`
            *,
            sites ( name ) 
        `) // Puxa o nome do site junto (se houver)
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

    if (error) {
        chamadosListContainer.innerHTML = '<p>Erro ao buscar chamados.</p>';
        console.error('Erro chamados:', error);
        return;
    }

    if (chamados.length === 0) {
        chamadosListContainer.innerHTML = '<p>Nenhum chamado aberto encontrado.</p>';
        return;
    }

    chamadosListContainer.innerHTML = '';
    chamados.forEach(chamado => {
        const siteName = chamado.sites ? chamado.sites.name : 'Geral';
        chamadosListContainer.innerHTML += `
            <div class="chamado-card">
                <strong>${chamado.titulo}</strong> (Status: ${chamado.status})
                <p>Sistema: ${siteName}</p>
                <p>${chamado.descricao}</p>
                <small>Aberto em: ${new Date(chamado.created_at).toLocaleString('pt-BR')}</small>
            </div>
        `;
    });
}

// Submit do formulário de novo chamado
async function handleChamadoSubmit(e) {
    e.preventDefault();
    const btn = chamadoForm.querySelector('button[type="submit"]');
    btn.disabled = true;

    const novoChamado = {
        user_id: currentUser.id,
        site_id: document.getElementById('chamado-site').value || null,
        titulo: document.getElementById('chamado-titulo').value,
        descricao: document.getElementById('chamado-descricao').value,
        status: 'aberto'
    };

    const { error } = await sb.from('chamados').insert([novoChamado]);

    btn.disabled = false;

    if (error) {
        alert('Erro ao abrir chamado: ' + error.message);
    } else {
        alert('Chamado aberto com sucesso!');
        chamadoForm.style.display = 'none'; // Esconde o form
        chamadoForm.reset();
        loadUserChamados(); // Atualiza a lista
    }
}