"use client"

import React from "react"

import { useState } from "react"
import Navigation  from "@/components/navigation"
import { DonationCard } from "@/components/DonationCard"
import { CharityFilters } from "@/components/CharityFilters"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Search, SlidersHorizontal, Heart, Users, Package } from "lucide-react"

// Mock data for demonstration
const mockDonations = [
  {
    id: "1",
    foodName: "Vegetable Soup",
    description: "Fresh homemade vegetable soup with seasonal vegetables",
    category: "Prepared Meals",
    quantity: 20,
    unit: "portions",
    restaurant: "Green Bistro",
    expiryDate: "today",
    pickupTime: "6:00 PM",
    deliveryOffered: true,
    deliveryCost: 5,
    distance: "0.5 mi",
    dietaryInfo: ["Vegetarian", "Gluten-Free"],
    image: "/placeholder.svg?key=soup1",
    createdAt: "2 hours ago",
  },
  {
    id: "2",
    foodName: "Fresh Bread Loaves",
    description: "Artisan sourdough and whole wheat bread loaves",
    category: "Bakery Items",
    quantity: 15,
    unit: "loaves",
    restaurant: "Farm Table Bakery",
    expiryDate: "tomorrow",
    pickupTime: "8:00 AM",
    deliveryOffered: true,
    distance: "1.2 mi",
    dietaryInfo: ["Vegetarian"],
    image: "/placeholder.svg?key=bread1",
    createdAt: "4 hours ago",
  },
  {
    id: "3",
    foodName: "Mixed Salad Greens",
    description: "Fresh organic mixed greens and vegetables",
    category: "Fresh Produce",
    quantity: 10,
    unit: "lbs",
    restaurant: "Urban Kitchen",
    expiryDate: "today",
    pickupTime: "5:30 PM",
    deliveryOffered: false,
    distance: "0.8 mi",
    dietaryInfo: ["Vegetarian", "Vegan", "Gluten-Free"],
    image: "/placeholder.svg?key=salad1",
    createdAt: "1 hour ago",
  },
]

export default function Donate() {
  const [filteredDonations, setFilteredDonations] = useState(mockDonations)
  const [searchQuery, setSearchQuery] = useState("")
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  const handleSearch = (e) => {
    e.preventDefault()
    const filtered = mockDonations.filter(
      (donation) =>
        donation.foodName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        donation.restaurant.toLowerCase().includes(searchQuery.toLowerCase()) ||
        donation.category.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    setFilteredDonations(filtered)
  }

  const handleSort = (sortBy) => {
    const sorted = [...filteredDonations].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "expiry":
          return a.expiryDate === "today" ? -1 : 1
        case "quantity":
          return b.quantity - a.quantity
        case "distance":
          return Number.parseFloat(a.distance) - Number.parseFloat(b.distance)
        default:
          return 0
      }
    })
    setFilteredDonations(sorted)
  }

  const handleFiltersChange = (filters) => {
    let filtered = [...mockDonations]

    if (filters.categories.length > 0) {
      filtered = filtered.filter((donation) => filters.categories.includes(donation.category))
    }

    if (filters.dietary.length > 0) {
      filtered = filtered.filter((donation) =>
        filters.dietary.some((diet) => donation.dietaryInfo.includes(diet)),
      )
    }

    if (filters.deliveryOnly) {
      filtered = filtered.filter((donation) => donation.deliveryOffered)
    }

    setFilteredDonations(filtered)
  }

  const handleClaimDonation = (donation) => {
    console.log("Claimed donation:", donation)
    // TODO: Implement claim functionality
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="space-y-4 mb-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">Food Donations</h1>
            <p className="text-muted-foreground">
              Find free surplus food from local restaurants to help your community
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="text-center p-4 bg-card rounded-lg border">
              <Heart className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">45</div>
              <div className="text-sm text-muted-foreground">Available Donations</div>
            </div>
            <div className="text-center p-4 bg-card rounded-lg border">
              <Users className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">120</div>
              <div className="text-sm text-muted-foreground">Charities Served</div>
            </div>
            <div className="text-center p-4 bg-card rounded-lg border">
              <Package className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">2.5K</div>
              <div className="text-sm text-muted-foreground">Meals Donated</div>
            </div>
          </div>
        </div>

        {/* Search and Sort */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search donations, restaurants, or food types..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>

          <div className="flex gap-2">
            <Select onValueChange={handleSort}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="expiry">Expiring Soon</SelectItem>
                <SelectItem value="quantity">Largest Quantity</SelectItem>
                <SelectItem value="distance">Nearest First</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => setIsFiltersOpen(true)} className="sm:hidden">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Filters */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <CharityFilters onFiltersChange={handleFiltersChange} />
          </aside>

          {/* Mobile Filters */}
          <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <SheetContent side="left" className="w-80">
              <CharityFilters onFiltersChange={handleFiltersChange} />
            </SheetContent>
          </Sheet>

          {/* Donations Grid */}
          <div className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Showing {filteredDonations.length} donations</p>
              <Button variant="outline" size="sm" onClick={() => setIsFiltersOpen(true)} className="lg:hidden">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredDonations.map((donation) => (
                <DonationCard key={donation.id} donation={donation} onClaim={handleClaimDonation} />
              ))}
            </div>

            {filteredDonations.length === 0 && (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">No donations found matching your criteria.</p>
                <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters or search terms.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
