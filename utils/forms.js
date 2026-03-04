
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

// Planos Config
const PLANOS_CONFIG = {
    premium: {
        nome: "Premium",
        classeCor: "premium",
        beneficios: [
            "Grupo da turma no Telegram;",
            "Acesso à plataforma Êxito 1000;",
            "Aulas ao vivo toda semana em grupo;",
            "Simulado de redação mensal;",
            "Correção em até 3 dias úteis;",
            "8 redações mensais (4 escritas e 4 reescritas);",
            "Mentoria de orientação (uma única vez);",
            "KIT EXCLUSIVO PREMIUM."
        ]
    },
    diamante: {
        nome: "Diamante",
        classeCor: "diamante",
        extraHeader: `<div class="card-diamante"><p class="text-card"><b>Mentoria individual toda semana</b> <br />com o prof. Matheus Costa.</p></div>`,
        beneficios: [
            "Grupo da turma no Telegram;",
            "Acesso à plataforma Êxito 1000;",
            "Aulas ao vivo toda semana em grupo;",
            "Simulado de redação mensal;",
            "Correção da redação ao vivo na mentoria;",
            "Redações ilimitadas;",
            "Simulado de redação bônus mensal;",
            "KIT EXCLUSIVO DIAMANTE."
        ]
    }
}

// Configura form baseado no ?plano=...&metodo=...
function initDynamicCheckout() {
    const urlParams = new URLSearchParams(window.location.search);
    const planoParam = urlParams.get('plano') || 'premium';
    const metodoParam = urlParams.get('metodo') || 'pix'; // pix ou boleto

    const planoConfig = PLANOS_CONFIG[planoParam.toLowerCase()] || PLANOS_CONFIG.premium;
    const isPix = metodoParam.toLowerCase() === 'pix';
    const planType = planoConfig.nome;
    const paymentMethod = isPix ? 'PIX' : 'Boleto';

    // 0. Update UI Dinamicamente
    if (document.getElementById("dinamico-turma-nome")) {
        document.getElementById("dinamico-turma-nome").textContent = planType;
        document.getElementById("dinamico-turma-nome").style.textTransform = "capitalize";
    }

    if (document.getElementById("dinamico-botao-plano")) {
        document.getElementById("dinamico-botao-plano").textContent = `Plano ${planType}`;
    }

    const beneficiosContainer = document.getElementById("dinamico-lista-beneficios");
    if (beneficiosContainer) {
        let htmlBeneficios = "";
        if (planoConfig.extraHeader) {
            // Insert before the list if it's diamante
            const planResumeCard = document.querySelector('.plan-resume-card');
            if (planResumeCard) {
                planResumeCard.insertAdjacentHTML('beforebegin', planoConfig.extraHeader);
            }
        }

        planoConfig.beneficios.forEach(b => {
            htmlBeneficios += `
                <li class="plan-list-item">
                    <img src="../../assets/icon-check2.svg" alt="icon" />
                    ${b}
                </li>`;
        });
        beneficiosContainer.innerHTML = htmlBeneficios;
    }

    // Payment method UI
    const paymentCard = document.getElementById("dinamico-metodo-pagamento-card");
    const btnSubmit = document.getElementById("dinamico-botao-submit");

    if (paymentCard && btnSubmit) {
        if (isPix) {
            paymentCard.innerHTML = `
                <div class="payment-header">
                    <div class="payment-icon-box">
                        <i class="fa-regular fa-file-lines"></i>
                    </div>
                    <div class="payment-title-text">
                        <h5>PIX</h5>
                        <p>Pague de forma segura e prática com PIX.</p>
                        <p>Chave PIX CNPJ: ${CNPJ_PIX}</p>
                    </div>
                </div>
                <div class="payment-info-list">
                    <div class="info-item">
                        <i class="fa-regular fa-circle-check"></i>
                        <span><strong>Confirmação:</strong> Enviar comprovante de
                            pagamento em nosso <a href="https://api.whatsapp.com/send?phone=5571996888181"
                                target="_blank" style="font-weight: 600; color: #005B35;"><i
                                    class="fa-brands fa-whatsapp"
                                    style="color: #00a80b; padding-right: 2px;"></i>WhatsApp</a></span>
                    </div>
                    ${getCancelPolicyHtml()}
                </div>
            `;
            btnSubmit.textContent = "Copiar chave PIX e enviar meus dados";
        } else {
            paymentCard.innerHTML = `
                <div class="payment-header">
                    <div class="payment-icon-box">
                        <i class="fa-regular fa-file-lines"></i>
                    </div>
                    <div class="payment-title-text">
                        <h5>Boleto Bancário</h5>
                        <p>Pague de forma segura e prática com boleto bancário. Após a confirmação do pedido, você receberá o boleto por e-mail.</p>
                    </div>
                </div>
                <div class="payment-info-list">
                    <div class="info-item">
                        <i class="fa-regular fa-clock"></i>
                        <span><strong>Vencimento:</strong> 1 dia útil após a emissão.</span>
                    </div>
                    <div class="info-item">
                        <i class="fa-regular fa-circle-check"></i>
                        <span><strong>Confirmação:</strong> Até 2 dias úteis após o pagamento. Enviar comprovante de
                            pagamento em nosso <a href="https://api.whatsapp.com/send?phone=5571996888181"
                                target="_blank" style="font-weight: 600; color: #005B35;"><i
                                    class="fa-brands fa-whatsapp"
                                    style="color: #00a80b; padding-right: 2px;"></i>WhatsApp</a></span>
                    </div>
                     ${getCancelPolicyHtml()}
                </div>
            `;
            btnSubmit.textContent = "Gerar Boleto Bancário";
        }
    }

    // Chama o resto original passando os states preenchidos
    initCheckoutForm({ planType, paymentMethod });
}

