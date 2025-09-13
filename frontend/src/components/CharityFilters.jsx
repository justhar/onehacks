"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { X, Filter } from 'lucide-react'

export function CharityFilters ({ onFiltersChange }) {
  const [selectedCategories, setSelectedCategories] = useState([]); 
  const [selectedDietary, setSelectedDietary] = useState([]);
  const [deliveryOnly, setDeliveryOnly] = useState(false) 

  const categories = [
    "Prepared Meals", "Fresh Produce", "Bakery Items", 
    "Dairy Products", "Beverages", "Packaged Foods", "Frozen Items"
  ]

  const dietaryOptions = ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Nut-Free", "Halal", "Kosher"]

  const hasActiveFilters =
  selectedCategories.length > 0 ||
  selectedDietary.length > 0 ||
  deliveryOnly; 

  const clearFilters = () => {
  setSelectedCategories([]);
  setSelectedDietary([]);
  setDeliveryOnly(false);
  onFiltersChange?.({ categories: [], dietary: [], deliveryOnly: false });
};

// Category filter handler
const handleCategoryChange = (category, checked) => {
  setSelectedCategories(prev =>
    checked ? [...prev, category] : prev.filter(c => c !== category)
  );
  onFiltersChange?.({
    categories: checked ? [...selectedCategories, category] : selectedCategories.filter(c => c !== category),
    dietary: selectedDietary,
    deliveryOnly
  });
};

// Dietary filter handler
const handleDietaryChange = (dietary, checked) => {
  setSelectedDietary(prev =>
    checked ? [...prev, dietary] : prev.filter(d => d !== dietary)
  );
  onFiltersChange?.({
    categories: selectedCategories,
    dietary: checked ? [...selectedDietary, dietary] : selectedDietary.filter(d => d !== dietary),
    deliveryOnly
  });
};

// Delivery filter handler
const handleDeliveryChange = (checked) => {
  setDeliveryOnly(!!checked);
  onFiltersChange?.({
    categories: selectedCategories,
    dietary: selectedDietary,
    deliveryOnly: !!checked
  });
};

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
        {/* Food Categories */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Food Categories</Label>
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

        {/* Dietary Requirements */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Dietary Requirements</Label>
          <div className="space-y-2">
            {dietaryOptions.map((dietary) => (
              <div key={dietary} className="flex items-center space-x-2">
                <Checkbox
                  id={dietary}
                  checked={selectedDietary.includes(dietary)}
                  onCheckedChange={(checked) => handleDietaryChange(dietary, checked )}
                />
                <Label htmlFor={dietary} className="text-sm font-normal cursor-pointer">
                  {dietary}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Options */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Delivery Options</Label>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="deliveryOnly" 
              checked={deliveryOnly} 
              onCheckedChange={handleDeliveryChange} 
            />
            <Label htmlFor="deliveryOnly" className="text-sm font-normal cursor-pointer">
              Delivery available only
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}