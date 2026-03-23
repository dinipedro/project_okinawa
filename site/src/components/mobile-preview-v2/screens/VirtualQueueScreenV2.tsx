import { FC, useState, useEffect } from 'react';
import { ArrowLeft, Users, Clock, Bell, CheckCircle, MapPin, Shield, User, Plus, X, Ticket, Accessibility, Baby, Heart } from 'lucide-react';

interface VirtualQueueScreenV2Props {
  onNavigate: (screen: string) => void;
  onBack?: () => void;
}

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
  { id: 'disability', label: 'PCD', icon: Accessibility },
];

const VirtualQueueScreenV2: FC<VirtualQueueScreenV2Props> = ({ onNavigate, onBack }) => {
  const [step, setStep] = useState<'form' | 'queue'>('form');
  const [position, setPosition] = useState(5);
  const [estimatedWait, setEstimatedWait] = useState(15);
  const [partySize, setPartySize] = useState(2);
  const [preferences, setPreferences] = useState<string[]>([]);
  const [priority, setPriority] = useState('none');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    if (step === 'queue' && position > 1) {
      const timer = setInterval(() => {
        setPosition(p => Math.max(1, p - 1));
        setEstimatedWait(w => Math.max(3, w - 3));
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [step, position]);

  const togglePreference = (id: string) => {
    setPreferences(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleJoinQueue = () => {
    if (preferences.length > 0) {
      setStep('queue');
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-card px-5 py-4 border-b border-border">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">Fila Virtual</h1>
            <p className="text-xs text-muted-foreground">Kotaro Sushi</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {step === 'form' ? (
          <div className="space-y-5">
            {/* Queue Status */}
            <div className="bg-card rounded-3xl p-5 border border-border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">Status da fila</span>
                <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-xs font-semibold">
                  Aberta
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-800/30 dark:to-amber-800/30 flex items-center justify-center">
                    <Users className="w-5 h-5 text-orange-600" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">8</p>
                  <p className="text-xs text-muted-foreground">pessoas na fila</p>
                </div>
                <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-800/30 dark:to-amber-800/30 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">~20</p>
                  <p className="text-xs text-muted-foreground">min de espera</p>
                </div>
              </div>
            </div>

            {/* Party Size */}
            <div className="bg-card rounded-3xl p-5 border border-border shadow-sm">
              <label className="block text-sm font-semibold text-foreground mb-4">Quantas pessoas?</label>
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={() => setPartySize(Math.max(1, partySize - 1))}
                  className="w-12 h-12 rounded-full bg-muted text-xl font-bold text-muted-foreground hover:bg-muted/80 transition-colors"
                >
                  -
                </button>
                <span className="text-4xl font-bold text-foreground w-16 text-center">{partySize}</span>
                <button
                  onClick={() => setPartySize(Math.min(20, partySize + 1))}
                  className="w-12 h-12 rounded-full bg-muted text-xl font-bold text-muted-foreground hover:bg-muted/80 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Table Preference */}
            <div className="bg-card rounded-3xl p-5 border border-border shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-4 h-4 text-orange-600" />
                <label className="text-sm font-semibold text-foreground">Preferência de Mesa</label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {tablePreferences.map((pref) => (
                  <button
                    key={pref.id}
                    onClick={() => togglePreference(pref.id)}
                    className={`p-4 rounded-2xl border-2 text-center transition-all duration-300 ${
                      preferences.includes(pref.id) 
                        ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-600' 
                        : 'bg-muted border-border hover:border-orange-300'
                    }`}
                  >
                    <span className="text-xl">{pref.icon}</span>
                    <p className={`text-xs mt-1 font-medium ${preferences.includes(pref.id) ? 'text-orange-600' : 'text-muted-foreground'}`}>
                      {pref.label}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div className="bg-card rounded-3xl p-5 border border-border shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-4 h-4 text-orange-600" />
                <label className="text-sm font-semibold text-foreground">Atendimento Prioritário</label>
              </div>
              <div className="space-y-2">
                {priorityOptions.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setPriority(opt.id)}
                      className={`w-full p-3 rounded-xl border-2 flex items-center gap-3 transition-all duration-300 ${
                        priority === opt.id 
                          ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-600' 
                          : 'bg-muted border-border'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${priority === opt.id ? 'text-orange-600' : 'text-muted-foreground'}`} />
                      <span className={`text-sm font-medium ${priority === opt.id ? 'text-orange-600' : 'text-muted-foreground'}`}>
                        {opt.label}
                      </span>
                      {priority === opt.id && (
                        <CheckCircle className="w-4 h-4 text-orange-600 ml-auto" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-card rounded-3xl p-5 border border-border shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-800/30 dark:to-amber-800/30 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">Notificações</p>
                    <p className="text-xs text-muted-foreground">Alerta quando sua vez chegar</p>
                  </div>
                </div>
                <button 
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className={`w-12 h-7 rounded-full relative transition-colors ${
                    notificationsEnabled ? 'bg-gradient-to-r from-orange-600 to-amber-500' : 'bg-muted'
                  }`}
                >
                  <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                    notificationsEnabled ? 'right-1' : 'left-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Position Card */}
            <div className={`rounded-3xl p-8 text-center shadow-xl ${
              position === 1 
                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/30' 
                : 'bg-gradient-to-br from-orange-600 to-amber-500 shadow-orange-600/30'
            } text-white`}>
              {position === 1 ? (
                <>
                  <CheckCircle className="w-20 h-20 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold mb-2">É sua vez!</h2>
                  <p className="text-white/80">Dirija-se ao estabelecimento</p>
                  <p className="text-xs text-white/60 mt-2">Você tem 10 minutos para iniciar o atendimento</p>
                </>
              ) : (
                <>
                  <Ticket className="w-16 h-16 mx-auto mb-4 opacity-80" />
                  <p className="text-white/80 mb-2">Sua posição</p>
                  <p className="text-7xl font-bold mb-2">{position}º</p>
                  <p className="text-white/80">na fila</p>
                  {priority !== 'none' && (
                    <span className="inline-block mt-4 px-4 py-1.5 rounded-full bg-white/20 text-sm">
                      🌟 Prioridade ativa
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Wait Time */}
            {position > 1 && (
              <div className="bg-card rounded-3xl p-5 border border-border shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-800/30 dark:to-amber-800/30 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-orange-600" />
                    </div>
                    <span className="text-muted-foreground">Tempo estimado</span>
                  </div>
                  <span className="text-2xl font-bold text-foreground">~{estimatedWait} min</span>
                </div>
              </div>
            )}

            {/* Info */}
            <div className="bg-card rounded-3xl p-5 border border-border shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-orange-600" />
                  <span className="text-muted-foreground">Pessoas</span>
                </div>
                <span className="font-semibold text-foreground">{partySize}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-orange-600" />
                  <span className="text-muted-foreground">Preferência</span>
                </div>
                <span className="font-medium text-foreground text-sm">
                  {preferences.map(p => tablePreferences.find(tp => tp.id === p)?.label).join(', ')}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action */}
      <div className="p-5 bg-card border-t border-border">
        {step === 'form' ? (
          <button
            onClick={handleJoinQueue}
            disabled={preferences.length === 0}
            className="w-full py-4 bg-gradient-to-r from-orange-600 to-amber-500 text-white font-semibold rounded-2xl shadow-xl shadow-orange-600/25 disabled:opacity-50 disabled:shadow-none active:scale-[0.98] transition-all"
          >
            Entrar na Fila
          </button>
        ) : position === 1 ? (
          <button
            onClick={() => onNavigate('qr-scanner')}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-2xl shadow-xl shadow-emerald-500/25 active:scale-[0.98] transition-all"
          >
            Iniciar Atendimento
          </button>
        ) : (
          <button
            onClick={() => setStep('form')}
            className="w-full py-4 bg-muted text-muted-foreground font-semibold rounded-2xl"
          >
            Sair da Fila
          </button>
        )}
      </div>
    </div>
  );
};

export default VirtualQueueScreenV2;
