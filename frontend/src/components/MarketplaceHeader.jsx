import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, MapPin, Search, SlidersHorizontal } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { MapContainer, TileLayer } from "react-leaflet";
import { Marker, useMapEvents } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});
export const LocationMarker = ({ position, setPosition, setFormData }) => {
  const map = useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);

      // Reverse geocoding to get address
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
        );
        const data = await response.json();
        if (data.display_name) {
          setFormData((prev) => ({
            ...prev,
            address: data.display_name,
          }));
        }
      } catch (error) {
        console.error("Reverse geocoding failed:", error);
      }
    },
  });

  useEffect(() => {
    map.flyTo(position, map.getZoom());
  }, [position, map]);

  return position ? <Marker position={position} /> : null;
};

export function MarketplaceHeader({ onSearch, onSort, onToggleFilters }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    address: "",
    mapNotes: "",
  });

  const [position, setPosition] = useState([51.505, -0.09]); // Default to London
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (e.target.name === "address") {
      fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          e.target.value
        )}&addressdetails=1&limit=5`
      )
        .then((res) => res.json())
        .then((data) => {
          setAddressSuggestions(data);
        })
        .catch((err) => {
          console.error("Error fetching address suggestions:", err);
        });
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Food Marketplace</h1>
        <p className="text-muted-foreground">
          Discover discounted surplus food from local restaurants
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Dialog>
          <DialogTrigger asChild>
            <div className="relative flex py-2 sm:py-0 flex-row gap-2 items-center border rounded-md bg-foreground">
              <MapPin className="h-5 w-5 ml-3 text-accent" />
              <div>
                <span className="text-sm text-accent font-medium">
                  Location:{" "}
                </span>
                <span className="font-medium text-sm mr-4 text-accent">
                  Bla bla
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
                  <Label htmlFor="address">Business Address *</Label>
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
                            onClick={() => handleAddressSelect(suggestion)}
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
                    Click on the map to set your business location, or search
                    for an address above
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mapNotes">Location Notes (Optional)</Label>
                  <Textarea
                    id="mapNotes"
                    name="mapNotes"
                    value={formData.mapNotes}
                    onChange={handleChange}
                    placeholder="Add any notes about your location (e.g., specific building, floor, landmarks)"
                    className=" "
                  />
                </div>
              </div>
              <DialogFooter>
                <Button>Submit</Button>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
        <form onSubmit={handleSearch} className="flex-3 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for food, restaurants, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit">Search</Button>
        </form>

        <div className="flex gap-2">
          <Select onValueChange={onSort}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="discount">Highest Discount</SelectItem>
              <SelectItem value="expiry">Expiring Soon</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="distance">Nearest First</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={onToggleFilters}
            className="sm:hidden bg-transparent"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
