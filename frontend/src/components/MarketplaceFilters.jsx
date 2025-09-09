"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { X, Filter } from "lucide-react"

export function MarketplaceFilters({ onFiltersChange }) {
  const [priceRange, setPriceRange] = useState([0, 50])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedRestaurants, setSelectedRestaurants] = useState([])

  const categories = [
    "Main Dishes",
    "Appetizers",
    "Desserts",
    "Beverages",
    "Salads",
    "Soups",
    "Bakery Items",
    "Fresh Produce",
  ]

  const restaurants = ["Green Bistro", "Farm Table", "Urban Kitchen", "Harvest Cafe", "Fresh Garden", "Local Eats"]

  const handleCategoryChange = (category, checked) => {
    const updated = checked ? [...selectedCategories, category] : selectedCategories.filter((c) => c !== category)
    setSelectedCategories(updated)
    onFiltersChange?.({ categories: updated, restaurants: selectedRestaurants, priceRange })
  }

  const handleRestaurantChange = (restaurant, checked) => {
    const updated = checked ? [...selectedRestaurants, restaurant] : selectedRestaurants.filter((r) => r !== restaurant)
    setSelectedRestaurants(updated)
    onFiltersChange?.({ categories: selectedCategories, restaurants: updated, priceRange })
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedRestaurants([])
    setPriceRange([0, 50])
    onFiltersChange?.({ categories: [], restaurants: [], priceRange: [0, 50] })
  }

  const hasActiveFilters =
    selectedCategories.length > 0 || selectedRestaurants.length > 0 || priceRange[0] > 0 || priceRange[1] < 50

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Price Range */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Price Range</Label>
          <Slider
            value={priceRange}
            onValueChange={(value) => {
              setPriceRange(value)
              onFiltersChange?.({ categories: selectedCategories, restaurants: selectedRestaurants, priceRange: value })
            }}
            max={50}
            step={1}
            className="mb-2"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>

        {/* Categories */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Categories</Label>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={category}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={(checked) => handleCategoryChange(category, checked)}
                />
                <Label htmlFor={category} className="text-sm font-normal cursor-pointer">
                  {category}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Restaurants */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Restaurants</Label>
          <div className="space-y-2">
            {restaurants.map((restaurant) => (
              <div key={restaurant} className="flex items-center space-x-2">
                <Checkbox
                  id={restaurant}
                  checked={selectedRestaurants.includes(restaurant)}
                  onCheckedChange={(checked) => handleRestaurantChange(restaurant, checked)}
                />
                <Label htmlFor={restaurant} className="text-sm font-normal cursor-pointer">
                  {restaurant}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div>
            <Label className="text-sm font-medium mb-2 block">Active Filters</Label>
            <div className="flex flex-wrap gap-1">
              {selectedCategories.map((category) => (
                <Badge key={category} variant="secondary" className="text-xs">
                  {category}
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleCategoryChange(category, false)} />
                </Badge>
              ))}
              {selectedRestaurants.map((restaurant) => (
                <Badge key={restaurant} variant="secondary" className="text-xs">
                  {restaurant}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => handleRestaurantChange(restaurant, false)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
