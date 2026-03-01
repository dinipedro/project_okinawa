import { Star, MessageCircle, ThumbsUp, Flag, Filter } from "lucide-react";

const stats = {
  average: 4.8,
  total: 1247,
  breakdown: [
    { stars: 5, percent: 78 },
    { stars: 4, percent: 15 },
    { stars: 3, percent: 5 },
    { stars: 2, percent: 1 },
    { stars: 1, percent: 1 },
  ]
};

const reviews = [
  {
    id: 1,
    user: "Maria S.",
    avatar: "M",
    rating: 5,
    date: "Hoje",
    text: "Melhor ramen da cidade! Atendimento impecável e ambiente aconchegante.",
    helpful: 12,
    replied: true
  },
  {
    id: 2,
    user: "João P.",
    avatar: "J",
    rating: 4,
    date: "Ontem",
    text: "Comida excelente, mas a espera foi um pouco longa. Voltarei com certeza!",
    helpful: 5,
    replied: false
  },
  {
    id: 3,
    user: "Ana L.",
    avatar: "A",
    rating: 5,
    date: "3 dias",
    text: "Simplesmente perfeito! O gyoza derrete na boca. Super recomendo!",
    helpful: 8,
    replied: true
  },
];

export const ReviewsScreen = () => {
  return (
    <div className="h-full flex flex-col bg-background overflow-y-auto scrollbar-thin">
      {/* Header */}
      <div className="px-5 py-4 bg-card border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-display text-xl font-bold">Avaliações</h1>
          <button className="p-2 rounded-lg bg-muted">
            <Filter className="h-5 w-5" />
          </button>
        </div>

        {/* Stats */}
        <div className="flex gap-4">
          <div className="text-center">
            <div className="flex items-center gap-1 justify-center mb-1">
              <span className="text-4xl font-bold">{stats.average}</span>
              <Star className="h-6 w-6 text-accent fill-accent" />
            </div>
            <p className="text-xs text-muted-foreground">{stats.total} avaliações</p>
          </div>
          <div className="flex-1 space-y-1">
            {stats.breakdown.map((b) => (
              <div key={b.stars} className="flex items-center gap-2">
                <span className="text-xs w-3">{b.stars}</span>
                <Star className="h-3 w-3 text-accent fill-accent" />
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-accent rounded-full"
                    style={{ width: `${b.percent}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-8">{b.percent}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="flex-1 px-5 py-4 space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="p-4 rounded-2xl bg-card border border-border">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold">
                  {review.avatar}
                </div>
                <div>
                  <p className="font-medium">{review.user}</p>
                  <p className="text-xs text-muted-foreground">{review.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${i < review.rating ? 'text-accent fill-accent' : 'text-muted'}`} 
                  />
                ))}
              </div>
            </div>

            {/* Text */}
            <p className="text-sm mb-3">{review.text}</p>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-1 text-sm text-muted-foreground">
                  <ThumbsUp className="h-4 w-4" />
                  <span>{review.helpful}</span>
                </button>
                <button className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Flag className="h-4 w-4" />
                </button>
              </div>
              <button className={`flex items-center gap-1 text-sm ${review.replied ? 'text-success' : 'text-primary'}`}>
                <MessageCircle className="h-4 w-4" />
                <span>{review.replied ? 'Respondido' : 'Responder'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
