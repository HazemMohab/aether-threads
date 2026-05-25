import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ordersAPI } from '../api/index.js';
import { formatCurrency, getStatusColor } from '../utils/index.js';
import { PageLoader } from '../components/common/index.jsx';

export default function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersAPI
      .getById(id)
      .then(({ data }) => {
        setOrder(data.data);
      })
      .catch((err) => {
        console.error('Failed to load order:', err);
        setOrder(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) return <PageLoader />;

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl text-navy mb-4">Order not found</h1>
        <p className="text-gray-500 mb-8">
          The order was created, but the confirmation details could not be loaded.
        </p>
        <Link to="/shop" className="btn-primary">
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="text-6xl mb-4">✅</div>

      <h1 className="text-3xl font-light text-navy mb-2">
        Order Confirmed!
      </h1>

      <p className="text-gray-500 mb-2">
        Thank you for your purchase.
      </p>

      <p className="text-xs text-gray-400 mb-10 font-mono">
        Order #{String(order.id).padStart(6, '0')}
      </p>

      <div className="text-left bg-gray-50 p-6 mb-8">
        <h2 className="font-semibold text-navy mb-4">
          Order Details
        </h2>

        <div className="space-y-3">
          {order.items?.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {item.name} {item.size && `(${item.size})`} × {item.quantity}
              </span>

              <span>
                {formatCurrency(Number(item.unit_price) * Number(item.quantity))}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 mt-4 pt-4 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span>{formatCurrency(Number(order.subtotal))}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Tax</span>
            <span>{formatCurrency(Number(order.tax))}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Shipping</span>
            <span>{formatCurrency(Number(order.shipping))}</span>
          </div>

          <div className="flex justify-between font-semibold text-base pt-2 border-t border-gray-200">
            <span>Total</span>
            <span className="text-navy">
              {formatCurrency(Number(order.total))}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center text-sm">
          <span className="text-gray-600">Status</span>
          <span className={`badge ${getStatusColor(order.status)}`}>
            {order.status}
          </span>
        </div>
      </div>

      <div className="flex gap-4 justify-center">
        <Link to="/shop" className="btn-primary">
          Continue Shopping
        </Link>

        <Link to="/account/orders" className="btn-secondary">
          My Orders
        </Link>
      </div>
    </div>
  );
}