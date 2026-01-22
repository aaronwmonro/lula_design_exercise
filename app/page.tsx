"use client"

import { Search, Coffee, Cookie, Cigarette, Beer, GlassWater, Candy } from "lucide-react"
import { StoreHeader } from "@/components/store-header"
import { CategoryButton } from "@/components/category-button"
import { ProductCard } from "@/components/product-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const categories = [
  { name: "Energy & Electrolytes", icon: <Coffee className="h-6 w-6" /> },
  { name: "Snacks", icon: <Cookie className="h-6 w-6" /> },
  { name: "Tobacco", icon: <Cigarette className="h-6 w-6" /> },
  { name: "Beer", icon: <Beer className="h-6 w-6" />, ageRestricted: true },
  { name: "Juice and Tea", icon: <GlassWater className="h-6 w-6" /> },
  { name: "Candy", icon: <Candy className="h-6 w-6" /> },
]

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

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <StoreHeader />

      <main className="flex-1 pb-6">
        {/* What are you looking for? Section */}
        <section className="px-4 pt-6">
          <h1 className="mb-4 text-2xl font-bold">What are you looking for?</h1>

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

          {/* Category Grid */}
          <div className="mb-4 grid grid-cols-3 gap-3">
            {categories.map((category) => (
              <CategoryButton
                key={category.name}
                name={category.name}
                icon={category.icon}
                ageRestricted={category.ageRestricted}
              />
            ))}
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-foreground" />
            <div className="h-1.5 w-1.5 rounded-full bg-muted" />
            <div className="h-1.5 w-1.5 rounded-full bg-muted" />
            <div className="h-1.5 w-1.5 rounded-full bg-muted" />
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
