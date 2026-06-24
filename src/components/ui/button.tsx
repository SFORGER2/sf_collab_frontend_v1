import { forwardRef, type ButtonHTMLAttributes } from "react"
import { cn } from "../../lib/utils"

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "icon"
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none",
          {
            "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-[0.97] relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/15 dark:before:via-black/10 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-700":
              variant === "default",
            "border border-border bg-transparent hover:bg-secondary hover:text-secondary-foreground active:scale-[0.97]":
              variant === "outline",
            "bg-transparent hover:bg-secondary hover:text-secondary-foreground active:scale-[0.97]":
              variant === "ghost",

          },
          {
            "h-9 rounded-lg px-4": size === "default",
            "h-8 rounded-md px-3 text-xs": size === "sm",
            "h-9 w-9 rounded-lg": size === "icon",
          },
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

export { Button }
