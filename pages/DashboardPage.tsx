

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link, useLocation, NavLink } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { UserRole, Order, Product, Address, OrderStatus, User, AuditLog as AuditLogType } from '../types';
import { categories } from '../data';
import { HomeIcon, LogOutIcon, PackageIcon, ClipboardListIcon, UserCircleIcon, PencilIcon, TrashIcon, SparklesIcon, UserGroupIcon, ChartBarIcon } from '../components/icons';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput'; // Centralized FormInput
import { generateProductImage } from '../services/geminiService';
import { getPriceSuggestions } from '../services/geminiService';


// This component acts as a router for the dashboard page.
// It enforces authentication and renders the correct dashboard based on the user's role.
const DashboardPage: React.FC = () => {
  const { user } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth', { state: { from: '/dashboard' }});
    }
  }, [user, navigate]);

  if (!user) {
    return <div className="h-screen w-screen flex items-center justify-center"><p>Loading...</p></div>; // or a loading spinner
  }
  
  if (user.role === UserRole.Farmer) {
    return <FarmerDashboard />;
  } else if (user.role === UserRole.Buyer) {
    return <BuyerDashboard />;
  } else {
    // Fallback for any other roles or if role is not defined
    navigate('/');
    return null;
  }
};


// ==================================
//      FARMER DASHBOARD
// ==================================
const FarmerDashboard = () => {
    const { user, logout, farmerProducts, farmerOrders, farmerAddProduct, farmerUpdateProduct, farmerDeleteProduct, formatPrice, showNotification } = useAppContext();
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('products');

    const renderContent = () => {
        switch (activeTab) {
            case 'products':
                return <FarmerProducts products={farmerProducts} onAdd={farmerAddProduct} onUpdate={farmerUpdateProduct} onDelete={farmerDeleteProduct} formatPrice={formatPrice} showNotification={showNotification} t={t} />;
            case 'orders':
                return <FarmerOrders orders={farmerOrders} formatPrice={formatPrice} />;
            case 'profile':
                return <ProfileManagement />;
            default:
                return <FarmerProducts products={farmerProducts} onAdd={farmerAddProduct} onUpdate={farmerUpdateProduct} onDelete={farmerDeleteProduct} formatPrice={formatPrice} showNotification={showNotification} t={t} />;
        }
    };
    
    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <Sidebar onTabChange={setActiveTab} activeTab={activeTab} />
            <div className="flex-1 flex flex-col">
                <Header title="Farmer Dashboard" user={user} />
                <main className="flex-1 p-8 overflow-y-auto">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}

