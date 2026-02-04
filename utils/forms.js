
// CPF Validation Helper
function validateCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf == '') return false;
    // Elimina CPFs invalidos conhecidos
    if (cpf.length != 11 ||
        cpf == "00000000000" ||
        cpf == "11111111111" ||
        cpf == "22222222222" ||
        cpf == "33333333333" ||
        cpf == "44444444444" ||
        cpf == "55555555555" ||
        cpf == "66666666666" ||
        cpf == "77777777777" ||
        cpf == "88888888888" ||
        cpf == "99999999999")
        return false;
    // Valida 1o digito
    let add = 0;
    for (let i = 0; i < 9; i++)
        add += parseInt(cpf.charAt(i)) * (10 - i);
    let rev = 11 - (add % 11);
    if (rev == 10 || rev == 11)
        rev = 0;
    if (rev != parseInt(cpf.charAt(9)))
        return false;
    // Valida 2o digito
    add = 0;
    for (let i = 0; i < 10; i++)
        add += parseInt(cpf.charAt(i)) * (11 - i);
    rev = 11 - (add % 11);
    if (rev == 10 || rev == 11)
        rev = 0;
    if (rev != parseInt(cpf.charAt(10)))
        return false;
    return true;
}

// Phone Mask Helper
function maskPhone(value) {
    return value
        .replace(/\D/g, "")
        .replace(/^(\d{2})(\d)/g, "($1) $2")
        .replace(/(\d)(\d{4})$/, "$1-$2");
}

// CPF Mask Helper
function maskCPF(value) {
    return value
        .replace(/\D/g, "")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})/, "$1-$2")
        .replace(/(-\d{2})\d+?$/, "$1");
}

const CNPJ_PIX = "42866413000101";

async function initCheckoutForm({ planType, paymentMethod }) {
    // --- 1. State and City Population ---
    const stateSelect = document.getElementById("state");
    const citySelect = document.getElementById("city");

    if (stateSelect && citySelect) {
        try {
            // Adjust path if necessary. Assuming this script is imported by files 3 levels deep.
            const resp = await fetch("../../../assets/data/cidades.json", { cache: "force-cache" });
            const data = await resp.json();

            const statesBySigla = new Map(
                data.estados.map((e) => [e.sigla, { nome: e.nome, cidades: e.cidades }])
            );

            // Populate States
            const frag = document.createDocumentFragment();
            data.estados.forEach(({ sigla, nome }) => {
                const opt = document.createElement("option");
                opt.value = sigla;
                opt.textContent = `${nome} (${sigla})`;
                frag.appendChild(opt);
            });
            stateSelect.appendChild(frag);

            // Helper to reset cities
            const resetCities = () => {
                citySelect.innerHTML = `<option value="" selected disabled>Selecione a sua Cidade</option>`;
                citySelect.disabled = true;
            };

            // Helper to fill cities
            const fillCities = (sigla) => {
                const state = statesBySigla.get(sigla);
                if (!state) return resetCities();

                const fragCities = document.createDocumentFragment();
                state.cidades.forEach((cidade) => {
                    const opt = document.createElement("option");
                    opt.value = cidade;
                    opt.textContent = cidade;
                    fragCities.appendChild(opt);
                });

                citySelect.innerHTML = `<option value="" selected disabled>Selecione a sua Cidade</option>`;
                citySelect.appendChild(fragCities);
                citySelect.disabled = false;
            };

            resetCities();
            stateSelect.addEventListener("change", (e) => fillCities(e.target.value));

        } catch (error) {
            console.error("Erro ao carregar estados/cidades:", error);
        }
    }

    // --- 2. Input Masks and Validation Listeners ---
    const cpfInput = document.getElementById("cpf");
    if (cpfInput) {
        cpfInput.addEventListener("input", (e) => {
            e.target.value = maskCPF(e.target.value);
        });

        // Optional: Add visual validation on blur
        cpfInput.addEventListener("blur", (e) => {
            const isValid = validateCPF(e.target.value);
            if (!isValid && e.target.value.length > 0) {
                e.target.setCustomValidity("CPF Inválido");
                // You assume there is a small.hint element or similar handling?
                // The existing code has <small class="hint"> </small>
                const hint = e.target.closest('.field')?.querySelector('.hint');
                if (hint) hint.textContent = "CPF Inválido";
                e.target.classList.add('error'); // Assuming error class exists or does nothing harmful
            } else {
                e.target.setCustomValidity("");
                const hint = e.target.closest('.field')?.querySelector('.hint');
                if (hint) hint.textContent = "";
                e.target.classList.remove('error');
            }
        });
    }

    const phoneInput = document.getElementById("telefone");
    if (phoneInput) {
        phoneInput.addEventListener("input", (e) => {
            e.target.value = maskPhone(e.target.value);
        });
        phoneInput.setAttribute("maxlength", "15"); // (11) 91234-5678
    }

    // --- 3. Form Submission ---
    const form = document.getElementById("checkoutForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Validate CPF before submitting
        if (cpfInput) {
            if (!validateCPF(cpfInput.value)) {
                alert("Por favor, insira um CPF válido.");
                cpfInput.focus();
                return;
            }
        }

        // Validate Terms
        const terms = document.getElementById("terms");
        if (terms && !terms.checked) {
            alert("Você precisa aceitar os termos de uso para continuar.");
            return;
        }

        // PIX Copy Logic
        if (paymentMethod === 'PIX') {
            try {
                await navigator.clipboard.writeText(CNPJ_PIX);
            } catch (err) {
                // Fallback
                try {
                    const textarea = document.createElement("textarea");
                    textarea.value = CNPJ_PIX;
                    textarea.setAttribute("readonly", "");
                    textarea.style.position = "fixed";
                    textarea.style.left = "-9999px";
                    document.body.appendChild(textarea);
                    textarea.select();
                    document.execCommand("copy");
                    document.body.removeChild(textarea);
                } catch (e2) {
                    console.warn("Não foi possível copiar o CNPJ automaticamente.", e2);
                }
            }
        }

        // Prepare Data
        const formData = new FormData(form);
        // Construct full plan name, e.g. "Premium - PIX" or just "Premium"
        const fullPlanName = paymentMethod === 'PIX' ? `${planType} - PIX` : planType;
        formData.set("plano", fullPlanName);

        // UI Feedback
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn ? submitBtn.textContent : "Enviar";

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "Enviando...";
        }

        try {
            const res = await fetch("https://redacaoexito1000.com.br/api/send.php", {
                method: "POST",
                body: formData,
            });

            const result = await res.json();

            if (result.status !== "success") {
                alert(result.message || "Não foi possível enviar. Tente novamente.");
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalBtnText;
                }
                return;
            }

            // Success
            if (paymentMethod === 'PIX') {
                window.location.href = "/pages/sucesso/sucesso-pix.html";
            } else {
                window.location.href = "/pages/sucesso/sucesso.html";
            }

        } catch (err) {
            console.error(err);
            alert("Erro de conexão. Tente novamente.");

            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        }
    });
}
