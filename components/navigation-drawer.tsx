"use client";

import { useState, useEffect, useMemo } from "react";
import {
  X,
  Home,
  Package,
  Trophy,
  HelpCircle,
  Layers,
  ChevronUp,
  ChevronDown,
  Settings,
  Clock,
  Cookie,
  Cigarette,
  Beer,
  GlassWater,
  Candy,
  Zap,
  CupSoda,
  Apple,
  Milk,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";

const getCategoryIcon = (name: string, size: "card" | "copy") => {
  const className = size === "card" ? "h-6 w-6" : "h-4 w-4";
  const normalized = name.toLowerCase();

  if (normalized.includes("energy") || normalized.includes("electrolyte")) {
    return <Zap className={className} />;
  }
  if (normalized.includes("snack")) {
    return <Cookie className={className} />;
  }
  if (normalized.includes("tobacco")) {
    return <Cigarette className={className} />;
  }
  if (
    normalized.includes("beer") ||
    normalized.includes("alcohol") ||
    normalized.includes("seltzer") ||
    normalized.includes("wine")
  ) {
    return <Beer className={className} />;
  }
  if (normalized.includes("juice") || normalized.includes("tea")) {
    return <CupSoda className={className} />;
  }
  if (normalized.includes("candy")) {
    return <Candy className={className} />;
  }
  if (normalized.includes("water")) {
    return <GlassWater className={className} />;
  }
  if (normalized.includes("fruit") || normalized.includes("produce")) {
    return <Apple className={className} />;
  }
  if (normalized.includes("dairy") || normalized.includes("milk")) {
    return <Milk className={className} />;
  }

  return <Package className={className} />;
};

const isAgeRestricted = (name: string) => {
  const normalized = name.toLowerCase();
  return (
    normalized.includes("tobacco") ||
    normalized.includes("beer") ||
    normalized.includes("alcohol") ||
    normalized.includes("seltzer") ||
    normalized.includes("wine")
  );
};

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  storeName?: string;
  deliveryTime?: string;
  deliveryFee?: string;
  categories?: Array<{ name: string }>;
  activeRoute?: string;
  onStoreClick?: () => void;
}

export function NavigationDrawer({
  isOpen,
  onClose,
  storeName = "East Market",
  deliveryTime = "15-20 min",
  deliveryFee = "$1.99 delivery",
  categories: categoriesProp = [],
  activeRoute = "home",
  onStoreClick,
}: NavigationDrawerProps) {
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(true);
  const [dbCategories, setDbCategories] = useState<string[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  // Disable body scroll when drawer is open
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

  // Load categories from database
  useEffect(() => {
    let isMounted = true;

    if (!supabase) {
      return () => {
        isMounted = false;
      };
    }

    const loadCategories = async () => {
      if (isMounted) {
        setIsCategoriesLoading(true);
      }

      try {
        const { data, error } = await supabase
          .from("Example Inventory")
          .select("category")
          .not("category", "is", null);

        if (!isMounted || error || !data) {
          return;
        }

        const categoryCounts = new Map<string, number>();
        data.forEach((item) => {
          const trimmed = item.category?.trim();
          if (!trimmed) {
            return;
          }
          categoryCounts.set(trimmed, (categoryCounts.get(trimmed) ?? 0) + 1);
        });

        const sortedCategories = Array.from(categoryCounts.entries())
          .sort((a, b) => {
            if (b[1] !== a[1]) {
              return b[1] - a[1];
            }
            return a[0].localeCompare(b[0]);
          })
          .map(([name]) => name);

        if (isMounted) {
          setDbCategories(sortedCategories);
        }
      } catch {
        return;
      } finally {
        if (isMounted) {
          setIsCategoriesLoading(false);
        }
      }
    };

    void loadCategories();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  const navigationItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "orders", label: "Orders", icon: Package },
    { id: "rewards", label: "Rewards & Promotions", icon: Trophy, badge: "000" },
    { id: "support", label: "Support & Help", icon: HelpCircle },
  ];

  // Use database categories if available, otherwise fall back to prop, then empty array
  const displayCategories =
    dbCategories.length > 0
      ? dbCategories
      : categoriesProp.length > 0
        ? categoriesProp.map((c) => c.name)
        : [];

  // Use all categories from database
  const categoryGrid = displayCategories;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/25"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed left-0 top-0 bottom-0 z-50 w-[320px] bg-background shadow-lg flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3 border-b">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Store Logo */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-500 shadow-sm">
              <span className="text-lg font-bold text-white">K</span>
            </div>
            <div className="flex flex-col items-start justify-center gap-0 min-w-0 flex-1">
              <button
                type="button"
                onClick={() => {
                  onStoreClick?.();
                  onClose();
                }}
                className="flex items-center gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <span className="text-base font-semibold truncate">
                  {storeName}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
              </button>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{deliveryTime}</span>
                <span>•</span>
                <span>{deliveryFee}</span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation and Categories Container - Fills remaining space */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Navigation Links */}
          <nav
            className={cn(
              "px-2 py-2 border-b gap-1 flex flex-col",
              isCategoriesOpen ? "flex-shrink-0" : "flex-1 justify-start",
            )}
          >
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeRoute === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    // Handle navigation
                    onClose();
                  }}
                  className={cn(
                    "w-full flex items-center justify-between gap-3 px-2 py-2.5 rounded-md text-left transition-colors",
                    isActive ? "bg-muted" : "hover:bg-muted/50",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-foreground" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  {item.badge && (
                    <Badge
                      variant="secondary"
                      className="rounded-full px-2 py-0.5 text-xs font-normal"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </button>
              );
            })}

            {/* Categories Section Header */}
            <div className="mt-0">
              <button
                type="button"
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-md text-left hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Layers className="h-5 w-5 text-foreground" />
                  <span className="text-sm font-medium">Categories</span>
                </div>
                {isCategoriesOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </div>
          </nav>

          {/* Categories List - Scrollable */}
          {isCategoriesOpen && (
            <div className="flex-1 overflow-y-auto pl-2 pr-2 py-2 min-h-0 bg-muted">
              <div className="flex flex-col gap-1">
                {categoryGrid.map((categoryName) => (
                  <Button
                    key={categoryName}
                    variant="ghost"
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left justify-start hover:bg-muted/70"
                    onClick={() => {
                      // Handle category selection
                      onClose();
                    }}
                  >
                    <div className="flex h-5 w-5 items-center justify-center shrink-0">
                      {getCategoryIcon(categoryName, "copy")}
                    </div>
                    <span className="text-xs font-medium flex-1">
                      {categoryName.replace(/\band\b/gi, "&")}
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-4 py-2 h-fit">
          {/* User Profile */}
          <div className="flex items-center gap-3 h-fit">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shrink-0">
              <span className="text-white font-semibold text-sm">S</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">shadcn</div>
              <div className="text-xs text-muted-foreground truncate">
                m@example.com
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              aria-label="Settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
