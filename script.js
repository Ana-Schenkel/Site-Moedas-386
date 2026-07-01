const API_URL = "https://script.google.com/macros/s/AKfycbyr35zQWckx2M17VxIcffnu01L4Aw682CpP8BSCwAoptlWS0nahNAzik07LbWl8VbY/exec"; 
let dadosAlunos = [];

async function inicializarSite() {
    await carregarDadosPlanilha();
    
    // Verifica se os componentes existem antes de renderizar
    if (document.getElementById('podium-alunos-home')) renderizarRankingLateral();
    if (document.getElementById('corpoTabelaRanking')) renderizarTabelaCompleta();
}

async function carregarDadosPlanilha() {
    try {
        const resposta = await fetch(API_URL + "?aba=Dados Gerais");
        dadosAlunos = await resposta.json();
        console.log("Dados carregados com sucesso!");
    } catch (erro) {
        console.error("Erro ao carregar planilha:", erro);
    }
}

function renderizarTabelaCompleta() {
    const corpo = document.getElementById('corpoTabelaRanking');
    if (!corpo || dadosAlunos.length <= 1) return;

    // Remove cabeçalho e filtra alunos válidos
    let filtrados = dadosAlunos.slice(1).filter(aluno => aluno[1]);
    
    // Ordena pelo saldo (Coluna F - índice 5)
    filtrados.sort((a, b) => (parseFloat(b[5]) || 0) - (parseFloat(a[5]) || 0));
    
    corpo.innerHTML = filtrados.map((aluno, index) => `
        <tr>
            <td>${index + 1}º</td>
            <td>${aluno[1] || ''}</td>
            <td>${aluno[2] || ''}</td>
            <td class="valor-eco">${(parseFloat(aluno[5]) || 0).toFixed(2)}</td>
        </tr>
    `).join('');
}

function carregarMenu() {
    const header = document.querySelector('header');
    if (header) {
        header.innerHTML = `
            <div class="nav-container">
                <div class="logo-text">386 <span>EcoCoin</span></div>
                <nav><ul><li><a href="index.html">INÍCIO</a></li><li><a href="loja.html">LOJA</a></li><li><a href="ranking.html">RANKING</a></li><li><a href="perfil.html">PERFIL</a></li></ul></nav>
            </div>`;
    }
}

window.addEventListener('load', () => {
    carregarMenu();
    inicializarSite();
});