/**
 * planos.js — Engine de renderização dinâmica para Diamante & Premium
 */

'use strict';

/* ── Configuração ────────────────────────────────────────────────────── */

const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbxfqMozdsny8XF1KhCVOTug4tJSmypJYybh6CJomAVeF1e2tFLsJjiOMmF5Faa0hXnvAQ/exec';

// Caminho do ícone a partir da pasta /planos/
const ICON_CHECK = '../assets/icon-check2.svg';

/* ── Dados das turmas ────────────────────────────────────────────────── */

const TURMAS_SIMPLES = {
  enem: {
    nome: 'ENEM',
    tipo: 'enem',
    inicio: '9 de julho de 2026',
    horario: 'Toda quinta-feira, às 20h',
    mensalidades: 5,
    primeiraParcela: '5 de julho de 2026',
    ultimaParcela:  '5 de novembro de 2026',
    taxaAdesao: null,
    descricao: '',
    infos: [],
  },
  bahiana: {
    nome: 'Bahiana (EBMSP)',
    tipo: 'bahiana',
    inicio: '15 de julho de 2026',
    horario: 'Toda quarta-feira, às 20h',
    mensalidades: 6,
    primeiraParcela: '5 de julho de 2026',
    ultimaParcela:  '5 de dezembro de 2026',
    taxaAdesao: null,
    descricao: '',
    infos: [],
  },
  uneb_uesb: {
    nome: 'UNEB & UESB',
    tipo: 'geral',
    inicio: '28 de julho de 2026',
    horario: 'Toda terça-feira, às 20h',
    mensalidades: 6,
    primeiraParcela: '5 de agosto de 2026',
    ultimaParcela:  '5 de janeiro de 2027',
    taxaAdesao: null,
    prazoAdesao: '28 de julho de 2026',
    semKit: true,
    descricao: '',
    infos: [],
  },
};

/**
 * Combos: mensalidade integral da principal + 40% das demais.
 */
const TURMAS_COMBO = {
  enem_bahiana: {
    nome: 'ENEM + Bahiana (EBMSP)',
    tipo: 'combo',
    turmas: ['enem', 'bahiana'],
  },
  enem_uneb_uesb: {
    nome: 'ENEM + UNEB & UESB',
    tipo: 'combo',
    turmas: ['enem', 'uneb_uesb'],
  },
  bahiana_uneb_uesb: {
    nome: 'Bahiana (EBMSP) + UNEB & UESB',
    tipo: 'combo',
    turmas: ['bahiana', 'uneb_uesb'],
  },
  enem_bahiana_uneb_uesb: {
    nome: 'ENEM + Bahiana (EBMSP) + UNEB & UESB',
    tipo: 'combo',
    turmas: ['enem', 'bahiana', 'uneb_uesb'],
  },
};

const TURMAS_DATA = { ...TURMAS_SIMPLES, ...TURMAS_COMBO };

/**
 * Benefícios de cada plano exibidos no painel lateral
 */
const PLANOS_BENEFICIOS = {
  premium: [
    'Grupo da turma no Telegram',
    'Suporte individual com o corretor via Telegram',
    'Acesso à plataforma Êxito 1000',
    'Aulas ao vivo toda semana em grupo',
    'Simulado de redação mensal',
    'Correção em até 3 dias úteis',
    '8 redações mensais (4 escritas e 4 reescritas)',
    'Mentoria de orientação',
    'Kit de materiais físicos entregue na sua casa',
  ],
  diamante: [
    'Mentoria individual semanal com prof. Matheus Costa',
    'Envio de redações ilimitadas',
    'Correção de redação ao vivo durante a mentoria',
    'Mentoria individual agendada após ingresso',
    'Camisa exclusiva do curso',
    'Contempla todos os benefícios do Plano Premium',
  ],
};

/* ── Helpers ─────────────────────────────────────────────────────────── */

