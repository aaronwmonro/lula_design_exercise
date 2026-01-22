"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
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

type OrderAgainProduct = {
  id: string
  name: string
  size?: string | null
  price: number | null
  imageUrl?: string
}

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

const formatPrice = (value: number | null) => {
  if (value == null || Number.isNaN(value)) {
    return "$0.00"
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value)
}

const resolveImageUrl = (images: unknown) => {
  if (!images) {
    return undefined
  }

  if (Array.isArray(images)) {
    const first = images.find((item) => typeof item === "string")
    return typeof first === "string" ? first : undefined
  }

  if (typeof images === "object" && images !== null) {
    const record = images as Record<string, unknown>
    const candidate =
      record.primary ??
      record.url ??
      record.image ??
      record.thumbnail ??
      record[0]
    return typeof candidate === "string" ? candidate : undefined
  }

  return undefined
}

export default function HomePage() {
  const supabase = useMemo(() => createClient(), [])
  const [categoryItems, setCategoryItems] = useState<CategoryItem[]>([])
  const [isStoreDrawerOpen, setIsStoreDrawerOpen] = useState(false)
  const [orderAgainProducts, setOrderAgainProducts] = useState<
    OrderAgainProduct[]
  >([])
  const [categoryPageIndex, setCategoryPageIndex] = useState(0)
  const categoryScrollRef = useRef<HTMLDivElement | null>(null)
  const [orderAgainPageIndex, setOrderAgainPageIndex] = useState(0)
  const orderAgainScrollRef = useRef<HTMLDivElement | null>(null)
  const [promotionsPageIndex, setPromotionsPageIndex] = useState(0)
  const promotionsScrollRef = useRef<HTMLDivElement | null>(null)

  const categoryPages = useMemo(() => {
    const pageSize = 9
    const pages: CategoryItem[][] = []

    for (let i = 0; i < categoryItems.length; i += pageSize) {
      pages.push(categoryItems.slice(i, i + pageSize))
    }

    return pages.length ? pages : [categoryItems]
  }, [categoryItems])

  const { orderAgainDisplay, promotionsDisplay } = useMemo(() => {
    const desiredPromoCount = 6
    const orderAgainMax = 9
    const promotionsMax = 9
    const total = orderAgainProducts.length
    const orderAgainCount = Math.min(
      orderAgainMax,
      Math.max(0, total - desiredPromoCount),
    )
    const promotionsCount = Math.min(
      promotionsMax,
      Math.max(0, total - orderAgainCount),
    )

    return {
      orderAgainDisplay: orderAgainProducts.slice(0, orderAgainCount),
      promotionsDisplay: orderAgainProducts.slice(
        orderAgainCount,
        orderAgainCount + promotionsCount,
      ),
    }
  }, [orderAgainProducts])

  const orderAgainPages = useMemo(() => {
    const pageSize = 3
    const pages: OrderAgainProduct[][] = []

    for (let i = 0; i < orderAgainDisplay.length; i += pageSize) {
      pages.push(orderAgainDisplay.slice(i, i + pageSize))
    }

    return pages.length ? pages : [orderAgainDisplay]
  }, [orderAgainDisplay])

  const promotionsPages = useMemo(() => {
    const pageSize = 3
    const pages: OrderAgainProduct[][] = []

    for (let i = 0; i < promotionsDisplay.length; i += pageSize) {
      pages.push(promotionsDisplay.slice(i, i + pageSize))
    }

    return pages.length ? pages : [promotionsDisplay]
  }, [promotionsDisplay])

  useEffect(() => {
    setCategoryPageIndex(0)
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollTo({ left: 0, behavior: "smooth" })
    }
  }, [categoryPages.length])

  useEffect(() => {
    setOrderAgainPageIndex(0)
    if (orderAgainScrollRef.current) {
      orderAgainScrollRef.current.scrollTo({ left: 0, behavior: "smooth" })
    }
  }, [orderAgainPages.length])

  useEffect(() => {
    setPromotionsPageIndex(0)
    if (promotionsScrollRef.current) {
      promotionsScrollRef.current.scrollTo({ left: 0, behavior: "smooth" })
    }
  }, [promotionsPages.length])

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

  useEffect(() => {
    let isMounted = true

    if (!supabase) {
      return () => {
        isMounted = false
      }
    }

    const loadOrderAgain = async () => {
      try {
        const { data, error } = await supabase
          .from("Example Inventory")
          .select("id, name, size, price, images")
          .not("name", "is", null)
          .limit(30)

        if (!isMounted || error || !data) {
          return
        }

        setOrderAgainProducts(
          data.map((item) => ({
            id: item.id,
            name: item.name ?? "Untitled product",
            size: item.size,
            price: item.price,
            imageUrl: resolveImageUrl(item.images),
          })),
        )
      } catch {
        return
      }
    }

    void loadOrderAgain()

    return () => {
      isMounted = false
    }
  }, [supabase])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <StoreHeader
        isDrawerOpen={isStoreDrawerOpen}
        onOpenChange={setIsStoreDrawerOpen}
      />

      <main className="flex-1 overflow-visible gap-6">
     
        <section className="overflow-visible px-4 pt-4 pb-4 border-b">
             {/* What are you looking for? Section */}
          <div className="flex flex-col ">
          <p className="text-xs text-muted-foreground">Good Morning, Aaron!</p>
            <h1 className="mb-4 text-lg font-bold">What are you looking for?</h1>
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
              <div className=" pb-2 flex w-full items-center justify-between">
                <h2 className="text-sm font-bold">Categories</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full disabled:opacity-40"
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
             
              <div
                ref={categoryScrollRef}
                className="flex snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-visible scrollbar-hide"
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
                    className="grid min-w-full snap-start grid-cols-3 grid-rows-3 overflow-y-visible gap-3"
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
        <section className="pt-4 pb-4 border-b px-4">
          <div className="pb-2 flex w-full items-center justify-between">
            <h2 className="text-sm font-bold">Order again</h2>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full disabled:opacity-40"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>

          <div className="flex flex-col gap-3 overflow-visible">
            {/* Order again grid */}
            <div className="overflow-visible">
              <div
                ref={orderAgainScrollRef}
                className="flex snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-visible scrollbar-hide"
                onScroll={(event) => {
                  const target = event.currentTarget
                  const width = target.clientWidth || 1
                  const nextIndex = Math.round(target.scrollLeft / width)

                  setOrderAgainPageIndex(
                    Math.min(Math.max(nextIndex, 0), orderAgainPages.length - 1),
                  )
                }}
              >
                {orderAgainPages.map((page, pageIndex) => (
                  <div
                    key={`order-again-page-${pageIndex}`}
                    className="grid min-w-full snap-start grid-cols-3 grid-rows-1 gap-3"
                  >
                    {page.map((product, index) => (
                      <ProductCard
                        key={product.id ?? index}
                        name={product.name}
                        size={product.size ?? undefined}
                        price={formatPrice(product.price)}
                        imageUrl={product.imageUrl}
                        onAdd={() => console.log("Add to cart:", product.name)}
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
                  const nextIndex = Math.max(orderAgainPageIndex - 1, 0)
                  const width = orderAgainScrollRef.current?.clientWidth ?? 0
                  orderAgainScrollRef.current?.scrollTo({
                    left: width * nextIndex,
                    behavior: "smooth",
                  })
                  setOrderAgainPageIndex(nextIndex)
                }}
                disabled={orderAgainPageIndex === 0}
                aria-label="Scroll order again left"
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
              {orderAgainPages.map((_, index) => (
                <button
                  key={`order-again-dot-${index}`}
                  type="button"
                  aria-label={`Go to order again page ${index + 1}`}
                  className={orderAgainPageIndex === index ? "h-1.5 w-1.5 rounded-full bg-foreground" : "h-1.5 w-1.5 rounded-full bg-muted"}
                  onClick={() => {
                    const width = orderAgainScrollRef.current?.clientWidth ?? 0
                    orderAgainScrollRef.current?.scrollTo({
                      left: width * index,
                      behavior: "smooth",
                    })
                    setOrderAgainPageIndex(index)
                  }}
                />
              ))}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full disabled:opacity-40"
                onClick={() => {
                  const nextIndex = Math.min(
                    orderAgainPageIndex + 1,
                    orderAgainPages.length - 1,
                  )
                  const width = orderAgainScrollRef.current?.clientWidth ?? 0
                  orderAgainScrollRef.current?.scrollTo({
                    left: width * nextIndex,
                    behavior: "smooth",
                  })
                  setOrderAgainPageIndex(nextIndex)
                }}
                disabled={orderAgainPageIndex >= orderAgainPages.length - 1}
                aria-label="Scroll order again right"
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </section>

        <section className="pt-4  border-b  pb-4 px-4">
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

          <div className="flex flex-col gap-3 overflow-visible">
            <div className="overflow-visible">
              <div
                ref={promotionsScrollRef}
                className="flex snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-visible scrollbar-hide"
                onScroll={(event) => {
                  const target = event.currentTarget
                  const width = target.clientWidth || 1
                  const nextIndex = Math.round(target.scrollLeft / width)

                  setPromotionsPageIndex(
                    Math.min(Math.max(nextIndex, 0), promotionsPages.length - 1),
                  )
                }}
              >
                {promotionsPages.map((page, pageIndex) => (
                  <div
                    key={`promotions-page-${pageIndex}`}
                    className="grid min-w-full snap-start grid-cols-3 grid-rows-1 gap-3"
                  >
                    {page.map((product, index) => (
                      <ProductCard
                        key={product.id ?? index}
                        name={product.name}
                        size={product.size ?? undefined}
                        price={formatPrice(product.price)}
                        originalPrice={
                          product.price != null
                            ? formatPrice(product.price + 1.5)
                            : undefined
                        }
                        imageUrl={product.imageUrl}
                        onAdd={() => console.log("Add to cart:", product.name)}
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
                  const nextIndex = Math.max(promotionsPageIndex - 1, 0)
                  const width = promotionsScrollRef.current?.clientWidth ?? 0
                  promotionsScrollRef.current?.scrollTo({
                    left: width * nextIndex,
                    behavior: "smooth",
                  })
                  setPromotionsPageIndex(nextIndex)
                }}
                disabled={promotionsPageIndex === 0}
                aria-label="Scroll promotions left"
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
              {promotionsPages.map((_, index) => (
                <button
                  key={`promotions-dot-${index}`}
                  type="button"
                  aria-label={`Go to promotions page ${index + 1}`}
                  className={promotionsPageIndex === index ? "h-1.5 w-1.5 rounded-full bg-foreground" : "h-1.5 w-1.5 rounded-full bg-muted"}
                  onClick={() => {
                    const width = promotionsScrollRef.current?.clientWidth ?? 0
                    promotionsScrollRef.current?.scrollTo({
                      left: width * index,
                      behavior: "smooth",
                    })
                    setPromotionsPageIndex(index)
                  }}
                />
              ))}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full disabled:opacity-40"
                onClick={() => {
                  const nextIndex = Math.min(
                    promotionsPageIndex + 1,
                    promotionsPages.length - 1,
                  )
                  const width = promotionsScrollRef.current?.clientWidth ?? 0
                  promotionsScrollRef.current?.scrollTo({
                    left: width * nextIndex,
                    behavior: "smooth",
                  })
                  setPromotionsPageIndex(nextIndex)
                }}
                disabled={promotionsPageIndex >= promotionsPages.length - 1}
                aria-label="Scroll promotions right"
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-gradient-to-r from-red-500 to-orange-500 px-4 py-8 text-white">
        <div className="flex flex-col gap-6 text-sm">
          <div className="overflow-hidden rounded-2xl border border-white/20 bg-white/10">
            <div className="relative aspect-[16/9] w-full">
              <Image
                src="https://www.circlek.com/themes/custom/circlek/images/special-page/history-and-timeline/history_image.jpeg"
                alt="Circle K storefront"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 640px"
                priority
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-white/90">
              <span className="text-sm font-medium">
                742 Market Street, San Francisco, CA 94103
              </span>
              <a
                href="https://maps.google.com/?q=742+Market+Street+San+Francisco+CA+94103"
                className="underline underline-offset-4"
              >
                Get directions
              </a>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-base font-semibold">Lula Market</span>
              <span className="text-white/80">Open daily · 7am–11pm</span>
            </div>
            <button
              type="button"
              className="w-fit rounded-full border border-white/60 px-3 py-1 text-xs font-semibold text-white hover:bg-white/10"
              onClick={() => setIsStoreDrawerOpen(true)}
            >
              Change location
            </button>
          </div>

          <div className="flex flex-col gap-3 text-white/90">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-medium">Address</span>
              <span>742 Market Street, San Francisco, CA 94103</span>
              <a
                href="https://maps.google.com/?q=742+Market+Street+San+Francisco+CA+94103"
                className="underline underline-offset-4"
              >
                Get directions
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-medium">Phone</span>
              <a href="tel:+14155550124" className="underline underline-offset-4">
                (415) 555-0124
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-medium">Email</span>
              <a
                href="mailto:hello@lulamarket.com"
                className="underline underline-offset-4"
              >
                hello@lulamarket.com
              </a>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <span className="font-medium">Follow</span>
            <a
              href="https://instagram.com"
              className="underline underline-offset-4"
              aria-label="Lula Market on Instagram"
            >
              Instagram
            </a>
            <a
              href="https://facebook.com"
              className="underline underline-offset-4"
              aria-label="Lula Market on Facebook"
            >
              Facebook
            </a>
            <a
              href="https://x.com"
              className="underline underline-offset-4"
              aria-label="Lula Market on X"
            >
              X
            </a>
            <a
              href="https://tiktok.com"
              className="underline underline-offset-4"
              aria-label="Lula Market on TikTok"
            >
              TikTok
            </a>
          </div>

          <div className="flex flex-wrap gap-3 text-white/80">
            <button type="button" className="underline underline-offset-4">
              Help Center
            </button>
            <button type="button" className="underline underline-offset-4">
              Order Support
            </button>
            <button type="button" className="underline underline-offset-4">
              Terms
            </button>
            <button type="button" className="underline underline-offset-4">
              Privacy
            </button>
          </div>

          <div className="text-xs text-white/80">
            © {new Date().getFullYear()} Lula Market. All rights reserved.
          </div>
        </div>

        <div className="mt-6 hidden -mx-4">
          <div className="relative h-48 w-full">
            <Image
              src="https://1000logos.net/wp-content/uploads/2020/11/Circle-K-Logo.jpg"
              alt="Circle K logo"
              fill
              className="object-contain bg-white"
              sizes="100vw"
            />
          </div>
        </div>
      </footer>
    </div>
  )
}
