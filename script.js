let pessoas = [];
let transacoes = [];
let pessoaIdSeq = 1;
let transacaoIdSeq = 1;
let transacaoEditando = null;  // variável para armazenar a transação que está sendo editada

const pessoaForm = document.getElementById("pessoaForm");
const transacaoForm = document.getElementById("transacaoForm");
const pessoasLista = document.getElementById("pessoasLista");
const transacoesLista = document.getElementById("transacoesLista");
const pessoaIdSelect = document.getElementById("pessoaId");

let totalReceitas = 0;
let totalDespesas = 0;
let saldoTotal = 0;
let maiorReceita = 0;
let maiorDespesa = 0;
let usuarioMaiorDespesa = null;
let valorMaiorDespesa = 0;

document.addEventListener("DOMContentLoaded", function () {
  atualizarResultados();
});

// função para formatar o valor em formato de moeda brasileira (R$ 2.500,90)
function formatarValorReal(valor) {
  if (isNaN(valor)) return "R$ 0,00"; // Caso o valor não seja um número, retorna R$ 0,00

  return valor.toLocaleString("pt-BR", { 
    style: "currency", 
    currency: "BRL" 
  });
}

function atualizarResultados() {
  const results = [
    { titulo: "Total de Receitas", valor: formatarValorReal(totalReceitas), icon: "bi bi-graph-up-arrow" },
    { titulo: "Total de Despesas", valor: formatarValorReal(totalDespesas), icon: "bi bi-graph-down-arrow" },
    { titulo: "Saldo Total", valor: formatarValorReal(saldoTotal), icon: "bi-currency-dollar" },
    { titulo: "Maior Receita", valor: maiorReceita > 0 ? formatarValorReal(maiorReceita) : "R$ 0,00", icon: "bi-arrow-up-circle" },
    { titulo: "Maior Despesa", valor: maiorDespesa > 0 ? formatarValorReal(maiorDespesa) : "R$ 0,00", icon: "bi-arrow-down-circle" },
    {
      titulo: "Quem teve mais despesas",
      valor: usuarioMaiorDespesa ? `${usuarioMaiorDespesa}<br>${formatarValorReal(valorMaiorDespesa)}` : "N/A",
      icon: "bi-person-circle"
    }
  ];

  const resultsContainer = document.getElementById("results");
  resultsContainer.innerHTML = results.map(result => `
    <div class="result-box">
      <div class="result-header">
        <i class="bi ${result.icon}"></i>
        <h4>${result.titulo}</h4>
      </div>
      <p>${result.valor}</p>
    </div>
  `).join("");
}

// função para formatar automaticamente o valor enquanto o usuário digita
const inputValor = document.getElementById("valor");
inputValor.addEventListener("input", (e) => {
  let valor = e.target.value;
  valor = valor.replace(/\D/g, ""); // Remove qualquer caractere que não seja número
  valor = (parseInt(valor) / 100).toFixed(2); // Divide por 100 para criar o formato decimal
  valor = valor.replace(".", ","); // Substitui ponto por vírgula
  e.target.value = valor.replace(/\B(?=(\d{3})+(?!\d))/g, "."); // Adiciona os separadores de milhar
});

// zerar o valor ao clicar no input
inputValor.addEventListener("focus", () => {
  inputValor.value = "";
});

// cadastrar usuário
pessoaForm.addEventListener("submit", (e) => {
  e.preventDefault();
  
  const nome = document.getElementById("nome").value;
  const idade = parseInt(document.getElementById("idade").value);

  // cria novo usuário com id único
  const novaPessoa = { id: pessoaIdSeq++, nome, idade };
  pessoas.push(novaPessoa);

  atualizarPessoasUI();       // atualiza a lista
  atualizarSelectPessoas();   // atualiza o dropdown de pessoas no formulário de transações

  pessoaForm.reset();
});