function validateCPF(cpf) {
  cpf = cpf.replace(/[^\d]+/g, '');
  if (!cpf || cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  let s = 0;
  for (let i = 0; i < 9; i++) s += parseInt(cpf[i]) * (10 - i);
  let r = 11 - (s % 11); if (r >= 10) r = 0;
  if (r !== parseInt(cpf[9])) return false;
  s = 0;
  for (let i = 0; i < 10; i++) s += parseInt(cpf[i]) * (11 - i);
  r = 11 - (s % 11); if (r >= 10) r = 0;
  return r === parseInt(cpf[10]);
}

function maskPhone(v) {
  return v.replace(/\D/g, '').replace(/^(\d{2})(\d)/g, '($1) $2').replace(/(\d)(\d{4})$/, '$1-$2');
}

function maskCPF(v) {
  return v.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1');
}

function getTipoBadgeClass(tipo) {
  return `panel-tipo-badge--${{ enem: 'enem', bahiana: 'bahiana', geral: 'geral', combo: 'combo' }[tipo] || 'geral'}`;
}

function getTipoLabel(tipo) {
  return { enem: 'ENEM', bahiana: 'Bahiana', geral: 'UNEB/UESB', combo: 'Multi-turma' }[tipo] || tipo;
}

/* ── Renderização do painel ──────────────────────────────────────────── */

/** Lista de benefícios com icon-check2.svg (estilo do site) */
function renderBeneficiosList(items) {
  return items.map(b => `
    <li style="display:flex;align-items:flex-start;gap:8px;list-style:none;padding:0;font-size:0.85rem;color:#4B5563;line-height:1.5;">
      <img src="${ICON_CHECK}" alt="" aria-hidden="true" style="width:18px;height:18px;flex-shrink:0;margin-top:1px;" />
      ${b}
    </li>`).join('');
}

/** Lista de infos da turma com icon-check2.svg */
function renderInfoList(items) {
  return items.map(info => `
    <li style="display:flex;align-items:flex-start;gap:8px;list-style:none;padding:0;font-size:0.85rem;color:#4B5563;line-height:1.5;">
      <img src="${ICON_CHECK}" alt="" aria-hidden="true" style="width:18px;height:18px;flex-shrink:0;margin-top:1px;" />
      ${info}
    </li>`).join('');
}

function renderPanelEmpty(panel) {
  panel.className = 'info-panel';
  panel.innerHTML = `
    <div class="info-panel-empty">
      <i class="fa-regular fa-rectangle-list" aria-hidden="true"></i>
      <p>Selecione uma turma acima para ver as informações do seu plano.</p>
    </div>`;
}

function renderPanelSingle(panel, turmaId, planoTipo) {
  const turma = TURMAS_SIMPLES[turmaId];
  if (!turma) return renderPanelEmpty(panel);

  panel.className = `info-panel info-panel--${turma.tipo}`;

  const planChipClass = planoTipo === 'diamante' ? 'plan-type-chip--diamante' : 'plan-type-chip--premium';
  const planChipIcon = planoTipo === 'diamante' ? 'fa-gem' : 'fa-star';

  // Para UNEB & UESB: substitui item de kit físico por material virtual
  const KIT_ITEM = 'Kit de materiais físicos entregue na sua casa';
  const KIT_SUBSTITUTO = 'Material de apoio virtual toda semana';
  const beneficios = (PLANOS_BENEFICIOS[planoTipo] || []).map(b =>
    turma.semKit && b === KIT_ITEM ? KIT_SUBSTITUTO : b
  );

  panel.innerHTML = `
    <div class="panel-header">
      <div class="panel-header-top">
        <p class="panel-turma-nome">${turma.nome}</p>
        <span class="panel-tipo-badge ${getTipoBadgeClass(turma.tipo)}">${getTipoLabel(turma.tipo)}</span>
      </div>
      <p class="panel-horario">
        <i class="fa-regular fa-clock" aria-hidden="true"></i>
        ${turma.horario}
      </p>
      <p class="panel-inicio">
        <i class="fa-regular fa-calendar" aria-hidden="true"></i>
        Início: <strong>${turma.inicio}</strong>
      </p>
    </div>

    <div class="panel-body">
      <span class="plan-type-chip ${planChipClass}" style="display:inline-flex;margin-bottom:0.25rem;">
        <i class="fa-solid ${planChipIcon}" aria-hidden="true"></i>
        Plano ${planoTipo.charAt(0).toUpperCase() + planoTipo.slice(1)}
      </span>
    </div>

    <div class="panel-footer">
      <p class="panel-footer-title">Condições e Pagamento</p>
      <ul style="padding:0;margin:0;display:flex;flex-direction:column;gap:6px;">
        <li style="display:flex;align-items:flex-start;gap:8px;list-style:none;font-size:0.8rem;color:#4B5563;line-height:1.4;">
          <img src="${ICON_CHECK}" alt="" aria-hidden="true" style="width:16px;height:16px;flex-shrink:0;margin-top:2px;" />
          ${turma.mensalidades} mensalidades — de ${turma.primeiraParcela} a ${turma.ultimaParcela}
        </li>
        ${turma.prazoAdesao ? `
        <li style="display:flex;align-items:flex-start;gap:8px;list-style:none;font-size:0.8rem;color:#92400E;background:#FFF7ED;border-radius:6px;padding:6px 8px;line-height:1.4;">
          <img src="${ICON_CHECK}" alt="" aria-hidden="true" style="width:16px;height:16px;flex-shrink:0;margin-top:2px;" />
          Garanta sua vaga: taxa de adesão até ${turma.prazoAdesao}
        </li>` : `
        <li style="display:flex;align-items:flex-start;gap:8px;list-style:none;font-size:0.8rem;color:#4B5563;line-height:1.4;">
          <img src="${ICON_CHECK}" alt="" aria-hidden="true" style="width:16px;height:16px;flex-shrink:0;margin-top:2px;" />
          Taxa de adesão (alunos do 1º sem. de 2026 estão isentos)
        </li>`}
        <li style="display:flex;align-items:flex-start;gap:8px;list-style:none;font-size:0.8rem;color:#4B5563;line-height:1.4;">
          <img src="${ICON_CHECK}" alt="" aria-hidden="true" style="width:16px;height:16px;flex-shrink:0;margin-top:2px;" />
          Cancelamento com 30 dias de antecedência
        </li>
        <li style="display:flex;align-items:flex-start;gap:8px;list-style:none;font-size:0.8rem;color:#4B5563;line-height:1.4;">
          <img src="${ICON_CHECK}" alt="" aria-hidden="true" style="width:16px;height:16px;flex-shrink:0;margin-top:2px;" />
          Pagamento via Boleto Bancário
        </li>
      </ul>
    </div>

    <div class="panel-footer" style="background:#fff;border-top:1px solid #E5E7EB;padding-top:1rem;">
      <p class="panel-section-title" style="margin-bottom:0.75rem;">O que está incluso no seu plano</p>
      <ul style="padding:0;margin:0;display:flex;flex-direction:column;gap:8px;">
        ${renderBeneficiosList(beneficios)}
      </ul>
    </div>`;
}

function renderPanelCombo(panel, turmaId, planoTipo) {
  const combo = TURMAS_COMBO[turmaId];
  if (!combo) return renderPanelEmpty(panel);

  panel.className = 'info-panel info-panel--combo';

  const turmasDaCombo = combo.turmas.map(id => TURMAS_SIMPLES[id]).filter(Boolean);
  const [principal, ...secundarias] = turmasDaCombo;

  const planChipClass = planoTipo === 'diamante' ? 'plan-type-chip--diamante' : 'plan-type-chip--premium';
  const planChipIcon = planoTipo === 'diamante' ? 'fa-gem' : 'fa-star';

  const horariosHtml = turmasDaCombo.map((t, i) => `
    <div class="horario-item">
      <i class="fa-regular fa-clock" aria-hidden="true"></i>
      <span><strong>${t.nome}:</strong> ${t.horario}</span>
      ${i === 0
        ? '<span style="margin-left:auto;font-size:0.72rem;background:#D1FAE5;color:#065F46;padding:2px 8px;border-radius:20px;font-weight:700;">Principal</span>'
        : '<span style="margin-left:auto;font-size:0.72rem;background:#EDE9FE;color:#5B21B6;padding:2px 8px;border-radius:20px;font-weight:700;">+40%</span>'}
    </div>`).join('');

  const iniciosHtml = turmasDaCombo.map(t => `
    <div style="display:flex;align-items:center;gap:6px;font-size:0.82rem;color:#63636E;margin-bottom:3px;">
      <i class="fa-regular fa-calendar" style="color:#F26800;font-size:0.8rem;" aria-hidden="true"></i>
      <span><strong>${t.nome}:</strong> início em ${t.inicio}</span>
    </div>`).join('');

  panel.innerHTML = `
    <div class="panel-header">
      <div class="panel-header-top">
        <p class="panel-turma-nome">${combo.nome}</p>
        <span class="panel-tipo-badge panel-tipo-badge--combo">Multi-turma</span>
      </div>
      <p class="panel-horario" style="margin-top:4px;">
        <i class="fa-solid fa-layer-group" aria-hidden="true"></i>
        ${turmasDaCombo.length} turmas combinadas
      </p>
    </div>

    <div class="panel-body">
      <p class="panel-section-title">Datas de Início</p>
      <div style="margin-bottom:1rem;">
        ${iniciosHtml}
      </div>

      <p class="panel-section-title">Regra de Desconto Multi-turma</p>
      <div class="adicional-badge" style="margin:0 0 1rem;">
        <div class="adicional-badge-header">
          <i class="fa-solid fa-percent" aria-hidden="true"></i>
          <p class="adicional-badge-title">Como funciona o valor?</p>
        </div>
        <p class="adicional-badge-desc">
          Você paga a mensalidade <strong>integral da turma principal (${principal.nome})</strong>
          e apenas <strong>40% da mensalidade</strong> de cada turma adicional.
          Além disso, apenas <strong>uma taxa de adesão</strong>.
        </p>
      </div>

      <span class="plan-type-chip ${planChipClass}" style="display:inline-flex;margin-bottom:0.25rem;">
        <i class="fa-solid ${planChipIcon}" aria-hidden="true"></i>
        Plano ${planoTipo.charAt(0).toUpperCase() + planoTipo.slice(1)}
      </span>
    </div>

    <div class="panel-horarios-list">
      <p class="panel-section-title" style="padding:0 0 0.5rem;">Horários das suas turmas</p>
      ${horariosHtml}
    </div>

    <div class="panel-footer">
      <p class="panel-footer-title">Condições e Pagamento</p>
      <ul style="padding:0;margin:0;display:flex;flex-direction:column;gap:6px;">
        <li style="display:flex;align-items:flex-start;gap:8px;list-style:none;font-size:0.8rem;color:#4B5563;line-height:1.4;">
          <img src="${ICON_CHECK}" alt="" aria-hidden="true" style="width:16px;height:16px;flex-shrink:0;margin-top:2px;" />
          Taxa de adesão
        </li>
        <li style="display:flex;align-items:flex-start;gap:8px;list-style:none;font-size:0.8rem;color:#4B5563;line-height:1.4;">
          <img src="${ICON_CHECK}" alt="" aria-hidden="true" style="width:16px;height:16px;flex-shrink:0;margin-top:2px;" />
          Turma principal: mensalidade integral
        </li>
        <li style="display:flex;align-items:flex-start;gap:8px;list-style:none;font-size:0.8rem;color:#4B5563;line-height:1.4;">
          <img src="${ICON_CHECK}" alt="" aria-hidden="true" style="width:16px;height:16px;flex-shrink:0;margin-top:2px;" />
          Turmas adicionais: 40% da mensalidade cada
        </li>
        <li style="display:flex;align-items:flex-start;gap:8px;list-style:none;font-size:0.8rem;color:#4B5563;line-height:1.4;">
          <img src="${ICON_CHECK}" alt="" aria-hidden="true" style="width:16px;height:16px;flex-shrink:0;margin-top:2px;" />
          Cancelamento com 30 dias de antecedência
        </li>
        <li style="display:flex;align-items:flex-start;gap:8px;list-style:none;font-size:0.8rem;color:#4B5563;line-height:1.4;">
          <img src="${ICON_CHECK}" alt="" aria-hidden="true" style="width:16px;height:16px;flex-shrink:0;margin-top:2px;" />
          Pagamento via Boleto Bancário
        </li>
      </ul>
    </div>`;
}

/* ── Feedback overlay ────────────────────────────────────────────────── */

function showFeedback(type, title, desc) {
  let overlay = document.getElementById('feedback-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'feedback-overlay';
    overlay.className = 'feedback-overlay';
    overlay.setAttribute('role', 'status');
    overlay.setAttribute('aria-live', 'assertive');
    overlay.innerHTML = `
      <div class="feedback-card">
        <div class="feedback-icon" id="feedback-icon"></div>
        <h3 class="feedback-title" id="feedback-title"></h3>
        <p class="feedback-desc" id="feedback-desc"></p>
      </div>`;
    document.body.appendChild(overlay);
  }

  const icons = {
    loading: '<i class="fa-solid fa-spinner feedback-icon--loading" aria-hidden="true"></i>',
    success: '<i class="fa-solid fa-circle-check feedback-icon--success" aria-hidden="true"></i>',
    error:   '<i class="fa-solid fa-circle-xmark feedback-icon--error" aria-hidden="true"></i>',
  };

  overlay.querySelector('#feedback-icon').innerHTML  = icons[type] || icons.loading;
  overlay.querySelector('#feedback-title').textContent = title;
  overlay.querySelector('#feedback-desc').textContent  = desc;
  overlay.classList.add('visible');
}

function hideFeedback() {
  document.getElementById('feedback-overlay')?.classList.remove('visible');
}

/* ── Máscaras e selects ──────────────────────────────────────────────── */

function setupMasks() {
  const cpfInput = document.getElementById('cpf');
  if (cpfInput) {
    cpfInput.addEventListener('input', e => { e.target.value = maskCPF(e.target.value); });
    cpfInput.addEventListener('blur', e => {
      const valid = validateCPF(e.target.value);
      const hint = e.target.closest('.field')?.querySelector('.hint');
      if (!valid && e.target.value.length > 0) {
        e.target.setCustomValidity('CPF inválido');
        e.target.classList.add('error');
        if (hint) hint.textContent = 'CPF inválido';
      } else {
        e.target.setCustomValidity('');
        e.target.classList.remove('error');
        if (hint) hint.textContent = '';
      }
    });
  }

  const telInput = document.getElementById('telefone');
  if (telInput) {
    telInput.addEventListener('input', e => { e.target.value = maskPhone(e.target.value); });
    telInput.setAttribute('maxlength', '15');
  }
}

async function setupStateCitySelects() {
  const stateSelect = document.getElementById('state');
  const citySelect  = document.getElementById('city');
  if (!stateSelect || !citySelect) return;

  try {
    const resp = await fetch('../assets/data/cidades.json', { cache: 'force-cache' });
    const data = await resp.json();
    const stateMap = new Map(data.estados.map(e => [e.sigla, e.cidades]));

    const frag = document.createDocumentFragment();
    data.estados.forEach(({ sigla, nome }) => {
      const opt = document.createElement('option');
      opt.value = sigla; opt.textContent = `${nome} (${sigla})`;
      frag.appendChild(opt);
    });
    stateSelect.appendChild(frag);

    const resetCities = () => {
      citySelect.innerHTML = '<option value="" selected disabled>Selecione a sua Cidade</option>';
      citySelect.disabled = true;
    };

    const fillCities = sigla => {
      const cidades = stateMap.get(sigla);
      if (!cidades) return resetCities();
      const fragC = document.createDocumentFragment();
      cidades.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c; opt.textContent = c;
        fragC.appendChild(opt);
      });
      citySelect.innerHTML = '<option value="" selected disabled>Selecione a sua Cidade</option>';
      citySelect.appendChild(fragC);
      citySelect.disabled = false;
    };

    resetCities();
    stateSelect.addEventListener('change', e => fillCities(e.target.value));
  } catch (err) {
    console.error('Erro ao carregar estados/cidades:', err);
  }
}

