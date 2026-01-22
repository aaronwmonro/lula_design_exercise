"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  Search,
  Cookie,
  Cigarette,
  Beer,
  GlassWater,
  Candy,
  Zap,
  CupSoda,
  Apple,
  Milk,
  Package,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { StoreHeader } from "@/components/store-header"
import { CategoryButton } from "@/components/category-button"
import { ProductCard } from "@/components/product-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client"

type CategoryItem = {
  name: string
  icon: React.ReactNode
  ageRestricted?: boolean
}

const orderAgainProducts = [
  {
    name: "Smart Water Alkaline",
    size: "1 L",
    price: "$3.69",
    originalPrice: "$3.69",
  },
  {
    name: "Smart Water Alkaline",
    size: "1 L",
    price: "$3.69",
    originalPrice: "$3.69",
  },
  {
    name: "Smart Water Alkaline",
    size: "1 L",
    price: "$3.69",
    originalPrice: "$3.69",
  },
]

const getCategoryIcon = (name: string, size: "card" | "copy") => {
  const className = size === "card" ? "h-6 w-6" : "h-4 w-4"
  const normalized = name.toLowerCase()

  if (normalized.includes("energy") || normalized.includes("electrolyte")) {
    return <Zap className={className} />
  }
  if (normalized.includes("snack")) {
    return <Cookie className={className} />
  }
  if (normalized.includes("tobacco")) {
    return <Cigarette className={className} />
  }
  if (
    normalized.includes("beer") ||
    normalized.includes("alcohol") ||
    normalized.includes("seltzer") ||
    normalized.includes("wine")
  ) {
    return <Beer className={className} />
  }
  if (normalized.includes("juice") || normalized.includes("tea")) {
    return <CupSoda className={className} />
  }
  if (normalized.includes("candy")) {
    return <Candy className={className} />
  }
  if (normalized.includes("water")) {
    return <GlassWater className={className} />
  }
  if (normalized.includes("fruit") || normalized.includes("produce")) {
    return <Apple className={className} />
  }
  if (normalized.includes("dairy") || normalized.includes("milk")) {
    return <Milk className={className} />
  }

  return <Package className={className} />
}

const isAgeRestricted = (name: string) => {
  const normalized = name.toLowerCase()
  return (
    normalized.includes("tobacco") ||
    normalized.includes("beer") ||
    normalized.includes("alcohol") ||
    normalized.includes("seltzer") ||
    normalized.includes("wine")
  )
}

