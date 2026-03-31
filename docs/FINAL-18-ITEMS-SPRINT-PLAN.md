# Plano de Sprints — 18 Itens Finais de Melhoria

> **Data:** 2026-03-31
> **Executor:** Claude Code (Opus 4.6)
> **Total estimado:** ~22h | 4 sprints

---

## SPRINT 1 — Security & Quality (~2h)

**Objetivo:** Corrigir riscos de segurança e estabelecer quality gates.

### US-01: CORS Credentials Seguro por Padrão
**Como** administrador de segurança,
**quero** que CORS credentials esteja desabilitado por padrão,
**para que** a API não exponha cookies/headers de autenticação a origens não autorizadas.

- **Arquivo:** `platform/backend/src/config/validation.config.ts`
- **Ação:** Alterar default de `'true'` para `'false'`
- **Critério de aceite:** CORS_CREDENTIALS = false quando variável não definida
- **Esforço:** 5min

### US-02: i18n no OnboardingScreen
**Como** usuário que fala inglês ou espanhol,
**quero** ver o onboarding no meu idioma,
**para que** eu entenda as funcionalidades do app desde o primeiro uso.

- **Arquivo:** `platform/mobile/apps/client/src/screens/onboarding/OnboardingScreen.tsx`
- **Ação:** Substituir ~15 strings hardcoded PT por chamadas t()
- **i18n:** Adicionar chaves em pt-BR.ts, en-US.ts, es-ES.ts
- **Critério de aceite:** Zero strings hardcoded na tela
- **Esforço:** 1h

### US-03: i18n no PaymentScreen
**Como** usuário que fala inglês ou espanhol,
**quero** ver alertas de pagamento no meu idioma,
**para que** eu entenda mensagens de erro e confirmação ao pagar.

- **Arquivo:** `platform/mobile/apps/client/src/screens/payment/PaymentScreen.tsx`
- **Ação:** Substituir Alert.alert() hardcoded por chamadas t()
- **i18n:** Adicionar chaves nos 3 arquivos i18n
- **Critério de aceite:** Zero Alert.alert com texto hardcoded
- **Esforço:** 30min

### US-04: Jest Coverage Threshold
**Como** líder técnico,
**quero** que a CI falhe se cobertura cair abaixo de 70% lines / 60% functions,
**para que** regressões de qualidade sejam detectadas automaticamente.

- **Arquivo:** `platform/backend/package.json` (jest config)
- **Ação:** Adicionar coverageThreshold global
- **Critério de aceite:** `npm test -- --coverage` respeita thresholds
- **Esforço:** 10min

### US-05: Query Timeout no Banco
**Como** DBA,
**quero** que queries com mais de 30s sejam canceladas automaticamente,
**para que** consultas travadas não bloqueiem o pool de conexões.

- **Arquivo:** `platform/backend/src/config/database.config.ts`
- **Ação:** Adicionar `extra: { options: '-c statement_timeout=30000' }`
- **Critério de aceite:** Query longa é cancelada após 30s
- **Esforço:** 10min

### US-06: Accessibility Labels em Telas Faltantes
**Como** usuário com deficiência visual usando VoiceOver/TalkBack,
**quero** que todos os elementos interativos tenham labels descritivos,
**para que** eu possa navegar pelo app com screen reader.

- **Arquivos:** 26 telas do Client + 43 do Restaurant sem accessibilityLabel
- **Ação:** Adicionar accessibilityLabel em botões, inputs, cards interativos
- **Critério de aceite:** Todos os Touchable/Pressable/Button têm accessibilityLabel
- **Esforço:** 4h (dividido em sub-tarefas por app)

---

## SPRINT 2 — Core Feature Gaps (~4.5h)

**Objetivo:** Completar fluxos funcionais que têm backend pronto mas UI faltante.

### US-07: Resgate de Stamp Card
**Como** cliente de uma cafeteria,
**quero** resgatar minha recompensa quando completar todos os stamps,
**para que** eu receba meu café/item grátis.

- **Arquivo:** `platform/mobile/apps/client/src/screens/loyalty/LoyaltyDetailScreen.tsx`
- **Ação:** Adicionar botão "Resgatar Recompensa" quando stamps_collected >= stamps_required
- **Backend:** POST `/loyalty/stamp-cards/redeem` já existe
- **Critério de aceite:** Botão aparece quando stamps completos, chama API, atualiza UI
- **Esforço:** 1h

### US-08: Cover Charge no Pub/Bar
**Como** cliente em um pub com couvert,
**quero** ver o valor do cover charge na minha conta,
**para que** eu saiba exatamente o que estou pagando.

- **Arquivo:** `platform/mobile/apps/client/src/screens/pub-bar/TabPaymentScreen.tsx`
- **Ação:** Buscar cover_charge_amount do restaurante e adicionar como line item
- **Backend:** Campos cover_charge_* já existem na entity
- **Critério de aceite:** Cover charge aparece na conta quando habilitado para o restaurante
- **Esforço:** 1h

### US-09: Seletor de Área no Club
**Como** cliente comprando ingresso para um club,
**quero** escolher a área (Pista, VIP, Rooftop),
**para que** eu pague o preço correto e entre na área certa.

- **Arquivo:** `platform/mobile/apps/client/src/screens/club/ClubQueueScreen.tsx`
- **Ação:** Adicionar Picker/SegmentedButtons com áreas disponíveis
- **Backend:** entry_type já suporta diferenciação
- **Critério de aceite:** Área selecionada é enviada na requisição de entrada
- **Esforço:** 1h

