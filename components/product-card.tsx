"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface ProductCardProps {
  name: string
  size?: string
  price: string
  originalPrice?: string
  imageUrl?: string
  onAdd?: () => void
  className?: string
}

export function ProductCard({
  name,
  size,
  price,
  originalPrice,
  imageUrl,
  onAdd,
  className,
}: ProductCardProps) {
  return (
    <div
      className={cn(
        "relative flex min-w-[140px] flex-col gap-2 rounded-lg border bg-card p-3",
        className
      )}
    >
      {/* Quick Add Button */}
      <Button
        variant="default"
        size="icon"
        className="absolute right-2 top-2 z-10 h-8 w-8 rounded-md bg-foreground text-background shadow-sm hover:bg-foreground/90"
        onClick={onAdd}
      >
        <Plus className="h-4 w-4" />
      </Button>

      {/* Product Image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-md bg-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover"
            sizes="140px"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 text-muted-foreground">
            <span className="text-xs font-medium">Product</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-col gap-1">
        <h3 className="line-clamp-2 text-sm font-medium leading-tight">
          {name}
        </h3>
        {size && (
          <p className="text-xs text-muted-foreground">{size}</p>
        )}
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold">{price}</span>
          {originalPrice && originalPrice !== price && (
            <span className="text-xs text-muted-foreground line-through">
              {originalPrice}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
