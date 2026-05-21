<div align="center">
  <br/>
  <h1>🛒 Marketplace</h1>
  <p><strong>Full-featured e‑commerce platform with multi‑role support — buyers, sellers, and admins in one unified marketplace.</strong></p>

  <p>
    <img src="https://img.shields.io/badge/status-beta-yellow?style=flat-square" alt="Status">
    <img src="https://img.shields.io/badge/version-0.1.0-blue?style=flat-square" alt="Version">
    <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License">
    <img src="https://img.shields.io/badge/python-3.11+-blue?style=flat-square" alt="Python">
    <img src="https://img.shields.io/badge/react-19-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React">
    <img src="https://img.shields.io/badge/fastapi-0.135-009688?style=flat-square&logo=fastapi&logoColor=white" alt="FastAPI">
    <img src="https://img.shields.io/badge/postgresql-15-336791?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL">
    <img src="https://img.shields.io/badge/docker-compose-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker">
  </p>

  <br/>
  <p>
    <a href="#-features">Features</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-project-structure">Structure</a> •
    <a href="#-roadmap">Roadmap</a>
  </p>

  <br/>
</div>

---

## 📸 Preview

<!-- 📸 Главный скриншот: страница каталога с товарами, фильтрацией по категориям, поиском и пагинацией. Покажи основную сетку карточек товаров с ценами, фото и кнопками "В корзину". -->

<img src="frontend/public/страница товаров.png" alt="screenshot">

## 💡 About The Project

Building a marketplace from scratch is **hard**. You need user auth, product management, shopping carts, order workflows, role-based access control, and dashboards for different user types — all while keeping the codebase maintainable and the UI snappy.

**Marketplace** bundles everything you need to launch a multi-vendor e‑commerce platform. Instead of stitching together half‑baked plugins or paying for a SaaS that you can't customize, you get a clean, modular codebase that you own completely.

The backend follows a **layered architecture** (Repository → Service → API) with strict separation of concerns. The frontend is built with **React 19** and communicates via a typed REST API. Everything runs in **Docker containers** for zero‑config local development.

> **Why this project?**  
> Most open‑source e‑commerce apps are either outdated (think Magento) or only support a single vendor. Marketplace was designed from day one for **three roles** — buyer, seller, admin — with dedicated panels and permissions for each.

---

## ✨ Features

| # | Feature | Details |
|---|---------|---------|
| 🛍️ | **Product Catalog** | Browse, search, filter by category, nested category tree |
| 🔐 | **JWT Authentication** | Register, login, token‑based auth with automatic refresh handling |
| 🛒 | **Shopping Cart** | Add/remove items, adjust quantity, sync between guest and logged‑in user |
| ⭐ | **Favorites / Wishlist** | Save products, one‑click toggle from catalog or detail page |
| 📦 | **Order Management** | Create orders from cart, track status (pending → shipped → delivered) |
| 🏪 | **Seller Panel** | Shop profile, product CRUD, image upload, order tracking, revenue dashboard |
| 🛡️ | **Admin Panel** | User management with role assignment, product moderation, category CRUD, order oversight |
| 🖼️ | **Image Upload** | Drag‑and‑drop product images served via dedicated `/uploads` endpoint |
| 🐳 | **Docker‑Ready** | Dev and production compose files, multi‑stage builds, zero‑config setup |
| 🔄 | **Database Migrations** | Alembic‑powered schema versioning with data migration support |

---

## 📷 Screenshots

### Buyer Experience

<!-- 📸 Страница товара: детальный просмотр с фото, ценой, описанием, выбором количества и кнопкой "Добавить в корзину". Ниже — блок "О магазине" продавца. -->
<img src="frontend/public/страница товара.png" alt="screenshot">

### Seller Panel

<!-- 📸 Панель продавца: дашборд с карточками статистики (товары, заказы, выручка) и ссылками на управление товарами, заказами и настройки магазина. -->

<img src="frontend/public/магазин статистика.png" alt="screenshot">



<!-- 📸 Корзина: список добавленных товаров с фото, названием, ценой, количеством (можно изменить) и итоговой суммой. Кнопка "Оформить заказ". -->

### Cart
<img src="frontend/public/корзина.png" alt="screenshot">

---

