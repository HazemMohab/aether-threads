import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';

const SHOP_MENU = [
  { label: 'Tops',        href: '/shop?type=tops'            },
  { label: 'Bottoms',     href: '/shop?type=bottoms'         },
  { label: 'Accessories', href: '/shop?category=accessories' },
  { label: 'Sportswear',  href: '/shop?category=sportswear'  },
];

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => { await logout(); navigate('/'); };
  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* ── Main navbar ── */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Brand */}
            <Link to="/" className="text-navy font-bold text-xl tracking-widest uppercase">
              Aether Threads
            </Link>

            {/* Desktop: category links (hidden on mobile) */}
            <div className="hidden md:flex items-center gap-8">
              {SHOP_MENU.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.href}
                  className={({ isActive }) =>
                    `text-sm font-medium tracking-widest uppercase transition-colors ${
                      isActive ? 'text-navy' : 'text-gray-500 hover:text-navy'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              {isAdmin && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `text-sm font-medium tracking-wide transition-colors ${
                      isActive ? 'text-navy' : 'text-gray-500 hover:text-navy'
                    }`
                  }
                >
                  Admin
                </NavLink>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Link to="/account/orders" className="text-sm text-gray-500 hover:text-navy transition-colors hidden sm:block">
                    {user.full_name.split(' ')[0]}
                  </Link>
                  <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-navy transition-colors hidden sm:block">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-sm text-gray-500 hover:text-navy transition-colors hidden sm:block">Login</Link>
                  <Link to="/register" className="btn-primary text-xs py-2 px-4 hidden sm:block">Register</Link>
                </>
              )}

              {/* Cart */}
              <Link to="/cart" className="relative flex items-center">
                <CartIcon />
                {count > 0 && (
                  <span className="absolute -top-2 -right-2 bg-navy text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </Link>

              {/* Hamburger (mobile only) */}
              <button
                className="md:hidden flex flex-col justify-center items-center gap-1.5 w-8 h-8"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label="Toggle menu"
              >
                <span className={`block h-0.5 w-6 bg-navy transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
                <span className={`block h-0.5 w-6 bg-navy transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
                <span className={`block h-0.5 w-6 bg-navy transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Sub-nav bar (mobile: shown below hamburger area) ── */}
        <div className="md:hidden border-t border-gray-100 overflow-x-auto">
          <div className="flex min-w-max px-4">
            {SHOP_MENU.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                onClick={closeMobile}
                className="px-5 py-3 text-xs font-semibold tracking-widest uppercase text-gray-500 hover:text-navy whitespace-nowrap transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* ── Mobile drawer (account / admin links) ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/40" onClick={closeMobile} />
          <div className="relative ml-auto w-64 h-full bg-navy text-white flex flex-col overflow-y-auto">
            <div className="px-6 py-5 border-b border-white/10">
              <p className="text-xs tracking-[0.3em] uppercase text-gray-400">Account</p>
            </div>
            <div className="px-6 pt-5 pb-6 space-y-4">
              {user ? (
                <>
                  <Link to="/account/orders" onClick={closeMobile} className="block text-sm text-gray-300 hover:text-white transition-colors">
                    {user.full_name.split(' ')[0]}
                  </Link>
                  <button onClick={() => { handleLogout(); closeMobile(); }} className="block text-sm text-gray-300 hover:text-white transition-colors">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={closeMobile} className="block text-sm text-gray-300 hover:text-white transition-colors">Login</Link>
                  <Link to="/register" onClick={closeMobile} className="block text-sm text-gray-300 hover:text-white transition-colors">Register</Link>
                </>
              )}
              {isAdmin && (
                <Link to="/admin" onClick={closeMobile} className="block text-sm text-gray-300 hover:text-white transition-colors">Admin</Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const CartIcon = () => (
  <svg className="w-6 h-6 text-gray-700 hover:text-navy transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);
