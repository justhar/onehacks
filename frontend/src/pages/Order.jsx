import { useParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import React from "react";
import {
  CheckCircle,
  MapPin,
  Star,
  ArrowLeft,
  Package,
  Truck,
} from "lucide-react";
import { Link } from "react-router";

// Mock order data - in real app this would come from the cart/order system
const mockOrderData = {
  orderId: "ORD-2024-001",
  status: "confirmed",
  estimatedPickup: "Today, 3:00 PM - 4:00 PM",
  restaurant: {
    name: "Green Bistro",
    address: "123 Main St, Downtown",
    phone: "(555) 123-4567",
    distance: "0.5 mi",
  },
  items: [
    {
      id: "1",
      name: "Pasta Primavera",
      description:
        "Fresh seasonal vegetables with penne pasta in a light cream sauce",
      originalPrice: 18.99,
      discountedPrice: 12.99,
      quantity: 1,
      category: "Main Dishes",
      rating: 4.8,
    },
  ],
  subtotal: 12.99,
  deliveryFee: 0,
  tax: 1.04,
  total: 14.03,
  paymentMethod: "Credit Card ending in 4242",
  deliveryType: "pickup",
};

export default function Order() {
  const params = useParams();
  const deliveryType = params.id || "pickup"; // default to pickup if not specified

  const orderData = {
    ...mockOrderData,
    deliveryType: deliveryType,
    deliveryFee: deliveryType === "delivery" ? 2.99 : 0,
    total: deliveryType === "delivery" ? 16.02 : 14.03,
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Order Confirmed!
        </h1>
        <p className="text-muted-foreground">
          Your order has been placed successfully. You'll receive a confirmation
          email shortly.
        </p>
      </div>

      {/* Order Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Order Details</span>
            <Badge variant="secondary">{orderData.orderId}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Restaurant Info */}
          <div className="flex items-start space-x-3 p-4 bg-muted rounded-lg">
            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">
                {orderData.restaurant.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {orderData.restaurant.address}
              </p>
              <p className="text-sm text-muted-foreground">
                {orderData.restaurant.phone}
              </p>
              <p className="text-sm text-primary font-medium">
                {orderData.restaurant.distance} away
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-primary/5 rounded-lg">
            {orderData.deliveryType === "delivery" ? (
              <Truck className="h-5 w-5 text-primary" />
            ) : (
              <Package className="h-5 w-5 text-primary" />
            )}
            <div>
              <h4 className="font-semibold text-foreground">
                {orderData.deliveryType === "delivery"
                  ? "Estimated Delivery Time"
                  : "Estimated Pickup Time"}
              </h4>
              <p className="text-sm text-muted-foreground">
                {orderData.estimatedPickup}
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h4 className="font-semibold text-foreground mb-3">
              Items Ordered
            </h4>
            {orderData.items.map((item) => (
              <div
                key={item.id}
                className="flex items-start space-x-3 p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <h5 className="font-medium text-foreground">{item.name}</h5>
                    <div className="flex items-center space-x-1 text-sm">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-muted-foreground">
                        {item.rating}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{item.category}</Badge>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground line-through">
                        ${item.originalPrice}
                      </span>
                      <span className="font-semibold text-primary">
                        ${item.discountedPrice}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        × {item.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Order Summary */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">${orderData.subtotal}</span>
            </div>
            {orderData.deliveryType === "delivery" && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span className="text-foreground">
                  ${orderData.deliveryFee}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax</span>
              <span className="text-foreground">${orderData.tax}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span className="text-foreground">Total</span>
              <span className="text-primary">${orderData.total}</span>
            </div>
          </div>

          <Separator />

          {/* Payment Method */}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Payment Method</span>
            <span className="text-foreground">{orderData.paymentMethod}</span>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button asChild className="flex-1">
          <Link href="/marketplace">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Continue Shopping
          </Link>
        </Button>
        <Button variant="outline" className="flex-1 bg-transparent" asChild>
          <Link href="/orders">Track Order</Link>
        </Button>
      </div>

      {/* Help Text */}
      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h4 className="font-semibold text-foreground mb-2">What's Next?</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>
            • You'll receive a confirmation email with{" "}
            {orderData.deliveryType === "delivery" ? "delivery" : "pickup"}{" "}
            instructions
          </li>
          <li>
            • The restaurant will prepare your order for the estimated{" "}
            {orderData.deliveryType === "delivery" ? "delivery" : "pickup"} time
          </li>
          {orderData.deliveryType === "pickup" && (
            <li>
              • Bring a valid ID and your order confirmation when picking up
            </li>
          )}
          <li>• Contact the restaurant directly if you need to make changes</li>
        </ul>
      </div>
    </main>
  );
}
