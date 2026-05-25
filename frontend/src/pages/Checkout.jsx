import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { ordersAPI } from '../api/index.js';
import { formatCurrency } from '../utils/index.js';

const TAX_RATE = 0.14;
const SHIPPING = 50;

export default function Checkout() {
  const navigate = useNavigate();
  const { items, total, fetchCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [cardForm, setCardForm] = useState({ card_number: '', expiry: '', cvv: '', card_name: '' });
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', address: '', city: '', postal_code: '', country: 'Egypt',
  });

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleCardChange = (e) => setCardForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const formatCardNumber = (val) =>
    val.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  };

  const tax = total * TAX_RATE;
  const orderTotal = total + tax + SHIPPING;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (paymentMethod === 'visa') {
      const raw = cardForm.card_number.replace(/\s/g, '');
      if (raw.length !== 16) { setError('Please enter a valid 16-digit card number.'); return; }
      if (cardForm.expiry.length < 5) { setError('Please enter a valid expiry date (MM/YY).'); return; }
      if (cardForm.cvv.length < 3) { setError('Please enter a valid CVV.'); return; }
      if (!cardForm.card_name.trim()) { setError('Please enter the cardholder name.'); return; }
    }
    setError('');
    setSubmitting(true);
    try {
      const { data } = await ordersAPI.create({ shipping_address: form, payment_method: paymentMethod });
      await fetchCart();
      navigate(`/order-confirmation/${data.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
      setSubmitting(false);
    }
  };

  if (items.length === 0) { navigate('/cart'); return null; }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-light text-navy mb-10">Checkout</h1>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Form */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-lg font-semibold text-navy mb-6 pb-2 border-b border-gray-100">Shipping Address</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: 'full_name', label: 'Full Name', col: 'sm:col-span-2' },
                  { name: 'email', label: 'Email', type: 'email' },
                  { name: 'phone', label: 'Phone' },
                  { name: 'address', label: 'Street Address', col: 'sm:col-span-2' },
                  { name: 'city', label: 'City' },
                  { name: 'postal_code', label: 'Postal Code' },
                ].map(({ name, label, type = 'text', col = '' }) => (
                  <div key={name} className={col}>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wider">{label}</label>
                    <input name={name} type={type} required value={form[name]} onChange={handleChange} className="input" />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-navy mb-6 pb-2 border-b border-gray-100">Payment</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex items-center gap-3 p-4 border-2 cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-navy bg-navy/5' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="accent-navy" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">Cash on Delivery</p>
                      <p className="text-xs text-gray-500">Pay when received</p>
                    </div>
                  </label>
                  <label className={`flex items-center gap-3 p-4 border-2 cursor-pointer transition-colors ${paymentMethod === 'visa' ? 'border-navy bg-navy/5' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="paymentMethod" value="visa" checked={paymentMethod === 'visa'} onChange={() => setPaymentMethod('visa')} className="accent-navy" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">Card Payment</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 font-bold rounded">VISA</span>
                        <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 font-bold rounded">MC</span>
                      </div>
                    </div>
                  </label>
                </div>

                {paymentMethod === 'cod' && (
                  <div className="bg-gray-50 border border-dashed border-gray-300 p-4">
                    <p className="text-gray-600 text-sm">💵 You will pay in cash upon delivery.</p>
                  </div>
                )}

                {paymentMethod === 'visa' && (
                  <div className="border border-gray-200 p-5 space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wider">Card Number</label>
                      <input
                        name="card_number"
                        value={cardForm.card_number}
                        onChange={(e) => setCardForm(f => ({ ...f, card_number: formatCardNumber(e.target.value) }))}
                        placeholder="1234 5678 9012 3456"
                        className="input font-mono tracking-widest"
                        maxLength={19}
                        inputMode="numeric"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wider">Expiry Date</label>
                        <input
                          name="expiry"
                          value={cardForm.expiry}
                          onChange={(e) => setCardForm(f => ({ ...f, expiry: formatExpiry(e.target.value) }))}
                          placeholder="MM/YY"
                          className="input"
                          maxLength={5}
                          inputMode="numeric"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wider">CVV</label>
                        <input
                          name="cvv"
                          value={cardForm.cvv}
                          onChange={(e) => setCardForm(f => ({ ...f, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                          placeholder="•••"
                          className="input"
                          maxLength={4}
                          inputMode="numeric"
                          type="password"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wider">Cardholder Name</label>
                      <input
                        name="card_name"
                        value={cardForm.card_name}
                        onChange={handleCardChange}
                        placeholder="Name as shown on card"
                        className="input"
                      />
                    </div>
                    <p className="text-xs text-gray-400">🔒 Your payment details are encrypted and secure</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div>
            <div className="bg-gray-50 p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-navy mb-6">Order Summary</h2>
              <div className="space-y-3 mb-6">
                {items.map((i) => (
                  <div key={i.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 truncate mr-2">{i.name} × {i.quantity}</span>
                    <span className="flex-shrink-0">{formatCurrency(i.price * i.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>{formatCurrency(total)}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Tax (14%)</span><span>{formatCurrency(tax)}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Shipping</span><span>{formatCurrency(SHIPPING)}</span></div>
                <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold text-base">
                  <span>Total</span><span className="text-navy">{formatCurrency(orderTotal)}</span>
                </div>
              </div>
              {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
              <button type="submit" disabled={submitting} className="btn-primary w-full mt-6 disabled:opacity-60">
                {submitting ? 'Placing Order…' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
