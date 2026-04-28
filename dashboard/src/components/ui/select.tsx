import { cn } from "@/lib/utils";
import type { SelectHTMLAttributes, ReactNode } from "react";

export function Select({
  value,
  onValueChange,
  children,
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className={cn(
        "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function SelectOption({
  value,
  children,
  className,
  disabled = false,
}: {
  value: string;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <option
      value={value}
      disabled={disabled}
      className={cn("cursor-pointer", className)}
    >
      {children}
    </option>
  );
}
