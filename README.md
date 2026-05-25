# Aether Threads — E-Commerce Web Platform

> AAST Web Engineering | Semester 8 | Dr. Amr Fahmy

A modern minimalist e-commerce platform for a contemporary clothing brand. Full-stack app: React SPA + Node.js/Express REST API + PostgreSQL.

---

## Team
| Name | ID |
|---|---|
| Omar Mohamed Aboubakr | 221006182 |
| Mohamed Ahmed Mohamed | 221005054 |
| Hazem Mohab | 221005429 |

---

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 14+ (or use Render.com free tier)

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd aether-threads

# Install backend deps
cd backend && npm install

# Install frontend deps
cd ../frontend && npm install
```

### 2. Setup Backend Environment
```bash
cd backend
cp .env.example .env
# Edit .env — fill in DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET
```

### 3. Run Database Migrations & Seed
```bash
cd backend
npm run migrate   # creates all tables
npm run seed      # inserts 14 products, 4 categories, 2 users
```

### 4. Start Backend
```bash
cd backend
npm run dev       # runs on http://localhost:5000
```

### 5. Start Frontend
```bash
cd frontend
echo "VITE_API_URL=http://localhost:5000/api/v1" > .env.local
npm run dev       # runs on http://localhost:5173
```

---

## Demo Accounts
| Role | Email | Password |
|---|---|---|
| Admin | admin@aetherthreads.com | Admin123! |
| Customer | customer@example.com | Customer123! |

---

## Project Structure
```
aether-threads/
├── backend/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── middleware/      # auth.js, error.js, validate.js
│   │   ├── modules/
│   │   │   ├── auth/        # register, login, JWT
│   │   │   ├── products/    # CRUD + categories
│   │   │   ├── cart/        # add, update, remove
│   │   │   ├── orders/      # checkout, history
│   │   │   └── admin/       # stats dashboard
│   │   └── utils/           # jwt.js, slug.js
│   ├── migrations/
│   └── seeds/
└── frontend/
    └── src/
        ├── api/             # axios instance + API modules
        ├── context/         # AuthContext, CartContext
        ├── pages/           # Home, Shop, ProductDetail, Cart,
        │                    # Checkout, Confirmation, Login,
        │                    # Register, Account, Admin/*
        ├── components/
        └── routes/          # ProtectedRoute
```

---

## API Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | /api/v1/auth/register | Public | Register customer |
| POST | /api/v1/auth/login | Public | Login → JWT tokens |
| POST | /api/v1/auth/refresh | Public | Refresh access token |
| GET | /api/v1/auth/me | JWT | Get profile |
| GET | /api/v1/products | Public | List products (paginated) |
| GET | /api/v1/products/:slug | Public | Product detail |
| GET | /api/v1/products/categories | Public | All categories |
| POST | /api/v1/products | Admin | Create product |
| PUT | /api/v1/products/:id | Admin | Update product |
| DELETE | /api/v1/products/:id | Admin | Soft-delete product |
| GET | /api/v1/cart | JWT | Get cart |
| POST | /api/v1/cart | JWT | Add item |
| PATCH | /api/v1/cart/:itemId | JWT | Update quantity |
| DELETE | /api/v1/cart/:itemId | JWT | Remove item |
| POST | /api/v1/orders | JWT | Checkout |
| GET | /api/v1/orders | JWT | My orders (admin: all) |
| GET | /api/v1/orders/:id | JWT | Order detail |
| PATCH | /api/v1/orders/:id/status | Admin | Update status |
| GET | /api/v1/admin/stats | Admin | Dashboard stats |

---

## Deployment

### Frontend → Vercel
```bash
cd frontend
npm run build
# Push to GitHub → connect repo in Vercel → set VITE_API_URL env var
```

### Backend + DB → Render.com
1. Create a PostgreSQL database on Render (free tier)
2. Create a Web Service pointing to `/backend`
3. Set environment variables from `.env.example`
4. Set build command: `npm install && npm run migrate && npm run seed`
5. Set start command: `npm start`

---

## Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, React Router v6, Axios
- **Backend**: Node.js 20, Express, Knex.js, bcrypt, JWT
- **Database**: PostgreSQL 16
- **Deploy**: Vercel (FE) + Render.com (BE + DB)
