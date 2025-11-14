
import React, { useState } from 'react';
import { useCart } from '../../contexts/CartContext';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { TrashIcon, CheckCircleIcon } from '../../components/icons';

const CartPage: React.FC = () => {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const { placeOrder } = useData();
  const { currentUser } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const handleCheckout = () => {
      if (!currentUser) return;
      setIsCheckingOut(true);
      
      const orderData = {
          customerId: currentUser.id,
          items: cartItems,
          total: cartTotal,
      };

      setTimeout(() => {
          placeOrder(orderData);
          clearCart();
          setIsCheckingOut(false);
          setOrderPlaced(true);
      }, 1500);
  }

  if (orderPlaced) {
      return (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
              <CheckCircleIcon className="h-24 w-24 text-green-500 mx-auto mb-4" />
              <h1 className="text-4xl font-extrabold text-gray-900">Thank You for Your Order!</h1>
              <p className="mt-4 text-lg text-gray-600">Your farm-fresh goodies are on their way. You can track your order in the "My Orders" section.</p>
          </div>
      );
  }

  return (
    <div className="bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">Shopping Cart</h1>

        <div className="mt-12">
          {cartItems.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-lg">
                <h2 className="text-2xl font-semibold text-gray-700">Your cart is empty</h2>
                <p className="text-gray-500 mt-2">Looks like you haven't added any fresh produce yet!</p>
            </div>
          ) : (
            <section>
              <ul role="list" className="border-t border-b border-gray-200 divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <li key={item.id} className="flex py-6">
                    <div className="flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-24 h-24 rounded-md object-cover sm:w-32 sm:h-32"/>
                    </div>
                    <div className="ml-4 flex-1 flex flex-col sm:ml-6">
                      <div>
                        <div className="flex justify-between">
                          <h4 className="text-sm">
                            <a href="#" className="font-medium text-gray-700 hover:text-gray-800">{item.name}</a>
                          </h4>
                          <p className="ml-4 text-sm font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">${item.price.toFixed(2)} / {item.unit}</p>
                      </div>
                      <div className="mt-4 flex-1 flex items-end justify-between">
                        <div className="flex items-center border border-gray-300 rounded">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 py-1 text-gray-600">-</button>
                            <span className="w-10 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 py-1 text-gray-600">+</button>
                        </div>
                        <div className="ml-4">
                          <button type="button" onClick={() => removeFromCart(item.id)} className="text-sm font-medium text-red-600 hover:text-red-500 flex items-center">
                            <TrashIcon className="h-4 w-4 mr-1"/>
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Order summary */}
              <div className="mt-10 sm:ml-32 sm:pl-6">
                <div className="bg-gray-50 rounded-lg px-4 py-6 sm:p-6 lg:p-8">
                  <h2 className="text-xl font-medium text-gray-900">Order summary</h2>
                  <div className="flow-root mt-6">
                    <dl className="-my-4 text-sm divide-y divide-gray-200">
                      <div className="py-4 flex items-center justify-between">
                        <dt className="text-gray-600">Subtotal</dt>
                        <dd className="font-medium text-gray-900">${cartTotal.toFixed(2)}</dd>
                      </div>
                       <div className="py-4 flex items-center justify-between">
                        <dt className="text-gray-600">Shipping</dt>
                        <dd className="font-medium text-gray-900">$5.00</dd>
                      </div>
                      <div className="py-4 flex items-center justify-between">
                        <dt className="text-base font-medium text-gray-900">Order total</dt>
                        <dd className="text-base font-medium text-gray-900">${(cartTotal + 5).toFixed(2)}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
                <div className="mt-10">
                  <button
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className="w-full bg-green-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-green-500 disabled:bg-gray-400"
                  >
                    {isCheckingOut ? 'Processing...' : 'Checkout'}
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartPage;
