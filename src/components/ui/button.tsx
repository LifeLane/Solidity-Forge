
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-base font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0", // Base size for SVG
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90", // Standard futuristic button
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: // This will be our minimal CTA base
          "border border-primary bg-transparent text-primary hover:text-primary-foreground hover:bg-gradient-to-r from-primary to-accent",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "text-primary hover:bg-primary/10 hover:text-primary", // Subtle interaction
        link: "text-primary underline-offset-4 hover:underline hover:text-accent",
        // New Futuristic Variants from spec
        primaryCta: "font-space-mono uppercase text-primary-foreground rounded-lg transition-all duration-300 ease-in-out bg-gradient-to-r from-primary to-accent hover:scale-[1.03] hover:shadow-[0_0_12px_2px_hsla(var(--primary-rgb),0.5),_0_0_24px_4px_hsla(var(--accent-rgb),0.3)]",
        terminalCta: "font-cli text-primary border border-primary rounded-md relative overflow-hidden bg-transparent hover:bg-primary/5",
        minimalCta: "font-inter text-primary border border-primary rounded-lg relative overflow-hidden transition-all duration-300 bg-transparent hover:border-transparent hover:bg-gradient-to-r from-primary to-accent hover:text-primary-foreground hover:animate-gradient-border-pulse"

      },
      size: {
        default: "h-11 px-6 py-3", // Larger default
        sm: "h-10 rounded-md px-4 text-sm", // Slightly larger sm
        lg: "h-12 rounded-lg px-8 text-lg", // Larger lg
        icon: "h-11 w-11", // Larger icon button
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