// atualizar a lista de pessoas
function atualizarPessoasUI() {
  pessoasLista.innerHTML = pessoas.map(pessoa => 
    `<li>
      ${pessoa.id} - ${pessoa.nome} (${pessoa.idade} anos) 
      <button class="btn-remove" onclick="removerPessoa(${pessoa.id})"><i class="bi bi-trash-fill"></i></button>
    </li>`).join("");
}

// atualizar select
function atualizarSelectPessoas() {
  pessoaIdSelect.innerHTML = '<option value="">Selecione uma Pessoa</option>' +
    pessoas.map(pessoa => 
      `<option value="${pessoa.id}">${pessoa.nome} - ID: ${pessoa.id}</option>`
    ).join("");
}

// cadastrar ou editar transação
transacaoForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const descricao = document.getElementById("descricao").value;
  const valorInput = document.getElementById("valor").value;

  // converte o valor de volta para número, tratando a vírgula corretamente
  let valor = parseFloat(valorInput.replace(/\./g, '').replace(',', '.')); 

  if (isNaN(valor)) {
    alert("Por favor, insira um valor válido.");
    return;
  }

  const tipo = document.getElementById("tipo").value;
  const pessoaId = parseInt(document.getElementById("pessoaId").value);
  const dataInput = document.getElementById("data").value;

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

  // se estamos editando uma transação
  if (transacaoEditando) {
    // atualiza os dados da transação editada
    transacaoEditando.descricao = descricao;
    transacaoEditando.valor = valor;  // atualiza o valor com a conversão correta
    transacaoEditando.tipo = tipo;
    transacaoEditando.pessoaId = pessoaId;
    transacaoEditando.data = data;

    transacaoEditando = null;  // limpa a variável após editar
    document.getElementById("btn-transacao").textContent = "Adicionar";  // volta o texto do botão para "Adicionar"
  } else {
    // adiciona uma nova transação
    const novaTransacao = { 
      id: transacaoIdSeq++, 
      descricao, 
      valor, 
      tipo, 
      pessoaId, 
      data 
    };
    transacoes.push(novaTransacao);
  }

  atualizarTransacoesUI();
  atualizarTotais();
  transacaoForm.reset();
});

// editar transação
function editarTransacao(id) {
  // encontra a transação pelo ID
  const transacao = transacoes.find(t => t.id === id);
  
  if (transacao) {
    // preenche o formulário com os dados da transação
    document.getElementById("descricao").value = transacao.descricao;

    // exibir o valor no formato correto para edição, sem causar erro
    // formatar o valor com ponto como separador de milhar e vírgula como separador decimal
    const valorFormatado = formatarValorParaInput(transacao.valor);
    document.getElementById("valor").value = valorFormatado;

    document.getElementById("tipo").value = transacao.tipo;
    document.getElementById("pessoaId").value = transacao.pessoaId;
    document.getElementById("data").value = transacao.data.split("/").reverse().join("-");

    // define a transação como sendo a que está sendo editada
    transacaoEditando = transacao;
    document.getElementById("btn-transacao").textContent = "Atualizar";  // altera o texto do botão para "Atualizar"
  }
}

