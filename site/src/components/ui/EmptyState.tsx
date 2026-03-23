import { ReactNode } from "react";
import { SearchX, AlertTriangle, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  variant?: "default" | "search" | "error";
  className?: string;
}

const variantIcons = {
  default: <FolderOpen className="h-12 w-12 text-muted-foreground/50" />,
  search: <SearchX className="h-12 w-12 text-muted-foreground/50" />,
  error: <AlertTriangle className="h-12 w-12 text-destructive/50" />,
};

const EmptyState = ({
  icon,
  title,
  description,
  action,
  variant = "default",
  className,
}: EmptyStateProps) => (
  <div
    className={cn(
      "flex flex-col items-center justify-center py-16 px-6 text-center",
      className
    )}
    role="status"
    aria-label={title}
  >
    <div className="mb-4">{icon || variantIcons[variant]}</div>
    <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
    {description && (
      <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
    )}
    {action}
  </div>
);

export default EmptyState;
