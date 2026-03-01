import { FC, useState } from 'react';
import { QrCode, Smartphone, Sparkles, Star, ChevronLeft, ChevronRight } from 'lucide-react';

interface QRDesign {
  id: string;
  name: string;
  description: string;
  style: 'minimal' | 'premium' | 'bold' | 'elegant';
}

const designs: QRDesign[] = [
  { id: 'minimal', name: 'Minimal', description: 'Clean e moderno', style: 'minimal' },
  { id: 'premium', name: 'Premium', description: 'Sofisticado com gradiente', style: 'premium' },
  { id: 'bold', name: 'Bold', description: 'Impactante e direto', style: 'bold' },
  { id: 'elegant', name: 'Elegant', description: 'Refinado com detalhes', style: 'elegant' },
];

const QRCodePreview: FC = () => {
  const [currentDesign, setCurrentDesign] = useState(0);
  const [restaurantName, setRestaurantName] = useState('Seu Restaurante');
  const [tableNumber, setTableNumber] = useState('12');

  const nextDesign = () => setCurrentDesign((prev) => (prev + 1) % designs.length);
  const prevDesign = () => setCurrentDesign((prev) => (prev - 1 + designs.length) % designs.length);

  const design = designs[currentDesign];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Material de Mesa
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            QR Codes Premium
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Designs profissionais para suas mesas. Escaneie e experimente a jornada do cliente.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 justify-center">
          <div className="flex-1 max-w-xs">
            <label className="block text-sm font-medium text-foreground mb-2">
              Nome do Restaurante
            </label>
            <input
              type="text"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Ex: Sakura Ramen"
            />
          </div>
          <div className="w-32">
            <label className="block text-sm font-medium text-foreground mb-2">
              Nº da Mesa
            </label>
            <input
              type="text"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="12"
            />
          </div>
        </div>

        {/* Design Selector */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <button
            onClick={prevDesign}
            className="p-3 rounded-full bg-card border border-border hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="text-center min-w-[200px]">
            <p className="text-lg font-semibold text-foreground">{design.name}</p>
            <p className="text-sm text-muted-foreground">{design.description}</p>
          </div>
          <button
            onClick={nextDesign}
            className="p-3 rounded-full bg-card border border-border hover:bg-muted transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* QR Code Preview Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Table Display */}
          <div className="flex items-center justify-center">
            <div className={`
              relative p-8 rounded-3xl shadow-2xl transition-all duration-500
              ${design.style === 'minimal' ? 'bg-card border border-border' : ''}
              ${design.style === 'premium' ? 'bg-gradient-to-br from-primary/90 via-primary to-accent' : ''}
              ${design.style === 'bold' ? 'bg-foreground' : ''}
              ${design.style === 'elegant' ? 'bg-gradient-to-br from-card via-muted to-card border border-primary/20' : ''}
            `}>
              {/* Decorative Elements */}
              {design.style === 'elegant' && (
                <>
                  <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-primary/40 rounded-tl-xl" />
                  <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-primary/40 rounded-tr-xl" />
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-primary/40 rounded-bl-xl" />
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-primary/40 rounded-br-xl" />
                </>
              )}

              {/* Restaurant Name */}
              <div className={`text-center mb-6 ${
                design.style === 'premium' || design.style === 'bold' 
                  ? 'text-primary-foreground' 
                  : 'text-foreground'
              }`}>
                <p className="text-xs uppercase tracking-[0.3em] opacity-70 mb-1">
                  {design.style === 'bold' ? 'ESCANEIE AGORA' : 'Bem-vindo ao'}
                </p>
                <h2 className="text-xl font-bold truncate max-w-[200px]">
                  {restaurantName}
                </h2>
              </div>

              {/* QR Code */}
              <div className={`
                relative w-48 h-48 mx-auto rounded-2xl flex items-center justify-center mb-6
                ${design.style === 'minimal' ? 'bg-muted' : ''}
                ${design.style === 'premium' ? 'bg-white/95 shadow-lg' : ''}
                ${design.style === 'bold' ? 'bg-primary' : ''}
                ${design.style === 'elegant' ? 'bg-background border-2 border-primary/30' : ''}
              `}>
                {/* QR Pattern Simulation */}
                <div className="grid grid-cols-7 gap-1 p-4">
                  {Array.from({ length: 49 }).map((_, i) => {
                    const isCorner = 
                      (i < 3 || (i >= 4 && i < 7)) ||
                      (i >= 7 && i < 10) ||
                      (i >= 14 && i < 17) ||
                      (i >= 35 && i < 38) ||
                      (i >= 42 && i < 45) ||
                      (i >= 46);
                    const isFilled = isCorner || Math.random() > 0.5;
                    
                    return (
                      <div
                        key={i}
                        className={`
                          w-4 h-4 rounded-sm transition-all
                          ${isFilled 
                            ? design.style === 'bold' 
                              ? 'bg-primary-foreground' 
                              : design.style === 'premium'
                                ? 'bg-primary'
                                : 'bg-foreground'
                            : 'bg-transparent'
                          }
                        `}
                      />
                    );
                  })}
                </div>

                {/* Center Icon */}
                <div className={`
                  absolute inset-0 flex items-center justify-center
                `}>
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center
                    ${design.style === 'bold' ? 'bg-primary-foreground' : 'bg-primary'}
                  `}>
                    <Smartphone className={`w-6 h-6 ${
                      design.style === 'bold' ? 'text-primary' : 'text-primary-foreground'
                    }`} />
                  </div>
                </div>
              </div>

              {/* Table Number */}
              <div className={`text-center ${
                design.style === 'premium' || design.style === 'bold' 
                  ? 'text-primary-foreground' 
                  : 'text-foreground'
              }`}>
                <p className="text-xs uppercase tracking-widest opacity-70 mb-1">Mesa</p>
                <p className="text-4xl font-bold">{tableNumber}</p>
              </div>

              {/* CTA */}
              <div className={`
                mt-6 py-3 px-4 rounded-xl text-center text-sm font-medium
                ${design.style === 'minimal' ? 'bg-primary text-primary-foreground' : ''}
                ${design.style === 'premium' ? 'bg-white/20 text-white backdrop-blur-sm' : ''}
                ${design.style === 'bold' ? 'bg-primary text-primary-foreground' : ''}
                ${design.style === 'elegant' ? 'bg-primary/10 text-primary border border-primary/20' : ''}
              `}>
                <div className="flex items-center justify-center gap-2">
                  <QrCode className="w-4 h-4" />
                  <span>Escaneie para fazer seu pedido</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tent Card Version */}
          <div className="flex items-center justify-center">
            <div className="relative">
              {/* Tent Card Structure */}
              <div className={`
                w-64 transform perspective-1000 
                ${design.style === 'minimal' ? 'bg-card' : ''}
                ${design.style === 'premium' ? 'bg-gradient-to-br from-primary to-accent' : ''}
                ${design.style === 'bold' ? 'bg-foreground' : ''}
                ${design.style === 'elegant' ? 'bg-card' : ''}
                rounded-t-2xl shadow-2xl
              `}>
                {/* Front Face */}
                <div className="p-6 border-b border-white/10">
                  {/* Logo Area */}
                  <div className={`
                    flex items-center justify-center gap-2 mb-4
                    ${design.style === 'premium' || design.style === 'bold' 
                      ? 'text-primary-foreground' 
                      : 'text-foreground'}
                  `}>
                    <div className={`
                      w-8 h-8 rounded-lg flex items-center justify-center
                      ${design.style === 'premium' ? 'bg-white/20' : ''}
                      ${design.style === 'bold' ? 'bg-primary' : ''}
                      ${design.style === 'minimal' || design.style === 'elegant' ? 'bg-primary/10' : ''}
                    `}>
                      <Star className={`w-4 h-4 ${
                        design.style === 'minimal' || design.style === 'elegant' 
                          ? 'text-primary' 
                          : 'text-primary-foreground'
                      }`} />
                    </div>
                    <span className="font-semibold text-sm truncate max-w-[140px]">
                      {restaurantName}
                    </span>
                  </div>

                  {/* Mini QR */}
                  <div className={`
                    w-32 h-32 mx-auto rounded-xl flex items-center justify-center mb-4
                    ${design.style === 'premium' ? 'bg-white' : ''}
                    ${design.style === 'bold' ? 'bg-primary' : ''}
                    ${design.style === 'minimal' ? 'bg-muted' : ''}
                    ${design.style === 'elegant' ? 'bg-muted border border-primary/20' : ''}
                  `}>
                    <QrCode className={`w-20 h-20 ${
                      design.style === 'bold' 
                        ? 'text-primary-foreground' 
                        : design.style === 'premium'
                          ? 'text-primary'
                          : 'text-foreground'
                    }`} />
                  </div>

                  {/* Table */}
                  <div className={`
                    text-center
                    ${design.style === 'premium' || design.style === 'bold' 
                      ? 'text-primary-foreground' 
                      : 'text-foreground'}
                  `}>
                    <p className="text-[10px] uppercase tracking-widest opacity-60">Mesa</p>
                    <p className="text-2xl font-bold">{tableNumber}</p>
                  </div>
                </div>

                {/* Bottom CTA */}
                <div className={`
                  py-3 px-4 text-center text-xs font-medium rounded-b-2xl
                  ${design.style === 'minimal' ? 'bg-muted text-muted-foreground' : ''}
                  ${design.style === 'premium' ? 'bg-white/10 text-white/80' : ''}
                  ${design.style === 'bold' ? 'bg-primary text-primary-foreground' : ''}
                  ${design.style === 'elegant' ? 'bg-primary/5 text-primary border-t border-primary/10' : ''}
                `}>
                  Aponte a câmera e faça seu pedido
                </div>
              </div>

              {/* Shadow/Base */}
              <div className="w-56 h-4 mx-auto bg-foreground/10 rounded-full blur-xl -mt-2" />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 rounded-2xl bg-card border border-border">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <QrCode className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Alta Resolução</h3>
            <p className="text-sm text-muted-foreground">
              QR codes vetoriais que funcionam em qualquer tamanho de impressão.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-card border border-border">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Personalizável</h3>
            <p className="text-sm text-muted-foreground">
              Logo do restaurante e cores customizadas para sua marca.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-card border border-border">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Smartphone className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Rastreável</h3>
            <p className="text-sm text-muted-foreground">
              Analytics de escaneamentos por mesa e horário.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Materiais inclusos no programa Founding Partner
          </p>
          <button className="px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
            Solicitar Kit de Materiais
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRCodePreview;
