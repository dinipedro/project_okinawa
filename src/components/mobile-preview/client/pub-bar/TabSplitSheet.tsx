import React, { useState } from 'react';
import { useMobilePreview } from '../../context/MobilePreviewContext';
import {
  X,
  Receipt,
  Percent,
  Users,
  Check,
  ChevronRight,
  User,
  Crown,
  CreditCard,
} from 'lucide-react';

// Tab members with consumption
const members = [
  {
    id: 'u1',
    name: 'Você',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop',
    isHost: true,
    items: [
      { name: 'Heineken 600ml', price: 24.90, quantity: 2 },
      { name: 'Gin Tônica', price: 32.00, quantity: 1 },
    ],
    individualTotal: 89.70,
  },
  {
    id: 'u2',
    name: 'Carlos Lima',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop',
    isHost: false,
    items: [
      { name: 'Corona Extra', price: 18.00, quantity: 2 },
      { name: 'Fish & Chips', price: 49.90, quantity: 1 },
    ],
    individualTotal: 85.90,
  },
  {
    id: 'u3',
    name: 'Ana Costa',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop',
    isHost: false,
    items: [
      { name: 'Mojito', price: 28.00, quantity: 1 },
      { name: 'Caipirinha', price: 26.00, quantity: 1 },
    ],
    individualTotal: 54.00,
  },
];

const tabTotal = 232.65;
const tabCredits = 30.00;
const balanceDue = tabTotal - tabCredits;

const splitModes = [
  {
    id: 'by_consumption',
    name: 'Por Consumo',
    description: 'Cada um paga o que pediu',
    icon: Receipt,
  },
  {
    id: 'equal',
    name: 'Dividir Igual',
    description: 'Valor dividido igualmente',
    icon: Percent,
  },
  {
    id: 'single_payer',
    name: 'Um Paga Tudo',
    description: 'Selecionar quem vai pagar',
    icon: User,
  },
];

export function TabSplitSheet() {
  const { goBack, navigate } = useMobilePreview();
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [selectedPayer, setSelectedPayer] = useState<string | null>(null);

  const getAmountPerPerson = (mode: string) => {
    if (mode === 'equal') {
      return balanceDue / members.length;
    }
    return 0;
  };

  const handleContinue = () => {
    navigate('tab-payment');
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-border">
        <button onClick={goBack} className="p-2 -ml-2 rounded-lg hover:bg-muted">
          <X className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-semibold text-foreground">Dividir Conta</h1>
          <p className="text-xs text-muted-foreground">
            Total: R$ {balanceDue.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <p className="text-sm text-muted-foreground mb-4">
          Como você deseja dividir a conta?
        </p>

        {/* Split Mode Selection */}
        <div className="space-y-3 mb-6">
          {splitModes.map((mode) => {
            const Icon = mode.icon;
            const isSelected = selectedMode === mode.id;

            return (
              <button
                key={mode.id}
                onClick={() => {
                  setSelectedMode(mode.id);
                  setSelectedPayer(null);
                }}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:border-primary/50'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{mode.name}</p>
                  <p className="text-sm text-muted-foreground">{mode.description}</p>
                </div>
                {isSelected && (
                  <div className="p-1 rounded-full bg-primary">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Mode-specific content */}
        {selectedMode === 'by_consumption' && (
          <div className="space-y-3 animate-fade-in">
            <h3 className="font-semibold text-foreground mb-3">Consumo por Pessoa</h3>
            {members.map((member) => (
              <div
                key={member.id}
                className="p-4 rounded-xl bg-card border border-border"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    {member.isHost && (
                      <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-primary">
                        <Crown className="w-2.5 h-2.5 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{member.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {member.items.length} itens
                    </p>
                  </div>
                  <span className="font-bold text-foreground">
                    R$ {member.individualTotal.toFixed(2)}
                  </span>
                </div>
                <div className="space-y-1 pl-13">
                  {member.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="text-muted-foreground">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedMode === 'equal' && (
          <div className="animate-fade-in">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Cada pessoa paga:
              </p>
              <p className="text-4xl font-bold text-foreground mb-2">
                R$ {getAmountPerPerson('equal').toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">
                {members.length} pessoas • Total: R$ {balanceDue.toFixed(2)}
              </p>
            </div>

            <div className="mt-4 space-y-2">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border"
                >
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="flex-1 font-medium text-foreground">{member.name}</span>
                  <span className="text-muted-foreground">
                    R$ {getAmountPerPerson('equal').toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedMode === 'single_payer' && (
          <div className="animate-fade-in">
            <h3 className="font-semibold text-foreground mb-3">Quem vai pagar?</h3>
            <div className="space-y-2">
              {members.map((member) => {
                const isSelected = selectedPayer === member.id;
                return (
                  <button
                    key={member.id}
                    onClick={() => setSelectedPayer(member.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-card hover:border-primary/50'
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      {member.isHost && (
                        <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-primary">
                          <Crown className="w-2.5 h-2.5 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <span className="flex-1 font-medium text-foreground text-left">
                      {member.name}
                    </span>
                    {isSelected && (
                      <div className="p-1 rounded-full bg-primary">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {selectedPayer && (
              <div className="mt-4 p-4 rounded-xl bg-muted/50 border border-border">
                <p className="text-sm text-muted-foreground text-center">
                  {members.find((m) => m.id === selectedPayer)?.name} pagará{' '}
                  <span className="font-bold text-foreground">
                    R$ {balanceDue.toFixed(2)}
                  </span>
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Action */}
      <div className="p-4 border-t border-border">
        <button
          onClick={handleContinue}
          disabled={!selectedMode || (selectedMode === 'single_payer' && !selectedPayer)}
          className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${
            selectedMode && (selectedMode !== 'single_payer' || selectedPayer)
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
        >
          <CreditCard className="w-5 h-5" />
          Continuar para Pagamento
        </button>
      </div>
    </div>
  );
}
