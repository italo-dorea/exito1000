/**
 * test-fill.js — Script de preenchimento automático para teste dos formulários
 *
 * USO:
 *   1. Abra premium.html ou diamante.html no navegador
 *   2. Abra o DevTools (F12) → aba Console
 *   3. Cole este script inteiro e pressione Enter
 *
 * Turmas simples : 'enem' | 'bahiana' | 'uneb_uesb'
 * Turmas combo   : 'enem_bahiana' | 'enem_uneb_uesb' | 'bahiana_uneb_uesb' | 'enem_bahiana_uneb_uesb'
 *
 * Exemplos:
 *   testFill('uneb_uesb', false)
 *   testFill('enem_bahiana', true)   <- preenche e envia
 */

(async function testFill(turmaId = 'enem', autoSubmit = false) {

  const $ = id => document.getElementById(id);
  const log = (emoji, msg) => console.log(`${emoji} ${msg}`);
  const wait = ms => new Promise(r => setTimeout(r, ms));

  function fillInput(id, value) {
    const el = $(id);
    if (!el) { console.warn(`campo nao encontrado: #${id}`); return false; }
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    setter?.call(el, value);
    el.dispatchEvent(new Event('input',  { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new Event('blur',   { bubbles: true }));
    log('ok', `#${id} -> "${value}"`);
    return true;
  }

  function fillSelect(id, value) {
    const el = $(id);
    if (!el) { console.warn(`select nao encontrado: #${id}`); return false; }
    el.value = value;
    el.dispatchEvent(new Event('change', { bubbles: true }));
    log('ok', `#${id} -> "${value}" selecionado`);
    return true;
  }

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

  const TEST_DATA = {
    nomeCompleto:    'Aluno Teste da Silva',
    email:           'teste.aluno@exitomil.com.br',
    cpf:             gerarCPF(),
    telefone:        '(71) 99999-8888',
    cep:             '40020-020',
    state:           'BA',
    city:            'Salvador',
    endereco:        'Rua Chile',
    numero:          '42',
    complemento:     'Apto 301',
    partnerReferral: 'nao_veio_por_indicacao',
  };

  log('inicio', `Turma: "${turmaId}"`);
  log('cpf', TEST_DATA.cpf);
  console.table(TEST_DATA);

  log('passo 1', 'Selecionar turma');
  fillSelect('tipoTurma', turmaId);
  await wait(600);

  log('passo 2', 'Dados pessoais');
  fillInput('nomeCompleto', TEST_DATA.nomeCompleto);
  fillInput('email',        TEST_DATA.email);
  fillInput('cpf',          TEST_DATA.cpf);
  await wait(200);
  fillInput('telefone', TEST_DATA.telefone);

  log('passo 3', 'CEP, Estado e Cidade');
  fillInput('cep', TEST_DATA.cep);
  await wait(400);
  fillSelect('state', TEST_DATA.state);
  await wait(700);

  const citySelect = $('city');
  if (citySelect && !citySelect.disabled) {
    const opt = Array.from(citySelect.options).find(o =>
      o.value.toLowerCase().includes('salvador') || o.text.toLowerCase().includes('salvador')
    );
    if (opt) {
      fillSelect('city', opt.value);
    } else {
      const firstCity = citySelect.options[1]?.value;
      if (firstCity) fillSelect('city', firstCity);
      else log('aviso', 'Nenhuma cidade disponivel. Selecione manualmente.');
    }
  } else {
    log('aviso', 'Cidade desabilitada. Aguardando...');
    await wait(1000);
    const opt = Array.from(citySelect?.options || []).find(o => o.value.toLowerCase().includes('salvador'));
    if (opt) fillSelect('city', opt.value);
  }

  log('passo 4', 'Endereco');
  fillInput('endereco',    TEST_DATA.endereco);
  fillInput('numero',      TEST_DATA.numero);
  fillInput('complemento', TEST_DATA.complemento);

  log('passo 5', 'Indicacao de parceiro');
  fillSelect('partnerReferral', TEST_DATA.partnerReferral);

  log('passo 6', 'Aceitar termos');
  const terms = $('terms');
  if (terms) {
    terms.checked = true;
    terms.dispatchEvent(new Event('change', { bubbles: true }));
    log('ok', 'Termos aceitos');
  }

  await wait(300);
  log('concluido', 'Formulario preenchido!');
  log('plano', document.title);
  log('turma', $('tipoTurma')?.options[$('tipoTurma')?.selectedIndex]?.text);
  log('endereco', `${TEST_DATA.endereco}, ${TEST_DATA.numero} - ${TEST_DATA.complemento}`);

  if (autoSubmit) {
    log('passo 7', 'Submetendo...');
    await wait(500);
    $('checkoutForm')?.requestSubmit();
    log('enviado', 'Verifique o overlay de feedback.');
  } else {
    log('dica', "Para enviar: document.getElementById('checkoutForm').requestSubmit()");
    log('dica', "Outras turmas: testFill('bahiana') | testFill('uneb_uesb') | testFill('enem_bahiana', true)");
  }

  return { dados: TEST_DATA, turma: turmaId, pronto: true, enviar: () => $('checkoutForm')?.requestSubmit() };

})('enem', false);

window.testFill = function(turmaId = 'enem', autoSubmit = false) {
  const url = new URL(window.location.href);
  url.searchParams.set('tipoTurma', turmaId);
  window.location.href = url.toString();
};
