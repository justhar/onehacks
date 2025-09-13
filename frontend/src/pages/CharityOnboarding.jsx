import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Alert, AlertDescription } from "../components/ui/alert";
import { api } from "../lib/api";
import "leaflet/dist/leaflet.css";

// Fix leaflet default markers
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

const CharityOnboarding = () => {
  const [formData, setFormData] = useState({
    // Basic Info
    charityName: "",
    contactName: "",
    contactPhone: "",
    charityEmail: "",

    // Address Info
    address: "",
  });

  const [position, setPosition] = useState([-6.2088, 106.8456]); // Default to Jakarta
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const searchTimeout = useRef(null);

  if (user.isOnboardingCompleted) {
    navigate("/donate");
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Address autocomplete
    if (name === "address") {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }

      searchTimeout.current = setTimeout(async () => {
        if (value.trim().length > 2) {
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                value
              )}&limit=5&countrycodes=id`
            );
            const data = await response.json();
            setAddressSuggestions(data);
          } catch (error) {
            console.error("Address search failed:", error);
          }
        } else {
          setAddressSuggestions([]);
        }
      }, 300);
    }
  };

  const handleAddressSelect = (suggestion) => {
    const { display_name, lat, lon } = suggestion;
    setFormData((prev) => ({ ...prev, address: display_name }));
    setPosition([parseFloat(lat), parseFloat(lon)]);
    setAddressSuggestions([]);
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return (
          formData.charityName &&
          formData.contactName &&
          formData.contactPhone &&
          formData.charityEmail
        );
      case 2:
        return formData.address;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
      setError("");
    } else {
      setError("Please fill in all required fields for this step");
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => prev - 1);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(1) || !validateStep(2)) {
      setError("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await api.completeCharityOnboarding(token, {
        charityName: formData.charityName,
        contactName: formData.contactName,
        contactPhone: formData.contactPhone,
        charityEmail: formData.charityEmail,
        address: formData.address,
        latitude: position[0],
        longitude: position[1],
      });

      if (result.error) {
        setError(result.error);
      } else {
        navigate("/donate");
      }
    } catch (error) {
      console.error("Charity onboarding error:", error);
      setError("Failed to complete onboarding. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Charity Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="charityName">Charity Name *</Label>
                  <Input
                    id="charityName"
                    name="charityName"
                    value={formData.charityName}
                    onChange={handleChange}
                    placeholder="e.g., Hope Foundation"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contactName">Contact Person Name *</Label>
                  <Input
                    id="contactName"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    placeholder="Primary contact person"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactPhone">Contact Phone *</Label>
                  <Input
                    id="contactPhone"
                    name="contactPhone"
                    type="tel"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    placeholder="+62 8XX XXXX XXXX"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="charityEmail">Charity Email *</Label>
                  <Input
                    id="charityEmail"
                    name="charityEmail"
                    type="email"
                    value={formData.charityEmail}
                    onChange={handleChange}
                    placeholder="contact@charity.org"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!validateStep(1)}
                >
                  Next: Address
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Charity Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">Charity Address *</Label>
                <div className="relative">
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter your charity's address"
                    required
                  />
                  {addressSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {addressSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                          onClick={() => handleAddressSelect(suggestion)}
                        >
                          {suggestion.display_name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="h-64">
                <Label>Click on the map to select your charity location</Label>
                <MapContainer
                  center={position}
                  zoom={13}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationMarker
                    position={position}
                    setPosition={setPosition}
                    setFormData={setFormData}
                  />
                </MapContainer>
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={handlePrevious}>
                  Previous
                </Button>
                <Button
                  type="submit"
                  disabled={!validateStep(2) || isLoading}
                >
                  {isLoading ? "Completing..." : "Complete Onboarding"}
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Charity Onboarding
          </h1>
          <p className="text-muted-foreground">
            Complete your charity profile to start accessing food donations.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                1
              </div>
              <span>Charity Info</span>
            </div>
            <div className={`flex-1 h-px ${currentStep >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                2
              </div>
              <span>Address</span>
            </div>
          </div>
        </div>

        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {renderStep()}
        </form>
      </div>
    </div>
  );
};

export default CharityOnboarding;