<?php
header('Content-Type: application/json; charset=utf-8');

// Em produção, recomendo desativar display_errors
error_reporting(E_ALL);
ini_set('display_errors', 1);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  echo json_encode(['status' => 'error', 'message' => 'Método inválido. Use POST.']);
  exit;
}

function post_field($key) {
  return isset($_POST[$key]) ? trim((string)$_POST[$key]) : '';
}

// Anti-spam (opcional): se você colocar um input hidden name="website"
$honeypot = post_field('website');
if ($honeypot !== '') {
  echo json_encode(['status' => 'error', 'message' => 'Falha de validação.']);
  exit;
}

/**
 * Campos do seu formulário (conforme HTML enviado)
 */
$nomeCompleto     = post_field('nomeCompleto');
$email            = post_field('email');
$cpf              = post_field('cpf');
$telefone         = post_field('telefone');

$cep              = post_field('cep');
$endereco         = post_field('endereço');      // mantém o name com acento
$numero           = post_field('numero');
$complemento      = post_field('complemento');
$bairro           = post_field('bairro');

$state            = post_field('state');
$city             = post_field('city');
$referencia       = post_field('referencia');
$partnerReferral  = post_field('partnerReferral');

// Extra (você adiciona via JS)
$plano            = post_field('plano'); // Diamante / Premium

// Validações mínimas (não esquece nenhuma importante)
if ($nomeCompleto === '' || $email === '' || $cpf === '' || $telefone === '') {
  echo json_encode(['status' => 'error', 'message' => 'Preencha Nome, E-mail, CPF e Telefone.']);
  exit;
}

if ($cep === '' || $endereco === '' || $numero === '' || $complemento === '' || $bairro === '' || $state === '' || $city === '' || $referencia === '') {
  echo json_encode(['status' => 'error', 'message' => 'Preencha todos os campos de endereço.']);
  exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  echo json_encode(['status' => 'error', 'message' => 'E-mail inválido.']);
  exit;
}

// Destinatário
$to = "contato@redacaoexito1000.com.br";

// Assunto
$subject = "📥 Novo pedido/contato pelo checkout - Êxito 1000";
if ($plano !== '') {
  $subject .= " | Plano: " . $plano;
}

// Monta mensagem
$time = date('d/m/Y H:i:s');

$message = '
<html>
<head>
  <meta charset="UTF-8" />
  <title>Novo envio - Êxito 1000</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.5;">
  <h2>Novo envio recebido (Checkout)</h2>
  <p><strong>Data/Hora:</strong> ' . htmlspecialchars($time) . '</p>
  <hr />

  <h3>Dados do cliente</h3>
  <p><strong>Nome completo:</strong> ' . htmlspecialchars($nomeCompleto) . '</p>
  <p><strong>E-mail:</strong> ' . htmlspecialchars($email) . '</p>
  <p><strong>CPF:</strong> ' . htmlspecialchars($cpf) . '</p>
  <p><strong>Telefone:</strong> ' . htmlspecialchars($telefone) . '</p>

  <hr />

  <h3>Endereço</h3>
  <p><strong>CEP:</strong> ' . htmlspecialchars($cep) . '</p>
  <p><strong>Endereço:</strong> ' . htmlspecialchars($endereco) . '</p>
  <p><strong>Número:</strong> ' . htmlspecialchars($numero) . '</p>
  <p><strong>Complemento:</strong> ' . htmlspecialchars($complemento) . '</p>
  <p><strong>Bairro:</strong> ' . htmlspecialchars($bairro) . '</p>
  <p><strong>Estado:</strong> ' . htmlspecialchars($state) . '</p>
  <p><strong>Cidade:</strong> ' . htmlspecialchars($city) . '</p>
  <p><strong>Ponto de referência:</strong> ' . htmlspecialchars($referencia) . '</p>

  <hr />

  <h3>Informações do pedido</h3>
  <p><strong>Plano:</strong> ' . htmlspecialchars($plano ?: '-') . '</p>
  <p><strong>Indicação:</strong> ' . htmlspecialchars($partnerReferral ?: '-') . '</p>

  <hr />
  <p style="color:#666; font-size: 12px;">
    Enviado automaticamente pelo formulário do site Êxito 1000.
  </p>
</body>
</html>
';

// Headers
$headers  = "MIME-Version: 1.0\r\n";
$headers .= "Content-type: text/html; charset=UTF-8\r\n";

// Use FROM do seu domínio para reduzir chance de spam/bloqueio
$headers .= "From: Êxito 1000 <no-reply@redacaoexito1000.com.br>\r\n";

// Reply-To: responder direto para o cliente
$headers .= "Reply-To: " . $email . "\r\n";

$sent = mail($to, $subject, $message, $headers);

if ($sent) {
  echo json_encode(['status' => 'success', 'message' => '✅ Dados enviados com sucesso!']);
} else {
  echo json_encode(['status' => 'error', 'message' => '❌ Falha ao enviar e-mail. Verifique a configuração do servidor.']);
}

exit;