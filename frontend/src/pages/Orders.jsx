import { useState } from "react";
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

// Mock orders data
const mockOrders = [
  {
    id: "ORD-2024-003",
    status: "preparing",
    orderDate: "2024-01-15",
    estimatedTime: "Today, 3:00 PM - 4:00 PM",
    deliveryType: "pickup",
    restaurant: {
      name: "Green Bistro",
      address: "123 Main St, Downtown",
      phone: "(555) 123-4567",
    },
    items: [
      {
        name: "Pasta Primavera",
        description: "Fresh seasonal vegetables with penne pasta",
        originalPrice: 18.99,
        discountedPrice: 12.99,
        quantity: 1,
        rating: 4.8,
      },
    ],
    total: 14.03,
  },
  {
    id: "ORD-2024-002",
    status: "completed",
    orderDate: "2024-01-14",
    estimatedTime: "Yesterday, 2:00 PM",
    deliveryType: "delivery",
    restaurant: {
      name: "Farm Table",
      address: "456 Oak Ave, Midtown",
      phone: "(555) 987-6543",
    },
    items: [
      {
        name: "Artisan Sourdough Bread",
        description: "Freshly baked sourdough bread",
        originalPrice: 8.99,
        discountedPrice: 4.99,
        quantity: 2,
        rating: 4.9,
      },
    ],
    total: 12.97,
  },
  {
    id: "ORD-2024-001",
    status: "cancelled",
    orderDate: "2024-01-13",
    estimatedTime: "Jan 13, 5:00 PM",
    deliveryType: "pickup",
    restaurant: {
      name: "Urban Kitchen",
      address: "789 Pine St, Uptown",
      phone: "(555) 456-7890",
    },
    items: [
      {
        name: "Caesar Salad",
        description: "Crisp romaine lettuce with parmesan cheese",
        originalPrice: 14.99,
        discountedPrice: 9.99,
        quantity: 1,
        rating: 4.6,
      },
    ],
    total: 10.79,
  },
];

const getStatusIcon = (status) => {
  switch (status) {
    case "preparing":
      return <Clock className="h-4 w-4" />;
    case "ready":
      return <Package className="h-4 w-4" />;
    case "completed":
      return <CheckCircle className="h-4 w-4" />;
    case "cancelled":
      return <XCircle className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case "preparing":
      return "bg-blue-100 text-blue-800";
    case "ready":
      return "bg-green-100 text-green-800";
    case "completed":
      return "bg-gray-100 text-gray-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function Orders() {
  const [activeTab, setActiveTab] = useState("all");

  const filterOrders = (status) => {
    if (status === "all") return mockOrders;
    if (status === "active")
      return mockOrders.filter((order) =>
        ["preparing", "ready"].includes(order.status)
      );
    return mockOrders.filter((order) => order.status === status);
  };

  const OrderCard = ({ order }) => (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{order.id}</CardTitle>
          <Badge
            className={`${getStatusColor(
              order.status
            )} flex items-center gap-1`}
          >
            {getStatusIcon(order.status)}
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Ordered on {order.orderDate}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Restaurant Info */}
        <div className="flex items-start space-x-3 p-3 bg-muted rounded-lg">
          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-foreground">
              {order.restaurant.name}
            </h4>
            <p className="text-sm text-muted-foreground">
              {order.restaurant.address}
            </p>
            <div className="flex items-center gap-2 mt-1">
              {order.deliveryType === "delivery" ? (
                <Truck className="h-3 w-3 text-primary" />
              ) : (
                <Package className="h-3 w-3 text-primary" />
              )}
              <span className="text-sm text-primary font-medium">
                {order.deliveryType === "delivery" ? "Delivery" : "Pickup"}
              </span>
            </div>
          </div>
        </div>

        {/* Time Info */}
        <div className="flex items-center space-x-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">{order.estimatedTime}</span>
        </div>

        {/* Items */}
        <div className="space-y-2">
          {order.items.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 border rounded"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h5 className="font-medium text-foreground">{item.name}</h5>
                  <div className="flex items-center space-x-1 text-xs">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-muted-foreground">{item.rating}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-muted-foreground line-through">
                    ${item.originalPrice}
                  </span>
                  <span className="font-semibold text-primary">
                    ${item.discountedPrice}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  × {item.quantity}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Total and Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="font-semibold">
            Total: <span className="text-primary">${order.total}</span>
          </div>
          <div className="flex gap-2">
            {order.status === "preparing" && (
              <Button variant="outline" size="sm">
                Track Order
              </Button>
            )}
            {order.status === "completed" && (
              <Button variant="outline" size="sm">
                Reorder
              </Button>
            )}
            <Button variant="ghost" size="sm">
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
            {filterOrders("all").map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          <div className="space-y-4">
            {filterOrders("active").map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
            {filterOrders("active").length === 0 && (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground">
                  No active orders
                </p>
                <p className="text-sm text-muted-foreground">
                  Your current orders will appear here
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="space-y-4">
            {filterOrders("completed").map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cancelled" className="mt-6">
          <div className="space-y-4">
            {filterOrders("cancelled").map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
