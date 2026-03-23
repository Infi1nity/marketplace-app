// frontend/src/contexts/OrdersContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { ordersApi } from '../services/orders';
import { useAuth } from './AuthContext';

const OrdersContext = createContext(null);

export const OrdersProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    size: 10,
    pages: 1
  });
  const { isAuthenticated } = useAuth();

  // Загрузка заказов при авторизации
  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    } else {
      setOrders([]);
    }
  }, [isAuthenticated]);

  // Загрузка списка заказов
  const loadOrders = async (page = 1, size = 10, status = null) => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const skip = (page - 1) * size;
      const params = { skip, limit: size };
      if (status) params.status = status;
      
      const response = await ordersApi.getOrders(params);
      setOrders(response.data.items);
      setPagination({
        total: response.data.total,
        page: response.data.page,
        size: response.data.size,
        pages: response.data.pages
      });
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Загрузка деталей заказа
  const loadOrderDetails = async (orderId) => {
    try {
      setLoading(true);
      const response = await ordersApi.getOrderById(orderId);
      setCurrentOrder(response.data);
      return response.data;
    } catch (error) {
      console.error('Error loading order details:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Создание заказа
  const createOrder = async (orderData) => {
    try {
      setLoading(true);
      const response = await ordersApi.createOrder(orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Отмена заказа
  const cancelOrder = async (orderId) => {
    try {
      setLoading(true);
      await ordersApi.cancelOrder(orderId);
      // Обновляем список заказов
      await loadOrders(pagination.page, pagination.size);
      return true;
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    orders,
    currentOrder,
    loading,
    pagination,
    loadOrders,
    loadOrderDetails,
    createOrder,
    cancelOrder,
  };

  return (
    <OrdersContext.Provider value={value}>
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
};