// js/monitor.js - Lógica do Mapa de Monitoramento (Versão 5 - Correção de Progresso)

let mapInstance = null;
let sectorLayer = null; // Camada para os setores fixos

// (NOVO) Armazena referências aos objetos do mapa para poder limpá-los
let activeMapObjects = []; 

// Ícones (Mesma lógica de antes)
const iconPortaria = L.icon({
    iconUrl: 'https://api.iconify.design/mdi/gate.svg?color=%23f9a826&width=32&height=32',
    iconSize: [32, 32],
    iconAnchor: [16, 32], 
    popupAnchor: [0, -32] 
});
const iconSetor = L.icon({
    iconUrl: 'https://api.iconify.design/mdi/office-building.svg?color=%233b82f6&width=28&height=28',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
});
const iconEstacionamento = L.icon({
    iconUrl: 'https://api.iconify.design/mdi/parking.svg?color=%233b82f6&width=28&height=28',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
});
const iconVeiculo = (tipo) => {
    let iconName = 'car';
    if (tipo === 'caminhao') iconName = 'truck';
    if (tipo === 'onibus') iconName = 'bus';
    if (tipo === 'moto') iconName = 'motorcycle';
    if (tipo === 'van') iconName = 'van-utility';
    return L.icon({
        iconUrl: `https://api.iconify.design/mdi/${iconName}.svg?color=%233b82f6&width=28&height=28`,
        iconSize: [28, 28],
        className: 'vehicle-icon-operation'
    });
};


// 3. Inicialização do Mapa
function initMap() {
    if (mapInstance) {
        mapInstance.invalidateSize();
        return; 
    }
    
    try {
        const mapContainer = document.getElementById('map-container');
        if (!mapContainer) return; 

        // Camadas de Mapa
        const camadaGoogleSatelite = L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
            maxZoom: 20,
            subdomains:['mt0','mt1','mt2','mt3'],
            attribution: 'Dados do Mapa &copy; Google'
        });
        const camadaRuas = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        });
        const baseLayers = {
            "Google Satélite": camadaGoogleSatelite,
            "Ruas (OSM)": camadaRuas
        };

        // Inicialização do Mapa
        mapInstance = L.map('map-container', {
            layers: [camadaGoogleSatelite]
        });

        L.control.layers(baseLayers).addTo(mapInstance);
        sectorLayer = L.layerGroup().addTo(mapInstance);

        // Adicionar Marcadores Fixos (Portaria e Setores)
        L.marker(KNOWN_LOCATIONS['PORTARIA'], { icon: iconPortaria, zIndexOffset: 1000 })
            .addTo(mapInstance)
            .bindPopup('<b>Portaria Principal</b>');
            
        setores.forEach(setor => {
            const loc = getCoordsFromLocationName(setor.nome);
            if (loc && loc[0] > -17.7 && loc[1] < -40.1) { // Filtro para locais internos
                const icon = (setor.nome === 'Estacionamento') ? iconEstacionamento : iconSetor;
                L.marker(loc, { icon: icon })
                    .addTo(sectorLayer)
                    .bindPopup(`<b>Setor: ${setor.nome}</b>`);
            }
        });
        
        // Ajusta o zoom inicial
        const initialBounds = L.latLngBounds([
            KNOWN_LOCATIONS['USINA'], 
            KNOWN_LOCATIONS['IBIRAPUA-BA'], 
            KNOWN_LOCATIONS['NANUQUE-MG']
        ]);
        mapInstance.fitBounds(initialBounds.pad(0.2)); 

    } catch (e) {
        console.error("Erro ao inicializar o mapa:", e);
        document.getElementById('map-container').innerHTML = "Erro ao carregar mapa.";
    }
}

// 5. Atualização do Monitor (Chamado por app.js)
function atualizarMonitor() {
    if (!mapInstance) {
        console.warn("Mapa não inicializado, pulando atualização.");
        return;
    }
    mapInstance.invalidateSize();
    // A simulação (startOperationsSimulation) é chamada por app.js
    // e ela cuidará de popular o feed e o mapa.
}


// (NOVO) =================================
// (NOVO) LÓGICA DA SIMULAÇÃO (REESCRITA)
// (NOVO) =================================

