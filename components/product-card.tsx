"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ProductCardProps {
  name: string;
  size?: string;
  price: string;
  originalPrice?: string;
  imageUrl?: string;
  onAdd?: () => void;
  onClick?: () => void;
  className?: string;
}

export function ProductCard({
  name,
  size,
  price,
  originalPrice,
  imageUrl,
  onAdd,
  onClick,
  className,
}: ProductCardProps) {
  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Don't trigger card click if clicking the plus button
    const target = e.target as HTMLElement;
    if (target.closest("button")) {
      return;
    }
    onClick?.();
  };

  const handlePlusClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onAdd?.();
  };

  return (
    <div
      className={cn(
        "relative flex w-full flex-col gap-2 rounded-lg border bg-card p-3",
        onClick && "cursor-pointer",
        className,
      )}
      onClick={handleCardClick}
    >
      {/* Quick Add Button */}
      <Button
        variant="default"
        size="icon"
        className="absolute right-2 top-2 z-10 h-8 w-8 rounded-md bg-foreground text-background shadow-sm hover:bg-foreground/90"
        onClick={handlePlusClick}
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
        <h3 className="line-clamp-2 text-xs font-medium leading-tight">
          {name}
        </h3>
        {size && <p className="text-xs text-muted-foreground">{size}</p>}
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
  );
}
