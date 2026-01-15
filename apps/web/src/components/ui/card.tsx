import { cn } from "@/lib/utils"
import * as React from "react"

const Card = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "rounded-lg border bg-zinc-950 text-zinc-100 shadow-sm",
            className
        )}
        {...props}
    />
))
Card.displayName = "Card"

export { Card }