// função para formatar o valor corretamente ao exibir no input (com ponto e vírgula)
function formatarValorParaInput(valor) {
  return valor.toLocaleString("pt-BR", { style: "decimal", minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// atualizar a lista de transações para incluir o botão de remoção e edição
function atualizarTransacoesUI() {
  transacoesLista.innerHTML = transacoes.map(transacao => {
    const pessoa = pessoas.find(p => p.id === transacao.pessoaId);
    return `<li>
      ${transacao.id} - ${transacao.descricao} - ${formatarValorReal(transacao.valor)} (${transacao.tipo}) - ${transacao.data} - ${pessoa.nome}
      <button class="btn-remove" onclick="removerTransacao(${transacao.id})">
        <i class="bi bi-trash-fill"></i>
      </button>
      <button class="btn-edit" onclick="editarTransacao(${transacao.id})">
        <i class="bi bi-pencil-fill"></i>
      </button>
    </li>`;
  }).join("");
}

// faunção para remover transação
function removerTransacao(id) {
  // filtra as transações removendo a transação com o id fornecido
  transacoes = transacoes.filter(transacao => transacao.id !== id);

  // atualiza a UI das transações e os totais
  atualizarTransacoesUI();
  atualizarTotais();
}

// atualiza os totais de receitas, despesas e saldo
function atualizarTotais() {
  totalReceitas = 0;
  totalDespesas = 0;
  maiorReceita = 0;
  maiorDespesa = 0;
  usuarioMaiorDespesa = null;
  valorMaiorDespesa = 0;

  // objeto para armazenar as despesas totais de cada pessoa
  const despesasPorPessoa = {};

  transacoes.forEach(transacao => {
    if (transacao.tipo === "receita") {
      totalReceitas += transacao.valor;
      if (transacao.valor > maiorReceita) {
        maiorReceita = transacao.valor;
      }
    } else {
      totalDespesas += transacao.valor;
      if (transacao.valor > maiorDespesa) {
        maiorDespesa = transacao.valor;
        const pessoa = pessoas.find(p => p.id === transacao.pessoaId);
        usuarioMaiorDespesa = pessoa ? pessoa.nome : "Desconhecido";
        valorMaiorDespesa = maiorDespesa;
      }

      // acumula o total de despesas por pessoa
      if (!despesasPorPessoa[transacao.pessoaId]) {
        despesasPorPessoa[transacao.pessoaId] = 0;
      }
      despesasPorPessoa[transacao.pessoaId] += transacao.valor;
    }
  });

  // agora, verifica quem teve o maior total de despesas
  let maiorDespesaTotal = 0;
  let pessoaMaiorDespesaTotal = null;
  for (let pessoaId in despesasPorPessoa) {
    if (despesasPorPessoa[pessoaId] > maiorDespesaTotal) {
      maiorDespesaTotal = despesasPorPessoa[pessoaId];
      pessoaMaiorDespesaTotal = pessoas.find(p => p.id === parseInt(pessoaId)).nome;
    }
  }

  // atualiza o valor da pessoa com maior despesa total
  usuarioMaiorDespesa = pessoaMaiorDespesaTotal;
  valorMaiorDespesa = maiorDespesaTotal;

  saldoTotal = totalReceitas - totalDespesas;

  // atualizar os resultados com os valores formatados corretamente
  const results = [
    { titulo: "Total de Receitas", valor: formatarValorReal(totalReceitas), icon: "bi bi-graph-up-arrow" },
    { titulo: "Total de Despesas", valor: formatarValorReal(totalDespesas), icon: "bi bi-graph-down-arrow" },
    { titulo: "Saldo Total", valor: formatarValorReal(saldoTotal), icon: "bi-currency-dollar" },
    { titulo: "Maior Receita", valor: maiorReceita > 0 ? formatarValorReal(maiorReceita) : "R$ 0,00", icon: "bi-arrow-up-circle" },
    { titulo: "Maior Despesa", valor: maiorDespesa > 0 ? formatarValorReal(maiorDespesa) : "R$ 0,00", icon: "bi-arrow-down-circle" },
    {
      titulo: "Quem teve mais despesas",
      valor: usuarioMaiorDespesa ? `${usuarioMaiorDespesa} - ${formatarValorReal(valorMaiorDespesa)}` : "N/A",
      icon: "bi-person-circle"
    }
  ];

  const resultsContainer = document.getElementById("results");
  resultsContainer.innerHTML = results.map(result => `
    <div class="result-box">
      <div class="result-header">
        <i class="bi ${result.icon}"></i>
        <h4>${result.titulo}</h4>
      </div>
      <p>${result.valor}</p>
    </div>
  `).join("");
}

// remover usuário e suas transações
function removerPessoa(id) {
  // filtra o usuário removido
  pessoas = pessoas.filter(pessoa => pessoa.id !== id);

  // remove transações associadas ao usuário deletado
  transacoes = transacoes.filter(transacao => transacao.pessoaId !== id);

  // atualiza interfaces
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