document.addEventListener('DOMContentLoaded', function() {
    // Função para obter parâmetros da URL
    function getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        const results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }

    // 1. Coleta dos dados da URL
    const studentName = getUrlParameter('name');
    const courseTitle = getUrlParameter('course');
    const courseHours = getUrlParameter('hours');
    const certDate = getUrlParameter('date');
    const certNumber = getUrlParameter('cert');

    // 2. Preenchimento dos Elementos
    document.getElementById('student-name').textContent = studentName || 'NOME DO ALUNO';
    document.getElementById('course-title').textContent = courseTitle || 'TÍTULO DO CURSO';
    document.getElementById('course-hours').textContent = courseHours || 'XX horas/aula';
    document.getElementById('cert-date').textContent = `São Paulo, ${certDate || 'Data de Hoje'}.`;
    document.getElementById('cert-number-display').textContent = certNumber || '0000-0000';

    // 3. Disparar a impressão
    // O timeout é essencial para garantir que a página carregue completamente antes de imprimir
    setTimeout(() => {
        window.print();
        // Opcional: Fechar a janela após a impressão/cancelamento
        // window.close(); 
    }, 500); 
});