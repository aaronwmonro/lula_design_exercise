"use client";

import { useEffect } from "react";
import Image from "next/image";
import { X, PenLine, Minus, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export type CartItem = {
  id: string;
  name: string;
  size?: string | null;
  price: number | null;
  originalPrice?: number | null;
  imageUrl?: string;
  quantity: number;
};

function formatPrice(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove?: (id: string) => void;
  storeName?: string;
  storeAddress?: string;
  deliveryFee?: number;
  onStoreClick?: () => void;
}

export function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  storeName = "East Market",
  storeAddress = "456 Maple Avenue, Springfield, USA 1234",
  deliveryFee: deliveryFeeAmount = 1.99,
  onStoreClick,
}: CartDrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const subtotal = items.reduce(
    (sum, i) => sum + (i.price ?? 0) * i.quantity,
    0
  );
  const deliveryFee = items.length > 0 ? deliveryFeeAmount : 0;
  const feesTaxes = 0;
  const discount = 0;
  const total = Math.max(0, subtotal + deliveryFee + feesTaxes - discount);
  const cartItemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  if (!isOpen) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Close cart"
        className="fixed inset-0 z-50 bg-black/25"
        onClick={onClose}
      />
      <div
        className="fixed top-[24px] inset-x-0 bottom-0 z-50 flex flex-col rounded-t-2xl bg-background shadow-lg"
        role="dialog"
        aria-labelledby="cart-title"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between gap-4 border-b px-5 py-4">
          <h2 id="cart-title" className="text-lg font-semibold">
            Your Cart
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 rounded-full"
            onClick={onClose}
            aria-label="Close cart"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Scrollable content */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {/* Store */}
          <div className="border-b px-5 py-4">
            <h3 className="mb-3 text-sm font-semibold">Store</h3>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-500 shadow-sm">
                <span className="text-lg font-bold text-white">K</span>
              </div>
              <div className="min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => {
                    onStoreClick?.();
                    onClose();
                  }}
                  className="flex items-center gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <span className="text-sm font-semibold">{storeName}</span>
                  <PenLine className="h-4 w-4 shrink-0 text-muted-foreground" />
                </button>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {storeAddress}
                </p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="border-b px-5 py-4">
            <h3 className="mb-3 text-sm font-semibold">Items</h3>
            {items.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Your cart is empty. Add items from the store.
              </p>
            ) : (
              <ul className="space-y-4">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex gap-3 border-b border-border pb-4 last:border-0 last:pb-0 first:pt-0 [&:not(:first-child)]:pt-4"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 text-muted-foreground">
                          <span className="text-xs">Product</span>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <p className="line-clamp-2 text-sm font-medium">
                            {item.name}
                          </p>
                          {item.size && (
                            <span className="text-xs text-muted-foreground">
                              {item.size}
                            </span>
                          )}
                        </div>
                        <div className="flex shrink-0 flex-wrap items-baseline justify-end gap-1.5">
                          <span className="text-sm font-semibold">
                            {formatPrice((item.price ?? 0) * item.quantity)}
                          </span>
                          {item.originalPrice != null &&
                            item.originalPrice !== item.price && (
                              <span className="text-xs text-muted-foreground line-through">
                                {formatPrice(item.originalPrice * item.quantity)}
                              </span>
                            )}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <button
                          type="button"
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
                          aria-label={`Edit ${item.name}`}
                        >
                          <PenLine className="h-4 w-4" />
                        </button>
                        <div className="flex items-center rounded-md border">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0 rounded-none border-r hover:bg-muted"
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <div
                            className="flex h-8 min-w-8 items-center justify-center bg-muted/30 px-2 text-sm font-medium"
                            role="status"
                            aria-label={`Quantity: ${item.quantity}`}
                          >
                            {item.quantity}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0 rounded-none border-l hover:bg-muted"
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Details */}
          <div className="border-b px-5 py-4">
            <h3 className="mb-3 text-sm font-semibold">Details</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Sub Total</dt>
                <dd className="font-medium">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Delivery Fee</dt>
                <dd className="font-medium">{formatPrice(deliveryFee)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Fees & Taxes</dt>
                <dd className="font-medium">{formatPrice(feesTaxes)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Discount</dt>
                <dd className="font-medium">{formatPrice(discount)}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Footer: Total + Checkout */}
        <div className="shrink-0 border-t bg-background px-5 py-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-base font-semibold">Total</span>
            <span className="text-base font-semibold">
              {formatPrice(total)}
            </span>
          </div>
          <Button
            className="w-full gap-2 bg-foreground text-background hover:bg-foreground/90"
            size="lg"
            disabled={cartItemCount === 0}
            onClick={() => {
              /* Checkout */
            }}
          >
            <Check className="h-5 w-5" />
            Checkout
          </Button>
        </div>
      </div>
    </>
  );
}
