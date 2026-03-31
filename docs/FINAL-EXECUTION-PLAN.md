# Plano Final de Execução — De 52% para ~85%

> Todos os itens que Claude pode executar (sem credenciais externas)
> Organizado por impacto e dependência

---

## SPRINT FINAL-1: Service-Type Gating + Role Filtering (~8h)

| # | Item | Impacto | Esforço |
|---|------|---------|---------|
| F1 | RestaurantScreen: usar useServiceTypeFeatures() para mostrar/esconder CTAs | +10% | 3h |
| F2 | Restaurant navigation: filtrar drawer por UserRole | +7% | 3h |
| F3 | Cash payment confirmation flow (staff UI) | +3% | 2h |

## SPRINT FINAL-2: Post-Payment Automation (~6h)

| # | Item | Impacto | Esforço |
|---|------|---------|---------|
| F4 | Table state machine: OCCUPIED→CLEANING→AVAILABLE após pagamento | +3% | 2h |
| F5 | Waitlist auto-advance: chamar próximo quando mesa libera | +2% | 2h |
| F6 | HomeScreen: geolocation real (remover lat:0,lng:0) | +1% | 1h |
| F7 | Profile: avatar upload + dietary preferences fields | +1% | 1h |

## SPRINT FINAL-3: Service-Type Specific Fixes (~8h)

| # | Item | Impacto | Esforço |
|---|------|---------|---------|
| F8 | Pickup code generation para Quick Service/Drive-Thru | +2% | 2h |
| F9 | Stamp card auto-award + redemption para Café | +1% | 2h |
| F10 | Chef's Table: capacity enforcement + pre-pay validation | +1% | 1h |
| F11 | Buffet: covers-based pricing validation no backend | +1% | 1h |
| F12 | Food Truck: dynamic location update endpoint | +1% | 1h |
| F13 | Scheduled notifications: review prompt + reservation reminder | +1% | 1h |

## PENDÊNCIAS HUMANAS (não executáveis por Claude)

| # | Item | Responsável |
|---|------|-------------|
| H1 | Asaas API key (PIX + Cartão real) | DevOps |
| H2 | Stripe Terminal (Tap-to-Pay real) | DevOps |
| H3 | FCM Server Key (Push notifications reais) | DevOps |
| H4 | SendGrid API Key (Email confirmações) | DevOps |
| H5 | Focus NFe Token (NFC-e fiscal real) | DevOps |
| H6 | AWS SNS (SMS real) | DevOps |

**Total executável: ~22h | Score projetado: 52% → ~85%**
