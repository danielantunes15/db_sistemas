// js/script.js
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let sites = [];
let empresas = [];
let currentUser = null;
let userType = 'empresa';

// === Elementos DOM ===
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
const userTypeBadge = document.getElementById('user-type-badge');

// Elementos de estatísticas
const totalSystemsEl = document.getElementById('total-systems');
const onlineSystemsEl = document.getElementById('online-systems');
const offlineSystemsEl = document.getElementById('offline-systems');

// Elementos de texto dinâmico
const mainTitle = document.getElementById('main-title');
const mainSubtitle = document.getElementById('main-subtitle');
const sectionTitle = document.getElementById('section-title');
const addSiteText = document.getElementById('add-site-text');
const statSystemsText = document.getElementById('stat-systems-text');
const statOnlineText = document.getElementById('stat-online-text');
const statOfflineText = document.getElementById('stat-offline-text');

// Modais
const financeModal = document.getElementById('finance-modal');
const closeFinanceModalBtn = document.getElementById('close-finance-modal');
const paymentListEl = document.getElementById('payment-list-content');
const financeSiteNameEl = document.getElementById('finance-site-name');

const openChamadosBtn = document.getElementById('open-chamados-btn');
const closeChamadosBtn = document.getElementById('close-chamados-modal');
const chamadosModal = document.getElementById('chamados-modal');
const novoChamadoBtn = document.getElementById('novo-chamado-btn');
const cancelChamadoBtn = document.getElementById('cancel-chamado-btn');
const chamadoForm = document.getElementById('chamado-form');
const chamadosListContainer = document.getElementById('chamados-list-container');
const chamadoSiteSelect = document.getElementById('chamado-site');

// Novos elementos para admin
const empresasModal = document.getElementById('empresas-modal');
const closeEmpresasModalBtn = document.getElementById('close-empresas-modal');
const novaEmpresaBtn = document.getElementById('nova-empresa-btn');
const empresaForm = document.getElementById('empresa-form');
const cancelEmpresaBtn = document.getElementById('cancel-empresa-btn');
const empresasListContainer = document.getElementById('empresas-list-container');

let editingSiteId = null;
let editingEmpresaId = null;

// === INICIALIZAÇÃO ===
document.addEventListener('DOMContentLoaded', function() {
    checkUserSession();
});

// === AUTENTICAÇÃO E SESSÃO ===
async function checkUserSession() {
    const { data: { session } } = await sb.auth.getSession();
    
    if (!session) {
        window.location.href = 'login.html';
        return;
    }
    
    currentUser = session.user;
    userType = sessionStorage.getItem('userType') || currentUser.user_metadata?.tipo_usuario || 'empresa';
    
    updateUIForUserType();
    
    if (userEmailEl) userEmailEl.textContent = currentUser.email;
    if (userAvatarEl) userAvatarEl.textContent = currentUser.email.substring(0, 2).toUpperCase();
    if (userTypeBadge) {
        userTypeBadge.textContent = userType === 'admin' ? 'Administrador' : 'Empresa';
        userTypeBadge.className = `user-type-badge ${userType}`;
    }
    
    await renderContentBasedOnUserType();
    setupEventListeners();
}

function updateUIForUserType() {
    if (userType === 'admin') {
        if (mainTitle) mainTitle.textContent = 'Painel de Administração';
        if (mainSubtitle) mainSubtitle.textContent = 'Gerencie todas as empresas e sistemas';
        if (sectionTitle) sectionTitle.textContent = 'Todas as Empresas';
        if (addSiteText) addSiteText.textContent = 'Nova Empresa';
        if (statSystemsText) statSystemsText.textContent = 'Empresas Totais';
        if (statOnlineText) statOnlineText.textContent = 'Empresas Ativas';
        if (statOfflineText) statOfflineText.textContent = 'Empresas Inativas';
        
        showAdminMenu();
    } else {
        if (mainTitle) mainTitle.textContent = 'Painel da Empresa';
        if (mainSubtitle) mainSubtitle.textContent = 'Gerencie todos os seus sistemas em um único lugar';
        if (sectionTitle) sectionTitle.textContent = 'Meus Sistemas';
        if (addSiteText) addSiteText.textContent = 'Novo Sistema';
        if (statSystemsText) statSystemsText.textContent = 'Sistemas Totais';
        if (statOnlineText) statOnlineText.textContent = 'Sistemas Online';
        if (statOfflineText) statOfflineText.textContent = 'Sistemas Offline';
        
        hideAdminMenu();
    }
}

