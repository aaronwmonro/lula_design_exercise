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
}

export function CategoryButton({
  name,
  icon,
  ageRestricted = false,
  onClick,
}: CategoryButtonProps) {
  return (
    <Button
      variant="outline"
      className={cn(
        "relative h-24 w-full flex-col gap-2 rounded-lg border bg-card p-3 hover:bg-muted",
        "flex items-center justify-center"
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
      <div className="flex h-8 w-8 items-center justify-center">{icon}</div>
      <span
        className="text-center text-xs font-medium leading-tight whitespace-normal break-words"
        style={{
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {name.replace(/\band\b/gi, "&")}
      </span>
    </Button>
  )
}
