import { X, Zap, Camera, FlashlightOff } from "lucide-react";

export const QRScannerScreen = () => {
  return (
    <div className="h-full flex flex-col bg-foreground relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-4">
        <button className="p-2.5 rounded-full bg-background/20 backdrop-blur-sm">
          <X className="h-5 w-5 text-background" />
        </button>
        <h1 className="font-display text-lg font-bold text-background">Escanear QR</h1>
        <button className="p-2.5 rounded-full bg-background/20 backdrop-blur-sm">
          <FlashlightOff className="h-5 w-5 text-background" />
        </button>
      </div>

      {/* Camera View Simulation */}
      <div className="flex-1 flex items-center justify-center relative">
        {/* Scanner Frame */}
        <div className="relative w-64 h-64">
          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-primary rounded-tl-2xl" />
          <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-primary rounded-tr-2xl" />
          <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-primary rounded-bl-2xl" />
          <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-primary rounded-br-2xl" />
          
          {/* Scanning line animation */}
          <div className="absolute left-4 right-4 h-0.5 bg-primary animate-pulse" style={{ top: "50%" }} />
          
          {/* QR placeholder */}
          <div className="absolute inset-8 bg-background/10 rounded-xl backdrop-blur-sm flex items-center justify-center">
            <Camera className="h-12 w-12 text-background/50" />
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground via-foreground to-transparent pt-20 pb-8 px-5">
        <div className="text-center text-background mb-6">
          <h2 className="font-semibold text-lg mb-2">Aponte para o QR Code</h2>
          <p className="text-sm opacity-80">
            Escaneie o código na mesa ou no balcão do estabelecimento
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3">
          <button className="flex-1 py-4 rounded-2xl bg-background/20 backdrop-blur-sm text-background font-medium text-sm flex items-center justify-center gap-2">
            <Zap className="h-5 w-5" />
            Digitar código
          </button>
          <button className="flex-1 py-4 rounded-2xl bg-primary text-primary-foreground font-medium text-sm flex items-center justify-center gap-2">
            <Camera className="h-5 w-5" />
            Galeria
          </button>
        </div>

        {/* Recent */}
        <div className="mt-4 p-4 rounded-2xl bg-background/10 backdrop-blur-sm">
          <p className="text-xs text-background/70 mb-2">Último escaneado</p>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-background/20 flex items-center justify-center">
              <span className="text-lg">🍜</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-background">Sakura Ramen</p>
              <p className="text-xs text-background/70">Mesa 12 • Há 2 dias</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
