import * as React from "react"
import { cn } from "@/lib/utils"

const Container = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"
  }
>(({ className, size = "lg", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "mx-auto px-4 sm:px-6",
      {
        "max-w-screen-sm": size === "sm",
        "max-w-screen-md": size === "md",
        "max-w-screen-lg": size === "lg",
        "max-w-screen-xl": size === "xl",
        "max-w-screen-2xl": size === "2xl",
        "max-w-full": size === "full",
      },
      className
    )}
    {...props}
  />
))
Container.displayName = "Container"

export { Container }