// ==================================
//      BUYER DASHBOARD
// ==================================
const BuyerDashboard = () => {
    const { user, customerOrders, formatPrice } = useAppContext();
    const [activeTab, setActiveTab] = useState('orders');

    const renderContent = () => {
        switch (activeTab) {
            case 'profile': return <ProfileManagement />;
            case 'orders':
            default:
                return <BuyerOrders orders={customerOrders} formatPrice={formatPrice} />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <Sidebar onTabChange={setActiveTab} activeTab={activeTab} />
            <div className="flex-1 flex flex-col">
                <Header title="My Dashboard" user={user} />
                <main className="flex-1 p-8 overflow-y-auto">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};


// ==================================
//      SHARED COMPONENTS
// ==================================
const Sidebar = ({ onTabChange, activeTab }: { onTabChange: (tab: string) => void, activeTab: string}) => {
    const { user, logout } = useAppContext();
    const { t } = useLanguage();
    const isFarmer = user?.role === UserRole.Farmer;
    const location = useLocation(); // Get current location to check for active external links

    const navItems = isFarmer 
        ? [
            { id: 'products', label: t('dashboard.products'), icon: <PackageIcon className="w-6 h-6" />, internal: true }, 
            { id: 'orders', label: t('dashboard.orders'), icon: <ClipboardListIcon className="w-6 h-6" />, internal: true }, 
            { id: 'profile', label: t('dashboard.profile'), icon: <UserCircleIcon className="w-6 h-6" />, internal: true },
            ...(user?.isOwner ? [{ id: 'admin', label: t('header.admin'), icon: <UserGroupIcon className="w-6 h-6" />, path: '/admin', internal: false }] : []) // Add Admin Portal if user is also owner
          ]
        : [{ id: 'orders', label: t('dashboard.myOrders'), icon: <ClipboardListIcon className="w-6 h-6" />, internal: true }, { id: 'profile', label: t('dashboard.profileSettings'), icon: <UserCircleIcon className="w-6 h-6" />, internal: true }];

    return (
        <aside className="w-64 bg-white text-gray-800 flex flex-col shadow-lg">
            <div className="p-6 flex items-center justify-center border-b h-20">
                 <Link to="/" className="text-2xl font-bold tracking-tight hover:text-primary transition-colors">
                    <span className="text-gray-800">Harvest</span><span className="text-primary">Hub</span>
                </Link>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2">
                {navItems.map(item => (
                    item.internal ? ( // If it's an internal tab, use SidebarButton with onTabChange
                        <SidebarButton key={item.id} icon={item.icon} label={item.label} active={activeTab === item.id} onClick={() => onTabChange(item.id)} />
                    ) : ( // If it's an external link, use NavLink
                        <NavLink 
                            to={item.path as string} 
                            key={item.id} 
                            // Use isActive from NavLink for styling external links
                            className={({ isActive }) => 
                                `w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-base font-medium ${isActive || location.pathname === item.path ? 'bg-primary text-white shadow' : 'hover:bg-gray-200'}`
                            }
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </NavLink>
                    )
                ))}
            </nav>
            <div className="px-4 py-4 border-t space-y-2">
                 <Link to="/" className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <HomeIcon className="w-6 h-6" />
                    <span>Back to Home</span>
                </Link>
                <button onClick={logout} className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                    <LogOutIcon className="w-6 h-6" />
                    <span>Logout</span>
                </button>
            </div> 
        </aside>
    );
};

// FIX: Define SidebarButtonProps interface to correctly type props, including inherited HTML attributes.
interface SidebarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon: React.ReactNode;
    label: string;
    active: boolean;
}

// FIX: Explicitly define SidebarButton as a React Functional Component (React.FC)
const SidebarButton: React.FC<SidebarButtonProps> = ({ icon, label, active, onClick, ...rest }) => (
    <button onClick={onClick} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-base font-medium ${active ? 'bg-primary text-white shadow' : 'hover:bg-gray-200'}`} {...rest}>
        {icon}
        <span>{label}</span>
    </button>
);

const Header = ({ title, user }: { title: string, user: User | null }) => {
    return (
        <header className="bg-white shadow-sm h-20 flex items-center justify-between px-8 border-b">
             <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
             <div className="text-right">
                <p className="font-semibold">{user?.fullName}</p>
                <p className="text-sm text-gray-500">{user?.role} {user?.role === UserRole.Farmer && user.farmerType ? ` (${user.farmerType})` : ''}</p>
            </div>
        </header>
    );
};


// ==================================
//      DASHBOARD PANELS
// ==================================

// --- Buyer: Orders Panel ---
const BuyerOrders = ({ orders, formatPrice }: { orders: Order[], formatPrice: (price: number) => string }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">My Order History</h2>
        {orders.length > 0 ? (
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b bg-gray-50 text-sm text-gray-600 uppercase">
                            <th className="p-3">Order ID</th><th className="p-3">Date</th><th className="p-3">Total</th><th className="p-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.id} className="border-b hover:bg-gray-50">
                                <td className="p-3 font-mono text-sm">#{order.id.substring(3, 9)}</td>
                                <td className="p-3">{new Date(order.date).toLocaleDateString()}</td>
                                <td className="p-3">{formatPrice(order.total)}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 text-xs rounded-full ${order.status === OrderStatus.Delivered ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{order.status}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ) : <p>You haven't placed any orders yet.</p>}
    </div>
);

// --- Farmer: Orders Panel ---
const FarmerOrders = ({ orders, formatPrice }: { orders: Order[], formatPrice: (price: number) => string }) => (
     <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Incoming Orders</h2>
        {orders.length > 0 ? (
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                     <thead>
                        <tr className="border-b bg-gray-50 text-sm text-gray-600 uppercase">
                            <th className="p-3">Order ID</th><th className="p-3">Customer</th><th className="p-3">Date</th><th className="p-3">Total</th><th className="p-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                       {orders.map(order => (
                            <tr key={order.id} className="border-b hover:bg-gray-50">
                                <td className="p-3 font-mono text-sm">#{order.id.substring(3, 9)}</td>
                                <td className="p-3">{order.shippingAddress.fullName}</td>
                                <td className="p-3">{new Date(order.date).toLocaleDateString()}</td>
                                <td className="p-3">{formatPrice(order.total)}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 text-xs rounded-full ${order.status === OrderStatus.Delivered ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{order.status}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ) : <p>You have no incoming orders.</p>}
    </div>
);


// --- Farmer: Products Panel ---
const FarmerProducts = ({ products, onAdd, onUpdate, onDelete, formatPrice, showNotification, t }: { products: Product[], onAdd: any, onUpdate: any, onDelete: any, formatPrice: (p: number) => string, showNotification: (msg: string, type: 'success' | 'error') => void, t: (key: string, replacements?: { [key: string]: string | number }) => string}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [priceSuggestionModal, setPriceSuggestionModal] = useState<{ product: Product, suggestedPrice: number, reason: string } | null>(null);
    const [isSuggestingPrice, setIsSuggestingPrice] = useState<string | null>(null); // Stores product ID being processed
    const [selectedProductForDetails, setSelectedProductForDetails] = useState<Product | null>(null);


    const handleAddClick = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };
    
    const handleEditClick = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };
    
    // FIX: Corrected the onSave prop type to handle new products which lack an 'id' and 'farmerId'.
    const handleSave = (productData: Product | Omit<Product, 'id' | 'farmerId'>) => {
        if ('id' in productData) {
            onUpdate(productData);
        } else {
            onAdd(productData);
        }
        setIsModalOpen(false);
    };

    const handleGetPriceSuggestion = async (product: Product) => {
        setIsSuggestingPrice(product.id);
        try {
            const suggestions = await getPriceSuggestions([product]);
            if (suggestions && suggestions.length > 0) {
                const suggestion = suggestions.find(s => s.productId === product.id);
                if (suggestion) {
                    setPriceSuggestionModal({ product, suggestedPrice: suggestion.suggestedPrice, reason: suggestion.reason });
                } else {
                    showNotification(t('dashboard.noSpecificSuggestion'), 'error');
                }
            } else {
                showNotification(t('dashboard.noSuggestionsReturned'), 'error');
            }
        } catch (error) {
            console.error("Error fetching price suggestion:", error);
            showNotification(t('dashboard.failedToGetAiSuggestion'), 'error');
        } finally {
            setIsSuggestingPrice(null);
        }
    };


    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
             {isModalOpen && (
                <Modal title={editingProduct ? t('admin.editProduct') : t('admin.addNewProduct')} onClose={() => setIsModalOpen(false)}>
                    <ProductForm product={editingProduct} onSave={handleSave} onCancel={() => setIsModalOpen(false)} showNotification={showNotification} t={t} />
                </Modal>
            )}
            {priceSuggestionModal && (
                <Modal title={t('dashboard.priceSuggestionFor', { productName: priceSuggestionModal.product.name })} onClose={() => setPriceSuggestionModal(null)}>
                    <div className="space-y-4">
                        <p className="text-gray-700"><strong>{t('dashboard.currentPrice')}:</strong> {formatPrice(priceSuggestionModal.product.price)}</p>
                        <p className="text-lg font-semibold text-primary"><strong>{t('dashboard.suggestedPrice')}:</strong> {formatPrice(priceSuggestionModal.suggestedPrice)}</p>
                        <p className="text-gray-700"><strong>{t('dashboard.reason')}:</strong> {priceSuggestionModal.reason}</p>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button onClick={() => setPriceSuggestionModal(null)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">{t('common.close')}</button>
                    </div>
                </Modal>
            )}
             {selectedProductForDetails && (
                <Modal title={t('dashboard.productDetails')} onClose={() => setSelectedProductForDetails(null)}>
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold">{selectedProductForDetails.name}</h3>
                        <img src={selectedProductForDetails.imageUrl} alt={selectedProductForDetails.name} className="w-full h-48 object-cover rounded-lg"/>
                        <p><strong>{t('dashboard.productDescription')}:</strong> {selectedProductForDetails.description}</p>
                        <p><strong>{t('admin.price')}:</strong> {formatPrice(selectedProductForDetails.price)}</p>
                        <p><strong>{t('dashboard.productCategory')}:</strong> {selectedProductForDetails.category}</p>
                        <p><strong>{t('dashboard.productUnit')}:</strong> {selectedProductForDetails.unit}</p>
                        <p><strong>{t('dashboard.productStock')}:</strong> {selectedProductForDetails.stock}</p>
                        <p><strong>{t('dashboard.productStatus')}:</strong> <span className={`px-2 py-1 text-xs rounded-full ${selectedProductForDetails.isEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{selectedProductForDetails.isEnabled ? t('dashboard.enabled') : t('dashboard.disabled')}</span></p>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button onClick={() => setSelectedProductForDetails(null)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">{t('common.close')}</button>
                    </div>
                </Modal>
            )}
            <div className="flex justify-between items-center mb-4">
                 <h2 className="text-2xl font-semibold">My Products</h2>
                 <button onClick={handleAddClick} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">Add Product</button>
            </div>
             {products.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                         <thead>
                            <tr className="border-b bg-gray-50 text-sm text-gray-600 uppercase">
                                <th className="p-3">Product</th><th className="p-3">Category</th><th className="p-3">Price</th><th className="p-3">Stock</th><th className="p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(p => (
                                <tr key={p.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3 flex items-center space-x-3">
                                        <img src={p.imageUrl} alt={p.name} className="w-12 h-12 object-cover rounded-md" />
                                        <span>{p.name}</span>
                                    </td>
                                    <td className="p-3">{p.category}</td>
                                    <td className="p-3">{formatPrice(p.price)}</td>
                                    <td className="p-3">{p.stock}</td>
                                    <td className="p-3 space-x-2 flex items-center">
                                        <button 
                                            onClick={() => handleGetPriceSuggestion(p)} 
                                            className="p-1 text-purple-600 hover:text-purple-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                                            title={t('dashboard.aiPriceSuggestion')}
                                            disabled={isSuggestingPrice === p.id}
                                        >
                                            {isSuggestingPrice === p.id ? (
                                                <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            ) : (
                                                <ChartBarIcon className="w-5 h-5"/>
                                            )}
                                        </button>
                                        <button onClick={() => handleEditClick(p)} className="p-1 text-blue-600 hover:text-blue-800"><PencilIcon className="w-5 h-5"/></button>
                                        <button onClick={() => onDelete(p.id)} className="p-1 text-red-600 hover:text-red-800"><TrashIcon className="w-5 h-5"/></button>
                                        <button onClick={() => setSelectedProductForDetails(p)} className="p-1 text-gray-600 hover:text-gray-800" title={t('dashboard.viewProductDetails')}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639l4.418-5.523a1.875 1.875 0 0 1 2.652-.64l.564.282a1.875 1.875 0 0 0 2.652-.64l4.418-5.523a1.012 1.012 0 0 1 0 .639l-4.418 5.523a1.875 1.875 0 0 1-2.652.64l-.564-.282a1.875 1.875 0 0 0-2.652.64L2.036 12.322Z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             ) : <p>You haven't added any products yet.</p>}
        </div>
    );
};

// --- Farmer: Product Add/Edit Form ---
// FIX: Corrected the onSave prop type to match the data structure of a new product from the form.
const ProductForm = ({ product, onSave, onCancel, showNotification, t }: { product: Product | null, onSave: (p: Product | Omit<Product, 'id' | 'farmerId'>) => void, onCancel: () => void, showNotification: (msg: string, type: 'success' | 'error') => void, t: (key: string, replacements?: { [key: string]: string | number }) => string }) => {
    const [formData, setFormData] = useState<Omit<Product, 'id' | 'farmerId'>>({
        name: product?.name || '', price: product?.price || 0, description: product?.description || '', imageUrl: product?.imageUrl || '',
        category: product?.category || categories[0].name, unit: product?.unit || 'lb', stock: product?.stock || 0,
        isEnabled: product?.isEnabled ?? true,
    });
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : (['price', 'stock'].includes(name) ? parseFloat(value) || 0 : value);
        setFormData(prev => ({ ...prev, [name]: val }));
    };
    
    const handleGenerateImage = async () => {
        if (!formData.name) {
            showNotification(t('common.enterProductNameForImage'), 'error');
            return;
        }
        setIsGeneratingImage(true);
        try {
            const imageUrl = await generateProductImage(formData.name);
            setFormData(prev => ({ ...prev, imageUrl }));
            showNotification(t('common.imageGeneratedSuccess'), 'success');
        } catch (error) {
            console.error(error);
            showNotification(t('common.failedToGenerateImage'), 'error');
        } finally {
            setIsGeneratingImage(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (product) {
            onSave({ ...product, ...formData });
        } else {
            onSave(formData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput name="name" label={t('admin.productName')} value={formData.name} onChange={handleChange} required />
            <FormInput name="price" type="number" label={t('admin.price')} value={formData.price} onChange={handleChange} required step="0.01" />
            <FormInput name="description" label={t('admin.description')} value={formData.description} onChange={handleChange} as="textarea" />
            <div className="flex items-end gap-2">
                <FormInput name="imageUrl" label={t('admin.imageUrl')} value={formData.imageUrl} onChange={handleChange} className="flex-grow" />
                <button type="button" onClick={handleGenerateImage} disabled={isGeneratingImage || !formData.name} className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-400 flex items-center space-x-2 whitespace-nowrap">
                    <SparklesIcon className="w-5 h-5" />
                    <span>{isGeneratingImage ? t('common.generatingImage') : t('common.aiGenerateImage')}</span>
                </button>
            </div>
            {formData.imageUrl && <img src={formData.imageUrl} alt="preview" className="w-32 h-32 object-cover rounded-md mt-2"/>}
            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                     <label htmlFor="category" className="block text-sm font-medium text-gray-700">{t('admin.category')}</label>
                    <select id="category" name="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
                        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                </div>
                <FormInput name="stock" type="number" label={t('admin.stock')} value={formData.stock} onChange={handleChange} required className="col-span-1" />
                <FormInput name="unit" label={t('admin.unit')} value={formData.unit} onChange={handleChange} required className="col-span-1"/>
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">Save Product</button>
            </div>
        </form>
    );
};


// --- Shared: Profile Panel ---
const ProfileManagement = () => {
    const { user, updateUserProfile } = useAppContext();
    const [formData, setFormData] = useState<User | null>(user);

    useEffect(() => { setFormData(user) }, [user]);

    if (!formData) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => prev ? { ...prev, [name]: value } : null);
    };

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => prev ? { ...prev, deliveryAddress: { ...prev.deliveryAddress as Address, [name]: value } } : null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData) updateUserProfile(formData);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-6">Profile Settings</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput name="fullName" label="Full Name" value={formData.fullName} onChange={handleChange} />
                    <FormInput name="email" type="email" label="Email" value={formData.email} onChange={handleChange} disabled /> {/* Email should not be editable generally */}
                    <FormInput name="mobile" label="Mobile" type="tel" value={formData.mobile} onChange={handleChange} />
                </div>
                 <div className="pt-4 border-t">
                     <h3 className="text-xl font-semibold mb-4">Delivery Address</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <FormInput name="street" label="Street" value={formData.deliveryAddress?.street || ''} onChange={handleAddressChange} />
                         <FormInput name="city" label="City" value={formData.deliveryAddress?.city || ''} onChange={handleAddressChange} />
                         <FormInput name="state" label="State" value={formData.deliveryAddress?.state || ''} onChange={handleAddressChange} />
                         <FormInput name="pincode" label="Pincode" value={formData.deliveryAddress?.pincode || ''} onChange={handleAddressChange} />
                     </div>
                 </div>
                 <div className="flex justify-end pt-4">
                     <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">Save Changes</button>
                 </div>
            </form>
        </div>
    );
};

export default DashboardPage;