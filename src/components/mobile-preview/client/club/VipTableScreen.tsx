import React, { useState } from 'react';
import { useMobilePreview } from '../../context/MobilePreviewContext';
import {
  ArrowLeft,
  Crown,
  Users,
  Wine,
  Check,
  ChevronRight,
  MapPin,
  Star,
  CreditCard,
  Gift,
  Calendar,
  Clock,
  UserPlus,
  Sparkles,
} from 'lucide-react';

// VIP Table types
const tableTypes = [
  {
    id: 'mesa_pista',
    name: 'Mesa Pista',
    description: 'Próximo à pista de dança',
    capacityMin: 4,
    capacityMax: 6,
    minimumSpend: 1500,
    deposit: 500,
    depositCreditPercentage: 100,
    amenities: ['Vista para pista', 'Atendimento dedicado'],
    image: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=400&h=200&fit=crop',
    available: 3,
  },
  {
    id: 'camarote',
    name: 'Camarote',
    description: 'Área elevada com vista panorâmica',
    capacityMin: 8,
    capacityMax: 12,
    minimumSpend: 3000,
    deposit: 1000,
    depositCreditPercentage: 100,
    amenities: ['Vista panorâmica', 'Sofás VIP', 'Atendimento exclusivo', 'Champagne cortesia'],
    image: 'https://images.unsplash.com/photo-1545128485-c400e7702796?w=400&h=200&fit=crop',
    available: 2,
  },
  {
    id: 'stage',
    name: 'Stage Box',
    description: 'Ao lado do palco principal',
    capacityMin: 6,
    capacityMax: 10,
    minimumSpend: 5000,
    deposit: 2000,
    depositCreditPercentage: 100,
    amenities: ['Ao lado do DJ', 'Meet & Greet', 'Premium bottle service', 'Segurança exclusiva'],
    image: 'https://images.unsplash.com/photo-1571204829887-3b8d69e4094d?w=400&h=200&fit=crop',
    available: 1,
  },
];

export function VipTableScreen() {
  const { goBack, navigate } = useMobilePreview();
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [partySize, setPartySize] = useState(6);
  const [step, setStep] = useState<'select' | 'details' | 'payment'>('select');

  const table = tableTypes.find((t) => t.id === selectedTable);

  const handleSelectTable = (tableId: string) => {
    setSelectedTable(tableId);
    const selectedTableData = tableTypes.find((t) => t.id === tableId);
    if (selectedTableData) {
      setPartySize(selectedTableData.capacityMin);
    }
    setStep('details');
  };

  const handleConfirmReservation = () => {
    navigate('vip-table-confirmation');
  };

  if (step === 'details' && table) {
    return (
      <div className="flex flex-col h-full bg-background">
        {/* Header Image */}
        <div className="relative h-48">
          <img
            src={table.image}
            alt={table.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/20 to-background" />
          <button
            onClick={() => setStep('select')}
            className="absolute top-4 left-4 p-2 rounded-full bg-background/80 backdrop-blur-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Table Details */}
        <div className="flex-1 overflow-auto p-4 pb-48 -mt-8">
          <div className="p-4 rounded-2xl bg-card border border-border mb-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h1 className="text-xl font-bold text-foreground">{table.name}</h1>
                <p className="text-sm text-muted-foreground">{table.description}</p>
              </div>
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Crown className="w-5 h-5 text-amber-500" />
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{table.capacityMin}-{table.capacityMax} pessoas</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Wine className="w-4 h-4" />
                <span>Mínimo R$ {table.minimumSpend.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Party Size */}
          <div className="p-4 rounded-2xl bg-card border border-border mb-4">
            <h3 className="font-semibold text-foreground mb-3">Tamanho do Grupo</h3>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setPartySize(Math.max(table.capacityMin, partySize - 1))}
                className="p-3 rounded-xl bg-muted hover:bg-muted/80"
              >
                <span className="text-xl font-bold">-</span>
              </button>
              <div className="text-center">
                <span className="text-4xl font-bold text-foreground">{partySize}</span>
                <p className="text-xs text-muted-foreground">pessoas</p>
              </div>
              <button
                onClick={() => setPartySize(Math.min(table.capacityMax, partySize + 1))}
                className="p-3 rounded-xl bg-primary text-primary-foreground"
              >
                <span className="text-xl font-bold">+</span>
              </button>
            </div>
          </div>

          {/* Amenities */}
          <div className="p-4 rounded-2xl bg-card border border-border mb-4">
            <h3 className="font-semibold text-foreground mb-3">Incluso</h3>
            <div className="space-y-2">
              {table.amenities.map((amenity, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="p-1 rounded-full bg-success/20">
                    <Check className="w-3 h-3 text-success" />
                  </div>
                  <span className="text-sm text-foreground">{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Deposit Info */}
          <div className="p-4 rounded-2xl bg-success/10 border border-success/30">
            <div className="flex items-start gap-3">
              <Gift className="w-5 h-5 text-success flex-shrink-0" />
              <div>
                <p className="font-semibold text-foreground">Depósito vira crédito!</p>
                <p className="text-sm text-muted-foreground">
                  R$ {table.deposit.toLocaleString()} de depósito = {table.depositCreditPercentage}% em consumação
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background to-transparent pt-8">
          <div className="p-4 bg-card border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-muted-foreground">Depósito</p>
                <p className="text-2xl font-bold text-foreground">
                  R$ {table.deposit.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Consumação mínima</p>
                <p className="font-semibold text-foreground">
                  R$ {table.minimumSpend.toLocaleString()}
                </p>
              </div>
            </div>
            <button
              onClick={handleConfirmReservation}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2"
            >
              <Crown className="w-5 h-5" />
              Reservar Agora
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-border">
        <button onClick={goBack} className="p-2 -ml-2 rounded-lg hover:bg-muted">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-semibold text-foreground">Reservar Mesa VIP</h1>
          <p className="text-xs text-muted-foreground">Club Okinawa • Sexta, 31 Jan</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <p className="text-sm text-muted-foreground mb-4">
          Escolha seu espaço exclusivo
        </p>

        <div className="space-y-4">
          {tableTypes.map((tableType) => (
            <button
              key={tableType.id}
              onClick={() => handleSelectTable(tableType.id)}
              className="w-full rounded-2xl bg-card border border-border overflow-hidden hover:border-primary/50 transition-colors"
            >
              <div className="relative h-32">
                <img
                  src={tableType.image}
                  alt={tableType.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <p className="font-bold text-foreground">{tableType.name}</p>
                  <p className="text-xs text-muted-foreground">{tableType.description}</p>
                </div>
                {tableType.available <= 2 && (
                  <span className="absolute top-3 right-3 px-2 py-1 rounded-full bg-warning/90 text-warning-foreground text-xs font-semibold">
                    {tableType.available} disponíveis
                  </span>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {tableType.capacityMin}-{tableType.capacityMax}
                    </span>
                    <span className="flex items-center gap-1">
                      <Wine className="w-4 h-4" />
                      R$ {tableType.minimumSpend.toLocaleString()} min
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex flex-wrap gap-1">
                  {tableType.amenities.slice(0, 3).map((amenity, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground"
                    >
                      {amenity}
                    </span>
                  ))}
                  {tableType.amenities.length > 3 && (
                    <span className="px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground">
                      +{tableType.amenities.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
