import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

const variantClasses: Record<string, string> = {
  default:
    "border border-border bg-primary text-primary-foreground hover:bg-primary/80",
  secondary:
    "border border-border bg-secondary text-secondary-foreground hover:bg-secondary/80",
  destructive:
    "border border-border bg-destructive text-destructive-foreground hover:bg-destructive/80",
  outline:
    "text-foreground border border-border",
  ghost: "hover:bg-accent hover:text-accent-foreground",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  variant?: keyof typeof variantClasses;
}) {
  return (
    <div
      className={cn(
        "flex w-fit items-center rounded-md px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
