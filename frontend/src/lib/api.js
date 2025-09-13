const API_BASE_URL = 'http://localhost:3000/api';

export const api = {
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    return response.json();
  },

  getMe: async (token) => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // Onboarding endpoints
  // Complete business onboarding (single endpoint)
  completeBusinessOnboarding: async (token, data) => {
    const response = await fetch(`${API_BASE_URL}/onboarding/business/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  getBusinessProfile: async (token) => {
    const response = await fetch(`${API_BASE_URL}/onboarding/business/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  completeCharityOnboarding: async (token, data) => {
    const response = await fetch(`${API_BASE_URL}/onboardingcharity/charity/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  getCharityProfile: async (token) => {
    const response = await fetch(`${API_BASE_URL}/onboardingcharity/charity/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // Product endpoints
  getProducts: async () => {
    const response = await fetch(`${API_BASE_URL}/productRoute`);
    return response.json();
  },

  getDonations: async () => {
    const response = await fetch(`${API_BASE_URL}/productRoute?type=donation`);
    return response.json();
  },

  getProductsNearby: async (lat, lng, radius = 1) => {
    const response = await fetch(`${API_BASE_URL}/productRoute/product-nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
    return response.json();
  },

  getProductById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/productRoute/${id}`);
    return response.json();
  },

  getProductsByBusiness: async (businessId) => {
    const response = await fetch(`${API_BASE_URL}/productRoute/business/${businessId}?type=sell`);
    return response.json();
  },

  getDonationsByBusiness: async (businessId) => {
    const response = await fetch(`${API_BASE_URL}/productRoute/business/${businessId}?type=donation`);
    return response.json();
  },

  createProduct: async (token, productData) => {
    const response = await fetch(`${API_BASE_URL}/productRoute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(productData),
    });
    return response.json();
  },

  updateProduct: async (token, id, productData) => {
    const response = await fetch(`${API_BASE_URL}/productRoute/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(productData),
    });
    return response.json();
  },

  deleteProduct: async (token, id) => {
    const response = await fetch(`${API_BASE_URL}/productRoute/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // Order endpoints
  createOrder: async (token, orderData) => {
    const response = await fetch(`${API_BASE_URL}/orderRoute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });
    return response.json();
  },

  getOrders: async (token) => {
    const response = await fetch(`${API_BASE_URL}/orderRoute`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  getSellerOrders: async (token) => {
    const response = await fetch(`${API_BASE_URL}/orderRoute/business`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // Payment endpoints
  createPayment: async (token, orderId) => {
    const response = await fetch(`${API_BASE_URL}/orderRoute/${orderId}/payment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  getPaymentStatus: async (orderId) => {
    const response = await fetch(`${API_BASE_URL}/webhook/payment-status/${orderId}`);
    return response.json();
  },

  updatePaymentSuccess: async (token, orderId, transactionId) => {
    const response = await fetch(`${API_BASE_URL}/orderRoute/${orderId}/payment-success`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ transactionId }),
    });
    return response.json();
  },

  updateOrderStatus: async (token, orderId, status) => {
    const response = await fetch(`${API_BASE_URL}/orderRoute/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    return response.json();
  },
};
