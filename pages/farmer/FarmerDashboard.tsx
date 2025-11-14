import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Analytics from './Analytics';
import ProductsManagement from './ProductsManagement';
import OrdersManagement from './OrdersManagement';
import UsersManagement from './UsersManagement';
import { ChartBarIcon, CollectionIcon, ClipboardListIcon, CogIcon, LogoutIcon, MenuIcon, XIcon, UsersIcon } from '../../components/icons';

const FarmerDashboard: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('analytics');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, logout } = useAuth();

  const renderPage = () => {
    switch (currentPage) {
      case 'analytics':
        return <Analytics />;
      case 'products':
        return <ProductsManagement />;
      case 'orders':
        return <OrdersManagement />;
      case 'users':
        return <UsersManagement />;
      default:
        return <Analytics />;
    }
  };

  const navItems = [
    { name: 'Analytics', page: 'analytics', icon: ChartBarIcon },
    { name: 'Products', page: 'products', icon: CollectionIcon },
    { name: 'Orders', page: 'orders', icon: ClipboardListIcon },
    { name: 'Users', page: 'users', icon: UsersIcon },
  ];

  const NavLink: React.FC<{ name: string; page: string; icon: React.FC<{className?:string}>; }> = ({ name, page, icon: Icon }) => (
    <button
      onClick={() => {setCurrentPage(page); setSidebarOpen(false);}}
      className={`w-full flex items-center px-4 py-2 my-1 rounded-lg transition-colors ${
        currentPage === page
          ? 'bg-green-700 text-white'
          : 'text-gray-300 hover:bg-green-800 hover:text-white'
      }`}
    >
        <Icon className="h-6 w-6 mr-3"/>
        <span className="font-medium">{name}</span>
    </button>
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
        <div className="p-4 border-b border-green-800">
            <h1 className="text-2xl font-bold text-white">Harvest<span className="text-lime-400">Hub</span></h1>
            <p className="text-sm text-green-200 mt-1">Farmer Dashboard</p>
        </div>
        <nav className="flex-1 p-4">
            {navItems.map(item => <NavLink key={item.name} {...item} />)}
        </nav>
        <div className="p-4 border-t border-green-800">
            <div className="flex items-center mb-4">
                <CogIcon className="h-10 w-10 text-green-300 bg-green-700 p-2 rounded-full"/>
                <div className="ml-3">
                    <p className="font-semibold text-white">{currentUser?.name}</p>
                    <p className="text-sm text-green-300">{currentUser?.email}</p>
                </div>
            </div>
            <button
                onClick={logout}
                className="w-full flex items-center justify-center px-4 py-2 rounded-lg bg-green-700 text-green-200 hover:bg-red-600 hover:text-white transition-colors"
            >
                <LogoutIcon className="h-5 w-5 mr-2"/>
                Logout
            </button>
        </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar for large screens */}
      <aside className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64 bg-green-900 text-white">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile Sidebar */}
       <div className={`fixed inset-0 z-50 flex transition-transform duration-300 ease-in-out lg:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="relative flex-1 flex flex-col w-64 max-w-xs bg-green-900 text-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                >
                    <XIcon className="h-6 w-6 text-white" />
                </button>
            </div>
            <SidebarContent />
          </div>
          <div className="flex-shrink-0 w-14" onClick={() => setSidebarOpen(false)}></div>
       </div>

      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="py-6">
             <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-gray-900 capitalize">{currentPage}</h1>
                <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-gray-500 rounded-md hover:bg-gray-200">
                    <MenuIcon className="h-6 w-6" />
                </button>
             </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-4">
              {renderPage()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FarmerDashboard;