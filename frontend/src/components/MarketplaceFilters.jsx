import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import RcSlider from "rc-slider";
import "rc-slider/assets/index.css";

export function MarketplaceFilters({ onFiltersChange }) {
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedRestaurants, setSelectedRestaurants] = useState([]);

  const categories = [
    "Main Dishes",
    "Appetizers",
    "Desserts",
    "Beverages",
    "Salads",
    "Soups",
    "Bakery Items",
    "Fresh Produce",
  ];

  const restaurants = [
    "Green Bistro",
    "Farm Table",
    "Urban Kitchen",
    "Harvest Cafe",
    "Fresh Garden",
    "Local Eats",
  ];

  const handleCategoryChange = (category, checked) => {
    const updated = checked
      ? [...selectedCategories, category]
      : selectedCategories.filter((c) => c !== category);
    setSelectedCategories(updated);
    onFiltersChange?.({
      categories: updated,
      restaurants: selectedRestaurants,
      priceRange,
    });
  };

  const handleRestaurantChange = (restaurant, checked) => {
    const updated = checked
      ? [...selectedRestaurants, restaurant]
      : selectedRestaurants.filter((r) => r !== restaurant);
    setSelectedRestaurants(updated);
    onFiltersChange?.({
      categories: selectedCategories,
      restaurants: updated,
      priceRange,
    });
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedRestaurants([]);
    setPriceRange([0, 500000]); // full range
    onFiltersChange?.({
      categories: [],
      restaurants: [],
      priceRange: [0, 500000],
    });
  };

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedRestaurants.length > 0 ||
    priceRange[0] > 0 ||
    priceRange[1] < 500000;

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
          <RcSlider
            range
            min={0}
            max={500000}
            step={1000}
            value={priceRange}
            onChange={(value) => {
              setPriceRange(value);
              onFiltersChange?.({
                categories: selectedCategories,
                restaurants: selectedRestaurants,
                priceRange: value,
              });
            }}
            className="mb-2 rc-slider-custom
             [&_.rc-slider-track]:bg-green-600
             [&_.rc-slider-rail]:bg-gray-200
             [&_.rc-slider-handle]:border-green-600
             [&_.rc-slider-handle]:bg-white
             [&_.rc-slider-handle:hover]:shadow-md
             [&_.rc-slider-handle:active]:shadow-lg"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Rp{priceRange[0]}</span>
            <span>Rp{priceRange[1]}</span>
          </div>
        </div>

        {/* Input Boxes for Min & Max */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col w-1/2">
            <Label htmlFor="minPrice" className="text-xs mb-1">
              Min
            </Label>
            <Input
              id="minPrice"
              type="number"
              value={priceRange[0]}
              min={0}
              max={priceRange[1]}
              step={1000}
              onChange={(e) => {
                const newMin = Number(e.target.value);
                const newRange = [
                  Math.min(newMin, priceRange[1]),
                  priceRange[1],
                ];
                setPriceRange(newRange);
                onFiltersChange?.({
                  categories: selectedCategories,
                  restaurants: selectedRestaurants,
                  priceRange: newRange,
                });
              }}
            />
          </div>

          <div className="flex flex-col w-1/2">
            <Label htmlFor="maxPrice" className="text-xs mb-1">
              Max
            </Label>
            <Input
              id="maxPrice"
              type="number"
              value={priceRange[1]}
              min={priceRange[0]}
              max={500000}
              step={1000}
              onChange={(e) => {
                const newMax = Number(e.target.value);
                const newRange = [
                  priceRange[0],
                  Math.max(newMax, priceRange[0]),
                ];
                setPriceRange(newRange);
                onFiltersChange?.({
                  categories: selectedCategories,
                  restaurants: selectedRestaurants,
                  priceRange: newRange,
                });
              }}
            />
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
                  onCheckedChange={(checked) =>
                    handleCategoryChange(category, checked)
                  }
                />
                <Label
                  htmlFor={category}
                  className="text-sm font-normal cursor-pointer"
                >
                  {category}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Active Filters
            </Label>
            <div className="flex flex-wrap gap-1">
              {selectedCategories.map((category) => (
                <Badge key={category} variant="secondary" className="text-xs">
                  {category}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => handleCategoryChange(category, false)}
                  />
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
  );
}
