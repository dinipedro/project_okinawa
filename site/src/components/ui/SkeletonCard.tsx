import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  lines?: number;
  hasImage?: boolean;
  className?: string;
}

const SkeletonCard = ({ lines = 3, hasImage = false, className }: SkeletonCardProps) => (
  <div
    className={cn(
      "rounded-xl border border-border bg-card p-6 animate-pulse",
      className
    )}
    role="status"
    aria-label="Carregando conteúdo"
  >
    {hasImage && (
      <div className="h-40 w-full rounded-lg bg-muted mb-4" />
    )}
    <div className="h-5 w-3/4 rounded bg-muted mb-3" />
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className={cn("h-4 rounded bg-muted mb-2", i === lines - 1 ? "w-1/2" : "w-full")}
      />
    ))}
  </div>
);

export default SkeletonCard;
