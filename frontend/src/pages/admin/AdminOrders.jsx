import { useState, useEffect } from 'react';
import { ordersAPI } from '../../api/index.js';
import { formatCurrency, getStatusColor } from '../../utils/index.js';
import { PageLoader } from '../../components/common/index.jsx';

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    ordersAPI.getAll().then(({ data }) => setOrders(data.data)).finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (orderId, status) => {
    setUpdating(orderId);
    try {
      const { data } = await ordersAPI.updateStatus(orderId, status);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: data.data.status } : o));
    } finally { setUpdating(null); }
  };

  const filtered = filter ? orders.filter(o => o.status === filter) : orders;

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-light text-navy mb-8">Orders</h1>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button onClick={() => setFilter('')}
          className={`px-4 py-2 text-sm font-medium border transition-colors ${!filter ? 'bg-navy text-white border-navy' : 'border-gray-200 text-gray-600 hover:border-navy'}`}>
          All ({orders.length})
        </button>
        {STATUSES.map(s => {
          const count = orders.filter(o => o.status === s).length;
          return (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 text-sm font-medium border capitalize transition-colors ${filter === s ? 'bg-navy text-white border-navy' : 'border-gray-200 text-gray-600 hover:border-navy'}`}>
              {s} ({count})
            </button>
          );
        })}
      </div>

      <div className="bg-white border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                {['Order ID', 'Customer', 'Total', 'Status', 'Date', 'Update Status'].map(h => (
                  <th key={h} className="px-6 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">#{order.id.slice(0, 8).toUpperCase()}</td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{order.full_name}</p>
                    <p className="text-xs text-gray-400">{order.email}</p>
                  </td>
                  <td className="px-6 py-4 font-semibold text-navy">{formatCurrency(order.total)}</td>
                  <td className="px-6 py-4">
                    <span className={`badge ${getStatusColor(order.status)} px-2.5 py-1 text-xs font-medium capitalize`}>{order.status}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <select
                      value={order.status}
                      disabled={updating === order.id}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="input py-1.5 text-xs w-36">
                      {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">No orders found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
