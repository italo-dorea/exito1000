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
$subject = "📥 Novo Pedido (Checkout) - Êxito 1000";
if ($plano !== '') {
  $subject .= " | [" . $plano . "]";
}

// Monta mensagem
$time = new DateTime('now', new DateTimeZone('America/Sao_Paulo'));
$timeFormatted = $time->format('d/m/Y H:i:s');


$message = '
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Novo Pedido - Êxito 1000</title>
  <style>
    body { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
    .header { background-color: #005B35; color: #ffffff; padding: 25px 20px; text-align: center; }
    .header h2 { margin: 0; font-size: 24px; font-weight: 600; }
    .header p { margin: 5px 0 0; font-size: 14px; opacity: 0.9; }
    .content { padding: 30px 20px; }
    .section-title { color: #005B35; font-size: 18px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 0; margin-bottom: 15px; }
    .data-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
    .data-table td { padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-size: 15px; color: #333; }
    .data-table td strong { color: #555; display: inline-block; width: 130px; }
    .data-table tr:last-child td { border-bottom: none; }
    .footer { background-color: #f8fafc; padding: 15px 20px; text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Novo Pedido Recebido</h2>
      <p>' . htmlspecialchars($timeFormatted) . '</p>
    </div>
    
    <div class="content">
      <h3 class="section-title">Informações do Pedido</h3>
      <table class="data-table">
        <tr><td><strong>Plano Escolhido:</strong> <span style="color:#005B35; font-weight:bold;">' . htmlspecialchars($plano ?: 'Não especificado') . '</span></td></tr>
        <tr><td><strong>Indicação:</strong> ' . htmlspecialchars($partnerReferral ?: 'Nenhuma') . '</td></tr>
      </table>

      <h3 class="section-title">Dados do Aluno</h3>
      <table class="data-table">
        <tr><td><strong>Nome:</strong> ' . htmlspecialchars($nomeCompleto) . '</td></tr>
        <tr><td><strong>E-mail:</strong> <a href="mailto:' . htmlspecialchars($email) . '" style="color:#005B35; text-decoration:none;">' . htmlspecialchars($email) . '</a></td></tr>
        <tr><td><strong>Telefone:</strong> ' . htmlspecialchars($telefone) . '</td></tr>
        <tr><td><strong>CPF:</strong> ' . htmlspecialchars($cpf) . '</td></tr>
      </table>

      <h3 class="section-title">Endereço</h3>
      <table class="data-table">
        <tr><td><strong>CEP:</strong> ' . htmlspecialchars($cep) . '</td></tr>
        <tr><td><strong>Endereço:</strong> ' . htmlspecialchars($endereco) . ', Nº ' . htmlspecialchars($numero) . '</td></tr>
        <tr><td><strong>Complemento:</strong> ' . htmlspecialchars($complemento) . '</td></tr>
        <tr><td><strong>Bairro:</strong> ' . htmlspecialchars($bairro) . '</td></tr>
        <tr><td><strong>Cidade/UF:</strong> ' . htmlspecialchars($city) . ' - ' . htmlspecialchars($state) . '</td></tr>
        <tr><td><strong>Referência:</strong> ' . htmlspecialchars($referencia) . '</td></tr>
      </table>
    </div>

    <div class="footer">
      Este e-mail foi gerado automaticamente pelo Checkout da Êxito 1000.
    </div>
  </div>
</body>
</html>
';

// Headers
$headers  = "MIME-Version: 1.0\r\n";
$headers .= "Content-type: text/html; charset=UTF-8\r\n";

// Define o remetente oficial (deve ser do meio domínio)
$emailFrom = "no-reply@redacaoexito1000.com.br";

// Use FROM do seu domínio para reduzir chance de spam/bloqueio
$headers .= "From: Êxito 1000 <" . $emailFrom . ">\r\n";

// Reply-To: responder direto para o cliente
$headers .= "Reply-To: " . $email . "\r\n";

// Headers adicionais que ajudam a não cair no SPAM
$headers .= "Return-Path: " . $emailFrom . "\r\n"; 
$headers .= "Sender: " . $emailFrom . "\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";

// O parâmetro "-f" força o Return-Path no envelope do e-mail (essencial para SPF)
$sent = mail($to, $subject, $message, $headers, "-f" . $emailFrom);

if ($sent) {
  echo json_encode(['status' => 'success', 'message' => '✅ Dados enviados com sucesso!']);
} else {
  echo json_encode(['status' => 'error', 'message' => '❌ Falha ao enviar e-mail. A hospedagem falhou no envio.']);
}

exit;
