function clickReturn() {
    document.getElementById("btn-voltar-checkout").addEventListener("click", function () {
        window.location.href = "/index.html";
    });
}

//states and city options
document.addEventListener("DOMContentLoaded", async () => {
  const stateSelect = document.getElementById("state");
  const citySelect = document.getElementById("city");

  if (!stateSelect || !citySelect) return;

  // Carrega o JSON (coloque o arquivo em /assets/data/estados-cidades.json por exemplo)
  const resp = await fetch("/assets/data/cidades.json", { cache: "force-cache" });
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

        const data = Object.fromEntries(new FormData(form).entries());

        console.group("✅ Checkout - valores do formulário");
        console.table(data);
        console.log("Objeto completo:", data);
        console.groupEnd();

        alert("Enviado com sucesso!");

        // Se quiser limpar depois:
        // form.reset();
    });
});
