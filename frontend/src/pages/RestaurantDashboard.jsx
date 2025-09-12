// import { RestaurantSidebar } from "@/components/restaurant-sidebar";
import { FoodItemCard } from "@/components/FoodItemCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, User, Phone } from "lucide-react";

// Mock data for restaurant's marketplace items
const restaurantItems = [
  {
    id: "1",
    name: "Pasta Primavera",
    description:
      "Fresh seasonal vegetables with penne pasta in a light cream sauce",
    originalPrice: 18.99,
    discountedPrice: 12.99,
    category: "Main Dishes",
    expiresAt: "today",
    rating: 4.8,
    image: "/pasta-primavera-dish.jpg",
    quantity: 3,
    status: "active",
  },
  {
    id: "2",
    name: "Caesar Salad",
    description:
      "Crisp romaine lettuce with parmesan cheese, croutons, and caesar dressing",
    originalPrice: 14.99,
    discountedPrice: 9.99,
    category: "Salads",
    expiresAt: "today",
    rating: 4.6,
    image: "/caesar-salad-fresh.jpg",
    quantity: 2,
    status: "active",
  },
];

const consumerOrders = [
  {
    id: "ORD-2024-001",
    customerName: "Sarah Johnson",
    items: ["Pasta Primavera", "Caesar Salad"],
    total: 22.98,
    status: "pending",
    orderTime: "2:30 PM",
    pickupTime: "3:00 PM - 4:00 PM",
    phone: "(555) 123-4567",
  },
  {
    id: "ORD-2024-002",
    customerName: "Mike Chen",
    items: ["Chocolate Brownie"],
    total: 3.99,
    status: "ready",
    orderTime: "1:45 PM",
    pickupTime: "2:30 PM - 3:30 PM",
    phone: "(555) 987-6543",
  },
  {
    id: "ORD-2024-003",
    customerName: "Emily Davis",
    items: ["Pasta Primavera"],
    total: 12.99,
    status: "completed",
    orderTime: "12:15 PM",
    pickupTime: "1:00 PM - 2:00 PM",
    phone: "(555) 456-7890",
  },
];

export default function RestaurantDashboard() {
  const handleEditItem = (item) => {
    console.log("Edit item:", item);
  };

  const handleDeleteItem = (item) => {
    console.log("Delete item:", item);
  };

  const getOrderStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "ready":
        return "bg-primary/10 text-primary";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <main>
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="mb-8 mt-12 md:mt-0">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your marketplace items and view customer orders.
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Marketplace Items Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-foreground">
                Your Marketplace Items
              </h2>
              <Button>Add New Item</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {restaurantItems.map((item) => (
                <FoodItemCard
                  key={item.id}
                  item={item}
                  onEdit={handleEditItem}
                  onDelete={handleDeleteItem}
                />
              ))}
            </div>
          </div>

          {/* Consumer Orders Section */}
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              Customer Orders
            </h2>

            <div className="space-y-4">
              {consumerOrders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{order.id}</CardTitle>
                      <Badge className={getOrderStatusColor(order.status)}>
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {order.customerName}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {order.phone}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Ordered at {order.orderTime}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Pickup: {order.pickupTime}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium">Items:</p>
                          <p className="text-sm text-muted-foreground">
                            {order.items.join(", ")}
                          </p>
                        </div>
                        <p className="text-lg font-semibold text-primary">
                          ${order.total}
                        </p>
                      </div>
                    </div>

                    {order.status === "pending" && (
                      <div className="mt-4 flex gap-2">
                        <Button size="sm">Mark as Ready</Button>
                        <Button variant="outline" size="sm">
                          Contact Customer
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
