import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/index.js';

const COLOR_MAP = {
  Black: '#1a1a1a',
  White: '#f5f5f5',
  Navy: '#1b2a4a',
  Beige: '#c8b49a',
  Gray: '#9ca3af',
  Grey: '#9ca3af',
  Olive: '#6b7c41',
  Cream: '#f5f0e1',
  Camel: '#c19a6b',
  Burgundy: '#800020',
  Terracotta: '#c7603a',
  Forest: '#2d5a27',
  Blue: '#3b82f6',
  'Dark Blue': '#1e3a5f',
  'Light Blue': '#93c5fd',
  Khaki: '#c3b091',
  Brown: '#92400e',
};

function getStockLabel(stockQty) {
  if (stockQty <= 0) return { text: 'Out of Stock', className: 'bg-red-50 text-red-600' };
  if (stockQty <= 5) return { text: 'Low Stock', className: 'bg-amber-50 text-amber-700' };
  return { text: 'In Stock', className: 'bg-green-50 text-green-700' };
}

export default function ProductCard({ product }) {
  const stock = getStockLabel(product.stock_qty || 0);
  const mainImage = product.image_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600';

  return (
    <div className="group relative bg-white border border-gray-100 hover:border-gray-200 transition-all duration-300">
      <button
        type="button"
        aria-label="Add to wishlist"
        className="absolute right-3 top-3 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-white transition-colors"
      >
        ♡
      </button>

      {product.is_new_arrival && (
        <span className="absolute left-3 top-3 z-10 bg-navy text-white text-[10px] tracking-widest uppercase px-2 py-1">
          New
        </span>
      )}

      <Link to={`/shop/${product.slug}`} className="block">
        <div className="aspect-[3/4] bg-gray-100 overflow-hidden">
          <img src={mainImage} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between gap-3 mb-2">
            {product.category_name && <p className="text-[11px] text-gray-400 uppercase tracking-widest">{product.category_name}</p>}
            <span className={`text-[11px] px-2 py-1 ${stock.className}`}>{stock.text}</span>
          </div>

          <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
          <p className="text-sm text-navy font-semibold">{formatCurrency(product.price)}</p>

          {Array.isArray(product.sizes) && product.sizes.length > 0 && (
            <p className="text-xs text-gray-400 mt-2">
              Sizes: {product.sizes.slice(0, 4).join(', ')}{product.sizes.length > 4 ? ' +' : ''}
            </p>
          )}

          {Array.isArray(product.colors) && product.colors.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2">
              {product.colors.map((color) => (
                <span
                  key={color}
                  title={color}
                  style={{ backgroundColor: COLOR_MAP[color] || '#ccc' }}
                  className="w-3.5 h-3.5 rounded-full border border-gray-200 inline-block flex-shrink-0"
                />
              ))}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
