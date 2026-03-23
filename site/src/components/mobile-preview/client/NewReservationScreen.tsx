import React, { useState } from 'react';
import { useMobilePreview, SERVICE_TYPE_CONFIG } from '../context/MobilePreviewContext';
import { 
  ArrowLeft, Calendar, Clock, Users, ChevronRight, 
  Plus, X, MessageSquare, User, Phone, Mail, Wine, Check,
  MapPin, Baby, Accessibility, Heart, AlertTriangle, 
  Share2, Copy, Link2, Send, Bell, UserPlus, Shield
} from 'lucide-react';

const timeSlots = [
  '12:00', '12:30', '13:00', '13:30', '14:00', 
  '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'
];

const tablePreferences = [
  { id: 'indoor', label: 'Interno', icon: '🏠' },
  { id: 'outdoor', label: 'Externo', icon: '🌳' },
  { id: 'terrace', label: 'Terraço', icon: '☀️' },
  { id: 'window', label: 'Janela', icon: '🪟' },
  { id: 'private', label: 'Privativo', icon: '🚪' },
  { id: 'bar', label: 'Bar', icon: '🍸' },
];

const occasions = [
  { id: 'none', label: 'Nenhuma' },
  { id: 'birthday', label: '🎂 Aniversário' },
  { id: 'anniversary', label: '💑 Aniversário de Casamento' },
  { id: 'business', label: '💼 Negócios' },
  { id: 'date', label: '💕 Encontro Romântico' },
  { id: 'celebration', label: '🎉 Celebração' },
];

type GuestStatus = 'pending' | 'accepted' | 'declined' | 'pending_approval';

interface Guest {
  id: string;
  name: string;
  phone: string;
  email: string;
  hasApp: boolean;
  status: GuestStatus;
  invitedBy: 'main' | string;
}