### US-10: Prompt de Avaliação Pós-Pedido
**Como** restaurante,
**quero** que o cliente receba um prompt para avaliar após o pedido,
**para que** eu colete feedback automaticamente.

- **Arquivo:** `platform/mobile/apps/client/src/screens/orders/OrderStatusScreen.tsx`
- **Ação:** Bottom sheet com rating ao detectar status 'completed'
- **Backend:** POST `/reviews` já existe
- **Critério de aceite:** Modal aparece quando pedido completa, submete review
- **Esforço:** 1h

### US-11: Lembrete de Reserva Real
**Como** cliente com reserva,
**quero** receber uma notificação lembrando da reserva,
**para que** eu não esqueça e não tome no-show.

- **Arquivo:** `platform/backend/src/modules/reservations/reservations.service.ts`
- **Ação:** Substituir TODO por chamada real a NotificationsService
- **Critério de aceite:** Cron dispara notificação via WebSocket/push
- **Esforço:** 30min

---

## SPRINT 3 — Service-Type Features (~3.5h)

**Objetivo:** Completar funcionalidades específicas de tipos de estabelecimento.

### US-12: Preço Dinâmico para Aniversário no Club
**Como** aniversariante querendo fazer festa no club,
**quero** ver pacotes com preços calculados para minha data e grupo,
**para que** eu saiba o custo total antes de reservar.

- **Arquivo:** `platform/mobile/apps/client/src/screens/club/BirthdayBookingScreen.tsx`
- **Ação:** Fetch de pacotes com preço por data + party_size, recalcular total
- **Critério de aceite:** Preço atualiza ao mudar data ou número de convidados
- **Esforço:** 1h

### US-13: GPS Tracking para Food Truck
**Como** dono de food truck,
**quero** compartilhar minha localização em tempo real,
**para que** clientes me encontrem no mapa.

- **Arquivo:** `platform/mobile/apps/restaurant/src/screens/food-truck/FoodTruckScreen.tsx`
- **Ação:** Implementar expo-location.startLocationUpdatesAsync() + POST /geofencing/update
- **Critério de aceite:** Toggle ativa/desativa tracking, coordenadas enviadas a cada 30s
- **Esforço:** 1.5h

### US-14: Prioridade por Proximidade no Drive-Thru
**Como** gerente de drive-thru,
**quero** que pedidos de clientes mais próximos apareçam primeiro,
**para que** a comida esteja pronta quando chegarem à janela.

- **Arquivo:** `platform/mobile/apps/restaurant/src/screens/drive-thru/DriveThruScreen.tsx`
- **Ação:** Sort de orders por distância usando coordenadas do cliente + Haversine
- **Critério de aceite:** Lista reordena por proximidade quando localização disponível
- **Esforço:** 1h

---

## SPRINT 4 — Polish & Extras (~7h)

**Objetivo:** Features adicionais e melhorias sistêmicas.

### US-15: Workflow de Aprovação do Chef (Chef's Table)
**Como** chef em um restaurante Chef's Table,
**quero** aprovar/rejeitar reservas antes da confirmação,
**para que** eu controle quais experiências ofereço.

- **Arquivos:** Novo screen + entity field
- **Ação:** Adicionar campo chef_approved_at, tela ChefApprovalsScreen, lógica de aprovação
- **Critério de aceite:** Chef vê reservas pendentes, aprova/rejeita, status atualiza
- **Esforço:** 2h

### US-16: QR de Convite para Tab Compartilhada
**Como** cliente em um pub,
**quero** gerar um QR code para convidar amigos para minha tab,
**para que** todos possam pedir na mesma conta.

- **Arquivos:** `TabScreen.tsx` + backend endpoint
- **Ação:** FAB + modal com QR + endpoint de convite
- **Critério de aceite:** QR gerado, escaneável, adiciona user à tab
- **Esforço:** 2h

### US-17: Bundle Size Monitoring na CI
**Como** líder técnico,
**quero** monitorar o tamanho do bundle mobile na CI,
**para que** regressões de performance sejam detectadas antes do merge.

- **Arquivos:** package.json + CI workflow
- **Ação:** Instalar size-limit, configurar thresholds, step no CI
- **Critério de aceite:** CI falha se bundle > threshold
- **Esforço:** 1h

### US-18: Shared Components com a11y Obrigatório
**Como** desenvolvedor,
**quero** wrappers de componentes que exijam accessibilityLabel,
**para que** novas telas tenham a11y por padrão.

- **Arquivos:** Novos wrappers em `platform/mobile/shared/components/`
- **Ação:** Criar AccessibleButton, AccessibleCard, AccessibleInput
- **Critério de aceite:** TypeScript error se accessibilityLabel omitido
- **Esforço:** 2h

---

## Resumo

| Sprint | Foco | Itens | Horas | User Stories |
|--------|------|:-----:|:-----:|:------------:|
| **S1** | Security & Quality | 6 | ~6h | US-01 a US-06 |
| **S2** | Core Feature Gaps | 5 | ~4.5h | US-07 a US-11 |
| **S3** | Service-Type Features | 3 | ~3.5h | US-12 a US-14 |
| **S4** | Polish & Extras | 4 | ~7h | US-15 a US-18 |
| **TOTAL** | — | **18** | **~21h** | **18** |
