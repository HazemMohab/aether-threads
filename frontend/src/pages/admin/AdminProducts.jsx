import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../../api/index.js';
import { formatCurrency } from '../../utils/index.js';
import { Spinner } from '../../components/common/index.jsx';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchProducts = (q = '') => {
    setLoading(true);
    productsAPI.getAll({ search: q, limit: 50 })
      .then(({ data }) => setProducts(data.data.products))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`Deactivate "${name}"? It will no longer appear in the shop.`)) return;
    setDeletingId(id);
    try {
      await productsAPI.delete(id);
      setProducts(p => p.filter(x => x.id !== id));
    } finally { setDeletingId(null); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-light text-navy">Products</h1>
        <Link to="/admin/products/new" className="btn-primary">+ Add Product</Link>
      </div>

      <div className="mb-6">
        <input className="input max-w-sm" placeholder="Search products…" value={search}
          onChange={(e) => { setSearch(e.target.value); fetchProducts(e.target.value); }} />
      </div>

      <div className="bg-white border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  {['Product', 'Category', 'Price', 'Stock', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={p.image_url} alt={p.name} className="w-10 h-12 object-cover bg-gray-100 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{p.category_name || '—'}</td>
                    <td className="px-6 py-4 font-semibold text-navy">{formatCurrency(p.price)}</td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${p.stock_qty === 0 ? 'text-red-500' : p.stock_qty < 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {p.stock_qty}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-3">
                        <Link to={`/admin/products/${p.id}/edit`} className="text-accent hover:underline text-xs font-medium">Edit</Link>
                        <button onClick={() => handleDelete(p.id, p.name)} disabled={deletingId === p.id}
                          className="text-red-400 hover:text-red-600 text-xs font-medium disabled:opacity-50">
                          {deletingId === p.id ? '…' : 'Deactivate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
