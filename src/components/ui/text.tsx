import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const textVariants = cva("text-foreground", {
  variants: {
    variant: {
      default: "text-base",
      h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
      h2: "scroll-m-20 text-3xl font-semibold tracking-tight",
      h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
      h4: "scroll-m-20 text-xl font-semibold tracking-tight",
      p: "leading-7",
      blockquote: "mt-6 border-l-2 pl-6 italic",
      small: "text-sm font-medium leading-none",
      muted: "text-sm text-muted-foreground",
      large: "text-lg font-semibold",
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    },
  },
  defaultVariants: {
    variant: "default",
    weight: "normal",
    align: "left",
  },
})

export interface TextProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof textVariants> {
  as?: keyof JSX.IntrinsicElements
}

const Text = React.forwardRef<HTMLElement, TextProps>(
  ({ className, variant, weight, align, as = "p", ...props }, ref) => {
    const Comp = as

    return (
      <Comp
        ref={ref}
        className={cn(textVariants({ variant, weight, align, className }))}
        {...props}
      />
    )
  }
)
Text.displayName = "Text"

export { Text, textVariants }