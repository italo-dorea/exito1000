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

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Validação dos termos
    const terms = document.getElementById("terms");
    if (terms && !terms.checked) {
      alert("Você precisa aceitar os termos de uso para continuar.");
      return;
    }

    // Captura dados do form
    const formData = new FormData(form);

    // Extra enviado para o PHP
    formData.set("plano", "Premium"); // ou "Diamante"

    // Botão submit (evita duplo clique)
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Enviando...";
    }

    try {
      // ✅ URL relativa (melhor prática)
      const res = await fetch("https://redacaoexito1000.com.br/api/send.php", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (result.status !== "success") {
        alert(result.message || "Não foi possível enviar. Tente novamente.");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Gerar Boleto Bancário";
        }
        return;
      }

      // Sucesso
      window.location.href = "/pages/sucesso/sucesso.html";
    } catch (err) {
      console.error(err);
      alert("Erro de conexão. Tente novamente.");

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Gerar Boleto Bancário";
      }
    }
  });
});
