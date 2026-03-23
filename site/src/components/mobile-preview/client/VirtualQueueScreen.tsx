import React, { useState, useEffect } from 'react';
import { useMobilePreview } from '../context/MobilePreviewContext';
import { 
  ArrowLeft, Users, Clock, Bell, CheckCircle, 
  AlertCircle, ChevronRight, Ticket, MapPin, Baby,
  User, Plus, X, Phone, Heart, Shield, UserPlus,
  Send, Link2, Share2, Copy, Accessibility
} from 'lucide-react';

const tablePreferences = [
  { id: 'indoor', label: 'Interno', icon: '🏠' },
  { id: 'outdoor', label: 'Externo', icon: '🌳' },
  { id: 'terrace', label: 'Terraço', icon: '☀️' },
  { id: 'window', label: 'Janela', icon: '🪟' },
];

const priorityOptions = [
  { id: 'none', label: 'Sem prioridade', icon: User },
  { id: 'elderly', label: 'Idoso (60+)', icon: Heart },
  { id: 'pregnant', label: 'Gestante', icon: Baby },
  { id: 'nursing', label: 'Lactante', icon: Baby },
  { id: 'disability', label: 'PCD', icon: Accessibility },
];

interface Guest {
  id: string;
  name: string;
  phone: string;
  status: 'pending' | 'accepted';
}