function showAdminMenu() {
    const nav = document.querySelector('nav ul');
    if (nav && !document.getElementById('admin-empresas')) {
        const configItem = document.querySelector('nav ul li:last-child');
        if (configItem) {
            configItem.insertAdjacentHTML('beforebegin', `
                <li><a href="#" class="nav-link" id="admin-empresas">Gerenciar Empresas</a></li>
                <li><a href="#" class="nav-link" id="admin-relatorios">Relatórios Gerais</a></li>
            `);
        }
    }
}

function hideAdminMenu() {
    const adminEmpresas = document.getElementById('admin-empresas');
    const adminRelatorios = document.getElementById('admin-relatorios');
    if (adminEmpresas) adminEmpresas.remove();
    if (adminRelatorios) adminRelatorios.remove();
}

async function renderContentBasedOnUserType() {
    if (userType === 'admin') {
        await renderAllCompanies();
    } else {
        await renderUserSites();
    }
}

function setupEventListeners() {
    // Listeners originais
    addSiteBtn.addEventListener('click', handleAddButtonClick);
    closeModalBtn.addEventListener('click', closeSiteModal);
    cancelBtn.addEventListener('click', closeSiteModal);
    siteForm.addEventListener('submit', handleFormSubmit);
    
    logoutBtn.addEventListener('click', async () => {
        await sb.auth.signOut();
        sessionStorage.clear();
        window.location.href = 'login.html';
    });
    
    siteModal.addEventListener('click', function(e) {
        if (e.target === siteModal) closeSiteModal();
    });

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
        loadUserSitesForSelect();
    });

    cancelChamadoBtn.addEventListener('click', () => {
        chamadoForm.style.display = 'none';
    });

    chamadoForm.addEventListener('submit', handleChamadoSubmit);

    // Admin - Empresas
    closeEmpresasModalBtn.addEventListener('click', closeEmpresasModal);
    empresasModal.addEventListener('click', function(e) {
        if (e.target === empresasModal) closeEmpresasModal();
    });

    novaEmpresaBtn.addEventListener('click', openNovaEmpresaForm);
    cancelEmpresaBtn.addEventListener('click', closeEmpresaForm);
    empresaForm.addEventListener('submit', handleEmpresaSubmit);

    // Delegation para elementos dinâmicos
    document.addEventListener('click', function(e) {
        // Admin - Gerenciar Empresas
        if (e.target.id === 'admin-empresas') {
            e.preventDefault();
            openEmpresasModal();
        }
        
        // Admin - Ver detalhes da empresa
        if (e.target.classList.contains('view-empresa')) {
            const empresaId = e.target.getAttribute('data-id');
            viewEmpresaDetails(empresaId);
        }
        
        // Admin - Editar empresa
        if (e.target.classList.contains('edit-empresa')) {
            const empresaId = e.target.getAttribute('data-id');
            openEditEmpresaForm(empresaId);
        }
        
        // Admin - Desativar empresa
        if (e.target.classList.contains('delete-empresa')) {
            const empresaId = e.target.getAttribute('data-id');
            toggleEmpresaStatus(empresaId);
        }
    });
}

// === HANDLERS DE BOTÕES ===
function handleAddButtonClick() {
    if (userType === 'admin') {
        openEmpresasModal();
    } else {
        openAddModal();
    }
}

