# Template de Mapeamento de Restaurantes
## Planilha de Qualificação - 100 Targets

---

## 📋 Estrutura da Planilha

### Aba 1: Lista Principal de Targets

| Coluna | Campo | Descrição | Exemplo |
|--------|-------|-----------|---------|
| A | **ID** | Número sequencial | 001 |
| B | **Nome do Restaurante** | Nome oficial | Makoto Sushi |
| C | **Tipo de Serviço** | Categoria do estabelecimento | Casual Dining |
| D | **Bairro** | Localização | Jardins |
| E | **Cluster** | Agrupamento geográfico | Premium A |
| F | **Ticket Médio** | Valor médio por pessoa | R$ 120 |
| G | **Volume Estimado** | Atendimentos/mês | 1.200 |
| H | **Decisor** | Nome do proprietário/gerente | Carlos Tanaka |
| I | **Cargo** | Função do decisor | Proprietário |
| J | **LinkedIn** | URL do perfil | linkedin.com/in/... |
| K | **WhatsApp** | Número de contato | (11) 99999-0000 |
| L | **Email** | Email do decisor | carlos@makoto.com |
| M | **Instagram** | @ do restaurante | @makotosushi |
| N | **Seguidores** | Número de seguidores | 15.000 |
| O | **Nota Google** | Avaliação média | 4.6 |
| P | **Qtd Avaliações** | Total de reviews | 850 |
| Q | **Sistema Atual** | Software que usa | iFood + Goomer |
| R | **Dor Identificada** | Problema visível | Filas nos fins de semana |
| S | **Oportunidade** | Por que abordar | Alto volume, público digital |
| T | **Prioridade** | Alta/Média/Baixa | Alta |
| U | **Score Total** | Pontuação calculada | 85 |

---

### Aba 2: Tracking de Contatos

| Coluna | Campo | Descrição |
|--------|-------|-----------|
| A | **ID** | Link para lista principal |
| B | **Nome** | Nome do restaurante |
| C | **Data 1º Contato** | Quando foi feito |
| D | **Canal 1º Contato** | LinkedIn/WhatsApp/Email |
| E | **Script Usado** | Qual template |
| F | **Resposta 1** | Sim/Não/Aguardando |
| G | **Data Follow-up 1** | Quando foi feito |
| H | **Resposta 2** | Sim/Não/Aguardando |
| I | **Data Follow-up 2** | Quando foi feito |
| J | **Resposta 3** | Sim/Não/Aguardando |
| K | **Status Atual** | Lead/Demo/Proposta/Fechado/Perdido |
| L | **Data Demo** | Quando agendada |
| M | **Data Proposta** | Quando enviada |
| N | **Data Fechamento** | Quando assinou |
| O | **Motivo Perdido** | Se aplicável |
| P | **Observações** | Notas gerais |

---

### Aba 3: Sistema de Pontuação (Scoring)

**Critérios de Qualificação (Total: 100 pontos)**

#### Critérios Obrigatórios (Eliminatórios)
| Critério | Requisito | Eliminatório? |
|----------|-----------|---------------|
| Ticket Médio | ≥ R$ 60 | ✅ Sim |
| Volume Mensal | ≥ 800 atendimentos | ✅ Sim |
| Localização | Clusters definidos | ✅ Sim |
| Decisor Acessível | Contato disponível | ✅ Sim |

#### Critérios de Pontuação

**Ticket Médio (máx 20 pts)**
| Faixa | Pontos |
|-------|--------|
| R$ 60-100 | 10 |
| R$ 100-150 | 15 |
| R$ 150-250 | 20 |
| > R$ 250 | 18 |

**Volume Mensal (máx 20 pts)**
| Faixa | Pontos |
|-------|--------|
| 800-1.200 | 10 |
| 1.200-2.000 | 15 |
| > 2.000 | 20 |

**Avaliação Google (máx 15 pts)**
| Faixa | Pontos |
|-------|--------|
| 4.0-4.2 | 5 |
| 4.2-4.5 | 10 |
| > 4.5 | 15 |

**Presença Digital (máx 15 pts)**
| Critério | Pontos |
|----------|--------|
| Instagram > 5k | +5 |
| Instagram > 15k | +10 |
| Postagem recente (< 7 dias) | +5 |

**Dor Identificada (máx 15 pts)**
| Tipo de Dor | Pontos |
|-------------|--------|
| Filas/Espera | +10 |
| Reclamações atendimento | +10 |
| Múltiplos sistemas | +5 |
| Sem sistema digital | +15 |

**Fit Estratégico (máx 15 pts)**
| Critério | Pontos |
|----------|--------|
| Tipo de serviço prioritário | +10 |
| Múltiplas unidades | +5 |
| Indicação/Networking | +5 |
| Prêmios/Reconhecimento | +5 |

---

## 📊 Dashboard de Resumo

### Métricas Gerais

