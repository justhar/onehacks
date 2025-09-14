import React from "react";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/navigation";
import { DonationCard } from "@/components/DonationCard";
import { CharityFilters } from "@/components/CharityFilters";
import { DonationForm } from "@/components/DonationForm";
import { MarketplaceHeader } from "@/components/MarketplaceHeader";
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
import {
  Search,
  SlidersHorizontal,
  Heart,
  Users,
  Package,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api";
import { transformProductsData } from "@/lib/dataTransforms";
import { toast } from "sonner";

// Transform donation data from API format to DonationCard format
const transformDonationData = (apiDonation) => {
  return {
    id: apiDonation.id,
    foodName: apiDonation.title || apiDonation.name,
    description: apiDonation.description || "",
    category: apiDonation.category || "Other",
    quantity: apiDonation.quantity || 1,
    unit: "portions", // Default unit, could be enhanced based on category
    restaurant:
      apiDonation.businessName || apiDonation.restaurant || "Unknown Business",
    expiryDate: apiDonation.expiryDate
      ? new Date(apiDonation.expiryDate).toLocaleDateString()
      : "N/A",
    pickupTime: "Contact business", // Default message, could be enhanced
    deliveryOffered: false, // Default to false, could be enhanced
    deliveryCost: 0,
    distance: apiDonation.distance
      ? `${(apiDonation.distance / 1000).toFixed(1)} km`
      : "N/A",
    dietaryInfo: [], // Could be enhanced based on description or tags
    image: apiDonation.image || apiDonation.imageUrl || "/placeholder.svg",
    createdAt: apiDonation.createdAt
      ? new Date(apiDonation.createdAt).toLocaleDateString()
      : "Recently",
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
  const [userLocation, setUserLocation] = useState(null);
  const [manualLocation, setManualLocation] = useState(null);

  // Function to fetch donations with a specific location
  const fetchDonationsWithLocation = async (lat, lng) => {
    setIsLoading(true);
    setError("");
    try {
      const response = await api.getDonationsNearby(lat, lng, 1000000000000000); // 10km radius
      const transformedDonations = response.map(transformDonationData);
      setDonations(transformedDonations);
      console.log("Nearby donations:", transformedDonations);
      setFilteredDonations(transformedDonations);
    } catch (error) {
      console.error("Error fetching nearby donations:", error);
      // Fallback to all donations
      try {
        const response = await api.getDonations();
        const transformedDonations = response.map(transformDonationData);
        setDonations(transformedDonations);
        setFilteredDonations(transformedDonations);
      } catch (fallbackError) {
        setError("Failed to load donations");
        console.error("Error fetching fallback donations:", fallbackError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle manual location change from MarketplaceHeader
  const handleLocationChange = async (location) => {
    setManualLocation(location);
    setUserLocation({ lat: location.lat, lng: location.lng });
    await fetchDonationsWithLocation(location.lat, location.lng);
  };

  // Fetch donations on component mount
  useEffect(() => {
    const initializeData = async () => {
      if (navigator.geolocation) {
        console.log("Geolocation is supported");
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            setUserLocation({ lat: latitude, lng: longitude });
            await fetchDonationsWithLocation(latitude, longitude);
            console.log("fetched nearby donations");
          },
          (error) => {
            toast.error(
              "Failed to get your location. Please set it manually using the location button."
            );
            console.log("Geolocation error:", error);
            console.log("Error code:", error.code, "Message:", error.message);

            // Still load all donations even if geolocation fails
            const loadFallbackDonations = async () => {
              setIsLoading(true);
              setError("");
              try {
                const response = await api.getDonations();
                const transformedDonations = response.map(
                  transformDonationData
                );
                setDonations(transformedDonations);
                setFilteredDonations(transformedDonations);
              } catch (fetchError) {
                setError("Failed to load donations");
                console.error("Error fetching donations:", fetchError);
              } finally {
                setIsLoading(false);
              }
            };

            loadFallbackDonations();
          }
        );
      } else {
        // No geolocation support, load all donations
        const loadAllDonations = async () => {
          setIsLoading(true);
          setError("");
          try {
            const response = await api.getDonations();
            const transformedDonations = response.map(transformDonationData);
            setDonations(transformedDonations);
            setFilteredDonations(transformedDonations);
          } catch (fetchError) {
            setError("Failed to load donations");
            console.error("Error fetching donations:", fetchError);
          } finally {
            setIsLoading(false);
          }
        };

        loadAllDonations();
      }
    };

    initializeData();
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
          // Parse distance from "X.X km" format or return large number if N/A
          const aDistance =
            a.distance && a.distance !== "N/A"
              ? parseFloat(a.distance.replace(" km", ""))
              : 999;
          const bDistance =
            b.distance && b.distance !== "N/A"
              ? parseFloat(b.distance.replace(" km", ""))
              : 999;
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

  const handleSetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          console.log("User location:", coords);
          setUserLocation(coords);
        },
        (err) => {
          console.error("Error getting location:", err);
          alert("Unable to fetch location");
        }
      );
    } else {
      alert("Geolocation not supported");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <MarketplaceHeader
          onSearch={handleSearch}
          onSort={handleSort}
          onToggleFilters={() => setIsFiltersOpen(true)}
          onLocationChange={handleLocationChange}
        />

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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="ml-4 text-lg text-muted-foreground">
              Loading donations...
            </p>
          </div>
        ) : (
          <div className="mt-8 flex gap-8">
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
                    Try adjusting your filters or search terms, or check back
                    later for new donations.
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
