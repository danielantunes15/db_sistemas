// Dados em memória (simulando banco de dados)
let registros = JSON.parse(localStorage.getItem('registros_portaria')) || [];
let manobras = JSON.parse(localStorage.getItem('manobras_portaria')) || [];
let agendamentos = JSON.parse(localStorage.getItem('agendamentos_portaria')) || [];
let frota = JSON.parse(localStorage.getItem('frota_portaria')) || [];
// (LINHA ALTERADA) Adicionamos setores padrão, incluindo Estacionamento
let setores = JSON.parse(localStorage.getItem('setores_portaria')) || [ { "id": 1, "nome": "Administrativo" }, { "id": 2, "nome": "Indústria" }, { "id": 3, "nome": "Agrícola" }, { "id": 4, "nome": "Manutenção" }, { "id": 5, "nome": "Estacionamento" } ];
let empresas = JSON.parse(localStorage.getItem('empresas_portaria')) || [];

// (NOVO) =================================
// (NOVO) LOCAIS CONHECIDOS (GLOBAL)
// (NOVO) =================================
// Mapeamento global de locais para coordenadas
const KNOWN_LOCATIONS = {
    // Usina (Ponto 0)
    'USINA': [-17.645425, -40.181674],
    'PORTARIA': [-17.645425, -40.181674],
    
    // Cidades Externas
    'IBIRAPUA-BA': [-17.6877, -40.1088],
    'NANUQUE-MG': [-17.8388, -40.3538],
    // Adicione outras cidades conforme necessário
    // 'TEIXEIRA DE FREITAS-BA': [-17.534, -39.721], 
    
    // Locais Internos (Sincronizado com 'setores' e 'manobras-page')
    'ESTACIONAMENTO': [-17.643734, -40.181406],
    'ADMINISTRATIVO': [-17.6435, -40.1818],
    'INDUSTRIA': [-17.6440, -40.1825],
    'AGRICOLA': [-17.6450, -40.1808],
    'MANUTENCAO': [-17.6430, -40.1810],
    'PATIO DE MAQUINAS': [-17.6448, -40.1820], 
    'AREA DE CARGA': [-17.6442, -40.1822], 
    'ZONA DE DESCARGA': [-17.6445, -40.1824],
    'PATIO PRINCIPAL': [-17.6440, -40.1815],
    
    // Padrão (se não for encontrado, simula no Pátio de Máquinas)
    'DEFAULT': [-17.6448, -40.1820]
};


// Controle de navegação entre páginas
function showPage(pageId, event) {
    
    // (LINHA ALTERADA) Para a simulação se sairmos do monitor
    if (pageId !== 'monitor' && typeof stopOperationsSimulation === 'function') {
        stopOperationsSimulation();
    }

    // Esconde todas as páginas
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Remove classe active de todos os links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Mostra a página selecionada
    const pageToShow = document.getElementById(`${pageId}-page`);
    if (pageToShow) {
        pageToShow.classList.add('active');
    }
    
    // Ativa o link correspondente (se o evento foi passado)
    if (event && event.target) {
         // Encontra o link pai (a) se o clique foi no ícone (span)
        const navLink = event.target.closest('.nav-link');
        if (navLink) {
            navLink.classList.add('active');
        }
    }
    
    // Atualiza dados específicos da página
    if (pageId === 'dashboard') {
        atualizarDashboard();
        atualizarTurno();
    } else if (pageId === 'monitor') { // (BLOCO ALTERADO)
        if (typeof initMap === 'function') {
            initMap(); // Inicializa o mapa (só roda uma vez, se necessário)
            atualizarMonitor(); // Atualiza os marcadores
            
            // (LINHA ALTERADA) Inicia a simulação de operações
            if (typeof startOperationsSimulation === 'function') {
                startOperationsSimulation();
            }
        }
    } else if (pageId === 'manobras') {
        carregarManobras();
        carregarOpcoesLocais(); // (NOVO) Carrega datalist de locais
    } else if (pageId === 'registro') {
        atualizarDatalistEmpresas();
        carregarOpcoesSetores(); // Função de registro.js
    } else if (pageId === 'agendamentos') {
        carregarAgendamentos(); // Função de agendamentos.js
    } else if (pageId === 'consultas') {
        // A página de consultas é reativa aos filtros
    } else if (pageId === 'admin') {
        carregarAdmin(); // Função de admin.js
    }
}

// Atualizar informação do turno atual
function atualizarTurno() {
    const hora = new Date().getHours();
    const turnoA = document.getElementById('turno-a');
    const turnoB = document.getElementById('turno-b');
    const turnoC = document.getElementById('turno-c');
    
    // Proteção caso os elementos não existam na página atual
    if (!turnoA || !turnoB || !turnoC) return;
    
    // Remove classe active de todos os turnos
    [turnoA, turnoB, turnoC].forEach(turno => {
        turno.classList.remove('active');
        const statusEl = turno.querySelector('.turno-status');
        if (statusEl) statusEl.textContent = '';
    });
    
    // Define turno atual
    let turnoAtual;
    if (hora >= 7 && hora < 15) {
        turnoAtual = turnoA;
    } else if (hora >= 15 && hora < 23.4) { // 23:24
        turnoAtual = turnoB;
    } else {
        turnoAtual = turnoC;
    }
    
    turnoAtual.classList.add('active');
    turnoAtual.querySelector('.turno-status').textContent = 'TURNO ATUAL';
}

