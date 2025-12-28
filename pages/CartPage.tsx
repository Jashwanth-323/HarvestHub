
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { PlusIcon, MinusIcon, TrashIcon, AlertTriangleIcon } from '../components/icons';
import BackToHomeButton from '../components/BackToHomeButton';
import OrderSummary from '../components/OrderSummary';
import { useLanguage } from '../context/LanguageContext';

const CartPage: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, user, products } = useAppContext();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const handleCheckout = () => {
    // Check if any item has insufficient stock before navigation
    for (const item of cart) {
      const p = products.find(prod => prod.id === item.product.id);
      if (!p || p.stock < item.quantity) {
        return; // AppContext will show notification on actual attempt if needed
      }
    }

    if (!user) {
        navigate('/auth', { state: { from: '/cart' } });
    } else {
        navigate('/checkout');
    }
  };

  const hasStockError = cart.some(item => {
    const p = products.find(prod => prod.id === item.product.id);
    return !p || p.stock < item.quantity;
  });


  if (cart.length === 0) {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <BackToHomeButton />
            <h1 className="text-4xl font-extrabold text-gray-800 mb-4">Your Cart is Empty</h1>
            <p className="text-lg text-gray-600 mb-8">Looks like you haven't added anything to your cart yet.</p>
            <Link to="/shop?view=all" className="bg-primary text-white font-bold px-6 py-3 rounded-full hover:bg-primary-dark transition-colors">
                Start Shopping
            </Link>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <BackToHomeButton />
      <h1 className="text-4xl font-extrabold text-gray-800 mb-8">Your Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
            <div className="space-y-4">
              {cart.map(item => {
                const liveProduct = products.find(p => p.id === item.product.id);
                return (
                  <CartItemRow 
                      key={item.product.id} 
                      item={item} 
                      liveProduct={liveProduct}
                      updateQuantity={updateQuantity} 
                      removeFromCart={removeFromCart} 
                      t={t}
                  />
                );
              })}
            </div>
        </div>
        
        <div className="lg:col-span-1">
            <OrderSummary>
                {hasStockError && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-start gap-2 border border-red-200">
                    <AlertTriangleIcon className="w-5 h-5 shrink-0" />
                    <span>Please adjust quantities to match available stock before proceeding.</span>
                  </div>
                )}
                <button 
                  onClick={handleCheckout}
                  disabled={hasStockError}
                  className={`w-full font-bold text-lg py-3 rounded-full transition-transform transform hover:scale-105 duration-300 shadow-lg ${hasStockError ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary text-white hover:bg-primary-dark'}`}
                >
                  {user ? 'Proceed to Checkout' : 'Login to Checkout'}
                </button>
            </OrderSummary>
        </div>
      </div>
    </div>
  );
};


const CartItemRow = ({ item, liveProduct, updateQuantity, removeFromCart, t }: any) => {
    const { formatPrice } = useAppContext();
    const isInsufficient = liveProduct && liveProduct.stock < item.quantity;

    return (
        <div className={`flex flex-col sm:flex-row items-center justify-between border-b pb-4 last:border-b-0 ${isInsufficient ? 'bg-red-50 p-4 rounded-xl -mx-4' : ''}`}>
            <div className="flex items-center space-x-4 mb-4 sm:mb-0 w-full sm:w-auto">
                <img src={item.product.imageUrl} alt={item.product.name} className="w-24 h-24 object-cover rounded-lg" />
                <div>
                    <h3 className="text-lg font-semibold">{item.product.name}</h3>
                    <p className="text-gray-500">{formatPrice(item.product.price)} / {item.product.unit}</p>
                    {isInsufficient && (
                        <p className="text-red-600 font-bold text-sm mt-1 flex items-center gap-1">
                            <AlertTriangleIcon className="w-4 h-4" />
                            {liveProduct.stock === 0 ? t('dashboard.outOfStock') : t('dashboard.onlyAvailable', { count: liveProduct.stock, unit: liveProduct.unit })}
                        </p>
                    )}
                </div>
            </div>
            <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center border border-gray-300 rounded-full p-1 bg-white">
                    <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="p-1 rounded-full hover:bg-gray-100"><MinusIcon className="w-5 h-5" /></button>
                    <span className="px-4 text-lg font-medium">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)} 
                      disabled={liveProduct && item.quantity >= liveProduct.stock}
                      className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-30"
                    >
                      <PlusIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex items-center space-x-4">
                  <p className="text-lg font-semibold w-24 text-right">{formatPrice(item.product.price * item.quantity)}</p>
                  <button onClick={() => removeFromCart(item.product.id)} className="text-red-500 hover:text-red-700 p-2">
                      <TrashIcon className="w-6 h-6" />
                  </button>
                </div>
            </div>
        </div>
    )
}

export default CartPage;
