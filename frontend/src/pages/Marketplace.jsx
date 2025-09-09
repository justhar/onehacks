"use client"

import { useState } from "react"
import { MarketplaceHeader } from "@/components/MarketplaceHeader"
import { MarketplaceFilters } from "@/components/MarketplaceFilters"
import { FoodItemCard } from "@/components/FoodItemCard"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { SlidersHorizontal } from "lucide-react"

// Mock data for demonstration
const mockFoodItems = [
  {
    id: "1",
    name: "Pasta Primavera",
    description: "Fresh seasonal vegetables with penne pasta in a light cream sauce",
    originalPrice: 18.99,
    discountedPrice: 12.99,
    restaurant: "Green Bistro",
    category: "Main Dishes",
    expiresAt: "today",
    distance: "0.5 mi",
    rating: 4.8,
    image: "/pasta-primavera-dish.jpg",
    quantity: 3,
  },
  {
    id: "2",
    name: "Artisan Sourdough Bread",
    description: "Freshly baked sourdough bread with a crispy crust and soft interior",
    originalPrice: 8.99,
    discountedPrice: 4.99,
    restaurant: "Farm Table",
    category: "Bakery Items",
    expiresAt: "tomorrow",
    distance: "1.2 mi",
    rating: 4.9,
    image: "/artisan-sourdough.png",
    quantity: 5,
  },
  {
    id: "3",
    name: "Caesar Salad",
    description: "Crisp romaine lettuce with parmesan cheese, croutons, and caesar dressing",
    originalPrice: 14.99,
    discountedPrice: 9.99,
    restaurant: "Urban Kitchen",
    category: "Salads",
    expiresAt: "today",
    distance: "0.8 mi",
    rating: 4.6,
    image: "/caesar-salad-fresh.jpg",
    quantity: 2,
  },
  {
    id: "4",
    name: "Chocolate Brownie",
    description: "Rich, fudgy chocolate brownie with walnuts",
    originalPrice: 6.99,
    discountedPrice: 3.99,
    restaurant: "Harvest Cafe",
    category: "Desserts",
    expiresAt: "today",
    distance: "1.5 mi",
    rating: 4.7,
    image: "/chocolate-brownie-dessert.png",
    quantity: 8,
  },
  {
    id: "5",
    name: "Tomato Basil Soup",
    description: "Creamy tomato soup with fresh basil and a hint of garlic",
    originalPrice: 9.99,
    discountedPrice: 6.99,
    restaurant: "Fresh Garden",
    category: "Soups",
    expiresAt: "tomorrow",
    distance: "2.1 mi",
    rating: 4.5,
    image: "/tomato-basil-soup-bowl.jpg",
    quantity: 4,
  },
  {
    id: "6",
    name: "Grilled Salmon",
    description: "Atlantic salmon grilled to perfection with lemon herb seasoning",
    originalPrice: 24.99,
    discountedPrice: 16.99,
    restaurant: "Local Eats",
    category: "Main Dishes",
    expiresAt: "today",
    distance: "0.9 mi",
    rating: 4.8,
    image: "/grilled-salmon-dish.jpg",
    quantity: 1,
  },
]

export default function MarketplacePage() {
  const [filteredItems, setFilteredItems] = useState(mockFoodItems)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  const handleSearch = (query) => {
    const filtered = mockFoodItems.filter(
      (item) =>
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.restaurant.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase()),
    )
    setFilteredItems(filtered)
  }

  const handleSort = (sortBy) => {
    const sorted = [...filteredItems].sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.discountedPrice - b.discountedPrice
        case "price-high":
          return b.discountedPrice - a.discountedPrice
        case "discount":
          const aDiscount = ((a.originalPrice - a.discountedPrice) / a.originalPrice) * 100
          const bDiscount = ((b.originalPrice - b.discountedPrice) / b.originalPrice) * 100
          return bDiscount - aDiscount
        case "rating":
          return b.rating - a.rating
        default:
          return 0
      }
    })
    setFilteredItems(sorted)
  }

  const handleFiltersChange = (filters) => {
    let filtered = [...mockFoodItems]

    if (filters.categories.length > 0) {
      filtered = filtered.filter((item) => filters.categories.includes(item.category))
    }

    if (filters.restaurants.length > 0) {
      filtered = filtered.filter((item) => filters.restaurants.includes(item.restaurant))
    }

    filtered = filtered.filter(
      (item) => item.discountedPrice >= filters.priceRange[0] && item.discountedPrice <= filters.priceRange[1],
    )

    setFilteredItems(filtered)
  }

  const handleAddToCart = (item) => {
    // TODO: Implement cart functionality
    console.log("Added to cart:", item)
  }

  return (
    <div className="min-h-screen bg-background">

      <main className="container mx-auto px-4 py-8">
        <MarketplaceHeader onSearch={handleSearch} onSort={handleSort} onToggleFilters={() => setIsFiltersOpen(true)} />

        <div className="mt-8 flex gap-8">
          {/* Desktop Filters */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <MarketplaceFilters onFiltersChange={handleFiltersChange} />
          </aside>

          {/* Mobile Filters */}
          <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <SheetContent side="left" className="w-80">
              <MarketplaceFilters onFiltersChange={handleFiltersChange} />
            </SheetContent>
          </Sheet>

          {/* Food Items Grid */}
          <div className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Showing {filteredItems.length} items</p>
              <Button variant="outline" size="sm" onClick={() => setIsFiltersOpen(true)} className="lg:hidden">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <FoodItemCard key={item.id} item={item} onAddToCart={handleAddToCart} />
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">No items found matching your criteria.</p>
                <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters or search terms.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
