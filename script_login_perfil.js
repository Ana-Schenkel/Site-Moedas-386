// ==========================================
// 1. CONFIGURAÇÕES E VARIÁVEIS GLOBAIS
// ==========================================
const alunoLogado = Number(sessionStorage.getItem("alunoLogado"));

const API_URL_perfil = "https://script.google.com/macros/s/AKfycby2Rb7zzG23sCtFLuUIkbXFn_q2gE4LvITZiTqKQ910p6mqTKRogZhd8gWVF4wx5Ns/exec"; 
let dadosAlunosPerfil = [];

const API_URL_login = "https://script.google.com/macros/s/AKfycbygZslTMNAen4nJ5QyUIKivrHULl7DQzPjAYXKfHuc_KfeqoDE19jYxvJiOHtY0u8dm/exec";
let dadosAlunosLogin = [];

// ==========================================
// 2. INICIALIZAÇÃO DO SITE
// ==========================================
async function inicializarPerfil() {

    const pagina = document.body.id;

    // Se não houver ninguém logado, vai para o login
    if (!alunoLogado) {
        await carregarPlanilhaLogin();
        console.log("Dados de login carregados:");
        
        if (pagina === "pagina_perfil") {
            alert("Por favor, faça login primeiro!");
            window.location.href = 'login.html';
        } else {
            await inicializarLogin();
        }
    // Se houver alguém logado, carrega os dados do perfil
    } else {
        const aluno = await carregarPerfilAluno(alunoLogado);
        console.log("Dados do aluno logado:", aluno);
    }
}

// ==========================================
// 3. CONEXÃO COM GOOGLE SHEETS
// ==========================================
async function carregarPlanilhaLogin() {
    try {
        const resposta = await fetch(API_URL_login + "?aba=Dados Gerais");
        dadosAlunosLogin = await resposta.json();
        console.log("Dados sincronizados com a planilha!");
    } catch (erro) {
        console.error("Erro ao carregar planilha:", erro);
        // Fallback: se a planilha falhar, tenta usar o que está no cache
        const cache = localStorage.getItem('dadosAlunosCache');
        if (cache) dadosAlunosLogin = JSON.parse(cache);
    }
}

async function carregarPlanilhaPerfil() {
    try {
        const resposta = await fetch(API_URL_perfil + "?aba=Dados Gerais");
        dadosAlunosPerfil = await resposta.json();
        console.log("Dados sincronizados com a planilha!");
    } catch (erro) {
        console.error("Erro ao carregar planilha:", erro);
        // Fallback: se a planilha falhar, tenta usar o que está no cache
        const cache = localStorage.getItem('dadosAlunosCache');
        if (cache) dadosAlunosPerfil = JSON.parse(cache);
    }
}

// ==========================================
// 4. CONFIGURAÇÕES DE LOGIN E CADASTRO
// ==========================================

async function inicializarLogin() {
    
    const botao_conta = document.getElementById("btn_conta");
    const botao_inicio = document.getElementById("btn_inicio");
    const botao_entrar = document.getElementById("btn_entrar");
    const botao_esqueci_senha = document.getElementById("esqueci_senha");
    const botao_cadastrar = document.getElementById("btn_cadastrar");

    botao_conta.addEventListener("click", () => {
        trocaPaginaCadastro();
    });

    botao_inicio.addEventListener("click", () => {
        // Volta para a página inicial
        window.location.href = 'index.html';
    });

    botao_entrar.addEventListener("click", () => {
        fazerLogin();
    });

    // botao_esqueci_senha.addEventListener("click", () => {
    //     esqueciSenha();
    // });

    botao_cadastrar.addEventListener("click", () => {
        fazerCadastro();
    });
}

