// ==========================================
// 1. CONFIGURAÇÕES E VARIÁVEIS GLOBAIS
// ==========================================
const API_URL_perfil = "https://script.google.com/macros/s/AKfycbx5i6Lfu2EP4DCWhKWSy_svczfblZklUO2nl1YyckzV8X5IMd0JKj71Y8FbIm2IB0M/exec"; 
let dadosAlunos = [];

// ==========================================
// 2. INICIALIZAÇÃO DO SITE
// ==========================================
async function inicializarPerfil() {

    // Busca dados da planilha do Google
    // await carregarDadosPlanilha();

    // const alunoLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

    // if (!alunoLogado) {
    //     // Se não houver ninguém logado, volta para a home
    //     alert("Por favor, faça login primeiro!");
    //     window.location.href = 'login.html';
    // } else {
        await carregarPlanilhaPerfil();

        const aluno = await carregarPerfilAluno("123456"); // Substitua pelo ID correto da aba do aluno

        console.log("Dados do aluno logado:", aluno);
        console.log("Dados do aluno logado:", aluno[1][0]); // Nome do aluno
    // }
    
}

// ==========================================
// 3. CONEXÃO COM GOOGLE SHEETS
// ==========================================
async function carregarPlanilhaLogin() {
    try {
        const resposta = await fetch(API_URL_login);
        dadosAlunos = await resposta.json();
        console.log("Dados sincronizados com a planilha!");
    } catch (erro) {
        console.error("Erro ao carregar planilha:", erro);
        // Fallback: se a planilha falhar, tenta usar o que está no cache
        const cache = localStorage.getItem('dadosAlunosCache');
        if (cache) dadosAlunos = JSON.parse(cache);
    }
}

async function carregarPlanilhaPerfil() {
    try {
        const resposta = await fetch(API_URL_perfil);
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
// 4. Redirecionar para o login
// ==========================================

    // window.onload = () => {
    // const alunoLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

    // if (!alunoLogado) {
    //     // Se não houver ninguém logado, volta para a home
    //     alert("Por favor, faça login primeiro!");
    //     window.location.href = 'login.html';
    // } else {
    //     const aluno = await carregarAlunoLogado("123456"); // Substitua pelo ID correto da aba do aluno

    //     console.log("Dados do aluno logado:", aluno);
    //     console.log("Dados do aluno logado:", aluno[1][0]); // Nome do aluno
    // }
    // };

    // function logout() {
    //     localStorage.removeItem('usuarioLogado');
    //     window.location.href = 'index.html';
    // }

// ==========================================
// 2. Carregar os dados do Perfil do aluno logado
// ==========================================

function formatarData(dataJSON) {
    const data = new Date(dataJSON);

    let texto = data.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "2-digit"
    });

    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

async function carregarPerfilAluno(nomeAba_matricula) {

    const resposta = await fetch(API_URL_perfil + "?aba=" + nomeAba_matricula);

    dadosAluno = await resposta.json();

    document.getElementById("nomeAluno").innerHTML = dadosAluno[1][0]; // Nome do aluno
    document.getElementById("turmaAluno").innerHTML = dadosAluno[1][1]; // Turma do aluno
    document.getElementById("matriculaAluno").innerHTML = dadosAluno[1][2]; // Matrícula do aluno
    document.getElementById("saldoAluno").innerHTML = `🪙 ${dadosAluno[5][1].toFixed(2)} EcoCoins`; // Saldo do aluno
    
    // Corpo da tabela de atividades
    const tbody = document.getElementById("atividadesAluno");

    tbody.innerHTML = ""; // Limpa a tabela caso já tenha dados

    // Começa em 7 para ignorar os dados iniciais do aluno (nome, turma, matrícula, etc.) e pegar apenas as atividades
    for (let i = 7; i < dadosAluno.length; i++) {

        const data = formatarData(dadosAluno[i][0]); // coluna A
        const atividade = dadosAluno[i][1]; // coluna B
        const valor = dadosAluno[i][3];     // coluna D

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${atividade}</td>
            <td>${data}</td>
            <td class="${valor >= 0 ? "valor-positivo" : "valor-negativo"}">
                ${valor > 0 ? "+" : ""}${valor}
            </td>
        `;

        tbody.appendChild(tr);
    }
    return await dadosAluno;
}



window.onload = inicializarPerfil;