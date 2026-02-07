# 7. External APIs

### 7.1 Focus NFe API

- **Purpose:** Emissao de documentos fiscais eletronicos (NFe, NFSe Nacional, NFCe)
- **Documentation:** https://focusnfe.com.br/doc/
- **Base URL(s):** `https://homologacao.focusnfe.com.br/v2/` (homologacao) / `https://api.focusnfe.com.br/v2/` (producao)
- **Authentication:** HTTP Basic Auth (token como username, vazio como password)
- **Rate Limits:** Variam por plano Focus NFe (tipicamente 60 req/min)

**Key Endpoints Used:**
- `POST /nfe` - Emitir NFe (produto)
- `GET /nfe/{ref}` - Consultar status NFe
- `DELETE /nfe/{ref}` - Cancelar NFe
- `POST /nfse` - Emitir NFSe Nacional
- `GET /nfse/{ref}` - Consultar status NFSe
- `POST /nfce` - Emitir NFCe (consumidor)
- `GET /nfce/{ref}` - Consultar status NFCe

**Integration Notes:** Emissao sempre assincrona via BullMQ. Circuit breaker com 3 falhas consecutivas. Retry com backoff exponencial (1s, 5s, 30s). Webhook configuravel para receber status de autorizacao/rejeicao.

### 7.2 Mercado Pago API

- **Purpose:** Geracao de cobrancas PIX, QR codes, e recebimento de webhooks de pagamento
- **Documentation:** https://www.mercadopago.com.br/developers/pt/reference
- **Base URL(s):** `https://api.mercadopago.com`
- **Authentication:** Bearer token (Access Token em env var)
- **Rate Limits:** Variam; geralmente ate 1000 req/min com access token

**Key Endpoints Used:**
- `POST /v1/payments` - Criar cobranca PIX (payment_method_id: "pix")
- `GET /v1/payments/{id}` - Consultar status pagamento
- `POST /v1/payments/{id}/refunds` - Estornar pagamento

**Integration Notes:** Webhook URL registrada no dashboard Mercado Pago. Validacao de assinatura HMAC em cada webhook recebido. Cobrancas PIX com expiracao de 24h default. QR code e copia-e-cola retornados no response de criacao.

### 7.3 WhatsApp Business API

- **Purpose:** Envio de mensagens transacionais (cobranca, NFe, lembretes) para clientes
- **Documentation:** Dependente do provedor (Wati / Evolution API / Meta Cloud API)
- **Base URL(s):** Configuravel via env var
- **Authentication:** API Key ou Bearer token (dependente do provedor)
- **Rate Limits:** Meta: 1000 msgs/s (business initiated), Wati: variam por plano

**Key Endpoints Used:**
- `POST /messages` - Enviar mensagem template
- `GET /messages/{id}` - Status de entrega

**Integration Notes:** Provedor abstrato via adapter pattern - troca de provedor sem impacto no sistema. Mensagens sempre via BullMQ queue. Templates pre-aprovados pelo WhatsApp Business. Webhook para status de entrega (sent/delivered/read/failed).

---
