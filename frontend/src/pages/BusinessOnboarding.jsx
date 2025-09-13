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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
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

const BusinessOnboarding = () => {
  const [formData, setFormData] = useState({
    // Basic Info
    businessName: "",
    contactName: "",
    contactPhone: "",
    businessEmail: "",

    // Address Info
    address: "",
    mapNotes: "",

    // Payment Info
    bankName: "",
    accountNumber: "",
    accountHolder: "",
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
    navigate("/dashboard");
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
          formData.businessName &&
          formData.contactName &&
          formData.contactPhone &&
          formData.businessEmail
        );
      case 2:
        return formData.address;
      case 3:
        return (
          formData.bankName && formData.accountNumber && formData.accountHolder
        );
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

    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      setError("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const paymentInfo = {
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        accountHolder: formData.accountHolder,
      };

      const result = await api.completeBusinessOnboarding(token, {
        businessName: formData.businessName,
        contactName: formData.contactName,
        contactPhone: formData.contactPhone,
        businessEmail: formData.businessEmail,
        address: formData.address,
        latitude: position[0],
        longitude: position[1],
        mapNotes: formData.mapNotes,
        paymentInfo,
      });

      if (result.error) {
        setError(result.error);
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const stepTitles = {
    1: "Business Information",
    2: "Business Location",
    3: "Payment Setup",
  };

  const stepDescriptions = {
    1: "Tell us about your business and contact details",
    2: "Set your business location on the map",
    3: "Configure your payment information",
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-24 h-0.5 mx-2 ${
                      currentStep > step ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-medium text-foreground mb-2">
              {stepTitles[currentStep]}
            </h1>
            <p className="text-muted-foreground">
              {stepDescriptions[currentStep]}
            </p>
          </div>
        </div>

        <Card className="border-border">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert className="border-destructive/50 bg-destructive/10">
                  <AlertDescription className="text-destructive">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Business Name *</Label>
                      <Input
                        id="businessName"
                        name="businessName"
                        type="text"
                        value={formData.businessName}
                        onChange={handleChange}
                        className=" "
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactName">Contact Name *</Label>
                      <Input
                        id="contactName"
                        name="contactName"
                        type="text"
                        value={formData.contactName}
                        onChange={handleChange}
                        className=" "
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Contact Phone *</Label>
                      <Input
                        id="contactPhone"
                        name="contactPhone"
                        type="tel"
                        value={formData.contactPhone}
                        onChange={handleChange}
                        className=" "
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="businessEmail">Business Email *</Label>
                      <Input
                        id="businessEmail"
                        name="businessEmail"
                        type="email"
                        value={formData.businessEmail}
                        onChange={handleChange}
                        className=" "
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Address & Map */}
              {currentStep === 2 && (
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
              )}

              {/* Step 3: Payment Information */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="bankName">Bank Name *</Label>
                      <Select
                        value={formData.bankName}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, bankName: value }))
                        }
                      >
                        <SelectTrigger className=" ">
                          <SelectValue placeholder="Select your bank" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BCA">
                            Bank Central Asia (BCA)
                          </SelectItem>
                          <SelectItem value="BNI">
                            Bank Negara Indonesia (BNI)
                          </SelectItem>
                          <SelectItem value="BRI">
                            Bank Rakyat Indonesia (BRI)
                          </SelectItem>
                          <SelectItem value="Mandiri">Bank Mandiri</SelectItem>
                          <SelectItem value="CIMB">CIMB Niaga</SelectItem>
                          <SelectItem value="Danamon">Bank Danamon</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accountNumber">Account Number *</Label>
                      <Input
                        id="accountNumber"
                        name="accountNumber"
                        type="text"
                        value={formData.accountNumber}
                        onChange={handleChange}
                        className=" "
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accountHolder">
                        Account Holder Name *
                      </Label>
                      <Input
                        id="accountHolder"
                        name="accountHolder"
                        type="text"
                        value={formData.accountHolder}
                        onChange={handleChange}
                        className=" "
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="  px-8"
                >
                  Previous
                </Button>

                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={!validateStep(currentStep)}
                    className="  px-8"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={
                      isLoading ||
                      !validateStep(1) ||
                      !validateStep(2) ||
                      !validateStep(3)
                    }
                    className="  px-8"
                  >
                    {isLoading ? "Completing..." : "Complete Setup"}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BusinessOnboarding;
