# i18n (Internationalization) - Guia de Padronização

Este documento define o padrão de internacionalização para o projeto mobile Okinawa.

## Estrutura de Arquivos

```
mobile/shared/i18n/
├── index.ts              # Exportações principais e hook useI18n
├── pt-BR.ts              # Traduções em Português (Brasil) - IDIOMA BASE
├── en-US.ts              # Traduções em Inglês (EUA)
├── es-ES.ts              # Traduções em Espanhol (Espanha)
├── dataTranslations.ts   # Mapeamentos de enums/status do backend
└── README.md             # Este documento
```

## Idiomas Suportados

| Código   | Idioma               | Flag |
|----------|---------------------|------|
| `pt-BR`  | Português (Brasil)  | 🇧🇷   |
| `en-US`  | English (USA)       | 🇺🇸   |
| `es-ES`  | Español (España)    | 🇪🇸   |

## Padrão de Uso nas Telas

### 1. Importação Padrão

```typescript
import { useI18n } from '@/shared/hooks/useI18n';
```

### 2. Uso do Hook

```typescript
export default function MyScreen() {
  const { t, language, changeLanguage, languageOptions } = useI18n();

  return (
    <View>
      <Text>{t('common.loading')}</Text>
    </View>
  );
}
```

### 3. Parâmetros Dinâmicos

Use `{{paramName}}` para parâmetros:

```typescript
// No arquivo de tradução:
orderNumber: 'Pedido #{{number}}'

// No componente:
<Text>{t('orders.orderNumber', { number: order.id })}</Text>
```

## Estrutura das Chaves de Tradução

### Convenção de Nomenclatura

- Use **camelCase** para chaves
- Agrupe por domínio/funcionalidade
- Use namespaces aninhados para status/tipos

```typescript
{
  // Namespace principal
  orders: {
    title: 'Pedidos',

    // Status aninhados
    status: {
      pending: 'Pendente',
      confirmed: 'Confirmado',
    },

    // Tipos aninhados
    orderType: {
      dine_in: 'Comer no local',
      pickup: 'Retirada',
    }
  }
}
```

### Namespaces Principais

| Namespace       | Descrição                           |
|-----------------|-------------------------------------|
| `common`        | Textos genéricos (loading, error)   |
| `auth`          | Autenticação e login                |
| `navigation`    | Nomes de navegação/menu             |
| `orders`        | Pedidos e status                    |
| `reservations`  | Reservas                            |
| `menu`          | Cardápio e itens                    |
| `cart`          | Carrinho de compras                 |
| `payment`       | Pagamentos                          |
| `restaurant`    | Dados do restaurante                |
| `reviews`       | Avaliações                          |
| `profile`       | Perfil do usuário                   |
| `notifications` | Notificações                        |
| `wallet`        | Carteira digital                    |
| `tips`          | Gorjetas                            |
| `staff`         | Equipe (Restaurant App)             |
| `kds`           | Sistema de cozinha                  |
| `tables`        | Mesas                               |
| `financial`     | Financeiro                          |
| `settings`      | Configurações                       |
| `errors`        | Mensagens de erro                   |
| `success`       | Mensagens de sucesso                |
| `empty`         | Estados vazios                      |
| `time`          | Formatação de tempo                 |
| `loyalty`       | Programa de fidelidade              |
| `qrCode`        | Código QR                           |

## Tradução de Dados do Backend

Use o arquivo `dataTranslations.ts` para mapear enums do backend:

```typescript
import { getOrderStatusKey, getPaymentMethodKey } from '@/shared/i18n/dataTranslations';

// Uso
const statusKey = getOrderStatusKey(order.status);
const translatedStatus = t(statusKey);
```

### Tipos Disponíveis

- `OrderStatus` - Status de pedidos
- `OrderType` - Tipos de pedido (dine_in, pickup, delivery)
- `ReservationStatus` - Status de reservas
- `TableStatus` - Status de mesas
- `PaymentMethod` - Métodos de pagamento
- `StaffRole` - Funções da equipe
- `StaffStatus` - Status do funcionário
- `DietaryInfo` - Informações dietéticas
- `WalletTransactionType` - Tipos de transação
- `TipType` - Tipos de gorjeta
- `LoyaltyTier` - Níveis de fidelidade
- `NotificationType` - Tipos de notificação

## Regras de Padronização

### ✅ FAZER

1. **Sempre usar o hook `useI18n()`** - Padrão consistente em todas as telas
2. **Manter os 3 arquivos sincronizados** - pt-BR, en-US, es-ES
3. **Usar acentuação correta** em pt-BR (á, é, í, ó, ú, ã, õ, ç)
4. **Usar `dataTranslations.ts`** para enums do backend
5. **Adicionar novas chaves em TODOS os idiomas**
6. **Seguir a estrutura de namespaces existente**

### ❌ NÃO FAZER

1. **Não usar strings hardcoded** - Sempre usar `t('key')`
2. **Não usar fallbacks hardcoded** - Ex: `t('key') || 'Texto'`
3. **Não misturar idiomas** em um mesmo arquivo
4. **Não criar chaves duplicadas**
5. **Não usar snake_case** em chaves (exceto para status que vêm do backend)

## Formatação de Datas

Use `date-fns` com locale apropriado:

```typescript
import { format } from 'date-fns';
import { ptBR as dateFnsPtBR } from 'date-fns/locale';

// Uso
format(new Date(item.created_at), 'dd/MM/yyyy HH:mm', { locale: dateFnsPtBR })
```

## Adicionando Novo Idioma

1. Criar arquivo `{locale}.ts` (ex: `fr-FR.ts`)
2. Copiar estrutura de `pt-BR.ts`
3. Traduzir todas as strings
4. Adicionar no `index.ts`:

```typescript
import { frFR } from './fr-FR';

export const translations = {
  'pt-BR': ptBR,
  'en-US': enUS,
  'es-ES': esES,
  'fr-FR': frFR,  // Novo
};

export const languageOptions = [
  // ...existentes
  { code: 'fr-FR', name: 'Français', flag: '🇫🇷' },
];
```

## Checklist para Novas Telas

- [ ] Importar `useI18n` do hook compartilhado
- [ ] Usar `const { t } = useI18n()` no componente
- [ ] Substituir todas as strings por `t('namespace.key')`
- [ ] Adicionar chaves faltantes nos 3 arquivos de idioma
- [ ] Testar troca de idioma em runtime
- [ ] Verificar formatação de datas com locale correto

## Manutenção

- **Revisão periódica**: Verificar chaves não utilizadas
- **Sincronização**: Manter os 3 arquivos com as mesmas chaves
- **Encoding**: Garantir UTF-8 para caracteres especiais
- **TypeScript**: Usar o tipo `TranslationKeys` para type-safety
