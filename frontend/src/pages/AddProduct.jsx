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
  DollarSign,
  Package,
  Percent,
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

export default function AddProduct() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    discount: "0",
    quantity: "",
    imageUrl: "",
    productType: "",
  });

  // Function to convert product type to human-readable title
  const getProductTitle = (productType) => {
    const titleMap = {
      "single-product": "Single Product",
      "mystery-bundle": "Mystery Bundle",
      "treasure-hamper": "Treasure Hamper",
    };
    return titleMap[productType] || productType;
  };

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

  const handleImageChange = (imageUrl) => {
    setFormData((prev) => ({
      ...prev,
      imageUrl: imageUrl,
    }));
  };

  const calculateFinalPrice = () => {
    const price = parseInt(formData.price) || 0;
    const discount = parseFloat(formData.discount) || 0;
    return Math.round(price - (price * discount) / 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    // Validatio
    if (!formData.productType) {
      setError("Please select a product type");
      setIsLoading(false);
      return;
    }
    if (!formData.category) {
      setError("Please select a category");
      setIsLoading(false);
      return;
    }
    if (!formData.price || parseInt(formData.price) <= 0) {
      setError("Please enter a valid price");
      setIsLoading(false);
      return;
    }
    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      setError("Please enter a valid quantity");
      setIsLoading(false);
      return;
    }

    try {
      const productData = {
        title: getProductTitle(formData.productType),
        description: formData.description,
        category: formData.category,
        price: parseInt(formData.price),
        discount: parseFloat(formData.discount) || 0,
        quantity: parseInt(formData.quantity),
        imageUrl: formData.imageUrl || null,
        type: "sell", // Default to sell type
      };

      const response = await api.createProduct(token, productData);

      if (response.error) {
        setError(response.error);
      } else {
        setSuccess("Product added successfully!");
        // Reset form
        setFormData({
          title: "",
          description: "",
          category: "",
          price: "",
          discount: "0",
          quantity: "",
          imageUrl: "",
          productType: "",
        });

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      }
    } catch (error) {
      console.error("Error adding product:", error);
      setError("Failed to add product. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Add New Product
          </h1>
          <p className="text-muted-foreground">
            Add a new food item to your marketplace listing. Location will be
            automatically set to your business address.
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
            <Package className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">
              {success}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Product Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Type
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="productType">Type of Product *</Label>
                  <div className="group relative">
                    <button
                      type="button"
                      className="w-4 h-4 rounded-full border border-muted-foreground text-xs flex items-center justify-center hover:bg-muted"
                    >
                      ?
                    </button>
                    <div className="absolute left-6 top-0 bg-popover border rounded-md p-3 shadow-lg z-10 w-80 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-semibold">Single Product:</span>{" "}
                          Individual food items sold separately
                        </div>
                        <div>
                          <span className="font-semibold">Mystery Bundle:</span>{" "}
                          Surprise selection of various food items at a
                          discounted price
                        </div>
                        <div>
                          <span className="font-semibold">
                            Treasure Hamper:
                          </span>{" "}
                          Curated collection of premium food items in an
                          attractive package
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <Select
                  value={formData.productType || ""}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, productType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mystery-bundle">
                      Mystery Bundle
                    </SelectItem>
                    <SelectItem value="treasure-hamper">
                      Treasure Hamper
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
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
                  placeholder="Describe your product (ingredients, preparation, etc.)"
                  rows={3}
                />
              </div>

              <ImageUpload
                currentImageUrl={formData.imageUrl}
                onImageChange={handleImageChange}
                disabled={isLoading}
                folder="products"
              />
            </CardContent>
          </Card>

          {/* Pricing & Inventory */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pricing & Inventory
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Original Price * (Rp)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount">Discount (%)</Label>
                  <div className="flex items-center space-x-2">
                    <Percent className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="discount"
                      name="discount"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discount}
                      onChange={handleInputChange}
                      placeholder="0"
                    />
                  </div>
                </div>

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
              </div>

              {formData.price && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Price Preview:
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-lg font-bold text-primary">
                      Rp{calculateFinalPrice()}
                    </span>
                    {formData.discount > 0 && (
                      <>
                        <span className="text-sm text-muted-foreground line-through">
                          Rp{formData.price}
                        </span>
                        <Badge variant="secondary">
                          {formData.discount}% OFF
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  📍 Your product location will be automatically set to your
                  business address from your profile. Customers will be able to
                  find your products at your registered business location.
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
              className="flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Adding Product...</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span>Add Product</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