// === FUNÇÕES PARA EMPRESA (Tipo usuário normal) ===
async function renderUserSites() {
    const { data, error } = await sb.from('sites').select('*').order('created_at', { ascending: false });
    
    if (error) {
        console.error('Erro ao buscar sites:', error);
        sitesContainer.innerHTML = '<div class="empty-state"><p>Erro ao carregar sistemas.</p></div>';
        return;
    }
    
    sites = data || [];
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
        btn.addEventListener('click', function() { 
            window.open(this.getAttribute('data-url'), '_blank'); 
        });
    });
    
    document.querySelectorAll('.edit-site').forEach(btn => {
        btn.addEventListener('click', function() { 
            openEditModal(this.getAttribute('data-id')); 
        });
    });
    
    document.querySelectorAll('.delete-site').forEach(btn => {
        btn.addEventListener('click', function() { 
            deleteSite(this.getAttribute('data-id')); 
        });
    });
    
    document.querySelectorAll('.finance-site').forEach(btn => {
        btn.addEventListener('click', function() { 
            openFinanceModal(this.getAttribute('data-id')); 
        });
    });
}

function updateStats() {
    const total = sites.length;
    const online = sites.filter(s => s.status === 'online').length; 
    const offline = sites.filter(s => s.status !== 'online').length; 
    
    if (userType === 'admin') {
        // Stats para admin (empresas)
        const empresasAtivas = empresas.filter(e => e.ativa !== false).length;
        const empresasInativas = empresas.filter(e => e.ativa === false).length;
        
        totalSystemsEl.textContent = empresas.length;
        onlineSystemsEl.textContent = empresasAtivas;
        offlineSystemsEl.textContent = empresasInativas;
    } else {
        // Stats para empresa normal (sites)
        totalSystemsEl.textContent = total;
        onlineSystemsEl.textContent = online;
        offlineSystemsEl.textContent = offline;
    }
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
    };
    
    let error;
    if (editingSiteId) {
        error = (await sb.from('sites').update(formData).eq('id', editingSiteId)).error;
    } else {
        formData.status = 'unknown';
        formData.user_id = currentUser.id;
        error = (await sb.from('sites').insert([formData])).error;
    }
    
    btn.disabled = false;
    if (error) {
        alert('Erro: ' + error.message);
    } else {
        closeSiteModal();
        await renderUserSites();
    }
}

async function deleteSite(siteId) {
    if (confirm('Tem certeza que deseja excluir este sistema?')) {
        const { error } = await sb.from('sites').delete().eq('id', siteId);
        if (error) {
            alert('Erro ao excluir: ' + error.message);
        } else {
            await renderUserSites();
        }
    }
}

// === FUNÇÕES PARA ADMIN ===
async function renderAllCompanies() {
    const { data, error } = await sb.from('empresas')
        .select(`
            *,
            sites(count),
            users:auth.users(count)
        `)
        .order('nome');

    if (error) {
        console.error('Erro ao buscar empresas:', error);
        sitesContainer.innerHTML = '<div class="empty-state"><p>Erro ao carregar empresas.</p></div>';
        return;
    }

    empresas = data || [];

    if (empresas.length === 0) {
        sitesContainer.innerHTML = `
            <div class="empty-state">
                <h3>Nenhuma empresa cadastrada</h3>
                <p>As empresas aparecerão aqui quando se cadastrarem.</p>
            </div>
        `;
        return;
    }

    sitesContainer.innerHTML = '';
    
    empresas.forEach(empresa => {
        const empresaCard = document.createElement('div');
        empresaCard.className = 'site-card';
        const statusClass = empresa.ativa === false ? 'offline' : '';
        const statusText = empresa.ativa === false ? 'Inativa' : 'Ativa';
        
        empresaCard.innerHTML = `
            <div class="site-header">
                <div class="site-name">${empresa.nome}</div>
                <div class="site-status">
                    <div class="status-dot ${statusClass}"></div>
                    <span>${statusText}</span>
                </div>
            </div>
            <div class="site-body">
                <div class="site-info">
                    <p><strong>Email:</strong> ${empresa.email}</p>
                    <p><strong>CNPJ:</strong> ${empresa.cnpj || 'Não informado'}</p>
                    <p><strong>Sistemas:</strong> ${empresa.sites[0]?.count || 0}</p>
                    <p><strong>Usuários:</strong> ${empresa.users[0]?.count || 0}</p>
                    ${empresa.telefone ? `<p><strong>Telefone:</strong> ${empresa.telefone}</p>` : ''}
                </div>
                <div class="site-actions">
                    <button class="btn btn-primary view-empresa" data-id="${empresa.id}">Ver Detalhes</button>
                    <button class="btn btn-outline edit-empresa" data-id="${empresa.id}">Editar</button>
                    <button class="btn ${empresa.ativa === false ? 'btn-success' : 'btn-danger'} delete-empresa" data-id="${empresa.id}">
                        ${empresa.ativa === false ? 'Ativar' : 'Desativar'}
                    </button>
                </div>
            </div>
        `;
        sitesContainer.appendChild(empresaCard);
    });

    updateStats();
}

