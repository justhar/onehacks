import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
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
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";
import Layout from "../components/Layout";
import PaymentComponent from "../components/PaymentComponent";
export default function Order() {
  const params = useParams();
  const { user, token } = useAuth();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const handlePaymentSuccess = async (paymentResult) => {
    console.log("Payment success callback triggered:", paymentResult);

    try {
      console.log("Manually updating payment status...");

      // Extract transaction ID from Midtrans result
      const transactionId =
        paymentResult.transaction_id || paymentResult.order_id;

      // Call our backend API to manually update payment status
      const updateResult = await api.updatePaymentSuccess(
        token,
        order.id,
        transactionId
      );

      if (updateResult.success) {
        console.log("Payment status updated successfully!");
        // Refresh the order data to show updated payment status
        await fetchOrder();
      } else {
        console.error("Failed to update payment status:", updateResult.error);
        setError(
          "Payment successful but failed to update status. Please refresh the page."
        );
      }
    } catch (error) {
      console.error("Error in handlePaymentSuccess:", error);
      setError(
        "Payment successful but failed to update status. Please refresh the page."
      );
      // Still try to refresh the order data
      await fetchOrder();
    }
  };

  const fetchOrder = async () => {
    if (!params.id || !token) return;

    try {
      setIsLoading(true);
      // Since we don't have a specific endpoint for single order, we'll get all orders and filter
      const response = await api.getOrders(token);
      const foundOrder = response.find((o) => o.id.toString() === params.id);
      setOrder(foundOrder);
      console.log(foundOrder);
    } catch (error) {
      console.error("Failed to fetch order:", error);
      setError("Failed to load order details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [params.id, token]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary">
          good
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Order not found</h2>
          <Button asChild>
            <Link to="/orders">Back to Orders</Link>
          </Button>
        </div>
      </div>
    );
  }
  const deliveryType = params.id || "pickup"; // default to pickup if not specified

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Order Details
        </h1>
        <p className="text-muted-foreground">
          Order #{order.id} -{" "}
          {order.paymentStatus === "success" ? "Paid" : "Payment Pending"}
        </p>
      </div>

      {/* Order Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Order Details</span>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">ORD-{order.id}</Badge>
              <Badge
                variant={
                  order.paymentStatus === "success" ? "default" : "destructive"
                }
              >
                {order.paymentStatus === "success" ? "Paid" : "Unpaid"}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Order Status */}
          <div className="flex items-center space-x-3 p-4 bg-primary/5 rounded-lg">
            {order.deliveryMethod === "delivery" ? (
              <Truck className="h-5 w-5 text-primary" />
            ) : (
              <Package className="h-5 w-5 text-primary" />
            )}
            <div>
              <h4 className="font-semibold text-foreground">
                {order.deliveryMethod === "delivery"
                  ? "Delivery Order"
                  : "Pickup Order"}
              </h4>
              <div className="text-sm text-muted-foreground">
                Status:{" "}
                <Badge variant="outline" className="ml-1">
                  {order.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Order placed: {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Delivery Address (if delivery) */}
          {order.deliveryMethod === "delivery" && order.deliveryAddress && (
            <div className="flex items-start space-x-3 p-4 bg-muted rounded-lg">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">
                  Delivery Address
                </h3>
                <p className="text-sm text-muted-foreground">
                  {order.deliveryAddress}
                </p>
              </div>
            </div>
          )}

          {/* Order Items */}
          <div>
            <h4 className="font-semibold text-foreground mb-3">
              Items Ordered
            </h4>
            {order.items &&
              order.items.map((item, index) => (
                <div
                  key={item.id || index}
                  className="flex items-start space-x-3 p-3 border rounded-lg mb-2"
                >
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <h5 className="font-medium text-foreground">
                        {item.product?.title || `Product ${item.productId}`}
                      </h5>
                    </div>
                    {item.product?.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {item.product.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      {item.product?.category && (
                        <Badge variant="outline">{item.product.category}</Badge>
                      )}
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-primary">
                          Rp {parseFloat(item.price).toLocaleString()}
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
              <span className="text-muted-foreground">Total Amount</span>
              <span className="text-foreground">
                Rp {parseFloat(order.totalAmount).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery Method</span>
              <span className="text-foreground capitalize">
                {order.deliveryMethod}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span className="text-foreground">Total Paid</span>
              <span className="text-primary">
                Rp {parseFloat(order.totalAmount).toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Component for Unpaid Orders */}
      {order && order.paymentStatus !== "success" && (
        <PaymentComponent
          order={order}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button asChild className="flex-1">
          <Link to="/marketplace">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Continue Shopping
          </Link>
        </Button>
        <Button variant="outline" className="flex-1 bg-transparent" asChild>
          <Link to="/orders">View All Orders</Link>
        </Button>
      </div>

      {/* Help Text */}
      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h4 className="font-semibold text-foreground mb-2">What's Next?</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• The seller will be notified of your order</li>
          <li>• You can track your order status in the Orders page</li>
          {order.deliveryMethod === "pickup" && (
            <li>• You'll be contacted when your order is ready for pickup</li>
          )}
          {order.deliveryMethod === "delivery" && (
            <li>• Your order will be delivered to the specified address</li>
          )}
        </ul>
      </div>
    </main>
  );
}
