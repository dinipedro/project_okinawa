import React from 'react';
import { ServiceType, SERVICE_TYPE_CONFIG, useMobilePreview } from './context/MobilePreviewContext';
import { Check, ChevronRight } from 'lucide-react';

export function ServiceTypeSelector() {
  const { serviceType, setServiceType, navigate } = useMobilePreview();

  const handleSelect = (type: ServiceType) => {
    setServiceType(type);
  };

  const handleContinue = () => {
    if (serviceType) {
      navigate('home');
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="text-center mb-2">
          <span className="text-4xl">🍽️</span>
        </div>
        <h1 className="text-xl font-bold text-center text-foreground">
          Tipo de Experiência
        </h1>
        <p className="text-sm text-muted-foreground text-center mt-1">
          Selecione o tipo de estabelecimento para simular
        </p>
      </div>

      {/* Service Types Grid */}
      <div className="flex-1 overflow-auto px-4 pb-4">
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(SERVICE_TYPE_CONFIG).map(([key, config]) => {
            const type = key as ServiceType;
            const isSelected = serviceType === type;
            
            return (
              <button
                key={type}
                onClick={() => handleSelect(type)}
                className={`
                  relative p-4 rounded-xl border-2 transition-all duration-200 text-left
                  ${isSelected 
                    ? 'border-primary bg-primary/10 shadow-lg scale-[1.02]' 
                    : 'border-border bg-card hover:border-primary/50 hover:bg-accent/50'
                  }
                `}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
                <span className="text-2xl block mb-2">{config.icon}</span>
                <h3 className="font-semibold text-sm text-foreground leading-tight">
                  {config.label}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {config.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Type Details */}
      {serviceType && (
        <div className="px-4 pb-4">
          <div className="bg-accent/50 rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{SERVICE_TYPE_CONFIG[serviceType].icon}</span>
              <span className="font-semibold text-foreground">
                {SERVICE_TYPE_CONFIG[serviceType].label}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SERVICE_TYPE_CONFIG[serviceType].features.map((feature, i) => (
                <span 
                  key={i}
                  className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Continue Button */}
      <div className="p-4 border-t border-border">
        <button
          onClick={handleContinue}
          disabled={!serviceType}
          className={`
            w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2
            transition-all duration-200
            ${serviceType 
              ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
              : 'bg-muted text-muted-foreground cursor-not-allowed'
            }
          `}
        >
          Iniciar Experiência
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
