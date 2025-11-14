
import React from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { OrderStatus } from '../../types';

const OrdersPage: React.FC = () => {
  const { orders } = useData();
  const { currentUser } = useAuth();

  const customerOrders = orders.filter(o => o.customerId === currentUser?.id).sort((a,b) => b.date.getTime() - a.date.getTime());

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.DELIVERED:
        return 'bg-green-100 text-green-800';
      case OrderStatus.SHIPPED:
        return 'bg-blue-100 text-blue-800';
      case OrderStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case OrderStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">My Orders</h1>
      {customerOrders.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-lg">
          <h2 className="text-2xl font-semibold text-gray-700">No Orders Yet</h2>
          <p className="text-gray-500 mt-2">You haven't placed any orders with us. Start shopping!</p>
        </div>
      ) : (
        <div className="space-y-8">
          {customerOrders.map(order => (
            <div key={order.id} className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-4 sm:px-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                  <p className="text-sm font-medium text-gray-600">Order placed</p>
                  <p className="text-sm text-gray-500">{order.date.toLocaleDateString()}</p>
                </div>
                <div className="mt-2 sm:mt-0">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-sm text-gray-900 font-semibold">${order.total.toFixed(2)}</p>
                </div>
                <div className="mt-2 sm:mt-0">
                  <p className="text-sm font-medium text-gray-600">Order ID</p>
                  <p className="text-sm text-gray-500">{order.id}</p>
                </div>
                <div className="mt-2 sm:mt-0">
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <ul className="space-y-4">
                  {order.items.map(item => (
                    <li key={item.id} className="flex items-center space-x-4">
                      <img src={item.image} alt={item.name} className="w-16 h-16 rounded-md object-cover"/>
                      <div className="flex-grow">
                        <p className="font-medium text-gray-800">{item.name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
