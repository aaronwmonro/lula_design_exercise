"use client"

import { useState } from "react"
import {
  Menu,
  ChevronDown,
  ShoppingCart,
  X,
  MapPin,
  LocateFixed,
  Search,
  Edit,
  PenLine,
  } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface StoreHeaderProps {
  storeName?: string
  deliveryTime?: string
  deliveryFee?: string
  cartItemCount?: number
}

export function StoreHeader({
  storeName = "East Market",
  deliveryTime = "15-20 min",
  deliveryFee = "$1.99 delivery",
  cartItemCount = 0,
}: StoreHeaderProps) {
  const stores = [
    {
      name: storeName,
      address: "123 Main St",
      distance: "0.8 mi",
      eta: deliveryTime,
      deliveryFeeTotal: deliveryFee,
    },
    {
      name: "Lula Mart - Westside",
      address: "456 West Ave",
      distance: "3.1 mi",
      eta: "25-35 min",
      deliveryFeeTotal: "$2.49 delivery",
    },
  ]
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedStore, setSelectedStore] = useState(stores[0])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="flex items-center justify-between px-4 py-3 gap-3">
        {/* Left: Menu */}
        <Button variant="outline" size="icon" className="h-10 w-10">
          <Menu className="h-8 w-8" />
        </Button>

        {/* Center: Store Info */}
        <div className="flex flex-1 flex-row items-center justify-start gap-3 self-center">
          {/* Store Logo */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-500 shadow-sm">
            <span className="text-lg font-bold text-white">K</span>
          </div>
          <div className="flex flex-col items-start justify-center gap-0">
          
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="flex items-center gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <span className="text-md font-semibold">{selectedStore.name}</span>
              <PenLine className="h-4 w-4 text-muted-foreground" />
            </button>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{selectedStore.eta}</span>
            <span>•</span>
            <span>{selectedStore.deliveryFeeTotal}</span>
          </div>
          </div>
          
        </div>

        {isDrawerOpen && (
          <div className="fixed inset-0 z-50">
            <button
              type="button"
              aria-label="Close store selector"
              className="absolute inset-0 bg-black/25"
              onClick={() => setIsDrawerOpen(false)}
            />
            <div className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-background shadow-lg">
              <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
                <div>
                  <div className="text-lg font-semibold">Select a Store</div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Choose a location to see accurate inventory and pricing.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => setIsDrawerOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4 px-5 pb-6 pt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by store name or address"
                    className="pl-9"
                  />
                </div>

                <div className="grid gap-2">
                  <Button variant="outline" className="justify-start gap-2">
                    <LocateFixed className="h-4 w-4" />
                    Use current location
                  </Button>
                  <div className="flex gap-2">
                    <Input placeholder="Enter ZIP code or address" />
                    <Button variant="secondary">Search</Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {stores.map((store) => {
                    const isSelected = selectedStore.name === store.name
                    return (
                      <button
                        key={store.name}
                        type="button"
                        onClick={() => {
                          setSelectedStore(store)
                          setIsDrawerOpen(false)
                        }}
                        className={cn(
                          "w-full rounded-2xl border p-4 text-left",
                          isSelected ? "border-foreground" : "border-border"
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-lg font-semibold">
                              {store.name}
                            </div>
                            <div className="mt-1 text-sm text-muted-foreground">
                              {store.address}
                            </div>
                          </div>
                          {isSelected && (
                            <span className="rounded-full bg-foreground px-3 py-1 text-xs font-semibold text-background">
                              Selected
                            </span>
                          )}
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {store.distance}
                          </span>
                          <span>{store.eta}</span>
                          <span>{store.deliveryFeeTotal}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Right: Cart */}
        <Button variant="ghost" size="icon" className="relative h-10 w-10">
          <ShoppingCart className="h-6 w-6" />
          {cartItemCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
              {cartItemCount}
            </span>
          )}
        </Button>
      </div>
    </header>
  )
}
