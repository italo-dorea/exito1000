/**
 * test-fill.js — Script de preenchimento automático para teste dos formulários
 * 
 * USO:
 *   1. Abra premium.html ou diamante.html no navegador
 *   2. Abra o DevTools (F12) → aba Console
 *   3. Cole este script inteiro e pressione Enter
 *   4. Observe o formulário sendo preenchido automaticamente
 *
 * Para testar com turma combo, chame: testFill('enem_bahiana', false)
 * Para testar e enviar automaticamente: testFill('enem', true)
 */

(async function testFill(turmaId = 'enem', autoSubmit = false) {

  /* ── Helpers ── */
  const $ = id => document.getElementById(id);
  const log = (emoji, msg) => console.log(`${emoji} ${msg}`);
  const wait = ms => new Promise(r => setTimeout(r, ms));

  function fillInput(id, value) {
    const el = $(id);
    if (!el) { console.warn(`⚠️  Campo não encontrado: #${id}`); return false; }
    // Simula digitação real para disparar todos os listeners
    const nativeInputSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    nativeInputSetter?.call(el, value);
    el.dispatchEvent(new Event('input',  { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new Event('blur',   { bubbles: true }));
    log('✅', `#${id} → "${value}"`);
    return true;
  }

  function fillSelect(id, value) {
    const el = $(id);
    if (!el) { console.warn(`⚠️  Select não encontrado: #${id}`); return false; }
    el.value = value;
    el.dispatchEvent(new Event('change', { bubbles: true }));
    log('✅', `#${id} → "${value}" selecionado`);
    return true;
  }

  /* ── CPF válido gerado programaticamente ── */
  function gerarCPF() {
    const rand = () => Math.floor(Math.random() * 9);
    const d = Array.from({ length: 9 }, rand);
    const calc = (arr, start) => {
      const sum = arr.reduce((acc, v, i) => acc + v * (start - i), 0);
      const r = (sum * 10) % 11;
      return r >= 10 ? 0 : r;
    };
    d.push(calc(d, 10));
    d.push(calc(d, 11));
    return `${d.slice(0,3).join('')}.${d.slice(3,6).join('')}.${d.slice(6,9).join('')}-${d.slice(9).join('')}`;
  }

  /* ── Dados de teste ── */
  const TEST_DATA = {
    nomeCompleto:    'Aluno Teste da Silva',
    email:           'teste.aluno@exitomil.com.br',
    cpf:             gerarCPF(),
    telefone:        '(71) 99999-8888',
    cep:             '40020-020',
    state:           'BA',
    city:            'Salvador',
    partnerReferral: 'nao_veio_por_indicacao',
  };

  log('🚀', `Iniciando preenchimento de teste — Turma: "${turmaId}"`);
  log('📋', `CPF gerado: ${TEST_DATA.cpf}`);
  console.table(TEST_DATA);

  /* ── PASSO 1: Selecionar turma ── */
  log('\n──', 'PASSO 1: Selecionar turma');
  fillSelect('tipoTurma', turmaId);
  await wait(600); // aguarda renderização do painel lateral

  /* ── PASSO 2: Dados pessoais ── */
  log('\n──', 'PASSO 2: Dados pessoais');
  fillInput('nomeCompleto', TEST_DATA.nomeCompleto);
  fillInput('email', TEST_DATA.email);
  fillInput('cpf', TEST_DATA.cpf);
  await wait(300);
  fillInput('telefone', TEST_DATA.telefone);
  fillInput('cep', TEST_DATA.cep);

  /* ── PASSO 3: Estado e cidade ── */
  log('\n──', 'PASSO 3: Estado e cidade');
  await wait(400);
  fillSelect('state', TEST_DATA.state);
  await wait(600); // aguarda cidades carregarem

  // Tenta selecionar cidade; se não disponível, avisa
  const citySelect = $('city');
  if (citySelect && !citySelect.disabled) {
    // Encontra opção que contenha "Salvador"
    const opt = Array.from(citySelect.options).find(o =>
      o.value.toLowerCase().includes('salvador')
    );
    if (opt) {
      fillSelect('city', opt.value);
    } else {
      // Seleciona a primeira cidade disponível
      const firstCity = citySelect.options[1]?.value;
      if (firstCity) fillSelect('city', firstCity);
      else log('⚠️', 'Nenhuma cidade disponível ainda. Aguarde e selecione manualmente.');
    }
  } else {
    log('⚠️', 'Select de cidade ainda desabilitado. Aguardando estado ser processado...');
    await wait(1000);
    const opt = Array.from(citySelect?.options || []).find(o =>
      o.value.toLowerCase().includes('salvador')
    );
    if (opt) fillSelect('city', opt.value);
  }

  /* ── PASSO 4: Indicação ── */
  log('\n──', 'PASSO 4: Indicação de parceiro');
  fillSelect('partnerReferral', TEST_DATA.partnerReferral);

  /* ── PASSO 5: Aceitar termos ── */
  log('\n──', 'PASSO 5: Aceitar termos');
  const terms = $('terms');
  if (terms) {
    terms.checked = true;
    terms.dispatchEvent(new Event('change', { bubbles: true }));
    log('✅', 'Termos aceitos');
  }

  /* ── Resumo ── */
  await wait(300);
  log('\n🎉', 'Formulário preenchido com sucesso!');
  log('📝', `Plano detectado: ${document.title}`);
  log('🏫', `Turma selecionada: ${$('tipoTurma')?.options[$('tipoTurma')?.selectedIndex]?.text}`);

  /* ── PASSO 6: Envio (opcional) ── */
  if (autoSubmit) {
    log('\n──', 'PASSO 6: Submetendo formulário...');
    await wait(500);
    const form = $('checkoutForm');
    if (form) {
      form.requestSubmit();
      log('📤', 'Formulário submetido! Verifique o overlay de feedback.');
    }
  } else {
    log('\n💡', 'Para enviar o formulário, execute no console:');
    log('   ', "document.getElementById('checkoutForm').requestSubmit()");
    log('\n💡', 'Testar com outra turma:');
    log('   ', "testFill('enem_bahiana', false)");
    log('   ', "testFill('uneb', false)");
    log('   ', "testFill('enem_bahiana_uneb_uesb', false)");
  }

  return {
    dados: TEST_DATA,
    turma: turmaId,
    pronto: true,
    enviar: () => $('checkoutForm')?.requestSubmit(),
  };

})('enem', false);

/* ── Expõe função global para re-uso ── */
window.testFill = async function(turmaId = 'enem', autoSubmit = false) {
  // Re-executa o script com novos parâmetros
  location.search = `?tipoTurma=${turmaId}`;
};
