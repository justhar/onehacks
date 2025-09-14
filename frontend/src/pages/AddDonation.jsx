import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import ImageUpload from "@/components/ImageUpload";
import {
  Heart,
  Package,
  Upload,
  MapPin,
  X,
  ArrowLeft,
} from "lucide-react";

const FOOD_CATEGORIES = [
  "Main Dishes",
  "Appetizers",
  "Desserts",
  "Beverages",
  "Salads",
  "Soups",
  "Bakery Items",
  "Snacks",
  "Dairy Products",
  "Fruits & Vegetables",
  "Other",
];

export default function AddDonation() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    quantity: "",
    imageUrl: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      category: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    // Validation
    if (!formData.title.trim()) {
      setError("Donation item title is required");
      setIsLoading(false);
      return;
    }
    if (!formData.category) {
      setError("Please select a category");
      setIsLoading(false);
      return;
    }
    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      setError("Please enter a valid quantity");
      setIsLoading(false);
      return;
    }

    try {
      const donationData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price: 0, // Free for donations
        discount: 0,
        quantity: parseInt(formData.quantity),
        imageUrl: formData.imageUrl || null,
        type: "donation", // Mark as donation
      };

      const response = await api.createProduct(token, donationData);

      if (response.error) {
        setError(response.error);
      } else {
        setSuccess("Donation item added successfully!");
        // Reset form
        setFormData({
          title: "",
          description: "",
          category: "",
          quantity: "",
          imageUrl: "",
        });

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      }
    } catch (error) {
      console.error("Error adding donation:", error);
      setError("Failed to add donation item. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Add Donation Item
          </h1>
          <p className="text-muted-foreground">
            Add a food item for donation to help those in need. All donation items are free for recipients.
          </p>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <X className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-600">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <Heart className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">
              {success}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Donation Item Name *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Fresh Pasta Primavera"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {FOOD_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your donation item (ingredients, preparation, expiry, etc.)"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <ImageUpload
                  currentImageUrl={formData.imageUrl}
                  onImageChange={(imageUrl) => setFormData({...formData, imageUrl})}
                  folder="donations"
                />
              </div>
            </CardContent>
          </Card>

          {/* Quantity & Donation Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Donation Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity Available *</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    placeholder="1"
                    required
                  />
                </div>
                <div className="flex items-center justify-center">
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
                    <p className="text-sm font-medium">FREE DONATION</p>
                    <p className="text-xs text-muted-foreground">This item will be free for recipients</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">💡 Donation Tips</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Make sure food items are fresh and safe to consume</li>
                  <li>• Include expiry dates in the description if applicable</li>
                  <li>• Consider packaging and pickup instructions</li>
                  <li>• Your generous donation helps those in need</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Pickup Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  📍 Pickup location will be automatically set to your business address from your profile. 
                  Recipients will be able to collect donations from your registered business location.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Adding Donation...</span>
                </>
              ) : (
                <>
                  <Heart className="h-4 w-4" />
                  <span>Add Donation</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}