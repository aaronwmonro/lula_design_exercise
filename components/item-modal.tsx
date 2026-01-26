"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ItemModalProduct = {
  id: string;
  name: string;
  size?: string | null;
  price: number | null;
  originalPrice?: number | null;
  imageUrl?: string;
  description?: string;
};

function formatPrice(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ItemModalProduct | null;
  onAddToCart: (product: ItemModalProduct, quantity: number) => void;
  initialQuantity?: number;
}

export function ItemModal({
  isOpen,
  onClose,
  product,
  onAddToCart,
  initialQuantity = 1,
}: ItemModalProps) {
  const [quantity, setQuantity] = useState(initialQuantity);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setQuantity(initialQuantity);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, initialQuantity]);

  if (!isOpen || !product) return null;

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    onClose();
  };

  const totalPrice = (product.price ?? 0) * quantity;

  return (
    <>
      <button
        type="button"
        aria-label="Close item modal"
        className="fixed inset-0 z-50 bg-black/25"
        onClick={onClose}
      />
      <div
        className="fixed top-[24px] inset-x-0 bottom-0 z-50 flex flex-col rounded-t-2xl bg-background shadow-lg"
        role="dialog"
        aria-labelledby="item-modal-title"
        aria-modal="true"
      >
        {/* Scrollable content */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {/* Product Image */}
          <div className="relative aspect-square w-full bg-white overflow-hidden flex items-center justify-center">
            {product.imageUrl ? (
              <div className="relative w-4/5 aspect-square">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover rounded-lg"
                  sizes="80vw"
                  unoptimized
                />
              </div>
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 text-muted-foreground">
                <span className="text-sm font-medium">Product Image</span>
              </div>
            )}
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 shrink-0 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
              onClick={onClose}
              aria-label="Close item modal"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Product Details */}
          <div className="px-5 py-4 space-y-4">
            {/* Name and Size */}
            <div className="space-y-1">
              <h3 className="text-xl font-bold">{product.name}</h3>
              {product.size && (
                <p className="text-sm text-muted-foreground">{product.size}</p>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice != null &&
                product.originalPrice !== product.price && (
                  <span className="text-base text-muted-foreground line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Description</h4>
                <p className="text-sm text-muted-foreground">
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer: Quantity Selector and Add to Cart */}
        <div className="shrink-0 border-t bg-background px-5 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center rounded-md border">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 shrink-0 rounded-none border-r hover:bg-muted"
                onClick={() => handleQuantityChange(-1)}
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div
                className="flex h-10 min-w-12 items-center justify-center bg-muted/30 px-3 text-base font-medium"
                role="status"
                aria-label={`Quantity: ${quantity}`}
              >
                {quantity}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 shrink-0 rounded-none border-l hover:bg-muted"
                onClick={() => handleQuantityChange(1)}
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button
              className="flex-1 gap-2 bg-foreground text-background hover:bg-foreground/90 justify-between h-12 px-3 text-base"
              size="lg"
              onClick={handleAddToCart}
            >
              <span className="font-semibold">{formatPrice(totalPrice)}</span>
              <span className="font-semibold">Add to Cart</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
