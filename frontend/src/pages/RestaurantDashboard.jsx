import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { DashboardFoodItemCard } from "@/components/DashboardFoodItemCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, User, Phone, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import {
  transformProductsData,
  transformOrdersData,
} from "@/lib/dataTransforms";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function RestaurantDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [donations, setDonations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Check if user is a business and has completed onboarding

      if (!user || !token) return;

      if (!user.userType || user.userType !== "business") {
        navigate("/");
        return;
      }

      if (!user.isOnboardingCompleted) {
        navigate("/onboarding/business");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch products for this seller (sell type only)
        const productsResponse = await api.getProductsByBusiness(user.id);
        const transformedProducts = transformProductsData(productsResponse);
        setProducts(transformedProducts);

        // Fetch donations for this seller (donation type only)
        const donationsResponse = await api.getDonationsByBusiness(user.id);
        const transformedDonations = transformProductsData(donationsResponse);
        setDonations(transformedDonations);

        // Fetch orders for this seller
        const ordersResponse = await api.getSellerOrders(token);
        setOrders(ordersResponse); // Orders may need different transformation
      } catch (error) {
        setError("Failed to load dashboard data");
        console.error("Dashboard fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, token]);

  const handleEditProduct = (product) => {
    // Navigate to edit product page (you can create this later)
    navigate(`/edit/${product.id}`);
  };

  const handleDeleteProduct = async (product) => {
    if (
      !window.confirm(`Are you sure you want to delete "${product.title}"?`)
    ) {
      return;
    }

    try {
      const response = await api.deleteProduct(token, product.id);

      if (response.error) {
        setError(response.error);
      } else {
        setDeleteSuccess(`Product "${product.title}" deleted successfully`);
        // Remove the product from the local state
        setProducts(products.filter((p) => p.id !== product.id));

        // Clear success message after 3 seconds
        setTimeout(() => setDeleteSuccess(""), 3000);
      }
    } catch (error) {
      console.error("Delete product error:", error);
      setError("Failed to delete product. Please try again.");
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await api.updateOrderStatus(token, orderId, newStatus);

      if (response.error) {
        setError(response.error);
      } else {
        setDeleteSuccess(`Order status updated to ${newStatus} successfully`);
        // Update the order in the local state
        setOrders(
          orders.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );

        // Clear success message after 3 seconds
        setTimeout(() => setDeleteSuccess(""), 3000);
      }
    } catch (error) {
      console.error("Update order status error:", error);
      setError("Failed to update order status. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="ml-4 text-lg text-muted-foreground">
          Loading dashboard...
        </p>
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

        {/* Alerts */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-600">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {deleteSuccess && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">
              {deleteSuccess}
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <div className="space-y-8">
          {/* Marketplace Items Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-foreground">
                Your Marketplace Items
              </h2>
              <Button onClick={() => navigate("/add")}>Add New Item</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {products.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <p className="text-muted-foreground">No products added yet</p>
                  <Button className="mt-4" onClick={() => navigate("/add")}>
                    Add Your First Product
                  </Button>
                </div>
              ) : (
                products.map((item) => (
                  <DashboardFoodItemCard
                    key={item.id}
                    item={item}
                    onEdit={handleEditProduct}
                    onDelete={handleDeleteProduct}
                  />
                ))
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-foreground">
                Your Donation Items
              </h2>
              <Button onClick={() => navigate("/donation/add")}>
                Add New Donation
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {donations.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <p className="text-muted-foreground">No donation items added yet</p>
                  <Button className="mt-4" onClick={() => navigate("/donation/add")}>
                    Add Your First Donation
                  </Button>
                </div>
              ) : (
                donations.map((item) => (
                  <DashboardFoodItemCard
                    key={item.id}
                    item={item}
                    onEdit={handleEditProduct}
                    onDelete={handleDeleteProduct}
                    isDonation={true}
                  />
                ))
              )}
            </div>
          </div>

          {/* Consumer Orders Section */}
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              Customer Orders
            </h2>

            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No orders yet</p>
                </div>
              ) : (
                orders.map((order) => (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          Order #{order.id}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge className={getOrderStatusColor(order.status)}>
                            {order.status.charAt(0).toUpperCase() +
                              order.status.slice(1)}
                          </Badge>
                          <Badge
                            variant={
                              order.paymentStatus === "success"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {order.paymentStatus === "success"
                              ? "Paid"
                              : "Unpaid"}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {order.buyerName || "Unknown Customer"}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {order.deliveryMethod === "delivery"
                                ? "Delivery"
                                : "Pickup"}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <p className="text-sm font-medium">Total:</p>
                            <p className="text-lg font-bold text-primary">
                              Rp {parseFloat(order.totalAmount).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex space-x-2">
                        {order.paymentStatus === "success" &&
                          order.status === "pending" && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() =>
                                handleUpdateOrderStatus(order.id, "ready")
                              }
                            >
                              Mark as Ready
                            </Button>
                          )}
                        {order.status === "ready" && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() =>
                              handleUpdateOrderStatus(order.id, "completed")
                            }
                          >
                            Mark as Completed
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
