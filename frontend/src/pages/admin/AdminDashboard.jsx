import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../api/index.js';
import { formatCurrency, getStatusColor } from '../../utils/index.js';
import { PageLoader } from '../../components/common/index.jsx';

const StatCard = ({ label, value, icon }) => (
  <div className="bg-white border border-gray-100 p-6">
    <div className="flex items-center justify-between mb-2">
      <p className="text-xs uppercase tracking-widest text-gray-400">{label}</p>
      <span className="text-2xl">{icon}</span>
    </div>
    <p className="text-3xl font-light text-navy">{value}</p>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getStats().then(({ data }) => setStats(data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl font-light text-navy">Admin Dashboard</h1>
        <div className="flex gap-3">
          <Link to="/admin/products" className="btn-secondary text-sm py-2 px-4">Manage Products</Link>
          <Link to="/admin/orders" className="btn-primary text-sm py-2 px-4">Manage Orders</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <StatCard label="Total Orders" value={stats?.total_orders ?? 0} icon="📦" />
        <StatCard label="Revenue" value={formatCurrency(stats?.revenue ?? 0)} icon="💰" />
        <StatCard label="Products" value={stats?.total_products ?? 0} icon="👕" />
        <StatCard label="Customers" value={stats?.total_customers ?? 0} icon="👤" />
      </div>

      {/* Recent Orders */}
      <div className="bg-white border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-semibold text-navy">Recent Orders</h2>
          <Link to="/admin/orders" className="text-sm text-accent hover:underline">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                {['Order ID', 'Customer', 'Amount', 'Status', 'Date'].map(h => (
                  <th key={h} className="px-6 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats?.recent_orders?.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">#{order.id.slice(0, 8).toUpperCase()}</td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{order.full_name}</p>
                      <p className="text-xs text-gray-400">{order.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-navy">{formatCurrency(order.total)}</td>
                  <td className="px-6 py-4">
                    <span className={`badge ${getStatusColor(order.status)} px-2.5 py-1 text-xs font-medium capitalize`}>{order.status}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
