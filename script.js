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
    `<li>
      ${pessoa.id} - ${pessoa.nome} (${pessoa.idade} anos) 
      <button class="btn-remove" onclick="removerPessoa(${pessoa.id})"><i class="bi bi-trash-fill"></i></button>
    </li>`
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
  const dataInput = document.getElementById("data").value; // capturar a data do formulário

  const pessoa = pessoas.find(p => p.id === pessoaId);
  if (!pessoa) {
    alert("Pessoa não encontrada!");
    return;
  }

  if (pessoa.idade < 18 && tipo === "receita") {
    alert("Menores de idade só podem cadastrar despesas.");
    return;
  }

  const data = dataInput
    ? dataInput.split("-").reverse().join("/") : new Date().toLocaleDateString("pt-BR");

  const novaTransacao = { 
    id: transacaoIdSeq++, 
    descricao, 
    valor, 
    tipo, 
    pessoaId, 
    data // corrigido para usar a variável correta
  };
  transacoes.push(novaTransacao);

  atualizarTransacoesUI();
  atualizarTotais();
  transacaoForm.reset();
});

// atualizar a lista de transações para incluir o botão de remoção
function atualizarTransacoesUI() {
  transacoesLista.innerHTML = transacoes.map(transacao => {
    const pessoa = pessoas.find(p => p.id === transacao.pessoaId);
    return `<li>
              ${transacao.id} - ${transacao.descricao} - R$${transacao.valor.toFixed(2)} (${transacao.tipo}) - ${transacao.data} - ${pessoa.nome}
              <button class="btn-remove" onclick="removerTransacao(${transacao.id})">
                <i class="bi bi-trash-fill"></i>
              </button>
            </li>`;
  }).join("");
}

// função para remover transação
function removerTransacao(id) {
  // filtra as transações removendo a transação com o id fornecido
  transacoes = transacoes.filter(transacao => transacao.id !== id);

  // atualizar a UI das transações e os totais
  atualizarTransacoesUI();
  atualizarTotais();
}

// atualiza os totais de receitas, despesas e saldo
function atualizarTotais() {
  let totalReceitas = 0;
  let totalDespesas = 0;
  let maiorReceita = 0;
  let maiorDespesa = 0;
  let usuarioMaiorDespesa = null;
  let valorMaiorDespesa = 0;

  transacoes.forEach(transacao => {
    if (transacao.tipo === "receita") {
      totalReceitas += transacao.valor;
      if (transacao.valor > maiorReceita) {
        maiorReceita = transacao.valor;
      }
    } else if (transacao.tipo === "despesa") {
      totalDespesas += transacao.valor;
      if (transacao.valor > maiorDespesa) {
        maiorDespesa = transacao.valor;
        // identificar o usuário com maior despesa
        usuarioMaiorDespesa = pessoas.find(pessoa => pessoa.id === transacao.pessoaId).nome;
        valorMaiorDespesa = transacao.valor;
      }
    }
  });

  const saldoTotal = totalReceitas - totalDespesas;

  // atualizar os totais na interface
  document.getElementById("totalReceitas").innerText = totalReceitas.toFixed(2);
  document.getElementById("totalDespesas").innerText = totalDespesas.toFixed(2);
  document.getElementById("saldoTotal").innerText = saldoTotal.toFixed(2);

  // atualizar as maiores transações
  document.getElementById("maiorReceita").innerText = maiorReceita.toFixed(2);
  document.getElementById("maiorDespesa").innerText = maiorDespesa.toFixed(2);
  
  // atualizar o usuário com maior despesa
  document.getElementById("usuarioMaiorDespesa").innerText = usuarioMaiorDespesa || "Nenhum";
  document.getElementById("valorMaiorDespesa").innerText = valorMaiorDespesa.toFixed(2);
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

// alternar o modo noturno
const modoNoturnoBtn = document.getElementById("modoNoturnoBtn");

modoNoturnoBtn.addEventListener("click", () => {
  document.body.classList.toggle("modo-noturno");

  const icone = modoNoturnoBtn.querySelector("i");

  if (document.body.classList.contains("modo-noturno")) {
    // estilo para o modo noturno
    icone.classList.remove("bi-moon");
    icone.classList.add("bi-sun");
    modoNoturnoBtn.style.backgroundColor = "#3a4452"; // fundo escuro
    modoNoturnoBtn.style.color = "#fff"; // texto branco
  } else {
    // estilo para o modo claro
    icone.classList.remove("bi-sun");
    icone.classList.add("bi-moon");
    modoNoturnoBtn.style.backgroundColor = "#fff"; // fundo branco
    modoNoturnoBtn.style.color = "#000"; // ícone preto
  }
});