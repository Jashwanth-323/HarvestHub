
import React from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Order, OrderStatus } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Analytics: React.FC = () => {
  const { orders, products } = useData();
  const { currentUser } = useAuth();
  
  const farmerProducts = products.filter(p => p.farmerId === currentUser?.id);
  const farmerProductIds = new Set(farmerProducts.map(p => p.id));

  const farmerOrders = orders.filter(order =>
    order.items.some(item => farmerProductIds.has(item.id))
  );

  const totalSales = farmerOrders.reduce((sum, order) => {
    if (order.status === OrderStatus.DELIVERED) {
      return sum + order.total;
    }
    return sum;
  }, 0);

  const totalOrders = farmerOrders.length;
  const pendingOrders = farmerOrders.filter(o => o.status === OrderStatus.PENDING).length;
  const deliveredOrders = farmerOrders.filter(o => o.status === OrderStatus.DELIVERED).length;

  const salesData = farmerOrders.reduce((acc, order) => {
    if (order.status === OrderStatus.DELIVERED) {
        const date = order.date.toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + order.total;
    }
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(salesData).map(([date, sales]) => ({
      name: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      Sales: sales,
  })).sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());


  const StatCard: React.FC<{ title: string; value: string | number; description: string }> = ({ title, value, description }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value={`$${totalSales.toFixed(2)}`} description="From completed orders" />
        <StatCard title="Total Orders" value={totalOrders} description="Across all statuses" />
        <StatCard title="Pending Orders" value={pendingOrders} description="Awaiting fulfillment" />
        <StatCard title="Products Listed" value={farmerProducts.length} description="Currently available" />
      </div>

      {/* Sales Chart */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Sales (Completed Orders)</h3>
        {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                <Legend />
                <Bar dataKey="Sales" fill="#16a34a" />
            </BarChart>
            </ResponsiveContainer>
        ) : (
            <div className="flex items-center justify-center h-72 text-gray-500">
                No sales data to display.
            </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
