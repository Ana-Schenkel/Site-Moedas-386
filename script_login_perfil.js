// ==========================================
// 1. CONFIGURAÇÕES GLOBAIS
// ==========================================
const API_URL_login = "https://script.google.com/macros/s/AKfycbzFgqH9ZoG2sPvcH_CHp8xVosVDSe6BiI93DjBLEQSvOI2E8naH7I8xV-X0Km_jOzJA/exec"; 
const API_URL_perfil = "https://script.google.com/macros/s/AKfycbyr35zQWckx2M17VxIcffnu01L4Aw682CpP8BSCwAoptlWS0nahNAzik07LbWl8VbY/exec";

// ==========================================
// 2. FUNÇÕES DE PERFIL
// ==========================================
async function carregarPerfilAluno(matricula) {
    try {
        const resposta = await fetch(API_URL_perfil + "?aba=" + matricula);
        const dadosAluno = await resposta.json();

        // 1. Preenche dados do Header (Linha 2 da aba individual)
        // [1] = Linha 2 | [0] = Col A (Nome), [1] = Col B (Matrícula), [2] = Col C (Turma)
        document.getElementById("nomeAluno").innerText = dadosAluno[1][0];
        document.getElementById("matriculaAluno").innerText = dadosAluno[1][1];
        document.getElementById("turmaAluno").innerText = dadosAluno[1][2] || "N/A"; 
        
        // Saldo (Linha 6 da aba individual, Coluna B)
        document.getElementById("saldoAluno").innerText = `🪙 ${dadosAluno[5][1]} EcoCoins`;

        // 2. Tabela de Atividades (Começa na Linha 8 / Índice 7)
        const tbody = document.getElementById("atividadesAluno");
        tbody.innerHTML = ""; 
        
        for (let i = 7; i < dadosAluno.length; i++) {
            if (dadosAluno[i][1]) { // Verifica se existe atividade
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${dadosAluno[i][1]}</td>
                    <td>${new Date(dadosAluno[i][0]).toLocaleDateString()}</td>
                    <td>${dadosAluno[i][3]}</td>
                `;
                tbody.appendChild(tr);
            }
        }
    } catch (e) {
        console.error("Erro ao carregar perfil:", e);
    }
}

// Inicializador
window.addEventListener('load', () => {
    if(document.body.id === "pagina_perfil") {
        const matricula = sessionStorage.getItem("alunoLogado");
        if(matricula) carregarPerfilAluno(matricula);
        else window.location.href = 'login.html';
    }
});