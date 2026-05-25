import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';

// Pages
import Home from './pages/Home.jsx';
import Shop from './pages/Shop.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import OrderConfirmation from './pages/OrderConfirmation.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import AccountOrders from './pages/AccountOrders.jsx';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminProducts from './pages/admin/AdminProducts.jsx';
import AdminProductForm from './pages/admin/AdminProductForm.jsx';
import AdminOrders from './pages/admin/AdminOrders.jsx';

function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Auth pages — no navbar/footer */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Public pages */}
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/shop" element={<Layout><Shop /></Layout>} />
            <Route path="/shop/:slug" element={<Layout><ProductDetail /></Layout>} />

            {/* Customer protected */}
            <Route path="/cart" element={<Layout><ProtectedRoute><Cart /></ProtectedRoute></Layout>} />
            <Route path="/checkout" element={<Layout><ProtectedRoute><Checkout /></ProtectedRoute></Layout>} />
            <Route path="/order-confirmation/:id" element={<Layout><ProtectedRoute><OrderConfirmation /></ProtectedRoute></Layout>} />
            <Route path="/account/orders" element={<Layout><ProtectedRoute><AccountOrders /></ProtectedRoute></Layout>} />

            {/* Admin protected */}
            <Route path="/admin" element={<Layout><ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute></Layout>} />
            <Route path="/admin/products" element={<Layout><ProtectedRoute adminOnly><AdminProducts /></ProtectedRoute></Layout>} />
            <Route path="/admin/products/new" element={<Layout><ProtectedRoute adminOnly><AdminProductForm /></ProtectedRoute></Layout>} />
            <Route path="/admin/products/:id/edit" element={<Layout><ProtectedRoute adminOnly><AdminProductForm /></ProtectedRoute></Layout>} />
            <Route path="/admin/orders" element={<Layout><ProtectedRoute adminOnly><AdminOrders /></ProtectedRoute></Layout>} />

            {/* 404 */}
            <Route path="*" element={<Layout><div className="min-h-[60vh] flex items-center justify-center"><div className="text-center"><h1 className="text-6xl font-light text-gray-200 mb-4">404</h1><p className="text-gray-500">Page not found</p></div></div></Layout>} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
