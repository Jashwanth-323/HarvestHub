import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { PlusIcon, MinusIcon, TrashIcon } from '../components/icons';
import BackToHomeButton from '../components/BackToHomeButton';
import OrderSummary from '../components/OrderSummary';

const CartPage: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, user } = useAppContext();
  const navigate = useNavigate();
  
  const handleCheckout = () => {
    if (!user) {
        navigate('/auth', { state: { from: '/cart' } });
    } else {
        navigate('/checkout');
    }
  };


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
              {cart.map(item => (
                <CartItemRow 
                    key={item.product.id} 
                    item={item} 
                    updateQuantity={updateQuantity} 
                    removeFromCart={removeFromCart} 
                />
              ))}
            </div>
        </div>
        
        <div className="lg:col-span-1">
            <OrderSummary>
                <button 
                  onClick={handleCheckout}
                  className="w-full bg-primary text-white font-bold text-lg py-3 rounded-full hover:bg-primary-dark transition-transform transform hover:scale-105 duration-300 shadow-lg"
                >
                  {user ? 'Proceed to Checkout' : 'Login to Checkout'}
                </button>
            </OrderSummary>
        </div>
      </div>
    </div>
  );
};


const CartItemRow = ({ item, updateQuantity, removeFromCart }: any) => {
    const { formatPrice } = useAppContext();
    return (
        <div className="flex flex-col sm:flex-row items-center justify-between border-b pb-4 last:border-b-0">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
            <img src={item.product.imageUrl} alt={item.product.name} className="w-24 h-24 object-cover rounded-lg" />
            <div>
                <h3 className="text-lg font-semibold">{item.product.name}</h3>
                <p className="text-gray-500">{formatPrice(item.product.price)} / {item.product.unit}</p>
            </div>
            </div>
            <div className="flex items-center space-x-4">
            <div className="flex items-center border border-gray-300 rounded-full p-1">
                <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="p-1 rounded-full hover:bg-gray-100"><MinusIcon className="w-5 h-5" /></button>
                <span className="px-4 text-lg font-medium">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="p-1 rounded-full hover:bg-gray-100"><PlusIcon className="w-5 h-5" /></button>
            </div>
            <p className="text-lg font-semibold w-24 text-right">{formatPrice(item.product.price * item.quantity)}</p>
            <button onClick={() => removeFromCart(item.product.id)} className="text-red-500 hover:text-red-700 p-2">
                <TrashIcon className="w-6 h-6" />
            </button>
            </div>
        </div>
    )
}

export default CartPage;