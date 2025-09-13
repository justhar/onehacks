"use client"

import React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Heart, Truck } from "lucide-react"
import { format } from "date-fns"

export function DonationForm() {
  const [formData, setFormData] = useState({
    foodName: "",
    description: "",
    category: "",
    quantity: "",
    unit: "",
    expiryDate: "",
    pickupTime: "",
    deliveryOffered: false,
    deliveryCost: "",
    specialInstructions: "",
    dietaryInfo: [] ,
  })

  const categories = [
    "Prepared Meals",
    "Fresh Produce",
    "Bakery Items",
    "Dairy Products",
    "Beverages",
    "Packaged Foods",
    "Frozen Items",
    "Other",
  ]

  const units = ["lbs", "kg", "portions", "items", "boxes", "bags"]

  const dietaryOptions = ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Nut-Free", "Halal", "Kosher"]

  const handleDietaryChange = (option, checked) => {
    setFormData((prev) => ({
      ...prev,
      dietaryInfo: checked ? [...prev.dietaryInfo, option] : prev.dietaryInfo.filter((item) => item !== option),
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Donation submitted:", formData)
    // TODO: Submit to backend
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Heart className="h-6 w-6 text-primary" />
          <span>Create Food Donation</span>
        </CardTitle>
        <CardDescription>
          Help reduce food waste by donating surplus food to local charities and food banks
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Food Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="foodName">Food Name *</Label>
                <Input
                  id="foodName"
                  value={formData.foodName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, foodName: e.target.value }))}
                  placeholder="e.g., Vegetable Soup"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the food item, ingredients, preparation method..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData((prev) => ({ ...prev, quantity: e.target.value }))}
                  placeholder="0"
                  required
                />
              </div>

              <div>
                <Label htmlFor="unit">Unit *</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, unit: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Expiry Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.expiryDate ? format(formData.expiryDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.expiryDate}
                      onSelect={(date) => setFormData((prev) => ({ ...prev, expiryDate: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Dietary Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Dietary Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {dietaryOptions.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={option}
                    checked={formData.dietaryInfo.includes(option)}
                    onCheckedChange={(checked) => handleDietaryChange(option, checked)}
                  />
                  <Label htmlFor={option} className="text-sm">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
            {formData.dietaryInfo.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {formData.dietaryInfo.map((info) => (
                  <Badge key={info} variant="secondary">
                    {info}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Pickup & Delivery */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Pickup & Delivery</h3>

            <div>
              <Label htmlFor="pickupTime">Available Pickup Time *</Label>
              <Input
                id="pickupTime"
                type="time"
                value={formData.pickupTime}
                onChange={(e) => setFormData((prev) => ({ ...prev, pickupTime: e.target.value }))}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="deliveryOffered"
                checked={formData.deliveryOffered}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, deliveryOffered: checked }))}
              />
              <Label htmlFor="deliveryOffered" className="flex items-center space-x-1">
                <Truck className="h-4 w-4" />
                <span>Offer delivery service</span>
              </Label>
            </div>

            {formData.deliveryOffered && (
              <div>
                <Label htmlFor="deliveryCost">Delivery Cost (optional)</Label>
                <Input
                  id="deliveryCost"
                  type="number"
                  step="0.01"
                  value={formData.deliveryCost}
                  onChange={(e) => setFormData((prev) => ({ ...prev, deliveryCost: e.target.value }))}
                  placeholder="0.00"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave blank for free delivery or enter cost to cover transportation
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="specialInstructions">Special Instructions</Label>
              <Textarea
                id="specialInstructions"
                value={formData.specialInstructions}
                onChange={(e) => setFormData((prev) => ({ ...prev, specialInstructions: e.target.value }))}
                placeholder="Any special handling, storage, or pickup instructions..."
                rows={2}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg">
            <Heart className="mr-2 h-5 w-5" />
            Create Donation Listing
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
