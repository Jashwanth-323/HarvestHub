
export enum UserRole {
  FARMER = 'FARMER',
  CUSTOMER = 'CUSTOMER',
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
}

export interface Category {
  id: string;
  name: string;
  image: string;
}

export interface Product {
  id: string;
  name: string;
  farm: string;
  description: string;
  price: number;
  unit: 'kg' | 'piece';
  stock: number;
  category: string;
  image: string;
  farmerId: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export enum OrderStatus {
  PENDING = 'Pending',
  SHIPPED = 'Shipped',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled',
}

export interface Order {
  id: string;
  customerId: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  date: Date;
}
