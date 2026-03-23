import { Star, MessageSquare, ThumbsUp, TrendingUp } from "lucide-react";

export const ReviewsScreenV2 = () => {
  const reviews = [
    { id: 1, user: "João S.", rating: 5, comment: "Comida excelente!", date: "Hoje" },
    { id: 2, user: "Maria C.", rating: 4, comment: "Ótimo atendimento", date: "Ontem" },
    { id: 3, user: "Pedro L.", rating: 5, comment: "Voltarei com certeza!", date: "2 dias" },
  ];

  return (
    <div className="h-full bg-gradient-to-b from-muted to-background p-4 overflow-y-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-warning to-primary flex items-center justify-center">
          <Star className="h-5 w-5 text-warning-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground">Avaliações</h1>
          <p className="text-xs text-muted-foreground">4.8 ⭐ (1.2K avaliações)</p>
        </div>
      </div>

      <div className="space-y-3">
        {reviews.map((review) => (
          <div key={review.id} className="p-4 rounded-2xl bg-card/70 backdrop-blur-sm border border-border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-sm">
                  {review.user.charAt(0)}
                </div>
                <span className="font-semibold text-foreground text-sm">{review.user}</span>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 text-warning fill-warning" />
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{review.comment}</p>
            <p className="text-xs text-muted-foreground/70 mt-2">{review.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsScreenV2;