async function trocaPaginaCadastro() {
    
    const titulo = document.getElementById("titulo");
    const botao_conta = document.getElementById("btn_conta");
    const login = document.getElementById("login");
    const novaConta = document.getElementById("nova_conta");

    // Alterna a visibilidade do login e do cadastro
    if (login.style.display !== "none") {
        // Esconde o login e mostra o cadastro
        login.style.display = "none";
        novaConta.style.display = "block";
        botao_conta.textContent = "Já tenho conta";
        titulo.textContent = "Nova conta";
    } else {
        // Esconde o cadastro e mostra o login
        login.style.display = "block";
        novaConta.style.display = "none";
        botao_conta.textContent = "Não tenho conta";
        titulo.textContent = "Acesse sua conta";
    }
}

// ============================================================
// 5. FUNÇÕES DE LOGIN E CADASTRO (VALIDAÇÃO E ENVIO DE DADOS)
// ============================================================

async function fazerLogin() {

    const email = document.getElementById("email_login").value.trim().toLowerCase();
    const senha = document.getElementById("senha_login").value.trim();

    for (let i = 1; i < dadosAlunosLogin.length; i++) {

        const emailPlanilha = String(dadosAlunosLogin[i][3]).trim().toLowerCase();
        const senhaPlanilha = String(dadosAlunosLogin[i][4]).trim();

        if (emailPlanilha === email && senhaPlanilha === senha) {
            console.log("Login bem-sucedido para:", email);
            // Salva os dados do usuário logado no sessionStorage
            sessionStorage.setItem("alunoLogado", dadosAlunosLogin[i][0]); // Supondo que a matrícula esteja na primeira coluna
            alert("Login bem-sucedido!");
            window.location.href = 'perfil.html'; // Redireciona para a página de perfil
            return;
        }
    }

    alert("E-mail ou senha incorretos. Tente novamente.");
    
}

// async function esqueciSenha() {

// }

async function fazerCadastro() {

    const nome = document.getElementById("nome_cadastro").value.trim();
    const matricula = document.getElementById("matricula_cadastro").value.trim();
    const turma = document.getElementById("turma_cadastro").value.trim();
    const email = document.getElementById("email_cadastro").value.trim().toLowerCase();
    const senha = document.getElementById("senha_cadastro").value.trim();
    const confSenha = document.getElementById("confsenha").value.trim();

    if (senha !== confSenha) {
        alert("As senhas não coincidem! Por favor, tente novamente.");
        return;
    }
    
    for (let i = 1; i < dadosAlunosLogin.length; i++) {
        const emailPlanilha = String(dadosAlunosLogin[i][3]).trim().toLowerCase();
        if (emailPlanilha === email) {
            alert("E-mail já cadastrado! Por favor, use outro e-mail.");
            return;
        }
        const matriculaPlanilha = String(dadosAlunosLogin[i][0]).trim();
        if (matriculaPlanilha === matricula) {
            alert("Matrícula já cadastrada! Por favor, verifique os dados com a secretaria.");
            return;
        }
    }

    await fetch(API_URL_login, {
        method: "POST",
        body: JSON.stringify({
            nome: nome,
            matricula: matricula,
            turma: turma,
            email: email,
            senha: senha
        })
    });

    console.log("Cadastro realizado para:", nome, matricula, turma, email);

    await carregarPlanilhaPerfil();
    console.log("Dados do perfil carregados:");

    await fetch(API_URL_perfil, {
        method: "POST",
        body: JSON.stringify({
            nome: nome,
            matricula: matricula,
            turma: turma
        })
    });

    alert("Cadastro realizado! Você será redirecionado para a página de login. Aguarde alguns minutos para que os dados sejam sincronizados. Recarregue a página de login se necessário.");
    trocaPaginaCadastro();
}


// ===============================================
// 6. CARREGAMENTO DE DADOS DO PERFIL DO ALUNO
// ===============================================

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

    const botao_sair = document.getElementById("btn_sair");

    botao_sair.addEventListener("click", () => {
        sessionStorage.removeItem("alunoLogado");
        window.location.href = 'login.html';
    });

    return await dadosAluno;
}

window.onload = inicializarPerfil;