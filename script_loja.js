// ==========================================
// CONFIGURAÇÕES E VARIÁVEIS GLOBAIS DA LOJA
// ==========================================
const alunoLogadoLoja = sessionStorage.getItem("alunoLogado") ? sessionStorage.getItem("alunoLogado").toString().trim() : "";

// URL da Web App gerada após a implantação estável da planilha "Site 386"
const API_URL_loja = "https://script.google.com/macros/s/AKfycbyr35zQWckx2M17VxIcffnu01L4Aw682CpP8BSCwAoptlWS0nahNAzik07LbWl8VbY/exec"; 

let saldoAtualAluno = 0; 
let nomeAtualAluno = "";
let cachePedidosDoAluno = []; 

// Executa automaticamente ao carregar a página
window.addEventListener('DOMContentLoaded', async () => {
    if (!alunoLogadoLoja) {
        document.getElementById('saldoExibido').innerText = `🪙 Faça login para ver seu saldo`;
        return;
    }

    try {
        // 1. Carrega o Saldo Real do Aluno vindo de sua Aba correspondente
        const resposta = await fetch(`${API_URL_loja}?aba=${alunoLogadoLoja}`);
        if (!resposta.ok) throw new Error("Erro de resposta vindo da rede.");
        
        const dadosAluno = await resposta.json();
        
        if (dadosAluno && dadosAluno.length > 5) {
            nomeAtualAluno = String(dadosAluno[1][0]).trim(); 
            
            let saldoTexto = String(dadosAluno[5][1]).replace(',', '.').trim();
            saldoAtualAluno = parseFloat(saldoTexto); 
            
            if (isNaN(saldoAtualAluno)) saldoAtualAluno = 0;
            
            document.getElementById('saldoExibido').innerText = `🪙 ${saldoAtualAluno.toFixed(2)} EcoCoins`;
            
            // 2. Tendo o saldo carregado com sucesso, puxa a lista de pedidos históricos
            carregarPedidosDoAluno();
        } else {
            document.getElementById('saldoExibido').innerText = `🪙 Erro na estrutura dos dados`;
        }
        
    } catch (erro) {
        console.error("Erro ao processar saldo na inicialização:", erro);
        document.getElementById('saldoExibido').innerText = `🪙 Erro ao carregar saldo`;
    }
});

// Busca todas as compras ocorridas na aba "Pedidos Loja" que batem com este aluno
async function carregarPedidosDoAluno() {
    try {
        const resposta = await fetch(`${API_URL_loja}?aba=Pedidos Loja`);
        if (!resposta.ok) throw new Error("Erro ao buscar histórico da loja");
        
        const todosOsPedidos = await resposta.json();
        
        cachePedidosDoAluno = [];
        for (let i = 1; i < todosOsPedidos.length; i++) {
            const matriculaPedido = String(todosOsPedidos[i][1]).trim();
            if (matriculaPedido === alunoLogadoLoja) {
                cachePedidosDoAluno.push({
                    item: todosOsPedidos[i][3],   
                    valor: todosOsPedidos[i][4],  
                    status: todosOsPedidos[i][5]  
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

// Renderiza fisicamente as linhas no HTML
function renderizarTabelaPedidos(listaDePedidos) {
    const tbody = document.getElementById("listaPedidosAluno");
    tbody.innerHTML = ""; 

    if (listaDePedidos.length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="3" style="padding: 24px; text-align: center; color: var(--texto-suave);">Nenhum pedido correspondente encontrado.</td></tr>
        `;
        return;
    }

    listaDePedidos.forEach(pedido => {
        let corFundo = "#fef3c7"; let corTexto = "#d97706"; // Pendente (Amarelo)
        if (pedido.status === "Aprovado") { corFundo = "#dbeafe"; corTexto = "var(--cor-primaria)"; } 
        if (pedido.status === "Resgatado") { corFundo = "#dcfce7"; corTexto = "var(--cor-sucesso)"; } 

        const tr = document.createElement("tr");
        tr.style.borderBottom = "1px solid var(--cor-borda)";
        tr.innerHTML = `
            <td style="padding: 14px 16px; font-weight: 700; color: var(--texto-principal);">${pedido.item}</td>
            <td style="padding: 14px 16px; font-weight: 600; color: var(--texto-suave);">🪙 ${Number(pedido.valor).toFixed(2)}</td>
            <td style="padding: 14px 16px; text-align: center;">
                <span style="background: ${corFundo}; color: ${corTexto}; padding: 6px 14px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; display: inline-block; text-transform: uppercase;">
                    ${pedido.status}
                </span>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Filtro por Status acionado pelo Select
function filtrarPedidosPorStatus() {
    const statusSelecionado = document.getElementById("filtroStatusPedido").value;
    
    if (statusSelecionado === "todos") {
        renderizarTabelaPedidos(cachePedidosDoAluno);
    } else {
        const pedidosFiltrados = cachePedidosDoAluno.filter(pedido => pedido.status === statusSelecionado);
        renderizarTabelaPedidos(pedidosFiltrados);
    }
}

// Dispara uma solicitação POST criando uma linha pendente na planilha
async function resgatarItem(nomeItem) {
    if (!alunoLogadoLoja) {
        alert("Você precisa estar logado para resgatar itens!");
        window.location.href = 'login.html';
        return;
    }

    const precos = {
        'Caderno': 30.00,
        'Vale Cinema': 50.00,
        'Combo Pipoca': 20.00,
        'Kit Canetas': 15.00
    };

    const precoItem = precos[nomeItem] || 0;

    if (saldoAtualAluno < precoItem) {
        alert(`Saldo insuficiente! Você tem 🪙 ${saldoAtualAluno.toFixed(2)} EcoCoins, mas o item custa 🪙 ${precoItem.toFixed(2)}.`);
        return;
    }
    
    if (!confirm(`Deseja realmente trocar 🪙 ${precoItem.toFixed(2)} EcoCoins por: ${nomeItem}?`)) {
        return;
    }

    const dadosPedido = {
        "acao": "novoPedido",
        "matricula": String(alunoLogadoLoja),
        "nome": String(nomeAtualAluno), 
        "item": String(nomeItem)
    };

    try {
        const resposta = await fetch(API_URL_loja, {
            method: "POST",
            headers: {
                "Content-Type": "text/plain"
            },
            body: JSON.stringify(dadosPedido)
        });
        
        const resultado = await resposta.text();

        if (resultado.trim() === "Pedido Registrado com Sucesso") {
            alert(`Sucesso! Pedido de "${nomeItem}" enviado.\nAcompanhe o status no painel inferior!`);
            location.reload(); 
        } else {
            alert("Resposta inesperada do servidor: " + resultado);
        }
    } catch (erro) {
        console.error("Falha crítica ao tentar enviar o POST do pedido:", erro);
        alert("Erro de conexão com a planilha. O pedido não pôde ser salvo.");
    }
}