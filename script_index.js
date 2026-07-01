// ==========================================
// CONFIGURAÇÕES E VARIÁVEIS GLOBAIS DO INDEX
// ==========================================
const API_URL_index = "https://script.google.com/macros/s/AKfycbyr35zQWckx2M17VxIcffnu01L4Aw682CpP8BSCwAoptlWS0nahNAzik07LbWl8VbY/exec";

// --- BANCO DE DADOS LOCAL DOS EVENTOS ---
const bancoEventos = {
    1: {
        tag: "OFICINA",
        titulo: "Oficina de Hardware e Manutenção",
        descricao: "Venha aprender na prática a desmontar, identificar componentes e fazer a manutenção preventiva dos computadores do laboratório da escola com a equipe do LIpE/UFRJ.",
        rodape: "📅 Quinta-feira às 14h | 📍 Lab de Informática | 🪙 +50 EcoCoins",
        link: "https://LINK-DO-FORMULARIO-1.com"
    },
    2: {
        tag: "MUTIRÃO",
        titulo: "Sexta Ecológica - Pesagem de Recicláveis",
        descricao: "Traga suas garrafas PET, latinhas e papelão para a nossa pesagem semanal. Lembre-se: quanto mais peso você trouxer, mais EcoCoins acumula na sua conta!",
        rodape: "📅 Sexta-feira das 08h às 12h | 📍 Pátio Central | 🪙 Ganhos por Kg",
        link: "https://LINK-DO-FORMULARIO-2.com"
    },
    3: {
        tag: "CURSO",
        titulo: "Introdução à Automação com Arduino",
        descricao: "Primeiros passos no desenvolvimento de circuitos e lógica de programação para o nosso sistema integrado de irrigação automatizada da horta escolar.",
        rodape: "📅 Segunda-feira às 15h | 📍 Sala de Ciências | 🪙 +60 EcoCoins",
        link: "https://LINK-DO-FORMULARIO-3.com"
    }
};

let slideIndexIndex = 1;

window.addEventListener('DOMContentLoaded', async () => {
    mostrarSlides(slideIndexIndex);
    setInterval(() => { mudarSlide(1); }, 5000);
    mostrarEvento(1);

    try {
        const resposta = await fetch(`${API_URL_index}?aba=Dados Gerais`);
        if (!resposta.ok) throw new Error("Erro de resposta do servidor Google.");
        
        const dadosAlunos = await resposta.json();
        if (dadosAlunos && dadosAlunos.length > 1) {
            gerarMinisRankings(dadosAlunos);
        }
    } catch (erro) {
        console.error("Erro ao carregar dados do Sheets para a index:", erro);
        const erroFeedback = `<div style="color: var(--bronze); text-align: center; padding: 10px; font-weight: 700;">Erro ao atualizar ranking</div>`;
        document.getElementById("podio-lideres-gerais").innerHTML = erroFeedback;
        document.getElementById("podio-mestres-moedas").innerHTML = erroFeedback;
    }
});

function mostrarEvento(numeroEvento) {
    const evento = bancoEventos[numeroEvento];
    if (!evento) return;

    const tagElemento = document.getElementById("tag-evento");
    tagElemento.innerText = evento.tag;
    document.getElementById("evento-titulo").innerText = evento.titulo;
    document.getElementById("evento-descricao").innerText = evento.descricao;
    document.getElementById("evento-rodape").innerText = evento.rodape;

    if (evento.tag === "Esporte") {
        tagElemento.style.backgroundColor = "#0e4768";
    } else if (evento.tag === "Oficina") {
        tagElemento.style.backgroundColor = "#fd7e14";
    } else {
        tagElemento.style.backgroundColor = "var(--primary-blue)";
    }

    for (let i = 1; i <= 3; i++) {
        const botaoContainer = document.getElementById(`link-botao-${i}`);
        if (botaoContainer) botaoContainer.style.display = (i === numeroEvento) ? "inline-block" : "none";
    }

    const botoesNumeros = document.querySelectorAll(".botao-numero");
    botoesNumeros.forEach((btn, index) => {
        if (index + 1 === numeroEvento) btn.classList.add("ativo");
        else btn.classList.remove("ativo");
    });
}

function mudarSlide(n) { mostrarSlides(slideIndexIndex += n); }

function mostrarSlides(n) {
    let slides = document.getElementsByClassName("meus-slides");
    if (slides.length === 0) return;
    if (n > slides.length) { slideIndexIndex = 1 }
    if (n < 1) { slideIndexIndex = slides.length }
    for (let i = 0; i < slides.length; i++) { slides[i].style.display = "none"; }
    slides[slideIndexIndex - 1].style.display = "block";
}

function gerarMinisRankings(dados) {
    let listaAlunos = [];
    for (let i = 1; i < dados.length; i++) {
        const nome = String(dados[i][1]).trim();  
        const turma = String(dados[i][2]).trim(); 
        const ganho = parseFloat(String(dados[i][3]).replace(',', '.')) || 0; 
        const gasto = Math.abs(parseFloat(String(dados[i][4]).replace(',', '.'))) || 0; 

        if (nome) {
            listaAlunos.push({ identificacao: `${nome} (${turma})`, ganhoTotal: ganho, gastoTotal: gasto });
        }
    }

    const topLideres = [...listaAlunos].sort((a, b) => b.ganhoTotal - a.ganhoTotal).slice(0, 3);
    construirPodioGrafico("podio-lideres-gerais", topLideres, "ganhoTotal");

    const topMestres = [...listaAlunos].sort((a, b) => b.gastoTotal - a.gastoTotal).slice(0, 3);
    construirPodioGrafico("podio-mestres-moedas", topMestres, "gastoTotal");
}

function construirPodioGrafico(idConteiner, dadosTop, chaveMetrica) {
    const conteiner = document.getElementById(idConteiner);
    if (!conteiner) return;
    conteiner.innerHTML = ""; 

    const estilosMedalha = ["podio-ouro", "podio-prata", "podio-bronze"];
    dadosTop.forEach((aluno, index) => {
        const elementoLinha = document.createElement("div");
        elementoLinha.className = `linha-linha-podio ${estilosMedalha[index]}`;
        elementoLinha.innerHTML = `
            <span class="emblema-medalha">${index + 1}º</span>
            <span class="nome-usuario" title="${aluno.identificacao}">${aluno.identificacao}</span>
            <strong>${aluno[chaveMetrica].toFixed(0)} 🪙</strong>
        `;
        conteiner.appendChild(elementoLinha);
    });
}