export default function HomePage() {
  const supabase = useMemo(() => createClient(), [])
  const [categoryItems, setCategoryItems] = useState<CategoryItem[]>([])
  const [categoryPageIndex, setCategoryPageIndex] = useState(0)
  const categoryScrollRef = useRef<HTMLDivElement | null>(null)

  const categoryPages = useMemo(() => {
    const pageSize = 6
    const pages: CategoryItem[][] = []

    for (let i = 0; i < categoryItems.length; i += pageSize) {
      pages.push(categoryItems.slice(i, i + pageSize))
    }

    return pages.length ? pages : [categoryItems]
  }, [categoryItems])

  useEffect(() => {
    setCategoryPageIndex(0)
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollTo({ left: 0, behavior: "smooth" })
    }
  }, [categoryPages.length])

  useEffect(() => {
    let isMounted = true

    if (!supabase) {
      return () => {
        isMounted = false
      }
    }

    const loadCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("Example Inventory")
          .select("category")
          .not("category", "is", null)

        if (!isMounted || error || !data) {
          return
        }

        const categoryCounts = new Map<string, number>()
        data.forEach((item) => {
          const trimmed = item.category?.trim()
          if (!trimmed) {
            return
          }
          categoryCounts.set(trimmed, (categoryCounts.get(trimmed) ?? 0) + 1)
        })

        const sortedCategories = Array.from(categoryCounts.entries())
          .sort((a, b) => {
            if (b[1] !== a[1]) {
              return b[1] - a[1]
            }
            return a[0].localeCompare(b[0])
          })
          .map(([name]) => name)

        setCategoryItems(
          sortedCategories.map((name) => ({
            name,
            icon: getCategoryIcon(name, "card"),
            ageRestricted: isAgeRestricted(name),
          })),
        )
      } catch {
        return
      }
    }

    void loadCategories()

    return () => {
      isMounted = false
    }
  }, [supabase])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <StoreHeader />

      <main className="flex-1 overflow-visible gap-6 pb-6">
        {/* What are you looking for? Section */}
        <section className="overflow-visible px-4 pt-4">
          <div className="flex flex-col ">
          <p className="text-sm text-muted-foreground">Good Morning, Aaron!</p>
            <h1 className="mb-4 text-xl font-bold">What are you looking for?</h1>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Input
              type="search"
              placeholder="Search..."
              className="h-12 pr-12 text-base"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-10 w-10 -translate-y-1/2"
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex flex-col gap-3 overflow-visible">
            {/* Category Grid */}
            <div className="overflow-visible">
              <div
                ref={categoryScrollRef}
                className="flex snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-visible scrollbar-hide"
                onScroll={(event) => {
                  const target = event.currentTarget
                  const width = target.clientWidth || 1
                  const nextIndex = Math.round(target.scrollLeft / width)

                  setCategoryPageIndex(
                    Math.min(Math.max(nextIndex, 0), categoryPages.length - 1),
                  )
                }}
              >
                {categoryPages.map((page, pageIndex) => (
                  <div
                    key={`category-page-${pageIndex}`}
                    className="grid min-w-full snap-start grid-cols-3 grid-rows-2 overflow-y-visible gap-3"
                  >
                    {page.map((category) => (
                      <CategoryButton
                        key={category.name}
                        name={category.name}
                        icon={category.icon}
                        ageRestricted={category.ageRestricted}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination Dots */}
            <div className="flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full disabled:opacity-40"
                onClick={() => {
                  const nextIndex = Math.max(categoryPageIndex - 1, 0)
                  const width = categoryScrollRef.current?.clientWidth ?? 0
                  categoryScrollRef.current?.scrollTo({
                    left: width * nextIndex,
                    behavior: "smooth",
                  })
                  setCategoryPageIndex(nextIndex)
                }}
                disabled={categoryPageIndex === 0}
                aria-label="Scroll categories left"
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
              {categoryPages.map((_, index) => (
                <button
                  key={`category-dot-${index}`}
                  type="button"
                  aria-label={`Go to categories page ${index + 1}`}
                  className={index === categoryPageIndex ? "h-1.5 w-1.5 rounded-full bg-foreground" : "h-1.5 w-1.5 rounded-full bg-muted"}
                  onClick={() => {
                    const width = categoryScrollRef.current?.clientWidth ?? 0
                    categoryScrollRef.current?.scrollTo({
                      left: width * index,
                      behavior: "smooth",
                    })
                    setCategoryPageIndex(index)
                  }}
                />
              ))}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full disabled:opacity-40"
                onClick={() => {
                  const nextIndex = Math.min(categoryPageIndex + 1, categoryPages.length - 1)
                  const width = categoryScrollRef.current?.clientWidth ?? 0
                  categoryScrollRef.current?.scrollTo({
                    left: width * nextIndex,
                    behavior: "smooth",
                  })
                  setCategoryPageIndex(nextIndex)
                }}
                disabled={categoryPageIndex >= categoryPages.length - 1}
                aria-label="Scroll categories right"
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </section>

        {/* Order again Section */}
        <section className="mt-8 px-4">
          <h2 className="mb-4 text-2xl font-bold">Order again</h2>

          {/* Horizontal Scrollable Product List */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {orderAgainProducts.map((product, index) => (
              <ProductCard
                key={index}
                name={product.name}
                size={product.size}
                price={product.price}
                originalPrice={product.originalPrice}
                onAdd={() => console.log("Add to cart:", product.name)}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
