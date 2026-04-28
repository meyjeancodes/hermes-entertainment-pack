import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

const variantClasses: Record<string, string> = {
  default:
    "bg-primary text-primary-foreground hover:bg-primary/90 border border-border",
  destructive:
    "bg-destructive text-destructive-foreground hover:bg-destructive/90 border border-border",
  outline:
    "border border-border bg-background hover:bg-accent hover:text-accent-foreground",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  link: "text-primary underline-offset-4 hover:underline",
};

const sizeClasses: Record<string, string> = {
  default: "h-9 px-3 py-1",
  sm: "h-7 px-2 text-xs",
  lg: "h-10 px-4 text-sm",
  icon: "h-9 w-9 p-0",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variantClasses;
  size?: keyof typeof sizeClasses;
  children?: ReactNode;
};

export function Button({
  className,
  variant = "default",
  size = "default",
  disabled = false,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    variantClasses[variant],
    sizeClasses[size],
    className
  );

  return (
    <button className={classes} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
