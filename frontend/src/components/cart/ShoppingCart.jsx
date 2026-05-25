import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx';
import { formatCurrency } from '../../utils/index.js';
import { EmptyState, Spinner } from '../common/index.jsx';

const TAX_RATE = 0.14;
const SHIPPING_FEE = 50;
const FREE_SHIPPING_THRESHOLD = 2000;

export default function ShoppingCart() {
  const { items, loading, total, updateItem, removeItem } = useCart();
  const shipping = total >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const tax = total * TAX_RATE;
  const orderTotal = total + tax + shipping;

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><Spinner /></div>;
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          icon="🛍️"
          title="Your cart is empty"
          description="Discover the latest Aether Threads collection."
          action={<Link to="/shop" className="btn-primary">Shop Now</Link>}
        />
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10">
        <p className="text-xs tracking-[0.3em] uppercase text-gray-400 mb-3">Checkout</p>
        <h1 className="text-3xl md:text-4xl font-light text-navy">Shopping Cart</h1>
        <p className="text-sm text-gray-500 mt-2">Review your selected pieces before checkout.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">
        <div className="space-y-5">
          {items.map((item) => {
            const itemPrice = Number(item.price);
            const itemTotal = itemPrice * item.quantity;
            return (
              <article key={item.id} className="bg-white border border-gray-100 p-4 sm:p-5 flex gap-4">
                <div className="w-24 h-32 sm:w-32 sm:h-40 bg-gray-100 flex-shrink-0 overflow-hidden">
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-sm sm:text-base font-medium text-gray-900">{item.name}</h2>
                      <div className="mt-2 space-y-1">
                        {item.size && <p className="text-xs text-gray-500">Size: <span className="text-gray-800">{item.size}</span></p>}
                        {item.color && <p className="text-xs text-gray-500">Color: <span className="text-gray-800">{item.color}</span></p>}
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-navy whitespace-nowrap">{formatCurrency(itemTotal)}</p>
                  </div>

                  <p className="text-sm text-gray-500 mt-4">Unit Price: {formatCurrency(itemPrice)}</p>

                  <div className="flex flex-wrap items-center gap-4 mt-5">
                    <div className="flex items-center border border-gray-200">
                      <button type="button" onClick={() => item.quantity > 1 ? updateItem(item.id, item.quantity - 1) : removeItem(item.id)} className="w-9 h-9 flex items-center justify-center hover:bg-gray-50" aria-label="Decrease quantity">−</button>
                      <span className="w-10 text-center text-sm">{item.quantity}</span>
                      <button type="button" onClick={() => updateItem(item.id, item.quantity + 1)} className="w-9 h-9 flex items-center justify-center hover:bg-gray-50" aria-label="Increase quantity">+</button>
                    </div>

                    <button type="button" onClick={() => removeItem(item.id)} className="text-xs text-red-400 hover:text-red-600 transition-colors">Remove</button>
                    <button type="button" className="text-xs text-gray-400 hover:text-navy transition-colors">Save for Later</button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <aside className="bg-white border border-gray-100 p-6 h-fit lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold text-navy mb-6">Order Summary</h2>
          <div className="space-y-4 text-sm mb-6">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="text-gray-900">{formatCurrency(total)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Tax 14%</span><span className="text-gray-900">{formatCurrency(tax)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span className="text-gray-900">{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span></div>
            {shipping !== 0 && <p className="text-xs text-gray-400">Spend {formatCurrency(FREE_SHIPPING_THRESHOLD - total)} more to get free shipping.</p>}
            <div className="border-t border-gray-200 pt-4 flex justify-between font-semibold text-base"><span>Total</span><span className="text-navy">{formatCurrency(orderTotal)}</span></div>
          </div>

          <Link to="/checkout" className="btn-primary w-full text-center block">Proceed to Checkout</Link>
          <Link to="/shop" className="block text-center text-sm text-gray-500 mt-4 hover:text-navy transition-colors">Continue Shopping</Link>
          <div className="mt-6 border-t border-gray-100 pt-5">
            <p className="text-xs text-gray-400 leading-relaxed">Secure checkout, order tracking, and saved addresses are ready for the user dashboard flow.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
