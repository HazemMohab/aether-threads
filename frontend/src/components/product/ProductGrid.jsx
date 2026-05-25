import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsAPI } from '../../api/index.js';
import ProductCard from './ProductCard.jsx';
import { Spinner, EmptyState } from '../common/index.jsx';

const COLOR_MAP = {
  Black:        '#1a1a1a',
  White:        '#f5f5f5',
  Navy:         '#1b2a4a',
  Beige:        '#c8b49a',
  Gray:         '#9ca3af',
  Grey:         '#9ca3af',
  Olive:        '#6b7c41',
  Cream:        '#f5f0e1',
  Camel:        '#c19a6b',
  Burgundy:     '#800020',
  Terracotta:   '#c7603a',
  Forest:       '#2d5a27',
  Blue:         '#3b82f6',
  'Dark Blue':  '#1e3a5f',
  'Light Blue': '#93c5fd',
  Khaki:        '#c3b091',
  Brown:        '#92400e',
  Pink:         '#f9a8d4',
  Rose:         '#fb7185',
  Green:        '#166534',
};

const DEFAULT_FILTERS = {
  category: '', type: '', size: '', color: '', minPrice: '',
  maxPrice: '', newArrival: '', sort: 'newest', search: '',
};

export default function ProductGrid() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts]         = useState([]);
  const [categoryTree, setCategoryTree] = useState([]);   // [{id,name,slug,children:[…]}]
  const [meta, setMeta]                 = useState({});
  const [loading, setLoading]           = useState(true);

  const filters = useMemo(() => ({
    category:   searchParams.get('category')    || DEFAULT_FILTERS.category,
    type:       searchParams.get('type')          || DEFAULT_FILTERS.type,
    size:       searchParams.get('size')         || DEFAULT_FILTERS.size,
    color:      searchParams.get('color')        || DEFAULT_FILTERS.color,
    minPrice:   searchParams.get('minPrice')     || DEFAULT_FILTERS.minPrice,
    maxPrice:   searchParams.get('maxPrice')     || DEFAULT_FILTERS.maxPrice,
    newArrival: searchParams.get('newArrival')   || DEFAULT_FILTERS.newArrival,
    sort:       searchParams.get('sort')         || DEFAULT_FILTERS.sort,
    search:     searchParams.get('search')       || DEFAULT_FILTERS.search,
    page:       Number(searchParams.get('page')) || 1,
  }), [searchParams]);

  useEffect(() => {
    productsAPI.getCategories()
      .then(({ data }) => setCategoryTree(data.data || []))
      .catch(() => setCategoryTree([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    productsAPI.getAll({ ...filters, limit: 12 })
      .then(({ data }) => {
        setProducts(data.data.products || []);
        setMeta(data.data || {});
      })
      .catch(() => { setProducts([]); setMeta({}); })
      .finally(() => setLoading(false));
  }, [filters]);

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value); else params.delete(key);
    if (key !== 'page') params.delete('page');
    setSearchParams(params);
  };

  const resetFilters = () => setSearchParams({});

  // Which parent slug is currently active?
  const activeParent = useMemo(() => {
    if (!filters.category) return '';
    const isParent = categoryTree.find(p => p.slug === filters.category);
    if (isParent) return isParent.slug;
    for (const p of categoryTree) {
      if ((p.children || []).some(c => c.slug === filters.category)) return p.slug;
    }
    return '';
  }, [filters.category, categoryTree]);

  const activeChildren = useMemo(() => {
    const parent = categoryTree.find(p => p.slug === activeParent);
    return parent?.children || [];
  }, [activeParent, categoryTree]);

  const activeFilterCount = [
    filters.size, filters.color, filters.minPrice,
    filters.maxPrice, filters.newArrival, filters.search,
  ].filter(Boolean).length;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* ── Header ── */}
      <div className="flex flex-col gap-3 mb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs tracking-[0.3em] uppercase text-gray-400 mb-3">Aether Threads</p>
          <h1 className="text-3xl md:text-4xl font-light text-navy">Shop Collection</h1>
          <p className="text-sm text-gray-500 mt-2">{meta.total || 0} pieces found</p>
        </div>
        <div className="w-full md:w-64">
          <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2 block">Sort By</label>
          <select value={filters.sort} onChange={(e) => updateFilter('sort', e.target.value)} className="input">
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name-az">Name: A to Z</option>
          </select>
        </div>
      </div>

      {/* ── Parent Category Tabs ── */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <div className="flex min-w-max">
          <button
            type="button"
            onClick={() => updateFilter('category', '')}
            className={`px-5 py-3 text-sm font-medium tracking-wide whitespace-nowrap border-b-2 transition-colors ${
              filters.category === ''
                ? 'border-navy text-navy'
                : 'border-transparent text-gray-400 hover:text-navy hover:border-gray-300'
            }`}
          >
            All
          </button>
          {categoryTree.map((parent) => (
            <button
              key={parent.slug}
              type="button"
              onClick={() => updateFilter('category', parent.slug)}
              className={`px-5 py-3 text-sm font-medium tracking-wide whitespace-nowrap border-b-2 transition-colors ${
                activeParent === parent.slug
                  ? 'border-navy text-navy'
                  : 'border-transparent text-gray-400 hover:text-navy hover:border-gray-300'
              }`}
            >
              {parent.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── Sub-category Tabs (appear when a parent is selected) ── */}
      {activeChildren.length > 0 && (
        <div className="bg-gray-50 border-b border-gray-200 overflow-x-auto mb-8">
          <div className="flex min-w-max px-2">
            <button
              type="button"
              onClick={() => updateFilter('category', activeParent)}
              className={`px-4 py-2.5 text-xs font-medium tracking-wider whitespace-nowrap border-b-2 transition-colors ${
                filters.category === activeParent
                  ? 'border-navy text-navy'
                  : 'border-transparent text-gray-400 hover:text-navy'
              }`}
            >
              All {categoryTree.find(p => p.slug === activeParent)?.name}
            </button>
            {activeChildren.map((child) => (
              <button
                key={child.slug}
                type="button"
                onClick={() => updateFilter('category', child.slug)}
                className={`px-4 py-2.5 text-xs font-medium tracking-wider whitespace-nowrap border-b-2 transition-colors ${
                  filters.category === child.slug
                    ? 'border-navy text-navy'
                    : 'border-transparent text-gray-400 hover:text-navy'
                }`}
              >
                {/* Strip "Men's " / "Women's " prefix so tabs show just "T-shirts" */}
                {child.name.replace(/^(Men's|Women's)\s/i, '')}
              </button>
            ))}
          </div>
        </div>
      )}
      {activeChildren.length === 0 && <div className="mb-8" />}

      {/* ── Main: Sidebar + Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">

        {/* ── Filters Sidebar ── */}
        <aside className="bg-white border border-gray-100 p-5 h-fit lg:sticky lg:top-24">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-navy uppercase tracking-widest flex items-center gap-2">
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-navy text-white text-[10px] px-1.5 py-0.5 rounded-full leading-none">
                  {activeFilterCount}
                </span>
              )}
            </h2>
            <button type="button" onClick={resetFilters} className="text-xs text-gray-400 hover:text-navy">Reset</button>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2 block">Search</label>
              <input
                className="input" placeholder="Search products…"
                defaultValue={filters.search}
                onKeyDown={(e) => e.key === 'Enter' && updateFilter('search', e.currentTarget.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2 block">Size</label>
              <select value={filters.size} onChange={(e) => updateFilter('size', e.target.value)} className="input">
                <option value="">All Sizes</option>
                {['XS','S','M','L','XL','XXL','28','30','32','34','36','One Size','S/M','L/XL'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2 block">Color</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {Object.entries(COLOR_MAP).map(([color, hex]) => (
                  <button
                    key={color} type="button" title={color}
                    onClick={() => updateFilter('color', filters.color === color ? '' : color)}
                    style={{ backgroundColor: hex }}
                    className={`w-7 h-7 rounded-full transition-all duration-200 ${
                      filters.color === color ? 'ring-2 ring-navy ring-offset-2 scale-110' : 'hover:scale-105'
                    } ${color === 'White' ? 'border border-gray-300' : 'border border-transparent'}`}
                  />
                ))}
              </div>
              {filters.color && (
                <p className="text-xs text-gray-500 mt-2">
                  {filters.color}{' '}
                  <button type="button" className="text-navy underline" onClick={() => updateFilter('color', '')}>clear</button>
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2 block">
                Price Range (EGP)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input type="number" min="0" placeholder="Min" className="input"
                  defaultValue={filters.minPrice}
                  onBlur={(e) => updateFilter('minPrice', e.currentTarget.value)} />
                <input type="number" min="0" placeholder="Max" className="input"
                  defaultValue={filters.maxPrice}
                  onBlur={(e) => updateFilter('maxPrice', e.currentTarget.value)} />
              </div>
            </div>

            <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.newArrival === 'true'}
                onChange={(e) => updateFilter('newArrival', e.target.checked ? 'true' : '')}
                className="w-4 h-4 accent-navy"
              />
              New Arrivals Only
            </label>
          </div>
        </aside>

        {/* ── Product Grid ── */}
        <div>
          {loading ? (
            <div className="flex justify-center py-24"><Spinner /></div>
          ) : products.length === 0 ? (
            <EmptyState
              icon="🔍"
              title="No products found"
              description="Try changing the filters or selecting a different category."
            />
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {products.map((product) => <ProductCard key={product.id} product={product} />)}
              </div>

              {meta.pages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {Array.from({ length: meta.pages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum} type="button"
                      onClick={() => updateFilter('page', String(pageNum))}
                      className={`w-10 h-10 text-sm font-medium transition-colors ${
                        filters.page === pageNum
                          ? 'bg-navy text-white'
                          : 'border border-gray-200 hover:border-navy text-gray-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
