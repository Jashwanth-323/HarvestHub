
import React from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from '../context/AppContext';
import { LanguageProvider } from '../context/LanguageContext';
import { ThemeProvider } from '../context/ThemeContext'; // Import ThemeProvider
import Header from './Header';
import CopyrightBar from './CopyrightBar';
import HomePage from '../pages/HomePage';
import ProductsPage from '../pages/ProductsPage';
import ProductDetailPage from '../pages/ProductDetailPage';
import CartPage from '../pages/CartPage';
import AboutPage from '../pages/AboutPage';
import ContactPage from '../pages/ContactPage';
import Notification from './Notification';
import FindFarmsPage from '../pages/FindFarmsPage';
import AuthPage from '../pages/AuthPage';
import DashboardPage from '../pages/DashboardPage';
// FIX: AdminPage is a named export, not a default export.
import { AdminPage } from '../pages/AdminPage';
import FarmerRegistrationPage from '../pages/FarmerRegistrationPage';
import CheckoutPage from '../pages/CheckoutPage';
import FarmDetailPage from '../pages/FarmDetailPage'; // Import FarmDetailPage

const App: React.FC = () => {
  return (
    <LanguageProvider> {/* LanguageProvider must wrap AppProvider */}
      <AppProvider>
        <ThemeProvider> {/* Wrap with ThemeProvider */}
          <HashRouter>
            <MainContent />
          </HashRouter>
        </ThemeProvider>
      </AppProvider>
    </LanguageProvider>
  );
};

const MainContent: React.FC = () => {
  const location = useLocation();
  // These pages have their own full-screen layouts and do not need the main header.
  const isFullScreenPage = ['/auth', '/dashboard', '/admin', '/farmer-register'].includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen font-sans text-gray-800 dark:text-gray-100">
      <Notification />
      {!isFullScreenPage && <Header />}
      
      <main className="flex-grow">
       <div className={isFullScreenPage ? '' : 'max-w-screen-xl mx-auto'}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ProductsPage />} />
          <Route path="/products/:productId" element={<ProductDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/find-farms" element={<FindFarmsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/farmer-register" element={<FarmerRegistrationPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/farms/:farmerId" element={<FarmDetailPage />} />
        </Routes>
        </div>
      </main>

      {!isFullScreenPage && <CopyrightBar />}
    </div>
  );
};

export default App;
