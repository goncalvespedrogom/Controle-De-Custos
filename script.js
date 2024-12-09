let pessoas = [];
let transacoes = [];
let pessoaIdSeq = 1;
let transacaoIdSeq = 1;

const pessoaForm = document.getElementById("pessoaForm");
const transacaoForm = document.getElementById("transacaoForm");
const pessoasLista = document.getElementById("pessoasLista");
const transacoesLista = document.getElementById("transacoesLista");
const pessoaIdSelect = document.getElementById("pessoaId");

// cadastrar usuário
pessoaForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const nome = document.getElementById("nome").value;
    const idade = parseInt(document.getElementById("idade").value);
  
    // cria novo usuário com id único
    const novaPessoa = { id: pessoaIdSeq++, nome, idade };
    pessoas.push(novaPessoa);
  
    atualizarPessoasUI();       // atualizar a lista
    atualizarSelectPessoas();   // atualizar o dropdown de pessoas no formulário de transações
  
    pessoaForm.reset();
  });
  
  // atualizar a lista de pessoas
  function atualizarPessoasUI() {
    pessoasLista.innerHTML = pessoas.map(pessoa => 
      `<li>${pessoa.id} - ${pessoa.nome} (${pessoa.idade} anos)</li>`
    ).join("");
  }
  
  // atualizar select
  function atualizarSelectPessoas() {
    pessoaIdSelect.innerHTML = '<option value="">Selecione uma Pessoa</option>' +
      pessoas.map(pessoa => 
        `<option value="${pessoa.id}">${pessoa.nome} - ID: ${pessoa.id}</option>`
      ).join("");
  }
  
// cadastrar transação
transacaoForm.addEventListener("submit", (e) => {
    e.preventDefault();
  
    const descricao = document.getElementById("descricao").value;
    const valor = parseFloat(document.getElementById("valor").value);
    const tipo = document.getElementById("tipo").value;
    const pessoaId = parseInt(document.getElementById("pessoaId").value);
  
    const pessoa = pessoas.find(p => p.id === pessoaId);
    if (!pessoa) {
      alert("Pessoa não encontrada!");
      return;
    }
  
    if (pessoa.idade < 18 && tipo === "receita") {
      alert("Menores de idade só podem cadastrar despesas.");
      return;
    }
  
    const novaTransacao = { id: transacaoIdSeq++, descricao, valor, tipo, pessoaId };
    transacoes.push(novaTransacao);
  
    atualizarTransacoesUI();
    atualizarTotais();
    transacaoForm.reset();
  });

// atualizar lista de transações
function atualizarTransacoesUI() {
  transacoesLista.innerHTML = transacoes.map(transacao => {
    const pessoa = pessoas.find(p => p.id === transacao.pessoaId);
    return `<li>${transacao.id} - ${transacao.descricao} - R$${transacao.valor.toFixed(2)} (${transacao.tipo}) - ${pessoa.nome}</li>`;
  }).join("");
}

function atualizarTotais() {
    let totalReceitas = 0;
    let totalDespesas = 0;
  
    transacoes.forEach(transacao => {
      if (transacao.tipo === "receita") {
        totalReceitas += transacao.valor;
      } else if (transacao.tipo === "despesa") {
        totalDespesas += transacao.valor;
      }
    });
  
    const saldoTotal = totalReceitas - totalDespesas;
  
    document.getElementById("totalReceitas").innerText = totalReceitas.toFixed(2);
    document.getElementById("totalDespesas").innerText = totalDespesas.toFixed(2);
    document.getElementById("saldoTotal").innerText = saldoTotal.toFixed(2);
  }

  // remover usuário e suas transações
function removerPessoa(id) {
    // filtrar o usuário removido
    pessoas = pessoas.filter(pessoa => pessoa.id !== id);
  
    // remover transações associados ao usuário deletado
    transacoes = transacoes.filter(transacao => transacao.pessoaId !== id);
  
    // atualizar interfaces
    atualizarPessoasUI();
    atualizarSelectPessoas();
    atualizarTransacoesUI();
    atualizarTotais();
  }

  function atualizarPessoasUI() {
    pessoasLista.innerHTML = pessoas.map(pessoa => 
      `<li>
        ${pessoa.id} - ${pessoa.nome} (${pessoa.idade} anos) 
        <button onclick="removerPessoa(${pessoa.id})">Remover</button>
      </li>`
    ).join("");
  }

  // alternar o modo noturno
const modoNoturnoBtn = document.getElementById("modoNoturnoBtn");

modoNoturnoBtn.addEventListener("click", () => {
  // alternar a classe "modo-noturno" no body
  document.body.classList.toggle("modo-noturno");

  // atualizar o texto do botão do modo noturno
  if (document.body.classList.contains("modo-noturno")) {
    modoNoturnoBtn.innerText = "Modo Claro";
  } else {
    modoNoturnoBtn.innerText = "Modo Noturno";
  }
});
