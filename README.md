# ExpenseTracker

A full-stack personal finance web application for tracking, categorizing, and analyzing expenses. Built with Django REST Framework and React.

---

## Features

- **Authentication** — Register, login, and logout with email-based JWT authentication and automatic silent token refresh
- **Expense Management** — Create, edit, and delete expenses with categories, payment methods, descriptions, and dates
- **Filtering & Search** — Filter expenses by keyword, category, and date range with cursor-based pagination
- **Dashboard** — Overview of monthly totals, trend vs last month, monthly average, top category, and weekly spending
- **Expense Chart** — 30-day line chart showing daily spending with hover tooltips
- **Settings** — Update first name, last name, change password, and delete account

---

## Tech Stack

**Backend**
- Python / Django 5.2
- Django REST Framework
- SimpleJWT (JWT authentication with token rotation and blacklisting)
- django-filter (query parameter filtering)
- django-cors-headers
- SQLite (development)

**Frontend**
- React 18 (Vite)
- React Router v6
- Axios (HTTP client with request/response interceptors)
- Tailwind CSS
- shadcn/ui (component library)
- Recharts (line chart)

---

## Project Structure

```
ExpenseTracker/
├── backend/
│   ├── backend/
│   │   ├── settings.py
│   │   └── urls.py
│   ├── users/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── services.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── expenses/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── services.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── filters.py
│   │   └── pagination.py
│   ├── db.sqlite3
│   ├── manage.py
│   └── requirements.txt
└── frontend/
    └── src/
        ├── components/
        │   ├── ui/
        │   ├── Layout.jsx
        │   └── RequireAuth.jsx
        ├── lib/
        │   ├── api.js
        │   ├── useAuth.js
        │   ├── constants.js
        │   └── utils.js
        ├── pages/
        │   ├── DashboardPage.jsx
        │   ├── ExpensesPage.jsx
        │   ├── ExpenseFormPage.jsx
        │   ├── SettingsPage.jsx
        │   ├── LoginPage.jsx
        │   ├── RegisterPage.jsx
        │   └── NotFoundPage.jsx
        ├── styles/
        │   └── index.css
        ├── App.jsx
        └── main.jsx
```

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- pip

---

### Backend Setup

**1. Navigate to the backend directory:**
```bash
cd backend
```

**2. Create and activate a virtual environment:**
```bash
python -m venv venv

# Mac/Linux
source venv/bin/activate

# Windows
venv\Scripts\activate
```

**3. Install dependencies:**
```bash
pip install -r requirements.txt
```

**4. Create a `.env` file in the `backend/` directory:**
```env
DJANGO_SECRET_KEY=your-secret-key-here
DJANGO_DEBUG=true
ACCESS_TTL_MIN=30
REFRESH_TTL_DAYS=1
```

**5. Run migrations:**
```bash
python manage.py migrate
```

**6. Start the development server:**
```bash
python manage.py runserver
```

The backend will be running at `http://127.0.0.1:8000`

---

### Frontend Setup

**1. Navigate to the frontend directory:**
```bash
cd frontend
```

**2. Install dependencies:**
```bash
npm install
```

**3. Create a `.env` file in the `frontend/` directory:**
```env
VITE_API_URL=http://127.0.0.1:8000
```

**4. Start the development server:**
```bash
npm run dev
```

The frontend will be running at `http://localhost:5173`

---

## API Endpoints

### Users

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/users/register/` | Register a new user | No |
| POST | `/api/users/login/` | Login and receive tokens | No |
| POST | `/api/users/refresh/` | Refresh access token | No |
| POST | `/api/users/logout/` | Logout and blacklist token | Yes |
| GET | `/api/users/profile/` | Get current user profile | Yes |
| PATCH | `/api/users/profile/` | Update first/last name | Yes |
| DELETE | `/api/users/profile/` | Delete account | Yes |
| PUT | `/api/users/change-password/` | Change password | Yes |

### Expenses

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/expenses/` | List expenses (filtered, paginated) | Yes |
| POST | `/api/expenses/` | Create a new expense | Yes |
| GET | `/api/expenses/{id}/` | Retrieve a single expense | Yes |
| PUT | `/api/expenses/{id}/` | Update an expense | Yes |
| DELETE | `/api/expenses/{id}/` | Delete an expense | Yes |
| GET | `/api/expenses/recent/` | Get 5 most recent expenses | Yes |
| GET | `/api/expenses/dashboard/` | Get dashboard summary stats | Yes |
| GET | `/api/expenses/series/daily/?days=30` | Get daily expense totals | Yes |

### Expense Filter Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Search expense descriptions |
| `category` | string | Filter by category |
| `min_date` | date | Filter from date (YYYY-MM-DD) |
| `max_date` | date | Filter to date (YYYY-MM-DD) |

---

## Expense Categories

`GROCERIES` `UTILITIES` `ENTERTAINMENT` `TRANSPORTATION` `DINING_OUT` `HEALTHCARE` `HOUSING` `EDUCATION` `OTHER`

## Payment Methods

`DEBIT_CARD` `CREDIT_CARD` `CASH` `BANK_TRANSFER` `OTHER`

---

## Architecture Decisions

**Service Layer** — Business logic is separated into `services.py` files in both the `users` and `expenses` apps. Views handle HTTP concerns, serializers handle validation and data conversion, and services handle database operations and business logic.

**JWT Token Rotation** — Every token refresh issues a new refresh token and blacklists the old one. This means stolen refresh tokens are detected the next time the legitimate user refreshes — one party's refresh invalidates the other's.

**Cursor Pagination** — The expenses list uses cursor-based pagination instead of page-number pagination, which is more performant and stable for frequently updated datasets.

**Silent Token Refresh** — Axios response interceptors automatically detect expired access tokens (401 responses), silently refresh them using the refresh token, and retry the original request — all without the user seeing any interruption.

**Zero-fill Time Series** — The daily series endpoint fills in `$0.00` for days with no expenses, ensuring the chart always renders a continuous 30-day line rather than having gaps.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `DJANGO_SECRET_KEY` | `django-insecure-dev-key` | Django secret key |
| `DJANGO_DEBUG` | `true` | Debug mode |
| `ACCESS_TTL_MIN` | `30` | Access token lifetime in minutes |
| `REFRESH_TTL_DAYS` | `1` | Refresh token lifetime in days |

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend base URL e.g. `http://127.0.0.1:8000` |

---

## Notes

- This project is configured for development. Before deploying to production, tighten `ALLOWED_HOSTS`, set `CORS_ALLOW_ALL_ORIGINS = False`, use a production database (PostgreSQL), and set `DEBUG = False`.
- The database is SQLite for development. Switch to PostgreSQL for production by configuring the `DATABASES` setting and using the included `psycopg2-binary` driver.