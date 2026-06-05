import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "destructive";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none disabled:opacity-50",
          variant === "default" && "bg-black text-white hover:bg-black/90",
          variant === "outline" && "border border-slate-200 bg-white hover:bg-slate-50",
          variant === "destructive" && "bg-red-600 text-white hover:bg-red-700",
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