export function NewReservationScreen() {
  const { goBack, navigate, params, serviceConfig } = useMobilePreview();
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [partySize, setPartySize] = useState(2);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [newGuest, setNewGuest] = useState({ name: '', phone: '', email: '' });
  const [specialRequests, setSpecialRequests] = useState('');
  const [allergies, setAllergies] = useState('');
  const [occasion, setOccasion] = useState('none');
  const [tablePreference, setTablePreference] = useState<string[]>([]);
  const [wantsSommelier, setWantsSommelier] = useState(false);
  const [paymentMode, setPaymentMode] = useState<'individual' | 'shared'>('shared');
  const [showInviteOptions, setShowInviteOptions] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [showPendingApprovals, setShowPendingApprovals] = useState(false);

  const restaurant = params.restaurant;
  const config = restaurant ? SERVICE_TYPE_CONFIG[restaurant.type as keyof typeof SERVICE_TYPE_CONFIG] : serviceConfig;

  // Generate dates for next 14 days
  const dates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  const formatDate = (date: Date) => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return {
      day: date.getDate(),
      weekday: days[date.getDay()],
      month: date.toLocaleDateString('pt-BR', { month: 'short' }),
    };
  };

  const addGuest = (method: 'sms' | 'notification' | 'link') => {
    if (newGuest.name) {
      const hasApp = method === 'notification';
      const newGuestObj: Guest = {
        id: `guest-${Date.now()}`,
        name: newGuest.name,
        phone: newGuest.phone,
        email: newGuest.email,
        hasApp,
        status: 'pending',
        invitedBy: 'main',
      };
      setGuests([...guests, newGuestObj]);
      setNewGuest({ name: '', phone: '', email: '' });
      setShowGuestForm(false);
      setShowInviteOptions(false);
    }
  };

  const generateInviteLink = () => {
    const link = `okinawa.app/invite/${Date.now().toString(36)}`;
    setInviteLink(link);
  };

  const removeGuest = (id: string) => {
    setGuests(guests.filter(g => g.id !== id));
  };

  const approveGuest = (id: string) => {
    setGuests(guests.map(g => 
      g.id === id ? { ...g, status: 'accepted' as GuestStatus } : g
    ));
  };

  const handleConfirm = () => {
    navigate('reservation-confirmed', {
      reservation: {
        restaurant,
        date: selectedDate,
        time: selectedTime,
        partySize,
        guests,
        specialRequests,
        allergies,
        occasion,
        tablePreference,
        wantsSommelier,
        paymentMode,
      }
    });
  };

  const canProceed = () => {
    switch (step) {
      case 1: return selectedDate && selectedTime;
      case 2: return partySize >= 1 && tablePreference.length > 0;
      case 3: return true;
      case 4: return true;
      default: return false;
    }
  };

  const pendingApprovals = guests.filter(g => g.status === 'pending_approval');
  const guestsTooMany = guests.length >= partySize;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-border">
        <button onClick={step > 1 ? () => setStep(step - 1) : goBack} className="p-2 -ml-2 rounded-lg hover:bg-accent">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-semibold text-foreground">Nova Reserva</h1>
          <p className="text-xs text-muted-foreground">{restaurant?.name || 'Restaurante'}</p>
        </div>
        <span className="text-sm text-muted-foreground">Passo {step}/4</span>
      </div>

      {/* Progress */}
      <div className="flex gap-1 px-4 py-2">
        {[1, 2, 3, 4].map((s) => (
          <div 
            key={s} 
            className={`flex-1 h-1 rounded-full ${s <= step ? 'bg-primary' : 'bg-accent'}`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            {/* Date Selection */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-foreground">Escolha a Data</h2>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                {dates.map((date, i) => {
                  const formatted = formatDate(date);
                  const isSelected = selectedDate?.toDateString() === date.toDateString();
                  
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedDate(date)}
                      className={`flex-shrink-0 w-16 py-3 rounded-xl border-2 transition-all ${
                        isSelected 
                          ? 'border-primary bg-primary text-primary-foreground' 
                          : 'border-border bg-card'
                      }`}
                    >
                      <p className={`text-xs ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                        {formatted.weekday}
                      </p>
                      <p className="text-xl font-bold">{formatted.day}</p>
                      <p className={`text-xs ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                        {formatted.month}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div className="animate-fade-in">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <h2 className="font-semibold text-foreground">Escolha o Horário</h2>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((time) => {
                    const isSelected = selectedTime === time;
                    const isAvailable = Math.random() > 0.2;
                    
                    return (
                      <button
                        key={time}
                        onClick={() => isAvailable && setSelectedTime(time)}
                        disabled={!isAvailable}
                        className={`py-3 rounded-xl text-sm font-medium transition-all ${
                          isSelected 
                            ? 'bg-primary text-primary-foreground' 
                            : isAvailable
                              ? 'bg-card border border-border hover:border-primary'
                              : 'bg-accent text-muted-foreground line-through'
                        }`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            {/* Party Size */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-foreground">Quantas Pessoas?</h2>
              </div>
              <div className="flex items-center justify-center gap-6 py-4">
                <button
                  onClick={() => setPartySize(Math.max(1, partySize - 1))}
                  className="w-14 h-14 rounded-full bg-accent text-2xl font-bold"
                >
                  -
                </button>
                <span className="text-5xl font-bold text-foreground w-20 text-center">
                  {partySize}
                </span>
                <button
                  onClick={() => setPartySize(Math.min(20, partySize + 1))}
                  className="w-14 h-14 rounded-full bg-accent text-2xl font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Table Preference */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-foreground">Preferência de Mesa</h2>
              </div>
              <div className="grid grid-cols-3 gap-2">
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
                          : 'border-border bg-card'
                      }`}
                    >
                      <span className="text-2xl">{pref.icon}</span>
                      <p className="text-xs mt-1 font-medium">{pref.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Payment Mode */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-foreground">Tipo de Comanda</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMode('individual')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    paymentMode === 'individual' 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border bg-card'
                  }`}
                >
                  <p className="font-semibold text-sm">Individual</p>
                  <p className="text-xs text-muted-foreground mt-1">Cada um paga o seu</p>
                </button>
                <button
                  onClick={() => setPaymentMode('shared')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    paymentMode === 'shared' 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border bg-card'
                  }`}
                >
                  <p className="font-semibold text-sm">Conjunta</p>
                  <p className="text-xs text-muted-foreground mt-1">Dividir entre todos</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            {/* Guest Invitations */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-primary" />
                  <h2 className="font-semibold text-foreground">Convidar Acompanhantes</h2>
                </div>
                <button 
                  onClick={() => setShowGuestForm(true)}
                  className="text-sm text-primary flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Adicionar
                </button>
              </div>

              {/* Warning if too many guests */}
              {guestsTooMany && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 mb-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-600">Número de convidados excede a reserva</p>
                    <p className="text-amber-600/80 text-xs">Será necessário alterar a quantidade da reserva</p>
                  </div>
                </div>
              )}

              {/* Pending Approvals */}
              {pendingApprovals.length > 0 && (
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/30 mb-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-primary">
                      {pendingApprovals.length} convite(s) aguardando aprovação
                    </p>
                    <button 
                      onClick={() => setShowPendingApprovals(!showPendingApprovals)}
                      className="text-xs text-primary"
                    >
                      {showPendingApprovals ? 'Ocultar' : 'Ver'}
                    </button>
                  </div>
                  {showPendingApprovals && (
                    <div className="mt-2 space-y-2">
                      {pendingApprovals.map((guest) => (
                        <div key={guest.id} className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                          <span className="text-sm">{guest.name}</span>
                          <div className="flex gap-1">
                            <button 
                              onClick={() => approveGuest(guest.id)}
                              className="p-1.5 rounded-lg bg-green-500 text-white"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button 
                              onClick={() => removeGuest(guest.id)}
                              className="p-1.5 rounded-lg bg-red-500 text-white"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {guests.length === 0 && !showGuestForm && (
                <p className="text-sm text-muted-foreground p-4 rounded-xl bg-accent/50 text-center">
                  Você é o cliente principal. Convide pessoas para compartilhar a experiência!
                </p>
              )}

              {/* Guest List */}
              <div className="space-y-2">
                {guests.map((guest) => (
                  <div key={guest.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                      <User className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{guest.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {guest.hasApp ? 'Via App' : 'Via SMS/Link'}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      guest.status === 'accepted' 
                        ? 'bg-green-500/20 text-green-600'
                        : guest.status === 'declined'
                          ? 'bg-red-500/20 text-red-600'
                          : 'bg-amber-500/20 text-amber-600'
                    }`}>
                      {guest.status === 'accepted' ? 'Aceito' : 
                       guest.status === 'declined' ? 'Recusado' : 'Pendente'}
                    </span>
                    <button onClick={() => removeGuest(guest.id)} className="p-1">
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Guest Form */}
              {showGuestForm && !showInviteOptions && (
                <div className="mt-3 p-4 rounded-xl bg-card border border-border space-y-3 animate-fade-in">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={newGuest.name}
                      onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                      placeholder="Nome do convidado"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-accent border border-border text-foreground"
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="tel"
                      value={newGuest.phone}
                      onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
                      placeholder="Telefone"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-accent border border-border text-foreground"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setShowGuestForm(false);
                        setNewGuest({ name: '', phone: '', email: '' });
                      }}
                      className="flex-1 py-2 rounded-lg bg-accent text-foreground"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={() => newGuest.name && setShowInviteOptions(true)}
                      disabled={!newGuest.name}
                      className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50"
                    >
                      Próximo
                    </button>
                  </div>
                </div>
              )}

              {/* Invite Options */}
              {showInviteOptions && (
                <div className="mt-3 p-4 rounded-xl bg-card border border-border space-y-3 animate-fade-in">
                  <p className="font-medium text-sm text-center mb-4">
                    Como enviar convite para {newGuest.name}?
                  </p>
                  
                  <button
                    onClick={() => addGuest('notification')}
                    className="w-full p-3 rounded-xl bg-primary/10 border border-primary/30 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Bell className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-medium text-sm">Notificação no App</p>
                      <p className="text-xs text-muted-foreground">Se a pessoa já tem o app Okinawa</p>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => addGuest('sms')}
                    className="w-full p-3 rounded-xl bg-card border border-border flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                      <Send className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-medium text-sm">SMS Automático</p>
                      <p className="text-xs text-muted-foreground">Enviar convite via mensagem</p>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => {
                      generateInviteLink();
                      addGuest('link');
                    }}
                    className="w-full p-3 rounded-xl bg-card border border-border flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                      <Link2 className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-medium text-sm">Gerar Link</p>
                      <p className="text-xs text-muted-foreground">Compartilhe o link manualmente</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => setShowInviteOptions(false)}
                    className="w-full py-2 text-sm text-muted-foreground"
                  >
                    Voltar
                  </button>
                </div>
              )}

              {/* Generated Link */}
              {inviteLink && (
                <div className="mt-3 p-3 rounded-xl bg-secondary/10 border border-secondary/30 animate-fade-in">
                  <p className="text-xs text-muted-foreground mb-2">Link gerado:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs p-2 rounded bg-background truncate">{inviteLink}</code>
                    <button className="p-2 rounded-lg bg-secondary text-secondary-foreground">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg bg-secondary text-secondary-foreground">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground text-center mt-4">
                Você pode adicionar convidados até o final do atendimento
              </p>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
            {/* Allergies & Preferences */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-foreground">Alergias & Restrições</h2>
              </div>
              <textarea
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="Ex: Alergia a frutos do mar, intolerância a lactose..."
                className="w-full p-4 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground min-h-[80px] resize-none"
              />
            </div>

            {/* Occasion */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Heart className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-foreground">Ocasião Especial</h2>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {occasions.map((occ) => (
                  <button
                    key={occ.id}
                    onClick={() => setOccasion(occ.id)}
                    className={`p-3 rounded-xl border-2 text-sm transition-all ${
                      occasion === occ.id 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border bg-card'
                    }`}
                  >
                    {occ.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Special Requests */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-foreground">Pedidos Especiais</h2>
              </div>
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="Ex: Cadeirinha de bebê, acessibilidade..."
                className="w-full p-4 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground min-h-[80px] resize-none"
              />
            </div>

            {/* Sommelier Option */}
            {config?.hasSommelier && (
              <button
                onClick={() => setWantsSommelier(!wantsSommelier)}
                className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${
                  wantsSommelier ? 'border-primary bg-primary/10' : 'border-border bg-card'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  wantsSommelier ? 'bg-primary' : 'bg-accent'
                }`}>
                  <Wine className={`w-6 h-6 ${wantsSommelier ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-foreground">Sommelier</p>
                  <p className="text-sm text-muted-foreground">Solicitar atendimento de sommelier</p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  wantsSommelier ? 'border-primary bg-primary' : 'border-muted-foreground'
                }`}>
                  {wantsSommelier && <Check className="w-4 h-4 text-primary-foreground" />}
                </div>
              </button>
            )}

            {/* Summary */}
            <div className="p-4 rounded-xl bg-accent/50 space-y-2">
              <h3 className="font-semibold text-foreground mb-3">Resumo da Reserva</h3>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Data</span>
                <span className="text-foreground font-medium">
                  {selectedDate?.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Horário</span>
                <span className="text-foreground font-medium">{selectedTime}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pessoas</span>
                <span className="text-foreground font-medium">{partySize}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Preferência</span>
                <span className="text-foreground font-medium">
                  {tablePreference.map(p => tablePreferences.find(tp => tp.id === p)?.label).join(', ')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Comanda</span>
                <span className="text-foreground font-medium">
                  {paymentMode === 'individual' ? 'Individual' : 'Conjunta'}
                </span>
              </div>
              {guests.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Convidados</span>
                  <span className="text-foreground font-medium">{guests.length}</span>
                </div>
              )}
            </div>

            {/* Policy Info */}
            <div className="p-3 rounded-xl bg-muted/50 text-xs text-muted-foreground">
              <p className="font-medium mb-1">Políticas do Restaurante:</p>
              <ul className="space-y-0.5">
                <li>• 15 min antes: lembrete enviado a todos</li>
                <li>• Tolerância de atraso: 15 minutos</li>
                <li>• Cancelamento gratuito até 2h antes</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action */}
      <div className="p-4 border-t border-border">
        <button
          onClick={() => step < 4 ? setStep(step + 1) : handleConfirm()}
          disabled={!canProceed()}
          className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 ${
            canProceed() 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
        >
          {step < 4 ? (
            <>
              Continuar
              <ChevronRight className="w-5 h-5" />
            </>
          ) : (
            'Confirmar Reserva'
          )}
        </button>
      </div>
    </div>
  );
}