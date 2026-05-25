import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-navy text-white mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold tracking-widest uppercase mb-4">Aether Threads</h3>
            <p className="text-gray-400 text-sm leading-relaxed">Contemporary clothing built for the modern individual. Minimal by design, intentional by nature.</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold tracking-widest uppercase mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/shop?type=tops" className="hover:text-white transition-colors">Tops</Link></li>
              <li><Link to="/shop?type=bottoms" className="hover:text-white transition-colors">Bottoms</Link></li>
              <li><Link to="/shop?category=accessories" className="hover:text-white transition-colors">Accessories</Link></li>
              <li><Link to="/shop?category=sportswear" className="hover:text-white transition-colors">Sportswear</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold tracking-widest uppercase mb-4">Account</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Register</Link></li>
              <li><Link to="/account/orders" className="hover:text-white transition-colors">Orders</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Aether Threads. AAST Web Engineering Project.
        </div>
      </div>
    </footer>
  );
}
