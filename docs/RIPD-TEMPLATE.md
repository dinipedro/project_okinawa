# RIPD - Relatório de Impacto à Proteção de Dados Pessoais

**Projeto:** NOOWE — Plataforma de Gestão para Restaurantes
**Versão:** 1.0
**Data:** ____/____/________
**Responsável pela elaboração:** ________________________________
**Status:** [ ] Rascunho  [ ] Em Revisão  [ ] Aprovado

---

## 1. Identificação e Descrição do Tratamento

### 1.1 Descrição Geral
| Campo | Descrição |
|-------|-----------|
| Nome do projeto/sistema | NOOWE — Plataforma de Gestão para Restaurantes |
| Finalidade principal | Gestão integrada de operações de restaurantes e experiência do cliente |
| Natureza do tratamento | [ ] Coleta  [ ] Armazenamento  [ ] Uso  [ ] Compartilhamento  [ ] Eliminação |
| Volume estimado de titulares | ________ titulares/ano |
| Área geográfica | ________ |

### 1.2 Categorias de Dados Pessoais Tratados

| Categoria | Dados | Base Legal (Art. 7, LGPD) | Finalidade |
|-----------|-------|--------------------------|------------|
| Dados cadastrais | Nome, e-mail, telefone, CPF | Execução de contrato (Art. 7, V) | Cadastro e identificação do usuário |
| Dados de localização | Geolocalização (lat/long) | Consentimento (Art. 7, I) | Busca por restaurantes próximos |
| Dados financeiros | Dados de pagamento (tokenizados) | Execução de contrato (Art. 7, V) | Processamento de pagamentos |
| Dados de uso | Histórico de pedidos, avaliações | Legítimo interesse (Art. 7, IX) | Personalização e recomendações |
| Dados biométricos | Impressão digital / Face ID (device-local) | Consentimento (Art. 7, I) | Autenticação biométrica |
| Dados de comunicação | Preferências de notificação | Consentimento (Art. 7, I) | Envio de notificações |
| Dados sensíveis | Restrições alimentares | Consentimento específico (Art. 11, I) | Segurança alimentar |

### 1.3 Fluxo de Dados

```
[Titular] ---> [App Mobile] ---> [API Backend] ---> [PostgreSQL]
                                       |                  |
                                       v                  v
                                   [Redis Cache]    [Backups S3]
                                       |
                                       v
                              [Serviços Terceiros]
                              (Stripe, Twilio, OpenAI,
                               Sentry, Firebase)
```

### 1.4 Tecnologias Envolvidas
- **Backend:** NestJS + TypeORM + PostgreSQL + Redis
- **Mobile:** React Native + Expo
- **Infraestrutura:** AWS (sa-east-1 primário, us-east-1 para serviços específicos)
- **Monitoramento:** Sentry (US)
- **IA:** OpenAI API (US)
- **Comunicação:** Twilio (US)
- **Push Notifications:** Firebase Cloud Messaging (US)

---

## 2. Partes Envolvidas

### 2.1 Controlador
| Campo | Informação |
|-------|-----------|
| Razão social | ________________________________ |
| CNPJ | ________________________________ |
| Endereço | ________________________________ |
| Representante legal | ________________________________ |

### 2.2 Operadores

| Operador | Serviço | Dados Tratados | País |
|----------|---------|---------------|------|
| Amazon Web Services | Infraestrutura (hosting, banco de dados) | Todos os dados | Brasil / EUA |
| Stripe | Processamento de pagamentos | Dados financeiros tokenizados | EUA |
| Twilio | Comunicação SMS/WhatsApp | Telefone, conteúdo de mensagem | EUA |
| OpenAI | Sugestões por IA | Dados de contexto (anonimizados) | EUA |
| Sentry | Monitoramento de erros | Dados técnicos, IDs de sessão | EUA |
| Firebase | Push notifications, analytics | Token do dispositivo, eventos de uso | EUA |

### 2.3 Encarregado de Proteção de Dados (DPO)
| Campo | Informação |
|-------|-----------|
| Nome | ________________________________ |
| E-mail | dpo@noowe.com |
| Telefone | ________________________________ |
| Canal de atendimento ao titular | ________________________________ |

