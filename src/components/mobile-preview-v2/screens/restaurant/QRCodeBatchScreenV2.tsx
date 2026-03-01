import { FC, useState } from 'react';
import { ChevronLeft, QrCode, Download, FileDown, Check, CheckSquare, Square, Sparkles, Zap, Crown, Minus, Printer } from "lucide-react";
import RestaurantLiquidGlassNav from '../../components/RestaurantLiquidGlassNav';

interface QRCodeBatchScreenV2Props {
  onNavigate: (screen: string) => void;
}

type QRStyle = 'minimal' | 'premium' | 'bold' | 'elegant';

const tables = [
  { id: '1', number: 'Mesa 1', section: 'Área Interna', seats: 4 },
  { id: '2', number: 'Mesa 2', section: 'Área Interna', seats: 2 },
  { id: '3', number: 'Mesa 3', section: 'Área Interna', seats: 6 },
  { id: '4', number: 'Mesa 4', section: 'Varanda', seats: 4 },
  { id: '5', number: 'Mesa 5', section: 'Varanda', seats: 4 },
  { id: '6', number: 'Mesa 6', section: 'Varanda', seats: 8 },
  { id: '7', number: 'Mesa 7', section: 'Privativo', seats: 12 },
  { id: '8', number: 'Mesa 8', section: 'Bar', seats: 2 },
];

const styleConfigs = [
  { id: 'minimal' as QRStyle, name: 'Minimal', icon: Minus, bgClass: 'bg-foreground' },
  { id: 'premium' as QRStyle, name: 'Premium', icon: Sparkles, bgClass: 'bg-gradient-to-br from-primary to-accent' },
  { id: 'bold' as QRStyle, name: 'Bold', icon: Zap, bgClass: 'bg-foreground' },
  { id: 'elegant' as QRStyle, name: 'Elegant', icon: Crown, bgClass: 'bg-muted-foreground' },
];

const QRCodeBatchScreenV2: FC<QRCodeBatchScreenV2Props> = ({ onNavigate }) => {
  const [selectedStyle, setSelectedStyle] = useState<QRStyle>('premium');
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);

  const toggleTable = (id: string) => {
    setSelectedTables(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
    setIsGenerated(false);
  };

  const toggleAll = () => {
    if (selectedTables.length === tables.length) {
      setSelectedTables([]);
    } else {
      setSelectedTables(tables.map(t => t.id));
    }
    setIsGenerated(false);
  };

  const handleGenerate = () => {
    if (selectedTables.length === 0) return;
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setIsGenerated(true);
    }, 2000);
  };

  const selectedConfig = styleConfigs.find(s => s.id === selectedStyle);

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-muted to-background relative pb-28">
      {/* Header */}
      <div className="px-5 py-4 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate('qr-generator')} 
            className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-foreground">Gerar em Lote</h1>
            <p className="text-xs text-muted-foreground">{selectedTables.length} de {tables.length} mesas selecionadas</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Style Quick Select */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {styleConfigs.map((config) => (
            <button
              key={config.id}
              onClick={() => {
                setSelectedStyle(config.id);
                setIsGenerated(false);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 whitespace-nowrap transition-all ${
                selectedStyle === config.id 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border bg-card hover:border-muted-foreground'
              }`}
            >
              <div className={`w-6 h-6 rounded-lg ${config.bgClass} flex items-center justify-center`}>
                <config.icon className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <span className={`text-sm font-medium ${selectedStyle === config.id ? 'text-primary' : 'text-foreground'}`}>
                {config.name}
              </span>
            </button>
          ))}
        </div>

        {/* Table Selection */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {/* Select All Header */}
          <button 
            onClick={toggleAll}
            className="w-full flex items-center justify-between p-4 border-b border-border hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              {selectedTables.length === tables.length ? (
                <CheckSquare className="w-5 h-5 text-primary" />
              ) : (
                <Square className="w-5 h-5 text-muted-foreground" />
              )}
              <span className="font-medium text-foreground">Selecionar Todas</span>
            </div>
            <span className="text-sm text-muted-foreground">{tables.length} mesas</span>
          </button>

          {/* Table List */}
          <div className="divide-y divide-border">
            {tables.map((table) => (
              <button
                key={table.id}
                onClick={() => toggleTable(table.id)}
                className={`w-full flex items-center gap-4 p-4 transition-colors ${
                  selectedTables.includes(table.id) ? 'bg-primary/5' : 'hover:bg-muted/50'
                }`}
              >
                {selectedTables.includes(table.id) ? (
                  <CheckSquare className="w-5 h-5 text-primary" />
                ) : (
                  <Square className="w-5 h-5 text-muted-foreground" />
                )}
                <div className="flex-1 text-left">
                  <p className="font-medium text-foreground">{table.number}</p>
                  <p className="text-xs text-muted-foreground">{table.section} • {table.seats} lugares</p>
                </div>
                {isGenerated && selectedTables.includes(table.id) && (
                  <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center">
                    <Check className="w-4 h-4 text-success-foreground" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Generated Preview */}
        {isGenerated && (
          <div className="bg-card rounded-2xl border border-border p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl ${selectedConfig?.bgClass} flex items-center justify-center`}>
                <QrCode className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{selectedTables.length} QR Codes Gerados</p>
                <p className="text-xs text-muted-foreground">Estilo: {selectedConfig?.name}</p>
              </div>
            </div>

            {/* Preview Grid */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {selectedTables.slice(0, 8).map((id) => (
                <div 
                  key={id}
                  className="aspect-square rounded-lg bg-muted flex items-center justify-center"
                >
                  <QrCode className="w-6 h-6 text-muted-foreground" />
                </div>
              ))}
            </div>

            {/* Export Buttons */}
            <div className="flex gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors">
                <Download className="w-4 h-4 text-foreground" />
                <span className="text-sm font-medium text-foreground">ZIP</span>
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors">
                <FileDown className="w-4 h-4 text-foreground" />
                <span className="text-sm font-medium text-foreground">PDF</span>
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary hover:bg-primary/90 transition-colors">
                <Printer className="w-4 h-4 text-primary-foreground" />
                <span className="text-sm font-medium text-primary-foreground">Imprimir</span>
              </button>
            </div>
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || selectedTables.length === 0}
          className={`w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 transition-all ${
            isGenerating || selectedTables.length === 0
              ? 'bg-muted text-muted-foreground' 
              : 'bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40'
          }`}
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Gerando {selectedTables.length} QR Codes...
            </>
          ) : isGenerated ? (
            <>
              <Check className="w-5 h-5" />
              Regenerar QR Codes
            </>
          ) : (
            <>
              <QrCode className="w-5 h-5" />
              Gerar {selectedTables.length} QR Codes
            </>
          )}
        </button>
      </div>

      <RestaurantLiquidGlassNav activeTab="tables" onNavigate={onNavigate} />
    </div>
  );
};

export default QRCodeBatchScreenV2;
