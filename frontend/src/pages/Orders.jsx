import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  MapPin,
  Star,
  Package,
  Truck,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { useNavigate } from "react-router";

export default function OrdersPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) return;

      try {
        setIsLoading(true);
        setError(null);
        const response = await api.getOrders(token);
        setOrders(response);
      } catch (error) {
        setError("Failed to load orders");
        console.error("Orders fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  const getFilteredOrders = (status) => {
    if (status === "all") return orders;

    if (status === "active") {
      return orders.filter((order) =>
        ["pending", "paid", "ready"].includes(order.status)
      );
    }
    return orders.filter((order) => order.status === status);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
      case "paid":
        return <Clock className="h-4 w-4" />;
      case "ready":
        return <Package className="h-4 w-4" />;
      case "completed":
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "paid":
        return "bg-blue-100 text-blue-800";
      case "ready":
        return "bg-green-100 text-green-800";
      case "completed":
      case "delivered":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="ml-4 text-lg text-muted-foreground">Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  const OrderCard = ({ order }) => (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Order #{order.id}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge
              className={`${getStatusColor(
                order.status
              )} flex items-center gap-1`}
            >
              {getStatusIcon(order.status)}
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
            <Badge
              variant={
                order.paymentStatus === "success" ? "default" : "destructive"
              }
              className="flex items-center gap-1"
            >
              {order.paymentStatus === "success" ? (
                <CheckCircle className="h-3 w-3" />
              ) : (
                <XCircle className="h-3 w-3" />
              )}
              {order.paymentStatus === "success" ? "Paid" : "Unpaid"}
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Ordered on {new Date(order.createdAt).toLocaleDateString()}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Restaurant Info */}
        <div className="flex items-start space-x-3 p-3 bg-muted rounded-lg">
          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-foreground">
              {order.businessName || "Unknown Restaurant"}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              {order.deliveryMethod === "delivery" ? (
                <Truck className="h-3 w-3 text-primary" />
              ) : (
                <Package className="h-3 w-3 text-primary" />
              )}
              <span className="text-sm text-primary font-medium">
                {order.deliveryMethod === "delivery" ? "Delivery" : "Pickup"}
              </span>
            </div>
          </div>
        </div>

        {/* Time Info */}
        <div className="flex items-center space-x-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            Status updated: {new Date(order.updatedAt).toLocaleString()}
          </span>
        </div>

        {/* Total and Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="font-semibold">
            Total:{" "}
            <span className="text-primary">
              ${parseFloat(order.totalAmount).toFixed(2)}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/order/${order.id}`)}
            >
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">My Orders</h1>
        <p className="text-muted-foreground">
          Track and manage your food rescue orders
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="space-y-4">
            {getFilteredOrders("all").length === 0 ? (
              <div className="text-center py-8">
                <p className="text-lg text-muted-foreground">No orders found</p>
                <p className="text-sm text-muted-foreground">
                  Your orders will appear here
                </p>
              </div>
            ) : (
              getFilteredOrders("all").map((order) => (
                <OrderCard key={order.id} order={order} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          <div className="space-y-4">
            {getFilteredOrders("active").length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground">
                  No active orders
                </p>
                <p className="text-sm text-muted-foreground">
                  Your current orders will appear here
                </p>
              </div>
            ) : (
              getFilteredOrders("active").map((order) => (
                <OrderCard key={order.id} order={order} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="space-y-4">
            {getFilteredOrders("completed").length === 0 ? (
              <div className="text-center py-8">
                <p className="text-lg text-muted-foreground">
                  No completed orders
                </p>
                <p className="text-sm text-muted-foreground">
                  Completed orders will appear here
                </p>
              </div>
            ) : (
              getFilteredOrders("completed").map((order) => (
                <OrderCard key={order.id} order={order} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="cancelled" className="mt-6">
          <div className="space-y-4">
            {getFilteredOrders("cancelled").length === 0 ? (
              <div className="text-center py-8">
                <p className="text-lg text-muted-foreground">
                  No cancelled orders
                </p>
                <p className="text-sm text-muted-foreground">
                  Cancelled orders will appear here
                </p>
              </div>
            ) : (
              getFilteredOrders("cancelled").map((order) => (
                <OrderCard key={order.id} order={order} />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
