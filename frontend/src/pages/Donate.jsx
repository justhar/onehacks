"use client";

import React from "react";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/navigation";
import { DonationCard } from "@/components/DonationCard";
import { CharityFilters } from "@/components/CharityFilters";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, SlidersHorizontal, Heart, Users, Package, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { transformProductsData } from "@/lib/dataTransforms";

// Transform donation data from API format to DonationCard format
const transformDonationData = (apiDonation) => {
  return {
    id: apiDonation.id,
    foodName: apiDonation.title || apiDonation.name,
    description: apiDonation.description || "",
    category: apiDonation.category || "Other",
    quantity: apiDonation.quantity || 1,
    unit: "portions", // Default unit, could be enhanced based on category
    restaurant: apiDonation.restaurant || apiDonation.businessName || "Unknown Restaurant",
    expiryDate: apiDonation.expiryDate ? new Date(apiDonation.expiryDate).toLocaleDateString() : "N/A",
    pickupTime: "Contact restaurant", // Default message, could be enhanced
    deliveryOffered: false, // Default to false, could be enhanced
    deliveryCost: 0,
    distance: apiDonation.distance || "N/A",
    dietaryInfo: [], // Could be enhanced based on description or tags
    image: apiDonation.image || apiDonation.imageUrl || "/placeholder.svg",
    createdAt: apiDonation.createdAt ? new Date(apiDonation.createdAt).toLocaleDateString() : "Recently",
  };
};

export default function Donate() {
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch donations on component mount
  useEffect(() => {
    const fetchDonations = async () => {
      try {
        setIsLoading(true);
        setError("");
        
        const response = await api.getDonations();
        
        if (response.error) {
          setError(response.error);
          return;
        }

        // Transform the API data to match DonationCard expectations
        const transformedDonations = response.map(transformDonationData);
        setDonations(transformedDonations);
        setFilteredDonations(transformedDonations);
      } catch (err) {
        console.error("Error fetching donations:", err);
        setError("Failed to load donations. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDonations();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const filtered = donations.filter(
      (donation) =>
        donation.foodName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        donation.restaurant.toLowerCase().includes(searchQuery.toLowerCase()) ||
        donation.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredDonations(filtered);
  };

  const handleSort = (sortBy) => {
    const sorted = [...filteredDonations].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "expiry":
          if (a.expiryDate === "today" && b.expiryDate !== "today") return -1;
          if (b.expiryDate === "today" && a.expiryDate !== "today") return 1;
          return 0;
        case "quantity":
          return b.quantity - a.quantity;
        case "distance":
          const aDistance = parseFloat(a.distance) || 999;
          const bDistance = parseFloat(b.distance) || 999;
          return aDistance - bDistance;
        default:
          return 0;
      }
    });
    setFilteredDonations(sorted);
  };

  const handleFiltersChange = (filters) => {
    let filtered = [...donations];

    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter((donation) =>
        filters.categories.includes(donation.category)
      );
    }

    if (filters.dietary && filters.dietary.length > 0) {
      filtered = filtered.filter((donation) =>
        filters.dietary.some((diet) => donation.dietaryInfo.includes(diet))
      );
    }

    if (filters.deliveryOnly) {
      filtered = filtered.filter((donation) => donation.deliveryOffered);
    }

    setFilteredDonations(filtered);
  };

  const handleClaimDonation = (donation) => {
    console.log("Claimed donation:", donation);
    // Navigate to checkout page with the donation item
    // We need to find the original product ID to navigate to checkout
    navigate(`/checkout/${donation.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="space-y-4 mb-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Food Donations
            </h1>
            <p className="text-muted-foreground">
              Find free surplus food from local restaurants to help your
              community
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-600">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading donations...</span>
          </div>
        ) : (
          <>
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

                <Button
                  variant="outline"
                  onClick={() => setIsFiltersOpen(true)}
                  className="sm:hidden"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}

        {!isLoading && (
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
                <p className="text-sm text-muted-foreground">
                  Showing {filteredDonations.length} donations
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFiltersOpen(true)}
                  className="lg:hidden"
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredDonations.map((donation) => (
                  <DonationCard
                    key={donation.id}
                    donation={donation}
                    onClaim={handleClaimDonation}
                  />
                ))}
              </div>

              {filteredDonations.length === 0 && !isLoading && !error && (
                <div className="text-center py-12">
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg text-muted-foreground">
                    No donations found matching your criteria.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Try adjusting your filters or search terms, or check back later for new donations.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
