
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Product, Order, OrderStatus } from '../types';
import { PRODUCTS, ORDERS } from '../constants';

interface DataContextType {
  products: Product[];
  orders: Order[];
  addProduct: (product: Omit<Product, 'id' | 'farmerId'>, farmerId: string) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  placeOrder: (order: Omit<Order, 'id' | 'date' | 'status'>) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(ORDERS);

  const addProduct = useCallback((productData: Omit<Product, 'id' | 'farmerId'>, farmerId: string) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      farmerId: farmerId,
    };
    setProducts(prev => [newProduct, ...prev]);
  }, []);

  const updateProduct = useCallback((updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  }, []);

  const deleteProduct = useCallback((productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  }, []);

  const placeOrder = useCallback((orderData: Omit<Order, 'id' | 'date' | 'status'>) => {
    const newOrder: Order = {
        ...orderData,
        id: `order-${Date.now()}`,
        date: new Date(),
        status: OrderStatus.PENDING,
    };
    setOrders(prev => [newOrder, ...prev]);
    // Also update stock
    newOrder.items.forEach(item => {
        setProducts(prevProducts => prevProducts.map(p => 
            p.id === item.id ? { ...p, stock: p.stock - item.quantity } : p
        ));
    });
  }, []);

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  }, []);

  const value = { products, orders, addProduct, updateProduct, deleteProduct, placeOrder, updateOrderStatus };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
