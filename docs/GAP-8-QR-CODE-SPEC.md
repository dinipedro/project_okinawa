# GAP-8: QR Code de Acesso — Especificação Revisada

> O QR Code NÃO é um cardápio digital web separado.
> É o **ponto de entrada do cliente no restaurante/mesa** dentro do app NOOWE Client.

---

## Fluxo do Cliente

```
1. Cliente chega no restaurante
   ↓
2. Escaneia QR Code na mesa (câmera nativa ou app)
   ↓
3. Deep link: noowebr.com/r/{slug}?table={table_id}
   ↓
4. Se app instalado: abre NOOWE Client → RestaurantScreen com mesa pré-selecionada
   Se app NÃO instalado: abre página web com botões App Store / Play Store
   ↓
5. Cliente navega cardápio (MenuScreen existente) com contexto da mesa
   ↓
6. Cliente faz pedido → Order criada com table_id, order_type=dine_in
   ↓
7. KDS Brain processa (auto-fire, convergência, estações)
   ↓
8. Cliente paga pelo app (wallet, PIX, cartão) → Payment Gateway
```

## Fluxo do Restaurante (gerar QR Codes)

```
1. Owner/Manager abre tela "QR Codes das Mesas"
   ↓
2. Lista todas as mesas com QR Code gerado
   ↓
3. Cada QR Code contém: noowebr.com/r/{restaurant_slug}?table={table_number}
   ↓
4. Opções: Visualizar, Imprimir (individual ou batch), Download PNG
   ↓
5. QR Code já contém logo do restaurante (customizável)
```

## Tipos de QR Code

| Tipo | URL | Uso | Quando |
|------|-----|-----|--------|
| **Restaurante** | `noowebr.com/r/{slug}` | Acesso geral ao restaurante | Entrada, vitrine, redes sociais |
| **Mesa** | `noowebr.com/r/{slug}?table={table_number}` | Acesso direto à mesa | Adesivo na mesa |
| **Fila/Waitlist** | `noowebr.com/r/{slug}?action=waitlist` | Entrar na fila de espera | Entrada do restaurante |

## O que precisa ser implementado

### Backend

1. **Entidade `restaurant_qr_configs`** (ou usar a existente `menu_qr_configs` renomeada):
   - restaurant_id, slug (UNIQUE), self_order_enabled, self_pay_enabled, theme (JSONB), logo_url

2. **Endpoints:**
   - `GET /qr-access/resolve/:slug?table=X` — @Public, retorna {restaurant_id, restaurant_name, table_id, table_number, service_type, self_order_enabled}
   - `POST /qr-access/generate` — OWNER/MANAGER, gera QR Code PNG com logo
   - `GET /qr-access/tables/:restaurantId` — OWNER/MANAGER, lista mesas com URLs de QR

3. **Resolver de QR:** Quando app client recebe deep link `noowebr.com/r/{slug}?table=X`:
   - Busca restaurante pelo slug
   - Se `table` presente: identifica mesa e pré-seleciona
   - Retorna dados para navegação direta

### Mobile Client (app client)

1. **QR Scanner integrado:** Já existe `QRScannerScreen.tsx` — verificar se processa o formato `noowebr.com/r/{slug}?table=X`
2. **Deep link handler:** Ao receber link `noowebr.com/r/{slug}?table=X`:
   - Navegar para `RestaurantScreen` com restaurantId
   - Se table presente: preencher contexto de mesa (table_id no pedido)
   - Mostrar banner: "Mesa {X} — {Restaurante}"
3. **Contexto de mesa:** Quando cliente faz pedido via QR/mesa, o `table_id` deve ser incluído automaticamente no Order

### Mobile Restaurant (app restaurant)

1. **QR Code Generator Screen:** (pode estar no QRCodeBatchScreen existente ou novo)
   - Lista mesas do restaurante
   - Para cada mesa: preview do QR Code
   - Botão "Gerar QR" (individual) e "Gerar Todos" (batch)
   - Opção de download PNG / imprimir
   - Customização: logo, cor de fundo

### Web (fallback para quem não tem o app)

1. **Landing page simples:** `noowebr.com/r/{slug}`
   - Nome do restaurante + logo
   - Botões: "Abrir no App" (deep link) / "Baixar App" (store links)
   - NÃO é um cardápio web completo — apenas redirecionamento

---

## O que NÃO precisa ser feito

- ❌ Cardápio digital web separado (Next.js, etc.)
- ❌ Pedido via web browser (tudo pelo app)
- ❌ Pagamento via web (tudo pelo app)
- ❌ Sistema de autoatendimento web independente

## Esforço revisado

| Item | Esforço |
|------|---------|
| Backend (QR resolver + generator) | 4h |
| Mobile Client (deep link handler + mesa context) | 4h |
| Mobile Restaurant (QR generator screen) | 3h |
| Web landing page (fallback) | 2h |
| **Total** | **~13h** (antes era 16h) |
