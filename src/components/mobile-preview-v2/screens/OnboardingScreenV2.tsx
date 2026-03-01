import { FC, useState } from 'react';
import { Sparkles, MapPin, Wallet, Heart, ArrowRight } from 'lucide-react';

interface OnboardingScreenV2Props {
  onNavigate: (screen: string) => void;
}

const slides = [
  {
    icon: Sparkles,
    title: "Experiências\nÚnicas",
    description: "Descubra momentos extraordinários em cada visita",
  },
  {
    icon: MapPin,
    title: "Sempre\nPerto",
    description: "Os melhores lugares selecionados na sua região",
  },
  {
    icon: Wallet,
    title: "Simples\ne Rápido",
    description: "Pague, divida e acumule pontos sem complicação",
  },
  {
    icon: Heart,
    title: "Feito\npara Você",
    description: "Recomendações personalizadas ao seu gosto",
  },
];

const OnboardingScreenV2: FC<OnboardingScreenV2Props> = ({ onNavigate }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onNavigate('login');
    }
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-32 left-0 w-48 h-48 bg-gradient-to-tr from-primary/5 to-transparent rounded-full blur-3xl" />
      
      {/* Skip button */}
      <div className="px-6 pt-6">
        <button 
          onClick={() => onNavigate('login')}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Pular
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-10">
        {/* Icon */}
        <div className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-12 shadow-lg shadow-primary/20">
          <Icon className="w-10 h-10 text-primary-foreground" strokeWidth={1.5} />
        </div>

        {/* Title with line break for elegance */}
        <h1 className="text-4xl font-bold text-foreground text-center leading-tight mb-4 whitespace-pre-line">
          {slide.title}
        </h1>
        
        {/* Description */}
        <p className="text-muted-foreground text-center text-base leading-relaxed max-w-[240px]">
          {slide.description}
        </p>
      </div>

      {/* Bottom section */}
      <div className="px-8 pb-10">
        {/* Minimal progress indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`rounded-full transition-all duration-500 ${
                index === currentSlide 
                  ? 'w-8 h-2 bg-primary' 
                  : 'w-2 h-2 bg-muted-foreground/20 hover:bg-muted-foreground/40'
              }`}
            />
          ))}
        </div>

        {/* Action button */}
        <button
          onClick={nextSlide}
          className="w-full py-4 bg-primary text-primary-foreground font-semibold rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all hover:bg-primary/90"
        >
          {currentSlide < slides.length - 1 ? 'Continuar' : 'Começar'}
          <ArrowRight className="w-5 h-5" />
        </button>
        
        {/* Secondary action */}
        <button
          onClick={() => onNavigate('login')}
          className="w-full py-3 mt-3 text-muted-foreground font-medium text-sm hover:text-foreground transition-colors"
        >
          Já tenho uma conta
        </button>
      </div>
    </div>
  );
};

export default OnboardingScreenV2;
