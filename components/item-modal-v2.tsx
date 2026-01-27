"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";

export type ItemModalV2Product = {
  id: string;
  name: string;
  size?: string | null;
  price: number | null;
  originalPrice?: number | null;
  imageUrl?: string;
  description?: string;
  detailDescription?: string;
  calories?: string;
  ingredients?: string[];
  features?: string[];
  itemDetails?: { label: string; value: string }[];
};

function formatPrice(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

type SizeMeasurement = {
  value: number;
  unitLabel: string;
};

const sizeUnitMap: Record<string, string> = {
  oz: "oz",
  lb: "lb",
  lbs: "lb",
  g: "g",
  kg: "kg",
  ml: "ml",
  l: "L",
};

function getSizeMeasurement(
  size: string | null | undefined,
): SizeMeasurement | null {
  if (!size) return null;
  const match = size.match(/(\d+(?:\.\d+)?)\s*(oz|lb|lbs|g|kg|ml|l)\b/i);
  if (!match) return null;
  const value = Number(match[1]);
  if (Number.isNaN(value)) return null;
  const unitLabel = sizeUnitMap[match[2].toLowerCase()] ?? match[2];
  return { value, unitLabel };
}

const getProductDetails = (product: ItemModalV2Product) => {
  const normalizedName = product.name.toLowerCase();
  const sizeLabel = product.size ?? "N/A";
  const isWater = normalizedName.includes("water");
  const isBottle = normalizedName.includes("bottle");

  const calories =
    product.calories ??
    (isWater ? "0 calories per bottle" : "See packaging for nutrition info");

  const detailDescription =
    product.detailDescription ??
    (isWater
      ? "Vapor distilled water with added electrolytes for a clean, crisp taste."
      : "A convenient, great-tasting item made for quick refreshment and everyday use.");

  const ingredients =
    product.ingredients ??
    (isWater
      ? ["Vapor distilled water", "Electrolytes for taste"]
      : ["See ingredients list on packaging."]);

  const features =
    product.features ??
    (isWater
      ? ["Alkaline water", "Added electrolytes", "Refreshing, smooth finish"]
      : [
          "Ready to enjoy",
          "Great for on-the-go",
          "Quality-checked for freshness",
        ]);

  const itemDetails = product.itemDetails ?? [
    { label: "Size", value: sizeLabel },
    { label: "Package", value: isBottle ? "Bottle" : "Package" },
    {
      label: "Category",
      value: isWater ? "Water" : "Grocery",
    },
  ];

  return {
    calories,
    detailDescription,
    ingredients,
    features,
    itemDetails,
  };
};

interface ItemModalV2Props {
  isOpen: boolean;
  onClose: () => void;
  product: ItemModalV2Product | null;
  onAddToCart: (product: ItemModalV2Product, quantity: number) => void;
  initialQuantity?: number;
  relatedItems?: ItemModalV2Product[];
  promotionItems?: ItemModalV2Product[];
  onSelectProduct?: (product: ItemModalV2Product) => void;
}

export function ItemModalV2({
  isOpen,
  onClose,
  product,
  onAddToCart,
  initialQuantity = 1,
  relatedItems = [],
  promotionItems = [],
  onSelectProduct,
}: ItemModalV2Props) {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [relatedPageIndex, setRelatedPageIndex] = useState(0);
  const [promotionsPageIndex, setPromotionsPageIndex] = useState(0);
  const relatedScrollRef = useRef<HTMLDivElement | null>(null);
  const promotionsScrollRef = useRef<HTMLDivElement | null>(null);

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
  }, [isOpen, initialQuantity, product?.id]);

  useEffect(() => {
    setRelatedPageIndex(0);
    setPromotionsPageIndex(0);
  }, [product?.id]);

  const relatedDisplay = useMemo(() => {
    if (!product || relatedItems.length === 0) return [];

    const tokens = product.name
      .toLowerCase()
      .split(/\s+/)
      .filter((token) => token.length > 2);

    const scored = relatedItems
      .filter((item) => item.id !== product.id)
      .map((item) => {
        const name = item.name.toLowerCase();
        const score = tokens.reduce(
          (sum, token) => sum + (name.includes(token) ? 1 : 0),
          0,
        );
        return { item, score };
      })
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.item.name.localeCompare(b.item.name);
      })
      .map((entry) => entry.item);

    const matched = scored.filter((item) =>
      tokens.some((token) => item.name.toLowerCase().includes(token)),
    );

    return (matched.length ? matched : scored).slice(0, 9);
  }, [product, relatedItems]);

  const promotionsDisplay = useMemo(() => {
    if (!product || promotionItems.length === 0) return [];
    return promotionItems
      .filter((item) => item.id !== product.id)
      .slice(0, 9)
      .map((item) => ({
        ...item,
        originalPrice:
          item.originalPrice ??
          (item.price != null ? item.price + 1.5 : item.price),
      }));
  }, [product?.id, promotionItems]);

  const pageSize = 3;
  const relatedPages = useMemo(() => {
    const pages: ItemModalV2Product[][] = [];
    for (let i = 0; i < relatedDisplay.length; i += pageSize) {
      pages.push(relatedDisplay.slice(i, i + pageSize));
    }
    return pages;
  }, [relatedDisplay]);
  const promotionsPages = useMemo(() => {
    const pages: ItemModalV2Product[][] = [];
    for (let i = 0; i < promotionsDisplay.length; i += pageSize) {
      pages.push(promotionsDisplay.slice(i, i + pageSize));
    }
    return pages;
  }, [promotionsDisplay]);
  const safeRelatedPageIndex = Math.min(
    relatedPageIndex,
    Math.max(relatedPages.length - 1, 0),
  );
  const safePromotionsPageIndex = Math.min(
    promotionsPageIndex,
    Math.max(promotionsPages.length - 1, 0),
  );
  const canScrollRelated = relatedPages.length > 1;
  const canScrollPromotions = promotionsPages.length > 1;

  if (!isOpen || !product) return null;

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    onClose();
  };

  const basePrice = product.price ?? 0;
  const totalPrice = basePrice * quantity;
  const details = getProductDetails(product);
  const upgradeOptions = [
    { quantity: 1, discount: 0 },
    { quantity: 6, discount: 0.05 },
    { quantity: 12, discount: 0.1 },
    { quantity: 24, discount: 0.15 },
  ];
  const maxUpgradeDiscount = Math.max(
    ...upgradeOptions.map((entry) => entry.discount),
  );

  return (
    <>
      <button
        type="button"
        aria-label="Close item modal"
        className="fixed inset-0 z-50 bg-black/25"
        onClick={onClose}
      />
      <div
        className="fixed top-[24px] inset-x-0 bottom-0 z-50 flex flex-col overflow-hidden rounded-t-[16px] bg-background shadow-lg"
        role="dialog"
        aria-labelledby="item-modal-title"
        aria-modal="true"
      >
        {/* Scrollable content */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="sticky top-4 z-10 flex justify-end px-4">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0 rounded-[6px] bg-white hover:bg-white cursor-pointer"
              onClick={onClose}
              aria-label="Close item modal"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {/* Product Image */}
          <div className="relative w-full bg-white overflow-hidden flex items-center justify-center py-6">
            {product.imageUrl ? (
              <div className="relative w-2/5 aspect-square">
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
          </div>

          {/* Product Details */}
          <div className="p-0 space-y-4">
            {/* Header Section */}
            <div className="space-y-3 border-b pb-4 pt-4 px-4 mb-0">
              <div className="space-y-1">
                <h3 className="text-xl font-bold">{product.name}</h3>
                {product.size && (
                  <p className="text-sm text-muted-foreground">
                    {product.size}
                  </p>
                )}
              </div>

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
            </div>

            {/* Upgrade Packs */}
            <div className="space-y-3 px-4 py-4 mb-0 border-b">
              <div className="space-y-1">
                <h4 className="text-base font-semibold">Size</h4>
              </div>
              <div className="grid gap-3 grid-cols-2">
                {upgradeOptions.map((option) => {
                  const baseTotal = basePrice * option.quantity;
                  const upgradeTotal = baseTotal * (1 - option.discount);
                  const perItem = option.quantity
                    ? upgradeTotal / option.quantity
                    : 0;
                  const savingsPerItem = basePrice - perItem;
                  const isSelected = quantity === option.quantity;
                  const isBestDiscount = option.discount === maxUpgradeDiscount;

                  return (
                    <button
                      key={option.quantity}
                      type="button"
                      onClick={() => setQuantity(option.quantity)}
                      className={`flex flex-col gap-2 rounded-[6px] border px-3 py-3 text-left transition ${
                        isSelected
                          ? "border-foreground/70 bg-muted/30 shadow-sm"
                          : "border-border bg-background hover:border-foreground/40"
                      }`}
                      aria-pressed={isSelected}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold">
                            {option.quantity} pack
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                            isBestDiscount
                              ? "bg-red-500 text-white"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          -{Math.round(option.discount * 100)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold">
                          {formatPrice(upgradeTotal)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Save {formatPrice(savingsPerItem)}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bundle Deal */}
            <div className="px-4 pb-4 pt-4 mb-0">
              <div className="rounded-[6px] bg-gradient-to-r from-red-500 to-orange-500 p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">Bundle & Save</p>
                    <p className="text-xs text-white/90">
                      Pair this item with a snack and save 15%.
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-8 bg-white text-red-600 hover:bg-white/90"
                  >
                    Build Bundle
                  </Button>
                </div>
              </div>
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

            <section className="border-t px-4 py-4 mb-0">
              <div className="pb-2 flex w-full items-center justify-between">
                <h2 className="text-sm font-bold">Related Items</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full disabled:opacity-40"
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>

              {relatedDisplay.length ? (
                <div className="flex flex-col gap-3 overflow-visible">
                  <div className="overflow-visible">
                    <div
                      ref={relatedScrollRef}
                      className="flex snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-visible scrollbar-hide"
                      onScroll={(event) => {
                        const target = event.currentTarget;
                        const width = target.clientWidth || 1;
                        const nextIndex = Math.round(target.scrollLeft / width);

                        setRelatedPageIndex(
                          Math.min(
                            Math.max(nextIndex, 0),
                            relatedPages.length - 1,
                          ),
                        );
                      }}
                    >
                      {relatedPages.map((page, pageIndex) => (
                        <div
                          key={`related-page-${pageIndex}`}
                          className="grid min-w-full snap-start grid-cols-3 grid-rows-1 gap-3"
                        >
                          {page.map((item) => (
                            <ProductCard
                              key={item.id}
                              name={item.name}
                              size={item.size ?? undefined}
                              price={formatPrice(item.price)}
                              imageUrl={item.imageUrl}
                              onAdd={() => onAddToCart(item, 1)}
                              onClick={() => onSelectProduct?.(item)}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-full disabled:opacity-40"
                      onClick={() => {
                        const nextIndex = Math.max(safeRelatedPageIndex - 1, 0);
                        const width =
                          relatedScrollRef.current?.clientWidth ?? 0;
                        relatedScrollRef.current?.scrollTo({
                          left: width * nextIndex,
                          behavior: "smooth",
                        });
                        setRelatedPageIndex(nextIndex);
                      }}
                      disabled={!canScrollRelated || safeRelatedPageIndex === 0}
                      aria-label="Scroll related items left"
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </Button>
                    {relatedPages.map((_, index) => (
                      <span
                        key={`related-dot-${index}`}
                        className={`h-1.5 w-1.5 rounded-full ${
                          index === safeRelatedPageIndex
                            ? "bg-foreground"
                            : "bg-muted"
                        }`}
                      />
                    ))}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-full disabled:opacity-40"
                      onClick={() => {
                        const nextIndex = Math.min(
                          safeRelatedPageIndex + 1,
                          relatedPages.length - 1,
                        );
                        const width =
                          relatedScrollRef.current?.clientWidth ?? 0;
                        relatedScrollRef.current?.scrollTo({
                          left: width * nextIndex,
                          behavior: "smooth",
                        });
                        setRelatedPageIndex(nextIndex);
                      }}
                      disabled={
                        !canScrollRelated ||
                        safeRelatedPageIndex >= relatedPages.length - 1
                      }
                      aria-label="Scroll related items right"
                    >
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No related items yet.
                </p>
              )}
            </section>

            <section className="border-t border-b px-4 py-4">
              <div className="pb-2 flex w-full items-center justify-between">
                <h2 className="text-sm font-bold">Promotions</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full disabled:opacity-40"
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>

              {promotionsDisplay.length ? (
                <div className="flex flex-col gap-3 overflow-visible">
                  <div className="overflow-visible">
                    <div
                      ref={promotionsScrollRef}
                      className="flex snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-visible scrollbar-hide"
                      onScroll={(event) => {
                        const target = event.currentTarget;
                        const width = target.clientWidth || 1;
                        const nextIndex = Math.round(target.scrollLeft / width);

                        setPromotionsPageIndex(
                          Math.min(
                            Math.max(nextIndex, 0),
                            promotionsPages.length - 1,
                          ),
                        );
                      }}
                    >
                      {promotionsPages.map((page, pageIndex) => (
                        <div
                          key={`promotions-page-${pageIndex}`}
                          className="grid min-w-full snap-start grid-cols-3 grid-rows-1 gap-3"
                        >
                          {page.map((item) => (
                            <ProductCard
                              key={item.id}
                              name={item.name}
                              size={item.size ?? undefined}
                              price={formatPrice(item.price)}
                              originalPrice={
                                item.originalPrice != null
                                  ? formatPrice(item.originalPrice)
                                  : undefined
                              }
                              imageUrl={item.imageUrl}
                              onAdd={() => onAddToCart(item, 1)}
                              onClick={() => onSelectProduct?.(item)}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-full disabled:opacity-40"
                      onClick={() => {
                        const nextIndex = Math.max(
                          safePromotionsPageIndex - 1,
                          0,
                        );
                        const width =
                          promotionsScrollRef.current?.clientWidth ?? 0;
                        promotionsScrollRef.current?.scrollTo({
                          left: width * nextIndex,
                          behavior: "smooth",
                        });
                        setPromotionsPageIndex(nextIndex);
                      }}
                      disabled={
                        !canScrollPromotions || safePromotionsPageIndex === 0
                      }
                      aria-label="Scroll promotions left"
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </Button>
                    {promotionsPages.map((_, index) => (
                      <span
                        key={`promotions-dot-${index}`}
                        className={`h-1.5 w-1.5 rounded-full ${
                          index === safePromotionsPageIndex
                            ? "bg-foreground"
                            : "bg-muted"
                        }`}
                      />
                    ))}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-full disabled:opacity-40"
                      onClick={() => {
                        const nextIndex = Math.min(
                          safePromotionsPageIndex + 1,
                          promotionsPages.length - 1,
                        );
                        const width =
                          promotionsScrollRef.current?.clientWidth ?? 0;
                        promotionsScrollRef.current?.scrollTo({
                          left: width * nextIndex,
                          behavior: "smooth",
                        });
                        setPromotionsPageIndex(nextIndex);
                      }}
                      disabled={
                        !canScrollPromotions ||
                        safePromotionsPageIndex >= promotionsPages.length - 1
                      }
                      aria-label="Scroll promotions right"
                    >
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No promotions available right now.
                </p>
              )}
            </section>

            {/* Additional Details */}
            <div className="space-y-4 p-4 mb-0">
              <h4 className="text-base font-semibold">Item Details</h4>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Calories</h4>
                <p className="text-sm text-muted-foreground">
                  {details.calories}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Description</h4>
                <p className="text-sm text-muted-foreground">
                  {details.detailDescription}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Ingredients</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {details.ingredients.map((ingredient) => (
                    <li key={ingredient}>{ingredient}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Features</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {details.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Specifics</h4>
                <div className="grid gap-2 text-sm text-muted-foreground">
                  {details.itemDetails.map((detail) => (
                    <div key={detail.label} className="flex justify-between">
                      <span>{detail.label}</span>
                      <span className="text-foreground">{detail.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
