import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productsAPI } from '../api/index.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatCurrency } from '../utils/index.js';
import { PageLoader } from '../components/common/index.jsx';

function getStockStatus(stockQty) {
  if (stockQty <= 0) return { text: 'Out of Stock', className: 'bg-red-50 text-red-600' };
  if (stockQty <= 5) return { text: 'Low Stock', className: 'bg-amber-50 text-amber-700' };
  return { text: 'In Stock', className: 'bg-green-50 text-green-700' };
}

function SizeGuideModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4" role="dialog" aria-modal="true">
      <div className="bg-white w-full max-w-xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-navy">Size Guide</h2>
          <button type="button" onClick={onClose} className="text-2xl leading-none text-gray-400 hover:text-navy">×</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-100">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="p-3 text-left">Size</th>
                <th className="p-3 text-left">Chest</th>
                <th className="p-3 text-left">Waist</th>
                <th className="p-3 text-left">Hip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                ['XS', '84-88 cm', '68-72 cm', '84-88 cm'],
                ['S', '88-94 cm', '72-78 cm', '88-94 cm'],
                ['M', '94-100 cm', '78-84 cm', '94-100 cm'],
                ['L', '100-106 cm', '84-90 cm', '100-106 cm'],
                ['XL', '106-112 cm', '90-96 cm', '106-112 cm'],
              ].map((row) => (
                <tr key={row[0]}>{row.map((cell) => <td key={cell} className="p-3">{cell}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-400 mt-4">Measurements are approximate. For a relaxed fit, choose one size up.</p>
      </div>
    </div>
  );
}

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    productsAPI.getBySlug(slug)
      .then(({ data }) => {
        const item = data.data;
        setProduct(item);
        if (item.sizes?.length) setSelectedSize(item.sizes[0]);

        const firstColor = item.colors?.[0] || '';
        setSelectedColor(firstColor);

        // Use explicit color_images map; fall back to image_url if missing
        const colorImgMap = item.color_images || {};
        setSelectedImage(colorImgMap[firstColor] || item.image_url);
      })
      .catch(() => navigate('/shop'))
      .finally(() => setLoading(false));
  }, [slug, navigate]);

  const colorImageMap = useMemo(() => product?.color_images || {}, [product]);

  const images = useMemo(() => {
    if (!product) return [];
    const gallery = Array.isArray(product.image_gallery) ? product.image_gallery : [];
    return [...new Set([product.image_url, ...gallery].filter(Boolean))];
  }, [product]);

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    setSelectedImage(colorImageMap[color] || product.image_url);
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/shop/${slug}` } });
      return;
    }
    if (product.sizes?.length && !selectedSize) { setError('Please select a size'); return; }
    if (product.colors?.length && !selectedColor) { setError('Please select a color'); return; }
    setError('');
    setAdding(true);
    try {
      await addItem(product.id, qty, selectedSize, selectedColor);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!product) return null;

  const stock = getStockStatus(product.stock_qty || 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {showSizeGuide && <SizeGuideModal onClose={() => setShowSizeGuide(false)} />}

      <nav className="text-sm text-gray-400 mb-8 flex gap-2">
        <Link to="/" className="hover:text-navy">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-navy">Shop</Link>
        <span>/</span>
        <span className="text-gray-700">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <div className="aspect-[3/4] bg-gray-100 overflow-hidden group cursor-zoom-in">
            <img src={selectedImage || product.image_url} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-125" />
          </div>

          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-3 mt-4">
              {images.map((img) => (
                <button key={img} type="button" onClick={() => setSelectedImage(img)} className={`aspect-square bg-gray-100 overflow-hidden border ${selectedImage === img ? 'border-navy' : 'border-transparent hover:border-gray-300'}`}>
                  <img src={img} alt={`${product.name} view`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-3">
            {product.category_name && <p className="text-xs uppercase tracking-widest text-gray-400">{product.category_name}</p>}
            {product.is_new_arrival && <span className="text-[10px] tracking-widest uppercase bg-navy text-white px-2 py-1">New Arrival</span>}
            <span className={`text-[11px] px-2 py-1 ${stock.className}`}>{stock.text}</span>
          </div>

          <h1 className="text-3xl font-light text-navy mb-3">{product.name}</h1>
          <p className="text-2xl font-semibold text-navy mb-6">{formatCurrency(product.price)}</p>
          <p className="text-gray-600 leading-relaxed mb-8 text-sm">{product.description}</p>

          {product.colors?.length > 0 && (
            <div className="mb-6">
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Color</p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button key={color} type="button" onClick={() => handleColorSelect(color)} className={`px-4 h-11 text-sm font-medium border transition-colors ${selectedColor === color ? 'bg-navy text-white border-navy' : 'border-gray-200 hover:border-navy text-gray-700'}`}>
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.sizes?.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs uppercase tracking-widest text-gray-400">Size</p>
                <button type="button" onClick={() => setShowSizeGuide(true)} className="text-xs text-gray-500 hover:text-navy underline underline-offset-4">Size Guide</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button key={size} onClick={() => setSelectedSize(size)} className={`min-w-12 px-3 h-12 text-sm font-medium border transition-colors ${selectedSize === size ? 'bg-navy text-white border-navy' : 'border-gray-200 hover:border-navy text-gray-700'}`}>
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Quantity</p>
            <div className="flex items-center border border-gray-200 w-fit">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 text-lg">−</button>
              <span className="w-12 text-center text-sm font-medium">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(product.stock_qty, q + 1))} className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 text-lg">+</button>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          {product.stock_qty === 0 ? (
            <button disabled className="btn-primary opacity-50 cursor-not-allowed">Out of Stock</button>
          ) : (
            <button onClick={handleAddToCart} disabled={adding} className={`btn-primary ${added ? 'bg-green-700' : ''} transition-all duration-200`}>
              {adding ? 'Adding…' : added ? '✓ Added to Cart' : 'Add to Cart'}
            </button>
          )}

          <p className="text-xs text-gray-400 mt-4">
            {product.stock_qty <= 0 ? 'This piece is currently unavailable.' : `${product.stock_qty} pieces available`}
          </p>
        </div>
      </div>
    </div>
  );
}
