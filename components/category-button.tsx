"use client"

import { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface CategoryButtonProps {
  name: string
  icon: ReactNode
  ageRestricted?: boolean
  onClick?: () => void
  /** Horizontal layout: icon + text in a row, single-line truncate. Use in V2 category grid. */
  layout?: "vertical" | "horizontal"
}

export function CategoryButton({
  name,
  icon,
  ageRestricted = false,
  onClick,
  layout = "vertical",
}: CategoryButtonProps) {
  const isHorizontal = layout === "horizontal"

  return (
    <Button
      variant="outline"
      className={cn(
        "relative w-full rounded-lg border bg-card p-3 hover:bg-muted",
        isHorizontal
          ? "h-12 flex-row items-center justify-start gap-2 text-left"
          : "h-24 flex-col gap-2 flex items-center justify-center"
      )}
      onClick={onClick}
    >
      {ageRestricted && (
        <Badge
          variant="secondary"
          className="absolute right-1 top-1 text-[10px] font-semibold"
        >
          21+
        </Badge>
      )}
      <div
        className={cn(
          "flex shrink-0 items-center justify-center",
          isHorizontal ? "h-6 w-6" : "h-8 w-8"
        )}
      >
        {icon}
      </div>
      <span
        className={cn(
          "text-xs font-medium leading-tight",
          isHorizontal
            ? "min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap"
            : "text-center whitespace-normal break-words"
        )}
        style={
          isHorizontal
            ? undefined
            : {
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }
        }
      >
        {name.replace(/\band\b/gi, "&")}
      </span>
    </Button>
  )
}
