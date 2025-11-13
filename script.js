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

// NOVOS Elementos DOM (Modal Financeiro)
const financeModal = document.getElementById('finance-modal');
const financeModalTitle = document.getElementById('finance-modal-title');
const closeFinanceModalBtn = document.getElementById('close-finance-modal');
const generatePaymentBtn = document.getElementById('generate-payment-btn');
const paymentList = document.getElementById('payment-list');

// Variáveis de estado
let editingSiteId = null;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    renderSites(); 
    setupEventListeners();
});

// Configurar event listeners
function setupEventListeners() {
    // Modal de Adicionar/Editar Site
    addSiteBtn.addEventListener('click', openAddModal);
    closeModalBtn.addEventListener('click', closeSiteModal);
    cancelBtn.addEventListener('click', closeSiteModal);
    siteForm.addEventListener('submit', handleFormSubmit);
    siteModal.addEventListener('click', function(e) {
        if (e.target === siteModal) {
            closeSiteModal();
        }
    });

    // NOVO: Listeners do Modal Financeiro
    closeFinanceModalBtn.addEventListener('click', closeFinanceModal);
    financeModal.addEventListener('click', function(e) {
        if (e.target === financeModal) {
            closeFinanceModal();
        }
    });

    // Listener para o botão de gerar mensalidade
    generatePaymentBtn.addEventListener('click', handleGeneratePayment);

    // NOVO: Event Delegation para a lista de pagamentos
    // Ouve cliques na lista, mas só age se clicar num botão "Marcar como Pago"
    paymentList.addEventListener('click', async function(e) {
        if (e.target && e.target.classList.contains('mark-paid-btn')) {
            const paymentId = e.target.dataset.paymentId;
            const siteIdToReload = e.target.dataset.siteId;
            e.target.disabled = true; // Desativa o botão para evitar clique duplo
            e.target.textContent = "Pagando...";
            await markAsPaid(paymentId, siteIdToReload);
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
    // Carregar dados do Supabase
    const { data, error } = await sb.from('sites').select('*').order('created_at', { ascending: false });
    
    if (error) {
        console.error('Erro ao carregar sites:', error);
        sitesContainer.innerHTML = `<div class="empty-state"><h3>Erro ao carregar dados.</h3><p>${error.message}</p></div>`;
        return;
    }
    
    sites = data; 
    updateStats();

    // Renderizar HTML
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
        
        // ATUALIZADO: Adicionado botão de Finanças
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
                    <p><strong>Mensalidade: R$ ${Number(site.valor_mensalidade || 0).toFixed(2)}</strong></p>
                </div>
                <div class="site-actions">
                    <button class="btn btn-primary visit-site" data-url="${site.url}">Visitar</button>
                    <button class="btn btn-outline edit-site" data-id="${site.id}">Editar</button>
                    <button class="btn btn-danger delete-site" data-id="${site.id}">Excluir</button>
                    
                    <button class="btn btn-success finance-site" 
                            data-id="${site.id}" 
                            data-name="${site.name}"
                            data-default-value="${site.valor_mensalidade || 0}">
                        Finanças
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

    // NOVO: Listener para o botão de finanças
    document.querySelectorAll('.finance-site').forEach(button => {
        button.addEventListener('click', function(e) {
            const { id, name, defaultValue } = e.currentTarget.dataset;
            openFinanceModal(id, name, defaultValue);
        });
    });
}


// Abrir modal para adicionar site
function openAddModal() {
    editingSiteId = null;
    modalTitle.textContent = 'Adicionar Novo Site';
    siteForm.reset(); // Limpa todos os campos do formulário
    siteModal.classList.add('active');
    document.getElementById('site-value').value = ''; // Garante que o novo campo também é limpo
}

// Abrir modal para editar site
function openEditModal(siteId) {
    const site = sites.find(s => s.id === siteId);
    if (!site) return;
    
    editingSiteId = siteId;
    modalTitle.textContent = 'Editar Site';
    
    document.getElementById('site-name').value = site.name;
    document.getElementById('site-url').value = site.url;
    document.getElementById('supabase-url').value = site.supabaseurl || ''; 
    document.getElementById('supabase-key').value = '';
    document.getElementById('site-description').value = site.description || '';
    
    // ATUALIZADO: Preenche o valor da mensalidade
    document.getElementById('site-value').value = site.valor_mensalidade || '0.00';
    
    siteModal.classList.add('active');
}

// Fechar modal de Adicionar/Editar
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
    
    // ATUALIZADO: Adiciona 'valor_mensalidade'
    const formData = {
        name: document.getElementById('site-name').value,
        url: document.getElementById('site-url').value,
        supabaseurl: document.getElementById('supabase-url').value, 
        description: document.getElementById('site-description').value,
        status: 'online',
        valor_mensalidade: document.getElementById('site-value').value
    };
    
    let error;
    
    if (editingSiteId) {
        error = await updateSite(editingSiteId, formData);
    } else {
        error = await addSite(formData);
    }
    
    setLoading(false);
    
    if (error) {
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
        // Primeiro, apaga os pagamentos associados (Opcional, se o 'ON DELETE CASCADE' falhar)
        // await sb.from('mensalidades').delete().eq('site_id', siteId);

        // Apaga o site
        const { error } = await sb.from('sites').delete().eq('id', siteId);
        
        if (error) {
            alert('Erro ao excluir site: ' + error.message);
        } else {
            await renderSites(); // Recarrega a lista
        }
    }
}


// --- NOVAS FUNÇÕES FINANCEIRAS ---

// Abrir o modal financeiro
function openFinanceModal(siteId, siteName, defaultValue) {
    financeModalTitle.textContent = `Finanças de: ${siteName}`;
    
    // Armazena o ID e o Valor no próprio botão "Gerar" para fácil acesso
    generatePaymentBtn.dataset.siteId = siteId;
    generatePaymentBtn.dataset.defaultValue = defaultValue;
    
    renderPayments(siteId); // Carrega a lista de pagamentos
    financeModal.classList.add('active');
}

// Fechar o modal financeiro
function closeFinanceModal() {
    financeModal.classList.remove('active');
    paymentList.innerHTML = '<li>Carregando...</li>'; // Limpa a lista ao fechar
}

// Renderizar a lista de pagamentos
async function renderPayments(siteId) {
    paymentList.innerHTML = '<li>Carregando histórico...</li>';

    // Busca na tabela 'mensalidades'
    const { data, error } = await sb.from('mensalidades')
        .select('*')
        .eq('site_id', siteId)
        .order('mes_referencia', { ascending: false }); // Mais recentes primeiro

    if (error) {
        paymentList.innerHTML = '<li>Erro ao carregar pagamentos.</li>';
        console.error(error);
        return;
    }

    if (data.length === 0) {
        paymentList.innerHTML = '<li>Nenhum pagamento registrado.</li>';
        return;
    }

    paymentList.innerHTML = ''; // Limpa a lista
    
    data.forEach(payment => {
        const li = document.createElement('li');
        
        // Formata a data de referência para Mês/Ano (ex: Nov/2025)
        const date = new Date(payment.mes_referencia + 'T12:00:00'); // Adiciona T12 para evitar bugs de fuso
        const mesRefFormatado = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });

        const valorFormatado = Number(payment.valor).toFixed(2);
        
        let statusHtml = '';
        let actionButtonHtml = '';

        if (payment.status === 'Pago') {
            statusHtml = `<span class="payment-status status-paid">Pago</span>`;
            // Opcional: Adicionar data do pagamento
            // statusHtml += `<span class="payment-info">em ${new Date(payment.data_pagamento).toLocaleDateString('pt-BR')}</span>`;
        } else {
            statusHtml = `<span class="payment-status status-pending">Pendente</span>`;
            actionButtonHtml = `<button class="btn btn-success mark-paid-btn" data-payment-id="${payment.id}" data-site-id="${siteId}">Marcar como Pago</button>`;
        }

        li.innerHTML = `
            <div class="payment-info">
                <strong>${mesRefFormatado.charAt(0).toUpperCase() + mesRefFormatado.slice(1)}</strong>
                <span>R$ ${valorFormatado}</span>
            </div>
            <div class="payment-actions" style="display: flex; gap: 1rem; align-items: center;">
                ${statusHtml}
                ${actionButtonHtml}
            </div>
        `;
        paymentList.appendChild(li);
    });
}

