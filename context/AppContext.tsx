
import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { 
  CartItem, Product, User, UserRole, Order, OrderStatus, AuditLog, FarmerType, Address, PendingUserSignupData 
} from '../types';
import { 
  getInitialProducts, addOrder as addOrderData, getOrdersByCustomerId, getProductsByFarmerId, getOrdersByFarmerId, 
  addProduct as addProductData, updateProduct as updateProductData, deleteProduct as deleteProductData, getInitialOrders
} from '../data';
import { sendConfirmationSms } from '../services/smsService';
import { useLanguage } from './LanguageContext';

type NotificationType = {
  message: string;
  type: 'success' | 'error';
};

// --- Storage Keys ---
const STORAGE_KEYS = {
  PRODUCTS: 'hh_persistent_products',
  ORDERS: 'hh_persistent_orders',
  USERS: 'hh_persistent_users',
  CURRENCY: 'currency',
  LOGGED_USER: 'hh_active_session'
};

// --- Currency Definitions ---
export const currencies: { [key: string]: { name: string; symbol: string; } } = {
    USD: { name: 'United States Dollar', symbol: '$' },
    EUR: { name: 'Euro', symbol: '€' },
    INR: { name: 'Indian Rupee', symbol: '₹' },
    GBP: { name: 'British Pound', symbol: '£' },
};

const exchangeRates: { [key: string]: number } = {
    USD: 1,
    EUR: 0.93,
    INR: 83.50,
    GBP: 0.79,
};

// Initial users data
const initialUsers: User[] = [
  { 
    id: 'u1', 
    fullName: 'John Doe', 
    email: 'buyer@example.com', 
    password: 'password123', 
    mobile: '1234567890', 
    role: UserRole.Buyer, 
    isActive: true, 
    deliveryAddress: { 
        fullName: 'John Doe', 
        phone: '1234567890', 
        street: '123 Main St', 
        city: 'Bengaluru', 
        district: 'Bengaluru Urban', 
        state: 'Karnataka', 
        country: 'India', 
        pincode: '560001' 
    }, 
    walletBalance: 100 
  },
  { 
    id: 'u2', 
    fullName: 'Jane Farmer', 
    email: 'farmer@example.com', 
    password: 'password123', 
    mobile: '0987654321', 
    role: UserRole.Farmer, 
    isActive: true, 
    farmLocation: 'Green Valley, Mysuru', 
    farmCity: 'Mysuru',
    farmDistrict: 'Mysuru',
    farmState: 'Karnataka',
    farmerType: FarmerType.Vegetables, 
    paymentDetails: { upiId: 'jane@farm' } 
  },
  { id: 'u3', fullName: 'Market Owner', email: 'owner@example.com', password: 'password123', mobile: '5555555555', role: UserRole.Buyer, isActive: true, isOwner: true, deliveryAddress: { fullName: 'Market Owner', phone: '5555555555', street: '1 Market Rd', city: 'Big City', district: 'Big District', state: 'New York', country: 'USA', pincode: '54321' } },
  { id: 'u_admin', fullName: 'Admin User', email: 'admin@example.com', password: 'admin@123', mobile: '1112223334', role: UserRole.Admin, isActive: true, isOwner: true },
];