function startOperationsSimulation() {
    if (!mapInstance || typeof L.Routing === 'undefined' || typeof L.Marker.movingMarker === 'undefined') {
        if (typeof L.Routing === 'undefined' || typeof L.Marker.movingMarker === 'undefined') {
             console.error("Plugins de Roteamento ou Animação não carregados. Verifique o index.html.");
        }
        return;
    }
    
    stopOperationsSimulation(); // Limpa rotas e marcadores antigos

    const feedList = document.getElementById('live-feed-list');
    feedList.innerHTML = '';
    
    const agora = new Date().getTime();
    let bounds = L.latLngBounds(); 
    bounds.extend(KNOWN_LOCATIONS['USINA']);

    // 1. Pega Ônibus de Turno
    const onibus = simularOnibus(agora);
    
    // 2. Pega Manobras Ativas
    const manobrasAtivas = manobras
        .filter(m => m.status === 'andamento')
        .map(manobra => {
            
            // (BUGFIX) Calcula o progresso aqui
            const { progresso, duracaoRestanteMs } = calcularProgresso(
                manobra.horario_inicio_timestamp,
                manobra.horario_timestamp,
                agora
            );

            // (BUGFIX) Se o progresso for 1 (100%) ou mais, a viagem terminou. Não mostra.
            if (progresso >= 1) {
                return null;
            }
            
            return {
                id: manobra.id,
                start: KNOWN_LOCATIONS['USINA'],
                end: manobra.destino_coords || KNOWN_LOCATIONS['DEFAULT'],
                nome: `Manobra: ${manobra.placa_veiculo}`,
                destino: manobra.local_manobra,
                motorista: manobra.motorista,
                progresso: progresso, // (NOVO) Passa o progresso
                duracaoRestanteMs: duracaoRestanteMs, // (NOVO) Passa o tempo restante
                icon: iconVeiculo( (frota.find(f => f.placa === manobra.placa_veiculo) || {}).tipo || 'carro' )
            };
        });

    // Junta ônibus e manobras
    const todasOperacoes = [...onibus, ...manobrasAtivas];
    
    if (todasOperacoes.length === 0 || todasOperacoes.every(op => op === null)) {
        feedList.innerHTML = '<p style="color: var(--text-light); text-align: center; padding: 1rem;">Nenhuma operação ativa no momento.</p>';
    }

    // 3. Cria as rotas e animações
    todasOperacoes.forEach(op => {
        if (!op) return; // Pula nulos (ônibus fora de hora, manobras concluídas)

        // Converte coordenadas para o formato LatLng do Leaflet
        const startLatLng = L.latLng(op.start[0], op.start[1]);
        const endLatLng = L.latLng(op.end[0], op.end[1]);

        // Adiciona ao zoom
        bounds.extend(startLatLng);
        bounds.extend(endLatLng);

        // Cria o controle de rota (para obter os pontos da rua)
        const routingControl = L.Routing.control({
            waypoints: [startLatLng, endLatLng],
            createMarker: () => null, 
            routeWhileDragging: false,
            addWaypoints: false,
            show: false, 
            routeLine: (route) => {
                return L.polyline(route.coordinates, {
                    color: '#3b82f6', 
                    weight: 5,
                    opacity: 0.7,
                    dashArray: '10, 10'
                });
            }
        }).addTo(mapInstance);
        
        activeMapObjects.push(routingControl);

        // (MÁGICA) Escuta o evento 'routesfound'
        routingControl.on('routesfound', function(e) {
            const route = e.routes[0];
            const coordinates = route.coordinates; // Array de {lat, lng}
            const summary = route.summary; // Info de distância e tempo (do OSRM)

            // (LÓGICA CORRIGIDA)
            // 1. Encontra o ponto de início da animação baseado no progresso
            const startIndex = Math.floor(coordinates.length * op.progresso);
            
            // 2. Pega apenas os pontos restantes da rota
            const remainingRoute = coordinates.slice(startIndex);
            
            // 3. Se não houver rota restante, não faz nada
            if (remainingRoute.length < 2) {
                return;
            }

            // (NOVO) Cria o Marcador que se Move
            const animatedMarker = L.Marker.movingMarker(remainingRoute, op.duracaoRestanteMs, {
                autostart: true, // Começa a mover imediatamente
                icon: op.icon
            }).addTo(mapInstance);
            
            animatedMarker.bindPopup(`<b>${op.nome}</b><br>Destino: ${op.destino}<br>Status: Em trânsito`);
            
            activeMapObjects.push(animatedMarker);

            // Adiciona na barra lateral
            const etaMinutos = Math.round(op.duracaoRestanteMs / 60000);
            
            feedList.innerHTML += `
                <div class="live-feed-item">
                    <div class="live-feed-icon">${op.icon.options.iconUrl.includes('bus') ? '🚌' : '🚛'}</div>
                    <div class="live-feed-info">
                        <strong>${op.nome}</strong>
                        <span>${op.motorista || `Destino: ${op.destino}`}</span>
                        <span class="tempo-patio">
                            ${(op.progresso * 100).toFixed(0)}% Concluído 
                            (Previsão: ${etaMinutos} min)
                        </span>
                    </div>
                </div>
            `;
        });
    });

    // 4. Reajustar o zoom do mapa
    if (bounds.isValid() && bounds.getNorthEast() && !bounds.getNorthEast().equals(bounds.getSouthWest())) {
         try {
            mapInstance.fitBounds(bounds.pad(0.2), { animate: true, maxZoom: 17 });
        } catch (e) {
            console.warn("Não foi possível ajustar os limites do mapa:", e);
        }
    }
}


