import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { 
  CartItem, Product, User, UserRole, Order, OrderStatus, AuditLog, FarmerType, Address, PendingUserSignupData 
} from '../types';
import { 
  getInitialProducts, addOrder as addOrderData, getOrdersByCustomerId, getProductsByFarmerId, getOrdersByFarmerId, 
  addProduct as addProductData, updateProduct as updateProductData, deleteProduct as deleteProductData, getInitialOrders
} from '../data';
import { sendConfirmationSms } from '../services/smsService'; // Import SMS service
import { useLanguage } from './LanguageContext';

type NotificationType = {
  message: string;
  type: 'success' | 'error';
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

// Initial users data (deep copy to prevent direct mutation from other parts of the app)
const initialUsers: User[] = JSON.parse(JSON.stringify([
  { id: 'u1', fullName: 'John Doe', email: 'buyer@example.com', password: 'password123', mobile: '1234567890', role: UserRole.Buyer, isActive: true, deliveryAddress: { fullName: 'John Doe', phone: '1234567890', street: '123 Main St', city: 'Anytown', state: 'California', country: 'USA', pincode: '12345' }, walletBalance: 100 },
  { id: 'u2', fullName: 'Jane Farmer', email: 'farmer@example.com', password: 'password123', mobile: '0987654321', role: UserRole.Farmer, isActive: true, farmLocation: 'Green Valley', farmerType: FarmerType.Vegetables, paymentDetails: { upiId: 'jane@farm' } },
  { id: 'u3', fullName: 'Market Owner', email: 'owner@example.com', password: 'password123', mobile: '5555555555', role: UserRole.Buyer, isActive: true, isOwner: true, deliveryAddress: { fullName: 'Market Owner', phone: '5555555555', street: '1 Market Rd', city: 'Big City', state: 'New York', country: 'USA', pincode: '54321' } },
  { id: 'u_admin', fullName: 'Admin User', email: 'admin@example.com', password: 'admin@123', mobile: '1112223334', role: UserRole.Admin, isActive: true, isOwner: true }, // Added Admin User
]));


interface AppContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  buyNow: (product: Product, quantity: number) => void;
  cartCount: number;
  cartTotal: number;
  notification: NotificationType | null;
  showNotification: (message: string, type: 'success' | 'error') => void;
  products: Product[]; // Global list of products
  // Currency
  currency: string;
  setCurrency: (currency: string) => void;
  formatPrice: (price: number) => string;
  // User Auth & Management
  user: User | null;
  login: (email: string, password: string, rememberMe: boolean) => void;
  logout: () => void;
  signupActual: (userData: Omit<User, 'id' | 'isActive'>) => User | undefined; // The actual signup logic
  forgotPassword: (email: string) => void;
  updateUserProfile: (userData: User) => void;
  // Orders
  placeOrder: (shippingAddress: Address, paymentMethod: string) => boolean;
  customerOrders: Order[]; // Derived from global orders
  allOrders: Order[]; // All orders for admin views
  // Farmer Dashboard
  farmerProducts: Product[]; // Derived from global products
  farmerOrders: Order[]; // Derived from global orders
  farmerAddProduct: (productData: Omit<Product, 'id' | 'farmerId'>) => void;
  farmerUpdateProduct: (productData: Product) => void;
  farmerDeleteProduct: (productId: string) => void;
  // Admin
  allUsers: User[]; // Global list of users for admin
  farmersList: User[]; // List of all farmer users
  adminUpdateUserStatus: (userId: string, newStatus: boolean) => void;
  adminAddProduct: (productData: Omit<Product, 'id'>) => void;
  adminUpdateProduct: (productData: Product) => void;
  adminDeleteProduct: (productId: string) => void;
  auditLogs: AuditLog[];
  addAuditLog: (action: string, details: string, logUser?: User) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notification, setNotification] = useState<NotificationType | null>(null);
  const [currency, setCurrencyState] = useState(localStorage.getItem('currency') || 'USD');
  const { t } = useLanguage(); // Use language context for translations
  
  // Centralized state for global data
  const [products, setProducts] = useState<Product[]>(getInitialProducts());
  const [orders, setOrders] = useState<Order[]>(getInitialOrders());
  const [users, setUsers] = useState<User[]>(initialUsers); // Full list of all users
  const [user, setUser] = useState<User | null>(null); // Currently logged-in user
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  
  // Update allUsers whenever 'users' state changes (for admin view)
  const allUsers = useMemo(() => users, [users]);
  // Derived list of farmer users
  const farmersList = useMemo(() => users.filter(u => u.role === UserRole.Farmer), [users]);


  // Effects for notification auto-hide
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // --- Utility Functions (memoized) ---
  const showNotification = useCallback((message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
  }, []);
  
  const setCurrency = useCallback((curr: string) => {
    if (currencies[curr]) {
        localStorage.setItem('currency', curr);
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

  // --- Cart Management (memoized) ---
  const addToCart = useCallback((product: Product, quantity: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { product, quantity }];
    });
    showNotification(`${product.name} added to cart`, 'success');
  }, [showNotification]);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
    }
  }, [removeFromCart]);

  const clearCart = useCallback(() => setCart([]), []);
  
  const buyNow = useCallback((product: Product, quantity: number) => {
    setCart([{ product, quantity }]);
  }, []);

  const cartCount = useMemo(() => cart.reduce((total, item) => total + item.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((total, item) => total + item.product.price * item.quantity, 0), [cart]);

  // --- Derived State for Dashboards (memoized) ---
  const customerOrders = useMemo(() => {
    if (!user || user.role !== UserRole.Buyer) return [];
    return getOrdersByCustomerId(orders, user.id);
  }, [user, orders]);

  const farmerProducts = useMemo(() => {
    if (!user || user.role !== UserRole.Farmer) return [];
    return getProductsByFarmerId(products, user.id);
  }, [user, products]);

  const farmerOrders = useMemo(() => {
    if (!user || user.role !== UserRole.Farmer) return [];
    return getOrdersByFarmerId(orders, user.id);
  }, [user, orders]);


  // --- User Authentication & Profile (memoized) ---
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
        
        if (rememberMe) {
            localStorage.setItem('rememberedUser', email);
        } else {
            localStorage.removeItem('rememberedUser');
        }
    } else {
        showNotification('Invalid email or password.', 'error');
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
    // Prevent self-registration for Admin role for security reasons
    if (userData.role === UserRole.Admin) { 
        return undefined;
    }

    const newUser: User = {
        ...userData,
        id: `u${Date.now()}`,
        isActive: true,
        walletBalance: 0,
    };
    
    setUsers(prev => [...prev, newUser]);
    setUser(newUser); // Automatically log in the new user
    addAuditLog('User Signup', `New user ${newUser.fullName} registered as a ${newUser.role}.`, newUser);
    showNotification(t('auth.signupSuccess', {fullName: newUser.fullName}), 'success');
    
    // Send confirmation SMS
    sendConfirmationSms(newUser.mobile, newUser.fullName)
        .then(success => {
            if (success) {
                // SMS success notification removed as per request
            } else {
                // SMS error notification removed as per request
            }
        })
        .catch(err => {
            console.error("Error sending SMS:", err);
            // SMS error notification removed as per request
        });

    return newUser;
  }, [users, showNotification, addAuditLog, t]);


  const forgotPassword = useCallback((email: string) => {
    const foundUser = users.find(u => u.email === email);
    if (foundUser) {
        showNotification(`Password reset instructions sent to ${email}. (This is a demo)`, 'success');
    } else {
        showNotification(`No account found for ${email}.`, 'error');
    }
  }, [users, showNotification]);

  const updateUserProfile = useCallback((userData: User) => {
    if (!user || user.id !== userData.id) return;
    setUser(userData);
    setUsers(prev => prev.map(u => u.id === userData.id ? userData : u));
    addAuditLog('Profile Update', `User ${userData.fullName} updated their profile.`, userData);
    showNotification('Profile updated successfully.', 'success');
  }, [user, showNotification, addAuditLog]);

  // --- Order Management (memoized) ---
  const placeOrder = useCallback((shippingAddress: Address, paymentMethod: string): boolean => {
    if (!user || cart.length === 0) {
      showNotification('Cannot place order. Your cart is empty or you are not logged in.', 'error');
      return false;
    }
    
    const farmerIdForOrder = cart[0].product.farmerId; // Simplified: assumes all from one farmer
    
    if (paymentMethod === 'wallet' && user.walletBalance !== undefined) {
        const totalCost = cartTotal + 5.00; // including shipping
        if (user.walletBalance < totalCost) {
            showNotification('Insufficient wallet balance.', 'error');
            return false;
        }
        // Deduct from wallet and update user
        const updatedUser = { ...user, walletBalance: user.walletBalance - totalCost };
        setUser(updatedUser);
        setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
    }

    const newOrderData: Omit<Order, 'id'> = {
      customerId: user.id,
      farmerId: farmerIdForOrder,
      items: cart,
      total: cartTotal + 5.00, // including shipping
      date: new Date().toISOString(),
      status: OrderStatus.Confirmed,
      shippingAddress,
      paymentMethod,
    };
    
    // Use pure addOrderData from data.ts and update local state
    setOrders(prevOrders => {
      const newOrdersArray = addOrderData(prevOrders, newOrderData);
      const createdOrder = newOrdersArray.find(o => o.customerId === user.id && o.date === newOrderData.date); // Find the newly added order
      addAuditLog('Order Placed', `User ${user.fullName} placed order #${createdOrder?.id.substring(3, 9) || 'N/A'}.`, user);
      return newOrdersArray;
    });
    
    clearCart();
    showNotification('Order placed successfully!', 'success');
    return true;
  }, [user, cart, cartTotal, showNotification, addAuditLog, clearCart, setUsers, setOrders]);

  // --- Admin Functions (memoized) ---
  const adminUpdateUserStatus = useCallback((userId: string, newStatus: boolean) => {
    const userToUpdate = users.find(u => u.id === userId);
    if (userToUpdate) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: newStatus } : u));
        // If the updated user is the currently logged-in user, also update the 'user' state
        if (user && user.id === userId) {
            setUser(prevUser => prevUser ? { ...prevUser, isActive: newStatus } : null);
        }
        addAuditLog('User Status Change', `User ${userToUpdate.fullName} status changed to ${newStatus ? 'Active' : 'Blocked'}.`, user || undefined);
        showNotification('User status updated.', 'success');
    }
  }, [users, user, showNotification, addAuditLog]);

  const adminAddProduct = useCallback((productData: Omit<Product, 'id'>) => {
    setProducts(prevProducts => {
      const newProductsArray = addProductData(prevProducts, productData);
      const newProduct = newProductsArray.find(p => p.name === productData.name && p.farmerId === productData.farmerId); // Find by unique attributes or assume last added
      addAuditLog('Product Added', `Admin added product: ${newProduct?.name || 'N/A'}.`, user || undefined);
      return newProductsArray;
    });
    showNotification('Product added successfully.', 'success');
  }, [showNotification, addAuditLog, setProducts, user]);

  const adminUpdateProduct = useCallback((productData: Product) => {
    setProducts(prevProducts => {
      const updatedProductsArray = updateProductData(prevProducts, productData);
      addAuditLog('Product Updated', `Admin updated product: ${productData.name}.`, user || undefined);
      return updatedProductsArray;
    });
    showNotification('Product updated successfully.', 'success');
  }, [showNotification, addAuditLog, setProducts, user]);

  const adminDeleteProduct = useCallback((productId: string) => {
    const productName = products.find(p => p.id === productId)?.name;
    setProducts(prevProducts => {
      const newProductsArray = deleteProductData(prevProducts, productId);
      addAuditLog('Product Deleted', `Admin deleted product: ${productName} (ID: ${productId}).`, user || undefined);
      return newProductsArray;
    });
    showNotification('Product deleted successfully.', 'success');
  }, [showNotification, addAuditLog, setProducts, products, user]);
  
  // --- Farmer Product Management (memoized) ---
  const farmerAddProduct = useCallback((productData: Omit<Product, 'id' | 'farmerId'>) => {
    if (!user || user.role !== UserRole.Farmer) return;
    setProducts(prevProducts => {
      const newProductsArray = addProductData(prevProducts, { ...productData, farmerId: user.id });
      const newProduct = newProductsArray.find(p => p.name === productData.name && p.farmerId === user.id);
      addAuditLog('Product Added', `Farmer ${user.fullName} added product: ${newProduct?.name || 'N/A'}.`, user);
      return newProductsArray;
    });
    showNotification('Product added successfully.', 'success');
  }, [user, showNotification, addAuditLog, setProducts]);
  
  const farmerUpdateProduct = useCallback((productData: Product) => {
    if (!user || user.role !== UserRole.Farmer || productData.farmerId !== user.id) return;
    setProducts(prevProducts => {
      const updatedProductsArray = updateProductData(prevProducts, productData);
      addAuditLog('Product Updated', `Farmer ${user.fullName} updated product: ${productData.name}.`, user);
      return updatedProductsArray;
    });
    showNotification('Product updated successfully.', 'success');
  }, [user, showNotification, addAuditLog, setProducts]);

  const farmerDeleteProduct = useCallback((productId: string) => {
    if (!user || user.role !== UserRole.Farmer) return;
    const productToDelete = products.find(p => p.id === productId && p.farmerId === user.id);
    if (!productToDelete) return;

    setProducts(prevProducts => {
      const newProductsArray = deleteProductData(prevProducts, productId);
      addAuditLog('Product Deleted', `Farmer ${user.fullName} deleted product: ${productToDelete.name}.`, user);
      return newProductsArray;
    });
    showNotification('Product deleted successfully.', 'success');
  }, [user, products, showNotification, addAuditLog, setProducts]);


  return (
    <AppContext.Provider
      value={{
        cart, addToCart, removeFromCart, updateQuantity, clearCart, buyNow, cartCount, cartTotal,
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
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};