interface AppContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  buyNow: (product: Product, quantity: number) => void;
  cartCount: number;
  cartTotal: number;
  shippingFee: number;
  updateShippingLocation: (address: Partial<Address>) => void;
  notification: NotificationType | null;
  showNotification: (message: string, type: 'success' | 'error') => void;
  products: Product[];
  currency: string;
  setCurrency: (currency: string) => void;
  formatPrice: (price: number) => string;
  user: User | null;
  login: (email: string, password: string, rememberMe: boolean) => void;
  logout: () => void;
  signupActual: (userData: Omit<User, 'id' | 'isActive'>) => User | undefined;
  forgotPassword: (email: string) => void;
  updateUserProfile: (userData: User) => void;
  placeOrder: (shippingAddress: Address, paymentMethod: string) => boolean;
  customerOrders: Order[];
  allOrders: Order[];
  farmerProducts: Product[];
  farmerOrders: Order[];
  farmerAddProduct: (productData: Omit<Product, 'id' | 'farmerId'>) => void;
  farmerUpdateProduct: (productData: Product) => void;
  farmerDeleteProduct: (productId: string) => void;
  allUsers: User[];
  farmersList: User[];
  adminUpdateUserStatus: (userId: string, newStatus: boolean) => void;
  adminAddProduct: (productData: Omit<Product, 'id'>) => void;
  adminUpdateProduct: (productData: Product) => void;
  adminDeleteProduct: (productId: string) => void;
  auditLogs: AuditLog[];
  addAuditLog: (action: string, details: string, logUser?: User) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { t } = useLanguage();
  
  // --- Persistent State Initialization ---
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return saved ? JSON.parse(saved) : getInitialProducts();
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return saved ? JSON.parse(saved) : getInitialOrders();
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : initialUsers;
  });

  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOGGED_USER);
    return saved ? JSON.parse(saved) : null;
  });

  const [cart, setCart] = useState<CartItem[]>([]);
  const [notification, setNotification] = useState<NotificationType | null>(null);
  const [currency, setCurrencyState] = useState(localStorage.getItem(STORAGE_KEYS.CURRENCY) || 'USD');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [shippingFee, setShippingFee] = useState(0);

  // --- Persistence Sync Hooks ---
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.LOGGED_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.LOGGED_USER);
    }
  }, [user]);

  // Derived list of all users and farmers
  const allUsers = useMemo(() => users, [users]);
  const farmersList = useMemo(() => users.filter(u => u.role === UserRole.Farmer), [users]);

  // --- Utility Functions ---
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = useCallback((message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
  }, []);
  
  const setCurrency = useCallback((curr: string) => {
    if (currencies[curr]) {
        localStorage.setItem(STORAGE_KEYS.CURRENCY, curr);
        setCurrencyState(curr);
    }
  }, []);

  const formatPrice = useCallback((price: number) => {
    const rate = exchangeRates[currency] || 1;
    const symbol = currencies[currency]?.symbol || '$';
    const convertedPrice = price * rate;
    return `${symbol}${convertedPrice.toFixed(2)}`;
  }, [currency]);

  const addAuditLog = useCallback((action: string, details: string, logUser?: User) => {
    const actor = logUser || user;
    const log: AuditLog = {
      id: `log${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: actor?.id || 'system',
      userName: actor?.fullName || 'System',
      action,
      details,
    };
    setAuditLogs(prev => [log, ...prev]);
  }, [user]);

  // --- Shipping ---
  const calculateShippingFee = useCallback((buyerAddress: Partial<Address>) => {
    if (!cart.length) return 0;
    const farmerId = cart[0].product.farmerId;
    const farmer = users.find(u => u.id === farmerId);
    if (!farmer) return 0.60;

    let feeInINR = 120;
    const bCity = (buyerAddress.city || '').toLowerCase().trim();
    const bDist = (buyerAddress.district || '').toLowerCase().trim();
    const bState = (buyerAddress.state || '').toLowerCase().trim();
    const fCity = (farmer.farmCity || '').toLowerCase().trim();
    const fDist = (farmer.farmDistrict || '').toLowerCase().trim();
    const fState = (farmer.farmState || '').toLowerCase().trim();

    if (bCity && fCity && bCity === fCity) feeInINR = 30;
    else if (bDist && fDist && bDist === fDist) feeInINR = 50;
    else if (bState && fState && bState === fState) feeInINR = 80;

    return feeInINR / exchangeRates['INR'];
  }, [cart, users]);

  const updateShippingLocation = useCallback((address: Partial<Address>) => {
    const fee = calculateShippingFee(address);
    setShippingFee(fee);
  }, [calculateShippingFee]);

  useEffect(() => {
    if (user?.deliveryAddress) updateShippingLocation(user.deliveryAddress);
    else setShippingFee(0);
  }, [cart, user?.deliveryAddress, updateShippingLocation]);

  // --- Cart Management ---
  const addToCart = useCallback((product: Product, quantity: number) => {
    const latestProduct = products.find(p => p.id === product.id);
    if (!latestProduct || latestProduct.stock <= 0) {
      showNotification(t('dashboard.outOfStock'), 'error');
      return;
    }
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      const currentQtyInCart = existingItem ? existingItem.quantity : 0;
      if (currentQtyInCart + quantity > latestProduct.stock) {
        showNotification(t('dashboard.onlyAvailable', { count: latestProduct.stock, unit: latestProduct.unit }), 'error');
        return prevCart;
      }
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prevCart, { product: latestProduct, quantity }];
    });
    showNotification(`${product.name} added to cart`, 'success');
  }, [showNotification, products, t]);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    const latestProduct = products.find(p => p.id === productId);
    if (!latestProduct) return;
    if (quantity > latestProduct.stock) {
      showNotification(t('dashboard.onlyAvailable', { count: latestProduct.stock, unit: latestProduct.unit }), 'error');
      return;
    }
    if (quantity <= 0) removeFromCart(productId);
    else {
      setCart(prevCart =>
        prevCart.map(item => item.product.id === productId ? { ...item, quantity } : item)
      );
    }
  }, [removeFromCart, products, showNotification, t]);

  const clearCart = useCallback(() => setCart([]), []);
  
  const buyNow = useCallback((product: Product, quantity: number) => {
    const latestProduct = products.find(p => p.id === product.id);
    if (!latestProduct || latestProduct.stock < quantity) {
      showNotification(t('dashboard.onlyAvailable', { count: latestProduct?.stock || 0, unit: latestProduct?.unit || '' }), 'error');
      return;
    }
    setCart([{ product: latestProduct, quantity }]);
  }, [products, showNotification, t]);

  const cartCount = useMemo(() => cart.reduce((total, item) => total + item.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((total, item) => total + item.product.price * item.quantity, 0), [cart]);

  // --- Auth ---
  const login = useCallback((email: string, password: string, rememberMe: boolean) => {
    const foundUser = users.find(u => u.email === email && u.password === password);
    if (foundUser) {
        if (!foundUser.isActive) {
            showNotification('Your account has been blocked.', 'error');
            return;
        }
        setUser(foundUser);
        showNotification(`Welcome back, ${foundUser.fullName}!`, 'success');
        addAuditLog('User Login', `User ${foundUser.fullName} logged in.`, foundUser);
        if (rememberMe) localStorage.setItem('rememberedUser', email);
        else localStorage.removeItem('rememberedUser');
    } else {
        showNotification('Invalid credentials.', 'error');
    }
  }, [users, showNotification, addAuditLog]);

  const logout = useCallback(() => {
    addAuditLog('User Logout', `User ${user?.fullName} logged out.`, user || undefined);
    setUser(null);
    clearCart();
    showNotification('You have been logged out.', 'success');
  }, [user, showNotification, addAuditLog, clearCart]);

  const signupActual = useCallback((userData: Omit<User, 'id' | 'isActive'>): User | undefined => {
    if (users.some(u => u.email === userData.email)) {
        showNotification('An account with this email already exists.', 'error');
        return undefined;
    }
    const newUser: User = {
        ...userData,
        id: `u${Date.now()}`,
        isActive: true,
        walletBalance: 0,
    };
    setUsers(prev => [...prev, newUser]);
    setUser(newUser);
    addAuditLog('User Signup', `New user ${newUser.fullName} registered as a ${newUser.role}.`, newUser);
    showNotification(t('auth.signupSuccess', {fullName: newUser.fullName}), 'success');
    sendConfirmationSms(newUser.mobile, newUser.fullName).catch(console.error);
    return newUser;
  }, [users, showNotification, addAuditLog, t]);

  const forgotPassword = useCallback((email: string) => {
    const foundUser = users.find(u => u.email === email);
    if (foundUser) showNotification(`Password reset link sent to ${email}.`, 'success');
    else showNotification(`No account found for ${email}.`, 'error');
  }, [users, showNotification]);

  const updateUserProfile = useCallback((userData: User) => {
    if (!user || user.id !== userData.id) return;
    setUser(userData);
    setUsers(prev => prev.map(u => u.id === userData.id ? userData : u));
    addAuditLog('Profile Update', `User ${userData.fullName} updated their profile.`, userData);
    showNotification('Profile updated successfully.', 'success');
  }, [user, showNotification, addAuditLog]);

  // --- Orders ---
  const placeOrder = useCallback((shippingAddress: Address, paymentMethod: string): boolean => {
    if (!user || cart.length === 0) return false;
    for (const item of cart) {
      const productInStore = products.find(p => p.id === item.product.id);
      if (!productInStore || productInStore.stock < item.quantity) {
        showNotification(t('dashboard.insufficientStock', { productName: item.product.name }), 'error');
        return false;
      }
    }

    const totalCost = cartTotal + shippingFee;
    if (paymentMethod === 'wallet' && user.walletBalance !== undefined) {
        if (user.walletBalance < totalCost) {
            showNotification('Insufficient wallet balance.', 'error');
            return false;
        }
        const updatedUser = { ...user, walletBalance: user.walletBalance - totalCost };
        setUser(updatedUser);
        setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
    }

    const newOrderData: Order = {
      id: `ord${Date.now()}`,
      customerId: user.id,
      farmerId: cart[0].product.farmerId,
      items: [...cart],
      total: totalCost,
      shippingFee,
      date: new Date().toISOString(),
      status: OrderStatus.Confirmed,
      shippingAddress,
      paymentMethod,
    };
    
    setProducts(prevProducts => prevProducts.map(p => {
        const cartItem = cart.find(item => item.product.id === p.id);
        return cartItem ? { ...p, stock: Math.max(0, p.stock - cartItem.quantity) } : p;
    }));

    setOrders(prev => [newOrderData, ...prev]);
    addAuditLog('Order Placed', `User ${user.fullName} placed order #${newOrderData.id.substring(3, 9)}.`, user);
    clearCart();
    showNotification('Order placed successfully!', 'success');
    return true;
  }, [user, cart, cartTotal, shippingFee, showNotification, addAuditLog, clearCart, products, t]);

  // Derived Dashboard Data
  const customerOrders = useMemo(() => user ? orders.filter(o => o.customerId === user.id) : [], [user, orders]);
  const farmerProducts = useMemo(() => user ? products.filter(p => p.farmerId === user.id) : [], [user, products]);
  const farmerOrders = useMemo(() => user ? orders.filter(o => o.farmerId === user.id) : [], [user, orders]);

  // --- Farmer Product Management ---
  const farmerAddProduct = useCallback((productData: Omit<Product, 'id' | 'farmerId'>) => {
    if (!user || user.role !== UserRole.Farmer) return;
    const newProd = { ...productData, id: `p${Date.now()}`, farmerId: user.id };
    setProducts(prev => [newProd, ...prev]);
    addAuditLog('Product Added', `Farmer added product: ${newProd.name}.`, user);
    showNotification('Product added successfully.', 'success');
  }, [user, addAuditLog, showNotification]);
  
  const farmerUpdateProduct = useCallback((productData: Product) => {
    setProducts(prev => prev.map(p => p.id === productData.id ? productData : p));
    showNotification('Product updated.', 'success');
  }, [showNotification]);

  const farmerDeleteProduct = useCallback((productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    showNotification('Product deleted.', 'success');
  }, [showNotification]);

  // --- Admin ---
  const adminUpdateUserStatus = useCallback((userId: string, newStatus: boolean) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: newStatus } : u));
    if (user?.id === userId) setUser(prev => prev ? { ...prev, isActive: newStatus } : null);
    showNotification('User status updated.', 'success');
  }, [user, showNotification]);

  const adminAddProduct = useCallback((productData: Omit<Product, 'id'>) => {
    const newProd = { ...productData, id: `p${Date.now()}` };
    setProducts(prev => [newProd, ...prev]);
    showNotification('Product added.', 'success');
  }, [showNotification]);

  const adminUpdateProduct = useCallback((productData: Product) => {
    setProducts(prev => prev.map(p => p.id === productData.id ? productData : p));
    showNotification('Product updated.', 'success');
  }, [showNotification]);

  const adminDeleteProduct = useCallback((productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    showNotification('Product deleted.', 'success');
  }, [showNotification]);

  return (
    <AppContext.Provider
      value={{
        cart, addToCart, removeFromCart, updateQuantity, clearCart, buyNow, cartCount, cartTotal,
        shippingFee, updateShippingLocation,
        notification, showNotification,
        products,
        currency, setCurrency, formatPrice,
        user, login, logout, signupActual, forgotPassword, updateUserProfile,
        placeOrder, customerOrders, allOrders: orders,
        farmerProducts, farmerOrders, farmerAddProduct, farmerUpdateProduct, farmerDeleteProduct,
        allUsers, farmersList, adminUpdateUserStatus, adminAddProduct, adminUpdateProduct, adminDeleteProduct,
        auditLogs, addAuditLog,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useAppContext must be used within a AppProvider');
  return context;
};