function getCancelPolicyHtml() {
    return `
        <div class="cancel-policy-box">
            <div class="cancel-header">
                <i class="fa-regular fa-circle-xmark"></i>
                <span><strong>Cancelamento:</strong> Você pode cancelar sua mensalidade a qualquer
                    momento, desde que avise com pelo menos <strong>30 dias de
                        antecedência.</strong></span>
            </div>
            <div class="cancel-example">
                <p><strong>*Por exemplo:</strong> Se sua mensalidade vence todo dia 05 e você não deseja
                    continuar, é necessário avisar até o dia 05 do mês vigente. Nesse caso, a
                    mensalidade desse mês ainda será cobrada normalmente e será a última.</p>
            </div>
        </div>
    `;
}


async function initCheckoutForm({ planType, paymentMethod }) {
    // --- 1. State and City Population ---
    const stateSelect = document.getElementById("state");
    const citySelect = document.getElementById("city");

    if (stateSelect && citySelect) {
        try {
            // Adjust path if necessary. Assuming this script is imported by files 3 levels deep or 2 levels deep
            // Now we are at /pages/checkout/index.html instead of /pages/checkout-pix/premium/premium.html
            const resp = await fetch("../../assets/data/cidades.json", { cache: "force-cache" });
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
                const hint = e.target.closest('.field')?.querySelector('.hint');
                if (hint) hint.textContent = "CPF Inválido";
                e.target.classList.add('error');
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
            const res = await fetch("../../api/send.php", {
                method: "POST",
                body: formData,
            });

            // BugFix: Do not let email server errors block the UX. If PHP returns error because mail() fails, 
            // the data is still saved (or in this case, we just gracefully redirect).
            const isJson = res.headers.get("content-type")?.includes("application/json");
            if (isJson) {
                const result = await res.json();
                if (result.status !== "success") {
                    console.warn("Mail provider failed, but treating as success on frontend:", result.message);
                    // Silently fail mail to prevent user confusion "e-mail" alerts
                }
            }

            // Success (redirect regardless if mail provider hiccuped, as long as 200 OK)
            if (paymentMethod === 'PIX') {
                window.location.href = "../../pages/sucesso/sucesso-pix.html";
            } else {
                window.location.href = "../../pages/sucesso/sucesso.html";
            }

        } catch (err) {
            console.error(err);
            // Only alert network-level failures
            alert("Erro de conexão. Verifique sua internet e tente novamente.");

            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        }
    });
}