export function VirtualQueueScreen() {
  const { goBack, navigate, params } = useMobilePreview();
  const [step, setStep] = useState<'form' | 'queue'>('form');
  const [position, setPosition] = useState(5);
  const [estimatedWait, setEstimatedWait] = useState(15);
  const [partySize, setPartySize] = useState(2);
  const [tablePreference, setTablePreference] = useState<string[]>([]);
  const [priority, setPriority] = useState('none');
  const [guests, setGuests] = useState<Guest[]>([]);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [newGuest, setNewGuest] = useState({ name: '', phone: '' });
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Simulate queue movement
  useEffect(() => {
    if (step === 'queue' && position > 1) {
      const timer = setInterval(() => {
        setPosition(p => Math.max(1, p - 1));
        setEstimatedWait(w => Math.max(3, w - 3));
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [step, position]);

  const handleJoinQueue = () => {
    if (tablePreference.length > 0) {
      setStep('queue');
    }
  };

  const handleLeaveQueue = () => {
    setStep('form');
    setPosition(5);
    setEstimatedWait(15);
  };

  const handleReady = () => {
    navigate('qr-scanner');
  };

  const addGuest = () => {
    if (newGuest.name) {
      setGuests([...guests, {
        id: `guest-${Date.now()}`,
        name: newGuest.name,
        phone: newGuest.phone,
        status: 'pending'
      }]);
      setNewGuest({ name: '', phone: '' });
      setShowGuestForm(false);
    }
  };

  const removeGuest = (id: string) => {
    setGuests(guests.filter(g => g.id !== id));
  };

  const restaurant = params.restaurant;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-border">
        <button onClick={goBack} className="p-2 -ml-2 rounded-lg hover:bg-accent">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-semibold text-foreground">Fila Virtual</h1>
          <p className="text-xs text-muted-foreground">{restaurant?.name || 'Restaurante'}</p>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {step === 'form' ? (
          /* Join Queue Form */
          <div className="space-y-6">
            {/* Queue Status */}
            <div className="bg-card rounded-xl p-4 border border-border">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">Status da fila</span>
                <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-600 text-xs font-medium">
                  Aberta
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-accent">
                  <Users className="w-5 h-5 mx-auto mb-1 text-primary" />
                  <p className="text-2xl font-bold text-foreground">8</p>
                  <p className="text-xs text-muted-foreground">pessoas na fila</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-accent">
                  <Clock className="w-5 h-5 mx-auto mb-1 text-primary" />
                  <p className="text-2xl font-bold text-foreground">~20</p>
                  <p className="text-xs text-muted-foreground">min de espera</p>
                </div>
              </div>
            </div>

            {/* Party Size */}
            <div className="bg-card rounded-xl p-4 border border-border">
              <label className="block text-sm font-medium text-foreground mb-3">
                Quantas pessoas?
              </label>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setPartySize(Math.max(1, partySize - 1))}
                  className="w-12 h-12 rounded-full bg-accent text-xl font-bold"
                >
                  -
                </button>
                <span className="text-4xl font-bold text-foreground w-16 text-center">
                  {partySize}
                </span>
                <button
                  onClick={() => setPartySize(Math.min(20, partySize + 1))}
                  className="w-12 h-12 rounded-full bg-accent text-xl font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Table Preference */}
            <div className="bg-card rounded-xl p-4 border border-border">
              <label className="block text-sm font-medium text-foreground mb-3">
                <MapPin className="w-4 h-4 inline mr-2" />
                Preferência de Mesa
              </label>
              <div className="grid grid-cols-2 gap-2">
                {tablePreferences.map((pref) => {
                  const isSelected = tablePreference.includes(pref.id);
                  return (
                    <button
                      key={pref.id}
                      onClick={() => {
                        if (isSelected) {
                          setTablePreference(tablePreference.filter(p => p !== pref.id));
                        } else {
                          setTablePreference([...tablePreference, pref.id]);
                        }
                      }}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        isSelected 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border'
                      }`}
                    >
                      <span className="text-xl">{pref.icon}</span>
                      <p className="text-xs mt-1 font-medium">{pref.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Priority Selection */}
            <div className="bg-card rounded-xl p-4 border border-border">
              <label className="block text-sm font-medium text-foreground mb-3">
                <Shield className="w-4 h-4 inline mr-2" />
                Atendimento Prioritário
              </label>
              <div className="space-y-2">
                {priorityOptions.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setPriority(opt.id)}
                      className={`w-full p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${
                        priority === opt.id 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${priority === opt.id ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className="text-sm font-medium">{opt.label}</span>
                      {priority === opt.id && (
                        <CheckCircle className="w-4 h-4 text-primary ml-auto" />
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Sujeito às políticas do estabelecimento
              </p>
            </div>

            {/* Guest Invitations */}
            <div className="bg-card rounded-xl p-4 border border-border">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Convidar Acompanhantes
                </label>
                <button 
                  onClick={() => setShowGuestForm(true)}
                  className="text-sm text-primary flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {guests.length === 0 && !showGuestForm && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  Convide pessoas para se juntarem quando for chamado
                </p>
              )}

              {/* Guest List */}
              <div className="space-y-2">
                {guests.map((guest) => (
                  <div key={guest.id} className="flex items-center gap-3 p-2 rounded-lg bg-accent">
                    <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{guest.name}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600">
                      Pendente
                    </span>
                    <button onClick={() => removeGuest(guest.id)}>
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Guest Form */}
              {showGuestForm && (
                <div className="mt-3 space-y-2 animate-fade-in">
                  <input
                    type="text"
                    value={newGuest.name}
                    onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                    placeholder="Nome"
                    className="w-full px-3 py-2 rounded-lg bg-accent border border-border text-sm"
                  />
                  <input
                    type="tel"
                    value={newGuest.phone}
                    onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
                    placeholder="Telefone"
                    className="w-full px-3 py-2 rounded-lg bg-accent border border-border text-sm"
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setShowGuestForm(false)}
                      className="flex-1 py-2 rounded-lg bg-accent text-sm"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={addGuest}
                      disabled={!newGuest.name}
                      className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm disabled:opacity-50"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="bg-card rounded-xl p-4 border border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground text-sm">Notificações</p>
                    <p className="text-xs text-muted-foreground">Alerta quando sua vez chegar</p>
                  </div>
                </div>
                <button 
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className={`w-12 h-6 rounded-full relative transition-colors ${
                    notificationsEnabled ? 'bg-primary' : 'bg-accent'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    notificationsEnabled ? 'right-1' : 'left-1'
                  }`} />
                </button>
              </div>
            </div>

            {/* Policies */}
            <div className="bg-accent/50 rounded-xl p-4">
              <p className="font-medium text-sm text-foreground mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-primary" />
                Políticas do Estabelecimento
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Você não precisa estar presente para entrar na fila</li>
                <li>• Tolerância de chegada: <strong>10 minutos</strong> após chamada</li>
                <li>• Após o tempo, a posição será perdida</li>
                <li>• Prioridades sujeitas a comprovação</li>
              </ul>
            </div>
          </div>
        ) : (
          /* In Queue View */
          <div className="space-y-6">
            {/* Position Card */}
            <div className={`rounded-xl p-6 text-center ${position === 1 ? 'bg-green-500' : 'bg-primary'} text-primary-foreground`}>
              {position === 1 ? (
                <>
                  <CheckCircle className="w-16 h-16 mx-auto mb-3" />
                  <h2 className="text-2xl font-bold mb-1">É sua vez!</h2>
                  <p className="text-sm opacity-80">Dirija-se ao estabelecimento</p>
                  <p className="text-xs opacity-60 mt-2">Você tem 10 minutos para iniciar o atendimento</p>
                </>
              ) : (
                <>
                  <Ticket className="w-12 h-12 mx-auto mb-3 opacity-80" />
                  <p className="text-sm opacity-80 mb-1">Sua posição</p>
                  <p className="text-6xl font-bold mb-2">{position}º</p>
                  <p className="text-sm opacity-80">na fila</p>
                  {priority !== 'none' && (
                    <span className="inline-block mt-2 px-3 py-1 rounded-full bg-white/20 text-xs">
                      🌟 Prioridade ativa
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Wait Time */}
            {position > 1 && (
              <div className="bg-card rounded-xl p-4 border border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-primary" />
                    <span className="text-muted-foreground">Tempo estimado</span>
                  </div>
                  <span className="text-xl font-bold text-foreground">~{estimatedWait} min</span>
                </div>
              </div>
            )}

            {/* Party Info */}
            <div className="bg-card rounded-xl p-4 border border-border space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="text-muted-foreground">Pessoas</span>
                </div>
                <span className="font-medium text-foreground">{partySize}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span className="text-muted-foreground">Preferência</span>
                </div>
                <span className="font-medium text-foreground text-sm">
                  {tablePreference.map(p => tablePreferences.find(tp => tp.id === p)?.label).join(', ')}
                </span>
              </div>
            </div>

            {/* Guests in Queue */}
            {guests.length > 0 && (
              <div className="bg-card rounded-xl p-4 border border-border">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-medium text-sm">Acompanhantes</p>
                  <button className="text-xs text-primary">+ Adicionar</button>
                </div>
                <div className="space-y-2">
                  {guests.map((guest) => (
                    <div key={guest.id} className="flex items-center gap-2 p-2 rounded-lg bg-accent">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm flex-1">{guest.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600">
                        Pendente
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Todos receberão notificação quando for chamado
                </p>
              </div>
            )}

            {/* Queue Progress */}
            <div className="bg-card rounded-xl p-4 border border-border">
              <p className="text-sm font-medium text-foreground mb-3">Progresso da fila</p>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((p) => (
                  <div
                    key={p}
                    className={`flex-1 h-2 rounded-full ${
                      p > position ? 'bg-primary' : 'bg-accent'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {position > 1 ? `${position - 1} pessoa${position - 1 > 1 ? 's' : ''} à sua frente` : 'Você é o próximo!'}
              </p>
            </div>

            {/* Tips while waiting */}
            {position > 2 && (
              <div className="bg-accent/50 rounded-xl p-4">
                <p className="text-sm font-medium text-foreground mb-2">Enquanto espera...</p>
                <button 
                  onClick={() => navigate('restaurant', { restaurant: params.restaurant })}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-card"
                >
                  <span className="text-sm text-foreground">Veja o cardápio</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Action */}
      <div className="p-4 border-t border-border">
        {step === 'form' ? (
          <button
            onClick={handleJoinQueue}
            disabled={tablePreference.length === 0}
            className={`w-full py-3 rounded-xl font-semibold ${
              tablePreference.length > 0 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground'
            }`}
          >
            Entrar na Fila
          </button>
        ) : position === 1 ? (
          <button
            onClick={handleReady}
            className="w-full py-3 rounded-xl bg-green-500 text-white font-semibold"
          >
            Iniciar Atendimento
          </button>
        ) : (
          <button
            onClick={handleLeaveQueue}
            className="w-full py-3 rounded-xl bg-destructive text-destructive-foreground font-semibold"
          >
            Sair da Fila
          </button>
        )}
      </div>
    </div>
  );
}