/* ── Submit ──────────────────────────────────────────────────────────── */

async function handleSubmit(e, planoTipo, getSelectedTurmaId) {
  e.preventDefault();
  const form = e.target;

  const cpfInput = document.getElementById('cpf');
  if (cpfInput && !validateCPF(cpfInput.value)) {
    alert('Por favor, insira um CPF válido.');
    cpfInput.focus();
    return;
  }

  const terms = document.getElementById('terms');
  if (terms && !terms.checked) {
    alert('Você precisa aceitar os Termos de Uso para continuar.');
    return;
  }

  const turmaId = getSelectedTurmaId();
  if (!turmaId) {
    alert('Por favor, selecione uma turma de interesse.');
    document.getElementById('tipoTurma')?.focus();
    return;
  }

  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn?.innerHTML ?? 'Enviar';

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> Enviando...';
  }

  showFeedback('loading', 'Enviando seus dados...', 'Aguarde um momento, por favor.');

  const turmaData = TURMAS_DATA[turmaId];
  const turmaNome = turmaData?.nome || turmaId;
  const isCombo = !!TURMAS_COMBO[turmaId];

  try {
    // Lê os campos do formulário pelo id
    const g = id => (document.getElementById(id)?.value || '').trim();
    const gSelectText = id => {
      const el = document.getElementById(id);
      return el?.options[el?.selectedIndex]?.text || el?.value || '';
    };

    // Monta payload na ordem exata das colunas da planilha
    const payload = new FormData();
    payload.append('Data / Hora',            new Date().toLocaleString('pt-BR', { timeZone: 'America/Bahia' }));
    payload.append('Plano Escolhido',         planoTipo === 'diamante' ? 'Diamante' : 'Premium');
    payload.append('Nome Completo',           g('nomeCompleto'));
    payload.append('E-mail',                  g('email'));
    payload.append('CPF',                     g('cpf'));
    payload.append('Telefone / WhatsApp',     g('telefone'));
    payload.append('CEP',                     g('cep'));
    payload.append('Estado',                  gSelectText('state'));
    payload.append('Endereço',               g('endereco'));
    payload.append('Número',                  g('numero'));
    payload.append('Complemento',             g('complemento'));
    payload.append('Indicação de Parceiro',  gSelectText('partnerReferral'));
    payload.append('Aceitou os Termos',       document.getElementById('terms')?.checked ? 'Sim' : 'Não');
    // Campos adicionais (após aceite)
    payload.append('Turma Escolhida',         turmaNome);
    payload.append('Multi-turma',             isCombo ? 'Sim — mensalidade principal + 40% das adicionais' : 'Não');
    payload.append('Forma de Pagamento',      'Boleto Bancário');

    // Informações extras da turma
    if (!isCombo && turmaData) {
      payload.append('Horário da Turma', turmaData.horario || '');
      payload.append('Início da Turma',  turmaData.inicio  || '');
    } else if (isCombo && turmaData) {
      const turmasNomes = TURMAS_COMBO[turmaId]?.turmas
        ?.map(id => TURMAS_SIMPLES[id]?.nome || id)
        .join(' | ') || '';
      payload.append('Turmas Combinadas', turmasNomes);
    }

    const res = await fetch(APPS_SCRIPT_URL, { method: 'POST', body: payload });

    if (res.ok || res.redirected || res.status === 0) {
      hideFeedback();
      window.location.href = '../pages/sucesso/sucesso.html';
    } else {
      throw new Error(`Status ${res.status}`);
    }
  } catch (err) {
    // Apps Script frequentemente retorna CORS error mesmo processando com sucesso
    if (err instanceof TypeError || err.message.includes('fetch') || err.message.includes('Network')) {
      hideFeedback();
      window.location.href = '../pages/sucesso/sucesso.html';
      return;
    }

    hideFeedback();
    showFeedback('error', 'Erro ao enviar', 'Verifique sua conexão e tente novamente.');
    setTimeout(hideFeedback, 4000);

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  }
}

