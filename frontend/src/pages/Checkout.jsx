import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  CreditCard,
  Truck,
  Package,
  ArrowLeft,
  Star,
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router";
import Navigation from "@/components/Navigation";

// Mock item data - in real app this would come from cart/item selection
const mockItem = {
  id: "1",
  name: "Pasta Primavera",
  description:
    "Fresh seasonal vegetables with penne pasta in a light cream sauce",
  originalPrice: 18.99,
  discountedPrice: 12.99,
  restaurant: "Green Bistro",
  category: "Main Dishes",
  rating: 4.8,
  image: "/pasta-primavera-dish.jpg",
  quantity: 1,
};
export default function Checkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const itemName = searchParams.get("item") || mockItem.name;
  const [deliveryOption, setDeliveryOption] = useState("pickup");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [phone, setPhone] = useState("");

  const subtotal = mockItem.discountedPrice;
  const deliveryFee = deliveryOption === "delivery" ? 2.99 : 0;
  const tax = (subtotal + deliveryFee) * 0.08;
  const total = subtotal + deliveryFee + tax;
  const handlePlaceOrder = () => {
    // In real app, this would process the order
    navigate(
      `/order-confirmation?item=${encodeURIComponent(
        itemName
      )}&delivery=${deliveryOption}`
    );
  };

  return (
    <>
      <main className="container mx-auto px-4 py-8 ">
        <div className="mb-6">
          <Button asChild variant="ghost" className="mb-4">
            <Link to="/marketplace">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Marketplace
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Checkout</h1>
          <p className="text-muted-foreground">Complete your order details</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="h-5 w-5 mr-2" />
                  Delivery Options
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={deliveryOption}
                  onValueChange={setDeliveryOption}
                >
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="pickup" id="pickup" />
                    <Label htmlFor="pickup" className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Pickup</div>
                          <div className="text-sm text-muted-foreground">
                            Ready in 15-30 minutes
                          </div>
                        </div>
                        <Package className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="delivery" id="delivery" />
                    <Label htmlFor="delivery" className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Delivery</div>
                          <div className="text-sm text-muted-foreground">
                            30-45 minutes • $2.99 fee
                          </div>
                        </div>
                        <Truck className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Delivery Address */}
            {deliveryOption === "delivery" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Delivery Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      placeholder="123 Main St, Apt 4B"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input id="city" placeholder="New York" />
                    </div>
                    <div>
                      <Label htmlFor="zip">ZIP Code</Label>
                      <Input id="zip" placeholder="10001" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Special Instructions (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special requests or delivery instructions..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card">Credit/Debit Card</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="apple">Apple Pay</SelectItem>
                    <SelectItem value="google">Google Pay</SelectItem>
                  </SelectContent>
                </Select>

                {paymentMethod === "card" && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input id="expiry" placeholder="MM/YY" />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input id="cvv" placeholder="123" />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Item Details */}
                <div className="flex items-start space-x-3 p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <h5 className="font-medium text-foreground">
                        {mockItem.name}
                      </h5>
                      <div className="flex items-center space-x-1 text-sm">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-muted-foreground">
                          {mockItem.rating}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {mockItem.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{mockItem.category}</Badge>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground line-through">
                          ${mockItem.originalPrice}
                        </span>
                        <span className="font-semibold text-primary">
                          ${mockItem.discountedPrice}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      From {mockItem.restaurant}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                  {deliveryOption === "delivery" && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Delivery Fee
                      </span>
                      <span className="text-foreground">
                        ${deliveryFee.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="text-foreground">${tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span className="text-foreground">Total</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>

                <Button onClick={handlePlaceOrder} className="w-full" size="lg">
                  Place Order
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  By placing this order, you agree to our Terms of Service and
                  Privacy Policy.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
