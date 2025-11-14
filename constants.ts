
import { User, Product, Category, Order, UserRole, OrderStatus } from './types';

export const USERS: User[] = [
  { id: 'user-1', name: 'Farmer John', email: 'farmer@test.com', password: 'password', role: UserRole.FARMER },
  { id: 'user-2', name: 'Customer Jane', email: 'customer@test.com', password: 'password', role: UserRole.CUSTOMER },
];

export const CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Fruits', image: 'https://i.imgur.com/8PAQo51.png' },
  { id: 'cat-2', name: 'Vegetables', image: 'https://i.imgur.com/5SMyzSg.png' },
  { id: 'cat-4', name: 'Grains', image: 'https://i.imgur.com/sC0Et7N.png' },
  { id: 'cat-3', name: 'Others', image: 'https://i.imgur.com/KNP0YJ6.png' },
];

export const PRODUCTS: Product[] = [
  {
    id: 'prod-6',
    name: 'Organic Strawberries',
    farm: 'Green Valley Farm',
    description: 'Juicy and sweet strawberries, hand-picked at peak ripeness.',
    price: 4.99,
    unit: 'kg',
    stock: 90,
    category: 'Fruits',
    image: 'https://i.imgur.com/0FwO4f3.jpeg',
    farmerId: 'user-1',
  },
  {
    id: 'prod-2',
    name: 'Fresh Carrots',
    farm: 'Surry Fields',
    description: 'Sweet and crunchy carrots, harvested this morning. Rich in Vitamin A.',
    price: 2.49,
    unit: 'kg',
    stock: 150,
    category: 'Vegetables',
    image: 'https://i.imgur.com/P2x2d2r.jpeg',
    farmerId: 'user-1',
  },
  {
    id: 'prod-7',
    name: 'Whole Wheat Bread',
    farm: "Baker's Harvest",
    description: 'Hearty and delicious whole wheat bread, baked fresh daily with natural ingredients.',
    price: 3.99,
    unit: 'piece',
    stock: 50,
    category: 'Grains',
    image: 'https://i.imgur.com/T3a0hJc.jpeg',
    farmerId: 'user-1',
  },
  {
    id: 'prod-8',
    name: 'Farm-Fresh Eggs',
    farm: 'Meadowlands Farm',
    description: 'A dozen of our finest free-range eggs, with rich, golden yolks.',
    price: 5.99,
    unit: 'piece',
    stock: 75,
    category: 'Others',
    image: 'https://i.imgur.com/pYyVb0S.jpeg',
    farmerId: 'user-1',
  },
  {
    id: 'prod-1',
    name: 'Organic Apples',
    farm: 'Orchard Hill',
    description: 'Crisp and juicy Gala apples, perfect for snacking or baking. Grown without synthetic pesticides.',
    price: 3.50,
    unit: 'kg',
    stock: 100,
    category: 'Fruits',
    image: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?q=80&w=600',
    farmerId: 'user-1',
  },
  {
    id: 'prod-4',
    name: 'Heirloom Tomatoes',
    farm: 'Sunshine Gardens',
    description: 'Vibrant and flavorful heirloom tomatoes, perfect for salads and sauces.',
    price: 4.50,
    unit: 'kg',
    stock: 80,
    category: 'Vegetables',
    image: 'https://images.unsplash.com/photo-1561138241-942d921312a1?q=80&w=600',
    farmerId: 'user-1',
  },
   {
    id: 'prod-5',
    name: 'Organic Broccoli',
    farm: 'Green Valley Farm',
    description: 'Fresh broccoli heads, packed with nutrients. Great for steaming or roasting.',
    price: 3.00,
    unit: 'piece',
    stock: 120,
    category: 'Vegetables',
    image: 'https://images.unsplash.com/photo-1587353920436-43f56350753f?q=80&w=600',
    farmerId: 'user-1',
  },
];

export const ORDERS: Order[] = [
    {
        id: 'order-1',
        customerId: 'user-2',
        items: [
            { ...PRODUCTS[0], quantity: 2 },
            { ...PRODUCTS[1], quantity: 1 },
        ],
        total: (PRODUCTS[0].price * 2) + PRODUCTS[1].price,
        status: OrderStatus.DELIVERED,
        date: new Date('2023-10-26T10:00:00Z'),
    },
    {
        id: 'order-2',
        customerId: 'user-2',
        items: [
            { ...PRODUCTS[4], quantity: 3 },
        ],
        total: PRODUCTS[4].price * 3,
        status: OrderStatus.PENDING,
        date: new Date(),
    }
];
