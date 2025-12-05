
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { UserRole, OrderStatus, User, Order, Product, AuditLog as AuditLogType, PriceSuggestion } from '../types';
import { categories } from '../data';
import { HomeIcon, LogOutIcon, PackageIcon, ClipboardListIcon, UserCircleIcon, UserGroupIcon, ChartBarIcon, HistoryIcon, PencilIcon, TrashIcon, DownloadIcon, SparklesIcon, AlertTriangleIcon, ChartPieIcon, CreditCardIcon, CashIcon } from '../components/icons';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput'; // Centralized FormInput
import { generateProductImage } from '../services/geminiService';
import { getPriceSuggestions } from '../services/geminiService';

// Helper component for Sidebar Buttons
const SidebarButton = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
    <button onClick={onClick} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-base font-medium ${active ? 'bg-primary text-white shadow' : 'hover:bg-gray-200'}`}>
        {icon}
        <span>{label}</span>
    </button>
);

// This component acts as a router for the admin page.
// It enforces authentication and renders the correct view based on the user's owner status.
export const AdminPage: React.FC = () => {
  const { user } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth', { state: { from: '/admin' }});
    }
  }, [user, navigate]);

  if (!user) {
    return null; // or a loading spinner
  }
  
  if (user.isOwner) {
    return <OwnerAdminDashboard />;
  } else {
    return <ReadOnlyDashboard />;
  }
};

// Component for non-owner users
const ReadOnlyDashboard = () => {
    const { user, logout } = useAppContext();
    const { t } = useLanguage();

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <aside className="w-64 bg-white text-gray-800 flex flex-col shadow-lg">
                <div className="p-6 flex items-center justify-center border-b h-20">
                    <Link to="/" className="text-2xl font-bold tracking-tight hover:text-primary transition-colors">
                        <span className="text-gray-800">Harvest</span><span className="text-primary">Hub</span>
                    </Link>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2">
                    <Link to="/dashboard" className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-base font-medium hover:bg-gray-200">
                        <ClipboardListIcon className="w-6 h-6" />
                        <span>{t('dashboard.myOrders')}</span>
                    </Link>
                </nav>
                <div className="px-4 py-4 border-t space-y-2">
                    <button onClick={logout} className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                        <LogOutIcon className="w-6 h-6" />
                        <span>{t('header.logout')}</span>
                    </button>
                </div> 
            </aside>
            <div className="flex-1 flex flex-col">
                <header className="bg-white shadow-sm h-20 flex items-center justify-between px-8 border-b">
                    <h1 className="text-2xl font-bold text-gray-800">{t('admin.readOnlyView')}</h1>
                    <div className="text-right">
                        <p className="font-semibold">{user?.fullName}</p>
                        <p className="text-sm text-gray-500">{user?.role}</p>
                    </div>
                </header>
                <main className="flex-1 p-8 overflow-y-auto">
                    <div className="bg-white p-6 rounded-lg shadow-md text-center">
                        <h2 className="text-2xl font-semibold">{t('admin.accessDenied')}</h2>
                        <p className="mt-2 text-gray-600">
                            {t('admin.accessDeniedInfo')}
                        </p>
                        <Link to="/" className="mt-4 inline-block bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-dark">
                            {t('admin.goToHomepage')}
                        </Link>
                    </div>
                </main>
            </div>
        </div>
    );
};

// ==================================
//      OWNER ADMIN DASHBOARD
// ==================================
const OwnerAdminDashboard = () => {
    const { user, logout } = useAppContext();
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('users');

    const renderContent = () => {
        switch (activeTab) {
            case 'users': return <UserManagement />;
            // FIX: ProductManagement component implemented below
            case 'products': return <ProductManagement />;
            case 'orders': return <AdminOrders />;
            case 'payments': return <AdminPayments />;
            // FIX: AdminDisputes component implemented below
            case 'disputes': return <AdminDisputes />;
            // FIX: AdminPriceMonitoring component implemented below
            case 'price-monitoring': return <AdminPriceMonitoring />;
            // FIX: AdminAnalytics component implemented below
            case 'analytics': return <AdminAnalytics />;
            // FIX: AuditLog component implemented below
            case 'audit': return <AuditLog />;
            default:
                return <UserManagement />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <aside className="w-64 bg-white text-gray-800 flex flex-col shadow-lg">
                <div className="p-6 flex items-center justify-center border-b h-20">
                    <Link to="/" className="text-2xl font-bold tracking-tight hover:text-primary transition-colors">
                        <span className="text-gray-800">Harvest</span><span className="text-primary">Hub</span>
                    </Link>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2">
                    <SidebarButton icon={<UserGroupIcon className="w-6 h-6" />} label={t('admin.users')} active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
                    <SidebarButton icon={<ClipboardListIcon className="w-6 h-6" />} label={t('admin.orders')} active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} />
                    <SidebarButton icon={<CreditCardIcon className="w-6 h-6" />} label={t('admin.payments')} active={activeTab === 'payments'} onClick={() => setActiveTab('payments')} />
                    <SidebarButton icon={<PackageIcon className="w-6 h-6" />} label={t('admin.products')} active={activeTab === 'products'} onClick={() => setActiveTab('products')} />
                    <SidebarButton icon={<AlertTriangleIcon className="w-6 h-6" />} label={t('admin.disputes')} active={activeTab === 'disputes'} onClick={() => setActiveTab('disputes')} />
                    <SidebarButton icon={<ChartBarIcon className="w-6 h-6" />} label={t('admin.priceMonitoring')} active={activeTab === 'price-monitoring'} onClick={() => setActiveTab('price-monitoring')} />
                    <SidebarButton icon={<ChartPieIcon className="w-6 h-6" />} label={t('admin.analytics')} active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
                    <SidebarButton icon={<HistoryIcon className="w-6 h-6" />} label={t('admin.auditLog')} active={activeTab === 'audit'} onClick={() => setActiveTab('audit')} />
                </nav>
                 <div className="px-4 py-4 border-t space-y-2">
                    <button onClick={logout} className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                        <LogOutIcon className="w-6 h-6" />
                        <span>{t('header.logout')}</span>
                    </button>
                </div> 
            </aside>
            <div className="flex-1 flex flex-col">
                <header className="bg-white shadow-sm h-20 flex items-center justify-between px-8 border-b">
                     <h1 className="text-2xl font-bold text-gray-800">{t('admin.ownerDashboardTitle')}</h1>
                     <div className="text-right">
                        <p className="font-semibold">{user?.fullName}</p>
                        <p className="text-sm text-gray-500">{t('admin.marketplaceOwner')}</p>
                    </div>
                </header>
                <main className="flex-1 p-8 overflow-y-auto">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};


// --- User Management Component ---
const UserManagement = () => {
    const { allUsers, adminUpdateUserStatus, addAuditLog } = useAppContext();
    const { t } = useLanguage();
    
    // Search and Pagination states
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 10;

    const filteredUsers = useMemo(() => {
        return allUsers.filter(user => 
            user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.mobile.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [allUsers, searchTerm]);

    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const displayUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * usersPerPage;
        return filteredUsers.slice(startIndex, startIndex + usersPerPage);
    }, [filteredUsers, currentPage, usersPerPage]);


    const handleToggleStatus = (userId: string, currentStatus: boolean) => {
        adminUpdateUserStatus(userId, !currentStatus);
        // Note: adminUpdateUserStatus already adds audit log and notification.
    }
    
    // Simple CSV export
    const handleExport = () => {
        const headers = `${t('admin.userId')},${t('admin.fullName')},${t('admin.email')},${t('admin.role')},${t('admin.status')}\n`;
        const csv = allUsers.map(u => `${u.id},"${u.fullName}","${u.email}",${u.role},${u.isActive}`).join("\n");
        const blob = new Blob([headers + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", "users.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        addAuditLog('User Data Export', 'Admin exported user data to CSV.');
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                 <h2 className="text-2xl font-semibold">{t('admin.userManagement')}</h2>
                 <button onClick={handleExport} className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                    <DownloadIcon className="w-5 h-5" />
                    <span>{t('admin.exportCsv')}</span>
                 </button>
            </div>

            <div className="mb-4">
                <FormInput
                    name="searchUsers"
                    label={t('admin.searchUsers')}
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    placeholder={t('admin.searchUsersPlaceholder')}
                    type="text"
                />
            </div>

            {displayUsers.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-left table-auto min-w-max">
                        <thead>
                            <tr className="border-b bg-gray-50 text-sm text-gray-600 uppercase">
                                <th className="p-3">{t('admin.name')}</th><th className="p-3">{t('admin.email')}</th><th className="p-3">{t('admin.role')}</th><th className="p-3">{t('admin.status')}</th><th className="p-3">{t('admin.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayUsers.map(user => (
                                <tr key={user.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3">{user.fullName}{user.isOwner && <span className="text-xs text-secondary ml-2">({t('admin.owner')})</span>}</td>
                                    <td className="p-3">{user.email}</td>
                                    <td className="p-3">{user.role}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 text-xs rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {user.isActive ? t('admin.active') : t('admin.blocked')}
                                        </span >
                                    </td>
                                    <td className="p-3">
                                        <button onClick={() => handleToggleStatus(user.id, user.isActive)} className={`text-sm font-medium ${user.isActive ? 'text-red-600' : 'text-green-600'}`} disabled={user.isOwner}>
                                            {user.isActive ? t('admin.block') : t('admin.activate')}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-10 text-gray-600">
                    <p>{t('admin.noUsersFound')}</p>
                </div>
            )}

            {filteredUsers.length > usersPerPage && (
                <div className="flex justify-center mt-6 space-x-2">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                    >
                        {t('common.previous')}
                    </button>
                    {[...Array(totalPages)].map((_, index) => (
                        <button
                            key={index + 1}
                            onClick={() => setCurrentPage(index + 1)}
                            className={`px-4 py-2 rounded-lg ${currentPage === index + 1 ? 'bg-primary text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                        >
                            {index + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                    >
                        {t('common.next')}
                    </button>
                </div>
            )}
        </div>
    );
};

