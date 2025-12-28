
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  category: string;
  unit: string; // e.g., 'kg', 'dozen', 'bunch'
  stock: number;
  farmerId: string;
  harvestDate?: string; // New field
  isOrganic?: boolean;   // New field
  priceHistory?: { price: number; date: string; changedBy: string; }[];
  isEnabled?: boolean;
}

export interface Category {
  id: string;
  name: string;
  imageUrl: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export enum UserRole {
  Buyer = 'Buyer',
  Farmer = 'Farmer',
  Admin = 'Admin', // Added Admin role
}

export enum FarmerType {
    Vegetables = 'Vegetables',
    Fruits = 'Fruits',
    Grains = 'Grains',
    Mixed = 'Mixed',
}

export interface Address {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  district: string; // Added district for shipping logic
  state: string;
  country: string;
  pincode: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  password?: string;
  role: UserRole;
  isActive: boolean;
  isVerified?: boolean;
  isOwner?: boolean; // New flag for marketplace owner
  deliveryAddress?: Address;
  walletBalance?: number;
  // Farmer-specific fields
  farmLocation?: string;
  farmDistrict?: string; // Structured location for farmers
  farmCity?: string;     // Structured location for farmers
  farmState?: string;    // Structured location for farmers
  farmerType?: FarmerType;
  paymentDetails?: {
    upiId: string;
    qrCodeUrl?: string;
  };
}

export enum OrderStatus {
    Pending = 'Pending',
    Confirmed = 'Confirmed',
    Delivered = 'Delivered'
}

export interface Order {
    id: string;
    customerId: string;
    farmerId: string;
    items: CartItem[];
    total: number;
    shippingFee: number; // Added to record the specific fee paid
    date: string;
    status: OrderStatus;
    shippingAddress: Address;
    paymentMethod: string;
    paymentDetails?: {
        upiId?: string;
        transactionId?: string;
    };
}

export interface PriceSuggestion {
    productId: string;
    suggestedPrice: number;
    reason: string;
}

export interface AuditLog {
    id: string;
    timestamp: string;
    userId: string;
    userName: string;
    action: string;
    details: string;
}


export interface PendingUserSignupData extends Omit<User, 'id' | 'isActive'> {
  confirmPassword?: string; // Only for signup forms
}
