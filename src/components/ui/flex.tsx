import * as React from "react"
import { cn } from "@/lib/utils"

const Flex = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    direction?: "row" | "col"
    justify?: "start" | "end" | "center" | "between" | "around"
    align?: "start" | "end" | "center" | "baseline" | "stretch"
    gap?: number
    wrap?: "wrap" | "nowrap" | "wrap-reverse"
  }
>(({ 
  className, 
  direction = "row", 
  justify = "start", 
  align = "start", 
  gap = 0,
  wrap = "nowrap",
  ...props 
}, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex",
      direction === "col" && "flex-col",
      {
        "justify-start": justify === "start",
        "justify-end": justify === "end",
        "justify-center": justify === "center",
        "justify-between": justify === "between",
        "justify-around": justify === "around",
        "items-start": align === "start",
        "items-end": align === "end",
        "items-center": align === "center",
        "items-baseline": align === "baseline",
        "items-stretch": align === "stretch",
        "flex-wrap": wrap === "wrap",
        "flex-nowrap": wrap === "nowrap",
        "flex-wrap-reverse": wrap === "wrap-reverse",
      },
      gap > 0 && `gap-${gap}`,
      className
    )}
    {...props}
  />
))
Flex.displayName = "Flex"

export { Flex }