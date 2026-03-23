import React, { useState } from 'react';
import { useMobilePreview } from '../context/MobilePreviewContext';
import { 
  ArrowLeft, Bell, Coffee, Utensils, HelpCircle, 
  MessageSquare, Check, User, AlertTriangle, Accessibility, 
  ChefHat, Sparkles
} from 'lucide-react';

const callOptions = [
  { id: 'question', icon: HelpCircle, label: 'Dúvidas sobre Pratos', description: 'Perguntar sobre ingredientes ou preparo', color: 'bg-blue-500' },
  { id: 'special', icon: ChefHat, label: 'Pedido Especial', description: 'Modificações ou pedidos personalizados', color: 'bg-amber-500' },
  { id: 'refill', icon: Coffee, label: 'Refil/Mais', description: 'Solicitar refil de bebida', color: 'bg-emerald-500' },
  { id: 'assistance', icon: Accessibility, label: 'Assistência', description: 'Acessibilidade ou necessidades especiais', color: 'bg-purple-500' },
  { id: 'recommendation', icon: Sparkles, label: 'Recomendação', description: 'Sugestões do chef ou harmonizações', color: 'bg-primary' },
  { id: 'issue', icon: AlertTriangle, label: 'Reportar Problema', description: 'Informar problema com pedido', color: 'bg-destructive' },
  { id: 'manager', icon: User, label: 'Chamar Gerente', description: 'Falar com responsável', color: 'bg-slate-600' },
];

export function CallWaiterScreen() {
  const { goBack, currentTable } = useMobilePreview();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSend = async () => {
    if (!selectedOption) return;
    
    setIsSending(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSending(false);
    setIsSent(true);
    
    // Auto close after success
    setTimeout(() => {
      goBack();
    }, 2000);
  };

  if (isSent) {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <Check className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Solicitação Enviada!</h2>
            <p className="text-muted-foreground">
              Um membro da equipe foi notificado e virá atendê-lo em breve.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Mesa {currentTable || '12'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-border">
        <button onClick={goBack} className="p-2 -ml-2 rounded-lg hover:bg-accent">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-semibold text-foreground">Chamar Atendimento</h1>
          <p className="text-xs text-muted-foreground">Mesa {currentTable || '12'}</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <p className="text-sm text-muted-foreground mb-4">
          Selecione o tipo de atendimento que deseja:
        </p>

        {/* Options Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {callOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedOption === option.id;
            
            return (
              <button
                key={option.id}
                onClick={() => setSelectedOption(option.id)}
                className={`
                  p-4 rounded-xl border-2 transition-all text-left
                  ${isSelected 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border bg-card hover:border-primary/50'
                  }
                `}
              >
                <div className={`w-10 h-10 rounded-lg ${option.color} flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="font-medium text-foreground text-sm">{option.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{option.description}</p>
              </button>
            );
          })}
        </div>

        {/* Custom Message */}
        {selectedOption && (
          <div className="space-y-3 animate-fade-in">
            <label className="block text-sm font-medium text-foreground">
              Mensagem adicional (opcional)
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Ex: Por favor, trazer guardanapos extras..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-accent border border-border text-foreground placeholder:text-muted-foreground min-h-[100px] resize-none"
              />
            </div>
          </div>
        )}

        {/* Discreet Mode Notice */}
        <div className="mt-6 p-4 rounded-xl bg-accent/50 flex items-start gap-3">
          <Bell className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-foreground">Modo Discreto</p>
            <p className="text-muted-foreground">
              Sua solicitação é enviada de forma discreta. Apenas a equipe de atendimento será notificada.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="p-4 border-t border-border">
        <button
          onClick={handleSend}
          disabled={!selectedOption || isSending}
          className={`
            w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2
            ${selectedOption 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-muted-foreground cursor-not-allowed'
            }
          `}
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
}