// Salvar dados no localStorage
function salvarDados() {
    localStorage.setItem('registros_portaria', JSON.stringify(registros));
    localStorage.setItem('manobras_portaria', JSON.stringify(manobras));
    localStorage.setItem('agendamentos_portaria', JSON.stringify(agendamentos));
    localStorage.setItem('frota_portaria', JSON.stringify(frota));
    localStorage.setItem('setores_portaria', JSON.stringify(setores));
    localStorage.setItem('empresas_portaria', JSON.stringify(empresas));
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Define o dashboard como página inicial e ativa o link
    document.querySelector('.nav-link[onclick*="dashboard"]').classList.add('active');
    document.getElementById('dashboard-page').classList.add('active');
    
    atualizarTurno();
    atualizarDashboard();
    
    // Atualizar turno a cada minuto
    setInterval(atualizarTurno, 60000);
});

// Função de Notificação Global (movida de registro.js para app.js)
function showNotification(message, type = 'success') {
    // Remove notificações existentes
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());

    // Cria nova notificação
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Remove após 4 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.5s ease forwards';
            setTimeout(() => notification.remove(), 500);
        }
    }, 4000);
}

// Animação de saída para notificação
// Adicione ao seu style.css se não existir, ou defina aqui
if (document.styleSheets.length > 0 && document.styleSheets[0].cssRules) {
    let hasSlideOut = false;
    for (let rule of document.styleSheets[0].cssRules) {
        if (rule && rule.name === 'slideOut') {
            hasSlideOut = true;
            break;
        }
    }
    if (!hasSlideOut) {
        try {
            document.styleSheets[0].insertRule(`
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `, 0);
        } catch (e) {
            console.warn("Não foi possível inserir a regra CSS @keyframes slideOut:", e);
        }
    }
}


// ==========================
// FUNÇÕES GLOBAIS DE UTILIDADE
// ==========================

// Atualiza o datalist de empresas
function atualizarDatalistEmpresas() {
    const datalist = document.getElementById('empresas-list') || criarDatalistEmpresas();
    
    // Pega empresas dos registros E dos agendamentos
    const empresasRegistros = [...new Set(registros.map(r => r.empresa).filter(Boolean))];
    const empresasAgendamentos = [...new Set(agendamentos.map(a => a.empresa).filter(Boolean))];
    const empresasCadastradas = [...new Set(empresas.map(e => e.nome).filter(Boolean))];

    const empresasUnicas = [...new Set([...empresasRegistros, ...empresasAgendamentos, ...empresasCadastradas, 'Frota Própria'])];

    datalist.innerHTML = empresasUnicas.map(empresa => 
        `<option value="${empresa}">`
    ).join('');
}

function criarDatalistEmpresas() {
    const datalist = document.createElement('datalist');
    datalist.id = 'empresas-list';
    document.body.appendChild(datalist);
    return datalist;
}

// (NOVO) Atualiza o datalist de locais/destinos
function carregarOpcoesLocais() {
    const datalist = document.getElementById('locais-list');
    if (!datalist) return;

    // Pega todas as chaves de KNOWN_LOCATIONS, exceto as de controle
    const locais = Object.keys(KNOWN_LOCATIONS).filter(k => 
        k !== 'USINA' && k !== 'DEFAULT' && k !== 'PORTARIA'
    );
    
    // Adiciona setores cadastrados que podem não estar em KNOWN_LOCATIONS
    setores.forEach(setor => {
        if (!locais.includes(setor.nome.toUpperCase())) {
            locais.push(setor.nome);
        }
    });

    datalist.innerHTML = locais.map(local => 
        `<option value="${local.charAt(0).toUpperCase() + local.slice(1).toLowerCase()}">`
    ).join('');
}

// (NOVO) Pega coordenadas de um local pelo nome
function getCoordsFromLocationName(name) {
    if (!name) return KNOWN_LOCATIONS['DEFAULT'];
    
    const key = name.toUpperCase().replace(/ /g, '_'); // Ex: "Pátio de Máquinas" -> "PATIO_DE_MAQUINAS"
    
    // Tenta encontrar uma correspondência exata ou parcial
    const foundKey = Object.keys(KNOWN_LOCATIONS).find(k => k.includes(key));
    
    return KNOWN_LOCATIONS[foundKey] || KNOWN_LOCATIONS['DEFAULT'];
}


// Função para exportar dados para CSV
function exportDataToCSV(data, filename = 'relatorio.csv') {
    if (data.length === 0) {
        showNotification('Nenhum dado para exportar', 'warning');
        return;
    }

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')]; // Cabeçalho

    // Linhas
    for (const row of data) {
        const values = headers.map(header => {
            let val = row[header];
            if (val === null || val === undefined) {
                val = '';
            }
            // Trata valores que contêm vírgula ou aspas
            val = val.toString().replace(/"/g, '""');
            if (val.includes(',') || val.includes('\n') || val.includes('"')) {
                val = `"${val}"`;
            }
            return val;
        });
        csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    
    URL.revokeObjectURL(url);
    showNotification('Relatório CSV gerado!', 'success');
}