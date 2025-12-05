
import React from 'react';
import { useAppContext } from '../context/AppContext';

interface OrderSummaryProps {
  children?: React.ReactNode; // To allow adding a button
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ children }) => {
  const { cartTotal, cartCount, formatPrice } = useAppContext();
  const shippingCost = cartTotal > 0 ? 5.00 : 0;
  const total = cartTotal + shippingCost;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-28 h-fit">
      <h2 className="text-2xl font-bold mb-6 border-b pb-4">Order Summary</h2>
      <div className="space-y-3">
        <div className="flex justify-between text-gray-600">
            <span>Subtotal ({cartCount} items)</span>
            <span>{formatPrice(cartTotal)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
            <span>Shipping</span>
            <span>{formatPrice(shippingCost)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold pt-4 border-t">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
        </div>
      </div>
      {children && <div className="mt-8">{children}</div>}
    </div>
  );
};

export default OrderSummary;