/**
 * (ALTERADO) Para a simulação e LIMPA TUDO (Rotas, Marcadores)
 */
function stopOperationsSimulation() {
     if (activeMapObjects && activeMapObjects.length > 0) {
        activeMapObjects.forEach(obj => {
            if (mapInstance && obj) {
                // Se for um controle de rota (L.Routing.control), usa .remove()
                if (typeof obj.remove === 'function') {
                    obj.remove();
                } 
                // Se for um marcador (L.Marker), usa .removeLayer()
                else if (mapInstance.hasLayer(obj)) {
                    mapInstance.removeLayer(obj);
                }
            }
        });
     }
     activeMapObjects = [];
}

/**
 * (NOVO) Função auxiliar de cálculo de progresso (usada por ambos)
 */
function calcularProgresso(startTime, endTime, nowTime) {
    if (!startTime || !endTime || endTime <= startTime) {
        // Se não iniciou ou dados inválidos
        return { progresso: 0, duracaoRestanteMs: 0 }; 
    }
    
    const totalDurationMs = endTime - startTime;
    const elapsedMs = nowTime - startTime;
    
    // Calcula o progresso, de 0.0 a 1.0 (ou mais, se estiver atrasado)
    const progresso = elapsedMs / totalDurationMs;
    
    // Calcula o tempo restante
    const duracaoRestanteMs = Math.max(0, endTime - nowTime);

    // Retorna o progresso (limitado a 1.0) e o tempo restante
    return { progresso: Math.min(1.0, Math.max(0, progresso)), duracaoRestanteMs };
}


/**
 * Função auxiliar para simular os ônibus
 */
function simularOnibus(agora) {
    const hora = new Date(agora).getHours();
    const minutos = new Date(agora).getMinutes();
    let turno, startTimeMs, endTimeMs;
    
    const hoje = new Date(agora);
    hoje.setHours(0, 0, 0, 0);
    const inicioDoDia = hoje.getTime();

    // Turno A (05:00 às 07:00)
    if (hora >= 5 && hora < 7) {
        turno = 'A (Manhã)';
        startTimeMs = inicioDoDia + (5 * 60 * 60 * 1000); // 05:00
        endTimeMs = inicioDoDia + (7 * 60 * 60 * 1000); // 07:00
    }
    // Turno B (13:00 às 15:00)
    else if (hora >= 13 && hora < 15) {
        turno = 'B (Tarde)';
        startTimeMs = inicioDoDia + (13 * 60 * 60 * 1000); // 13:00
        endTimeMs = inicioDoDia + (15 * 60 * 60 * 1000); // 15:00
    }
    // Turno C (21:40 às 23:40)
    else if ( (hora === 21 && minutos >= 40) || (hora === 22) || (hora === 23 && minutos < 40) ) {
        turno = 'C (Noite)';
        startTimeMs = inicioDoDia + (21 * 60 * 60 * 1000) + (40 * 60 * 1000); // 21:40
        endTimeMs = inicioDoDia + (23 * 60 * 60 * 1000) + (40 * 60 * 1000); // 23:40
    }
    else {
        // Fora do horário
        return [];
    }
    
    // (CORRIGIDO) Usa a função de cálculo padrão
    const { progresso, duracaoRestanteMs } = calcularProgresso(startTimeMs, endTimeMs, agora);

    const opBus1 = {
        id: 'bus1',
        start: KNOWN_LOCATIONS['IBIRAPUA-BA'],
        end: KNOWN_LOCATIONS['USINA'],
        nome: 'Ônibus: Rota Ibirapuã-BA',
        destino: 'Portaria (Turno ' + turno + ')',
        motorista: 'Simulação de Turno',
        progresso: progresso,
        duracaoRestanteMs: duracaoRestanteMs, 
        icon: iconVeiculo('onibus')
    };
    
    const opBus2 = {
        id: 'bus2',
        start: KNOWN_LOCATIONS['NANUQUE-MG'],
        end: KNOWN_LOCATIONS['USINA'],
        nome: 'Ônibus: Rota Nanuque-MG',
        destino: 'Portaria (Turno ' + turno + ')',
        motorista: 'Simulação de Turno',
        progresso: progresso,
        duracaoRestanteMs: duracaoRestanteMs, 
        icon: iconVeiculo('onibus')
    };

    return [opBus1, opBus2];
}