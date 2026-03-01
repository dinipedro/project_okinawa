# 🍽️ Documentação Completa: Tipos de Serviço do Okinawa

> **Versão**: 2.0  
> **Última Atualização**: Janeiro 2026  
> **Idioma**: Português (Brasil)

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Os 9 Tipos de Serviço](#os-9-tipos-de-serviço)
   - [Fine Dining](#1-fine-dining-)
   - [Serviço Rápido (Quick Service)](#2-serviço-rápido-quick-service-)
   - [Fast Casual](#3-fast-casual-)
   - [Café/Padaria](#4-cafépadaria-)
   - [Buffet/Self-Service](#5-buffetself-service-)
   - [Drive-Thru](#6-drive-thru-)
   - [Food Truck](#7-food-truck-)
   - [Chef's Table](#8-chefs-table-)
   - [Casual Dining](#9-casual-dining-) 
3. [Arquitetura Técnica](#arquitetura-técnica)
4. [Fluxo de Configuração](#fluxo-de-configuração)
5. [Matriz de Funcionalidades](#matriz-de-funcionalidades)
6. [Implementação por Camada](#implementação-por-camada)
7. [Diagramas de Fluxo](#diagramas-de-fluxo)
8. [API e Endpoints](#api-e-endpoints)
9. [Banco de Dados](#banco-de-dados)
10. [Mobile Preview Implementation](#mobile-preview-implementation)
11. [Roadmap de Desenvolvimento](#roadmap-de-desenvolvimento)

---

## Visão Geral

O Okinawa é uma plataforma de experiência gastronômica presencial que suporta **9 tipos distintos de serviço de restaurante**. Cada tipo possui características únicas, funcionalidades específicas e fluxos de atendimento diferenciados.

### Filosofia de Design

A plataforma foi projetada com a filosofia **"Service-Type-First"**: todas as funcionalidades, fluxos de usuário e interfaces são dinamicamente adaptadas com base no tipo de serviço configurado pelo restaurante. Isso não é apenas uma diferenciação cosmética, mas uma **diferenciação funcional fundamental**.

### Princípios Arquiteturais

```
┌─────────────────────────────────────────────────────────────────┐
│                    TIPO DE SERVIÇO                              │
│                         ↓                                       │
│   ┌─────────────┬─────────────┬─────────────┬─────────────┐    │
│   │   Features  │     UI      │   Fluxos    │  Pagamentos │    │
│   │   Ativas    │  Adaptada   │  Específicos│  Customizados│   │
│   └─────────────┴─────────────┴─────────────┴─────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Os 11 Tipos de Serviço

### 1. Fine Dining 🍷

#### Descrição Completa
Experiência gastronômica **premium** com serviço personalizado e atendimento à mesa completo. Destinado a restaurantes de alta gastronomia que oferecem experiências culinárias sofisticadas com foco em qualidade, apresentação e serviço impecável.

#### Características Operacionais

| Aspecto | Configuração |
|---------|-------------|
| **Público-Alvo** | Clientes premium, celebrações especiais, jantares de negócios |
| **Ticket Médio** | Alto (R$ 150-500+ por pessoa) |
| **Tempo de Permanência** | 90-180 minutos |
| **Rotatividade de Mesas** | Baixa (2-3 giros/dia) |
| **Nível de Serviço** | Altíssimo, personalizado |

#### Funcionalidades Exclusivas

```typescript
// Configuração no Backend
interface FineDiningConfig {
  sommelier_available: boolean;      // Sommelier disponível
  dress_code: string;                // Código de vestimenta
  reservation_required: boolean;     // Reserva obrigatória
  average_meal_duration: number;     // Duração média (minutos)
}
```

**Features Ativas:**
- ✅ **Reservas Antecipadas**: Sistema completo de reservas com seleção de mesa
- ✅ **Sommelier Digital**: Recomendações de harmonização de vinhos
- ✅ **Menu Degustação**: Opção de menus especiais com múltiplos cursos
- ✅ **Atendimento Personalizado**: Histórico de preferências do cliente
- ✅ **Mapa de Mesas Digital**: Visualização e seleção interativa

**Features Desativadas:**
- ❌ Fila Virtual (reserva é obrigatória)
- ❌ Monte seu Prato (menu definido pelo chef)
- ❌ Geolocalização (estabelecimento fixo)
- ❌ Balança Inteligente (serviço à la carte)

#### Fluxo do Cliente

```
┌──────────────────────────────────────────────────────────────────┐
│                    JORNADA FINE DINING                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐          │
│  │   RESERVA   │───▶│   CHECK-IN  │───▶│   MESA      │          │
│  │  Antecipada │    │  no App     │    │   Atribuída │          │
│  └─────────────┘    └─────────────┘    └─────────────┘          │
│         │                                      │                 │
│         ▼                                      ▼                 │
│  ┌─────────────┐                       ┌─────────────┐          │
│  │  Convites   │                       │   MENU      │          │
│  │  para Grupo │                       │   Digital   │          │
│  └─────────────┘                       └─────────────┘          │
│                                               │                  │
│                                               ▼                  │
│                                        ┌─────────────┐          │
│                                        │  SOMMELIER  │          │
│                                        │ Harmonização│          │
│                                        └─────────────┘          │
│                                               │                  │
│                                               ▼                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐          │
│  │  AVALIAÇÃO  │◀───│  PAGAMENTO  │◀───│   PEDIDO    │          │
│  │  + Gorjeta  │    │  Dividido   │    │  na Mesa    │          │
│  └─────────────┘    └─────────────┘    └─────────────┘          │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

#### Integrações Específicas

- **Código de Vestimenta**: Notificação ao cliente no momento da reserva
- **Histórico de Preferências**: IA analisa pedidos anteriores para recomendações
- **Alergias e Restrições**: Destaque automático no menu
- **Ocasiões Especiais**: Configuração de aniversários, propostas, etc.

---

### 2. Serviço Rápido (Quick Service) ⚡

#### Descrição Completa
Modelo de atendimento ágil com **menu padronizado**, foco em **conveniência e velocidade**. Ideal para redes de fast food, franquias e restaurantes que priorizam eficiência operacional e alto volume de clientes.

#### Características Operacionais

| Aspecto | Configuração |
|---------|-------------|
| **Público-Alvo** | Trabalhadores, famílias em trânsito, consumo rápido |
| **Ticket Médio** | Baixo a médio (R$ 25-60 por pessoa) |
| **Tempo de Permanência** | 15-30 minutos |
| **Rotatividade de Mesas** | Altíssima (8-15 giros/dia) |
| **Nível de Serviço** | Automatizado, eficiente |

#### Funcionalidades Exclusivas

```typescript
// Configuração no Backend
interface QuickServiceConfig {
  skip_the_line_enabled: boolean;   // Furar fila ativo
  pickup_zones: string[];           // Zonas de retirada
  avg_preparation_time: number;     // Tempo médio de preparo
}
```

**Features Ativas:**
- ✅ **Pedido Antecipado**: Fazer pedido antes de chegar
- ✅ **Skip the Line**: Pular fila com pedido pelo app
- ✅ **Retirada Rápida**: Balcão específico para app
- ✅ **Pagamento pelo App**: Checkout totalmente digital
- ✅ **Status em Tempo Real**: Acompanhamento do pedido
- ✅ **Fila Virtual**: Gerenciamento de espera

**Features Desativadas:**
- ❌ Reservas (atendimento por ordem de chegada)
- ❌ Sommelier (fora do escopo)
- ❌ Mapa de Mesas (autoatendimento)
- ❌ Serviço na Mesa (retirada no balcão)

#### Fluxo do Cliente

```
┌──────────────────────────────────────────────────────────────────┐
│                  JORNADA QUICK SERVICE                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    DUAS OPÇÕES                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│              │                              │                    │
│              ▼                              ▼                    │
│  ┌─────────────────────┐        ┌─────────────────────┐         │
│  │   PEDIDO PRESENCIAL │        │   PEDIDO ANTECIPADO │         │
│  │   (Fila Virtual)    │        │    (Skip the Line)  │         │
│  └─────────────────────┘        └─────────────────────┘         │
│              │                              │                    │
│              ▼                              ▼                    │
│  ┌─────────────────────┐        ┌─────────────────────┐         │
│  │   AGUARDA CHAMADA   │        │  NOTIFICAÇÃO PRONTO │         │
│  │   na Fila           │        │  (Push + SMS)       │         │
│  └─────────────────────┘        └─────────────────────┘         │
│              │                              │                    │
│              └──────────────┬───────────────┘                   │
│                             ▼                                    │
│                  ┌─────────────────────┐                        │
│                  │   RETIRADA BALCÃO   │                        │
│                  │   (Código no App)   │                        │
│                  └─────────────────────┘                        │
│                             │                                    │
│                             ▼                                    │
│                  ┌─────────────────────┐                        │
│                  │  AVALIAÇÃO RÁPIDA   │                        │
│                  │  (1-5 estrelas)     │                        │
│                  └─────────────────────┘                        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

#### Integrações Específicas

- **KDS Otimizado**: Ordenação por tempo de preparo
- **Múltiplas Zonas de Retirada**: Balcão, drive-thru, estacionamento
- **Combos Inteligentes**: Sugestões baseadas em histórico
- **Programa de Fidelidade**: Acúmulo acelerado em compras frequentes

---

### 3. Fast Casual 🥗

#### Descrição Completa
Posicionamento entre fast food e casual dining, com **qualidade superior**, possibilidade de **customização total** e ambiente mais **agradável**. Ideal para marcas que valorizam ingredientes frescos e preparação à vista.

#### Características Operacionais

| Aspecto | Configuração |
|---------|-------------|
| **Público-Alvo** | Profissionais, consumidores conscientes, millennials |
| **Ticket Médio** | Médio (R$ 40-80 por pessoa) |
| **Tempo de Permanência** | 30-60 minutos |
| **Rotatividade de Mesas** | Alta (5-8 giros/dia) |
| **Nível de Serviço** | Híbrido (autoatendimento + entrega na mesa) |

#### Funcionalidades Exclusivas

```typescript
// Configuração no Backend
interface FastCasualConfig {
  build_your_own_enabled: boolean;           // Monte seu prato ativo
  customization_options: {
    bases: string[];           // Opções de base
    proteins: string[];        // Proteínas disponíveis
    toppings: string[];        // Complementos
    sauces: string[];          // Molhos
    extras: string[];          // Extras pagos
    size_options: string[];    // Tamanhos
  };
}
```

**Features Ativas:**
- ✅ **Monte seu Prato**: Customização completa
- ✅ **Ingredientes Frescos**: Destaque de origem
- ✅ **Customização Total**: Cada item personalizável
- ✅ **Informações Nutricionais**: Cálculo automático
- ✅ **Pedido Híbrido**: App ou balcão
- ✅ **Entrega na Mesa**: Após preparo

**Features Desativadas:**
- ❌ Reservas (casual)
- ❌ Sommelier (fora do escopo)
- ❌ Geolocalização (estabelecimento fixo)

#### Fluxo do Cliente - Monte seu Prato

```
┌──────────────────────────────────────────────────────────────────┐
│                  DISH BUILDER - FAST CASUAL                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐                                                │
│  │ 1. ESCOLHA  │  ┌────────────────────────────────────────┐    │
│  │    BASE     │──│ Arroz Branco | Integral | Quinoa | Mix │    │
│  └─────────────┘  └────────────────────────────────────────┘    │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────┐                                                │
│  │ 2. ESCOLHA  │  ┌────────────────────────────────────────┐    │
│  │  PROTEÍNA   │──│ Frango | Carne | Tofu | Salmão | Mix   │    │
│  └─────────────┘  └────────────────────────────────────────┘    │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────┐                                                │
│  │ 3. ESCOLHA  │  ┌────────────────────────────────────────┐    │
│  │  TOPPINGS   │──│ ✓ Alface ✓ Tomate ✓ Pepino □ Cebola   │    │
│  │  (Ilimitado)│  │ □ Milho ✓ Cenoura □ Beterraba         │    │
│  └─────────────┘  └────────────────────────────────────────┘    │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────┐                                                │
│  │ 4. ESCOLHA  │  ┌────────────────────────────────────────┐    │
│  │   MOLHOS    │──│ Tahine | Caesar | Mostarda | Oriental  │    │
│  │   (Até 2)   │  └────────────────────────────────────────┘    │
│  └─────────────┘                                                │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   RESUMO DO PRATO                        │    │
│  │  ┌──────────────────────────────────────────────────┐   │    │
│  │  │ Calorias: 485 | Proteína: 32g | Carbos: 45g      │   │    │
│  │  │ Preço: R$ 38,90                                   │   │    │
│  │  └──────────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

#### Integrações Específicas

- **Calculadora Nutricional**: Atualização em tempo real
- **Filtros Dietéticos**: Vegano, vegetariano, sem glúten, etc.
- **Favoritos Salvos**: Combinações personalizadas
- **Histórico de Montagens**: Repetir pedidos anteriores

---

### 4. Café/Padaria ☕

#### Descrição Completa
Espaço **versátil** para consumo rápido ou **permanência prolongada**. Ideal para cafeterias, padarias e estabelecimentos que atendem desde o café da manhã até lanches noturnos, com foco em ambiente agradável para trabalho ou socialização.

#### Características Operacionais

| Aspecto | Configuração |
|---------|-------------|
| **Público-Alvo** | Freelancers, estudantes, reuniões informais |
| **Ticket Médio** | Baixo a médio (R$ 20-50 por pessoa) |
| **Tempo de Permanência** | Variável (15 min - 4+ horas) |
| **Rotatividade de Mesas** | Média (3-6 giros/dia) |
| **Nível de Serviço** | Híbrido (balcão + mesa) |

#### Funcionalidades Exclusivas

```typescript
// Configuração no Backend
interface CoffeeShopConfig {
  work_friendly: boolean;              // Ambiente de trabalho
  wifi_available: boolean;             // Wi-Fi disponível
  power_outlets_available: boolean;    // Tomadas disponíveis
  noise_level: 'quiet' | 'moderate' | 'lively';  // Nível de ruído
}
```

**Features Ativas:**
- ✅ **Wi-Fi Grátis**: Conectividade para clientes
- ✅ **Espaço para Trabalho**: Ambiente adequado
- ✅ **Personalização de Bebidas**: Customização detalhada
- ✅ **Pedido na Mesa por QR**: Sem filas
- ✅ **Programa de Fidelidade**: Acúmulo por visitas
- ✅ **Monte seu Prato**: Para itens customizáveis

**Features Desativadas:**
- ❌ Reservas (casual, por ordem)
- ❌ Sommelier (fora do escopo)
- ❌ Geolocalização (fixo)

#### Fluxo do Cliente

```
┌──────────────────────────────────────────────────────────────────┐
│                   JORNADA CAFÉ/PADARIA                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    ENTRADA NO LOCAL                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│              │                              │                    │
│              ▼                              ▼                    │
│  ┌─────────────────────┐        ┌─────────────────────┐         │
│  │   CONSUMO RÁPIDO    │        │   PERMANÊNCIA       │         │
│  │   (Balcão)          │        │   (Mesa/Trabalho)   │         │
│  └─────────────────────┘        └─────────────────────┘         │
│              │                              │                    │
│              │                              ▼                    │
│              │                  ┌─────────────────────┐         │
│              │                  │   SCAN QR DA MESA   │         │
│              │                  └─────────────────────┘         │
│              │                              │                    │
│              │                              ▼                    │
│              │                  ┌─────────────────────┐         │
│              │                  │   PEDIDO PELO APP   │         │
│              │                  │   (Refil Café?)     │         │
│              │                  └─────────────────────┘         │
│              │                              │                    │
│              │                              ▼                    │
│              │                  ┌─────────────────────┐         │
│              │                  │   ENTREGA NA MESA   │         │
│              │                  │   (Notificação)     │         │
│              │                  └─────────────────────┘         │
│              │                              │                    │
│              └──────────────────────────────┤                   │
│                                             │                    │
│                                             ▼                    │
│                              ┌─────────────────────┐            │
│                              │   PAGAMENTO FINAL   │            │
│                              │   (Comanda Digital) │            │
│                              └─────────────────────┘            │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

#### Integrações Específicas

- **Refil Automático**: Opção de café refil com preço diferenciado
- **Tempo de Permanência**: Analytics para otimização
- **Indicador de Tomadas**: Mostrar mesas com energia disponível
- **Nível de Ocupação**: Indicador em tempo real no app

---

### 5. Buffet/Self-Service 🍽️

#### Descrição Completa
Modelo onde o **cliente se serve**, com pagamento por peso ou preço fixo. Alta rotatividade e eficiência operacional. Ideal para restaurantes por quilo, buffets executivos e estabelecimentos com grande variedade de opções.

#### Características Operacionais

| Aspecto | Configuração |
|---------|-------------|
| **Público-Alvo** | Trabalhadores, famílias, almoço executivo |
| **Ticket Médio** | Médio (R$ 30-60 por pessoa) |
| **Tempo de Permanência** | 30-45 minutos |
| **Rotatividade de Mesas** | Alta (6-10 giros/dia) |
| **Nível de Serviço** | Autoatendimento |

#### Funcionalidades Exclusivas

```typescript
// Configuração no Backend
interface BuffetConfig {
  price_per_kg: number;            // Preço por kg
  fixed_price: number;             // Preço fixo alternativo
  payment_mode: 'per_kg' | 'fixed' | 'hybrid';  // Modo de pagamento
  smart_scales_enabled: boolean;   // Balanças inteligentes
}
```

**Features Ativas:**
- ✅ **Variedade Ilimitada**: Cardápio extenso
- ✅ **Pagamento por Peso**: Integração com balanças
- ✅ **Balança Inteligente**: Pesagem automatizada
- ✅ **Self-Service**: Cliente se serve
- ✅ **Sem Filas no Caixa**: Pagamento digital

**Features Desativadas:**
- ❌ Reservas (alta rotatividade)
- ❌ Serviço na Mesa (self-service)
- ❌ Monte seu Prato (buffet livre)
- ❌ Fila Virtual (acesso livre)

#### Fluxo do Cliente

```
┌──────────────────────────────────────────────────────────────────┐
│                    JORNADA BUFFET                                │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────┐                                        │
│  │   CHEGADA           │                                        │
│  │   (Check-in App)    │                                        │
│  └─────────────────────┘                                        │
│              │                                                   │
│              ▼                                                   │
│  ┌─────────────────────┐                                        │
│  │   SELF-SERVICE      │                                        │
│  │   (Buffet Livre)    │                                        │
│  └─────────────────────┘                                        │
│              │                                                   │
│              ▼                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                 BALANÇA INTELIGENTE                       │   │
│  │  ┌─────────────────────────────────────────────────────┐ │   │
│  │  │  📱 Identificação por QR Code ou NFC               │ │   │
│  │  │  ⚖️  Peso: 485g                                     │ │   │
│  │  │  💰 Valor: R$ 38,80 (R$ 79,90/kg)                  │ │   │
│  │  │  ✅ Registrado na comanda digital                  │ │   │
│  │  └─────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
│              │                                                   │
│              ▼                                                   │
│  ┌─────────────────────┐                                        │
│  │   CONSUMO NA MESA   │                                        │
│  │   (+ Bebidas App)   │                                        │
│  └─────────────────────┘                                        │
│              │                                                   │
│              ▼                                                   │
│  ┌─────────────────────┐                                        │
│  │   PAGAMENTO FINAL   │                                        │
│  │   Comida + Bebidas  │                                        │
│  └─────────────────────┘                                        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

#### Integrações Específicas

- **Balanças IoT**: Integração com balanças inteligentes
- **Comanda Digital**: Registro automático de consumo
- **Preço Dinâmico**: Variação por horário (almoço/jantar)
- **Controle de Desperdício**: Analytics de consumo

---

### 6. Drive-Thru 🚗

#### Descrição Completa
Serviço **sem sair do carro** com identificação veicular automática. Foco em conveniência máxima e velocidade. Ideal para redes de fast food, cafeterias e estabelecimentos em áreas de alto fluxo de veículos.

#### Características Operacionais

| Aspecto | Configuração |
|---------|-------------|
| **Público-Alvo** | Motoristas, famílias em trânsito, consumo rápido |
| **Ticket Médio** | Baixo a médio (R$ 30-70 por pedido) |
| **Tempo de Atendimento** | 3-7 minutos |
| **Rotatividade** | Altíssima (fila contínua) |
| **Nível de Serviço** | Automatizado |

#### Funcionalidades Exclusivas

```typescript
// Configuração no Backend
interface DriveThruConfig {
  drive_thru_lanes: number;              // Número de pistas
  geofencing_enabled: boolean;           // Geofencing ativo
  geofencing_radius: number;             // Raio em metros
  license_plate_recognition: boolean;    // Reconhecimento de placa
}
```

**Features Ativas:**
- ✅ **Sem Sair do Carro**: Conveniência total
- ✅ **Detecção por GPS**: Identificação automática
- ✅ **Pedido no Caminho**: Preparo antecipado
- ✅ **Múltiplas Janelas**: Otimização de fila
- ✅ **Reconhecimento de Placa**: Identificação automática
- ✅ **Fila Virtual**: Gerenciamento de espera

**Features Desativadas:**
- ❌ Reservas (fluxo contínuo)
- ❌ Mapa de Mesas (sem mesas)
- ❌ Serviço na Mesa (drive-thru)
- ❌ Sommelier (fora do escopo)

#### Fluxo do Cliente

```
┌──────────────────────────────────────────────────────────────────┐
│                    JORNADA DRIVE-THRU                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │               ANTES DE CHEGAR (5km)                       │   │
│  │  📱 Pedido pelo App → Preparo inicia ao detectar GPS      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                             │                                    │
│                             ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │               ENTRADA NO GEOFENCING (500m)                │   │
│  │  🛰️ GPS detecta chegada → Notifica cozinha                │   │
│  │  📱 App: "Seu pedido está sendo finalizado!"              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                             │                                    │
│                             ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   CHEGADA NA PISTA                        │   │
│  │  🚗 Reconhecimento de Placa (opcional)                    │   │
│  │  📱 Exibe código de retirada                              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                             │                                    │
│                             ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   JANELA DE RETIRADA                      │   │
│  │  ✅ Pedido pronto e pago pelo app                         │   │
│  │  ⏱️ Tempo total: < 2 minutos                              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

#### Integrações Específicas

- **Geofencing Inteligente**: Raios configuráveis
- **Integração GPS**: Tracking em tempo real
- **Reconhecimento de Placa**: Câmeras com OCR
- **KDS Priorizado**: Ordenação por chegada

---

### 7. Food Truck 🚚

#### Descrição Completa
Operação **móvel** em eventos e locais variados. Desafio de conectividade resolvido com modo offline. Ideal para food trucks, trailers e operações itinerantes que precisam funcionar em condições variadas.

#### Características Operacionais

| Aspecto | Configuração |
|---------|-------------|
| **Público-Alvo** | Eventos, festivais, locais temporários |
| **Ticket Médio** | Médio (R$ 25-50 por pessoa) |
| **Tempo de Atendimento** | 5-15 minutos |
| **Rotatividade** | Alta (baseada em evento) |
| **Nível de Serviço** | Ágil, casual |

#### Funcionalidades Exclusivas

```typescript
// Configuração no Backend
interface FoodTruckConfig {
  current_location: {
    latitude: number;
    longitude: number;
    address: string;
    updated_at: Date;
  };
  schedule: {
    day: string;
    location: string;
    start_time: string;
    end_time: string;
  }[];
  offline_mode_enabled: boolean;   // Modo offline ativo
}
```

**Features Ativas:**
- ✅ **Localização em Tempo Real**: GPS tracking
- ✅ **Fila Virtual**: Gerenciamento de espera
- ✅ **Modo Offline**: Operação sem internet
- ✅ **Notificações de Localização**: Alertas para favoritos
- ✅ **Menu Sazonal**: Cardápio dinâmico
- ✅ **Geolocalização**: Encontrar o truck

**Features Desativadas:**
- ❌ Reservas (operação casual)
- ❌ Mapa de Mesas (sem mesas fixas)
- ❌ Serviço na Mesa (retirada)
- ❌ Sommelier (fora do escopo)

#### Fluxo do Cliente

```
┌──────────────────────────────────────────────────────────────────┐
│                    JORNADA FOOD TRUCK                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────┐                                        │
│  │   DESCOBERTA        │                                        │
│  │   (Mapa + Agenda)   │                                        │
│  └─────────────────────┘                                        │
│              │                                                   │
│              ▼                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                 LOCALIZAÇÃO EM TEMPO REAL                 │   │
│  │  🗺️ Mapa interativo com GPS do truck                      │   │
│  │  📍 "Taco Truck está a 800m de você!"                     │   │
│  │  📅 Agenda semanal de localizações                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│              │                                                   │
│              ▼                                                   │
│  ┌─────────────────────┐                                        │
│  │   PEDIDO ANTECIPADO │                                        │
│  │   (ou Fila Virtual) │                                        │
│  └─────────────────────┘                                        │
│              │                                                   │
│              ▼                                                   │
│  ┌─────────────────────┐                                        │
│  │   NOTIFICAÇÃO       │                                        │
│  │   "Pedido Pronto!"  │                                        │
│  └─────────────────────┘                                        │
│              │                                                   │
│              ▼                                                   │
│  ┌─────────────────────┐                                        │
│  │   RETIRADA          │                                        │
│  │   (Código no App)   │                                        │
│  └─────────────────────┘                                        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

#### Integrações Específicas

- **GPS Broadcasting**: Localização em tempo real
- **Modo Offline**: Sincronização quando reconecta
- **Alertas de Proximidade**: Push quando truck está perto
- **Agenda de Eventos**: Calendário de localizações

---

### 8. Chef's Table 👨‍🍳

#### Descrição Completa
Experiência **exclusiva** com menu degustação e presença do chef. Número limitado de lugares e alta personalização. Ideal para experiências gastronômicas premium, jantares com o chef e eventos exclusivos.

#### Características Operacionais

| Aspecto | Configuração |
|---------|-------------|
| **Público-Alvo** | Gastrónomos, ocasiões especiais, experiências únicas |
| **Ticket Médio** | Altíssimo (R$ 300-1000+ por pessoa) |
| **Tempo de Permanência** | 2-4 horas |
| **Rotatividade de Mesas** | Mínima (1 giro/noite) |
| **Nível de Serviço** | Ultra premium, personalizado |

#### Funcionalidades Exclusivas

```typescript
// Configuração no Backend
interface ChefsTableConfig {
  seats_available: number;            // Lugares disponíveis (6-12)
  experience_duration: number;        // Duração em minutos
  pre_booking_required: boolean;      // Pré-reserva obrigatória
  tasting_menu_only: boolean;         // Apenas menu degustação
  special_instructions: string;       // Instruções especiais
  experience_highlights: string[];    // Destaques da experiência
}
```

**Features Ativas:**
- ✅ **Experiência Exclusiva**: Número limitado de lugares
- ✅ **Chef Presente**: Interação direta com o chef
- ✅ **Menu Degustação**: Cursos sequenciais
- ✅ **Lugares Limitados**: Exclusividade garantida
- ✅ **História dos Pratos**: Narrativa gastronômica
- ✅ **Reservas Obrigatórias**: Pré-agendamento
- ✅ **Sommelier**: Harmonização completa

**Features Desativadas:**
- ❌ Fila Virtual (reserva obrigatória)
- ❌ Monte seu Prato (menu do chef)
- ❌ Pedido Antecipado (experiência presencial)
- ❌ Geolocalização (estabelecimento fixo)

#### Fluxo do Cliente

```
┌──────────────────────────────────────────────────────────────────┐
│                   JORNADA CHEF'S TABLE                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              RESERVA ANTECIPADA (Obrigatória)             │   │
│  │  📅 Agenda limitada → 6-12 lugares por sessão             │   │
│  │  💳 Pré-pagamento ou depósito de garantia                 │   │
│  │  📝 Questionário de preferências e restrições             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                             │                                    │
│                             ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  PREPARAÇÃO (24-48h antes)                │   │
│  │  📱 Notificação com menu do dia                           │   │
│  │  🍷 Opção de harmonização de vinhos                       │   │
│  │  ℹ️ Detalhes da experiência e dress code                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                             │                                    │
│                             ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    DIA DA EXPERIÊNCIA                     │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  🍽️ Curso 1: Amuse-Bouche                          │  │   │
│  │  │     História: "Inspirado nas viagens do chef..."   │  │   │
│  │  │     Harmonização: Champagne Brut                   │  │   │
│  │  ├────────────────────────────────────────────────────┤  │   │
│  │  │  🍽️ Curso 2: Entrada                               │  │   │
│  │  │     História: "Ingrediente local do produtor X..." │  │   │
│  │  │     Harmonização: Sauvignon Blanc                  │  │   │
│  │  ├────────────────────────────────────────────────────┤  │   │
│  │  │  🍽️ ... mais 5-10 cursos ...                       │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                             │                                    │
│                             ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    ENCERRAMENTO                           │   │
│  │  👨‍🍳 Foto com o Chef                                     │   │
│  │  📜 Menu assinado de lembrança                           │   │
│  │  ⭐ Avaliação detalhada da experiência                   │   │
│  │  🎁 Convite para próximas experiências exclusivas        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

#### Integrações Específicas

- **Narrativa Digital**: História de cada prato no app
- **Galeria da Experiência**: Fotos profissionais compartilhadas
- **Programa VIP**: Acesso prioritário a novas datas
- **Certificado Digital**: Comprovante da experiência

---

## Arquitetura Técnica

### Enum de Tipos de Serviço (Backend)

```typescript
// backend/src/common/enums/service-type.enum.ts

export enum ServiceType {
  FINE_DINING = 'fine_dining',
  QUICK_SERVICE = 'quick_service',
  FAST_CASUAL = 'fast_casual',
  COFFEE_SHOP = 'coffee_shop',
  BUFFET = 'buffet',
  DRIVE_THRU = 'drive_thru',
  FOOD_TRUCK = 'food_truck',
  CHEFS_TABLE = 'chefs_table',
}

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  [ServiceType.FINE_DINING]: 'Fine Dining',
  [ServiceType.QUICK_SERVICE]: 'Serviço Rápido',
  [ServiceType.FAST_CASUAL]: 'Fast Casual',
  [ServiceType.COFFEE_SHOP]: 'Café/Padaria',
  [ServiceType.BUFFET]: 'Buffet/Self-Service',
  [ServiceType.DRIVE_THRU]: 'Drive-Thru',
  [ServiceType.FOOD_TRUCK]: 'Food Truck',
  [ServiceType.CHEFS_TABLE]: "Chef's Table",
};

export const SERVICE_TYPE_DESCRIPTIONS: Record<ServiceType, string> = {
  [ServiceType.FINE_DINING]:
    'Experiência gastronômica premium com serviço personalizado e atendimento à mesa',
  [ServiceType.QUICK_SERVICE]:
    'Atendimento ágil, menu padronizado, foco em conveniência e velocidade',
  [ServiceType.FAST_CASUAL]:
    'Qualidade superior ao fast food, customização, ambiente agradável',
  [ServiceType.COFFEE_SHOP]:
    'Espaço versátil para consumo rápido ou permanência prolongada',
  [ServiceType.BUFFET]:
    'Cliente se serve, pagamento por peso ou fixo, alta rotatividade',
  [ServiceType.DRIVE_THRU]: 'Serviço sem sair do carro com identificação veicular',
  [ServiceType.FOOD_TRUCK]: 'Operação móvel em eventos e locais variados',
  [ServiceType.CHEFS_TABLE]: 'Experiência exclusiva com menu degustação e chef presente',
};

export const SERVICE_TYPE_FEATURES: Record<ServiceType, string[]> = {
  [ServiceType.FINE_DINING]: [
    'Reservas antecipadas',
    'Sommelier disponível',
    'Menu degustação',
    'Atendimento personalizado',
    'Mapa de mesas digital',
  ],
  [ServiceType.QUICK_SERVICE]: [
    'Pedido antecipado',
    'Skip the Line',
    'Retirada rápida',
    'Pagamento pelo app',
    'Status em tempo real',
  ],
  [ServiceType.FAST_CASUAL]: [
    'Monte seu prato',
    'Ingredientes frescos',
    'Customização total',
    'Informações nutricionais',
    'Pedido híbrido',
  ],
  [ServiceType.COFFEE_SHOP]: [
    'Wi-Fi grátis',
    'Espaço para trabalho',
    'Personalização de bebidas',
    'Pedido na mesa por QR',
    'Programa de fidelidade',
  ],
  [ServiceType.BUFFET]: [
    'Variedade ilimitada',
    'Pagamento por peso',
    'Balança inteligente',
    'Self-service',
    'Sem filas no caixa',
  ],
  [ServiceType.DRIVE_THRU]: [
    'Sem sair do carro',
    'Detecção por GPS',
    'Pedido no caminho',
    'Múltiplas janelas',
    'Reconhecimento de placa',
  ],
  [ServiceType.FOOD_TRUCK]: [
    'Localização em tempo real',
    'Fila virtual',
    'Modo offline',
    'Notificações de localização',
    'Menu sazonal',
  ],
  [ServiceType.CHEFS_TABLE]: [
    'Experiência exclusiva',
    'Chef presente',
    'Menu degustação',
    'Lugares limitados',
    'História dos pratos',
  ],
};
```

### Configuração no Context (Frontend)

```typescript
// src/components/mobile-preview/context/MobilePreviewContext.tsx

export const SERVICE_TYPE_CONFIG: Record<ServiceType, {
  label: string;
  description: string;
  icon: string;
  features: string[];
  hasTableService: boolean;
  hasReservations: boolean;
  hasQueue: boolean;
  hasDeliveryToTable: boolean;
  hasDishBuilder: boolean;
  hasGeolocation: boolean;
  hasSommelier: boolean;
  hasBuffetScale: boolean;
}> = {
  [ServiceType.FINE_DINING]: {
    label: 'Fine Dining',
    description: 'Experiência gastronômica premium com serviço personalizado',
    icon: '🍷',
    features: ['Reservas', 'Sommelier', 'Menu Degustação', 'Mapa de Mesas'],
    hasTableService: true,
    hasReservations: true,
    hasQueue: false,
    hasDeliveryToTable: true,
    hasDishBuilder: false,
    hasGeolocation: false,
    hasSommelier: true,
    hasBuffetScale: false,
  },
  [ServiceType.QUICK_SERVICE]: {
    label: 'Serviço Rápido',
    description: 'Atendimento ágil com foco em conveniência',
    icon: '⚡',
    features: ['Pedido Antecipado', 'Skip the Line', 'Retirada Rápida'],
    hasTableService: false,
    hasReservations: false,
    hasQueue: true,
    hasDeliveryToTable: false,
    hasDishBuilder: false,
    hasGeolocation: false,
    hasSommelier: false,
    hasBuffetScale: false,
  },
  // ... demais tipos
};
```

---

## Fluxo de Configuração

### Wizard de Configuração (3 Etapas)

```
┌──────────────────────────────────────────────────────────────────┐
│                  WIZARD DE CONFIGURAÇÃO                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────┐    ┌────────────┐    ┌────────────┐             │
│  │  ETAPA 1   │───▶│  ETAPA 2   │───▶│  ETAPA 3   │             │
│  │   Tipo     │    │  Features  │    │  Confirmar │             │
│  └────────────┘    └────────────┘    └────────────┘             │
│                                                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                  │
│  ETAPA 1: SELEÇÃO DO TIPO                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  🍷 Fine Dining          ☐                               │   │
│  │  ⚡ Serviço Rápido        ☐                               │   │
│  │  🥗 Fast Casual           ☐                               │   │
│  │  ☕ Café/Padaria          ☐                               │   │
│  │  🍽️ Buffet                ☐                               │   │
│  │  🚗 Drive-Thru            ☐                               │   │
│  │  🚚 Food Truck            ☐                               │   │
│  │  👨‍🍳 Chef's Table         ☐                               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ETAPA 2: TOGGLE DE FUNCIONALIDADES                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Atendimento                                              │   │
│  │    ○ Reservas             [ON]                           │   │
│  │    ○ Fila Virtual         [OFF]                          │   │
│  │    ○ Mapa de Mesas        [ON]                           │   │
│  │                                                           │   │
│  │  Pedidos                                                  │   │
│  │    ○ Monte seu Prato      [OFF]                          │   │
│  │    ○ Pedido pelo App      [ON]                           │   │
│  │                                                           │   │
│  │  Pagamento                                                │   │
│  │    ○ Divisão de Conta     [ON]                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ETAPA 3: CONFIRMAÇÃO                                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Tipo Selecionado: Fine Dining 🍷                        │   │
│  │                                                           │   │
│  │  Features Ativas:                                         │   │
│  │  ✓ Reservas  ✓ Mapa de Mesas  ✓ Divisão de Conta        │   │
│  │  ✓ Pedido pelo App  ✓ Serviço na Mesa                   │   │
│  │                                                           │   │
│  │  Features Desativadas:                                    │   │
│  │  ✗ Monte seu Prato  ✗ Fila Virtual                       │   │
│  │                                                           │   │
│  │  [Voltar]                             [Salvar ✓]         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Auto-Configuração de Features

Quando um tipo de serviço é selecionado, as features são automaticamente configuradas:

```typescript
const handleSelectType = (type: ServiceType) => {
  setSelectedType(type);
  const config = SERVICE_TYPE_CONFIG[type];
  
  setFeatures(prev => prev.map(f => ({
    ...f,
    enabled: 
      (f.id === 'reservations' && config.hasReservations) ||
      (f.id === 'queue' && config.hasQueue) ||
      (f.id === 'tableMap' && config.hasTableService) ||
      (f.id === 'tableService' && config.hasTableService) ||
      (f.id === 'dishBuilder' && config.hasDishBuilder) ||
      (f.id === 'splitPayment') ||  // Sempre ativo
      (f.id === 'mobileOrder')       // Sempre ativo
  })));
};
```

---

## Matriz de Funcionalidades

### Tabela Comparativa Completa

| Funcionalidade | Fine Dining | Quick Service | Fast Casual | Café | Buffet | Drive-Thru | Food Truck | Chef's Table |
|----------------|:-----------:|:-------------:|:-----------:|:----:|:------:|:----------:|:----------:|:------------:|
| **Reservas** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Fila Virtual** | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| **Mapa de Mesas** | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Serviço na Mesa** | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Entrega na Mesa** | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Monte seu Prato** | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Geolocalização** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| **Sommelier** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Balança Inteligente** | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Divisão de Conta** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Pedido pelo App** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |

### Legenda de Ícones por Tipo

| Tipo | Ícone | Cor Primária |
|------|:-----:|--------------|
| Fine Dining | 🍷 | Vinho/Burgundy |
| Serviço Rápido | ⚡ | Amarelo/Ouro |
| Fast Casual | 🥗 | Verde/Natureza |
| Café/Padaria | ☕ | Marrom/Café |
| Buffet | 🍽️ | Laranja/Caramelo |
| Drive-Thru | 🚗 | Azul/Estrada |
| Food Truck | 🚚 | Verde/Aventura |
| Chef's Table | 👨‍🍳 | Preto/Premium |

---

## Implementação por Camada

### Backend (NestJS)

#### Entidade de Configuração

```typescript
// backend/src/modules/restaurants/entities/restaurant-service-config.entity.ts

@Entity('restaurant_service_configs')
export class RestaurantServiceConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  restaurant_id: string;

  @Column({ type: 'enum', enum: ServiceType })
  service_type: ServiceType;

  @Column({ default: true })
  is_active: boolean;

  // ═══════════════════════════════════════════════════════════════
  // FINE DINING
  // ═══════════════════════════════════════════════════════════════
  @Column({ nullable: true })
  sommelier_available: boolean;

  @Column({ nullable: true })
  dress_code: string;

  @Column({ nullable: true })
  reservation_required: boolean;

  @Column({ type: 'int', nullable: true })
  average_meal_duration: number;

  // ═══════════════════════════════════════════════════════════════
  // QUICK SERVICE
  // ═══════════════════════════════════════════════════════════════
  @Column({ nullable: true })
  skip_the_line_enabled: boolean;

  @Column({ type: 'simple-array', nullable: true })
  pickup_zones: string[];

  @Column({ type: 'int', nullable: true })
  avg_preparation_time: number;

  // ═══════════════════════════════════════════════════════════════
  // FAST CASUAL
  // ═══════════════════════════════════════════════════════════════
  @Column({ nullable: true })
  build_your_own_enabled: boolean;

  @Column({ type: 'jsonb', nullable: true })
  customization_options: Record<string, any>;

  // ═══════════════════════════════════════════════════════════════
  // COFFEE SHOP
  // ═══════════════════════════════════════════════════════════════
  @Column({ nullable: true })
  work_friendly: boolean;

  @Column({ nullable: true })
  wifi_available: boolean;

  @Column({ nullable: true })
  power_outlets_available: boolean;

  @Column({ nullable: true })
  noise_level: string;

  // ═══════════════════════════════════════════════════════════════
  // BUFFET
  // ═══════════════════════════════════════════════════════════════
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price_per_kg: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  fixed_price: number;

  @Column({ nullable: true })
  payment_mode: string;  // 'per_kg' | 'fixed' | 'hybrid'

  @Column({ nullable: true })
  smart_scales_enabled: boolean;

  // ═══════════════════════════════════════════════════════════════
  // DRIVE-THRU
  // ═══════════════════════════════════════════════════════════════
  @Column({ type: 'int', nullable: true })
  drive_thru_lanes: number;

  @Column({ nullable: true })
  geofencing_enabled: boolean;

  @Column({ type: 'int', nullable: true })
  geofencing_radius: number;

  @Column({ nullable: true })
  license_plate_recognition: boolean;

  // ═══════════════════════════════════════════════════════════════
  // FOOD TRUCK
  // ═══════════════════════════════════════════════════════════════
  @Column({ type: 'jsonb', nullable: true })
  current_location: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  schedule: Record<string, any>;

  @Column({ nullable: true })
  offline_mode_enabled: boolean;

  // ═══════════════════════════════════════════════════════════════
  // CHEF'S TABLE
  // ═══════════════════════════════════════════════════════════════
  @Column({ type: 'int', nullable: true })
  seats_available: number;

  @Column({ type: 'int', nullable: true })
  experience_duration: number;

  @Column({ nullable: true })
  pre_booking_required: boolean;

  @Column({ nullable: true })
  tasting_menu_only: boolean;

  // ═══════════════════════════════════════════════════════════════
  // COMUM
  // ═══════════════════════════════════════════════════════════════
  @Column({ type: 'text', nullable: true })
  special_instructions: string;

  @Column({ type: 'simple-array', nullable: true })
  experience_highlights: string[];

  @Column({ type: 'jsonb', nullable: true })
  config_metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.service_configs)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;
}
```

### Migration do Banco de Dados

```sql
-- Criação do ENUM
CREATE TYPE "public"."restaurant_service_configs_service_type_enum" AS ENUM(
  'fine_dining', 
  'quick_service', 
  'fast_casual', 
  'coffee_shop', 
  'buffet', 
  'drive_thru', 
  'food_truck', 
  'chefs_table'
);

-- Criação da tabela
CREATE TABLE "restaurant_service_configs" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "restaurant_id" uuid NOT NULL,
  "service_type" "public"."restaurant_service_configs_service_type_enum" NOT NULL,
  "is_active" boolean NOT NULL DEFAULT true,
  
  -- Fine Dining
  "sommelier_available" boolean,
  "dress_code" character varying,
  "reservation_required" boolean,
  "average_meal_duration" integer,
  
  -- Quick Service
  "skip_the_line_enabled" boolean,
  "pickup_zones" text,
  "avg_preparation_time" integer,
  
  -- Fast Casual
  "build_your_own_enabled" boolean,
  "customization_options" jsonb,
  
  -- Coffee Shop
  "work_friendly" boolean,
  "wifi_available" boolean,
  "power_outlets_available" boolean,
  "noise_level" character varying,
  
  -- Buffet
  "price_per_kg" numeric(10,2),
  "fixed_price" numeric(10,2),
  "payment_mode" character varying,
  "smart_scales_enabled" boolean,
  
  -- Drive-Thru
  "drive_thru_lanes" integer,
  "geofencing_enabled" boolean,
  "geofencing_radius" integer,
  "license_plate_recognition" boolean,
  
  -- Food Truck
  "current_location" jsonb,
  "schedule" jsonb,
  "offline_mode_enabled" boolean,
  
  -- Chef's Table
  "seats_available" integer,
  "experience_duration" integer,
  "pre_booking_required" boolean,
  "tasting_menu_only" boolean,
  
  -- Common
  "special_instructions" text,
  "experience_highlights" text,
  "config_metadata" jsonb,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
  
  CONSTRAINT "PK_restaurant_service_configs" PRIMARY KEY ("id"),
  CONSTRAINT "FK_restaurant_service_configs_restaurant" 
    FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE
);

-- Índices
CREATE INDEX "idx_service_configs_restaurant" ON "restaurant_service_configs"("restaurant_id");
CREATE INDEX "idx_service_configs_type" ON "restaurant_service_configs"("service_type");
CREATE INDEX "idx_service_configs_active" ON "restaurant_service_configs"("is_active");
```

### Frontend (Mobile Preview)

#### Tela de Configuração

```typescript
// src/components/mobile-preview/restaurant/ServiceTypeConfigScreen.tsx

export const ServiceTypeConfigScreen = () => {
  const { goBack, serviceType, setServiceType } = useMobilePreview();
  const [selectedType, setSelectedType] = useState<ServiceType | null>(serviceType);
  const [step, setStep] = useState<'type' | 'features' | 'confirm'>('type');
  
  const [features, setFeatures] = useState<FeatureToggle[]>([
    { 
      id: 'reservations', 
      label: 'Reservas', 
      description: 'Permitir reservas antecipadas', 
      icon: <Clock />, 
      enabled: true, 
      category: 'Atendimento' 
    },
    { 
      id: 'queue', 
      label: 'Fila Virtual', 
      description: 'Sistema de fila com estimativa de espera', 
      icon: <Users />, 
      enabled: true, 
      category: 'Atendimento' 
    },
    // ... mais features
  ]);
  
  // ... implementação completa
};
```

---

## Diagramas de Fluxo

### Seleção de Tipo de Serviço

```
┌──────────────────────────────────────────────────────────────────┐
│              FLUXO DE SELEÇÃO DE TIPO DE SERVIÇO                 │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│                     ┌─────────────────┐                          │
│                     │  ONBOARDING     │                          │
│                     │  Restaurante    │                          │
│                     └────────┬────────┘                          │
│                              │                                   │
│                              ▼                                   │
│                     ┌─────────────────┐                          │
│                     │  Qual é seu     │                          │
│                     │  tipo de serviço│                          │
│                     └────────┬────────┘                          │
│                              │                                   │
│        ┌─────────────────────┼─────────────────────┐             │
│        │                     │                     │             │
│        ▼                     ▼                     ▼             │
│  ┌───────────┐        ┌───────────┐        ┌───────────┐        │
│  │ ATENDI-   │        │ SELF-     │        │ EXPERI-   │        │
│  │ MENTO     │        │ SERVICE   │        │ ÊNCIA     │        │
│  └─────┬─────┘        └─────┬─────┘        └─────┬─────┘        │
│        │                    │                    │               │
│   ┌────┴────┐          ┌────┴────┐          ┌────┴────┐         │
│   │         │          │         │          │         │         │
│   ▼         ▼          ▼         ▼          ▼         ▼         │
│ Fine    Quick      Fast     Coffee      Drive    Food          │
│ Dining  Service    Casual   Shop        Thru     Truck         │
│                              Buffet               Chef's        │
│                                                   Table         │
│        │                    │                    │               │
│        └────────────────────┴────────────────────┘              │
│                              │                                   │
│                              ▼                                   │
│                     ┌─────────────────┐                          │
│                     │  CONFIGURAÇÃO   │                          │
│                     │  AUTOMÁTICA     │                          │
│                     │  de Features    │                          │
│                     └────────┬────────┘                          │
│                              │                                   │
│                              ▼                                   │
│                     ┌─────────────────┐                          │
│                     │  AJUSTE MANUAL  │                          │
│                     │  (opcional)     │                          │
│                     └────────┬────────┘                          │
│                              │                                   │
│                              ▼                                   │
│                     ┌─────────────────┐                          │
│                     │  CONFIRMAÇÃO    │                          │
│                     │  E SALVAMENTO   │                          │
│                     └─────────────────┘                          │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Adaptação Dinâmica da UI

```
┌──────────────────────────────────────────────────────────────────┐
│             ADAPTAÇÃO DINÂMICA POR TIPO DE SERVIÇO               │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐                                            │
│  │  CONTEXT        │                                            │
│  │  serviceType    │                                            │
│  └────────┬────────┘                                            │
│           │                                                      │
│           ▼                                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    CONDICIONAIS                          │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │                                                          │    │
│  │  if (config.hasReservations) {                          │    │
│  │    // Mostrar botão de reservas                         │    │
│  │    // Mostrar tela de nova reserva                      │    │
│  │    // Mostrar mapa de mesas                             │    │
│  │  }                                                       │    │
│  │                                                          │    │
│  │  if (config.hasQueue) {                                 │    │
│  │    // Mostrar botão de fila virtual                     │    │
│  │    // Mostrar posição na fila                           │    │
│  │    // Notificações de chamada                           │    │
│  │  }                                                       │    │
│  │                                                          │    │
│  │  if (config.hasDishBuilder) {                           │    │
│  │    // Mostrar opção "Monte seu prato"                   │    │
│  │    // Exibir customizador de ingredientes               │    │
│  │  }                                                       │    │
│  │                                                          │    │
│  │  if (config.hasGeolocation) {                           │    │
│  │    // Ativar tracking GPS                               │    │
│  │    // Mostrar mapa com localização                      │    │
│  │    // Exibir tempo estimado de chegada                  │    │
│  │  }                                                       │    │
│  │                                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## API e Endpoints

### Endpoints de Configuração

```typescript
// GET /api/v1/restaurants/:id/service-config
// Retorna a configuração atual do tipo de serviço

interface GetServiceConfigResponse {
  id: string;
  restaurant_id: string;
  service_type: ServiceType;
  is_active: boolean;
  config: {
    // Campos específicos do tipo
    [key: string]: any;
  };
  features: {
    hasReservations: boolean;
    hasQueue: boolean;
    hasTableService: boolean;
    hasDishBuilder: boolean;
    hasGeolocation: boolean;
    hasSommelier: boolean;
    hasBuffetScale: boolean;
  };
}

// PUT /api/v1/restaurants/:id/service-config
// Atualiza a configuração do tipo de serviço

interface UpdateServiceConfigRequest {
  service_type: ServiceType;
  is_active?: boolean;
  config?: {
    [key: string]: any;
  };
}

// GET /api/v1/service-types
// Lista todos os tipos de serviço disponíveis

interface ListServiceTypesResponse {
  types: {
    id: ServiceType;
    label: string;
    description: string;
    icon: string;
    features: string[];
    defaults: {
      hasReservations: boolean;
      hasQueue: boolean;
      // ...
    };
  }[];
}
```

---

## Banco de Dados

### Schema ERD

```
┌──────────────────────────────────────────────────────────────────┐
│                    SCHEMA DE TIPOS DE SERVIÇO                    │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────┐        ┌─────────────────────────────┐ │
│  │    restaurants      │        │  restaurant_service_configs │ │
│  ├─────────────────────┤        ├─────────────────────────────┤ │
│  │ id (PK)             │───1:N──│ id (PK)                     │ │
│  │ name                │        │ restaurant_id (FK)          │ │
│  │ slug                │        │ service_type (ENUM)         │ │
│  │ description         │        │ is_active                   │ │
│  │ ...                 │        │                             │ │
│  └─────────────────────┘        │ -- Fine Dining --           │ │
│                                 │ sommelier_available         │ │
│                                 │ dress_code                  │ │
│                                 │ reservation_required        │ │
│                                 │ average_meal_duration       │ │
│                                 │                             │ │
│                                 │ -- Quick Service --         │ │
│                                 │ skip_the_line_enabled       │ │
│                                 │ pickup_zones                │ │
│                                 │ avg_preparation_time        │ │
│                                 │                             │ │
│                                 │ -- Fast Casual --           │ │
│                                 │ build_your_own_enabled      │ │
│                                 │ customization_options       │ │
│                                 │                             │ │
│                                 │ -- Coffee Shop --           │ │
│                                 │ work_friendly               │ │
│                                 │ wifi_available              │ │
│                                 │ power_outlets_available     │ │
│                                 │ noise_level                 │ │
│                                 │                             │ │
│                                 │ -- Buffet --                │ │
│                                 │ price_per_kg                │ │
│                                 │ fixed_price                 │ │
│                                 │ payment_mode                │ │
│                                 │ smart_scales_enabled        │ │
│                                 │                             │ │
│                                 │ -- Drive-Thru --            │ │
│                                 │ drive_thru_lanes            │ │
│                                 │ geofencing_enabled          │ │
│                                 │ geofencing_radius           │ │
│                                 │ license_plate_recognition   │ │
│                                 │                             │ │
│                                 │ -- Food Truck --            │ │
│                                 │ current_location (JSONB)    │ │
│                                 │ schedule (JSONB)            │ │
│                                 │ offline_mode_enabled        │ │
│                                 │                             │ │
│                                 │ -- Chef's Table --          │ │
│                                 │ seats_available             │ │
│                                 │ experience_duration         │ │
│                                 │ pre_booking_required        │ │
│                                 │ tasting_menu_only           │ │
│                                 │                             │ │
│                                 │ -- Common --                │ │
│                                 │ special_instructions        │ │
│                                 │ experience_highlights       │ │
│                                 │ config_metadata (JSONB)     │ │
│                                 │ created_at                  │ │
│                                 │ updated_at                  │ │
│                                 └─────────────────────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Mobile Preview Implementation

### Telas Implementadas por Tipo

| Tela | Descrição | Tipos Suportados |
|------|-----------|------------------|
| `ExploreScreen` | Busca/filtro por tipo | Todos |
| `RestaurantDetailScreen` | Detalhes adaptados | Todos |
| `NewReservationScreen` | Criar reserva | Fine Dining, Chef's Table |
| `VirtualQueueScreen` | Entrar na fila | Quick, Fast Casual, Café, Drive-Thru, Food Truck |
| `DishBuilderScreen` | Monte seu prato | Fast Casual, Café |
| `TrackLocationScreen` | GPS tracking | Drive-Thru, Food Truck |
| `CheckoutScreen` | Pagamento | Todos |
| `ServiceTypeConfigScreen` | Configuração (Restaurant) | Todos |

### Context Provider

```typescript
// Uso do Context para adaptação dinâmica
const { serviceConfig } = useMobilePreview();

// Exemplo de renderização condicional
{serviceConfig.hasReservations && (
  <Button onClick={() => navigate('new-reservation')}>
    Fazer Reserva
  </Button>
)}

{serviceConfig.hasQueue && (
  <Button onClick={() => navigate('virtual-queue')}>
    Entrar na Fila
  </Button>
)}

{serviceConfig.hasDishBuilder && (
  <Button onClick={() => navigate('dish-builder')}>
    Monte seu Prato
  </Button>
)}
```

---

## Roadmap de Desenvolvimento

### Status Atual de Implementação

| Componente | Status | Detalhes |
|------------|:------:|----------|
| **Enum Backend** | ✅ Completo | 8 tipos definidos com labels e descrições |
| **Entity TypeORM** | ✅ Completo | Todos os campos por tipo implementados |
| **Migration** | ✅ Completo | Tabela criada com todos os campos |
| **Context Frontend** | ✅ Completo | SERVICE_TYPE_CONFIG com todas as flags |
| **ServiceTypeConfigScreen** | ✅ Completo | Wizard de 3 etapas funcional |
| **ExploreScreen** | ✅ Completo | Filtro por tipo de serviço |
| **RestaurantDetailScreen** | 🔄 Parcial | Adaptação básica implementada |
| **DishBuilderScreen** | ✅ Completo | Customização de pratos funcional |
| **VirtualQueueScreen** | ✅ Completo | Fila virtual funcional |
| **TrackLocationScreen** | ✅ Completo | GPS tracking funcional |
| **API Endpoints** | 🔄 Parcial | Endpoints básicos, falta configuração |
| **Integrações IoT** | ❌ Pendente | Balanças, GPS veicular, placas |

### Próximos Passos

1. **Fase 1 - Endpoints de Configuração**
   - Implementar `GET/PUT /service-config`
   - Validações por tipo
   - Testes de integração

2. **Fase 2 - Integrações Específicas**
   - Balança inteligente (Buffet)
   - Geofencing avançado (Drive-Thru)
   - Modo offline (Food Truck)
   - Reconhecimento de placa (Drive-Thru)

3. **Fase 3 - Analytics por Tipo**
   - Métricas específicas por tipo
   - Dashboards customizados
   - Relatórios operacionais

4. **Fase 4 - IA e Otimização**
   - Recomendações por tipo
   - Previsão de demanda
   - Otimização de fluxo

---

### 9. Casual Dining 🍽️

#### Descrição Completa
Modelo de restaurante **tradicional** com serviço de mesa, ambiente familiar e ticket médio moderado. Representa a **maior fatia do mercado brasileiro** — posicionado entre Fast Casual e Fine Dining. Ideal para churrascarias, cantinas italianas, restaurantes regionais, pizzarias com salão e franquias como Outback/Madero.

#### Características Operacionais

| Aspecto | Configuração |
|---------|-------------|
| **Público-Alvo** | Famílias, grupos de amigos, refeições casuais |
| **Ticket Médio** | Moderado (R$ 60-150 por pessoa) |
| **Tempo de Permanência** | 60-90 minutos |
| **Rotatividade de Mesas** | Média (3-5 giros/dia) |
| **Nível de Serviço** | Alto, com garçom dedicado |

#### Funcionalidades Exclusivas

```typescript
// Configuração no Backend
interface CasualDiningConfig {
  // Reservas & Entrada
  reservations_optional: boolean;       // Aceita walk-in E reserva
  reservation_grace_period: number;     // Tolerância em minutos (5-30)
  waitlist_enabled: boolean;            // Lista de espera para walk-ins
  waitlist_advance_drinks: boolean;     // Pedir bebidas enquanto espera
  estimated_wait_display: boolean;      // Mostrar tempo estimado
  
  // Serviço de Mesa
  table_service: boolean;               // Garçom dedicado
  order_at_table: boolean;              // Pedido via app na mesa
  call_waiter_button: boolean;          // Botão "chamar garçom"
  partial_order_enabled: boolean;       // Adicionar itens sem garçom
  
  // Grupos
  group_friendly: boolean;              // Aceita grupos grandes
  max_group_size: number;               // Limite de pessoas (4-50)
  group_reservation_required: number;   // A partir de X, reserva obrigatória
  
  // Pagamento
  suggested_tip_percentage: number;     // Gorjeta sugerida (0-20%)
  service_charge_included: boolean;     // Taxa de serviço inclusa
  split_bill_promoted: boolean;         // Destaque para dividir conta
  
  // Operacional
  average_meal_duration: number;        // Duração média (30-180 min)
  table_turnover_target: number;        // Meta de rotatividade (1-10)
}
```

**Features Ativas:**
- ✅ **Lista de Espera Inteligente**: Estimativa baseada em ocupação real e tempo de permanência
- ✅ **Pré-Pedido na Fila**: Bebidas e aperitivos enquanto aguarda (vai para a comanda)
- ✅ **Botão Chamar Garçom**: Categorizado (Refil, Dúvida, Sobremesa, Problema)
- ✅ **Pedido Parcial**: Adicionar itens sem esperar garçom
- ✅ **Reserva Opcional**: Walk-in e reserva coexistem
- ✅ **Divisão de Conta Destacada**: Split bill promovido na UI
- ✅ **Gorjeta Sugerida**: Percentual pré-selecionado configurável

**Features Desativadas:**
- ❌ Sommelier (fora do escopo)
- ❌ Dress Code (ambiente casual)
- ❌ Menu Degustação (serviço à la carte)
- ❌ Geolocalização (estabelecimento fixo)

#### Fluxo do Cliente

```
┌──────────────────────────────────────────────────────────────────┐
│                   JORNADA CASUAL DINING                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    DUAS ENTRADAS                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│              │                              │                    │
│              ▼                              ▼                    │
│  ┌─────────────────────┐        ┌─────────────────────┐         │
│  │   WALK-IN           │        │   RESERVA           │         │
│  │   (Lista de Espera) │        │   (Opcional)        │         │
│  └─────────────────────┘        └─────────────────────┘         │
│              │                              │                    │
│              ▼                              ▼                    │
│  ┌─────────────────────┐        ┌─────────────────────┐         │
│  │   📱 PEDIR BEBIDAS  │        │   CHECK-IN          │         │
│  │   Enquanto Espera   │        │   no App            │         │
│  └─────────────────────┘        └─────────────────────┘         │
│              │                              │                    │
│              ▼                              │                    │
│  ┌─────────────────────┐                    │                    │
│  │   NOTIFICAÇÃO       │                    │                    │
│  │   "Mesa Pronta!"    │                    │                    │
│  └─────────────────────┘                    │                    │
│              │                              │                    │
│              └──────────────┬───────────────┘                   │
│                             ▼                                    │
│              ┌─────────────────────────────────┐                │
│              │         SENTADO NA MESA         │                │
│              │    Scan QR → Cardápio Digital   │                │
│              └─────────────────────────────────┘                │
│                             │                                    │
│                             ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   DURANTE A REFEIÇÃO                      │   │
│  │  ┌────────────────┐  ┌────────────────┐  ┌─────────────┐ │   │
│  │  │ 📱 Pedir mais  │  │ 🔔 Chamar      │  │ ➕ Adicionar│ │   │
│  │  │    pelo App    │  │    Garçom      │  │    Itens    │ │   │
│  │  └────────────────┘  └────────────────┘  └─────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
│                             │                                    │
│                             ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                      PAGAMENTO                            │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐  │   │
│  │  │ Pagar no App│  │ 💳 Dividir  │  │ 💰 Gorjeta       │  │   │
│  │  │ (sem espera)│  │   Conta     │  │ 10% sugerido     │  │   │
│  │  └─────────────┘  └─────────────┘  └──────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                             │                                    │
│                             ▼                                    │
│              ┌─────────────────────────────────┐                │
│              │        AVALIAÇÃO + SAÍDA        │                │
│              └─────────────────────────────────┘                │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

#### Features Diferenciadoras

**1. Lista de Espera Inteligente**
```
┌─────────────────────────────────────────┐
│  👤 Posição: #4                         │
│  ⏱️  Tempo estimado: ~15 minutos        │
│  👥 Grupo: 4 pessoas                    │
├─────────────────────────────────────────┤
│  Enquanto espera:                       │
│  ┌─────────────────────────────────┐    │
│  │ 🍺 Pedir Bebidas                 │    │
│  │ Valores vão para sua comanda    │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │ 🚶 Passear por perto            │    │
│  │ Notificaremos quando estiver    │    │
│  │ próximo da sua vez              │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

**2. Botão "Chamar Garçom" Categorizado**
```
┌─────────────────────────────────────────┐
│  🔔 CHAMAR GARÇOM                       │
├─────────────────────────────────────────┤
│  Por que você precisa de ajuda?         │
│                                         │
│  ┌─────────┐  ┌─────────┐               │
│  │ 📝 Pedir │  │ ❓ Dúvida│              │
│  │   mais  │  │         │               │
│  └─────────┘  └─────────┘               │
│  ┌─────────┐  ┌─────────┐               │
│  │ 🔄 Refil │  │ 🍰 Sobre│              │
│  │         │  │   mesa  │               │
│  └─────────┘  └─────────┘               │
│  ┌─────────┐  ┌─────────┐               │
│  │ ⚠️ Probl │  │ 📞 Outro│              │
│  │   ema   │  │         │               │
│  └─────────┘  └─────────┘               │
│                                         │
│  [ Mensagem adicional (opcional) ]      │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │        CHAMAR GARÇOM            │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

**3. Pedido Parcial pelo App**
```
┌─────────────────────────────────────────┐
│  ➕ ADICIONAR AO PEDIDO                 │
├─────────────────────────────────────────┤
│  Seu pedido atual:                      │
│  ├ 1x Picanha ao ponto    [Preparando]  │
│  ├ 1x Arroz + Feijão      [Pronto]      │
│  └ 2x Coca-Cola           [Entregue]    │
├─────────────────────────────────────────┤
│  Adicionar rapidamente:                 │
│  ┌─────────┐┌─────────┐┌─────────┐      │
│  │ 🍺 Bebi │ │ 🍰 Sobre│ │ ☕ Café │     │
│  │   das   │ │   mesa  │ │        │      │
│  └─────────┘└─────────┘└─────────┘      │
├─────────────────────────────────────────┤
│  Modo de envio:                         │
│  [Enviar direto] ou [Confirmar c/garçom]│
└─────────────────────────────────────────┘
```

#### Integrações Específicas

- **Estimativa de Tempo Inteligente**: Cálculo baseado em ocupação atual × duração média × rotatividade target
- **Notificação Push/SMS**: "Sua mesa está quase pronta!" quando posição ≤ 2
- **KDS Integrado**: Garçom recebe chamadas no smartwatch/celular com categoria
- **Split Bill Destacado**: UI promove divisão de conta em grupos ≥ 3 pessoas
- **Gorjeta Sugerida**: Percentual configurável pré-selecionado no checkout

---

## 10. Pub & Bar 🍺

### Descrição Completa
Ambiente social focado em bebidas com serviço de mesa opcional, tabs digitais e happy hours automatizados. Ideal para bares, pubs, cervejarias e estabelecimentos focados na experiência social e de bebidas. O modelo prioriza **consumo compartilhado**, **agilidade no atendimento** e **flexibilidade de pagamento**.

### Características Operacionais

| Aspecto | Configuração |
|---------|-------------|
| **Público-Alvo** | Grupos de amigos, happy hour corporativo, encontros sociais |
| **Ticket Médio** | Médio (R$ 60-150 por pessoa) |
| **Tempo de Permanência** | 60-180 minutos |
| **Rotatividade de Mesas** | Média (3-5 giros/noite) |
| **Nível de Serviço** | Casual, focado em agilidade |
| **Horário de Pico** | 18:00 - 23:00 (Happy Hour e noite) |

### Funcionalidades Exclusivas

```typescript
// Configuração no Backend
interface PubBarConfig {
  tab_enabled: boolean;                    // Tabs digitais habilitadas
  group_tab_enabled: boolean;              // Tabs compartilhadas entre grupo
  happy_hour_enabled: boolean;             // Happy hour automático
  happy_hour_schedule: HappyHourSchedule[]; // Configuração de horários
  pre_auth_required: boolean;              // Pré-autorização de cartão obrigatória
  pre_auth_amount: number;                 // Valor de pré-autorização (ex: R$ 100)
  tab_limit_enabled: boolean;              // Limite de consumo por tab
  default_tab_limit: number;               // Limite padrão (ex: R$ 500)
  waiter_call_enabled: boolean;            // Chamar garçom digital
  repeat_round_enabled: boolean;           // Repetir última rodada
  consumption_split_enabled: boolean;      // Split por consumo individual
  cover_charge_enabled: boolean;           // Cobrança de couvert/entrada
  cover_charge_amount: number;             // Valor do couvert
  cover_charge_as_credit: boolean;         // Couvert vira crédito de consumo
  live_music_schedule: boolean;            // Programação de música ao vivo
}

interface HappyHourSchedule {
  id: string;
  dayOfWeek: number[];          // 0=Dom, 1=Seg, ..., 6=Sáb
  startTime: string;            // "17:00"
  endTime: string;              // "20:00"
  discountPercentage: number;   // 30 = 30% off
  categories: string[];         // ['cervejas', 'drinks'] ou vazio = todos
  description: string;          // "Dobradinha de Chopp"
  stackable: boolean;           // Acumula com outras promoções?
}
```

**Features Ativas:**
- ✅ **Tab Digital**: Conta individual ou compartilhada com pré-autorização de cartão
- ✅ **Tab Compartilhada**: Múltiplos usuários na mesma comanda com tracking individual
- ✅ **Happy Hour Automático**: Preços especiais aplicados automaticamente por horário
- ✅ **Repetir Rodada**: Reordenar última rodada de drinks com um toque
- ✅ **Split por Consumo**: Cada membro paga exatamente o que consumiu
- ✅ **Chamar Garçom**: Notificações categorizadas para staff
- ✅ **Limite de Tab**: Controle de gastos com alertas configuráveis
- ✅ **Crédito de Entrada**: Couvert convertido em crédito de consumo
- ✅ **Cardápio de Drinks**: Menu especializado com harmonizações

**Features Desativadas:**
- ❌ Reservas Obrigatórias (walk-in prioritário, reserva opcional para grupos grandes)
- ❌ Fila Virtual (ambiente casual, sem controle de capacidade rígido)
- ❌ Menu Degustação (foco em bebidas e petiscos)
- ❌ Sommelier Digital (cardápio de drinks é autoexplicativo)
- ❌ Geolocalização (estabelecimento fixo)

### Fluxo do Cliente - Tab Individual

```
┌──────────────────────────────────────────────────────────────────┐
│                    JORNADA PUB & BAR - TAB INDIVIDUAL            │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐          │
│  │   CHEGADA   │───▶│   SCAN QR   │───▶│   ABERTURA  │          │
│  │   no Bar    │    │   na Mesa   │    │   de Tab    │          │
│  └─────────────┘    └─────────────┘    └─────────────┘          │
│                                               │                  │
│                                               ▼                  │
│                                        ┌─────────────┐          │
│                                        │ PRÉ-AUTORI- │          │
│                                        │ ZAÇÃO CARTÃO│          │
│                                        │  (R$ 100)   │          │
│                                        └─────────────┘          │
│                                               │                  │
│         ┌─────────────────────────────────────┤                  │
│         │                                     │                  │
│         ▼                                     ▼                  │
│  ┌─────────────┐                       ┌─────────────┐          │
│  │ HAPPY HOUR  │    (se ativo)         │   CARDÁPIO  │          │
│  │ AUTOMÁTICO  │◄──────────────────────│   DRINKS    │          │
│  │  -30% OFF   │                       │   + MENU    │          │
│  └─────────────┘                       └─────────────┘          │
│                                               │                  │
│                                               ▼                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐          │
│  │  CHAMAR     │    │   REPETIR   │    │   PEDIDOS   │          │
│  │  GARÇOM     │◄──▶│   RODADA    │◄──▶│   VIA APP   │          │
│  │  (Digital)  │    │  (1 toque)  │    │             │          │
│  └─────────────┘    └─────────────┘    └─────────────┘          │
│                                               │                  │
│                                               ▼                  │
│                                        ┌─────────────┐          │
│                                        │ FECHAMENTO  │          │
│                                        │   DE TAB    │          │
│                                        └─────────────┘          │
│                                               │                  │
│                                               ▼                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐          │
│  │ AVALIAÇÃO   │◀───│  PAGAMENTO  │◀───│   RESUMO    │          │
│  │ + GORJETA   │    │   DIGITAL   │    │   CONSUMO   │          │
│  └─────────────┘    └─────────────┘    └─────────────┘          │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Fluxo do Cliente - Tab Compartilhada

```
┌──────────────────────────────────────────────────────────────────┐
│                 JORNADA PUB & BAR - TAB GRUPO                    │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐                                                │
│  │   HOST      │  "Criar Tab de Grupo"                          │
│  │   ABRE TAB  │──────────────────────────────────┐             │
│  └─────────────┘                                  │             │
│         │                                         │             │
│         │  Compartilha código/QR                  ▼             │
│         │                                  ┌─────────────┐      │
│         └─────────────────────────────────▶│   MEMBROS   │      │
│                                            │   ENTRAM    │      │
│  ┌─────────────┐    ┌─────────────┐       └─────────────┘      │
│  │  MEMBRO 1   │    │  MEMBRO 2   │              │              │
│  │  Pede 3x    │    │  Pede 2x    │              │              │
│  │  Cerveja    │    │  Drink      │              │              │
│  └──────┬──────┘    └──────┬──────┘              │              │
│         │                  │                     │              │
│         └────────┬─────────┘                     │              │
│                  │                               │              │
│                  ▼                               ▼              │
│           ┌─────────────────────────────────────────┐           │
│           │           TAB UNIFICADA                  │           │
│           │  ┌─────────────────────────────────┐    │           │
│           │  │ Membro 1: 3x Cerveja = R$ 45    │    │           │
│           │  │ Membro 2: 2x Drink = R$ 56      │    │           │
│           │  │ Host: 1x Petisco = R$ 32        │    │           │
│           │  │ ─────────────────────────────   │    │           │
│           │  │ TOTAL: R$ 133,00                │    │           │
│           │  └─────────────────────────────────┘    │           │
│           └─────────────────────────────────────────┘           │
│                              │                                   │
│                              ▼                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    OPÇÕES DE SPLIT                         │  │
│  ├───────────────────────────────────────────────────────────┤  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │  │
│  │  │    POR      │  │   IGUAL     │  │   ÚNICO     │        │  │
│  │  │  CONSUMO    │  │  (÷ todos)  │  │  PAGADOR    │        │  │
│  │  │ M1:R$45     │  │  R$44,33    │  │  Host paga  │        │  │
│  │  │ M2:R$56     │  │  cada um    │  │   tudo      │        │  │
│  │  │ Host:R$32   │  │             │  │             │        │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘        │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Fluxo Happy Hour

```
┌──────────────────────────────────────────────────────────────────┐
│                    HAPPY HOUR - LÓGICA AUTOMÁTICA                │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              CONFIGURAÇÃO DO RESTAURANTE                 │    │
│  │  ┌───────────────────────────────────────────────────┐   │    │
│  │  │ Seg-Qui: 17:00-20:00 → 30% OFF Cervejas           │   │    │
│  │  │ Sex:     17:00-21:00 → 40% OFF Chopp + 20% Drinks │   │    │
│  │  │ Sáb:     14:00-18:00 → 25% OFF Todos os Drinks    │   │    │
│  │  └───────────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    HORA DO PEDIDO                        │    │
│  │                                                          │    │
│  │    18:30 - Sexta-feira                                  │    │
│  │    ✅ Happy Hour ATIVO                                   │    │
│  │                                                          │    │
│  │    ┌───────────────────────────────────────────────┐    │    │
│  │    │ 🍺 Chopp Artesanal                            │    │    │
│  │    │    Preço Normal: R$ 18,90                     │    │    │
│  │    │    ┌─────────────────────────────────────┐    │    │    │
│  │    │    │ 🎉 HAPPY HOUR -40% │ R$ 11,34       │    │    │    │
│  │    │    └─────────────────────────────────────┘    │    │    │
│  │    └───────────────────────────────────────────────┘    │    │
│  │                                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Entidades Específicas

```typescript
// Tab - Comanda Digital
interface Tab {
  id: string;
  userId: string;                    // Dono/Host da tab
  restaurantId: string;
  tableId?: string;                  // Mesa associada
  type: 'individual' | 'group';
  status: 'open' | 'pending_payment' | 'closed';
  preAuthAmount?: number;            // Valor pré-autorizado
  preAuthTransactionId?: string;     // ID da pré-autorização
  limitAmount?: number;              // Limite máximo
  limitAlertSent?: boolean;          // Alerta de limite enviado
  members: TabMember[];              // Membros do grupo
  items: TabItem[];                  // Itens consumidos
  subtotal: number;                  // Subtotal antes de descontos
  happyHourDiscount: number;         // Desconto Happy Hour aplicado
  coverChargeTotal: number;          // Couvert total
  coverChargeCreditsUsed: number;    // Créditos de couvert usados
  total: number;                     // Total final
  tip?: number;                      // Gorjeta
  createdAt: Date;
  closedAt?: Date;
}

// TabMember - Membro de Tab Compartilhada
interface TabMember {
  id: string;
  tabId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  role: 'host' | 'member';
  status: 'active' | 'left' | 'paid';
  itemsCount: number;
  totalSpent: number;
  paidAmount: number;
  joinedAt: Date;
}

// TabItem - Item Consumido
interface TabItem {
  id: string;
  tabId: string;
  userId: string;                    // Quem pediu
  menuItemId: string;
  menuItemName: string;
  menuItemCategory: string;
  quantity: number;
  unitPrice: number;                 // Preço normal
  happyHourPrice?: number;           // Preço com desconto (se aplicável)
  finalPrice: number;                // Preço final aplicado
  total: number;
  notes?: string;
  status: 'pending' | 'preparing' | 'delivered' | 'cancelled';
  addedAt: Date;
  deliveredAt?: Date;
}

// HappyHour - Configuração de Happy Hour
interface HappyHour {
  id: string;
  restaurantId: string;
  name: string;                      // "Dobradinha de Chopp"
  description?: string;
  dayOfWeek: number[];               // [1,2,3,4] = Seg-Qui
  startTime: string;                 // "17:00"
  endTime: string;                   // "20:00"
  discountPercentage: number;        // 30 = 30% off
  discountType: 'percentage' | 'fixed' | 'buy_x_get_y';
  buyXGetY?: { buy: number; get: number }; // Compre 2 leve 3
  applicableCategories: string[];    // ['cervejas', 'chopes'] ou vazio = todos
  applicableItems?: string[];        // IDs específicos de itens
  stackable: boolean;                // Acumula com outras promoções
  maxUsesPerTab?: number;            // Limite de uso por tab
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// WaiterCall - Chamada de Garçom
interface WaiterCall {
  id: string;
  tabId: string;
  tableId: string;
  restaurantId: string;
  userId: string;
  type: 'refill' | 'question' | 'bill' | 'problem' | 'other';
  message?: string;
  urgency: 'low' | 'medium' | 'high';
  status: 'pending' | 'acknowledged' | 'resolved';
  assignedWaiterId?: string;
  createdAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
}
```

### API Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/tabs` | Abrir nova tab (individual ou grupo) |
| GET | `/tabs/:id` | Detalhes da tab |
| POST | `/tabs/:id/join` | Entrar em tab existente (grupo) |
| DELETE | `/tabs/:id/leave` | Sair de tab de grupo |
| POST | `/tabs/:id/items` | Adicionar itens à tab |
| DELETE | `/tabs/:id/items/:itemId` | Remover item (antes de preparar) |
| POST | `/tabs/:id/repeat-round` | Repetir última rodada |
| GET | `/tabs/:id/summary` | Resumo de consumo por membro |
| POST | `/tabs/:id/split` | Calcular divisão |
| POST | `/tabs/:id/pay` | Processar pagamento |
| PUT | `/tabs/:id/close` | Fechar tab |
| GET | `/happy-hour/active` | Happy hour ativo agora |
| GET | `/happy-hour/schedule/:restaurantId` | Programação de happy hours |
| POST | `/happy-hour` | Criar happy hour (staff) |
| PUT | `/happy-hour/:id` | Editar happy hour (staff) |
| POST | `/waiter-calls` | Chamar garçom |
| GET | `/waiter-calls/pending` | Chamadas pendentes (staff) |
| PUT | `/waiter-calls/:id/acknowledge` | Assumir chamada (staff) |
| PUT | `/waiter-calls/:id/resolve` | Resolver chamada (staff) |

### Integrações Específicas

- **Pré-Autorização de Cartão**: Gateway de pagamento retém valor configurável (ex: R$100) que é liberado ou capturado no fechamento
- **Happy Hour Engine**: Cálculo automático de descontos baseado em horário, dia da semana e categorias
- **Notificação de Limite**: Push notification quando tab atinge 80% do limite configurado
- **Smart Round**: Análise de pedidos anteriores para sugerir composição de rodada
- **KDS Integrado**: Pedidos de drinks com prioridade por tempo de espera
- **Relatório de Consumo**: Analytics de consumo por período, categorias mais vendidas, ROI de happy hours

---

## 11. Club & Balada 🎵

### Descrição Completa
Entretenimento noturno com sistema completo de entrada, camarotes VIP, filas virtuais e acompanhamento de lotação em tempo real. Destinado a casas noturnas, baladas, clubs e venues de eventos. O modelo prioriza **controle de acesso**, **experiência VIP diferenciada**, **monetização por tiers** e **gestão de capacidade**.

### Características Operacionais

| Aspecto | Configuração |
|---------|-------------|
| **Público-Alvo** | Jovens adultos (18-35), grupos de celebração, eventos corporativos |
| **Ticket Médio** | Variável (R$ 40-300+ por pessoa) |
| **Tempo de Permanência** | 3-6 horas |
| **Capacidade** | Controlada por lotação máxima legal |
| **Nível de Serviço** | Diferenciado por tier (Pista/VIP/Camarote) |
| **Horário de Operação** | 22:00 - 06:00 (varia por região) |

### Funcionalidades Exclusivas

```typescript
// Configuração no Backend
interface ClubConfig {
  // Entradas
  entry_types: EntryTier[];                // Tipos de entrada disponíveis
  advance_sales_enabled: boolean;          // Venda antecipada
  advance_discount_percentage: number;     // Desconto para antecipado (ex: 25%)
  door_sales_enabled: boolean;             // Venda na porta
  guest_list_enabled: boolean;             // Lista VIP
  guest_list_deadline_hours: number;       // Prazo para entrar na lista (ex: 18h antes)
  birthday_entry_enabled: boolean;         // Entrada aniversário grátis
  birthday_window_days: number;            // Janela de dias (ex: 7 = -3/+7 do aniversário)
  birthday_max_companions: number;         // Máximo de acompanhantes
  birthday_companion_discount: number;     // Desconto para acompanhantes (ex: 50%)
  
  // Camarotes VIP
  vip_tables_enabled: boolean;             // Camarotes habilitados
  vip_tables: VipTableConfig[];            // Configuração de camarotes
  minimum_spend_required: boolean;         // Consumo mínimo obrigatório
  minimum_spend_includes_entry: boolean;   // Mínimo inclui valor de entrada
  
  // Fila e Lotação
  virtual_queue_enabled: boolean;          // Fila virtual
  queue_priority_levels: string[];         // ['standard', 'vip', 'ultra_vip']
  occupancy_tracking: boolean;             // Lotação em tempo real
  max_capacity: number;                    // Capacidade máxima
  occupancy_alert_threshold: number;       // Alerta quando atingir % (ex: 85%)
  
  // Consumação
  consumption_credit_enabled: boolean;     // Crédito de consumação
  credit_expiry_policy: 'event' | 'never'; // Validade do crédito
  wristband_enabled: boolean;              // Pulseira eletrônica
  wristband_colors: WristbandConfig[];     // Cores por tier
  
  // Extras
  lineup_display: boolean;                 // Exibir lineup de artistas
  promoter_system: boolean;                // Sistema de promoters
  promoter_commission_default: number;     // Comissão padrão (ex: 10%)
  photo_gallery_enabled: boolean;          // Galeria de fotos do evento
  social_sharing_enabled: boolean;         // Compartilhamento social
}

interface EntryTier {
  id: string;
  name: string;                  // "Pista", "Open Bar", "VIP Area"
  description: string;
  doorPrice: number;             // Preço na porta
  advancePrice: number;          // Preço antecipado
  consumptionCredit: number;     // Crédito de consumação incluído
  includes: string[];            // ["Acesso à pista", "1 drink cortesia"]
  availableGender?: 'all' | 'male' | 'female';  // Preço por gênero (onde legal)
  maxQuantityPerPurchase: number;
  salesDeadline?: Date;          // Prazo de venda
  isActive: boolean;
}

interface VipTableConfig {
  id: string;
  name: string;                  // "Camarote Premium", "Área VIP Gold"
  capacity: number;              // Capacidade máxima de pessoas
  minimumSpend: number;          // Consumo mínimo obrigatório
  reservationFee: number;        // Taxa de reserva (pode ser abatida do mínimo)
  location: string;              // "Mezanino", "Lateral Pista"
  amenities: string[];           // ["Mesa exclusiva", "Garçom dedicado", "Vista palco"]
  isActive: boolean;
}

interface WristbandConfig {
  color: string;                 // "green", "gold", "black"
  tier: string;                  // "pista", "vip", "camarote"
  consumptionCredit: number;     // Crédito associado
  accessAreas: string[];         // Áreas com acesso
}
```

**Features Ativas:**
- ✅ **Entrada Antecipada**: Compra de ingressos online com desconto
- ✅ **Múltiplos Tiers**: Pista, Open Bar, VIP, Premium com preços diferenciados
- ✅ **Reserva de Camarotes**: VIP tables com consumo mínimo e gestão de convidados
- ✅ **Guest List**: Lista VIP com entrada gratuita ou desconto para convidados especiais
- ✅ **Fila Virtual**: Posição em tempo real com estimativa de espera
- ✅ **Níveis de Prioridade**: Standard, VIP, Ultra VIP na fila
- ✅ **Lotação em Tempo Real**: Indicador público de ocupação (Tranquilo/Animado/Lotado)
- ✅ **Lineup de Artistas**: Programação de DJs/artistas com horários
- ✅ **Entrada de Aniversário**: Verificação de documento + entrada grátis
- ✅ **Acompanhantes com Desconto**: Desconto para grupo do aniversariante
- ✅ **Sistema de Promoters**: Códigos de indicação, tracking de vendas, comissões automáticas
- ✅ **Crédito de Consumação**: Entrada convertida em crédito para consumo interno
- ✅ **Pulseira Eletrônica**: QR code para validação de acesso e consumo
- ✅ **Check-in/Check-out**: Controle de entrada e saída

**Features Desativadas:**
- ❌ Reserva de Mesa tradicional (substituída por sistema de camarotes)
- ❌ Menu Degustação (foco em drinks e finger food)
- ❌ Pedido Parcial (consumação via crédito ou tab de camarote)
- ❌ Sommelier Digital (cardápio de drinks simplificado)

### Fluxo do Cliente - Entrada Antecipada

```
┌──────────────────────────────────────────────────────────────────┐
│                JORNADA CLUB - ENTRADA ANTECIPADA                 │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    DESCOBERTA DO EVENTO                  │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │    │
│  │  │   LINEUP    │  │   LOTAÇÃO   │  │   PREÇOS    │      │    │
│  │  │  DJ Snake   │  │  Moderada   │  │  a partir   │      │    │
│  │  │  23:00      │  │   65%       │  │  R$ 60      │      │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              SELEÇÃO DE TIPO DE ENTRADA                  │    │
│  │                                                          │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │ PISTA                      │ R$ 60  (antes R$80)│    │    │
│  │  │ ✓ Acesso à pista           │ + R$ 30 consumação│    │    │
│  │  │ ✓ 1 drink cortesia         │                    │    │    │
│  │  └─────────────────────────────────────────────────┘    │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │ OPEN BAR                   │ R$ 180             │    │    │
│  │  │ ✓ Bebidas liberadas 23h-3h │ Economize R$ 50   │    │    │
│  │  │ ✓ Entrada preferencial     │                    │    │    │
│  │  └─────────────────────────────────────────────────┘    │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │ VIP AREA                   │ R$ 250             │    │    │
│  │  │ ✓ Acesso área VIP          │ Exclusivo         │    │    │
│  │  │ ✓ Open bar premium         │                    │    │    │
│  │  │ ✓ Vista privilegiada       │                    │    │    │
│  │  └─────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              QUANTIDADE + CÓDIGO PROMOTER                │    │
│  │                                                          │    │
│  │    Quantidade: [─] 3 [+]     Código: [DJCAR123____]     │    │
│  │                                       └─ 5% desconto    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    PAGAMENTO                             │    │
│  │                                                          │    │
│  │    3x Pista Antecipado           R$ 180,00              │    │
│  │    Desconto Promoter (-5%)       -R$   9,00             │    │
│  │    ────────────────────────────────────────             │    │
│  │    TOTAL                         R$ 171,00              │    │
│  │    + R$ 90 em crédito consumação                        │    │
│  │                                                          │    │
│  │    [💳 PIX] [💳 Cartão] [Apple Pay]                     │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    CONFIRMAÇÃO                           │    │
│  │                                                          │    │
│  │   ╔═══════════════════════════════════════════════════╗ │    │
│  │   ║                    QR CODE                         ║ │    │
│  │   ║                   [███████]                        ║ │    │
│  │   ║                   [███████]                        ║ │    │
│  │   ║                   [███████]                        ║ │    │
│  │   ║                                                    ║ │    │
│  │   ║   TK-PISTA-A3B4C5                                 ║ │    │
│  │   ║   3 entradas • Sex, 31 Jan • 23:00                ║ │    │
│  │   ╚═══════════════════════════════════════════════════╝ │    │
│  │                                                          │    │
│  │   [📱 Adicionar ao Wallet] [📤 Compartilhar]            │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Fluxo do Cliente - Dia do Evento

```
┌──────────────────────────────────────────────────────────────────┐
│                  JORNADA CLUB - DIA DO EVENTO                    │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐                                                │
│  │   CHEGADA   │  23:30                                         │
│  │   ao Venue  │──────────────────────┐                         │
│  └─────────────┘                      │                         │
│                                       ▼                         │
│                              ┌─────────────────┐                │
│                              │   FILA / PORTA  │                │
│                              │                 │                │
│                              │  📱 Mostrar QR  │                │
│                              └────────┬────────┘                │
│                                       │                         │
│                                       ▼                         │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   VALIDAÇÃO (Staff)                      │    │
│  │                                                          │    │
│  │   ✅ QR Válido                                           │    │
│  │   ✅ Documento conferido                                 │    │
│  │   ✅ 3 entradas disponíveis                              │    │
│  │                                                          │    │
│  │   [Registrar Check-in] [Cancelar]                        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                       │                         │
│                                       ▼                         │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                 PULSEIRA ELETRÔNICA                      │    │
│  │                                                          │    │
│  │   Cor: 🟢 VERDE (Pista)                                  │    │
│  │   Crédito: R$ 30,00                                      │    │
│  │   Áreas: Pista Principal, Bar 1, Bar 2                   │    │
│  │                                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                       │                         │
│                                       ▼                         │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    DENTRO DO VENUE                       │    │
│  │                                                          │    │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐            │    │
│  │  │  CONSUMIR │  │  VERIFICAR │  │    VER    │            │    │
│  │  │  CRÉDITO  │  │   SALDO   │  │  LINEUP   │            │    │
│  │  │   no Bar  │  │  R$ 30    │  │  Próximo: │            │    │
│  │  │           │  │           │  │  01:00    │            │    │
│  │  └───────────┘  └───────────┘  └───────────┘            │    │
│  │                                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                       │                         │
│                                       ▼                         │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                     CHECK-OUT                            │    │
│  │                                                          │    │
│  │   Entrada: 23:35                                         │    │
│  │   Saída: 03:45                                          │    │
│  │   Tempo no venue: 4h 10min                              │    │
│  │                                                          │    │
│  │   Crédito usado: R$ 28,00                               │    │
│  │   Crédito restante: R$ 2,00 (não reembolsável)          │    │
│  │                                                          │    │
│  │   [⭐ Avaliar Evento]                                    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Fluxo do Cliente - Camarote VIP

```
┌──────────────────────────────────────────────────────────────────┐
│                   JORNADA CLUB - CAMAROTE VIP                    │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                SELEÇÃO DE CAMAROTE                       │    │
│  │                                                          │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │ 🥇 CAMAROTE PREMIUM                             │    │    │
│  │  │    Capacidade: até 10 pessoas                   │    │    │
│  │  │    Localização: Mezanino com vista para palco   │    │    │
│  │  │    Consumo mínimo: R$ 2.000                     │    │    │
│  │  │    Inclui: Mesa exclusiva, garçom dedicado      │    │    │
│  │  │    Reserva: R$ 500 (abatido do mínimo)          │    │    │
│  │  └─────────────────────────────────────────────────┘    │    │
│  │                                                          │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │ 🥈 CAMAROTE GOLD                                │    │    │
│  │  │    Capacidade: até 8 pessoas                    │    │    │
│  │  │    Consumo mínimo: R$ 1.500                     │    │    │
│  │  └─────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                  CONVIDAR CONVIDADOS                     │    │
│  │                                                          │    │
│  │   Host: Você (organizador)                              │    │
│  │                                                          │    │
│  │   Convidados (7/10):                                    │    │
│  │   ┌────────────────────────────────────────────────┐    │    │
│  │   │ 👤 João Silva     ✅ Confirmado                │    │    │
│  │   │ 👤 Maria Santos   ⏳ Pendente                  │    │    │
│  │   │ 👤 Pedro Costa    ✅ Confirmado                │    │    │
│  │   │ 👤 Ana Lima       ❌ Recusou                   │    │    │
│  │   │ [+ Adicionar convidado]                        │    │    │
│  │   └────────────────────────────────────────────────┘    │    │
│  │                                                          │    │
│  │   Enviar convite via: [📱 WhatsApp] [📧 Email] [🔗 Link]│    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                  NO EVENTO - TAB DO CAMAROTE             │    │
│  │                                                          │    │
│  │   ╔══════════════════════════════════════════════════╗  │    │
│  │   ║  CONSUMO MÍNIMO                                   ║  │    │
│  │   ║                                                   ║  │    │
│  │   ║  ███████████████████░░░░░░  R$ 1.450 / R$ 2.000  ║  │    │
│  │   ║                              72% atingido         ║  │    │
│  │   ║                                                   ║  │    │
│  │   ║  Falta: R$ 550 para atingir o mínimo              ║  │    │
│  │   ╚══════════════════════════════════════════════════╝  │    │
│  │                                                          │    │
│  │   Últimos pedidos:                                      │    │
│  │   • 1x Vodka Grey Goose 750ml    R$ 450                 │    │
│  │   • 2x Red Bull                   R$ 40                  │    │
│  │   • 1x Espumante Chandon          R$ 280                 │    │
│  │                                                          │    │
│  │   [+ Adicionar Pedido] [📋 Ver Cardápio Completo]        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    FECHAMENTO                            │    │
│  │                                                          │    │
│  │   Consumo Total:     R$ 2.340                           │    │
│  │   Mínimo:            R$ 2.000   ✅ Atingido              │    │
│  │   Excedente:         R$ 340                              │    │
│  │   Taxa de Serviço:   R$ 234     (10%)                    │    │
│  │   ─────────────────────────────────────                 │    │
│  │   TOTAL A PAGAR:     R$ 574                              │    │
│  │                                                          │    │
│  │   Dividir entre: [Host paga tudo] [Dividir igualmente]  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Fluxo do Cliente - Entrada de Aniversário

```
┌──────────────────────────────────────────────────────────────────┐
│              JORNADA CLUB - ENTRADA DE ANIVERSÁRIO               │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              VERIFICAÇÃO DE ELEGIBILIDADE                │    │
│  │                                                          │    │
│  │   🎂 Seu aniversário: 28 de Janeiro                     │    │
│  │                                                          │    │
│  │   Período elegível: 25 Jan - 04 Fev (±7 dias)           │    │
│  │   Status: ✅ ELEGÍVEL                                    │    │
│  │                                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                 UPLOAD DE DOCUMENTO                      │    │
│  │                                                          │    │
│  │   Envie foto do RG ou CNH mostrando data de nascimento  │    │
│  │                                                          │    │
│  │   ┌─────────────────────────────────────────────────┐   │    │
│  │   │                                                  │   │    │
│  │   │     [📷 Tirar Foto]   [📁 Fazer Upload]         │   │    │
│  │   │                                                  │   │    │
│  │   └─────────────────────────────────────────────────┘   │    │
│  │                                                          │    │
│  │   ⚠️ O documento será verificado pela equipe            │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │               SELEÇÃO DE ACOMPANHANTES                   │    │
│  │                                                          │    │
│  │   Você: GRÁTIS 🎁                                        │    │
│  │                                                          │    │
│  │   Acompanhantes (máx. 3):  [─] 2 [+]                    │    │
│  │                                                          │    │
│  │   Desconto para acompanhantes: 50% OFF                  │    │
│  │   2x R$ 40 (era R$ 80) = R$ 80                          │    │
│  │                                                          │    │
│  │   TOTAL: R$ 80,00                                       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              AGUARDANDO APROVAÇÃO                        │    │
│  │                                                          │    │
│  │   ⏳ Sua solicitação está em análise                     │    │
│  │                                                          │    │
│  │   Evento: Friday Night Party                            │    │
│  │   Data: 31 de Janeiro                                   │    │
│  │   Acompanhantes: 2                                      │    │
│  │                                                          │    │
│  │   Você receberá uma notificação quando aprovado.        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    APROVADO! 🎉                          │    │
│  │                                                          │    │
│  │   ╔═══════════════════════════════════════════════════╗ │    │
│  │   ║                    QR CODE                         ║ │    │
│  │   ║                   [███████]                        ║ │    │
│  │   ║                   [███████]                        ║ │    │
│  │   ║                                                    ║ │    │
│  │   ║   BD-JOAO28-XY                                    ║ │    │
│  │   ║   Aniversariante + 2 acompanhantes                ║ │    │
│  │   ║   Sex, 31 Jan • Válido até 03:00                  ║ │    │
│  │   ╚═══════════════════════════════════════════════════╝ │    │
│  │                                                          │    │
│  │   💡 Apresente documento original na entrada            │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Fluxo Staff - Door Control

```
┌──────────────────────────────────────────────────────────────────┐
│                   STAFF - CONTROLE DE PORTA                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    STATUS DO EVENTO                      │    │
│  │                                                          │    │
│  │   🟢 ABERTO    Lotação: 72% (432/600)                   │    │
│  │                                                          │    │
│  │   Entradas hoje: 456                                    │    │
│  │   Ticket médio: R$ 78                                   │    │
│  │   Fila virtual: 23 pessoas                              │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   SCANNER DE QR CODE                     │    │
│  │                                                          │    │
│  │   ┌─────────────────────────────────────────────────┐   │    │
│  │   │                                                  │   │    │
│  │   │              📷 ÁREA DO SCANNER                  │   │    │
│  │   │                                                  │   │    │
│  │   │         Aponte para o QR Code do cliente         │   │    │
│  │   │                                                  │   │    │
│  │   └─────────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │               RESULTADO DA VALIDAÇÃO                     │    │
│  │                                                          │    │
│  │   ✅ ENTRADA VÁLIDA                                      │    │
│  │                                                          │    │
│  │   Nome: João Silva                                      │    │
│  │   Tipo: Pista (Antecipado)                              │    │
│  │   Entradas: 3                                           │    │
│  │   Crédito: R$ 90 (R$ 30 cada)                           │    │
│  │                                                          │    │
│  │   Pulseira: 🟢 VERDE                                     │    │
│  │                                                          │    │
│  │   [✅ Confirmar Check-in]  [❌ Cancelar]                 │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │               VALIDAÇÕES RECENTES                        │    │
│  │                                                          │    │
│  │   23:45 ✅ Maria Santos - VIP - 2 entradas              │    │
│  │   23:42 ✅ Pedro Lima - Pista - 1 entrada               │    │
│  │   23:40 ❌ Ana Costa - QR já utilizado                  │    │
│  │   23:38 ✅ Carlos Melo - Birthday + 2                   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Entidades Específicas

```typescript
// ClubEntry - Entrada/Ingresso
interface ClubEntry {
  id: string;
  userId: string;
  restaurantId: string;
  eventId?: string;                      // Evento específico
  eventDate: Date;
  entryType: 'advance' | 'door' | 'guest_list' | 'birthday' | 'promoter';
  ticketTier: string;                    // ID do tier selecionado
  ticketTierName: string;                // "Pista", "Open Bar", etc.
  quantity: number;                      // Quantidade de entradas
  unitPrice: number;                     // Preço unitário
  totalPrice: number;                    // Preço total
  discountApplied: number;               // Desconto aplicado
  promoterCode?: string;                 // Código do promoter (se usado)
  promoterId?: string;                   // ID do promoter
  consumptionCredit: number;             // Crédito total de consumação
  consumptionCreditRemaining: number;    // Crédito restante
  status: 'pending' | 'paid' | 'confirmed' | 'used' | 'cancelled' | 'refunded';
  qrCode: string;                        // Código QR único
  qrPayload: string;                     // Payload criptografado
  wristbandColor?: string;               // Cor da pulseira
  checkedInAt?: Date;                    // Momento do check-in
  checkedInBy?: string;                  // Staff que fez check-in
  checkedOutAt?: Date;                   // Momento do check-out
  purchasedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// VipTableReservation - Reserva de Camarote
interface VipTableReservation {
  id: string;
  userId: string;                        // Host da reserva
  restaurantId: string;
  tableId: string;
  tableName: string;
  eventDate: Date;
  guestCount: number;                    // Número de convidados esperados
  maxCapacity: number;                   // Capacidade máxima do camarote
  guests: VipTableGuest[];               // Lista de convidados
  minimumSpend: number;                  // Consumo mínimo obrigatório
  currentSpend: number;                  // Consumo atual
  reservationFee: number;                // Taxa de reserva
  reservationFeeStatus: 'pending' | 'paid' | 'refunded';
  status: 'pending' | 'confirmed' | 'checked_in' | 'active' | 'completed' | 'cancelled';
  tabId?: string;                        // Tab associada ao camarote
  specialRequests?: string;              // Pedidos especiais
  confirmedAt?: Date;
  checkedInAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// VipTableGuest - Convidado de Camarote
interface VipTableGuest {
  id: string;
  reservationId: string;
  userId?: string;                       // Se tem conta no app
  name: string;
  phone?: string;
  email?: string;
  status: 'invited' | 'confirmed' | 'declined' | 'checked_in' | 'no_show';
  invitedAt: Date;
  confirmedAt?: Date;
  checkedInAt?: Date;
}

// QueueEntry - Entrada na Fila Virtual
interface QueueEntry {
  id: string;
  userId: string;
  userName: string;
  restaurantId: string;
  eventDate: Date;
  position: number;                      // Posição atual na fila
  initialPosition: number;               // Posição quando entrou
  priority: 'standard' | 'vip' | 'ultra_vip';
  priorityReason?: string;               // "VIP Member", "Birthday", etc.
  partySize: number;                     // Tamanho do grupo
  estimatedWaitMinutes: number;          // Tempo estimado de espera
  status: 'waiting' | 'called' | 'admitted' | 'no_show' | 'left';
  notificationsSent: number;             // Quantas notificações enviadas
  joinedAt: Date;
  calledAt?: Date;                       // Quando foi chamado
  admittedAt?: Date;                     // Quando entrou
  leftAt?: Date;                         // Quando saiu da fila
  createdAt: Date;
  updatedAt: Date;
}

// BirthdayEntry - Entrada de Aniversário
interface BirthdayEntry {
  id: string;
  userId: string;
  userName: string;
  restaurantId: string;
  eventDate: Date;
  birthday: Date;                        // Data de nascimento
  age: number;                           // Idade no evento
  documentType: 'rg' | 'cnh' | 'passport';
  documentImageUrl: string;              // URL da imagem do documento
  documentVerified: boolean;             // Documento verificado
  companions: number;                    // Número de acompanhantes
  companionDiscount: number;             // Desconto para acompanhantes
  companionsTotalPrice: number;          // Preço total acompanhantes
  status: 'pending' | 'approved' | 'rejected' | 'used' | 'expired';
  rejectionReason?: string;              // Motivo da rejeição
  reviewedBy?: string;                   // Staff que revisou
  reviewedAt?: Date;                     // Quando foi revisado
  qrCode?: string;                       // QR Code após aprovação
  usedAt?: Date;                         // Quando foi usado
  createdAt: Date;
  updatedAt: Date;
}

// Promoter - Promoter/Divulgador
interface Promoter {
  id: string;
  userId: string;
  restaurantId: string;
  name: string;
  nickname?: string;
  phone: string;
  email: string;
  photoUrl?: string;
  promoterCode: string;                  // Código único (ex: DJCAR123)
  commissionType: 'percentage' | 'fixed_per_entry' | 'fixed_per_table' | 'tiered';
  commissionRate: number;                // Taxa de comissão (% ou valor fixo)
  tieredRates?: TieredCommission[];      // Taxas escalonadas
  status: 'pending_approval' | 'active' | 'inactive' | 'suspended';
  totalEntriesSold: number;              // Total de entradas vendidas
  totalTablesSold: number;               // Total de camarotes vendidos
  totalRevenue: number;                  // Receita total gerada
  totalCommissionEarned: number;         // Comissão total recebida
  pendingCommission: number;             // Comissão pendente
  pixKey?: string;                       // Chave PIX para pagamento
  bankAccount?: BankAccount;             // Conta bancária
  createdAt: Date;
  updatedAt: Date;
}

interface TieredCommission {
  tier: number;
  minEntries: number;
  maxEntries?: number;
  rate: number;
}

// Lineup - Programação de Artistas
interface Lineup {
  id: string;
  restaurantId: string;
  eventDate: Date;
  eventName: string;
  slots: LineupSlot[];
  coverImageUrl?: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface LineupSlot {
  id: string;
  lineupId: string;
  startTime: string;                     // "23:00"
  endTime: string;                       // "01:00"
  artistName: string;
  artistImageUrl?: string;
  genre: string;
  isHeadliner: boolean;
  socialLinks?: {
    instagram?: string;
    spotify?: string;
    soundcloud?: string;
  };
}

// Occupancy - Lotação em Tempo Real
interface Occupancy {
  id: string;
  restaurantId: string;
  maxCapacity: number;
  currentCount: number;
  percentage: number;
  level: 'low' | 'moderate' | 'high' | 'full';
  checkInsToday: number;
  checkOutsToday: number;
  peakCount: number;
  peakTime?: Date;
  lastUpdated: Date;
}
```

### API Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| **Entradas** | | |
| POST | `/club-entries` | Comprar entrada(s) |
| GET | `/club-entries/my` | Minhas entradas |
| GET | `/club-entries/:id` | Detalhes da entrada |
| POST | `/club-entries/validate` | Validar QR na porta (staff) |
| POST | `/club-entries/:id/check-in` | Registrar check-in (staff) |
| POST | `/club-entries/:id/check-out` | Registrar check-out (staff) |
| PUT | `/club-entries/:id/cancel` | Cancelar entrada |
| **Camarotes VIP** | | |
| GET | `/vip-tables/available` | Camarotes disponíveis para data |
| POST | `/vip-tables` | Reservar camarote |
| GET | `/vip-tables/:id` | Detalhes da reserva |
| POST | `/vip-tables/:id/guests` | Adicionar convidado |
| DELETE | `/vip-tables/:id/guests/:guestId` | Remover convidado |
| PUT | `/vip-tables/:id/confirm` | Confirmar reserva (após pagamento) |
| POST | `/vip-tables/:id/check-in` | Check-in do camarote (staff) |
| GET | `/vip-tables/:id/tab` | Tab/consumo do camarote |
| POST | `/vip-tables/:id/tab/items` | Adicionar item ao camarote |
| **Fila Virtual** | | |
| POST | `/queue` | Entrar na fila |
| GET | `/queue/position` | Minha posição na fila |
| DELETE | `/queue/:id` | Sair da fila |
| GET | `/queue/restaurant/:id/status` | Status da fila (staff) |
| POST | `/queue/:id/call` | Chamar próximo (staff) |
| POST | `/queue/:id/admit` | Registrar entrada (staff) |
| POST | `/queue/:id/no-show` | Marcar no-show (staff) |
| **Guest List** | | |
| POST | `/guest-list` | Adicionar à lista VIP |
| GET | `/guest-list/event/:date` | Lista VIP do evento (staff) |
| PUT | `/guest-list/:id/confirm` | Confirmar entrada (staff) |
| **Aniversário** | | |
| POST | `/birthday-entries` | Solicitar entrada de aniversário |
| GET | `/birthday-entries/my` | Minhas solicitações |
| GET | `/birthday-entries/pending` | Pendentes (staff) |
| PUT | `/birthday-entries/:id/approve` | Aprovar (staff) |
| PUT | `/birthday-entries/:id/reject` | Rejeitar (staff) |
| POST | `/birthday-entries/:id/use` | Usar entrada (staff) |
| **Promoters** | | |
| POST | `/promoters/register` | Registrar como promoter |
| GET | `/promoters/code/:code` | Buscar por código |
| GET | `/promoters/:id/dashboard` | Dashboard do promoter |
| GET | `/promoters/:id/sales` | Vendas do promoter |
| POST | `/promoters/:id/payments` | Processar pagamento (staff) |
| GET | `/promoters/restaurant/:id/leaderboard` | Ranking de promoters |
| **Lotação e Lineup** | | |
| GET | `/occupancy/:restaurantId` | Lotação atual |
| GET | `/occupancy/:restaurantId/history` | Histórico de lotação |
| GET | `/lineup/:restaurantId/:date` | Lineup do evento |
| POST | `/lineup` | Criar lineup (staff) |
| PUT | `/lineup/:id` | Editar lineup (staff) |
| **QR Codes** | | |
| POST | `/qr-codes/generate/entry` | Gerar QR para entrada |
| POST | `/qr-codes/generate/wristband` | Gerar QR para pulseira |
| POST | `/qr-codes/validate` | Validar QR code |
| GET | `/qr-codes/stats` | Estatísticas de validação |

### WebSocket Events

| Evento | Room | Payload | Descrição |
|--------|------|---------|-----------|
| `occupancy:update` | `occupancy:{restaurantId}` | `{ level, count, percentage, maxCapacity }` | Atualização de lotação |
| `queue:position` | `queue:{restaurantId}:{userId}` | `{ position, estimatedWait, aheadOfYou }` | Posição na fila atualizada |
| `queue:called` | `queue:{restaurantId}:{userId}` | `{ message, expiresIn }` | Chamada para entrada |
| `queue:status` | `queue:{restaurantId}` | `{ totalWaiting, avgWait }` | Status geral da fila |
| `vip-tab:updated` | `vip-table:{tableId}` | `{ currentSpend, minimumSpend, remaining }` | Tab do camarote atualizada |
| `vip-tab:item_added` | `vip-table:{tableId}` | `{ item, newTotal }` | Item adicionado ao camarote |
| `entry:validated` | `door:{restaurantId}` | `{ entry, wristbandColor }` | Entrada validada (staff) |
| `lineup:updated` | `lineup:{restaurantId}` | `{ slots }` | Lineup atualizado |

### Integrações Específicas

- **Gateway de Pagamento**: PIX instantâneo, cartões, Apple/Google Pay para vendas antecipadas
- **Pulseira NFC**: Integração com sistemas de pulseira eletrônica para controle de consumo
- **Lotação Automática**: Contagem via sensores nas catracas ou manual via check-in/out
- **Promoter Tracking**: Códigos únicos com atribuição automática de comissões
- **Push Notifications**: Alertas de fila, confirmações, lembretes de evento
- **Wallet Integration**: Apple Wallet e Google Pay para ingressos digitais
- **Analytics em Tempo Real**: Dashboard de vendas, conversões, ROI de promoters
- **Verificação de Idade**: Integração com sistemas de validação de documento (OCR)

---

## Matriz de Funcionalidades Completa

| Feature | Fine Dining | Quick Service | Fast Casual | Café/Padaria | Buffet | Drive-Thru | Food Truck | Chef's Table | Casual Dining | Pub & Bar | Club |
|---------|:-----------:|:-------------:|:-----------:|:------------:|:------:|:----------:|:----------:|:------------:|:-------------:|:---------:|:----:|
| Reservas | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| Fila Virtual | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ |
| Mesa Digital | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Dish Builder | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Geolocalização | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Sommelier/AI | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Balança Smart | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Chamar Garçom | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Tab Digital | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Happy Hour | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Repeat Round | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Entradas/Tickets | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Camarotes VIP | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Guest List | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Birthday Entry | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Promoters | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Lotação Real-Time | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Lineup/Artistas | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## Conclusão

O sistema de Tipos de Serviço do Okinawa é uma arquitetura **flexível e escalável** que permite que um único código-base atenda a **11 modelos de negócio distintos**. A implementação atual cobre:

- ✅ **Definição completa** de todos os 11 tipos com especificações detalhadas
- ✅ **Entidades de banco de dados** com campos específicos por tipo
- ✅ **Context e configurações** dinâmicas no frontend
- ✅ **Wizard de configuração** para setup inicial
- ✅ **Adaptação dinâmica** da UI por tipo de serviço
- ✅ **Fine Dining** com Reservas, Sommelier e Mapa de Mesas
- ✅ **Quick Service** com Fila Virtual e Skip the Line
- ✅ **Fast Casual** com Dish Builder e Informações Nutricionais
- ✅ **Café/Padaria** com Pedido Híbrido
- ✅ **Buffet** com Balança Inteligente
- ✅ **Drive-Thru** e **Food Truck** com Geolocalização
- ✅ **Chef's Table** com Experiência Exclusiva
- ✅ **Casual Dining** com Lista de Espera, Chamar Garçom e Pedido Parcial
- ✅ **Pub & Bar** com Tabs Digitais, Happy Hour, Repeat Round e Split por Consumo
- ✅ **Club & Balada** com Entradas Antecipadas, Camarotes VIP, Fila Virtual, Birthday Entry e Sistema de Promoters

O roadmap prevê expansão para **integrações IoT** (pulseiras NFC, catracas automáticas), **analytics avançados** (previsão de demanda, otimização de preços) e **otimização por IA** (recomendações personalizadas, detecção de fraude), consolidando o Okinawa como a plataforma mais completa para experiências gastronômicas e de entretenimento presenciais.

---

> **Documento mantido pela equipe de desenvolvimento Okinawa**  
> **Última revisão**: Janeiro 2025  
> **Versão**: 3.0