---

## 3. Necessidade e Proporcionalidade

### 3.1 Teste de Necessidade
Para cada categoria de dados, justificar por que o tratamento é necessário:

| Dado | Necessidade | Alternativa menos invasiva? | Justificativa |
|------|-------------|----------------------------|---------------|
| CPF | Emissão de NFC-e e compliance fiscal | Não — exigência legal | Obrigação regulatória (Art. 7, II) |
| E-mail | Comunicação essencial (confirmações) | Não | Canal primário de recuperação de conta |
| Telefone | Autenticação OTP e notificações | Poderia usar apenas e-mail, mas impacta segurança | Segundo fator de autenticação |
| Geolocalização | Busca por restaurantes | Poderia usar CEP manual | Consentimento explícito solicitado |
| Dados de pagamento | Processamento de transações | Não — necessário para a operação | Tokenização via Stripe, sem armazenamento local |

### 3.2 Princípio da Minimização
- [ ] Apenas dados estritamente necessários são coletados
- [ ] Dados são eliminados após o período de retenção
- [ ] Campos opcionais são claramente marcados
- [ ] Dados não essenciais requerem consentimento explícito

### 3.3 Períodos de Retenção

| Categoria | Período | Justificativa | Base Legal |
|-----------|---------|---------------|------------|
| Dados cadastrais | Duração da conta + 5 anos | Obrigação fiscal/contábil | Art. 16, I |
| Dados financeiros | 5 anos | Obrigação fiscal (CTN) | Art. 16, I |
| Logs de acesso | 6 meses | Marco Civil da Internet | Art. 15, Lei 12.965/2014 |
| Dados de uso/analytics | 2 anos | Legítimo interesse | Art. 16, II |
| Dados de geolocalização | 30 dias | Minimização | Consentimento |
| Dados de marketing | 90 dias sem interação | Minimização | Consentimento |

---

## 4. Riscos ao Titular

### 4.1 Matriz de Riscos

| # | Risco | Probabilidade | Impacto | Nível | Dados Afetados |
|---|-------|---------------|---------|-------|---------------|
| R1 | Vazamento de dados pessoais por invasão | Baixa | Alto | Alto | Todos |
| R2 | Acesso não autorizado por funcionário | Média | Médio | Médio | Dados cadastrais |
| R3 | Transferência internacional sem base legal | Baixa | Alto | Médio | Dados em provedores US |
| R4 | Perda de dados por falha de infraestrutura | Baixa | Alto | Médio | Todos |
| R5 | Uso indevido de dados para profiling | Baixa | Médio | Baixo | Dados de uso |
| R6 | Compartilhamento com sub-operadores sem controle | Baixa | Alto | Médio | Variável |
| R7 | Não atendimento de direitos do titular no prazo | Média | Médio | Médio | Todos |
| R8 | Exposição de PII em logs | Média | Médio | Médio | E-mail, telefone, CPF |
| R9 | Retenção além do necessário | Média | Baixo | Baixo | Dados expirados |
| R10 | Coleta de dados de menores sem consentimento parental | Baixa | Alto | Médio | Dados cadastrais |

### 4.2 Escala de Classificação
- **Probabilidade:** Baixa / Média / Alta
- **Impacto:** Baixo / Médio / Alto
- **Nível de Risco:** Baixo (verde) / Médio (amarelo) / Alto (vermelho) / Crítico

---

## 5. Medidas Mitigadoras

### 5.1 Medidas Técnicas

