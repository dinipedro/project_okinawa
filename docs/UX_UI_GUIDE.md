# UX/UI Design Guide

Comprehensive design system and interface guidelines for Project Okinawa.

## Table of Contents

- [Design Philosophy](#design-philosophy)
- [Brand Identity](#brand-identity)
- [Color System](#color-system)
- [Typography](#typography)
- [Spacing and Layout](#spacing-and-layout)
- [Components](#components)
- [Icons and Imagery](#icons-and-imagery)
- [Interaction Patterns](#interaction-patterns)
- [Accessibility](#accessibility)
- [Platform Guidelines](#platform-guidelines)

---

## Design Philosophy

### Core Principles

1. **Clarity**: Information should be clear and easily understood
2. **Efficiency**: Minimize steps to complete tasks
3. **Consistency**: Uniform patterns across the platform
4. **Delight**: Create enjoyable experiences
5. **Accessibility**: Usable by everyone

### User-Centered Design

The platform serves two primary user groups:

**Customers:**
- Quick restaurant discovery
- Seamless ordering experience
- Easy reservation management
- Transparent payment process

**Restaurant Staff:**
- Real-time operational visibility
- Efficient order management
- Clear communication channels
- Streamlined workflows

---

## Brand Identity

### Logo Usage

The Project Okinawa logo represents modern dining technology. Use guidelines:

- Minimum clear space: 1x logo height on all sides
- Minimum size: 32px height
- Background: Use on light or dark backgrounds with appropriate contrast

### Brand Voice

- **Friendly**: Approachable and welcoming
- **Professional**: Reliable and trustworthy
- **Modern**: Contemporary and innovative
- **Clear**: Direct and easy to understand

---

## Color System

### Primary Colors

```css
/* Primary - Coral */
--color-primary: #FF6B35;
--color-primary-light: #FF8F66;
--color-primary-dark: #E55A2B;

/* Secondary - Purple */
--color-secondary: #A855F7;
--color-secondary-light: #C084FC;
--color-secondary-dark: #9333EA;

/* Accent - Gold */
--color-accent: #FFBF00;
```

### Semantic Colors

```css
/* Success */
--color-success: #10B981;
--color-success-light: #34D399;

/* Warning */
--color-warning: #F59E0B;
--color-warning-light: #FBBF24;

/* Error */
--color-error: #EF4444;
--color-error-light: #F87171;

/* Info */
--color-info: #3B82F6;
--color-info-light: #60A5FA;
```

### Neutral Colors

```css
/* Grays */
--color-white: #FFFFFF;
--color-gray-50: #F9FAFB;
--color-gray-100: #F3F4F6;
--color-gray-200: #E5E7EB;
--color-gray-300: #D1D5DB;
--color-gray-400: #9CA3AF;
--color-gray-500: #6B7280;
--color-gray-600: #4B5563;
--color-gray-700: #374151;
--color-gray-800: #1F2937;
--color-gray-900: #111827;
--color-black: #000000;
```

### Color Usage

| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Background | White | Gray-900 |
| Surface | Gray-50 | Gray-800 |
| Text Primary | Gray-800 | Gray-100 |
| Text Secondary | Gray-500 | Gray-400 |
| Border | Gray-200 | Gray-700 |
| Primary Action | Primary | Primary |

### React Native Paper Theme

```typescript
export const theme = {
  colors: {
    primary: '#FF6B35',
    secondary: '#A855F7',
    tertiary: '#FFBF00',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    error: '#EF4444',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onBackground: '#1F2937',
    onSurface: '#1F2937',
    outline: '#E5E7EB',
  },
};

export const darkTheme = {
  colors: {
    primary: '#FF6B35',
    secondary: '#A855F7',
    tertiary: '#FFBF00',
    background: '#111827',
    surface: '#1F2937',
    error: '#EF4444',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onBackground: '#F3F4F6',
    onSurface: '#F3F4F6',
    outline: '#4B5563',
  },
};
```

---

## Typography

### Font Family

```css
/* System fonts for optimal performance */
--font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
               'Helvetica Neue', Arial, sans-serif;
```

### Type Scale

| Name | Size | Weight | Line Height | Usage |
|------|------|--------|-------------|-------|
| Display | 32px | Bold | 40px | Page titles |
| Headline | 24px | SemiBold | 32px | Section headers |
| Title | 20px | SemiBold | 28px | Card titles |
| Body Large | 18px | Regular | 28px | Emphasized text |
| Body | 16px | Regular | 24px | Default text |
| Body Small | 14px | Regular | 20px | Secondary text |
| Caption | 12px | Regular | 16px | Labels, hints |
| Overline | 10px | Medium | 16px | Category labels |

### React Native Styles

```typescript
const typography = {
  displayLarge: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
  },
  headlineMedium: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
  },
  titleLarge: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  bodyLarge: {
    fontSize: 18,
    fontWeight: '400',
    lineHeight: 28,
  },
  bodyMedium: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  labelLarge: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  labelSmall: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
};
```

---

## Spacing and Layout

### Spacing Scale

```css
--space-0: 0px;
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
```

### Layout Grid

- **Mobile**: 16px margins, 16px gutters
- **Tablet**: 24px margins, 24px gutters

### Component Spacing

| Context | Spacing |
|---------|---------|
| Screen padding | 16px |
| Card padding | 16px |
| Section gap | 24px |
| List item gap | 12px |
| Button padding | 12px 24px |
| Input padding | 12px 16px |

### Border Radius

```css
--radius-sm: 4px;    /* Small elements */
--radius-md: 8px;    /* Cards, inputs */
--radius-lg: 12px;   /* Modals, large cards */
--radius-xl: 16px;   /* Bottom sheets */
--radius-full: 9999px; /* Pills, avatars */
```

---

## Components

### Buttons

**Primary Button**
```typescript
<Button mode="contained" onPress={handlePress}>
  Primary Action
</Button>
```
- Background: Primary color
- Text: White
- Use for: Main actions (Submit, Save, Confirm)

**Secondary Button**
```typescript
<Button mode="outlined" onPress={handlePress}>
  Secondary Action
</Button>
```
- Background: Transparent
- Border: Primary color
- Use for: Alternative actions

**Text Button**
```typescript
<Button mode="text" onPress={handlePress}>
  Text Action
</Button>
```
- Use for: Less prominent actions, links

### Cards

```typescript
<Card style={styles.card}>
  <Card.Cover source={{ uri: imageUrl }} />
  <Card.Title
    title="Card Title"
    subtitle="Subtitle text"
    left={(props) => <Avatar.Icon {...props} icon="folder" />}
  />
  <Card.Content>
    <Text variant="bodyMedium">Card content goes here.</Text>
  </Card.Content>
  <Card.Actions>
    <Button>Cancel</Button>
    <Button mode="contained">Confirm</Button>
  </Card.Actions>
</Card>
```

### Form Inputs

```typescript
<TextInput
  label="Email"
  value={email}
  onChangeText={setEmail}
  mode="outlined"
  keyboardType="email-address"
  error={!!errors.email}
/>
{errors.email && (
  <HelperText type="error">{errors.email}</HelperText>
)}
```

### Lists

```typescript
<List.Section>
  <List.Subheader>Section Title</List.Subheader>
  <List.Item
    title="Item Title"
    description="Item description"
    left={(props) => <List.Icon {...props} icon="folder" />}
    right={() => <Chip>Badge</Chip>}
    onPress={handlePress}
  />
</List.Section>
```

### Bottom Navigation

```typescript
<BottomNavigation
  navigationState={{ index, routes }}
  onIndexChange={setIndex}
  renderScene={renderScene}
  barStyle={{ backgroundColor: theme.colors.surface }}
/>
```

### Chips and Badges

```typescript
// Status Chip
<Chip mode="flat" style={{ backgroundColor: colors.success }}>
  Active
</Chip>

// Filter Chip
<Chip
  selected={isSelected}
  onPress={toggleSelection}
  showSelectedOverlay
>
  Filter Option
</Chip>
```

### Dialogs

```typescript
<Portal>
  <Dialog visible={visible} onDismiss={hideDialog}>
    <Dialog.Title>Dialog Title</Dialog.Title>
    <Dialog.Content>
      <Text variant="bodyMedium">Dialog message content.</Text>
    </Dialog.Content>
    <Dialog.Actions>
      <Button onPress={hideDialog}>Cancel</Button>
      <Button onPress={handleConfirm}>Confirm</Button>
    </Dialog.Actions>
  </Dialog>
</Portal>
```

### Snackbars

```typescript
<Snackbar
  visible={visible}
  onDismiss={onDismiss}
  action={{
    label: 'Undo',
    onPress: handleUndo,
  }}
  duration={3000}
>
  Action completed successfully!
</Snackbar>
```

---

## Icons and Imagery

### Icon Library

Using Material Design Icons via `react-native-vector-icons`:

```typescript
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

<MaterialCommunityIcons name="home" size={24} color={theme.colors.primary} />
```

### Common Icons

| Action | Icon Name |
|--------|-----------|
| Home | `home` |
| Search | `magnify` |
| Menu | `menu` |
| Cart | `cart` |
| Orders | `clipboard-list` |
| Profile | `account` |
| Settings | `cog` |
| Notifications | `bell` |
| Restaurant | `store` |
| Table | `table-furniture` |
| Kitchen | `chef-hat` |
| Payment | `credit-card` |
| Location | `map-marker` |
| Calendar | `calendar` |
| Clock | `clock` |
| Star | `star` |
| Heart | `heart` |
| Close | `close` |
| Back | `arrow-left` |
| More | `dots-vertical` |

### Image Guidelines

**Restaurant Photos:**
- Aspect ratio: 16:9 or 4:3
- Minimum resolution: 800x600
- Format: JPEG with 80% quality

**Menu Item Photos:**
- Aspect ratio: 1:1 (square)
- Minimum resolution: 400x400
- Background: Neutral or white

**Avatar Images:**
- Aspect ratio: 1:1
- Size: 48x48 to 120x120
- Format: PNG or JPEG

---

## Interaction Patterns

### Navigation

**Tab Navigation (Customer App)**
- 4 main tabs maximum
- Active state: Primary color
- Inactive state: Gray-400

**Drawer Navigation (Restaurant App)**
- Use for complex menu structures
- Group related items
- Show current location indicator

### Loading States

```typescript
// Full screen loading
<View style={styles.center}>
  <ActivityIndicator size="large" color={theme.colors.primary} />
  <Text style={styles.loadingText}>Loading...</Text>
</View>

// Skeleton loading
<SkeletonPlaceholder>
  <View style={styles.card} />
</SkeletonPlaceholder>

// Pull to refresh
<RefreshControl
  refreshing={refreshing}
  onRefresh={onRefresh}
  colors={[theme.colors.primary]}
/>
```

### Empty States

```typescript
<View style={styles.emptyState}>
  <MaterialCommunityIcons
    name="clipboard-text-outline"
    size={64}
    color={theme.colors.gray400}
  />
  <Text variant="titleMedium" style={styles.emptyTitle}>
    No orders yet
  </Text>
  <Text variant="bodyMedium" style={styles.emptyDescription}>
    Your orders will appear here once you place them.
  </Text>
  <Button mode="contained" onPress={handleBrowse}>
    Browse Restaurants
  </Button>
</View>
```

### Error States

```typescript
<View style={styles.errorState}>
  <MaterialCommunityIcons
    name="alert-circle-outline"
    size={64}
    color={theme.colors.error}
  />
  <Text variant="titleMedium">Something went wrong</Text>
  <Text variant="bodyMedium" style={styles.errorMessage}>
    {error.message}
  </Text>
  <Button mode="outlined" onPress={handleRetry}>
    Try Again
  </Button>
</View>
```

### Gestures

| Gesture | Action |
|---------|--------|
| Tap | Select, activate |
| Long press | Context menu, multi-select |
| Swipe right | Mark as complete (KDS) |
| Swipe left | Delete, archive |
| Pull down | Refresh content |
| Pinch | Zoom (maps, images) |

### Animations

- Use subtle animations (200-300ms)
- Ease-in-out for smooth transitions
- Use React Native Reanimated for performance

```typescript
// Fade in animation
const fadeAnim = useSharedValue(0);

useEffect(() => {
  fadeAnim.value = withTiming(1, { duration: 300 });
}, []);

const animatedStyle = useAnimatedStyle(() => ({
  opacity: fadeAnim.value,
}));
```

---

## Accessibility

### Requirements

1. **Color Contrast**: Minimum 4.5:1 for text
2. **Touch Targets**: Minimum 44x44 points
3. **Screen Reader**: All elements must have labels
4. **Keyboard Navigation**: Support for external keyboards

### Implementation

```typescript
// Accessible button
<TouchableOpacity
  onPress={handlePress}
  accessibilityRole="button"
  accessibilityLabel="Add item to cart"
  accessibilityHint="Double tap to add this item to your cart"
>
  <Text>Add to Cart</Text>
</TouchableOpacity>

// Accessible image
<Image
  source={{ uri: imageUrl }}
  accessibilityLabel="Margherita pizza with fresh basil"
/>

// Accessible form
<TextInput
  accessibilityLabel="Email address"
  accessibilityHint="Enter your email address"
  textContentType="emailAddress"
/>
```

### Color Blindness Considerations

- Don't rely solely on color to convey information
- Use icons alongside color indicators
- Test with color blindness simulators

---

## Platform Guidelines

### iOS Specific

- Use iOS native components when appropriate
- Follow Human Interface Guidelines
- Support Dynamic Type
- Implement haptic feedback for key actions

### Android Specific

- Follow Material Design guidelines
- Support back button navigation
- Implement proper status bar handling
- Use Android-specific navigation patterns

### Cross-Platform Consistency

```typescript
import { Platform } from 'react-native';

const styles = StyleSheet.create({
  shadow: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    android: {
      elevation: 4,
    },
  }),
});
```

---

## Design Checklist

### Before Development

- [ ] Color palette defined
- [ ] Typography scale established
- [ ] Spacing system documented
- [ ] Component library selected
- [ ] Accessibility requirements reviewed

### During Development

- [ ] Consistent spacing applied
- [ ] Touch targets meet minimum size
- [ ] Loading states implemented
- [ ] Error states designed
- [ ] Empty states created

### Before Release

- [ ] Color contrast verified
- [ ] Screen reader tested
- [ ] Multiple device sizes tested
- [ ] Dark mode verified
- [ ] Performance optimized

---

**Document Version:** 1.0
**Last Updated:** December 2025

---

# Guia de UX/UI

Design system e diretrizes de interface completos para o Project Okinawa.

## Sumário

- [Filosofia de Design](#filosofia-de-design)
- [Sistema de Cores](#sistema-de-cores)
- [Tipografia](#tipografia)
- [Espaçamento e Layout](#espaçamento-e-layout)
- [Componentes](#componentes)
- [Padrões de Interação](#padrões-de-interação)
- [Acessibilidade](#acessibilidade)

---

## Filosofia de Design

### Princípios Centrais

1. **Clareza**: Informação clara e fácil de entender
2. **Eficiência**: Minimizar passos para completar tarefas
3. **Consistência**: Padrões uniformes em toda a plataforma
4. **Satisfação**: Criar experiências agradáveis
5. **Acessibilidade**: Utilizável por todos

---

## Sistema de Cores

### Cores Primárias

```css
/* Primária - Coral */
--color-primary: #FF6B35;

/* Secundária - Roxo */
--color-secondary: #A855F7;

/* Destaque - Dourado */
--color-accent: #FFBF00;
```

### Cores Semânticas

```css
--color-success: #10B981;  /* Sucesso */
--color-warning: #F59E0B;  /* Alerta */
--color-error: #EF4444;    /* Erro */
--color-info: #3B82F6;     /* Informação */
```

---

## Tipografia

### Escala de Tipos

| Nome | Tamanho | Uso |
|------|---------|-----|
| Display | 32px | Títulos de página |
| Headline | 24px | Cabeçalhos de seção |
| Title | 20px | Títulos de cards |
| Body | 16px | Texto padrão |
| Caption | 12px | Labels, dicas |

---

## Espaçamento e Layout

### Escala de Espaçamento

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-6: 24px;
--space-8: 32px;
```

### Border Radius

```css
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-full: 9999px;
```

---

## Componentes

### Botões

- **Primário**: Fundo coral, texto branco
- **Secundário**: Borda coral, fundo transparente
- **Texto**: Apenas texto, sem fundo

### Cards

- Padding: 16px
- Border radius: 8px
- Sombra sutil

### Inputs

- Mode: outlined
- Label flutuante
- Helper text para erros

---

## Padrões de Interação

### Estados de Loading

- ActivityIndicator para carregamento
- Skeleton para conteúdo
- Pull to refresh para listas

### Estados Vazios

- Ícone ilustrativo
- Mensagem explicativa
- Ação sugerida (botão)

### Estados de Erro

- Ícone de alerta
- Mensagem de erro clara
- Botão de retry

---

## Acessibilidade

### Requisitos

1. Contraste de cor: Mínimo 4.5:1
2. Alvos de toque: Mínimo 44x44 pontos
3. Leitor de tela: Labels em todos os elementos
4. Navegação por teclado suportada

---

**Versão do Documento:** 1.0
**Última Atualização:** Dezembro 2025
