import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI } from '../api/index.js';
import { formatCurrency, getStatusColor } from '../utils/index.js';
import { PageLoader, EmptyState } from '../components/common/index.jsx';

function formatOrderId(id) {
  return String(id).padStart(6, '0');
}

export default function AccountOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersAPI
      .getAll()
      .then(({ data }) => {
        setOrders(data.data || []);
      })
      .catch((err) => {
        console.error('Failed to load orders:', err);
        setOrders([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-light text-navy mb-10">My Orders</h1>

      {orders.length === 0 ? (
        <EmptyState
          icon="📦"
          title="No orders yet"
          description="Start shopping to see your orders here"
          action={
            <Link to="/shop" className="btn-primary">
              Shop Now
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-gray-100 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <p className="text-xs font-mono text-gray-400 mb-1">
                  Order #{formatOrderId(order.id)}
                </p>

                <p className="font-semibold text-navy">
                  {formatCurrency(Number(order.total))}
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  {new Date(order.created_at).toLocaleDateString('en-EG', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <span
                  className={`badge ${getStatusColor(order.status)} px-3 py-1 text-xs font-medium capitalize`}
                >
                  {order.status}
                </span>

                <Link
                  to={`/order-confirmation/${order.id}`}
                  className="text-sm text-navy hover:underline"
                >
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}