```
┌─────────────────────────────────────────────────────────────────┐
│                    PIPELINE DE RESTAURANTES                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  FUNIL                                                          │
│  ─────                                                          │
│  🎯 Targets Mapeados:        ___/100                            │
│  📤 Primeiro Contato:        ___                                │
│  💬 Responderam:             ___                                │
│  📅 Demos Agendadas:         ___                                │
│  📋 Propostas Enviadas:      ___                                │
│  ✅ Contratos Fechados:      ___/30                             │
│                                                                 │
│  POR STATUS                                                     │
│  ──────────                                                     │
│  🔵 Não contactado:          ___                                │
│  🟡 Aguardando resposta:     ___                                │
│  🟢 Em negociação:           ___                                │
│  ✅ Fechado:                 ___                                │
│  ❌ Perdido:                 ___                                │
│                                                                 │
│  POR TIPO DE SERVIÇO                                            │
│  ────────────────────                                           │
│  Casual Dining:      ___/8                                      │
│  Fine Dining:        ___/4                                      │
│  Pub & Bar:          ___/5                                      │
│  Fast Casual:        ___/4                                      │
│  Café & Padaria:     ___/3                                      │
│  Outros:             ___/6                                      │
│                                                                 │
│  POR CLUSTER                                                    │
│  ───────────                                                    │
│  Premium A:          ___/10                                     │
│  Premium B:          ___/8                                      │
│  Emergente:          ___/7                                      │
│  Teste:              ___/5                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔍 Critérios de Busca por Fonte

### Fontes Primárias

#### 1. Google Maps
**Busca**: "[tipo de restaurante] [bairro] [cidade]"
**Filtros**: 
- Avaliação ≥ 4.0
- Aberto agora (para validar funcionamento)

**Dados coletados**:
- Nome, endereço, telefone
- Avaliação e quantidade de reviews
- Horário de funcionamento
- Fotos (para avaliar tamanho/perfil)

#### 2. Instagram
**Busca**: Hashtags locais (#restaurantesjardins, #gaborasp)
**Filtros**:
- Conta comercial
- > 3.000 seguidores
- Postagem recente

**Dados coletados**:
- @ e bio
- Seguidores e engajamento
- Link do site/reserva
- Stories de clientes (volume)

#### 3. TripAdvisor
**Busca**: Por cidade e tipo de culinária
**Filtros**:
- Ranking top 100
- Avaliação ≥ 4.0

**Dados coletados**:
- Ranking e avaliação
- Faixa de preço
- Tipo de cozinha
- Comentários recentes

#### 4. LinkedIn
**Busca**: "proprietário restaurante [cidade]"
**Filtros**:
- 2º grau de conexão
- Ativo no último mês

**Dados coletados**:
- Nome e cargo
- Histórico profissional
- Conexões em comum
- Publicações recentes

### Fontes Secundárias

#### 5. Guias Gastronômicos
- Veja Comer & Beber
- TimeOut
- Paladar (Estadão)
- Guia Michelin

#### 6. Associações
- ANR (Associação Nacional de Restaurantes)
- Abrasel
- Sindicatos locais

#### 7. Eventos
- NRA Show
- Food Service Congress
- Feiras gastronômicas

---

## 📝 Template de Pesquisa Individual

### Ficha de Qualificação

```
═══════════════════════════════════════════════════════════════════
                     FICHA DE QUALIFICAÇÃO
═══════════════════════════════════════════════════════════════════

IDENTIFICAÇÃO
─────────────
Nome do Restaurante: _________________________________________
Tipo de Serviço: ____________________________________________
Endereço: ___________________________________________________
Bairro/Cluster: _____________________________________________

CONTATO
───────
Decisor: ____________________________________________________
Cargo: ______________________________________________________
Telefone: ___________________________________________________
Email: ______________________________________________________
LinkedIn: ___________________________________________________

MÉTRICAS
────────
Ticket Médio Estimado: R$ ___________________________________
Volume Mensal Estimado: _____________________________________
Nota Google: _____ (_____ avaliações)
Instagram: @_____________ (_____ seguidores)

ANÁLISE
───────
Sistema(s) Atual(is): _______________________________________
Dor(es) Identificada(s): ____________________________________
_____________________________________________________________
Oportunidade: _______________________________________________
_____________________________________________________________

QUALIFICAÇÃO
────────────
[ ] Ticket ≥ R$ 60          [ ] Volume ≥ 800/mês
[ ] Cluster prioritário     [ ] Decisor acessível

SCORE: ____/100
PRIORIDADE: [ ] Alta  [ ] Média  [ ] Baixa

OBSERVAÇÕES
───────────
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________

═══════════════════════════════════════════════════════════════════
```

---

## 📅 Rotina de Atualização

### Diária
- [ ] Adicionar novos leads encontrados
- [ ] Atualizar status de contatos
- [ ] Registrar respostas recebidas

### Semanal
- [ ] Revisar scores e prioridades
- [ ] Analisar taxa de conversão por canal
- [ ] Identificar padrões (o que funciona)
- [ ] Planejar próxima semana de outreach

### Mensal
- [ ] Relatório de performance do funil
- [ ] Ajustar critérios de qualificação
- [ ] Identificar novos clusters/segmentos
- [ ] Atualizar lista de targets

---

## 🎯 Metas por Semana

| Semana | Novos Mapeados | 1º Contato | Demos | Propostas | Fechamentos |
|--------|----------------|------------|-------|-----------|-------------|
| 1 | 30 | 20 | 3 | 1 | 0 |
| 2 | 30 | 25 | 5 | 2 | 1 |
| 3 | 25 | 25 | 5 | 3 | 2 |
| 4 | 15 | 25 | 7 | 4 | 3 |
| 5 | - | 20 | 7 | 5 | 4 |
| 6 | - | 15 | 8 | 6 | 5 |
| 7 | - | 10 | 8 | 7 | 5 |
| 8 | - | 10 | 7 | 6 | 5 |
| **Total** | **100** | **150** | **50** | **34** | **25** |

*Considerando contatos múltiplos por lead e taxa de conversão progressiva*

---

## 📎 Links Úteis

- [Google My Business](https://business.google.com/) - Para buscar e validar
- [LinkedIn Sales Navigator](https://linkedin.com/sales) - Para prospecção
- [Hunter.io](https://hunter.io) - Para encontrar emails
- [Lusha](https://lusha.com) - Para dados de contato
- [SimilarWeb](https://similarweb.com) - Para analisar tráfego web

---

*Template criado para Okinawa Platform*
*Versão 1.0 - Fevereiro 2026*
