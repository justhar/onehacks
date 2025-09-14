import { useState, useEffect, use } from "react";
import { MarketplaceHeader } from "@/components/MarketplaceHeader";
import { MarketplaceFilters } from "@/components/MarketplaceFilters";
import { FoodItemCard } from "@/components/FoodItemCard";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { SlidersHorizontal } from "lucide-react";
import { api } from "@/lib/api";
import { transformProductsData } from "@/lib/dataTransforms";
import { toast } from "sonner";

export default function MarketplacePage() {
  const [allItems, setAllItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [manualLocation, setManualLocation] = useState(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Function to fetch products with a specific location
  const fetchProductsWithLocation = async (lat, lng) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.getProductsNearby(lat, lng, 1000000000000000); // 10km radius
      const responseProduct = response.filter(
        (item) => item.type !== "donation"
      );
      const transformedProducts = transformProductsData(responseProduct);
      setAllItems(transformedProducts);
      console.log(response);
      console.log("transformed", transformedProducts);
      setFilteredItems(transformedProducts);
    } catch (error) {
      console.error("Error fetching nearby products:", error);
      // Fallback to all products
      try {
        const response = await api.getProducts();
        const responseProduct = response.filter(
          (item) => item.type !== "donation"
        );
        const transformedProducts = transformProductsData(responseProduct);
        console.log(response);
        console.log("transformed", transformedProducts);
        setAllItems(transformedProducts);
        setFilteredItems(transformedProducts);
      } catch (fallbackError) {
        setError("Failed to load products");
        console.error("Error fetching fallback products:", fallbackError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle manual location change from MarketplaceHeader
  const handleLocationChange = async (location) => {
    setManualLocation(location);
    setUserLocation({ lat: location.lat, lng: location.lng });
    await fetchProductsWithLocation(location.lat, location.lng);
  };

  // Fetch products on component mount
  useEffect(() => {
    // const fetchProducts = async () => {
    //   try {
    //     setIsLoading(true);
    //     setError(null);

    //     // Try to get user location for nearby products
    //     if (navigator.geolocation) {
    //       const options = {
    //         enableHighAccuracy: true,
    //         timeout: 10000, // 10 seconds
    //         maximumAge: 300000, // 5 minutes
    //       };

    //       navigator.geolocation.getCurrentPosition(
    //         async (position) => {
    //           const { latitude, longitude } = position.coords;
    //           setUserLocation({ lat: latitude, lng: longitude });

    //           try {
    //             const response = await api.getProductsNearby(
    //               latitude,
    //               longitude,
    //               1000
    //             ); // 10km radius
    //             const transformedProducts = transformProductsData(response);
    //             setAllItems(transformedProducts);
    //             setFilteredItems(transformedProducts);
    //           } catch (error) {
    //             console.error("Error fetching nearby products:", error);
    //             // Fallback to all products
    //             const response = await api.getProducts();
    //             const transformedProducts = transformProductsData(response);
    //             setAllItems(transformedProducts);
    //             setFilteredItems(transformedProducts);
    //           }
    //         },
    //         async (error) => {
    //           console.log("Geolocation error:", error);
    //           console.log("Error code:", error.code, "Message:", error.message);

    //           // Show user-friendly error message based on error code
    //           let errorMessage = "";
    //           switch (error.code) {
    //             case 1: // PERMISSION_DENIED
    //               errorMessage =
    //                 "Location access denied. Please set your location manually using the location button.";
    //               break;
    //             case 2: // POSITION_UNAVAILABLE
    //               errorMessage =
    //                 "Location unavailable. Please set your location manually using the location button.";
    //               break;
    //             case 3: // TIMEOUT
    //               errorMessage =
    //                 "Location request timed out. Please set your location manually using the location button.";
    //               break;
    //             default:
    //               errorMessage =
    //                 "Location error. Please set your location manually using the location button.";
    //           }

    //           // You could show this message to user with a toast/alert if needed
    //           console.log(errorMessage);

    //           // Instead of using fallback coordinates, just load all products
    //           // and let user set location manually via MarketplaceHeader
    //           try {
    //             const response = await api.getProducts();
    //             const transformedProducts = transformProductsData(response);
    //             setAllItems(transformedProducts);
    //             setFilteredItems(transformedProducts);
    //           } catch (fetchError) {
    //             setError("Failed to load products");
    //             console.error("Error fetching products:", fetchError);
    //           }
    //         },
    //         options
    //       );
    //     } else {
    //       // No geolocation support, load all products and let user set location manually
    //       console.log(
    //         "Geolocation not supported by this browser. Please set your location manually using the location button."
    //       );

    //       try {
    //         const response = await api.getProducts();
    //         const transformedProducts = transformProductsData(response);
    //         setAllItems(transformedProducts);
    //         setFilteredItems(transformedProducts);
    //       } catch (error) {
    //         setError("Failed to load products");
    //         console.error("Error fetching products:", error);
    //       }
    //     }
    //   } catch (error) {
    //     setError("Failed to load products");
    //     console.error("Error fetching products:", error);
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };

    // fetchProducts();
    if (navigator.geolocation) {
      console.log("Geolocation is supported");
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          await fetchProductsWithLocation(latitude, longitude);
          console.log("fetched");
        },
        (error) => {
          toast.error(
            "Failed to get your location. Please set it manually using the location button."
          );
          console.log("Geolocation error:", error);
          console.log("Error code:", error.code, "Message:", error.message);

          // Still load all products even if geolocation fails
          const loadFallbackProducts = async () => {
            setIsLoading(true);
            setError(null);
            try {
              const response = await api.getProducts();
              const responseProduct = response.filter(
                (item) => item.type !== "donation"
              );
              const transformedProducts =
                transformProductsData(responseProduct);
              setAllItems(transformedProducts);
              setFilteredItems(transformedProducts);
            } catch (fetchError) {
              setError("Failed to load products");
              console.error("Error fetching products:", fetchError);
            } finally {
              setIsLoading(false);
            }
          };

          loadFallbackProducts();
        }
      );
    } else {
      // No geolocation support, load all products
      const loadAllProducts = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await api.getProducts();
          const responseProduct = response.filter(
            (item) => item.type !== "donation"
          );
          const transformedProducts = transformProductsData(response);
          setAllItems(transformedProducts);
          setFilteredItems(transformedProducts);
        } catch (fetchError) {
          setError("Failed to load products");
          console.error("Error fetching products:", fetchError);
        } finally {
          setIsLoading(false);
        }
      };

      loadAllProducts();
    }
  }, []);

  const handleSearch = (query) => {
    const filtered = allItems.filter(
      (item) =>
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.restaurant.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredItems(filtered);
  };

  const handleSort = (sortBy) => {
    const sorted = [...filteredItems].sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.discountedPrice - b.discountedPrice;
        case "price-high":
          return b.discountedPrice - a.discountedPrice;
        case "discount":
          const aDiscount =
            ((a.originalPrice - a.discountedPrice) / a.originalPrice) * 100;
          const bDiscount =
            ((b.originalPrice - b.discountedPrice) / b.originalPrice) * 100;
          return bDiscount - aDiscount;
        case "rating":
          return b.rating - a.rating;
        default:
          return 0;
      }
    });
    setFilteredItems(sorted);
  };

  const handleFiltersChange = (filters) => {
    let filtered = [...allItems];

    if (filters.categories.length > 0) {
      filtered = filtered.filter((item) =>
        filters.categories.includes(item.category)
      );
    }

    if (filters.restaurants.length > 0) {
      filtered = filtered.filter((item) =>
        filters.restaurants.includes(item.restaurant)
      );
    }

    filtered = filtered.filter(
      (item) =>
        item.discountedPrice >= filters.priceRange[0] &&
        item.discountedPrice <= filters.priceRange[1]
    );

    setFilteredItems(filtered);
  };

  const handleAddToCart = (item) => {
    // TODO: Implement cart functionality
    console.log("Added to cart:", item);
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

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="ml-4 text-lg text-muted-foreground">
              Loading products...
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-lg text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        ) : (
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
                <p className="text-sm text-muted-foreground">
                  Showing {filteredItems.length} items
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
                {filteredItems.map((item) => (
                  <FoodItemCard
                    key={item.id}
                    item={item}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>

              {filteredItems.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <p className="text-lg text-muted-foreground">
                    No items found matching your criteria.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Try adjusting your filters or search terms.
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
