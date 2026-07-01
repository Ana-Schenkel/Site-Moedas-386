const API_URL_loja = "https://script.google.com/macros/s/AKfycbyr35zQWckx2M17VxIcffnu01L4Aw682CpP8BSCwAoptlWS0nahNAzik07LbWl8VbY/exec"; 

const alunoLogadoLoja = sessionStorage.getItem("alunoLogado") ? sessionStorage.getItem("alunoLogado").toString().trim() : "";
let saldoAtualAluno = 0; 
let nomeAtualAluno = "";
let cachePedidosDoAluno = []; 

window.addEventListener('DOMContentLoaded', async () => {
    if (!alunoLogadoLoja) {
        document.getElementById('saldoExibido').innerText = `🪙 Faça login no Perfil para ver seu saldo e resgatar prêmios`;
        configurarBotoesAcesso(true); 
        return;
    }

    configurarBotoesAcesso(false);

    try {
        const resposta = await fetch(`${API_URL_loja}?aba=${alunoLogadoLoja}`);
        if (!resposta.ok) throw new Error("Erro de resposta vindo da rede Google.");
        
        const dadosAluno = await resposta.json();
        
        if (dadosAluno && dadosAluno.length > 5) {
            nomeAtualAluno = String(dadosAluno[1][0]).trim(); 
            let saldoTexto = String(dadosAluno[5][1]).replace(',', '.').trim();
            saldoAtualAluno = parseFloat(saldoTexto) || 0;
            
            document.getElementById('saldoExibido').innerText = `Olá, ${nomeAtualAluno} | Seu Saldo: 🪙 ${saldoAtualAluno.toFixed(2)} EcoCoins`;
            
            carregarPedidosDoAluno();
        } else {
            document.getElementById('saldoExibido').innerText = `🪙 Erro na leitura estrutural da sua Ficha.`;
        }
    } catch (erro) {
        console.error("Erro na inicialização da loja:", erro);
        document.getElementById('saldoExibido').innerText = `🪙 Modo Offline: Erro ao sincronizar saldo.`;
    }
});

function configurarBotoesAcesso(bloquear) {
    const botoes = document.querySelectorAll('.botao-resgatar');
    botoes.forEach(botao => {
        botao.disabled = bloquear;
        botao.innerText = bloquear ? "Faça Login" : "Resgatar";
        if (bloquear) botao.style.background = "#94a3b8"; 
        else botao.style.background = ""; 
    });
}

// CORRIGIDO: Lendo os índices de coluna corretos da sua planilha
async function carregarPedidosDoAluno() {
    try {
        const resposta = await fetch(`${API_URL_loja}?aba=Pedidos Loja`);
        if (!resposta.ok) throw new Error("Erro ao buscar histórico da loja");
        
        const todosOsPedidos = await resposta.json();
        cachePedidosDoAluno = [];
        
        if (todosOsPedidos && todosOsPedidos.length > 0) {
            const eMatrizPura = Array.isArray(todosOsPedidos[0]);

            if (eMatrizPura) {
                // Formato Matriz
                for (let i = 1; i < todosOsPedidos.length; i++) {
                    const linha = todosOsPedidos[i];
                    if (!linha || linha.length < 5) continue;

                    // Na sua planilha, a Matrícula está na Coluna B (Índice 1)
                    const matPedido = String(linha[1] || "").trim();
                    
                    if (matPedido === alunoLogadoLoja) {
                        cachePedidosDoAluno.push({
                            item: String(linha[3] || "Item"), // Coluna D (Índice 3)
                            valor: parseFloat(String(linha[4] || "0").replace(',', '.')), // Coluna E (Índice 4)
                            status: String(linha[5] || "Pendente") // Coluna F (Índice 5)
                        });
                    }
                }
            } else {
                // Formato JSON
                todosOsPedidos.forEach(pedido => {
                    const matPedido = String(pedido.matricula || pedido["Matrícula"] || "").trim();
                    if (matPedido === alunoLogadoLoja) {
                        cachePedidosDoAluno.push({
                            item: pedido.item || pedido["Item Solicitado"] || "Item",   
                            valor: parseFloat(String(pedido.valor || pedido["Valor (EcoCoins)"] || 0).replace(',', '.')),  
                            status: pedido.status || pedido["Status"] || "Pendente"  
                        });
                    }
                });
            }
        }

        renderizarTabelaPedidos(cachePedidosDoAluno);

    } catch (erro) {
        console.error("Erro ao carregar lista de pedidos:", erro);
        document.getElementById("listaPedidosAluno").innerHTML = `
            <tr><td colspan="3" style="padding: 24px; text-align: center; color: var(--cor-alerta); font-weight: 600;">Não foi possível carregar seu histórico de pedidos.</td></tr>
        `;
    }
}

function renderizarTabelaPedidos(listaDePedidos) {
    const tbody = document.getElementById("listaPedidosAluno");
    if (!tbody) return;
    tbody.innerHTML = ""; 

    if (listaDePedidos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" style="padding:24px; text-align:center; color:var(--text-gray);">Nenhum pedido realizado até o momento.</td></tr>`;
        return;
    }

    listaDePedidos.forEach(pedido => {
        let corFundo = "#fef3c7"; let corTexto = "#d97706"; 
        
        // Mantém as cores certas se o monitor aprovar
        if (pedido.status === "Aprovado") { corFundo = "#dbeafe"; corTexto = "var(--primary-blue)"; } 
        if (pedido.status === "Resgatado") { corFundo = "#dcfce7"; corTexto = "var(--success-green)"; } 

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td style="padding:14px 16px; font-weight:700;">${pedido.item}</td>
            <td style="padding:14px 16px; font-weight:600; color:var(--text-gray);">🪙 ${Number(pedido.valor).toFixed(2)}</td>
            <td style="padding:14px 16px; text-align:center;">
                <span style="background:${corFundo}; color:${corTexto}; padding:6px 14px; border-radius:20px; font-size:0.75rem; font-weight:700; display:inline-block; text-transform:uppercase;">
                    ${pedido.status}
                </span>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function resgatarItem(nomeItem) {
    const precos = { 'Caderno': 30.00, 'Vale Cinema': 50.00, 'Combo Pipoca': 20.00, 'Kit Canetas': 15.00 };
    const precoItem = precos[nomeItem] || 0;

    if (saldoAtualAluno < precoItem) {
        alert(`Saldo insuficiente! Você possui 🪙 ${saldoAtualAluno.toFixed(2)}, mas este item custa 🪙 ${precoItem.toFixed(2)}.`);
        return;
    }
    
    if (!confirm(`Confirmar o envio do pedido de "${nomeItem}" para a loja?`)) return;

    const dadosPedido = {
        "matricula": String(alunoLogadoLoja),
        "nomeAluno": String(nomeAtualAluno), 
        "item": String(nomeItem),
        "valor": precoItem,
        "status": "Pendente" // ENVIANDO "PENDENTE" EXATAMENTE COMO VOCÊ PEDIU
    };

    try {
        await fetch(API_URL_loja, {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify(dadosPedido)
        });
        
        alert(`Sucesso! O pedido de "${nomeItem}" foi enviado e está Pendente.`);
        location.reload(); 
    } catch (erro) {
        console.error("Falha ao registrar pedido via POST:", erro);
        alert("Erro de conexão! O pedido não pôde ser computado na planilha.");
        location.reload();
    }
}