| Risco | Medida | Status | Responsável |
|-------|--------|--------|-------------|
| R1 | Criptografia AES-256 para dados em repouso | [ ] Implementado | Eng. Backend |
| R1 | TLS 1.3 para dados em trânsito | [ ] Implementado | DevOps |
| R1 | WAF + Rate Limiting + IP Allowlisting | [ ] Implementado | DevOps |
| R2 | RBAC com 7 níveis de papel | [ ] Implementado | Eng. Backend |
| R2 | Audit log completo com imutabilidade | [ ] Implementado | Eng. Backend |
| R3 | Cláusulas Contratuais Padrão com provedores | [ ] Em andamento | Jurídico |
| R4 | Backups automatizados com retenção de 30 dias | [ ] Implementado | DevOps |
| R4 | Disaster Recovery com RTO < 4h | [ ] Implementado | DevOps |
| R5 | Pseudonimização de dados para analytics | [ ] Implementado | Eng. Backend |
| R6 | DPA assinado com todos os sub-operadores | [ ] Em andamento | Jurídico |
| R7 | Portal de direitos do titular automatizado | [ ] Em desenvolvimento | Eng. Full Stack |
| R8 | Sanitização de PII em logs (mascaramento) | [ ] Implementado | Eng. Backend |
| R9 | Jobs automatizados de purge por retenção | [ ] Implementado | Eng. Backend |
| R10 | Verificação de idade no cadastro | [ ] Implementado | Eng. Mobile |

### 5.2 Medidas Organizacionais

| Medida | Descrição | Status |
|--------|-----------|--------|
| Política de privacidade | Documento público acessível no app e site | [ ] Publicado |
| Termos de uso | Aceite obrigatório no cadastro | [ ] Publicado |
| Treinamento de equipe | Treinamento anual LGPD para todos os funcionários | [ ] Agendado |
| Plano de resposta a incidentes | Procedimento documentado para vazamentos | [ ] Aprovado |
| Revisão periódica | RIPD revisado a cada 12 meses ou mudança relevante | [ ] Agendado |
| Gestão de fornecedores | Avaliação de privacidade antes da contratação | [ ] Implementado |

### 5.3 Medidas de Transparência

| Medida | Descrição | Status |
|--------|-----------|--------|
| Banner de cookies | Consentimento granular (4 categorias) | [ ] Implementado |
| Centro de privacidade | Painel no app para gerenciar dados e consentimentos | [ ] Em desenvolvimento |
| Canal do DPO | E-mail e formulário para exercício de direitos | [ ] Ativo |
| Relatório de transparência | Publicação anual de estatísticas de requisições | [ ] Planejado |

---

## 6. Parecer do DPO

### 6.1 Análise

_(Espaço reservado para o parecer técnico do DPO)_

O Encarregado de Proteção de Dados Pessoais, após análise deste Relatório de Impacto à Proteção de Dados Pessoais, emite o seguinte parecer:

**Quanto à legalidade do tratamento:**
- [ ] Os tratamentos descritos possuem base legal adequada conforme Art. 7 e Art. 11 da LGPD
- [ ] As finalidades estão claramente definidas e são legítimas
- [ ] O princípio da minimização está sendo observado

**Quanto aos riscos identificados:**
- [ ] Os riscos estão adequadamente mapeados
- [ ] As medidas mitigadoras são proporcionais aos riscos
- [ ] Existem riscos residuais aceitáveis após mitigação

**Quanto às transferências internacionais:**
- [ ] As transferências possuem base legal (Art. 33, LGPD)
- [ ] Cláusulas Contratuais Padrão estão em vigor
- [ ] Os provedores possuem certificações adequadas (SOC 2, ISO 27001)

### 6.2 Recomendações

1. ________________________________
2. ________________________________
3. ________________________________

### 6.3 Conclusão

- [ ] **APROVADO** — O tratamento pode prosseguir conforme descrito
- [ ] **APROVADO COM RESSALVAS** — O tratamento pode prosseguir desde que as recomendações acima sejam implementadas até ____/____/________
- [ ] **REPROVADO** — O tratamento não deve prosseguir até que as pendências sejam resolvidas

---

**Assinaturas:**

| Papel | Nome | Assinatura | Data |
|-------|------|-----------|------|
| Controlador | | | |
| DPO | | | |
| Responsável técnico | | | |

---

_Este documento deve ser revisado a cada 12 meses, ou sempre que houver alteração significativa no tratamento de dados pessoais. Conforme Art. 38 da LGPD, a ANPD pode solicitar este relatório a qualquer momento._
