import api from './axios';

// Authentication API
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  refreshToken: async () => {
    const response = await api.post('/auth/refresh-token');
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

// Restaurant API
export const restaurantAPI = {
  getRestaurants: async (params = {}) => {
    const response = await api.get('/restaurants', { params });
    return response.data;
  },

  getRestaurantById: async (id) => {
    const response = await api.get(`/restaurants/${id}`);
    return response.data;
  },

  createRestaurant: async (data) => {
    const response = await api.post('/restaurants', data);
    return response.data;
  },

  updateRestaurant: async (id, data) => {
    const response = await api.put(`/restaurants/${id}`, data);
    return response.data;
  },

  updateStatus: async (id, statusData) => {
    const response = await api.patch(`/restaurants/${id}/status`, statusData);
    return response.data;
  }
};

// Food API
export const foodAPI = {
  getFoods: async (params = {}) => {
    const response = await api.get('/foods', { params });
    return response.data;
  },

  getFoodById: async (id) => {
    const response = await api.get(`/foods/${id}`);
    return response.data;
  },

  createFood: async (data) => {
    const response = await api.post('/foods', data);
    return response.data;
  },

  updateFood: async (id, data) => {
    const response = await api.put(`/foods/${id}`, data);
    return response.data;
  },

  deleteFood: async (id) => {
    const response = await api.delete(`/foods/${id}`);
    return response.data;
  },

  updateAvailability: async (id, isAvailable) => {
    const response = await api.patch(`/foods/${id}/availability`, { isAvailable });
    return response.data;
  }
};

// Category API
export const categoryAPI = {
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  getCategoryById: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  createCategory: async (data) => {
    const response = await api.post('/categories', data);
    return response.data;
  },

  updateCategory: async (id, data) => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  }
};

// Cart API
export const cartAPI = {
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data;
  },

  addToCart: async ({ foodId, quantity = 1 }) => {
    const response = await api.post('/cart/add', { foodId, quantity });
    return response.data;
  },

  updateItem: async ({ foodId, quantity }) => {
    const response = await api.put('/cart/update', { foodId, quantity });
    return response.data;
  },

  removeItem: async (foodId) => {
    const response = await api.delete(`/cart/remove/${foodId}`);
    return response.data;
  },

  clearCart: async () => {
    const response = await api.delete('/cart/clear');
    return response.data;
  }
};

// Order API
export const orderAPI = {
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  getMyOrders: async (params = {}) => {
    const response = await api.get('/orders/my-orders', { params });
    return response.data;
  },

  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  cancelOrder: async (id) => {
    const response = await api.patch(`/orders/${id}/cancel`);
    return response.data;
  },

  getRestaurantOrders: async (restaurantId, params = {}) => {
    const response = await api.get(`/orders/restaurant/${restaurantId}`, { params });
    return response.data;
  },

  acceptOrder: async (id) => {
    const response = await api.patch(`/orders/${id}/accept`);
    return response.data;
  },

  rejectOrder: async (id) => {
    const response = await api.patch(`/orders/${id}/reject`);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data;
  }
};

// Admin API
export const adminAPI = {
  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  blockUser: async (id) => {
    const response = await api.patch(`/admin/users/${id}/block`);
    return response.data;
  },

  unblockUser: async (id) => {
    const response = await api.patch(`/admin/users/${id}/unblock`);
    return response.data;
  },

  getRestaurants: async (params = {}) => {
    const response = await api.get('/admin/restaurants', { params });
    return response.data;
  },

  getOrders: async (params = {}) => {
    const response = await api.get('/admin/orders', { params });
    return response.data;
  },

  getStatistics: async () => {
    const response = await api.get('/admin/statistics');
    return response.data;
  }
};
