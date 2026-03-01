import { useState } from "react";
import { Star, Camera, Send, ThumbsUp, ThumbsDown } from "lucide-react";

const orderDetails = {
  restaurant: "Sakura Ramen",
  items: ["Ramen Tonkotsu", "Gyoza (6un)", "Refrigerante"],
  total: "R$ 67,90",
  date: "Hoje, 14:30"
};

const quickTags = [
  "Comida deliciosa",
  "Entrega rápida", 
  "Boa apresentação",
  "Atendimento excelente",
  "Porções generosas",
  "Preço justo"
];

export const RatingScreen = () => {
  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-y-auto scrollbar-thin">
      {/* Header */}
      <div className="px-5 py-6 bg-gradient-to-br from-secondary to-accent text-secondary-foreground text-center">
        <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3">
          <Star className="h-8 w-8" />
        </div>
        <h1 className="font-display text-xl font-bold mb-1">Avalie seu pedido</h1>
        <p className="text-sm opacity-80">{orderDetails.restaurant}</p>
      </div>

      {/* Order Summary */}
      <div className="px-5 py-4 -mt-4">
        <div className="p-4 rounded-2xl bg-card border border-border shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">{orderDetails.date}</span>
            <span className="font-bold text-primary">{orderDetails.total}</span>
          </div>
          <p className="text-sm">{orderDetails.items.join(" • ")}</p>
        </div>
      </div>

      {/* Star Rating */}
      <div className="px-5 py-4 text-center">
        <p className="text-sm text-muted-foreground mb-3">Como foi sua experiência?</p>
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button 
              key={star}
              onClick={() => setRating(star)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star 
                className={`h-10 w-10 transition-colors ${
                  star <= rating ? 'text-accent fill-accent' : 'text-muted'
                }`} 
              />
            </button>
          ))}
        </div>
        <p className="text-sm font-medium mt-2">
          {rating === 0 && "Toque para avaliar"}
          {rating === 1 && "Péssimo 😢"}
          {rating === 2 && "Ruim 😕"}
          {rating === 3 && "Regular 😐"}
          {rating === 4 && "Bom 😊"}
          {rating === 5 && "Excelente! 🤩"}
        </p>
      </div>

      {/* Quick Tags */}
      {rating > 0 && (
        <div className="px-5 py-4">
          <p className="text-sm text-muted-foreground mb-3">O que você mais gostou?</p>
          <div className="flex flex-wrap gap-2">
            {quickTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-2 rounded-full text-sm transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Comment */}
      {rating > 0 && (
        <div className="px-5 py-4 flex-1">
          <p className="text-sm text-muted-foreground mb-3">Deixe um comentário (opcional)</p>
          <div className="relative">
            <textarea 
              placeholder="Conte-nos mais sobre sua experiência..."
              className="w-full h-24 p-4 rounded-xl bg-muted border-0 text-sm resize-none"
            />
            <button className="absolute bottom-3 right-3 p-2 rounded-lg bg-secondary/10 text-secondary">
              <Camera className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Delivery Rating */}
      {rating > 0 && (
        <div className="px-5 py-4">
          <p className="text-sm text-muted-foreground mb-3">Como foi a entrega?</p>
          <div className="flex gap-3">
            <button className="flex-1 p-4 rounded-xl bg-success/10 border-2 border-success flex flex-col items-center gap-2">
              <ThumbsUp className="h-6 w-6 text-success" />
              <span className="text-sm font-medium">Ótima</span>
            </button>
            <button className="flex-1 p-4 rounded-xl bg-muted border-2 border-transparent flex flex-col items-center gap-2">
              <ThumbsDown className="h-6 w-6 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Ruim</span>
            </button>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="sticky bottom-0 p-4 bg-background border-t border-border">
        <button 
          disabled={rating === 0}
          className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors ${
            rating > 0 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-muted-foreground'
          }`}
        >
          <Send className="h-5 w-5" />
          Enviar Avaliação
        </button>
      </div>
    </div>
  );
};