// --- Product Management Component ---
const ProductManagement = () => {
    const { products, adminAddProduct, adminUpdateProduct, adminDeleteProduct, formatPrice, showNotification, addAuditLog } = useAppContext();
    const { t } = useLanguage();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 10;

    const filteredProducts = useMemo(() => {
        return products.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [products, searchTerm]);

    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const displayProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * productsPerPage;
        return filteredProducts.slice(startIndex, startIndex + productsPerPage);
    }, [filteredProducts, currentPage, productsPerPage]);

    const handleAddClick = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    // FIX: Corrected the onSave prop type to handle new products which lack an 'id'.
    const handleSave = (productData: Product | Omit<Product, 'id'>) => {
        if ('id' in productData) {
            adminUpdateProduct(productData);
        } else {
            adminAddProduct(productData);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (productId: string) => {
        if (window.confirm(t('admin.confirmDeleteProduct'))) {
            adminDeleteProduct(productId);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            {isModalOpen && (
                <Modal title={editingProduct ? t('admin.editProduct') : t('admin.addNewProduct')} onClose={() => setIsModalOpen(false)}>
                    <ProductFormAdmin product={editingProduct} onSave={handleSave} onCancel={() => setIsModalOpen(false)} showNotification={showNotification} t={t} />
                </Modal>
            )}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">{t('admin.productManagement')}</h2>
                <button onClick={handleAddClick} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">
                    {t('admin.addProduct')}
                </button>
            </div>

            <div className="mb-4">
                <FormInput
                    name="searchProducts"
                    label="Search Products"
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    placeholder="Search by name or category"
                    type="text"
                />
            </div>

            {displayProducts.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-left table-auto min-w-max">
                        <thead>
                            <tr className="border-b bg-gray-50 text-sm text-gray-600 uppercase">
                                <th className="p-3">{t('admin.product')}</th>
                                <th className="p-3">{t('admin.category')}</th>
                                <th className="p-3">{t('admin.price')}</th>
                                <th className="p-3">{t('admin.stock')}</th>
                                <th className="p-3">{t('admin.status')}</th>
                                <th className="p-3">{t('admin.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayProducts.map(p => (
                                <tr key={p.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3 flex items-center space-x-3">
                                        <img src={p.imageUrl} alt={p.name} className="w-12 h-12 object-cover rounded-md" />
                                        <span>{p.name}</span>
                                    </td>
                                    <td className="p-3">{p.category}</td>
                                    <td className="p-3">{formatPrice(p.price)}</td>
                                    <td className="p-3">{p.stock} {p.unit}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 text-xs rounded-full ${p.isEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {p.isEnabled ? t('admin.active') : t('admin.blocked')}
                                        </span>
                                    </td>
                                    <td className="p-3 space-x-2 flex items-center">
                                        <button onClick={() => handleEditClick(p)} className="p-1 text-blue-600 hover:text-blue-800" title={t('admin.editProduct')}><PencilIcon className="w-5 h-5"/></button>
                                        <button onClick={() => handleDelete(p.id)} className="p-1 text-red-600 hover:text-red-800" title={t('admin.deleteProduct')}><TrashIcon className="w-5 h-5"/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-10 text-gray-600">
                    <p>No products found.</p>
                </div>
            )}

            {filteredProducts.length > productsPerPage && (
                <div className="flex justify-center mt-6 space-x-2">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                    >
                        {t('common.previous')}
                    </button>
                    {[...Array(totalPages)].map((_, index) => (
                        <button
                            key={index + 1}
                            onClick={() => setCurrentPage(index + 1)}
                            className={`px-4 py-2 rounded-lg ${currentPage === index + 1 ? 'bg-primary text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                        >
                            {index + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                    >
                        {t('common.next')}
                    </button>
                </div>
            )}
        </div>
    );
};

// Admin version of ProductForm, allows admin to set farmerId
const ProductFormAdmin = ({ product, onSave, onCancel, showNotification, t }: { product: Product | null, onSave: (p: Product | Omit<Product, 'id'>) => void, onCancel: () => void, showNotification: (msg: string, type: 'success' | 'error') => void, t: (key: string, replacements?: { [key: string]: string | number }) => string }) => {
    const [formData, setFormData] = useState<Omit<Product, 'id'>>({
        name: product?.name || '', price: product?.price || 0, description: product?.description || '', imageUrl: product?.imageUrl || '',
        category: product?.category || categories[0].name, unit: product?.unit || 'lb', stock: product?.stock || 0,
        isEnabled: product?.isEnabled ?? true,
        farmerId: product?.farmerId || '', // Admin needs to set farmerId
    });
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const { farmersList } = useAppContext(); // Get farmers list for assignment

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
        if (!formData.farmerId) {
            showNotification("Please select a farmer for the product.", "error");
            return;
        }
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
            {/* Admin can assign product to a farmer */}
            <div>
                <label htmlFor="farmerId" className="block text-sm font-medium text-gray-700">Assign to Farmer</label>
                <select id="farmerId" name="farmerId" value={formData.farmerId} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="">Select a Farmer</option>
                    {farmersList.map(f => <option key={f.id} value={f.id}>{f.fullName}</option>)}
                </select>
            </div>
            <div className="flex items-center space-x-2">
                <input
                    type="checkbox"
                    id="isEnabled"
                    name="isEnabled"
                    checked={formData.isEnabled}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary rounded"
                />
                <label htmlFor="isEnabled" className="text-sm font-medium text-gray-700">{t('admin.productEnabled')}</label>
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">{t('admin.cancel')}</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">{t('admin.saveProduct')}</button>
            </div>
        </form>
    );
};


// --- Admin Orders Component ---
const AdminOrders = () => {
    // FIX: Use `allOrders` from useAppContext
    const { allOrders, allUsers, formatPrice } = useAppContext();
    const { t } = useLanguage();

    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 10;
    const totalPages = Math.ceil(allOrders.length / ordersPerPage);
    const displayOrders = useMemo(() => {
        const startIndex = (currentPage - 1) * ordersPerPage;
        return allOrders.slice(startIndex, startIndex + ordersPerPage);
    }, [allOrders, currentPage, ordersPerPage]);

    const getCustomerName = (customerId: string) => allUsers.find(u => u.id === customerId)?.fullName || 'N/A';
    const getFarmerName = (farmerId: string) => allUsers.find(u => u.id === farmerId)?.fullName || 'N/A';

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">{t('admin.orderManagement')}</h2>
            {allOrders.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-left table-auto min-w-max">
                        <thead>
                            <tr className="border-b bg-gray-50 text-sm text-gray-600 uppercase">
                                <th className="p-3">{t('admin.orderId')}</th>
                                <th className="p-3">{t('admin.customer')}</th>
                                <th className="p-3">{t('admin.farmer')}</th>
                                <th className="p-3">{t('admin.date')}</th>
                                <th className="p-3">{t('admin.total')}</th>
                                <th className="p-3">{t('admin.status')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayOrders.map(order => (
                                <tr key={order.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3 font-mono text-sm">#{order.id.substring(3, 9)}</td>
                                    <td className="p-3">{getCustomerName(order.customerId)}</td>
                                    <td className="p-3">{getFarmerName(order.farmerId)}</td>
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
            ) : <p>{t('admin.noOrdersFound')}</p>}

            {allOrders.length > ordersPerPage && (
                <div className="flex justify-center mt-6 space-x-2">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                    >
                        {t('common.previous')}
                    </button>
                    {[...Array(totalPages)].map((_, index) => (
                        <button
                            key={index + 1}
                            onClick={() => setCurrentPage(index + 1)}
                            className={`px-4 py-2 rounded-lg ${currentPage === index + 1 ? 'bg-primary text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                        >
                            {index + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                    >
                        {t('common.next')}
                    </button>
                </div>
            )}
        </div>
    );
};

// --- Admin Payments Component ---
// Define interface for payment summary data
interface PaymentSummaryData {
    summary: { [key: string]: number };
    totalRevenue: number;
}

const AdminPayments = () => {
    // FIX: Use `allOrders` from useAppContext
    const { allOrders, formatPrice } = useAppContext();
    const { t } = useLanguage();

    // FIX: Explicitly type the return of useMemo with PaymentSummaryData
    const paymentSummary = useMemo((): PaymentSummaryData => {
        const summary: { [key: string]: number } = {};
        let totalRevenue = 0;

        allOrders.forEach(order => {
            const method = order.paymentMethod || 'Unknown';
            // FIX: Ensure `summary[method]` is treated as a number for addition
            summary[method] = (summary[method] || 0) + order.total;
            totalRevenue += order.total;
        });

        return { summary, totalRevenue };
    }, [allOrders]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">{t('admin.paymentOverview')}</h2>
            {allOrders.length > 0 ? (
                <div className="space-y-6">
                    <div>
                        <h3 className="text-xl font-semibold mb-3">{t('admin.revenueByPaymentMethod')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* FIX: Explicitly type `total` in map callback to ensure correct type inference */}
                            {Object.entries(paymentSummary.summary).map(([method, total]: [string, number]) => (
                                <div key={method} className="flex justify-between items-center p-4 bg-light-green rounded-lg">
                                    <span className="font-medium text-gray-700">{method}</span>
                                    {/* FIX: Remove unnecessary 'as number' cast as 'total' is already typed */}
                                    <span className="font-bold text-primary">{formatPrice(total)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between items-center p-4 mt-4 bg-gray-50 rounded-lg border-t-2 border-primary">
                            <span className="text-xl font-bold">{t('admin.totalRevenue')}</span>
                            <span className="text-2xl font-extrabold text-primary">{formatPrice(paymentSummary.totalRevenue)}</span>
                        </div>
                    </div>

                    <h3 className="text-xl font-semibold mb-3">{t('admin.recentPayments')}</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left table-auto min-w-max">
                            <thead>
                                <tr className="border-b bg-gray-50 text-sm text-gray-600 uppercase">
                                    <th className="p-3">{t('admin.orderId')}</th>
                                    <th className="p-3">{t('admin.date')}</th>
                                    <th className="p-3">{t('admin.paymentMethod')}</th>
                                    <th className="p-3">{t('admin.totalAmount')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allOrders.slice(0, 5).map(order => ( // Show recent 5 payments
                                    <tr key={order.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3 font-mono text-sm">#{order.id.substring(3, 9)}</td>
                                        <td className="p-3">{new Date(order.date).toLocaleDateString()}</td>
                                        <td className="p-3">{order.paymentMethod}</td>
                                        <td className="p-3">{formatPrice(order.total)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {allOrders.length > 5 && (
                        <div className="text-center mt-4">
                            <button onClick={() => {/* navigate to full payments report or expand */}} className="text-primary hover:underline">View All Payments</button>
                        </div>
                    )}
                </div>
            ) : <p>{t('admin.noPaymentsRecorded')}</p>}
        </div>
    );
};

// --- Admin Disputes Component (Placeholder) ---
const AdminDisputes = () => {
    const { t } = useLanguage();
    return (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h2 className="text-2xl font-semibold mb-4">{t('admin.disputeManagement')}</h2>
            <AlertTriangleIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">{t('admin.disputesComingSoon')}</p>
            <p className="text-sm text-gray-500">{t('admin.disputesFutureScope')}</p>
        </div>
    );
};

// --- Admin Price Monitoring Component ---
const AdminPriceMonitoring = () => {
    const { products, adminUpdateProduct, formatPrice, showNotification, addAuditLog } = useAppContext();
    const { t } = useLanguage();
    const [priceSuggestions, setPriceSuggestions] = useState<PriceSuggestion[]>([]);
    const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);

    const handleGenerateSuggestions = async () => {
        setIsGeneratingSuggestions(true);
        setPriceSuggestions([]);
        try {
            const suggestions = await getPriceSuggestions(products);
            setPriceSuggestions(suggestions);
            showNotification(t('admin.suggestionsGeneratedSuccess'), 'success');
            addAuditLog('AI Price Suggestion', 'Generated AI price suggestions for all products.');
        } catch (error) {
            console.error("Error generating price suggestions for admin:", error);
            showNotification(t('dashboard.failedToGetAiSuggestion'), 'error');
        } finally {
            setIsGeneratingSuggestions(false);
        }
    };

    const handleApplySuggestion = (productId: string, suggestedPrice: number) => {
        const productToUpdate = products.find(p => p.id === productId);
        if (productToUpdate) {
            const updatedProduct = { ...productToUpdate, price: suggestedPrice };
            adminUpdateProduct(updatedProduct);
            setPriceSuggestions(prev => prev.filter(s => s.productId !== productId)); // Remove applied suggestion
            showNotification(`Applied new price for ${productToUpdate.name}: ${formatPrice(suggestedPrice)}`, 'success');
            addAuditLog('Price Update', `Admin applied AI suggested price for ${productToUpdate.name} to ${formatPrice(suggestedPrice)}.`);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">{t('admin.priceMonitoring')}</h2>
                <button
                    onClick={handleGenerateSuggestions}
                    disabled={isGeneratingSuggestions}
                    className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-400 flex items-center space-x-2"
                >
                    <SparklesIcon className="w-5 h-5" />
                    <span>{isGeneratingSuggestions ? t('common.generating') : t('admin.getAiPriceSuggestions')}</span>
                </button>
            </div>

            {priceSuggestions.length > 0 ? (
                <div className="overflow-x-auto mt-6">
                    <table className="w-full text-left table-auto min-w-max">
                        <thead>
                            <tr className="border-b bg-gray-50 text-sm text-gray-600 uppercase">
                                <th className="p-3">{t('admin.product')}</th>
                                <th className="p-3">{t('dashboard.currentPrice')}</th>
                                <th className="p-3">{t('dashboard.suggestedPrice')}</th>
                                <th className="p-3">{t('dashboard.reason')}</th>
                                <th className="p-3">{t('admin.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {priceSuggestions.map(suggestion => {
                                const product = products.find(p => p.id === suggestion.productId);
                                if (!product) return null;
                                return (
                                    <tr key={suggestion.productId} className="border-b hover:bg-gray-50">
                                        <td className="p-3">{product.name}</td>
                                        <td className="p-3">{formatPrice(product.price)}</td>
                                        <td className="p-3 font-semibold text-primary">{formatPrice(suggestion.suggestedPrice)}</td>
                                        <td className="p-3 text-sm text-gray-700 max-w-xs">{suggestion.reason}</td>
                                        <td className="p-3">
                                            <button
                                                onClick={() => handleApplySuggestion(product.id, suggestion.suggestedPrice)}
                                                className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600"
                                            >
                                                Apply
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-10 text-gray-600">
                    <p>{t('admin.noPriceSuggestions')}</p>
                    <p className="mt-2 text-sm">{t('admin.clickButtonToGenerate')}</p>
                </div>
            )}
        </div>
    );
};

// --- Admin Analytics Component ---
const AdminAnalytics = () => {
    const { allOrders, products, allUsers, formatPrice } = useAppContext();
    const { t } = useLanguage();

    // Calculate Total Sales Revenue, Total Orders, Total Products
    const totalSalesRevenue = useMemo(() => allOrders.reduce((sum, order) => sum + order.total, 0), [allOrders]);
    const totalOrders = allOrders.length;
    const totalProducts = products.length;

    // Calculate Sales by Category
    const salesByCategory = useMemo(() => {
        const categorySales: { [key: string]: number } = {};
        allOrders.forEach(order => {
            order.items.forEach(item => {
                categorySales[item.product.category] = (categorySales[item.product.category] || 0) + (item.product.price * item.quantity);
            });
            return categorySales;
        });
        return Object.entries(categorySales).sort(([, a], [, b]) => b - a);
    }, [allOrders]);

    // Calculate Farmer Performance (Top Sellers)
    const farmerPerformance = useMemo(() => {
        const farmerSales: { [key: string]: { farmerName: string, totalSales: number } } = {};
        allOrders.forEach(order => {
            const farmer = allUsers.find(u => u.id === order.farmerId);
            if (farmer) {
                farmerSales[farmer.id] = farmerSales[farmer.id] || { farmerName: farmer.fullName, totalSales: 0 };
                farmerSales[farmer.id].totalSales += order.total;
            }
        });
        return Object.values(farmerSales).sort((a, b) => b.totalSales - a.totalSales);
    }, [allOrders, allUsers]);


    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-6">{t('admin.analyticsPanel')}</h2>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 p-6 rounded-lg shadow-sm">
                    <p className="text-sm font-medium text-blue-700">{t('admin.totalSalesRevenue')}</p>
                    <p className="text-3xl font-bold text-blue-900 mt-1">{formatPrice(totalSalesRevenue)}</p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg shadow-sm">
                    <p className="text-sm font-medium text-green-700">{t('admin.totalOrders')}</p>
                    <p className="text-3xl font-bold text-green-900 mt-1">{totalOrders}</p>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg shadow-sm">
                    <p className="text-sm font-medium text-purple-700">{t('admin.totalProducts')}</p>
                    <p className="text-3xl font-bold text-purple-900 mt-1">{totalProducts}</p>
                </div>
            </div>

            {/* Sales by Category */}
            <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">{t('admin.salesByCategory')}</h3>
                {salesByCategory.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {salesByCategory.map(([category, sales]) => (
                            <div key={category} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                <span className="font-medium">{category}</span>
                                <span className="font-bold">{formatPrice(sales)}</span>
                            </div>
                        ))}
                    </div>
                ) : <p>No sales data by category yet.</p>}
            </div>

            {/* Farmer Performance */}
            <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">{t('admin.farmerPerformance')}</h3>
                {farmerPerformance.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left table-auto min-w-max">
                            <thead>
                                <tr className="border-b bg-gray-50 text-sm text-gray-600 uppercase">
                                    <th className="p-3">Farmer</th>
                                    <th className="p-3">Total Sales</th>
                                </tr>
                            </thead>
                            <tbody>
                                {farmerPerformance.map((farmer, index) => (
                                    <tr key={index} className="border-b hover:bg-gray-50">
                                        <td className="p-3">{farmer.farmerName}</td>
                                        <td className="p-3">{formatPrice(farmer.totalSales)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : <p>{t('admin.noFarmerPerformanceData')}</p>}
            </div>

            {/* Demand Heatmap (Placeholder) */}
            <div>
                <h3 className="text-xl font-semibold mb-4">{t('admin.demandHeatmap')}</h3>
                <div className="bg-gray-50 p-6 rounded-lg shadow-sm text-center">
                    <ChartPieIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">{t('admin.demandHeatmapComingSoon')}</p>
                    <p className="text-sm text-gray-500">{t('admin.demandHeatmapFutureScope')}</p>
                </div>
            </div>
        </div>
    );
};

// --- System Audit Log Component ---
const AuditLog = () => {
    const { auditLogs } = useAppContext();
    const { t } = useLanguage();

    const [currentPage, setCurrentPage] = useState(1);
    const logsPerPage = 10;
    const totalPages = Math.ceil(auditLogs.length / logsPerPage);
    const displayLogs = useMemo(() => {
        const startIndex = (currentPage - 1) * logsPerPage;
        return auditLogs.slice(startIndex, startIndex + logsPerPage);
    }, [auditLogs, currentPage, logsPerPage]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">{t('admin.systemAuditLog')}</h2>
            {auditLogs.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-left table-auto min-w-max">
                        <thead>
                            <tr className="border-b bg-gray-50 text-sm text-gray-600 uppercase">
                                <th className="p-3">{t('admin.timestamp')}</th>
                                <th className="p-3">{t('admin.user')}</th>
                                <th className="p-3">{t('admin.action')}</th>
                                <th className="p-3">{t('admin.details')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayLogs.map(log => (
                                <tr key={log.id} className="border-b hover:bg-gray-50 text-sm">
                                    <td className="p-3">{new Date(log.timestamp).toLocaleString()}</td>
                                    <td className="p-3">{log.userName} ({log.userId})</td>
                                    <td className="p-3">{log.action}</td>
                                    <td className="p-3">{log.details}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : <p>No audit logs found.</p>}

            {auditLogs.length > logsPerPage && (
                <div className="flex justify-center mt-6 space-x-2">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                    >
                        {t('common.previous')}
                    </button>
                    {[...Array(totalPages)].map((_, index) => (
                        <button
                            key={index + 1}
                            onClick={() => setCurrentPage(index + 1)}
                            className={`px-4 py-2 rounded-lg ${currentPage === index + 1 ? 'bg-primary text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                        >
                            {index + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                    >
                        {t('common.next')}
                    </button>
                </div>
            )}
        </div>
    );
};
