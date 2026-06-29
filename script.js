// ==========================================
// 1. CONFIGURAÇÕES E VARIÁVEIS GLOBAIS
// ==========================================
const API_URL = "https://script.google.com/macros/s/AKfycby2Rb7zzG23sCtFLuUIkbXFn_q2gE4LvITZiTqKQ910p6mqTKRogZhd8gWVF4wx5Ns/exec"; 
let dadosAlunos = [];
let slideIndex = 0;

// Lista de Eventos para as abas (1, 2, 3...)
const listaEventos = [
    { titulo: "Oficina de Reciclagem", desc: "Aprenda a transformar garrafas PET em objetos decorativos e úteis.", info: "Data: 20/03 | Local: Pátio Central" },
    { titulo: "Plantio Sustentável", desc: "Vamos revitalizar o jardim da escola com mudas trazidas pelos alunos.", info: "Data: 25/03 | Local: Horta do CIEP" },
    { titulo: "Grande Pesagem", desc: "Último dia do mês para entrega de recicláveis e contagem de pontos.", info: "Data: 31/03 | Local: Portaria Principal" },
    { titulo: "Cine Eco", desc: "Exibição de documentário sobre o meio ambiente com pipoca grátis.", info: "Data: 05/04 | Local: Auditório" },
    { titulo: "Feira de Trocas", desc: "Use seus EcoCoins para resgatar prêmios físicos na nossa feirinha.", info: "Data: 10/04 | Local: Quadra" }
];

// ==========================================
// 2. INICIALIZAÇÃO DO SITE
// ==========================================
async function inicializarSite() {
    console.log("EcoCoin CIEP 386 - Sistema Iniciado");
    
    // Inicia funções visuais imediatas
    iniciarSlideshow();
    
    // Busca dados da planilha do Google
    await carregarDadosPlanilha();
    
    // Atualiza os componentes que dependem dos dados
    renderizarRankingLateral();
    
    // Se estiver na página de Ranking Geral, preenche a tabela
    if (document.getElementById('corpoTabelaRanking')) {
        renderizarTabelaCompleta();
    }
    
    // Se estiver na página de Perfil, preenche os dados do aluno
    if (document.getElementById('nomeAluno')) {
        preencherDadosPerfil();
    }
}

// ==========================================
// 3. CONEXÃO COM GOOGLE SHEETS
// ==========================================
async function carregarDadosPlanilha() {
    try {
        const resposta = await fetch(API_URL + "?aba=Dados Gerais");
        dadosAlunos = await resposta.json();
        console.log("Dados sincronizados com a planilha!");
    } catch (erro) {
        console.error("Erro ao carregar planilha:", erro);
        // Fallback: se a planilha falhar, tenta usar o que está no cache
        const cache = localStorage.getItem('dadosAlunosCache');
        if (cache) dadosAlunos = JSON.parse(cache);
    }
}

// ==========================================
// 4. SLIDESHOW AUTOMÁTICO
// ==========================================
function iniciarSlideshow() {
    let slides = document.getElementsByClassName("mySlides");
    if (slides.length === 0) return;

    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    
    slideIndex++;
    if (slideIndex > slides.length) { slideIndex = 1; }
    
    slides[slideIndex - 1].style.display = "block";
    setTimeout(iniciarSlideshow, 5000); // Troca a cada 5 segundos
}

function plusSlides(n) {
    let slides = document.getElementsByClassName("mySlides");
    slideIndex += n;
    if (slideIndex > slides.length) slideIndex = 1;
    if (slideIndex < 1) slideIndex = slides.length;
    
    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    slides[slideIndex - 1].style.display = "block";
}

// ==========================================
// 5. SISTEMA DE ABAS DE EVENTOS (ESTILO PRINT)
// ==========================================
function mostrarEvento(num) {
    // Atualiza o estado visual dos números (1, 2, 3...)
    const numeros = document.querySelectorAll('.num');
    numeros.forEach(n => n.classList.remove('active'));
    
    // O índice do array é num - 1
    if (numeros[num - 1]) {
        numeros[num - 1].classList.add('active');
    }

    // Altera o texto do card de evento
    const evento = listaEventos[num - 1];
    if (evento) {
        document.getElementById('evento-titulo').innerText = evento.titulo;
        document.querySelector('.desc').innerText = evento.desc;
        document.querySelector('.info-footer').innerText = evento.info;
    }
}

// ==========================================
// 6. RANKINGS (LATERAL E GERAL)
// ==========================================
function renderizarRankingLateral() {
    const lista = document.getElementById('podium-alunos-home');
    if (!lista || dadosAlunos.length === 0) return;

    // Ordena por saldo (maior para menor) e pega o Top 5
    const top5 = [...dadosAlunos].sort((a, b) => b.saldo - a.saldo).slice(0, 5);

    lista.innerHTML = top5.map((aluno, index) => `
        <li>
            <span>${index + 1}. ${aluno.nome}</span>
            <span class="badge-coin">${aluno.saldo} 🪙</span>
        </li>
    `).join('');
}

function renderizarTabelaCompleta() {
    const corpo = document.getElementById('corpoTabelaRanking');
    const busca = document.getElementById('buscaNome')?.value.toLowerCase() || "";
    
    // Ordena por saldo
    let filtrados = [...dadosAlunos].sort((a, b) => b.saldo - a.saldo);
    
    // Aplica busca se houver
    if (busca) {
        filtrados = filtrados.filter(a => a.nome.toLowerCase().includes(busca));
    }

    corpo.innerHTML = filtrados.map((aluno, index) => `
        <tr class="linha-aluno" data-turma="${aluno.turma}">
            <td>${index + 1}º</td>
            <td>${aluno.nome}</td>
            <td>${aluno.turma}</td>
            <td class="valor-eco">${aluno.saldo.toFixed(2)}</td>
        </tr>
    `).join('');
}

// ==========================================
// 7. LOGIN E PERFIL
// ==========================================
// function fazerLogin() {
//     const matricula = document.getElementById('inputMatricula').value;
//     const aluno = dadosAlunos.find(a => a.matricula.toString() === matricula);

//     if (aluno) {
//         localStorage.setItem('usuarioLogado', JSON.stringify(aluno));
//         window.location.href = 'perfil.html';
//     } else {
//         alert("Matrícula não encontrada! Verifique os dados com a secretaria.");
//     }
// }

// function preencherDadosPerfil() {
//     const aluno = JSON.parse(localStorage.getItem('usuarioLogado'));
//     if (!aluno) {
//         window.location.href = 'index.html';
//         return;
//     }
//     document.getElementById('nomeAluno').innerText = aluno.nome;
//     document.getElementById('turmaAluno').innerText = aluno.turma;
//     document.getElementById('saldoAluno').innerText = `🪙 ${aluno.saldo.toFixed(2)} EcoCoins`;
// }

// ==========================================
// DISPARO NO CARREGAMENTO
// ==========================================
window.onload = inicializarSite;