/* ── Init Principal ──────────────────────────────────────────────────── */

/**
 * @param {'diamante'|'premium'} planoTipo
 */
function initPlanosPage(planoTipo) {
  const panel       = document.getElementById('info-panel');
  const turmaSelect = document.getElementById('tipoTurma');
  const form        = document.getElementById('checkoutForm');

  if (!panel || !turmaSelect || !form) {
    console.error('[planos.js] Elementos essenciais não encontrados.');
    return;
  }

  let selectedTurmaId = null;
  const getSelectedTurmaId = () => selectedTurmaId;

  const updatePanel = (val) => {
    if (!val) {
      selectedTurmaId = null;
      renderPanelEmpty(panel);
      return;
    }
    selectedTurmaId = val;
    if (TURMAS_COMBO[val]) {
      renderPanelCombo(panel, val, planoTipo);
    } else {
      renderPanelSingle(panel, val, planoTipo);
    }
  };

  // Pré-seleção via ?tipoTurma=
  const paramVal = new URLSearchParams(window.location.search).get('tipoTurma');
  if (paramVal && TURMAS_DATA[paramVal]) {
    turmaSelect.value = paramVal;
    updatePanel(paramVal);
  } else {
    renderPanelEmpty(panel);
  }

  turmaSelect.addEventListener('change', () => updatePanel(turmaSelect.value));

  setupMasks();
  setupStateCitySelects();

  form.addEventListener('submit', e => handleSubmit(e, planoTipo, getSelectedTurmaId));
}