// Marcar uma mensalidade como PAGA
async function markAsPaid(paymentId, siteIdToReload) {
    const { error } = await sb.from('mensalidades')
        .update({ 
            status: 'Pago',
            data_pagamento: new Date() // Define a data do pagamento
        })
        .eq('id', paymentId);
    
    if (error) {
        alert('Erro ao marcar como pago: ' + error.message);
    }
    
    // Recarrega a lista de pagamentos do modal
    await renderPayments(siteIdToReload);
}

// Gerar uma nova mensalidade para o mês atual
async function handleGeneratePayment() {
    const siteId = generatePaymentBtn.dataset.siteId;
    const defaultValue = generatePaymentBtn.dataset.defaultValue;

    if (!siteId || defaultValue === undefined) {
        alert('Erro: ID do site ou valor padrão não encontrado.');
        return;
    }

    // Formata a data para 'YYYY-MM-01' (o primeiro dia do mês atual)
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const mesReferencia = `${year}-${month}-01`;

    // Confirmação
    if (!confirm(`Gerar mensalidade de R$${defaultValue} para o mês ${month}/${year}?`)) {
        return;
    }

    // Desativa o botão
    generatePaymentBtn.disabled = true;
    generatePaymentBtn.textContent = "Gerando...";

    // Insere na tabela 'mensalidades'
    const { error } = await sb.from('mensalidades').insert([
        {
            site_id: siteId,
            valor: defaultValue,
            mes_referencia: mesReferencia,
            status: 'Pendente'
        }
    ]);

    if (error) {
        if (error.code === '23505') { // Erro de "unique constraint"
            alert('Erro: A mensalidade para este mês já foi gerada.');
        } else {
            alert('Erro ao gerar mensalidade: ' + error.message);
        }
    }

    // Reativa o botão e recarrega a lista
    generatePaymentBtn.disabled = false;
    generatePaymentBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H4zm0 1h8a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z"/>
            <path d="M4.5 3.5a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0v-1a.5.5 0 0 1 .5-.5zm0 3a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0v-1a.5.5 0 0 1 .5-.5zm0 3a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0v-1a.5.5 0 0 1 .5-.5zm3-6a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0v-1a.5.5 0 0 1 .5-.5zm0 3a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0v-1a.5.5 0 0 1 .5-.5zm0 3a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0v-1a.5.5 0 0 1 .5-.5zm3-6a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0v-1a.5.5 0 0 1 .5-.5zm0 3a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0v-1a.5.5 0 0 1 .5-.5zm0 3a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0v-1a.5.5 0 0 1 .5-.5z"/>
        </svg>
        Gerar Mensalidade (Mês Atual)
    `;
    await renderPayments(siteId);
}