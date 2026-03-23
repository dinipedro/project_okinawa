import { FC, useState } from 'react';
import { ArrowLeft, Calendar, Clock, Users, MapPin, UserPlus, Plus, X, AlertTriangle, Shield, ChevronRight } from 'lucide-react';
import indoorIcon from '@/assets/icons/indoor.png';
import outdoorIcon from '@/assets/icons/outdoor.png';
import windowIcon from '@/assets/icons/window.png';
import privateRoomIcon from '@/assets/icons/private-room.png';
import wineIcon from '@/assets/icons/wine.png';
import diningIcon from '@/assets/icons/dining.png';

interface NewReservationScreenV2Props {
  onNavigate: (screen: string) => void;
  onBack?: () => void;
}

const timeSlots = ['12:00', '12:30', '13:00', '13:30', '14:00', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'];

const tablePreferences: { id: string; label: string; icon: string }[] = [
  { id: 'indoor', label: 'Interno', icon: indoorIcon },
  { id: 'outdoor', label: 'Externo', icon: outdoorIcon },
  { id: 'terrace', label: 'Terraço', icon: diningIcon },
  { id: 'window', label: 'Janela', icon: windowIcon },
  { id: 'private', label: 'Privativo', icon: privateRoomIcon },
  { id: 'bar', label: 'Bar', icon: wineIcon },
];

interface Guest {
  id: string;
  name: string;
  status: 'pending' | 'accepted' | 'declined';
  hasApp: boolean;
}

const NewReservationScreenV2: FC<NewReservationScreenV2Props> = ({ onNavigate, onBack }) => {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [partySize, setPartySize] = useState(2);
  const [preferences, setPreferences] = useState<string[]>([]);
  const [paymentMode, setPaymentMode] = useState<'individual' | 'shared'>('shared');
  const [guests, setGuests] = useState<Guest[]>([]);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [newGuestName, setNewGuestName] = useState('');

  const dates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      day: date.getDate(),
      weekday: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][date.getDay()],
      month: date.toLocaleDateString('pt-BR', { month: 'short' }),
    };
  });

  const togglePreference = (id: string) => {
    setPreferences(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const addGuest = () => {
    if (newGuestName) {
      setGuests([...guests, {
        id: `guest-${Date.now()}`,
        name: newGuestName,
        status: 'pending',
        hasApp: Math.random() > 0.5
      }]);
      setNewGuestName('');
      setShowGuestForm(false);
    }
  };

  const removeGuest = (id: string) => {
    setGuests(guests.filter(g => g.id !== id));
  };

  const canProceed = () => {
    if (step === 1) return selectedDate !== null && selectedTime !== null;
    if (step === 2) return preferences.length > 0;
    return true;
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-card px-5 py-4 border-b border-border">
        <div className="flex items-center gap-4">
          <button 
            onClick={step > 1 ? () => setStep(step - 1) : onBack} 
            className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">Nova Reserva</h1>
            <p className="text-xs text-muted-foreground">Kotaro Sushi</p>
          </div>
          <span className="text-sm text-muted-foreground">Passo {step}/3</span>
        </div>
        
        {/* Progress */}
        <div className="flex gap-1 mt-4">
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={`flex-1 h-1 rounded-full transition-all duration-300 ${s <= step ? 'bg-gradient-to-r from-orange-600 to-amber-500' : 'bg-muted'}`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {step === 1 && (
          <div className="space-y-6">
            {/* Date Selection */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-orange-600" />
                </div>
                <h2 className="font-semibold text-foreground">Escolha a Data</h2>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                {dates.map((date, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(i)}
                    className={`flex-shrink-0 w-16 py-3 rounded-2xl border-2 transition-all duration-300 ${
                      selectedDate === i 
                        ? 'bg-gradient-to-br from-orange-600 to-amber-500 border-transparent text-white shadow-lg shadow-orange-600/25' 
                        : 'bg-card border-border hover:border-orange-300'
                    }`}
                  >
                    <p className={`text-xs ${selectedDate === i ? 'text-white/80' : 'text-muted-foreground'}`}>{date.weekday}</p>
                    <p className={`text-xl font-bold ${selectedDate === i ? 'text-white' : 'text-foreground'}`}>{date.day}</p>
                    <p className={`text-xs ${selectedDate === i ? 'text-white/80' : 'text-muted-foreground'}`}>{date.month}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Selection */}
            {selectedDate !== null && (
              <div className="animate-fade-in">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <h2 className="font-semibold text-foreground">Escolha o Horário</h2>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                        selectedTime === time 
                          ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-lg shadow-orange-600/25' 
                          : 'bg-card border border-border text-muted-foreground hover:border-orange-300'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            {/* Party Size */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 flex items-center justify-center">
                  <Users className="w-5 h-5 text-orange-600" />
                </div>
                <h2 className="font-semibold text-foreground">Quantas Pessoas?</h2>
              </div>
              <div className="flex items-center justify-center gap-6 py-6 bg-card rounded-2xl">
                <button
                  onClick={() => setPartySize(Math.max(1, partySize - 1))}
                  className="w-14 h-14 rounded-full bg-muted text-2xl font-bold text-muted-foreground hover:bg-muted/80 transition-colors"
                >
                  -
                </button>
                <span className="text-5xl font-bold text-foreground w-20 text-center">{partySize}</span>
                <button
                  onClick={() => setPartySize(Math.min(20, partySize + 1))}
                  className="w-14 h-14 rounded-full bg-muted text-2xl font-bold text-muted-foreground hover:bg-muted/80 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Table Preference */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-orange-600" />
                </div>
                <h2 className="font-semibold text-foreground">Preferência de Mesa</h2>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {tablePreferences.map((pref) => (
                  <button
                    key={pref.id}
                    onClick={() => togglePreference(pref.id)}
                    className={`p-4 rounded-2xl border-2 text-center transition-all duration-300 ${
                      preferences.includes(pref.id) 
                        ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-600' 
                        : 'bg-card border-border hover:border-orange-300'
                    }`}
                  >
                    <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-2">
                      <img src={pref.icon} alt={pref.label} className="w-12 h-12 object-contain mix-blend-multiply dark:mix-blend-normal" />
                    </div>
                    <p className={`text-xs font-medium ${preferences.includes(pref.id) ? 'text-orange-600' : 'text-muted-foreground'}`}>
                      {pref.label}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Mode */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-orange-600" />
                </div>
                <h2 className="font-semibold text-foreground">Tipo de Comanda</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMode('individual')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all duration-300 ${
                    paymentMode === 'individual' 
                      ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-600' 
                      : 'bg-card border-border'
                  }`}
                >
                  <p className="font-semibold text-foreground">Individual</p>
                  <p className="text-xs text-muted-foreground mt-1">Cada um paga o seu</p>
                </button>
                <button
                  onClick={() => setPaymentMode('shared')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all duration-300 ${
                    paymentMode === 'shared' 
                      ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-600' 
                      : 'bg-card border-border'
                  }`}
                >
                  <p className="font-semibold text-foreground">Conjunta</p>
                  <p className="text-xs text-muted-foreground mt-1">Dividir entre todos</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            {/* Guest Invitations */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-orange-600" />
                  </div>
                  <h2 className="font-semibold text-foreground">Convidar Acompanhantes</h2>
                </div>
                <button 
                  onClick={() => setShowGuestForm(true)}
                  className="text-sm text-orange-600 font-medium flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Adicionar
                </button>
              </div>

              {guests.length >= partySize && (
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 mb-4">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-700 dark:text-amber-300">Limite de convidados atingido</p>
                    <p className="text-amber-600 dark:text-amber-400 text-xs">Aumente o número de pessoas na reserva</p>
                  </div>
                </div>
              )}

              {guests.length === 0 && !showGuestForm && (
                <div className="p-6 rounded-2xl bg-card border border-border text-center">
                  <p className="text-muted-foreground text-sm">Você é o cliente principal. Convide pessoas para compartilhar a experiência!</p>
                </div>
              )}

              {/* Guest List */}
              <div className="space-y-2">
                {guests.map((guest) => (
                  <div key={guest.id} className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 flex items-center justify-center">
                      <span className="font-semibold text-orange-600">{guest.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{guest.name}</p>
                      <p className="text-xs text-muted-foreground">{guest.hasApp ? 'Via App' : 'Via SMS/Link'}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      guest.status === 'accepted' 
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
                        : guest.status === 'declined'
                          ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600'
                          : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'
                    }`}>
                      {guest.status === 'accepted' ? 'Aceito' : guest.status === 'declined' ? 'Recusado' : 'Pendente'}
                    </span>
                    <button onClick={() => removeGuest(guest.id)} className="text-muted-foreground hover:text-foreground">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Guest Form */}
              {showGuestForm && (
                <div className="mt-4 p-4 rounded-2xl bg-card border border-border space-y-3">
                  <input
                    type="text"
                    value={newGuestName}
                    onChange={(e) => setNewGuestName(e.target.value)}
                    placeholder="Nome do convidado"
                    className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-600/30"
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setShowGuestForm(false)}
                      className="flex-1 py-3 rounded-xl bg-muted text-muted-foreground font-medium"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={addGuest}
                      disabled={!newGuestName}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 text-white font-medium disabled:opacity-50"
                    >
                      Convidar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="p-4 rounded-2xl bg-card border border-border">
              <h3 className="font-semibold text-foreground mb-3">Resumo da Reserva</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data</span>
                  <span className="font-medium text-foreground">
                    {selectedDate !== null ? `${dates[selectedDate].day} ${dates[selectedDate].month}` : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Horário</span>
                  <span className="font-medium text-foreground">{selectedTime || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pessoas</span>
                  <span className="font-medium text-foreground">{partySize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Convidados</span>
                  <span className="font-medium text-foreground">{guests.length}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action */}
      <div className="p-5 bg-card border-t border-border">
        <button
          onClick={() => step < 3 ? setStep(step + 1) : onNavigate('reservations')}
          disabled={!canProceed()}
          className="w-full py-4 bg-gradient-to-r from-orange-600 to-amber-500 text-white font-semibold rounded-2xl shadow-xl shadow-orange-600/25 disabled:opacity-50 disabled:shadow-none active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          {step < 3 ? (
            <>Continuar <ChevronRight className="w-5 h-5" /></>
          ) : (
            'Confirmar Reserva'
          )}
        </button>
      </div>
    </div>
  );
};

export default NewReservationScreenV2;
