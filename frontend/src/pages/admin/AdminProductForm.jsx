import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productsAPI } from '../../api/index.js';
import { PageLoader } from '../../components/common/index.jsx';

const DEFAULT = {
  name: '', description: '', price: '', stock_qty: '',
  image_url: '', image_gallery_text: '',
  parent_category_id: '', category_id: '',
  sizes: ['S', 'M', 'L', 'XL'], colors: ['Black'],
  is_new_arrival: false,
};
const ALL_SIZES  = ['XS','S','M','L','XL','XXL','28','30','32','34','36','One Size','S/M','L/XL'];
const ALL_COLORS = ['Black','White','Navy','Beige','Gray','Olive','Cream','Pink','Rose','Camel','Brown'];

export default function AdminProductForm() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const isEdit       = !!id;
  const fileInputRef = useRef(null);

  const [form, setForm]               = useState(DEFAULT);
  const [categoryTree, setCategoryTree] = useState([]);   // [{id,name,slug,children:[…]}]
  const [loading, setLoading]         = useState(isEdit);
  const [saving, setSaving]           = useState(false);
  const [uploading, setUploading]     = useState(false);
  const [error, setError]             = useState('');
  const [uploadError, setUploadError] = useState('');

  // Derived: children of the selected parent
  const subCategories = categoryTree.find(p => String(p.id) === String(form.parent_category_id))?.children || [];

  useEffect(() => {
    productsAPI.getCategories().then(({ data }) => {
      setCategoryTree(data.data || []);
    });

    if (isEdit) {
      productsAPI.getAll({ limit: 200 }).then(({ data }) => {
        const p = (data.data.products || []).find(x => x.id === id);
        if (p) {
          setForm({
            name:               p.name,
            description:        p.description || '',
            price:              p.price,
            stock_qty:          p.stock_qty,
            image_url:          p.image_url || '',
            image_gallery_text: (p.image_gallery || []).join('\n'),
            parent_category_id: String(p.parent_category_id || ''),
            category_id:        String(p.category_id || ''),
            sizes:              p.sizes || DEFAULT.sizes,
            colors:             p.colors || DEFAULT.colors,
            is_new_arrival:     !!p.is_new_arrival,
          });
        }
      }).finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value,
      // Reset subcategory when parent changes
      ...(name === 'parent_category_id' ? { category_id: '' } : {}),
    }));
  };

  const toggleSize  = (s) => setForm(f => ({ ...f, sizes:  f.sizes.includes(s)  ? f.sizes.filter(x => x !== s)  : [...f.sizes, s]  }));
  const toggleColor = (c) => setForm(f => ({ ...f, colors: f.colors.includes(c) ? f.colors.filter(x => x !== c) : [...f.colors, c] }));

  // ── Image Upload ──────────────────────────────────────────────────────────────
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const { data } = await productsAPI.uploadImage(file);
      setForm(f => ({ ...f, image_url: data.url }));
    } catch {
      setUploadError('Upload failed. Make sure you are logged in as admin.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.category_id) { setError("Please select a subcategory (e.g. Men's T-shirts)."); return; }
    setSaving(true);
    try {
      const payload = {
        name:           form.name,
        description:    form.description,
        price:          parseFloat(form.price),
        stock_qty:      parseInt(form.stock_qty),
        category_id:    parseInt(form.category_id),
        image_url:      form.image_url,
        image_gallery:  form.image_gallery_text.split('\n').map(u => u.trim()).filter(Boolean),
        sizes:          form.sizes,
        colors:         form.colors,
        is_new_arrival: form.is_new_arrival,
      };
      if (isEdit) await productsAPI.update(id, payload);
      else        await productsAPI.create(payload);
      navigate('/admin/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    } finally { setSaving(false); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-light text-navy mb-10">{isEdit ? 'Edit Product' : 'New Product'}</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm mb-6">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Name */}
        <div>
          <label className="label">Product Name *</label>
          <input name="name" required value={form.name} onChange={handleChange} className="input" placeholder="TWENTYSEVEN Black Tee" />
        </div>

        {/* Description */}
        <div>
          <label className="label">Description</label>
          <textarea name="description" rows={4} value={form.description} onChange={handleChange} className="input resize-none" placeholder="Product description…" />
        </div>

        {/* Price + Stock */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Price (EGP) *</label>
            <input name="price" type="number" step="0.01" min="0" required value={form.price} onChange={handleChange} className="input" placeholder="799" />
          </div>
          <div>
            <label className="label">Stock Qty *</label>
            <input name="stock_qty" type="number" min="0" required value={form.stock_qty} onChange={handleChange} className="input" placeholder="50" />
          </div>
        </div>

        {/* ── Hierarchical Category ── */}
        <div className="space-y-3">
          <div>
            <label className="label">Section *</label>
            <select name="parent_category_id" value={form.parent_category_id} onChange={handleChange} className="input" required>
              <option value="">Select section (Men / Women)</option>
              {categoryTree.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          {form.parent_category_id && (
            <div>
              <label className="label">Subcategory *</label>
              <select name="category_id" value={form.category_id} onChange={handleChange} className="input" required>
                <option value="">Select subcategory</option>
                {subCategories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* ── Image Upload ── */}
        <div>
          <label className="label">Product Image</label>

          {/* File upload button */}
          <div className="flex items-center gap-3 mb-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="btn-secondary text-sm"
            >
              {uploading ? 'Uploading…' : '📷 Upload Photo'}
            </button>
            <span className="text-xs text-gray-400">JPG, PNG, WEBP up to 10 MB</span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />

          {uploadError && <p className="text-red-500 text-xs mb-2">{uploadError}</p>}

          {/* Manual URL fallback */}
          <input
            name="image_url"
            value={form.image_url}
            onChange={handleChange}
            className="input"
            placeholder="Or paste an image URL here…"
          />

          {/* Preview */}
          {form.image_url && (
            <div className="mt-3 relative w-32">
              <img src={form.image_url} alt="preview" className="w-32 h-40 object-cover bg-gray-100 rounded" />
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, image_url: '' }))}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* Gallery URLs */}
        <div>
          <label className="label">Gallery Image URLs</label>
          <textarea
            name="image_gallery_text" rows={3}
            value={form.image_gallery_text}
            onChange={handleChange}
            className="input resize-none"
            placeholder="One image URL per line (optional)"
          />
          <p className="text-xs text-gray-400 mt-1">Used for the product zoom gallery and colour thumbnails.</p>
        </div>

        {/* New Arrival */}
        <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" name="is_new_arrival" checked={form.is_new_arrival} onChange={handleChange} className="w-4 h-4 accent-navy" />
          Mark as New Arrival
        </label>

        {/* Sizes */}
        <div>
          <label className="label">Available Sizes</label>
          <div className="flex flex-wrap gap-2">
            {ALL_SIZES.map(size => (
              <button key={size} type="button" onClick={() => toggleSize(size)}
                className={`px-3 py-1.5 text-sm border transition-colors ${
                  form.sizes.includes(size) ? 'bg-navy text-white border-navy' : 'border-gray-200 text-gray-600 hover:border-navy'
                }`}>
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div>
          <label className="label">Available Colors</label>
          <div className="flex flex-wrap gap-2">
            {ALL_COLORS.map(color => (
              <button key={color} type="button" onClick={() => toggleColor(color)}
                className={`px-3 py-1.5 text-sm border transition-colors ${
                  form.colors.includes(color) ? 'bg-navy text-white border-navy' : 'border-gray-200 text-gray-600 hover:border-navy'
                }`}>
                {color}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
          <button type="button" onClick={() => navigate('/admin/products')} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
