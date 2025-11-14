
import React from 'react';
import { useData } from '../../contexts/DataContext';
import { OrderStatus } from '../../types';

const OrdersManagement: React.FC = () => {
  const { orders, updateOrderStatus } = useData();

  const handleStatusChange = (orderId: string, status: OrderStatus) => {
    updateOrderStatus(orderId, status);
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.DELIVERED:
        return 'bg-green-100 text-green-800 border-green-300';
      case OrderStatus.SHIPPED:
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case OrderStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case OrderStatus.CANCELLED:
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Customer Orders</h2>
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map(order => (
                        <tr key={order.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date.toLocaleDateString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customerId}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.total.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <select 
                                    value={order.status}
                                    onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                                    className={`w-full p-2 text-sm rounded-md border ${getStatusColor(order.status)}`}
                                >
                                    {Object.values(OrderStatus).map(status => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default OrdersManagement;
