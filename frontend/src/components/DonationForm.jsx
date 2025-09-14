"use client";

import React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Heart, Truck } from "lucide-react";
import { format } from "date-fns";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";

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
    dietaryInfo: [],
    address: "", // <--- tambahin ini
  });

  const categories = [
    "Prepared Meals",
    "Fresh Produce",
    "Bakery Items",
    "Dairy Products",
    "Beverages",
    "Packaged Foods",
    "Frozen Items",
    "Other",
  ];

  const units = ["lbs", "kg", "portions", "items", "boxes", "bags"];

  const dietaryOptions = [
    "Vegetarian",
    "Vegan",
    "Gluten-Free",
    "Dairy-Free",
    "Nut-Free",
    "Halal",
    "Kosher",
  ];

  const [position, setPosition] = useState([51.505, -0.09]); // default koordinat
  const [addressSuggestions, setAddressSuggestions] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressSelect = (suggestion) => {
    setFormData((prev) => ({ ...prev, address: suggestion.display_name }));
    setAddressSuggestions([]);
  };

  const handleSetLocation = () => {
    console.log("Location saved:", formData.address, position);
  };

  const LocationMarker = ({ position, setPosition, setFormData }) => {
    const map = useMapEvents({
      click: async (e) => {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);

        // Reverse geocoding to get address
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            {
              method: "GET",
              headers: {
                "User-Agent": "OneHacks-FoodMarketplace/1.0",
              },
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          if (data.display_name) {
            setFormData((prev) => ({
              ...prev,
              address: data.display_name,
            }));
          } else {
            // Fallback: set coordinates as address if reverse geocoding fails
            setFormData((prev) => ({
              ...prev,
              address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
            }));
          }
        } catch (error) {
          console.error("Reverse geocoding failed:", error);
          // Fallback: set coordinates as address
          setFormData((prev) => ({
            ...prev,
            address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          }));
        }
      },
    });

    useEffect(() => {
      map.flyTo(position, map.getZoom());
    }, [position, map]);

    return position ? <Marker position={position} /> : null;
  };

  const handleDietaryChange = (option, checked) => {
    setFormData((prev) => ({
      ...prev,
      dietaryInfo: checked
        ? [...prev.dietaryInfo, option]
        : prev.dietaryInfo.filter((item) => item !== option),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Donation submitted:", formData);
    // TODO: Submit to backend
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Heart className="h-6 w-6 text-primary" />
          <span>Create Food Donation</span>
        </CardTitle>
        <CardDescription>
          Help reduce food waste by donating surplus food to local charities and
          food banks
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
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      foodName: e.target.value,
                    }))
                  }
                  placeholder="e.g., Vegetable Soup"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, category: value }))
                  }
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
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe the food item, ingredients, preparation method..."
                rows={3}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Dialog>
                <DialogTrigger asChild>
                  <div className="relative flex py-2 sm:py-0 flex-row gap-2 items-center border rounded-md bg-foreground max-w-[300px]">
                    <MapPin className="h-5 w-5 ml-3 text-accent flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-sm mr-4 text-accent block truncate">
                        {formData.address
                          ? formData.address.length > 30
                            ? `${formData.address.substring(0, 30)}...`
                            : formData.address
                          : "Click to set location"}
                      </span>
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className=" overflow-auto max-h-[70vh]">
                  <div className="mx-auto w-full max-w-sm">
                    <DialogHeader>
                      <DialogTitle>Set Your Location</DialogTitle>
                      <DialogDescription>
                        Set your location to find food near you.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="address">Charity Address *</Label>
                        <div className="relative">
                          <Input
                            id="address"
                            name="address"
                            type="text"
                            value={formData.address}
                            onChange={handleChange}
                            className=" "
                            placeholder="Enter your business address or click on the map"
                            required
                          />
                          {addressSuggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 bg-card border border-border   mt-1 shadow-lg z-50">
                              {addressSuggestions.map((suggestion, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  className="w-full text-left px-4 py-3 hover:bg-accent hover:text-accent-foreground text-sm border-b border-border last:border-b-0 first:rounded-t-lg last:rounded-b-lg"
                                  onClick={() =>
                                    handleAddressSelect(suggestion)
                                  }
                                >
                                  {suggestion.display_name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Location on Map</Label>
                        <div
                          className=" rounded-md overflow-hidden border border-border"
                          style={{ height: "300px" }}
                        >
                          <MapContainer
                            center={position}
                            zoom={13}
                            style={{ height: "100%", width: "100%" }}
                          >
                            <TileLayer
                              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <LocationMarker
                              position={position}
                              setPosition={setPosition}
                              setFormData={setFormData}
                            />
                          </MapContainer>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Click on the map to set your charity location, or
                          search for an address above
                        </p>
                      </div>
                    </div>

                    <DialogFooter className="mt-4">
                      <DialogClose asChild>
                        <Button onClick={handleSetLocation}>
                          Set Location
                        </Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                    </DialogFooter>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        quantity: e.target.value,
                      }))
                    }
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="unit">Unit *</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, unit: value }))
                  }
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
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal bg-transparent"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.expiryDate
                        ? format(formData.expiryDate, "PPP")
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.expiryDate}
                      onSelect={(date) =>
                        setFormData((prev) => ({ ...prev, expiryDate: date }))
                      }
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
                    onCheckedChange={(checked) =>
                      handleDietaryChange(option, checked)
                    }
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
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    pickupTime: e.target.value,
                  }))
                }
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="deliveryOffered"
                checked={formData.deliveryOffered}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, deliveryOffered: checked }))
                }
              />
              <Label
                htmlFor="deliveryOffered"
                className="flex items-center space-x-1"
              >
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
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      deliveryCost: e.target.value,
                    }))
                  }
                  placeholder="0.00"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave blank for free delivery or enter cost to cover
                  transportation
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="specialInstructions">Special Instructions</Label>
              <Textarea
                id="specialInstructions"
                value={formData.specialInstructions}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    specialInstructions: e.target.value,
                  }))
                }
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
  );
}
