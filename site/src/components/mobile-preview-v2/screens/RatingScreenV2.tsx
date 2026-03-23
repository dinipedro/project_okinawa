import { Star, ThumbsUp, Camera, Send, Sparkles, ChefHat, Clock, Utensils } from "lucide-react";
import { useState } from "react";

export const RatingScreenV2 = () => {
  const [overallRating, setOverallRating] = useState(0);
  const [foodRating, setFoodRating] = useState(0);
  const [serviceRating, setServiceRating] = useState(0);
  const [ambienceRating, setAmbienceRating] = useState(0);
  const [review, setReview] = useState("");

  const order = {
    restaurant: "Sushi Yassu",
    date: "Hoje, 20 de Dezembro",
    items: ["Combo Sushi Premium", "Temaki Salmão", "Gyoza"],
    total: "R$ 189,90",
  };

  const quickTags = [
    "Comida deliciosa",
    "Atendimento excelente",
    "Ambiente agradável",
    "Ótimo custo-benefício",
    "Porções generosas",
    "Rápido",
  ];

  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const RatingStars = ({
    rating,
    setRating,
    size = "large",
  }: {
    rating: number;
    setRating: (r: number) => void;
    size?: "large" | "small";
  }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => setRating(star)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={`${size === "large" ? "h-10 w-10" : "h-6 w-6"} ${
              star <= rating
                ? "text-warning fill-warning"
                : "text-muted-foreground/40"
            }`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <div className="h-full bg-gradient-to-b from-muted to-background overflow-y-auto">
      {/* Header */}
      <div className="p-4 space-y-4">
        <div className="p-4 rounded-2xl bg-card/70 backdrop-blur-xl border border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-2xl">
              🍣
            </div>
            <div>
              <h2 className="font-semibold text-foreground">{order.restaurant}</h2>
              <p className="text-xs text-muted-foreground">{order.date}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {order.items.map((item, i) => (
              <span
                key={i}
                className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 space-y-6 pb-32">
        {/* Overall Rating */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Como foi sua experiência?</h3>
          </div>
          <RatingStars rating={overallRating} setRating={setOverallRating} />
          <p className="text-sm text-muted-foreground">
            {overallRating === 0 && "Toque nas estrelas para avaliar"}
            {overallRating === 1 && "Muito ruim 😞"}
            {overallRating === 2 && "Ruim 😕"}
            {overallRating === 3 && "Regular 😐"}
            {overallRating === 4 && "Bom 😊"}
            {overallRating === 5 && "Excelente! 🤩"}
          </p>
        </div>

        {/* Category Ratings */}
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-card/70 backdrop-blur-sm border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-destructive to-destructive/80 flex items-center justify-center">
                  <ChefHat className="h-4 w-4 text-destructive-foreground" />
                </div>
                <span className="text-sm font-medium text-foreground">Comida</span>
              </div>
              <RatingStars rating={foodRating} setRating={setFoodRating} size="small" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card/70 backdrop-blur-sm border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-info to-info/80 flex items-center justify-center">
                  <Utensils className="h-4 w-4 text-info-foreground" />
                </div>
                <span className="text-sm font-medium text-foreground">Atendimento</span>
              </div>
              <RatingStars rating={serviceRating} setRating={setServiceRating} size="small" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card/70 backdrop-blur-sm border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-secondary-foreground" />
                </div>
                <span className="text-sm font-medium text-foreground">Ambiente</span>
              </div>
              <RatingStars rating={ambienceRating} setRating={setAmbienceRating} size="small" />
            </div>
          </div>
        </div>

        {/* Quick Tags */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-success to-secondary flex items-center justify-center">
              <ThumbsUp className="h-3 w-3 text-success-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground">Destaques</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-2 rounded-full text-xs font-medium transition-all ${
                  selectedTags.includes(tag)
                    ? "bg-gradient-to-r from-primary to-accent text-primary-foreground"
                    : "bg-card/70 text-muted-foreground border border-border"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Review Text */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-destructive to-destructive/80 flex items-center justify-center">
              <Send className="h-3 w-3 text-destructive-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground">Seu comentário</span>
          </div>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Conte mais sobre sua experiência..."
            className="w-full p-4 rounded-2xl bg-card/80 backdrop-blur-sm border border-border text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
            rows={4}
          />
        </div>

        {/* Add Photos */}
        <button className="w-full p-4 rounded-2xl border-2 border-dashed border-border flex items-center justify-center gap-2 text-muted-foreground">
          <Camera className="h-5 w-5" />
          <span className="text-sm">Adicionar fotos</span>
        </button>
      </div>

      {/* Submit Button */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur-xl border-t border-border">
        <button className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold shadow-lg flex items-center justify-center gap-2">
          <Send className="h-5 w-5" />
          Enviar Avaliação
        </button>
      </div>
    </div>
  );
};

export default RatingScreenV2;
