import { useState } from "react";
import { Sparkles, MapPin, Heart, ArrowRight } from "lucide-react";

const slides = [
  {
    icon: Sparkles,
    title: "Experiências Incríveis",
    subtitle: "Descubra os melhores momentos perto de você",
    gradient: "from-primary to-primary-light",
  },
  {
    icon: MapPin,
    title: "Perto de Você",
    subtitle: "Encontre estabelecimentos selecionados na sua região",
    gradient: "from-secondary to-secondary-light",
  },
  {
    icon: Heart,
    title: "Feito para Você",
    subtitle: "Recomendações personalizadas baseadas no seu gosto",
    gradient: "from-accent to-accent-light",
  },
];

export const OnboardingScreen = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        {/* Icon */}
        <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${slides[currentSlide].gradient} flex items-center justify-center mb-8 animate-float`}>
          {(() => {
            const Icon = slides[currentSlide].icon;
            return <Icon className="h-12 w-12 text-white" />;
          })()}
        </div>

        {/* Text */}
        <h1 className="font-display text-2xl font-bold mb-3">
          {slides[currentSlide].title}
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {slides[currentSlide].subtitle}
        </p>
      </div>

      {/* Bottom Section */}
      <div className="px-8 pb-8">
        {/* Dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentSlide === index
                  ? "w-8 bg-primary"
                  : "w-2 bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors">
            Começar
            <ArrowRight className="h-5 w-5" />
          </button>
          <button className="w-full py-4 rounded-2xl text-muted-foreground font-medium hover:text-foreground transition-colors">
            Já tenho conta
          </button>
        </div>
      </div>
    </div>
  );
};