function openEmpresasModal() {
    empresasModal.classList.add('active');
    loadEmpresasList();
}

function closeEmpresasModal() {
    empresasModal.classList.remove('active');
    empresaForm.style.display = 'none';
}

function openNovaEmpresaForm() {
    editingEmpresaId = null;
    document.getElementById('empresa-form-title').textContent = 'Nova Empresa';
    empresaForm.style.display = 'block';
    empresaForm.reset();
}

function closeEmpresaForm() {
    empresaForm.style.display = 'none';
}

async function loadEmpresasList() {
    empresasListContainer.innerHTML = '<p>Carregando empresas...</p>';

    const { data: empresas, error } = await sb.from('empresas')
        .select('*')
        .order('nome');

    if (error) {
        empresasListContainer.innerHTML = '<p>Erro ao carregar empresas.</p>';
        return;
    }

    if (empresas.length === 0) {
        empresasListContainer.innerHTML = '<p>Nenhuma empresa cadastrada.</p>';
        return;
    }

    empresasListContainer.innerHTML = '';
    empresas.forEach(empresa => {
        const empresaItem = document.createElement('div');
        empresaItem.className = 'chamado-card';
        empresaItem.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                    <strong>${empresa.nome}</strong>
                    <p>${empresa.email} | ${empresa.cnpj || 'Sem CNPJ'}</p>
                    <small>Status: ${empresa.ativa === false ? 'Inativa' : 'Ativa'}</small>
                </div>
                <div>
                    <button class="btn btn-outline edit-empresa-list" data-id="${empresa.id}" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;">Editar</button>
                    <button class="btn ${empresa.ativa === false ? 'btn-success' : 'btn-danger'}" data-id="${empresa.id}" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;">
                        ${empresa.ativa === false ? 'Ativar' : 'Desativar'}
                    </button>
                </div>
            </div>
        `;
        empresasListContainer.appendChild(empresaItem);
    });

    // Adicionar event listeners para os botões da lista
    document.querySelectorAll('.edit-empresa-list').forEach(btn => {
        btn.addEventListener('click', function() {
            openEditEmpresaForm(this.getAttribute('data-id'));
        });
    });

    document.querySelectorAll('.empresas-list-container .btn-danger, .empresas-list-container .btn-success').forEach(btn => {
        btn.addEventListener('click', function() {
            toggleEmpresaStatus(this.getAttribute('data-id'));
        });
    });
}

async function handleEmpresaSubmit(e) {
    e.preventDefault();
    const btn = empresaForm.querySelector('button[type="submit"]');
    btn.disabled = true;

    const formData = {
        nome: document.getElementById('empresa-nome').value,
        email: document.getElementById('empresa-email').value,
        cnpj: document.getElementById('empresa-cnpj').value || null,
        telefone: document.getElementById('empresa-telefone').value || null,
        endereco: document.getElementById('empresa-endereco').value || null,
        ativa: true
    };

    let error;
    if (editingEmpresaId) {
        error = (await sb.from('empresas').update(formData).eq('id', editingEmpresaId)).error;
    } else {
        error = (await sb.from('empresas').insert([formData])).error;
    }

    btn.disabled = false;

    if (error) {
        alert('Erro ao salvar empresa: ' + error.message);
    } else {
        alert('Empresa salva com sucesso!');
        closeEmpresaForm();
        loadEmpresasList();
        await renderAllCompanies(); // Atualiza a lista principal
    }
}

function openEditEmpresaForm(empresaId) {
    const empresa = empresas.find(e => e.id === empresaId);
    if (!empresa) return;

    editingEmpresaId = empresaId;
    document.getElementById('empresa-form-title').textContent = 'Editar Empresa';
    document.getElementById('empresa-nome').value = empresa.nome;
    document.getElementById('empresa-email').value = empresa.email;
    document.getElementById('empresa-cnpj').value = empresa.cnpj || '';
    document.getElementById('empresa-telefone').value = empresa.telefone || '';
    document.getElementById('empresa-endereco').value = empresa.endereco || '';
    empresaForm.style.display = 'block';
}

async function toggleEmpresaStatus(empresaId) {
    const empresa = empresas.find(e => e.id === empresaId);
    if (!empresa) return;

    const novaSituacao = empresa.ativa === false;
    const confirmMessage = novaSituacao 
        ? 'Tem certeza que deseja ativar esta empresa?'
        : 'Tem certeza que deseja desativar esta empresa?';

    if (confirm(confirmMessage)) {
        const { error } = await sb.from('empresas')
            .update({ ativa: novaSituacao })
            .eq('id', empresaId);

        if (error) {
            alert('Erro ao atualizar status: ' + error.message);
        } else {
            await renderAllCompanies();
            if (empresasModal.classList.contains('active')) {
                loadEmpresasList();
            }
        }
    }
}

function viewEmpresaDetails(empresaId) {
    const empresa = empresas.find(e => e.id === empresaId);
    if (!empresa) return;

    alert(`Detalhes da Empresa:\n\nNome: ${empresa.nome}\nEmail: ${empresa.email}\nCNPJ: ${empresa.cnpj || 'Não informado'}\nTelefone: ${empresa.telefone || 'Não informado'}\nStatus: ${empresa.ativa === false ? 'Inativa' : 'Ativa'}`);
}

// === FUNÇÕES COMPARTILHADAS (Financeiro e Chamados) ===

// Financeiro
function closeFinanceModal() {
    financeModal.classList.remove('active');
}

async function openFinanceModal(siteId) {
    const site = sites.find(s => s.id === siteId);
    if (!site) return;

    financeSiteNameEl.textContent = site.name;
    paymentListEl.innerHTML = '<li>Carregando faturas...</li>';
    financeModal.classList.add('active');

    const { data: faturas, error } = await sb.from('faturas')
        .select('*')
        .eq('site_id', siteId)
        .order('data_vencimento', { ascending: false });

    if (error) {
        paymentListEl.innerHTML = '<li>Erro ao buscar faturas.</li>';
        console.error('Erro financeiro:', error);
        return;
    }

    if (!faturas || faturas.length === 0) {
        paymentListEl.innerHTML = '<li>Nenhuma fatura encontrada para este sistema.</li>';
        return;
    }

    paymentListEl.innerHTML = '';
    faturas.forEach(fatura => {
        let statusText = fatura.status_pagamento;
        let statusClass = 'status-pending';

        const dataVencimento = new Date(fatura.data_vencimento + 'T00:00:00');
        const hoje = new Date();
        hoje.setHours(0,0,0,0);

        if (fatura.status_pagamento === 'pago') {
            statusText = 'Pago';
            statusClass = 'status-paid';
        } else if (dataVencimento < hoje) {
            statusText = 'Atrasado';
            statusClass = 'status-pending';
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

// Chamados
function openChamadosModal() {
    chamadosModal.classList.add('active');
    loadUserChamados();
}

function closeChamadosModal() {
    chamadosModal.classList.remove('active');
    chamadoForm.style.display = 'none';
}

function loadUserSitesForSelect() {
    chamadoSiteSelect.innerHTML = '<option value="">Nenhum (Geral)</option>';
    if (sites.length > 0) {
        sites.forEach(site => {
            chamadoSiteSelect.innerHTML += `<option value="${site.id}">${site.name}</option>`;
        });
    }
}

async function loadUserChamados() {
    chamadosListContainer.innerHTML = '<p>Carregando chamados...</p>';

    const { data: chamados, error } = await sb.from('chamados')
        .select(`
            *,
            sites ( name ) 
        `)
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

    if (error) {
        chamadosListContainer.innerHTML = '<p>Erro ao buscar chamados.</p>';
        console.error('Erro chamados:', error);
        return;
    }

    if (!chamados || chamados.length === 0) {
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
        chamadoForm.style.display = 'none';
        chamadoForm.reset();
        loadUserChamados();
    }
}