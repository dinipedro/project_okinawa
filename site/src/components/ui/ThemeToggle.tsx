import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function ThemeToggle({ className, size = "md" }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const sizeClasses = {
    sm: "h-8 w-14",
    md: "h-10 w-[4.5rem]",
    lg: "h-12 w-20",
  };

  const iconSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const knobSizes = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  const translateClasses = {
    sm: isDark ? "translate-x-6" : "translate-x-0",
    md: isDark ? "translate-x-7" : "translate-x-0",
    lg: isDark ? "translate-x-8" : "translate-x-0",
  };

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative rounded-full p-1 transition-all duration-300",
        "bg-muted hover:bg-muted/80",
        "border border-border",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        sizeClasses[size],
        className
      )}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {/* Background icons */}
      <div className="absolute inset-0 flex items-center justify-between px-2">
        <Sun 
          className={cn(
            iconSizes[size],
            "transition-all duration-300",
            isDark ? "text-muted-foreground/30" : "text-accent"
          )} 
        />
        <Moon 
          className={cn(
            iconSizes[size],
            "transition-all duration-300",
            isDark ? "text-secondary" : "text-muted-foreground/30"
          )} 
        />
      </div>

      {/* Sliding knob */}
      <div
        className={cn(
          "relative z-10 rounded-full transition-all duration-300",
          "bg-background shadow-md",
          "flex items-center justify-center",
          knobSizes[size],
          translateClasses[size]
        )}
      >
        {isDark ? (
          <Moon className={cn(iconSizes[size], "text-secondary")} />
        ) : (
          <Sun className={cn(iconSizes[size], "text-accent")} />
        )}
      </div>
    </button>
  );
}