## 🧰 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | [React 19](https://react.dev/) + [Vite 7](https://vitejs.dev/) | SPA with HMR, modern ESM bundling |
| | [React Router 7](https://reactrouter.com/) | Declarative client‑side routing |
| | [Axios](https://axios-http.com/) | HTTP client with interceptors for JWT and error handling |
| **Backend** | [FastAPI](https://fastapi.tiangolo.com/) | Async Python framework with OpenAPI docs |
| | [SQLAlchemy 2.0](https://www.sqlalchemy.org/) | ORM with connection pooling |
| | [Alembic](https://alembic.sqlalchemy.org/) | Database migrations with auto‑generation |
| | [python-jose](https://github.com/mpdavis/python-jose) + [passlib](https://passlib.readthedocs.io/) | JWT tokens + bcrypt password hashing |
| | [Pydantic v2](https://docs.pydantic.dev/) | Request/response validation and serialization |
| **Database** | [PostgreSQL 15](https://www.postgresql.org/) | Relational database with enum support |
| **Infrastructure** | [Docker Compose](https://docs.docker.com/compose/) | Multi‑container orchestration (dev + prod) |
| | [uv](https://github.com/astral-sh/uv) | Python package manager (blazing fast) |
| | [nginx](https://nginx.org/) | Production static file serving |

---

## 🚀 Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/) (v2+)
- Git

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/marketplace-app.git
cd marketplace-app

# 2. Copy environment file
cp backend/.env.example backend/.env

# 3. Start all services (PostgreSQL, Backend, Frontend)
docker compose up -d

# 4. Run database migrations
docker compose exec backend alembic upgrade head

# 5. (Optional) Seed with demo data
docker compose exec backend python scripts/seed.py
```

That's it. Open [http://localhost:5173](http://localhost:5173) in your browser.

### Configuration

Key environment variables in `backend/.env`:

| Variable | Default | Description |
|----------|---------|-------------|
| `DEBUG` | `true` | Enable detailed error responses and SQL logging |
| `SECRET_KEY` | `your-super-secret-key-here…` | JWT signing key (change in production!) |
| `DATABASE_URL` | `postgresql://postgres:postgres@postgres:5432/marketplace` | PostgreSQL connection string |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | JWT token lifetime |

### Production Deployment

```bash
docker compose -f docker-compose.prod.yml up -d
```

The production Compose file:
- Uses dedicated build targets (`production`) with optimized images
- Nginx serves the built frontend on port `80`
- Backend runs with `DEBUG=false`
- No code volumes (everything baked into images)

---

## 📖 Usage

### Common Scenarios

<details>
<summary><strong>🛍️  As a buyer — browse and purchase</strong></summary>

```bash
# Register a buyer account
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"buyer@example.com","username":"buyer","password":"secret123","role":"buyer"}'

# Log in and get a JWT token
curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"buyer@example.com","password":"secret123"}'

# Browse products
curl http://localhost:8000/api/v1/products/?search=phone

# Add to cart
curl -X POST http://localhost:8000/api/v1/cart/items \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"product_id":1,"quantity":2}'

# Create an order
curl -X POST http://localhost:8000/api/v1/orders/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"shipping_address":"ул. Ленина, 1","contact_phone":"+79991234567"}'
```
</details>

<details>
<summary><strong>🏪  As a seller — manage your shop</strong></summary>

```bash
# Register as seller
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"shop@example.com","username":"myshop","password":"secret123","role":"seller"}'

# Update shop profile
curl -X PUT http://localhost:8000/api/v1/seller/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"shop_name":"My Awesome Shop","shop_description":"Best products ever"}'

# Upload product image
curl -X POST http://localhost:8000/api/v1/seller/upload-image \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@product.jpg"

# Create a product
curl -X POST http://localhost:8000/api/v1/seller/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Cool Gadget","slug":"cool-gadget","price":1990,"stock":10,"category_id":1,"image":"/uploads/uuid.jpg"}'

# View seller dashboard
curl http://localhost:8000/api/v1/seller/dashboard \
  -H "Authorization: Bearer $TOKEN"
```
</details>

<details>
<summary><strong>🛡️  As an admin — manage the platform</strong></summary>

```bash
# Promote a user to admin (run from backend container)
docker compose exec backend python -c "
from app.core.database import SessionLocal
from app.modules.users.models import User, UserRole
db = SessionLocal()
user = db.query(User).filter(User.email == 'admin@example.com').first()
user.role = UserRole.ADMIN
db.commit()
"

# View all users (requires admin token)
curl http://localhost:8000/api/v1/admin/users \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Change user role
curl -X PATCH http://localhost:8000/api/v1/admin/users/3 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role":"seller"}'

# Create a category
curl -X POST http://localhost:8000/api/v1/admin/categories \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Electronics","slug":"electronics"}'

# Delete inappropriate product
curl -X DELETE http://localhost:8000/api/v1/admin/products/5 \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```
</details>

---

## 📁 Project Structure

```
marketplace-app/
├── backend/                        # FastAPI Python backend
│   ├── app/
│   │   ├── core/                   # Config, security, database setup
│   │   │   ├── config.py           # pydantic-settings (env vars)
│   │   │   ├── database.py         # SQLAlchemy engine + session
│   │   │   └── security.py         # JWT + bcrypt
│   │   ├── modules/                # Feature modules
│   │   │   ├── users/              # Auth, profiles, roles
│   │   │   ├── products/           # Catalog, categories
│   │   │   ├── cart/               # Shopping cart
│   │   │   ├── orders/             # Orders & statuses
│   │   │   ├── favorites/          # Wishlist
│   │   │   ├── seller/             # Seller panel API
│   │   │   └── admin/              # Admin panel API
│   │   └── main.py                 # FastAPI app entry point
│   ├── alembic/                    # Database migrations
│   ├── scripts/
│   │   └── seed.py                 # Demo data seeder
│   └── Dockerfile                  # uv‑based multi‑stage build
│
├── frontend/                       # React + Vite SPA
│   ├── src/
│   │   ├── components/             # Reusable UI (Header, ProductCard...)
│   │   ├── contexts/               # React context providers (Auth, Cart...)
│   │   ├── pages/                  # Route pages
│   │   │   ├── seller/             # Seller dashboard, products, orders
│   │   │   └── admin/              # Admin user/product/order management
│   │   ├── services/               # Axios API clients
│   │   ├── utils/                  # Token storage helpers
│   │   ├── App.jsx                 # Router + providers
│   │   └── main.jsx                # Entry point
│   └── Dockerfile                  # node + nginx multi‑stage build
│
├── docker-compose.yml              # Development stack
├── docker-compose.prod.yml         # Production stack
└── README.md                       # You are here 📍
```

### Module Convention

Each backend module follows a consistent pattern:

```
module/
├── __init__.py
├── models.py       # SQLAlchemy entity
├── schemas.py      # Pydantic DTOs (Create, Read, Update)
├── router.py       # FastAPI endpoints
├── service.py      # Business logic
├── dependencies.py # FastAPI Depends (permission checks)
└── exceptions.py   # Custom exceptions
```

---

## 🗺️ Roadmap

- [x] User authentication & JWT
- [x] Product catalog with search & filters
- [x] Category tree (parent / child)
- [x] Shopping cart
- [x] Favorites / wishlist
- [x] Order creation & status tracking
- [x] Three‑role system (buyer, seller, admin)
- [x] Seller dashboard & product management
- [x] Admin user & product moderation
- [x] Product image upload
- [ ] Email notifications (order confirmation, status changes)
- [ ] Stripe / payment integration
- [ ] Seller analytics (conversion, traffic)
- [ ] Product reviews & ratings
- [ ] Guest cart → user cart sync on login
- [ ] i18n (English / Russian)
- [ ] Docker Compose health checks & auto‑migration on startup

---

## 🤝 Contributing

Contributions are welcome and appreciated! Here's how to get started:

1. **Fork** the repo
2. **Create a branch** (`git checkout -b feature/amazing`)
3. **Make your changes**
4. **Run the tests**:
   ```bash
   docker compose exec backend pytest
   docker compose exec frontend npm run lint
   ```
5. **Commit** (`git commit -m 'Add amazing feature'`)
6. **Push** (`git push origin feature/amazing`)
7. **Open a Pull Request**

Please follow the existing code style and keep the layered architecture intact. If you're adding a new entity, create all five layers: model → schema → repository → service → endpoint.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">
  <p>
    Built with ❤️ by <strong>marketplace‑app</strong> contributors
  </p>
  <p>
    <a href="https://github.com/your-username/marketplace-app/issues">Report Bug</a>
    ·
    <a href="https://github.com/your-username/marketplace-app/issues">Request Feature</a>
    ·
    <a href="https://github.com/your-username/marketplace-app">GitHub</a>
  </p>
</div>