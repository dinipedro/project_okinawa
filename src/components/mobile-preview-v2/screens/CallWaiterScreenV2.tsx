import { FC, useState } from 'react';
import { ArrowLeft, Bell, HelpCircle, ChefHat, Coffee, Accessibility, Sparkles, AlertTriangle, User, Check, MessageSquare } from 'lucide-react';

interface CallWaiterScreenV2Props {
  onNavigate: (screen: string) => void;
  onBack?: () => void;
}

const callOptions = [
  { id: 'question', icon: HelpCircle, label: 'Dúvidas sobre Pratos', description: 'Perguntar sobre ingredientes ou preparo', gradient: 'from-info to-info/80' },
  { id: 'special', icon: ChefHat, label: 'Pedido Especial', description: 'Modificações ou pedidos personalizados', gradient: 'from-warning to-warning/80' },
  { id: 'refill', icon: Coffee, label: 'Refil/Mais', description: 'Solicitar refil de bebida', gradient: 'from-success to-success/80' },
  { id: 'assistance', icon: Accessibility, label: 'Assistência', description: 'Acessibilidade ou necessidades especiais', gradient: 'from-secondary to-secondary/80' },
  { id: 'recommendation', icon: Sparkles, label: 'Recomendação', description: 'Sugestões do chef ou harmonizações', gradient: 'from-primary to-accent' },
  { id: 'issue', icon: AlertTriangle, label: 'Reportar Problema', description: 'Informar problema com pedido', gradient: 'from-destructive to-destructive/80' },
  { id: 'manager', icon: User, label: 'Chamar Gerente', description: 'Falar com responsável', gradient: 'from-muted-foreground to-muted-foreground/80' },
];

const CallWaiterScreenV2: FC<CallWaiterScreenV2Props> = ({ onNavigate, onBack }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSend = async () => {
    if (!selectedOption) return;
    setIsSending(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSending(false);
    setIsSent(true);
  };

  if (isSent) {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-success to-success/80 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-success/30">
              <Check className="w-12 h-12 text-success-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Solicitação Enviada!</h2>
            <p className="text-muted-foreground mb-2">
              Um membro da equipe foi notificado e virá atendê-lo em breve.
            </p>
            <p className="text-sm text-muted-foreground">Mesa 12</p>
            <button
              onClick={onBack}
              className="mt-8 px-8 py-3 bg-muted text-muted-foreground font-semibold rounded-2xl"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-card px-5 py-4 border-b border-border">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">Chamar Atendimento</h1>
            <p className="text-xs text-muted-foreground">Mesa 12</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        <p className="text-sm text-muted-foreground mb-4">Selecione o tipo de atendimento que deseja:</p>

        {/* Options Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {callOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedOption === option.id;
            
            return (
              <button
                key={option.id}
                onClick={() => setSelectedOption(option.id)}
                className={`p-4 rounded-2xl border-2 text-left transition-all duration-300 ${
                  isSelected 
                    ? 'bg-primary/10 border-primary' 
                    : 'bg-card border-border hover:border-primary/50'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${option.gradient} flex items-center justify-center mb-3 shadow-lg`}>
                  <Icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <p className="font-semibold text-foreground text-sm">{option.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{option.description}</p>
              </button>
            );
          })}
        </div>

        {/* Custom Message */}
        {selectedOption && (
          <div className="space-y-3 animate-fade-in">
            <label className="block text-sm font-semibold text-foreground">
              Mensagem adicional (opcional)
            </label>
            <div className="relative">
              <div className="absolute left-4 top-4 w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
              </div>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Ex: Por favor, trazer guardanapos extras..."
                className="w-full pl-14 pr-4 py-4 rounded-2xl bg-card border border-border text-foreground placeholder:text-muted-foreground min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
        )}

        {/* Discreet Mode Notice */}
        <div className="mt-6 p-4 rounded-2xl bg-primary/10 border border-primary/30 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">Modo Discreto</p>
            <p className="text-muted-foreground text-xs mt-0.5">
              Sua solicitação é enviada de forma discreta. Apenas a equipe de atendimento será notificada.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="p-5 bg-card border-t border-border">
        <button
          onClick={handleSend}
          disabled={!selectedOption || isSending}
          className="w-full py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-primary/25 disabled:opacity-50 disabled:shadow-none active:scale-[0.98] transition-all"
        >
          {isSending ? (
            <>
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Bell className="w-5 h-5" />
              Enviar Solicitação
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CallWaiterScreenV2;
