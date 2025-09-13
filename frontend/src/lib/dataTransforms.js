// Transform backend product data to frontend format
export const transformProductData = (backendProduct) => {
  if (!backendProduct) return null;
  
  // Calculate discount percentage
  const discountPercentage = backendProduct.discount || 0;
  const originalPrice = parseFloat(backendProduct.price) || 0;
  const discountedPrice = parseFloat(backendProduct.finalPrice) || originalPrice;
  
  // Format expiry date
  const formatExpiryDate = (expiryDate) => {
    if (!expiryDate) return 'No expiry';
    const expiry = new Date(expiryDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (expiry.toDateString() === today.toDateString()) {
      return 'today';
    } else if (expiry.toDateString() === tomorrow.toDateString()) {
      return 'tomorrow';
    } else {
      return expiry.toLocaleDateString();
    }
  };

  // Calculate distance string
  const formatDistance = (distance) => {
    if (distance === null || distance === undefined) return 'Unknown distance';
    if (distance < 1) {
      return `${(distance * 1000).toFixed(0)}m`;
    }
    return `${distance.toFixed(1)} km`;
  };

  return {
    id: backendProduct.id,
    name: backendProduct.title,
    description: backendProduct.description || 'No description available',
    originalPrice: originalPrice,
    discountedPrice: discountedPrice,
    restaurant: backendProduct.businessName || 'Unknown Restaurant',
    category: backendProduct.category || 'Uncategorized',
    expiresAt: formatExpiryDate(backendProduct.expiryDate),
    distance: formatDistance(backendProduct.distance),
    rating: parseFloat(backendProduct.rating) || 0,
    image: backendProduct.imageUrl || "/placeholder.svg",
    quantity: backendProduct.quantity || 0,
    sellerId: backendProduct.sellerId,
    latitude: backendProduct.latitude,
    longitude: backendProduct.longitude,
    createdAt: backendProduct.createdAt,
    updatedAt: backendProduct.updatedAt
  };
};

// Transform multiple products
export const transformProductsData = (backendProducts) => {
  if (!Array.isArray(backendProducts)) return [];
  return backendProducts.map(transformProductData).filter(Boolean);
};

// Transform backend order data to frontend format (for future use)
export const transformOrderData = (backendOrder) => {
  if (!backendOrder) return null;
  
  return {
    id: backendOrder.id,
    orderId: `#${backendOrder.id.toString().padStart(4, '0')}`,
    status: backendOrder.status,
    totalAmount: parseFloat(backendOrder.totalAmount) || 0,
    deliveryMethod: backendOrder.deliveryMethod,
    deliveryAddress: backendOrder.deliveryAddress ? JSON.parse(backendOrder.deliveryAddress) : null,
    createdAt: backendOrder.createdAt,
    updatedAt: backendOrder.updatedAt,
    buyerId: backendOrder.buyerId,
    sellerId: backendOrder.sellerId
  };
};

// Transform multiple orders
export const transformOrdersData = (backendOrders) => {
  if (!Array.isArray(backendOrders)) return [];
  return backendOrders.map(transformOrderData).filter(Boolean);
};
