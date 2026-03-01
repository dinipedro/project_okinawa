# Multi-Restaurant Staff Architecture
# Arquitetura de Staff Multi-Restaurante

> **Version**: 2.0.0  
> **Last Updated**: 2025-02-04  
> **Language**: Bilingual (EN/PT)
> **Status**: ✅ IMPLEMENTED

---

## Table of Contents / Índice

1. [Overview / Visão Geral](#overview--visão-geral)
2. [Data Model / Modelo de Dados](#data-model--modelo-de-dados)
3. [Multi-Restaurant Support / Suporte Multi-Restaurante](#multi-restaurant-support--suporte-multi-restaurante)
4. [Authentication & Context Switching / Autenticação e Troca de Contexto](#authentication--context-switching--autenticação-e-troca-de-contexto)
5. [API Endpoints / Endpoints da API](#api-endpoints--endpoints-da-api)
6. [Frontend Implementation / Implementação Frontend](#frontend-implementation--implementação-frontend)
7. [Security Considerations / Considerações de Segurança](#security-considerations--considerações-de-segurança)
8. [Improvements Roadmap / Melhorias Planejadas](#improvements-roadmap--melhorias-planejadas)

---

## Overview / Visão Geral

**EN**: The Okinawa system fully supports staff members working across multiple restaurants. A single user account (email/phone) can have different roles in different establishments. For example, a waiter might work morning shifts at Restaurant A and evening shifts at Restaurant B, using the same login credentials.

**PT**: O sistema Okinawa suporta completamente funcionários que trabalham em múltiplos restaurantes. Uma única conta de usuário (email/telefone) pode ter roles diferentes em diferentes estabelecimentos. Por exemplo, um garçom pode trabalhar turnos da manhã no Restaurante A e turnos da noite no Restaurante B, usando as mesmas credenciais de login.

### Key Principles / Princípios-Chave

| Principle | Description (EN) | Descrição (PT) |
|-----------|------------------|----------------|
| **Single Identity** | One user account, multiple roles | Uma conta, múltiplos roles |
| **Context-Based Access** | Access determined by current restaurant | Acesso determinado pelo restaurante atual |
| **Independent Roles** | Different roles per restaurant | Roles diferentes por restaurante |
| **Seamless Switching** | Quick context switch without re-login | Troca rápida sem re-autenticação |

---

## Data Model / Modelo de Dados

### Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          PROFILES                                │
│  (users table - single identity)                                 │
├─────────────────────────────────────────────────────────────────┤
│  id (PK, UUID)                                                  │
│  email (UNIQUE)                                                  │
│  phone (NULLABLE)                                                │
│  full_name                                                       │
│  avatar_url                                                      │
│  preferences (JSONB)                                             │
│  is_active                                                       │
│  created_at, updated_at, deleted_at                              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ 1:N (One user can have MANY roles)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                        USER_ROLES                                │
│  (junction table - links users to restaurants with roles)        │
├─────────────────────────────────────────────────────────────────┤
│  id (PK, UUID)                                                  │
│  user_id (FK → profiles.id)                                     │
│  restaurant_id (FK → restaurants.id)                            │
│  role (ENUM: owner|manager|maitre|chef|waiter|barman|customer)  │
│  is_active (BOOLEAN, default: true)                              │
│  created_at, updated_at                                          │
├─────────────────────────────────────────────────────────────────┤
│  CONSTRAINTS:                                                    │
│  - Composite unique: (user_id, restaurant_id, role)             │
│  - MULTIPLE ROLES per user per restaurant (v2.0)                 │
│  - ON DELETE CASCADE for both FKs                                │
│                                                                  │
│  NEW IN v2.0:                                                    │
│  - User can have multiple roles in same restaurant               │
│  - Example: Chef + Barman in same establishment                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ N:1 (Many roles belong to ONE restaurant)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                        RESTAURANTS                               │
├─────────────────────────────────────────────────────────────────┤
│  id (PK, UUID)                                                  │
│  name, slug, description, etc.                                  │
│  is_active                                                       │
│  ...                                                             │
└─────────────────────────────────────────────────────────────────┘
```

### Backend Entity Implementation

```typescript
// backend/src/modules/user-roles/entities/user-role.entity.ts
@Entity('user_roles')
export class UserRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @Column('uuid')
  restaurant_id: string;

  @Column({
    type: 'enum',
    enum: UserRoleEnum, // owner|manager|maitre|chef|waiter|barman|customer
  })
  role: UserRoleEnum;

  @Column({ default: true })
  is_active: boolean;

  @ManyToOne(() => Profile, (profile) => profile.roles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Profile;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.user_roles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;
}
```

### Profile Entity (No Role Storage)

```typescript
// backend/src/modules/users/entities/profile.entity.ts
@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  // ... other profile fields

  // Roles are fetched via relation, NOT stored on profile
  @OneToMany(() => UserRole, (userRole) => userRole.user)
  roles: UserRole[];
}
```

**CRITICAL SECURITY NOTE**: Roles are NEVER stored directly on the profile table. This prevents privilege escalation attacks and ensures proper separation of concerns.

---

## Multi-Restaurant Support / Suporte Multi-Restaurante

### Scenario Examples / Exemplos de Cenários

#### Scenario 1: Same Role, Different Restaurants
```
User: João Silva (joao@email.com)
├── Restaurant: "Bistrô Central"
│   └── Role: WAITER (active)
├── Restaurant: "Pizzaria Roma"  
│   └── Role: WAITER (active)
└── Restaurant: "Sushi Zen"
    └── Role: WAITER (inactive - left the job)
```

#### Scenario 2: Different Roles, Different Restaurants
```
User: Maria Santos (maria@email.com)
├── Restaurant: "Bistrô Central"
│   └── Role: OWNER
├── Restaurant: "Pizzaria Roma"  
│   └── Role: MANAGER (hired to manage)
└── Restaurant: "Café Express"
    └── Role: CUSTOMER (orders as customer)
```

#### Scenario 3: Promotion Flow
```
User: Carlos Oliveira (carlos@email.com)

Timeline:
├── Jan 2024: Hired as WAITER at "Bistrô Central"
├── Jun 2024: Promoted to MAITRE (role updated, not new record)
└── Dec 2024: Promoted to MANAGER

Database: Always ONE record per (user, restaurant) pair
```

### Database Queries / Consultas de Banco

```sql
-- Get all restaurants where a user works
SELECT r.name, ur.role, ur.is_active
FROM user_roles ur
JOIN restaurants r ON ur.restaurant_id = r.id
WHERE ur.user_id = 'user-uuid-here'
  AND ur.is_active = true;

-- Get all staff for a restaurant
SELECT p.full_name, p.email, ur.role
FROM user_roles ur
JOIN profiles p ON ur.user_id = p.id
WHERE ur.restaurant_id = 'restaurant-uuid-here'
  AND ur.is_active = true
ORDER BY ur.role;

-- Check if user has management access to restaurant
SELECT EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_id = 'user-uuid'
    AND restaurant_id = 'restaurant-uuid'
    AND role IN ('owner', 'manager')
    AND is_active = true
) as has_access;
```

---

## Authentication & Context Switching / Autenticação e Troca de Contexto

### Login Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                       USER LOGIN                                 │
│  (Social OAuth / Phone OTP / Biometric)                         │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   FETCH USER ROLES                               │
│  API: GET /user-roles/user/:userId                              │
│  Returns: Array of { restaurant, role, is_active }              │
└───────────────────────────┬─────────────────────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
              ▼                           ▼
┌────────────────────────┐   ┌────────────────────────┐
│   SINGLE RESTAURANT    │   │  MULTIPLE RESTAURANTS  │
│   Auto-select & load   │   │  Show selection screen │
└───────────┬────────────┘   └───────────┬────────────┘
            │                            │
            └────────────┬───────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  SET RESTAURANT CONTEXT                          │
│  - Store restaurant_id in SecureStorage                         │
│  - Load restaurant data                                         │
│  - Load staff member details                                    │
│  - Generate role-based navigation                               │
└─────────────────────────────────────────────────────────────────┘
```

### Context Provider Implementation

```typescript
// mobile/shared/contexts/RestaurantContext.tsx

export const RestaurantProvider = ({ children }) => {
  const [restaurantId, setRestaurantIdState] = useState<string | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [staffMember, setStaffMember] = useState<StaffMember | null>(null);

  // Initialize on mount
  useEffect(() => {
    initializeContext();
  }, []);

  const initializeContext = async () => {
    // 1. Check stored restaurant ID
    const storedId = await secureStorage.getItem('current_restaurant_id');
    
    if (storedId) {
      await loadRestaurantData(storedId);
    } else {
      // 2. Fetch from user's roles
      await loadFromUserProfile();
    }
  };

  const loadFromUserProfile = async () => {
    const profile = await ApiService.getStaffProfile();
    
    if (profile.restaurants.length === 1) {
      // Single restaurant - auto-select
      await loadRestaurantData(profile.restaurants[0].id);
    } else if (profile.restaurants.length > 1) {
      // Multiple restaurants - show selection UI
      // This triggers RestaurantSelectorScreen
    }
  };

  // Switch restaurant context (no re-authentication needed)
  const setRestaurantId = async (id: string) => {
    setIsLoading(true);
    await loadRestaurantData(id);
    setIsLoading(false);
  };

  // Role-based helpers
  const hasRole = (role: StaffRole): boolean => {
    return staffMember?.role === role;
  };

  const isOwnerOrManager = (): boolean => {
    return ['owner', 'manager'].includes(staffMember?.role || '');
  };

  return (
    <RestaurantContext.Provider value={{
      restaurantId,
      restaurant,
      staffMember,
      setRestaurantId,    // Switch restaurants
      hasRole,
      isOwnerOrManager,
      refreshRestaurant,
      clearRestaurant,    // Logout
    }}>
      {children}
    </RestaurantContext.Provider>
  );
};
```

### Restaurant Selector Screen (Proposed)

```typescript
// When user has multiple restaurants, show this screen

const RestaurantSelectorScreen = () => {
  const { setRestaurantId } = useRestaurant();
  const { data: userRoles } = useQuery({
    queryKey: ['user-restaurants'],
    queryFn: () => ApiService.getUserRestaurants(),
  });

  return (
    <SafeAreaView>
      <Text style={styles.title}>Selecione o Restaurante</Text>
      <Text style={styles.subtitle}>Choose which restaurant to work with</Text>
      
      <FlatList
        data={userRoles}
        renderItem={({ item }) => (
          <RestaurantCard
            restaurant={item.restaurant}
            role={item.role}
            onPress={() => setRestaurantId(item.restaurant.id)}
          />
        )}
      />
    </SafeAreaView>
  );
};
```

---

## API Endpoints / Endpoints da API

### User Roles Endpoints

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| `POST` | `/user-roles` | Assign role to user | OWNER, MANAGER |
| `POST` | `/user-roles/bulk` | Bulk assign roles | OWNER |
| `POST` | `/user-roles/transfer-ownership` | Transfer ownership | OWNER |
| `GET` | `/user-roles/restaurant/:id` | Get all roles for restaurant | OWNER, MANAGER |
| `GET` | `/user-roles/user/:id` | Get all roles for user | OWNER, MANAGER |
| `GET` | `/user-roles/restaurant/:rid/user/:uid` | Get specific role | OWNER, MANAGER |
| `GET` | `/user-roles/restaurant/:id/role/:role` | Get users by role | OWNER, MANAGER |
| `GET` | `/user-roles/restaurant/:id/statistics` | Role statistics | OWNER, MANAGER |
| `PATCH` | `/user-roles/:id` | Update role | OWNER, MANAGER |
| `DELETE` | `/user-roles/:id` | Remove role | OWNER, MANAGER |

### Endpoint: Get User's Restaurants

```typescript
// GET /user-roles/me/restaurants
// Returns all restaurants where the authenticated user has a role

interface UserRestaurantsResponse {
  restaurants: Array<{
    id: string;
    restaurant: {
      id: string;
      name: string;
      logo_url: string;
      slug: string;
    };
    role: UserRole;
    is_active: boolean;
    joined_at: Date;
  }>;
}
```

---

## Frontend Implementation / Implementação Frontend

### Role-Based Navigation

```typescript
// Generate navigation items based on user's role
const getNavigationForRole = (role: UserRole): NavigationItem[] => {
  const baseNav = [
    { icon: 'home', label: 'Dashboard', route: 'Dashboard' },
  ];

  const roleNavigation: Record<UserRole, NavigationItem[]> = {
    owner: [
      ...baseNav,
      { icon: 'chart', label: 'Analytics', route: 'Analytics' },
      { icon: 'team', label: 'Equipe', route: 'Staff' },
      { icon: 'settings', label: 'Configurações', route: 'Settings' },
      { icon: 'menu', label: 'Cardápio', route: 'Menu' },
      { icon: 'table', label: 'Mesas', route: 'Tables' },
      { icon: 'orders', label: 'Pedidos', route: 'Orders' },
      { icon: 'reservations', label: 'Reservas', route: 'Reservations' },
      { icon: 'payments', label: 'Pagamentos', route: 'Payments' },
    ],
    manager: [
      ...baseNav,
      { icon: 'chart', label: 'Analytics', route: 'Analytics' },
      { icon: 'team', label: 'Equipe', route: 'Staff' },
      { icon: 'menu', label: 'Cardápio', route: 'Menu' },
      { icon: 'table', label: 'Mesas', route: 'Tables' },
      { icon: 'orders', label: 'Pedidos', route: 'Orders' },
      { icon: 'reservations', label: 'Reservas', route: 'Reservations' },
    ],
    maitre: [
      ...baseNav,
      { icon: 'table', label: 'Mesas', route: 'Tables' },
      { icon: 'reservations', label: 'Reservas', route: 'Reservations' },
      { icon: 'queue', label: 'Fila de Espera', route: 'WaitingQueue' },
    ],
    chef: [
      ...baseNav,
      { icon: 'kds', label: 'KDS Cozinha', route: 'KitchenKDS' },
      { icon: 'menu', label: 'Cardápio', route: 'Menu' },
    ],
    waiter: [
      ...baseNav,
      { icon: 'table', label: 'Minhas Mesas', route: 'MyTables' },
      { icon: 'orders', label: 'Pedidos', route: 'Orders' },
    ],
    barman: [
      ...baseNav,
      { icon: 'kds', label: 'KDS Bar', route: 'BarKDS' },
    ],
    customer: [], // Customer uses Client App, not Restaurant App
  };

  return roleNavigation[role] || baseNav;
};
```

### Restaurant Switcher Component

```typescript
// Component shown in header/sidebar for quick restaurant switching
const RestaurantSwitcher = () => {
  const { restaurant, setRestaurantId } = useRestaurant();
  const [showPicker, setShowPicker] = useState(false);
  
  const { data: userRestaurants } = useQuery({
    queryKey: ['user-restaurants'],
    queryFn: ApiService.getUserRestaurants,
  });

  // Only show if user has multiple restaurants
  if (!userRestaurants || userRestaurants.length <= 1) {
    return (
      <View style={styles.currentRestaurant}>
        <Image source={{ uri: restaurant?.logo_url }} />
        <Text>{restaurant?.name}</Text>
      </View>
    );
  }

  return (
    <Pressable onPress={() => setShowPicker(true)}>
      <View style={styles.switcherButton}>
        <Image source={{ uri: restaurant?.logo_url }} />
        <Text>{restaurant?.name}</Text>
        <ChevronDownIcon />
      </View>

      <Modal visible={showPicker}>
        <FlatList
          data={userRestaurants}
          renderItem={({ item }) => (
            <RestaurantOption
              restaurant={item.restaurant}
              role={item.role}
              isSelected={item.restaurant.id === restaurant?.id}
              onPress={() => {
                setRestaurantId(item.restaurant.id);
                setShowPicker(false);
              }}
            />
          )}
        />
      </Modal>
    </Pressable>
  );
};
```

---

## Security Considerations / Considerações de Segurança

### ✅ Current Implementation (Correct)

1. **Roles in Separate Table**: `user_roles` table is independent from `profiles`
2. **Context-Based Validation**: Backend validates role per restaurant
3. **JWT Contains User ID Only**: Roles are fetched from DB, not stored in token
4. **Cascade Deletes**: Removing restaurant removes all associated roles
5. **Active Flag**: Soft-disable roles without deleting (for historical records)

### ⚠️ Security Best Practices

```typescript
// ✅ CORRECT: Always validate on backend
@UseGuards(JwtAuthGuard, RestaurantOwnerGuard)
async updateRestaurant(userId: string, restaurantId: string) {
  // RestaurantOwnerGuard checks:
  // 1. User has role in this restaurant
  // 2. Role is OWNER or MANAGER
}

// ❌ WRONG: Never trust client-side role
const isManager = localStorage.getItem('role') === 'manager'; // INSECURE!
```

### Role Escalation Prevention

```typescript
// Only OWNER can assign OWNER/MANAGER roles
async assignRole(dto: CreateUserRoleDto, currentUser: JwtPayload) {
  const currentUserRole = await this.getUserRoleInRestaurant(
    currentUser.sub,
    dto.restaurant_id
  );

  // Managers cannot assign owner/manager roles
  if (currentUserRole.role === 'manager') {
    if (['owner', 'manager'].includes(dto.role)) {
      throw new ForbiddenException(
        'Managers cannot assign owner or manager roles'
      );
    }
  }

  // Proceed with assignment
  return this.userRoleRepository.save(dto);
}
```

---

## Improvements Roadmap / Melhorias Planejadas

### Phase 1: Restaurant Selector UI (Priority: HIGH)

Create a dedicated screen for users with multiple restaurants:

```typescript
// New screen: RestaurantSelectorScreen.tsx
// - Show after login if user has multiple restaurants
// - Persist last selected restaurant
// - Allow switching from app header
```

### Phase 2: Multiple Roles per Restaurant (Priority: MEDIUM)

Currently: One role per (user, restaurant) pair  
Proposed: Allow multiple roles (e.g., Chef + Barman)

```typescript
// Database change: Remove unique constraint on (user_id, restaurant_id)
// Add: unique constraint on (user_id, restaurant_id, role)

// This allows:
// - João: CHEF at Restaurant A
// - João: BARMAN at Restaurant A (for small restaurants)
```

### Phase 3: Role History & Audit Log (Priority: LOW)

Track role changes over time:

```sql
CREATE TABLE user_role_history (
  id UUID PRIMARY KEY,
  user_role_id UUID REFERENCES user_roles(id),
  previous_role VARCHAR(20),
  new_role VARCHAR(20),
  changed_by UUID REFERENCES profiles(id),
  changed_at TIMESTAMP DEFAULT NOW(),
  reason TEXT
);
```

### Phase 4: Shift-Based Access Control (Priority: LOW)

Restrict access based on schedule:

```typescript
interface ShiftSchedule {
  user_role_id: string;
  day_of_week: number; // 0-6
  start_time: string;  // "09:00"
  end_time: string;    // "17:00"
}

// Guard checks:
// 1. User has role in restaurant
// 2. Current time is within scheduled shift
```

---

## Summary / Resumo

**EN**: The current architecture FULLY SUPPORTS multi-restaurant staff. A user can work at multiple restaurants with different roles using a single login. The key architectural decisions are:
1. Separate `user_roles` table (not on profile)
2. Context-based switching via `RestaurantContext`
3. Role validation on every backend request
4. Seamless switching without re-authentication

**PT**: A arquitetura atual SUPORTA COMPLETAMENTE funcionários multi-restaurante. Um usuário pode trabalhar em múltiplos restaurantes com diferentes roles usando um único login. As principais decisões arquiteturais são:
1. Tabela `user_roles` separada (não no profile)
2. Troca de contexto via `RestaurantContext`
3. Validação de role em cada request do backend
4. Troca seamless sem re-autenticação

---

## Version 2.0 Improvements (Implemented)
## Melhorias da Versão 2.0 (Implementadas)

### 1. GET /user-roles/me/restaurants Endpoint

**EN**: New endpoint that returns all restaurants the authenticated user has access to, with their roles grouped by restaurant. No role restriction - any authenticated user can call this endpoint.

**PT**: Novo endpoint que retorna todos os restaurantes que o usuário autenticado tem acesso, com seus roles agrupados por restaurante. Sem restrição de role - qualquer usuário autenticado pode chamar este endpoint.

```typescript
// Response structure
interface UserRestaurantRole {
  restaurant: {
    id: string;
    name: string;
    logo_url?: string;
    service_type?: string;
  };
  roles: UserRole[];       // Array of all roles in this restaurant
  is_primary: boolean;     // First restaurant is primary
  last_accessed?: Date;
}

// API: GET /user-roles/me/restaurants
// Returns: UserRestaurantRole[]
```

### 2. Multiple Roles per Restaurant

**EN**: Users can now have MULTIPLE roles in the same restaurant. For example, a staff member can be both Chef and Barman in the same establishment. This is useful for small restaurants where staff wear multiple hats.

**PT**: Usuários agora podem ter MÚLTIPLOS roles no mesmo restaurante. Por exemplo, um funcionário pode ser tanto Chef quanto Barman no mesmo estabelecimento. Isso é útil para restaurantes pequenos onde o staff exerce múltiplas funções.

```typescript
// New endpoints for multi-role management:

// Add additional role (keeps existing roles)
POST /user-roles/additional-role
{
  user_id: string;
  restaurant_id: string;
  role: UserRole;
}

// Remove specific role (keeps other roles)
DELETE /user-roles/specific-role
{
  user_id: string;
  restaurant_id: string;
  role: UserRole;  // Only removes this specific role
}

// Get all roles for user in restaurant
GET /user-roles/me/restaurant/:restaurantId/roles
// Returns: UserRole[] (e.g., ['chef', 'barman'])
```

### 3. RestaurantSelectorScreen

**EN**: New post-login screen displayed when user has access to multiple restaurants. Shows all restaurants with their roles, allows quick selection without re-authentication.

**PT**: Nova tela pós-login exibida quando o usuário tem acesso a múltiplos restaurantes. Mostra todos os restaurantes com seus roles, permite seleção rápida sem re-autenticação.

**Location**: `src/components/mobile-preview-v2/screens/restaurant/RestaurantSelectorScreenV2.tsx`

**Features**:
- Displays all user's restaurants with logos and service types
- Shows all roles per restaurant with appropriate icons
- Primary restaurant indicator (star icon)
- Last accessed timestamp
- Loading states during context switch

### 4. RestaurantSwitcher Component

**EN**: Header component that displays current restaurant and provides dropdown for switching between establishments. Available in all main screens after login.

**PT**: Componente de header que exibe o restaurante atual e fornece dropdown para trocar entre estabelecimentos. Disponível em todas as telas principais após login.

**Location**: `src/components/mobile-preview-v2/components/RestaurantSwitcherV2.tsx`

**Features**:
- Shows current restaurant name and primary role
- Dropdown with all available restaurants
- Visual indicator for current selection
- Quick switch without re-authentication
- Link to full restaurant selector
- Logout option

### Updated Context Structure

```typescript
// mobile/shared/contexts/RestaurantContext.tsx

interface RestaurantContextValue {
  // Existing
  restaurantId: string | null;
  restaurant: Restaurant | null;
  staffMember: StaffMember | null;
  isLoading: boolean;
  error: string | null;
  
  // NEW in v2.0
  userRestaurants: UserRestaurantRole[];  // All restaurants for user
  hasMultipleRestaurants: boolean;        // Computed property
  fetchUserRestaurants: () => Promise<UserRestaurantRole[]>;
  
  // Updated for multi-role
  hasRole: (role) => boolean;   // Now checks all roles
  hasAnyRole: (roles) => boolean; // Now checks all roles
}

interface StaffMember {
  // Existing
  id: string;
  user_id: string;
  restaurant_id: string;
  role: string;  // Primary/highest role
  
  // NEW in v2.0
  roles: string[];  // All roles in current restaurant
}
```

### useRestaurantRole Hook Updates

```typescript
const useRestaurantRole = () => {
  return {
    role: string | null,        // Primary role
    roles: string[],            // ALL roles (new)
    hasRole: (role) => boolean,
    hasAnyRole: (roles) => boolean,
    isOwner: boolean,
    isManager: boolean,
    isKitchenStaff: boolean,
    isFrontOfHouse: boolean,
    isBarStaff: boolean,        // NEW
    userRestaurants: UserRestaurantRole[],  // NEW
    hasMultipleRestaurants: boolean,        // NEW
  };
};
```

---

## Migration Notes / Notas de Migração

**EN**: The constraint on `user_roles` table was updated from `UNIQUE(user_id, restaurant_id)` to `UNIQUE(user_id, restaurant_id, role)`. This allows multiple role entries per user-restaurant pair.

**PT**: A constraint na tabela `user_roles` foi atualizada de `UNIQUE(user_id, restaurant_id)` para `UNIQUE(user_id, restaurant_id, role)`. Isso permite múltiplas entradas de role por par usuário-restaurante.

```sql
-- Migration to allow multiple roles per restaurant
ALTER TABLE user_roles 
DROP CONSTRAINT IF EXISTS user_roles_user_id_restaurant_id_key;

ALTER TABLE user_roles 
ADD CONSTRAINT user_roles_user_restaurant_role_unique 
UNIQUE (user_id, restaurant_id, role);
```

---

## Related Documentation / Documentação Relacionada

- [Restaurant Staff Roles](./RESTAURANT_STAFF_ROLES.md) - Detailed role definitions and permissions
- [Architecture Overview](./ARCHITECTURE.md) - Complete system architecture
