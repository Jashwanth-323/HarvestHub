
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { ShoppingCartIcon, UserIcon, LogoutIcon, MenuIcon, XIcon } from './icons';

interface HeaderProps {
    onNavigate: (page: string) => void;
    currentPage: string;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage }) => {
  const { currentUser, logout } = useAuth();
  const { itemCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: 'Home', page: 'home' },
    { name: 'Shop', page: 'products' },
    { name: 'My Orders', page: 'orders' },
  ];

  const NavLink: React.FC<{ name: string; page: string; }> = ({ name, page }) => (
    <button
      onClick={() => { onNavigate(page); setIsMenuOpen(false); }}
      className={`px-3 py-2 rounded-md text-base font-medium transition-colors duration-300 ${
        currentPage === page
          ? 'text-green-800'
          : 'text-gray-600 hover:text-green-700'
      }`}
    >
        {name}
    </button>
  );

  return (
    <header className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <button onClick={() => onNavigate('home')} className="flex items-center space-x-2">
               <svg className="h-8 w-8 text-green-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM5.05 5.05a.75.75 0 011.06 0l1.062 1.06a.75.75 0 01-1.06 1.06L5.05 6.11a.75.75 0 010-1.06zM2 10a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5A.75.75 0 012 10zm3.05 4.95a.75.75 0 010 1.06l-1.06 1.062a.75.75 0 01-1.06-1.06L4.95 13.89a.75.75 0 011.06 0zm9.9 0a.75.75 0 011.06 0l1.06 1.06a.75.75 0 01-1.06 1.06l-1.06-1.062a.75.75 0 010-1.06zM18 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 0118 10zm-3.05-4.95a.75.75 0 010-1.06l1.06-1.06a.75.75 0 011.06 1.06l-1.06 1.062a.75.75 0 01-1.06 0zM10 6a4 4 0 100 8 4 4 0 000-8z" clipRule="evenodd"></path></svg>
              <span className="text-2xl font-bold text-green-800">HarvestHub</span>
            </button>
          </div>

          {/* Centered Navigation */}
          <div className="hidden md:flex justify-center flex-1">
            <div className="flex items-baseline space-x-8">
              {navItems.map(item => <NavLink key={item.name} {...item} />)}
            </div>
          </div>
          
          {/* Right side icons */}
          <div className="hidden md:flex items-center space-x-4">
            <button onClick={() => onNavigate('cart')} className="relative p-2 rounded-lg bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
              <ShoppingCartIcon className="h-6 w-6" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 inline-flex items-center justify-center h-5 w-5 text-xs font-bold text-white bg-red-500 rounded-full">{itemCount}</span>
              )}
            </button>
             <button onClick={logout} title="Logout" className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                <LogoutIcon className="h-6 w-6" />
              </button>
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex md:hidden">
            <button onClick={() => onNavigate('cart')} className="relative p-2 rounded-md text-gray-500 hover:text-green-600">
                <ShoppingCartIcon className="h-6 w-6" />
                {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">{itemCount}</span>
                )}
            </button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-green-600 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500">
              {isMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Menu Panel */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
             {navItems.map(item => <NavLink key={item.name} {...item} />)}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-5">
                <UserIcon className="h-8 w-8 text-gray-500" />
                <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">{currentUser?.name}</div>
                    <div className="text-sm font-medium text-gray-500">{currentUser?.email}</div>
                </div>
            </div>
            <div className="mt-3 px-2 space-y-1">
              <button onClick={logout} className="w-full text-left flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-green-50 hover:text-green-700">
                <LogoutIcon className="h-6 w-6 mr-2" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
