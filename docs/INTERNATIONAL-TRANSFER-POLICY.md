# Politique de Transfert International de Données / Politica de Transferencia Internacional de Dados

# Política de Transferência Internacional de Dados Pessoais

**Projeto:** NOOWE — Plataforma de Gestão para Restaurantes
**Versão:** 1.0
**Data:** 25/03/2026
**Classificação:** Interno — Confidencial
**Responsável:** Encarregado de Proteção de Dados (DPO)

---

## 1. Objetivo

Esta política documenta todas as transferências internacionais de dados pessoais realizadas pela plataforma NOOWE, em conformidade com os Arts. 33 a 36 da Lei Geral de Proteção de Dados Pessoais (Lei 13.709/2018 — LGPD) e com as regulamentações da ANPD (Autoridade Nacional de Proteção de Dados).

---

## 2. Base Legal para Transferências Internacionais

Todas as transferências internacionais de dados pessoais realizadas pela NOOWE são fundamentadas nas seguintes hipóteses legais previstas no Art. 33 da LGPD:

| Hipótese | Artigo | Aplicabilidade |
|----------|--------|---------------|
| Cláusulas Contratuais Padrão | Art. 33, II, "b" | Principal base legal utilizada com todos os provedores |
| Consentimento específico e destacado do titular | Art. 33, VIII | Para funcionalidades opcionais (analytics, marketing) |
| Cumprimento de obrigação legal ou regulatória | Art. 33, III | Para requisitos fiscais e regulatórios |

---

## 3. Inventário de Transferências Internacionais

### 3.1 Amazon Web Services (AWS)

