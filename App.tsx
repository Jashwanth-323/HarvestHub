
import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { CartProvider } from './contexts/CartContext';
import AuthPage from './pages/AuthPage';
import CustomerView from './pages/customer/CustomerView';
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import { UserRole } from './types';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <CartProvider>
          <div className="bg-[#FAF9F7] min-h-screen font-sans text-gray-800">
            <AppContent />
          </div>
        </CartProvider>
      </DataProvider>
    </AuthProvider>
  );
};

const AppContent: React.FC = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <AuthPage />;
  }

  if (currentUser.role === UserRole.CUSTOMER) {
    return <CustomerView />;
  }

  if (currentUser.role === UserRole.FARMER) {
    return <FarmerDashboard />;
  }

  return <div>Error: Unknown user role.</div>;
};

export default App;
