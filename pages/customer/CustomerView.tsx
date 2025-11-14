
import React, { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import HomePage from './HomePage';
import ProductsPage from './ProductsPage';
import CartPage from './CartPage';
import OrdersPage from './OrdersPage';

const CustomerView: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} />;
      case 'products':
        return <ProductsPage />;
      case 'cart':
        return <CartPage />;
      case 'orders':
        return <OrdersPage />;
      default:
        return <HomePage onNavigate={setCurrentPage}/>;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header onNavigate={setCurrentPage} currentPage={currentPage} />
      <main className="flex-grow">
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
};

export default CustomerView;
