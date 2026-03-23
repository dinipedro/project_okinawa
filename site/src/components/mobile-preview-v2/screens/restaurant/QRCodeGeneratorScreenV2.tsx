import { FC, useState } from 'react';
import { ChevronLeft, QrCode, Download, Share2, Check, Sparkles, Zap, Crown, Minus, Image } from "lucide-react";
import RestaurantLiquidGlassNav from '../../components/RestaurantLiquidGlassNav';

interface QRCodeGeneratorScreenV2Props {
  onNavigate: (screen: string) => void;
}

type QRStyle = 'minimal' | 'premium' | 'bold' | 'elegant';

const styleConfigs = [
  {
    id: 'minimal' as QRStyle,
    name: 'Minimal',
    description: 'Clean e moderno',
    icon: Minus,
    bgClass: 'bg-foreground',
    borderColor: 'border-foreground',
  },
  {
    id: 'premium' as QRStyle,
    name: 'Premium',
    description: 'Sofisticado com gradiente',
    icon: Sparkles,
    bgClass: 'bg-gradient-to-br from-primary to-accent',
    borderColor: 'border-primary',
  },
  {
    id: 'bold' as QRStyle,
    name: 'Bold',
    description: 'Impactante e direto',
    icon: Zap,
    bgClass: 'bg-foreground',
    borderColor: 'border-foreground',
  },
  {
    id: 'elegant' as QRStyle,
    name: 'Elegant',
    description: 'Refinado com detalhes',
    icon: Crown,
    bgClass: 'bg-muted-foreground',
    borderColor: 'border-muted-foreground',
  },
];

const QRCodeGeneratorScreenV2: FC<QRCodeGeneratorScreenV2Props> = ({ onNavigate }) => {
  const [selectedStyle, setSelectedStyle] = useState<QRStyle>('premium');
  const [includeLogo, setIncludeLogo] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const selectedConfig = styleConfigs.find(s => s.id === selectedStyle);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setIsGenerated(true);
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-muted to-background relative pb-28">
      {/* Header */}
      <div className="px-5 py-4 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate('tables')} 
            className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-foreground">Gerar QR Code</h1>
            <p className="text-xs text-muted-foreground">Mesa 5 • Área Interna</p>
          </div>
          <button 
            onClick={() => onNavigate('qr-batch')}
            className="text-xs text-primary font-medium"
          >
            Gerar em Lote
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* QR Preview Card */}
        <div className={`relative rounded-3xl border-2 ${selectedConfig?.borderColor} bg-card p-6 transition-all duration-300`}>
          {/* Style Badge */}
          <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full ${selectedConfig?.bgClass}`}>
            {selectedConfig && <selectedConfig.icon className="w-3.5 h-3.5 text-primary-foreground" />}
            <span className="text-xs font-semibold text-primary-foreground">{selectedConfig?.name}</span>
          </div>

          {/* QR Code Display */}
          <div className="flex flex-col items-center py-6">
            {isGenerated ? (
              <div className="relative">
                {/* Generated QR Code Mockup */}
                <div className={`w-48 h-48 rounded-2xl flex items-center justify-center ${
                  selectedStyle === 'minimal' ? 'bg-background border-2 border-foreground' :
                  selectedStyle === 'premium' ? 'bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary' :
                  selectedStyle === 'bold' ? 'bg-foreground' :
                  'bg-muted border border-border'
                }`}>
                  <div className="grid grid-cols-5 gap-1 p-4">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-6 h-6 rounded-sm ${
                          Math.random() > 0.3 
                            ? selectedStyle === 'bold' ? 'bg-primary' : 'bg-foreground' 
                            : 'bg-transparent'
                        }`}
                      />
                    ))}
                  </div>
                  {includeLogo && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                        <span className="text-xl font-bold text-primary-foreground">O</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Success Check */}
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-success flex items-center justify-center shadow-lg">
                  <Check className="w-5 h-5 text-success-foreground" />
                </div>
              </div>
            ) : (
              <div className="w-48 h-48 rounded-2xl bg-muted/50 border-2 border-dashed border-border flex flex-col items-center justify-center">
                <QrCode className="w-16 h-16 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground text-center">
                  Selecione um estilo<br/>e gere o QR Code
                </p>
              </div>
            )}

            {/* Actions */}
            {isGenerated && (
              <div className="flex items-center gap-4 mt-6">
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted hover:bg-muted/80 transition-colors">
                  <Share2 className="w-4 h-4 text-foreground" />
                  <span className="text-sm font-medium text-foreground">Compartilhar</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 transition-colors">
                  <Download className="w-4 h-4 text-primary-foreground" />
                  <span className="text-sm font-medium text-primary-foreground">Baixar</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Style Selector */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Escolha o Estilo</h3>
          <div className="grid grid-cols-2 gap-3">
            {styleConfigs.map((config) => (
              <button
                key={config.id}
                onClick={() => {
                  setSelectedStyle(config.id);
                  setIsGenerated(false);
                }}
                className={`relative p-4 rounded-2xl border-2 transition-all duration-200 ${
                  selectedStyle === config.id 
                    ? `${config.borderColor} bg-card shadow-lg` 
                    : 'border-border bg-card hover:border-muted-foreground'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl ${config.bgClass} flex items-center justify-center mb-3`}>
                  <config.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <p className="text-sm font-semibold text-foreground text-left">{config.name}</p>
                <p className="text-xs text-muted-foreground text-left">{config.description}</p>
                
                {selectedStyle === config.id && (
                  <div className={`absolute top-2 right-2 w-5 h-5 rounded-full ${config.bgClass} flex items-center justify-center`}>
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <button
            onClick={() => setIncludeLogo(!includeLogo)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Image className="w-5 h-5 text-foreground" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">Incluir Logo</p>
                <p className="text-xs text-muted-foreground">Logo do restaurante no centro</p>
              </div>
            </div>
            <div className={`w-12 h-7 rounded-full transition-colors ${includeLogo ? 'bg-primary' : 'bg-muted'} relative`}>
              <div className={`absolute top-1 w-5 h-5 rounded-full bg-card shadow-sm transition-all ${includeLogo ? 'right-1' : 'left-1'}`} />
            </div>
          </button>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className={`w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 transition-all ${
            isGenerating 
              ? 'bg-muted text-muted-foreground' 
              : 'bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40'
          }`}
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
              Gerando...
            </>
          ) : (
            <>
              <QrCode className="w-5 h-5" />
              {isGenerated ? 'Regenerar QR Code' : 'Gerar QR Code'}
            </>
          )}
        </button>
      </div>

      <RestaurantLiquidGlassNav activeTab="tables" onNavigate={onNavigate} />
    </div>
  );
};

export default QRCodeGeneratorScreenV2;
