import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../api/index.js';
import ProductCard from '../components/product/ProductCard.jsx';
import { Spinner } from '../components/common/index.jsx';

const CATEGORIES = [
  { name: 'Tops',        param: '?type=tops',           img: '/uploads/product_upload_12.jpg'  },
  { name: 'Bottoms',     param: '?type=bottoms',         img: '/uploads/mpants_upload_03.jpg'   },
  { name: 'Accessories', param: '?category=accessories',  img: '/uploads/acc_upload_01.png'      },
  { name: 'Sportswear',  param: '?category=sportswear',  img: '/uploads/sport_upload_01.png'    },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsAPI.getAll({ limit: 4 })
      .then(({ data }) => setFeatured(data.data.products))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 flex flex-col items-center text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-gray-400 mb-6">New Collection</p>
          <h1 className="text-5xl md:text-7xl font-light tracking-tight mb-6 max-w-3xl leading-none">
            Wear the <em className="italic font-light">void</em>
          </h1>
          <p className="text-gray-400 text-lg mb-10 max-w-xl">Contemporary essentials crafted for the modern minimalist. Less noise, more intention.</p>
          <Link to="/shop" className="border border-white text-white px-10 py-4 text-sm tracking-widest uppercase hover:bg-white hover:text-navy transition-all duration-300">
            Explore Collection
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-2xl font-light text-center mb-12 tracking-wide">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <Link key={cat.name} to={`/shop${cat.param}`} className="group relative overflow-hidden">
              <div className="aspect-square bg-gray-100 overflow-hidden">
                <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-navy/40 group-hover:bg-navy/60 transition-colors duration-300" />
                <div className="absolute inset-0 flex items-end p-4">
                  <span className="text-white font-medium tracking-widest uppercase text-sm">{cat.name}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl font-light tracking-wide">Featured Pieces</h2>
          <Link to="/shop" className="text-sm text-gray-500 hover:text-navy transition-colors underline underline-offset-4">View all</Link>
        </div>
        {loading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* Brand Banner */}
      <section className="bg-gray-100 py-20 text-center mt-12">
        <p className="text-xs tracking-[0.3em] uppercase text-gray-400 mb-4">The Aether Philosophy</p>
        <h2 className="text-3xl font-light text-navy max-w-2xl mx-auto px-4">Clarity. Restraint. Intentionality.</h2>
      </section>
    </div>
  );
}
