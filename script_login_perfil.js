// ==========================================
// CONFIGURAÇÕES
// ==========================================
const API_URL_login = "https://script.google.com/macros/s/AKfycbzFgqH9ZoG2sPvcH_CHp8xVosVDSe6BiI93DjBLEQSvOI2E8naH7I8xV-X0Km_jOzJA/exec"; 
const API_URL_perfil = "https://script.google.com/macros/s/AKfycbyr35zQWckx2M17VxIcffnu01L4Aw682CpP8BSCwAoptlWS0nahNAzik07LbWl8VbY/exec";

let dadosAlunosLogin = [];

// ==========================================
// INICIALIZADOR ÚNICO (Ouvinte de carregamento)
// ==========================================
window.addEventListener('DOMContentLoaded', async () => {
    const bodyId = document.body.id;
    
    if (bodyId === "pagina_login") {
        await carregarPlanilhaLogin();
        document.getElementById("btn_entrar").addEventListener("click", (e) => { e.preventDefault(); verificarLogin(); });
    } 
    else if (bodyId === "pagina_perfil") {
        const matricula = sessionStorage.getItem("alunoLogado");
        if (!matricula) window.location.href = 'login.html';
        else await carregarPerfilAluno(matricula);
    }
    else if (bodyId === "pagina_recuperar") {
        document.getElementById("btn_redefinir").addEventListener("click", (e) => { e.preventDefault(); verificarERedefinir(); });
    }
});

// ==========================================
// FUNÇÕES DE LÓGICA
// ==========================================
async function carregarPlanilhaLogin() {
    const res = await fetch(API_URL_login + "?aba=Dados Gerais");
    dadosAlunosLogin = await res.json();
}

async function verificarLogin() {
    const email = document.getElementById("email_login").value.trim().toLowerCase();
    const senha = document.getElementById("senha_login").value.trim();

    for (let i = 1; i < dadosAlunosLogin.length; i++) {
        if (String(dadosAlunosLogin[i][3]).trim().toLowerCase() === email && String(dadosAlunosLogin[i][4]).trim() === senha) {
            sessionStorage.setItem("alunoLogado", dadosAlunosLogin[i][0]);
            window.location.href = 'perfil.html';
            return;
        }
    }
    alert("E-mail ou senha incorretos.");
}

async function carregarPerfilAluno(matricula) {
    const res = await fetch(API_URL_perfil + "?aba=" + matricula);
    const d = await res.json();

    document.getElementById("nomeAluno").innerText = d[1][0];
    document.getElementById("matriculaAluno").innerText = d[1][1];
    document.getElementById("turmaAluno").innerText = d[1][2] || "N/A";
    document.getElementById("saldoAluno").innerText = `🪙 ${d[5][1]} EcoCoins`;

    const tbody = document.getElementById("atividadesAluno");
    tbody.innerHTML = "";
    for (let i = 7; i < d.length; i++) {
        if (d[i][1]) {
            tbody.innerHTML += `<tr><td>${d[i][1]}</td><td>${new Date(d[i][0]).toLocaleDateString()}</td><td>${d[i][3]}</td></tr>`;
        }
    }
}
