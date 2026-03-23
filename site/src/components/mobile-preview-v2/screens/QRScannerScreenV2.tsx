import { FC, useState } from 'react';
import { X, Zap, Camera, FlashlightOff, QrCode, Check, Users, ArrowRight, Utensils } from "lucide-react";

interface QRScannerScreenV2Props {
  onNavigate: (screen: string) => void;
}

const QRScannerScreenV2: FC<QRScannerScreenV2Props> = ({ onNavigate }) => {
  const [scanState, setScanState] = useState<'scanning' | 'validating' | 'success'>('scanning');
  const [showWelcome, setShowWelcome] = useState(false);

  // Simulate QR scan
  const simulateScan = () => {
    setScanState('validating');
    setTimeout(() => {
      setScanState('success');
      setTimeout(() => {
        setShowWelcome(true);
      }, 800);
    }, 1200);
  };

  // Welcome Modal after successful scan
  if (showWelcome) {
    return (
      <div className="h-full flex flex-col bg-gradient-to-b from-muted to-background">
        {/* Success Animation */}
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          {/* Restaurant Logo */}
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-6 shadow-xl shadow-primary/30">
            <Utensils className="w-12 h-12 text-primary-foreground" />
          </div>

          {/* Welcome Text */}
          <h1 className="text-2xl font-bold text-foreground text-center mb-2">
            Bem-vindo ao Omakase Sushi!
          </h1>
          <p className="text-muted-foreground text-center mb-2">
            Mesa 12 • Área Interna
          </p>

          {/* Session Info Card */}
          <div className="w-full bg-card rounded-2xl border border-border p-5 mt-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                  <Check className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Sessão Iniciada</p>
                  <p className="text-xs text-muted-foreground">Agora: {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span className="text-sm">1</span>
              </div>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">4.8</p>
                <p className="text-xs text-muted-foreground">Avaliação</p>
              </div>
              <div className="text-center border-x border-border">
                <p className="text-lg font-bold text-foreground">$$</p>
                <p className="text-xs text-muted-foreground">Preço</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">25min</p>
                <p className="text-xs text-muted-foreground">Tempo médio</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <button 
            onClick={() => onNavigate('restaurant-detail')}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
          >
            Ver Cardápio
            <ArrowRight className="w-5 h-5" />
          </button>

          <button 
            onClick={() => onNavigate('call-waiter')}
            className="w-full py-4 rounded-2xl bg-card border border-border text-foreground font-medium mt-3"
          >
            Chamar Garçom
          </button>

          <button 
            onClick={() => onNavigate('home')}
            className="mt-4 text-sm text-muted-foreground"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-foreground relative dark:bg-background">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-4">
        <button 
          onClick={() => onNavigate('home')}
          className="p-2.5 rounded-full bg-background/20 backdrop-blur-sm hover:bg-background/30 transition-colors"
        >
          <X className="w-5 h-5 text-background dark:text-foreground" />
        </button>
        <h1 className="font-semibold text-lg text-background dark:text-foreground">Escanear QR</h1>
        <button className="p-2.5 rounded-full bg-background/20 backdrop-blur-sm hover:bg-background/30 transition-colors">
          <FlashlightOff className="w-5 h-5 text-background dark:text-foreground" />
        </button>
      </div>

      {/* Camera View Simulation */}
      <div className="flex-1 flex items-center justify-center relative">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-foreground via-foreground/90 to-foreground dark:from-background dark:via-muted dark:to-background" />
        
        {/* Scanner Frame */}
        <div className="relative w-64 h-64">
          {/* Corner decorations */}
          <div className={`absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 rounded-tl-3xl transition-colors duration-300 ${
            scanState === 'success' ? 'border-success' : 'border-primary'
          }`} />
          <div className={`absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 rounded-tr-3xl transition-colors duration-300 ${
            scanState === 'success' ? 'border-success' : 'border-primary'
          }`} />
          <div className={`absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 rounded-bl-3xl transition-colors duration-300 ${
            scanState === 'success' ? 'border-success' : 'border-primary'
          }`} />
          <div className={`absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 rounded-br-3xl transition-colors duration-300 ${
            scanState === 'success' ? 'border-success' : 'border-primary'
          }`} />
          
          {/* Scanning line animation */}
          {scanState === 'scanning' && (
            <div 
              className="absolute left-6 right-6 h-1 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full animate-pulse" 
              style={{ top: "50%", boxShadow: "0 0 20px hsl(var(--primary) / 0.5)" }} 
            />
          )}

          {/* State indicators */}
          {scanState === 'validating' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          )}

          {scanState === 'success' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-success flex items-center justify-center animate-pulse">
                <Check className="w-10 h-10 text-success-foreground" />
              </div>
            </div>
          )}
          
          {/* QR placeholder */}
          {scanState === 'scanning' && (
            <div className="absolute inset-10 bg-background/5 rounded-2xl backdrop-blur-sm flex items-center justify-center border border-background/10">
              <QrCode className="w-16 h-16 text-background/30 dark:text-foreground/30" />
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground via-foreground/95 to-transparent dark:from-background dark:via-background/95 pt-24 pb-8 px-5">
        <div className="text-center text-background dark:text-foreground mb-6">
          {scanState === 'scanning' && (
            <>
              <h2 className="font-semibold text-lg mb-2">Aponte para o QR Code</h2>
              <p className="text-sm text-background/70 dark:text-foreground/70">
                Escaneie o código na mesa para iniciar seu atendimento
              </p>
            </>
          )}
          {scanState === 'validating' && (
            <>
              <h2 className="font-semibold text-lg mb-2">Validando...</h2>
              <p className="text-sm text-background/70 dark:text-foreground/70">
                Verificando QR Code seguro
              </p>
            </>
          )}
          {scanState === 'success' && (
            <>
              <h2 className="font-semibold text-lg mb-2 text-success">QR Válido!</h2>
              <p className="text-sm text-background/70 dark:text-foreground/70">
                Iniciando sua sessão...
              </p>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3">
          <button 
            onClick={simulateScan}
            className="flex-1 py-4 rounded-2xl bg-background/10 backdrop-blur-sm text-background dark:text-foreground font-medium text-sm flex items-center justify-center gap-2 border border-background/10 hover:bg-background/20 transition-colors"
          >
            <Zap className="w-5 h-5" />
            Simular Scan
          </button>
          <button className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
            <Camera className="w-5 h-5" />
            Galeria
          </button>
        </div>

        {/* Recent */}
        <div className="mt-4 p-4 rounded-2xl bg-background/5 backdrop-blur-sm border border-background/10">
          <p className="text-xs text-background/50 dark:text-foreground/50 mb-2">Último escaneado</p>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary/20 flex items-center justify-center">
              <span className="text-lg">🍜</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-background dark:text-foreground">Omakase Sushi</p>
              <p className="text-xs text-background/50 dark:text-foreground/50">Mesa 12 • Há 2 dias</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScannerScreenV2;
