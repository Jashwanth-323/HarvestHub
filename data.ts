import { Product, Category, User, UserRole, Order, OrderStatus, CartItem, FarmerType, AuditLog, Address } from './types';

export const categories: Category[] = [
  { id: 'cat1', name: 'Fruits', imageUrl: 'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
  { id: 'cat2', name: 'Vegetables', imageUrl: 'https://images.pexels.com/photos/1459339/pexels-photo-1459339.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
  { id: 'cat3', name: 'Grains', imageUrl: 'https://images.pexels.com/photos/1796695/pexels-photo-1796695.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
  { id: 'cat4', name: 'Others', imageUrl: 'https://images.pexels.com/photos/842519/pexels-photo-842519.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
];

// Use internal mutable arrays for data.ts, but expose pure functions to AppContext
let _products: Product[] = [
  // Featured & Fruits
  { id: 'p2', name: 'Organic Strawberries', price: 4.99, description: 'Plump and sweet strawberries, perfect for desserts.', imageUrl: 'https://images.pexels.com/photos/2152/vegetables-potatoes-food-fresh.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', category: 'Fruits', unit: 'pint', stock: 50, farmerId: 'u2', isEnabled: true },
  { id: 'p1', name: 'Organic Apples', price: 2.99, description: 'Crisp, sweet, and juicy apples, grown without pesticides.', imageUrl: 'https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', category: 'Fruits', unit: 'lb', stock: 10, farmerId: 'u2', isEnabled: true },
  { id: 'p3', name: 'Juicy Oranges', price: 3.25, description: 'Full of Vitamin C, perfect for a healthy snack.', imageUrl: 'https://images.pexels.com/photos/161559/background-bitter-breakfast-bright-161559.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', category: 'Fruits', unit: 'lb', stock: 80, farmerId: 'u2', isEnabled: true },
  { id: 'p13', name: 'Organic Bananas', price: 1.99, description: 'Sweet and creamy organic bananas, a perfect energy booster.', imageUrl: 'https://images.pexels.com/photos/2280927/pexels-photo-2280927.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', category: 'Fruits', unit: 'lb', stock: 120, farmerId: 'u2', isEnabled: true },
  { id: 'p14', name: 'Red Seedless Grapes', price: 3.49, description: 'Crisp and juicy red seedless grapes, great for snacking.', imageUrl: 'https://images.pexels.com/photos/1029243/pexels-photo-1029243.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', category: 'Fruits', unit: 'lb', stock: 75, farmerId: 'u2', isEnabled: true },
  
  // Featured & Vegetables
  { id: 'p5', name: 'Fresh Carrots', price: 2.49, description: 'Sweet and crunchy carrots, great for snacking or cooking.', imageUrl: 'https://images.pexels.com/photos/1306559/pexels-photo-1306559.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', category: 'Vegetables', unit: 'bunch', stock: 5, farmerId: 'u2', isEnabled: true },
  { id: 'p4', name: 'Heirloom Tomatoes', price: 3.99, description: 'Colorful and flavorful tomatoes for salads and sauces.', imageUrl: 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', category: 'Vegetables', unit: 'lb', stock: 60, farmerId: 'u2', isEnabled: true },
  { id: 'p6', name: 'Leafy Spinach', price: 2.50, description: 'Fresh spinach, packed with nutrients.', imageUrl: 'https://images.pexels.com/photos/2325843/pexels-photo-2325843.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', category: 'Vegetables', unit: 'bunch', stock: 90, farmerId: 'u2', isEnabled: true },
  { id: 'p12', name: 'Romaine Lettuce', price: 2.75, description: 'Crisp and refreshing romaine lettuce, ideal for Caesar salads.', imageUrl: 'https://images.pexels.com/photos/2893636/pexels-photo-2893636.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', category: 'Vegetables', unit: 'head', stock: 70, farmerId: 'u2', isEnabled: true },
  { id: 'p15', name: 'Fresh Broccoli', price: 2.29, description: 'Fresh broccoli florets, packed with vitamins.', imageUrl: 'https://images.pexels.com/photos/47347/broccoli-vegetable-food-healthy-47347.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', category: 'Vegetables', unit: 'head', stock: 65, farmerId: 'u2', isEnabled: true },
  { id: 'p16', name: 'Mixed Bell Peppers', price: 3.99, description: 'A colorful mix of red, yellow, and green bell peppers.', imageUrl: 'https://images.pexels.com/photos/161985/peppers-vegetables-scharf-food-161985.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', category: 'Vegetables', unit: '3-pack', stock: 55, farmerId: 'u2', isEnabled: true },
  { id: 'p17', name: 'Crisp Cucumbers', price: 0.99, description: 'Cool and refreshing cucumbers, perfect for salads or as a snack.', imageUrl: 'https://images.pexels.com/photos/2329440/pexels-photo-2329440.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', category: 'Vegetables', unit: 'each', stock: 150, farmerId: 'u2', isEnabled: true },

  // Featured & Grains
  { id: 'p7', name: 'Whole Wheat Bread', price: 3.99, description: 'Freshly baked whole wheat bread for all your needs.', imageUrl: 'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', category: 'Grains', unit: 'loaf', stock: 40, farmerId: 'u2', isEnabled: true },
  { id: 'p8', name: 'Organic Oats', price: 4.25, description: 'Rolled oats for a hearty and healthy breakfast.', imageUrl: 'https://images.pexels.com/photos/374052/pexels-photo-374052.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', category: 'Grains', unit: '2lb bag', stock: 60, farmerId: 'u2', isEnabled: true },
  { id: 'p18', name: 'Organic Brown Rice', price: 5.49, description: 'Nutritious and wholesome organic brown rice, a staple for any healthy meal.', imageUrl: 'https://images.pexels.com/photos/725997/pexels-photo-725997.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', category: 'Grains', unit: '2lb bag', stock: 70, farmerId: 'u2', isEnabled: true },
  { id: 'p19', name: 'Tri-Color Quinoa', price: 6.99, description: 'A versatile and protein-packed blend of white, red, and black quinoa.', imageUrl: 'https://images.pexels.com/photos/4114757/pexels-photo-4114757.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', category: 'Grains', unit: '1lb bag', stock: 50, farmerId: 'u2', isEnabled: true },
  { id: 'p20', name: 'Pearl Barley', price: 3.79, description: 'Hearty and chewy pearl barley, perfect for soups, stews, and salads.', imageUrl: 'https://images.pexels.com/photos/6888031/pexels-photo-6888031.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', category: 'Grains', unit: '1lb bag', stock: 85, farmerId: 'u2', isEnabled: true },

  // Featured & Others (Dairy)
  { id: 'p11', name: 'Farm-Fresh Eggs', price: 5.99, description: 'A dozen fresh, free-range chicken eggs.', imageUrl: 'https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', category: 'Others', unit: 'dozen', stock: 150, farmerId: 'u2', isEnabled: true },
  { id: 'p9', name: 'Farm Fresh Milk', price: 3.75, description: 'Creamy and delicious whole milk from grass-fed cows.', imageUrl: 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', category: 'Others', unit: 'gallon', stock: 30, farmerId: 'u2', isEnabled: true },
  { id: 'p10', name: 'Artisanal Cheddar Cheese', price: 8.99, description: 'Aged sharp cheddar cheese with a rich, nutty flavor.', imageUrl: 'https://images.pexels.com/photos/1435184/pexels-photo-1435184.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', category: 'Others', unit: '8oz block', stock: 25, farmerId: 'u2', isEnabled: true },
];

let _orders: Order[] = [
    { id: 'ord1', customerId: 'u1', farmerId: 'u2', items: [{ product: _products[0], quantity: 2 }, { product: _products[4], quantity: 1 }], total: 12.47, date: '2024-07-20T10:00:00Z', status: OrderStatus.Delivered, shippingAddress: { fullName: 'John Doe', phone: '1234567890', street: '123 Main St', city: 'Anytown', state: 'California', country: 'USA', pincode: '12345' }, paymentMethod: 'card' },
    { id: 'ord2', customerId: 'u1', farmerId: 'u2', items: [{ product: _products[6], quantity: 1 }], total: 3.99, date: '2024-07-22T14:30:00Z', status: OrderStatus.Confirmed, shippingAddress: { fullName: 'John Doe', phone: '1234567890', street: '123 Main St', city: 'Anytown', state: 'California', country: 'USA', pincode: '12345' }, paymentMethod: 'upi'  },
];

// --- Export initial data (deep copies to prevent external mutation) ---
export const getInitialProducts = (): Product[] => JSON.parse(JSON.stringify(_products));
export const getInitialOrders = (): Order[] => JSON.parse(JSON.stringify(_orders));


// --- Pure functions for product management (return new array) ---
export const addProduct = (currentProducts: Product[], productData: Omit<Product, 'id'>): Product[] => {
    const newProduct: Product = {
        ...productData,
        id: `p${Date.now()}`,
    };
    return [newProduct, ...currentProducts];
};

export const updateProduct = (currentProducts: Product[], productData: Product): Product[] => {
    return currentProducts.map(p => p.id === productData.id ? productData : p);
};

export const deleteProduct = (currentProducts: Product[], productId: string): Product[] => {
    return currentProducts.filter(p => p.id !== productId);
};


// --- Pure functions for order management (return new array) ---
export const addOrder = (currentOrders: Order[], orderData: Omit<Order, 'id'>): Order[] => {
    const newOrder: Order = {
        ...orderData,
        id: `ord${Date.now()}`,
    };
    return [newOrder, ...currentOrders];
};

// --- Helper functions for filtering existing arrays ---
export const getProductsByFarmerId = (products: Product[], farmerId: string): Product[] => {
  return products.filter(p => p.farmerId === farmerId);
}
export const getOrdersByCustomerId = (orders: Order[], customerId: string): Order[] => {
    return orders.filter(o => o.customerId === customerId);
};
export const getOrdersByFarmerId = (orders: Order[], farmerId: string): Order[] => {
    return orders.filter(o => o.farmerId === farmerId);
};