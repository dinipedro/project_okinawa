import { useState } from 'react';
import { 
  ChevronLeft, Check, Settings, Info, ChevronRight,
  Clock, Users, MapPin, CreditCard, Bell, Smartphone
} from "lucide-react";
import { useMobilePreview, ServiceType, SERVICE_TYPE_CONFIG } from '../context/MobilePreviewContext';

interface FeatureToggle {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  category: string;
}

export const ServiceTypeConfigScreen = () => {
  const { goBack, serviceType, setServiceType } = useMobilePreview();
  const [selectedType, setSelectedType] = useState<ServiceType | null>(serviceType);
  const [step, setStep] = useState<'type' | 'features' | 'confirm'>('type');
  
  const [features, setFeatures] = useState<FeatureToggle[]>([
    { id: 'reservations', label: 'Reservas', description: 'Permitir reservas antecipadas', icon: <Clock className="h-5 w-5" />, enabled: true, category: 'Atendimento' },
    { id: 'queue', label: 'Fila Virtual', description: 'Sistema de fila com estimativa de espera', icon: <Users className="h-5 w-5" />, enabled: true, category: 'Atendimento' },
    { id: 'tableMap', label: 'Mapa de Mesas', description: 'Visualização interativa do salão', icon: <MapPin className="h-5 w-5" />, enabled: true, category: 'Atendimento' },
    { id: 'tableService', label: 'Serviço na Mesa', description: 'Pedidos e entrega na mesa', icon: <Bell className="h-5 w-5" />, enabled: true, category: 'Atendimento' },
    { id: 'splitPayment', label: 'Divisão de Conta', description: 'Dividir pagamento entre clientes', icon: <CreditCard className="h-5 w-5" />, enabled: true, category: 'Pagamento' },
    { id: 'mobileOrder', label: 'Pedido pelo App', description: 'Cliente faz pedido pelo celular', icon: <Smartphone className="h-5 w-5" />, enabled: true, category: 'Pedidos' },
    { id: 'dishBuilder', label: 'Monte seu Prato', description: 'Customização de pratos pelo cliente', icon: <Settings className="h-5 w-5" />, enabled: false, category: 'Pedidos' },
  ]);
  
  const toggleFeature = (id: string) => {
    setFeatures(prev => prev.map(f => 
      f.id === id ? { ...f, enabled: !f.enabled } : f
    ));
  };
  
  const handleSelectType = (type: ServiceType) => {
    setSelectedType(type);
    // Auto-configure features based on service type
    const config = SERVICE_TYPE_CONFIG[type];
    setFeatures(prev => prev.map(f => ({
      ...f,
      enabled: 
        (f.id === 'reservations' && config.hasReservations) ||
        (f.id === 'queue' && config.hasQueue) ||
        (f.id === 'tableMap' && config.hasTableService) ||
        (f.id === 'tableService' && config.hasTableService) ||
        (f.id === 'dishBuilder' && config.hasDishBuilder) ||
        (f.id === 'splitPayment') ||
        (f.id === 'mobileOrder')
    })));
  };
  
  const groupedFeatures = features.reduce((acc, feature) => {
    if (!acc[feature.category]) acc[feature.category] = [];
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, FeatureToggle[]>);
  
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="p-2 -ml-2 rounded-full hover:bg-muted">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-display text-lg font-bold">Configurar Tipo de Serviço</h1>
            <p className="text-xs text-muted-foreground">
              {step === 'type' && 'Escolha o tipo do seu estabelecimento'}
              {step === 'features' && 'Configure as funcionalidades'}
              {step === 'confirm' && 'Revise e confirme'}
            </p>
          </div>
        </div>
        
        {/* Progress */}
        <div className="flex items-center gap-2 mt-4">
          {['type', 'features', 'confirm'].map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                step === s ? 'bg-primary text-primary-foreground' :
                ['type', 'features', 'confirm'].indexOf(step) > i ? 'bg-success text-success-foreground' :
                'bg-muted text-muted-foreground'
              }`}>
                {['type', 'features', 'confirm'].indexOf(step) > i ? <Check className="h-3 w-3" /> : i + 1}
              </div>
              {i < 2 && <div className={`flex-1 h-0.5 mx-1 ${
                ['type', 'features', 'confirm'].indexOf(step) > i ? 'bg-success' : 'bg-muted'
              }`} />}
            </div>
          ))}
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4 pb-28">
        {step === 'type' && (
          <div className="space-y-3">
            {Object.entries(SERVICE_TYPE_CONFIG).map(([type, config]) => (
              <button
                key={type}
                onClick={() => handleSelectType(type as ServiceType)}
                className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                  selectedType === type 
                    ? 'bg-primary/10 border-primary' 
                    : 'bg-card border-border hover:border-muted-foreground/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{config.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{config.label}</span>
                      {selectedType === type && (
                        <div className="p-0.5 rounded-full bg-primary">
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{config.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {config.features.slice(0, 3).map(feature => (
                        <span key={feature} className="px-2 py-0.5 rounded-full bg-muted text-xs">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
        
        {step === 'features' && selectedType && (
          <div className="space-y-6">
            {/* Selected Type Summary */}
            <div className="p-4 rounded-2xl bg-primary/10 border border-primary">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{SERVICE_TYPE_CONFIG[selectedType].icon}</div>
                <div>
                  <span className="font-semibold">{SERVICE_TYPE_CONFIG[selectedType].label}</span>
                  <p className="text-sm text-muted-foreground">{SERVICE_TYPE_CONFIG[selectedType].description}</p>
                </div>
              </div>
            </div>
            
            {/* Feature Toggles by Category */}
            {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
              <div key={category}>
                <h3 className="font-semibold text-sm mb-3 text-muted-foreground">{category}</h3>
                <div className="space-y-2">
                  {categoryFeatures.map(feature => (
                    <button
                      key={feature.id}
                      onClick={() => toggleFeature(feature.id)}
                      className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                        feature.enabled
                          ? 'bg-success/5 border-success/30'
                          : 'bg-card border-border'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${
                          feature.enabled ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'
                        }`}>
                          {feature.icon}
                        </div>
                        <div className="flex-1">
                          <span className="font-medium text-sm">{feature.label}</span>
                          <p className="text-xs text-muted-foreground">{feature.description}</p>
                        </div>
                        <div className={`w-12 h-7 rounded-full p-1 transition-colors ${
                          feature.enabled ? 'bg-success' : 'bg-muted'
                        }`}>
                          <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                            feature.enabled ? 'translate-x-5' : 'translate-x-0'
                          }`} />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {step === 'confirm' && selectedType && (
          <div className="space-y-6">
            {/* Final Summary */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30">
              <div className="flex items-center gap-4 mb-4">
                <div className="text-4xl">{SERVICE_TYPE_CONFIG[selectedType].icon}</div>
                <div>
                  <h2 className="font-display text-xl font-bold">{SERVICE_TYPE_CONFIG[selectedType].label}</h2>
                  <p className="text-sm text-muted-foreground">{SERVICE_TYPE_CONFIG[selectedType].description}</p>
                </div>
              </div>
            </div>
            
            {/* Enabled Features */}
            <div>
              <h3 className="font-semibold text-sm mb-3">Funcionalidades Ativas</h3>
              <div className="grid grid-cols-2 gap-2">
                {features.filter(f => f.enabled).map(feature => (
                  <div key={feature.id} className="p-3 rounded-xl bg-success/10 border border-success/30 flex items-center gap-2">
                    <Check className="h-4 w-4 text-success" />
                    <span className="text-sm font-medium">{feature.label}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Disabled Features */}
            {features.filter(f => !f.enabled).length > 0 && (
              <div>
                <h3 className="font-semibold text-sm mb-3 text-muted-foreground">Funcionalidades Desativadas</h3>
                <div className="grid grid-cols-2 gap-2">
                  {features.filter(f => !f.enabled).map(feature => (
                    <div key={feature.id} className="p-3 rounded-xl bg-muted/50 border border-border flex items-center gap-2 opacity-60">
                      <span className="text-sm">{feature.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Info */}
            <div className="p-4 rounded-xl bg-muted/50 flex items-start gap-3">
              <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p>Você pode alterar essas configurações a qualquer momento nas configurações do restaurante.</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Bottom Actions */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-8">
        {step === 'type' && (
          <button
            onClick={() => setStep('features')}
            disabled={!selectedType}
            className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            Próximo: Funcionalidades
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
        
        {step === 'features' && (
          <div className="flex gap-3">
            <button
              onClick={() => setStep('type')}
              className="flex-1 py-4 rounded-2xl border-2 border-border font-bold"
            >
              Voltar
            </button>
            <button
              onClick={() => setStep('confirm')}
              className="flex-1 py-4 rounded-2xl bg-primary text-primary-foreground font-bold"
            >
              Revisar
            </button>
          </div>
        )}
        
        {step === 'confirm' && (
          <div className="flex gap-3">
            <button
              onClick={() => setStep('features')}
              className="flex-1 py-4 rounded-2xl border-2 border-border font-bold"
            >
              Voltar
            </button>
            <button
              onClick={() => {
                if (selectedType) setServiceType(selectedType);
                goBack();
              }}
              className="flex-1 py-4 rounded-2xl bg-success text-success-foreground font-bold flex items-center justify-center gap-2"
            >
              <Check className="h-5 w-5" />
              Salvar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
