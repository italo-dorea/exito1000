//states and city options
document.addEventListener("DOMContentLoaded", async () => {
  const stateSelect = document.getElementById("state");
  const citySelect = document.getElementById("city");

  if (!stateSelect || !citySelect) return;

  // Carrega o JSON (coloque o arquivo em /assets/data/estados-cidades.json por exemplo)
  const resp = await fetch("../../../assets/data/cidades.json", { cache: "force-cache" });
  const data = await resp.json();

  // Indexa estados por sigla para lookup O(1)
  const statesBySigla = new Map(
    data.estados.map((e) => [e.sigla, { nome: e.nome, cidades: e.cidades }])
  );

  // Renderiza estados (1x)
  {
    const frag = document.createDocumentFragment();
    data.estados.forEach(({ sigla, nome }) => {
      const opt = document.createElement("option");
      opt.value = sigla;
      opt.textContent = `${nome} (${sigla})`;
      frag.appendChild(opt);
    });
    stateSelect.appendChild(frag);
  }

  function resetCities() {
    citySelect.innerHTML = `<option value="" selected disabled>Selecione a sua Cidade</option>`;
    citySelect.disabled = true;
  }

  function fillCities(sigla) {
    const state = statesBySigla.get(sigla);
    if (!state) return resetCities();

    const frag = document.createDocumentFragment();

    state.cidades.forEach((cidade) => {
      const opt = document.createElement("option");
      opt.value = cidade;
      opt.textContent = cidade;
      frag.appendChild(opt);
    });

    citySelect.innerHTML = `<option value="" selected disabled>Selecione a sua Cidade</option>`;
    citySelect.appendChild(frag);
    citySelect.disabled = false;
  }

  resetCities();

  stateSelect.addEventListener("change", (e) => {
    fillCities(e.target.value);
  });
});


//form function
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("checkoutForm");

    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        // Validação manual extra para os termos
        const terms = document.getElementById("terms");
        if (!terms.checked) {
            alert("Você precisa aceitar os termos de uso para continuar.");
            return;
        }

        // Captura todos os dados (incluindo Cidade e Estado selecionados)
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Adiciona informações extras que não estão no form (opcional)
        data.plano = "Diamante";
        data.valorTotal = "R$ 90,00";

        console.group("🚀 Processando Boleto...");
        console.table(data);
        console.groupEnd();

        // Aqui você chamaria sua API de pagamento
        // alert("Dados capturados! Gerando seu boleto...");
        window.location.href = "../../pages/sucesso/sucesso.html";
    });
});