| Campo | Detalhe |
|-------|---------|
| **Provedor** | Amazon Web Services, Inc. |
| **País de destino** | Estados Unidos (us-east-1 — N. Virginia) |
| **Infraestrutura primária** | Brasil (sa-east-1 — São Paulo) |
| **Serviços utilizados** | EC2, RDS (PostgreSQL), ElastiCache (Redis), S3, CloudFront, SES, CloudWatch |
| **Dados transferidos** | Dados de infraestrutura, backups, logs de serviço. Dados de aplicação primariamente em sa-east-1 |
| **Finalidade** | Hospedagem de infraestrutura, armazenamento, CDN, e-mail transacional |
| **Base legal** | Cláusulas Contratuais Padrão (AWS DPA) |
| **Certificações** | SOC 1/2/3 Type II, ISO 27001, ISO 27017, ISO 27018, PCI DSS Level 1, CSA STAR |
| **DPA** | [AWS Data Processing Addendum](https://d1.awsstatic.com/legal/aws-gdpr/AWS_GDPR_DPA.pdf) |
| **Medidas suplementares** | Criptografia AES-256 em repouso, TLS 1.3 em trânsito, VPC isolada, KMS para gerenciamento de chaves |
| **Avaliação de risco** | BAIXO — Dados primários em sa-east-1; us-east-1 apenas para serviços auxiliares |

**Nota sobre localização de dados:** O banco de dados PostgreSQL principal e o cache Redis operam na região sa-east-1 (São Paulo). A transferência para us-east-1 ocorre apenas para serviços de CDN (CloudFront), e-mail transacional (SES) e backups georedundantes.

---

### 3.2 Sentry

| Campo | Detalhe |
|-------|---------|
| **Provedor** | Functional Software, Inc. (Sentry) |
| **País de destino** | Estados Unidos |
| **Serviços utilizados** | Monitoramento de erros e performance (APM) |
| **Dados transferidos** | Stack traces, metadados de requisição, IDs de sessão, user agent, IP (anonimizado), breadcrumbs de navegação |
| **Dados NÃO transferidos** | Senhas, tokens de autenticação, dados de pagamento, CPF, dados biométricos |
| **Finalidade** | Monitoramento de erros em tempo real, rastreamento de performance, debugging |
| **Base legal** | Cláusulas Contratuais Padrão |
| **Certificações** | SOC 2 Type II, ISO 27001 |
| **DPA** | [Sentry DPA](https://sentry.io/legal/dpa/) |
| **Medidas suplementares** | Sanitização de PII antes do envio (e-mails, telefones, CPF mascarados); scrubbing de dados sensíveis via `beforeSend`; retenção configurada para 30 dias |
| **Avaliação de risco** | BAIXO — Dados técnicos com PII sanitizada |

**Configuração de sanitização ativa:**
- E-mails mascarados: `j***@email.com`
- Telefones mascarados: `+55***1234`
- CPFs mascarados: `***.***.***-12`
- Tokens e senhas: `[REDACTED]`
- IP: Primeiros octetos removidos

---

### 3.3 OpenAI

| Campo | Detalhe |
|-------|---------|
| **Provedor** | OpenAI, L.L.C. |
| **País de destino** | Estados Unidos |
| **Serviços utilizados** | API GPT-4 para sugestões de IA (recomendações de pratos, pairing, atendimento) |
| **Dados transferidos** | Contexto da conversa (tipo de restaurante, preferências do usuário, cardápio), histórico anonimizado de pedidos |
| **Dados NÃO transferidos** | Nome, CPF, e-mail, telefone, dados de pagamento, dados biométricos |
| **Finalidade** | Recomendações personalizadas, sugestões de harmonização, assistente virtual |
| **Base legal** | Consentimento do titular (funcionalidade opcional) + Cláusulas Contratuais Padrão |
| **Certificações** | SOC 2 Type II |
| **DPA** | [OpenAI DPA](https://openai.com/policies/data-processing-addendum) |
| **Medidas suplementares** | Dados anonimizados antes do envio; opt-out de treinamento de modelo ativo; nenhum dado pessoal identificável enviado; retenção zero (API mode) |
| **Avaliação de risco** | BAIXO — Dados anonimizados, funcionalidade opt-in |

**Política de dados da OpenAI API:** Com o uso da API (não ChatGPT), os dados enviados NÃO são utilizados para treinamento de modelos, conforme [política de uso de dados da API](https://openai.com/policies/api-data-usage-policies).

---

### 3.4 Twilio

| Campo | Detalhe |
|-------|---------|
| **Provedor** | Twilio, Inc. |
| **País de destino** | Estados Unidos |
| **Serviços utilizados** | SMS (Verify API para OTP), WhatsApp Business API |
| **Dados transferidos** | Número de telefone do destinatário, conteúdo da mensagem (código OTP, notificações) |
| **Dados NÃO transferidos** | Nome, CPF, e-mail, dados de pagamento, histórico de pedidos |
| **Finalidade** | Autenticação de dois fatores (OTP), notificações transacionais via SMS/WhatsApp |
| **Base legal** | Execução de contrato (Art. 7, V) + Cláusulas Contratuais Padrão |
| **Certificações** | SOC 2 Type II, ISO 27001, PCI DSS |
| **DPA** | [Twilio DPA](https://www.twilio.com/legal/data-protection-addendum) |
| **Medidas suplementares** | Mensagens com conteúdo mínimo (apenas código OTP, sem contexto adicional); logs de SMS com número mascarado; retenção de logs limitada a 30 dias |
| **Avaliação de risco** | BAIXO — Dados mínimos, finalidade de segurança |

---

### 3.5 Firebase (Google)

| Campo | Detalhe |
|-------|---------|
| **Provedor** | Google LLC (Firebase) |
| **País de destino** | Estados Unidos |
| **Serviços utilizados** | Firebase Cloud Messaging (FCM), Firebase Analytics (condicionado a consentimento) |
| **Dados transferidos** | Token do dispositivo (FCM), eventos de uso (Analytics — apenas com consentimento) |
| **Dados NÃO transferidos** | Nome, CPF, e-mail, telefone, dados de pagamento, dados biométricos |
| **Finalidade** | Envio de push notifications (FCM); análise de comportamento de uso (Analytics) |
| **Base legal** | Execução de contrato (FCM) + Consentimento (Analytics) + Cláusulas Contratuais Padrão |
| **Certificações** | SOC 1/2/3 Type II, ISO 27001, ISO 27017, ISO 27018 |
| **DPA** | [Firebase Data Processing Terms](https://firebase.google.com/terms/data-processing-terms) |
| **Medidas suplementares** | Firebase Analytics desabilitado até consentimento explícito do titular (cookie/consent banner); IP anonymization habilitado; retenção de dados configurada para 2 meses; no ads personalization |
| **Avaliação de risco** | BAIXO — FCM contém apenas token de dispositivo; Analytics condicionado a consentimento |

**Controle de consentimento:** Firebase Analytics somente é inicializado quando o titular concede consentimento na categoria "Estatísticas" do cookie/consent banner. Sem consentimento, apenas FCM (push notifications) opera.

---

## 4. Avaliação de Impacto da Transferência (Transfer Impact Assessment)

### 4.1 Legislação do País de Destino (EUA)

| Aspecto | Avaliação |
|---------|-----------|
| Legislação federal de proteção de dados | Não há lei federal abrangente equivalente à LGPD. Existem leis setoriais (HIPAA, COPPA, CCPA/CPRA) |
| Acesso governamental | FISA Section 702 e EO 12333 permitem acesso a dados de não-residentes |
| Decisão de adequação da ANPD | Não emitida para os EUA |
| EU-US Data Privacy Framework | Ativo desde julho 2023; embora não se aplique diretamente ao Brasil, demonstra comprometimento dos provedores |

### 4.2 Medidas Suplementares Adotadas

Considerando a ausência de decisão de adequação da ANPD para os EUA, as seguintes medidas suplementares foram implementadas:

**Medidas Técnicas:**
1. **Criptografia end-to-end:** Todos os dados em trânsito utilizam TLS 1.3; dados em repouso utilizam AES-256
2. **Pseudonimização:** Dados enviados a provedores de IA são anonimizados
3. **Sanitização de PII:** Dados enviados a monitoramento (Sentry) passam por sanitização automática
4. **Minimização:** Cada provedor recebe apenas os dados estritamente necessários para sua função
5. **Tokenização:** Dados de pagamento são tokenizados via Stripe, sem armazenamento local
6. **Consentimento granular:** Analytics e marketing somente ativados com consentimento explícito

**Medidas Contratuais:**
1. **DPA com cada provedor:** Todos os provedores possuem DPA assinado
2. **Cláusulas Contratuais Padrão:** Adotadas com todos os provedores
3. **Notificação de incidentes:** Prazo de 24h para notificação ao Controlador
4. **Direito de auditoria:** Previsto em todos os contratos
5. **Sub-operadores:** Lista controlada com direito de objeção

**Medidas Organizacionais:**
1. **Avaliação periódica:** Revisão anual das transferências e dos provedores
2. **Monitoramento legislativo:** Acompanhamento de mudanças na legislação dos EUA e regulamentações da ANPD
3. **Plano de contingência:** Procedimento para migração de provedor em caso de mudança regulatória adversa

---

## 5. Certificações dos Provedores

### 5.1 Matriz de Certificações

| Provedor | SOC 2 Type II | ISO 27001 | ISO 27017 | ISO 27018 | PCI DSS | CSA STAR |
|----------|:---:|:---:|:---:|:---:|:---:|:---:|
| AWS | X | X | X | X | X | X |
| Sentry | X | X | - | - | - | - |
| OpenAI | X | - | - | - | - | - |
| Twilio | X | X | - | - | X | - |
| Firebase (Google) | X | X | X | X | - | - |

### 5.2 Descrição das Certificações

| Certificação | Descrição | Relevância |
|-------------|-----------|------------|
| **SOC 2 Type II** | Auditoria independente de controles de segurança, disponibilidade, integridade, confidencialidade e privacidade ao longo de um período | Demonstra controles operacionais efetivos |
| **ISO 27001** | Sistema de Gestão de Segurança da Informação | Padrão internacional de segurança |
| **ISO 27017** | Controles de segurança para serviços em nuvem | Complemento ao ISO 27001 para cloud |
| **ISO 27018** | Proteção de PII em nuvem pública | Diretamente relevante para proteção de dados pessoais |
| **PCI DSS** | Padrão de segurança para dados de cartão de pagamento | Relevante para provedores com dados financeiros |
| **CSA STAR** | Registro de segurança em nuvem da Cloud Security Alliance | Transparência adicional sobre práticas de segurança |

---

## 6. Direitos dos Titulares

Os titulares cujos dados são transferidos internacionalmente possuem todos os direitos previstos no Art. 18 da LGPD, incluindo:

1. **Confirmação e acesso:** Direito de saber quais dados são transferidos e para quais países
2. **Portabilidade:** Direito de obter seus dados em formato interoperável
3. **Eliminação:** Direito de solicitar a exclusão de dados pessoais, inclusive nos provedores internacionais
4. **Revogação de consentimento:** Para funcionalidades opcionais (analytics, IA), o consentimento pode ser revogado a qualquer momento
5. **Informação sobre compartilhamento:** Esta política é disponibilizada na Política de Privacidade do site e dos aplicativos

**Canal para exercício de direitos:** dpo@noowe.com

---

## 7. Plano de Contingência

### 7.1 Cenários de Contingência

| Cenário | Ação |
|---------|------|
| ANPD proíbe transferência para os EUA | Migração para provedores em jurisdições permitidas (UE/Brasil) em até 90 dias |
| Provedor perde certificação SOC 2/ISO 27001 | Reavaliação imediata; migração em até 60 dias se não regularizado |
| Incidente de segurança em provedor | Ativação do plano de resposta a incidentes; avaliação de impacto; notificação à ANPD em 2 dias úteis |
| Mudança legislativa nos EUA que reduza proteção | Reavaliação das medidas suplementares; implementação de medidas adicionais ou migração |

### 7.2 Provedores Alternativos Mapeados

| Serviço | Provedor Atual | Alternativa (UE/BR) |
|---------|---------------|---------------------|
| Infraestrutura | AWS (us-east-1) | AWS (sa-east-1 exclusivo) ou Oracle Cloud (São Paulo) |
| Monitoramento | Sentry (US) | Sentry self-hosted (sa-east-1) |
| IA | OpenAI (US) | Azure OpenAI (região Brasil/UE quando disponível) |
| SMS/OTP | Twilio (US) | Zenvia (Brasil) |
| Push/Analytics | Firebase (US) | OneSignal (UE) ou Expo Notifications |

---

## 8. Revisão e Atualização

| Item | Frequência |
|------|-----------|
| Revisão completa desta política | Anual (ou quando houver alteração regulatória) |
| Verificação de certificações dos provedores | Semestral |
| Avaliação de novos provedores/transferências | Antes da contratação |
| Atualização do inventário de transferências | A cada mudança de provedor ou serviço |

**Última revisão:** 25/03/2026
**Próxima revisão prevista:** 25/03/2027

---

## 9. Aprovações

| Papel | Nome | Data | Assinatura |
|-------|------|------|-----------|
| DPO | ________________________________ | ____/____/________ | ________________________________ |
| CTO | ________________________________ | ____/____/________ | ________________________________ |
| Jurídico | ________________________________ | ____/____/________ | ________________________________ |

---

_Este documento é parte integrante do programa de conformidade LGPD da NOOWE e deve ser mantido atualizado conforme as regulamentações vigentes da ANPD._
