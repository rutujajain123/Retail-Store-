# Retail Store Application - Architecture Document

## Table of Contents
1. [Overview](#overview)
2. [Backend Architecture](#backend-architecture)
3. [Frontend Architecture](#frontend-architecture)
4. [Data Flow](#data-flow)
5. [Folder Structure](#folder-structure)
6. [Module Responsibilities](#module-responsibilities)

---

## Overview

The Retail Store application is a full-stack web application designed for managing and analyzing retail sales data. It provides a dashboard for viewing sales transactions, stores, products, customers, and orders with advanced filtering and aggregation capabilities.

**Tech Stack:**
- **Backend:** Node.js + Express.js
- **Frontend:** React 18 + Vite
- **Database:** SQLite 3 with WAL (Write-Ahead Logging)
- **API:** RESTful JSON API

---

## Backend Architecture

### 1. Technology Stack
- **Framework:** Express.js (lightweight, flexible HTTP server)
- **Database:** better-sqlite3 (synchronous, in-process SQLite)
- **Middleware:** CORS for cross-origin requests
- **Development:** Nodemon for auto-reload

### 2. Core Layers

#### a) **Server Layer** (`src/index.js`)
- Express app initialization
- CORS middleware setup
- Route mounting
- Server startup on port 4000
- Health check endpoint

#### b) **Routing Layer** (`src/routes/sales.js`)
- All API endpoints routed through `/api/sales`
- Request validation and parameter parsing
- Response formatting

#### c) **Database Layer** (`src/utils/db.js`)
- SQLite database initialization
- WAL pragma for concurrency
- Connection pooling and management
- Database path configuration via environment variables

#### d) **Data Ingestion Layer** (`src/utils/ingest.js`)
- CSV file parsing
- Table schema creation
- Bulk data insertion
- Data transformation (JSON serialization for tags)

### 3. API Endpoints

#### Dashboard / Sales Data
- **GET `/api/sales`** - Paginated, filtered sales transactions
  - Parameters: `page`, `pageSize`, `sort`, `search`, `regions`, `genders`, `categories`, `payments`, `tags`, `ageMin`, `ageMax`, `dateStart`, `dateEnd`
  - Returns: paginated data with metrics (totalQuantity, totalAmount, totalDiscount)

#### Metadata / Options
- **GET `/api/sales/meta`** - Filter options metadata
  - Returns: unique values for regions, genders, categories, payments, tags

#### Aggregated Views
- **GET `/api/sales/stores`** - Store-level aggregation
  - Grouped by: store_id, store_location
  - Metrics: transactions, totalQuantity, totalAmount, totalDiscount

- **GET `/api/sales/products`** - Product-level aggregation
  - Grouped by: product_id, product_name, brand, category
  - Metrics: transactions, totalQuantity, totalAmount, totalDiscount

- **GET `/api/sales/customers`** - Customer-level aggregation
  - Grouped by: customer_id, customer_name, gender, region, age
  - Metrics: orders, totalQuantity, totalAmount, totalDiscount

- **GET `/api/sales/orders`** - Flat order list (recent first)
  - Returns: transaction_id, date, customer, status, delivery, payment, store, amounts
  - Limit: 500 max (default 200)

#### System Health
- **GET `/health`** - Server health check
  - Returns: `{ status: 'ok' }`

### 4. Database Schema

```sql
CREATE TABLE sales (
  transaction_id TEXT PRIMARY KEY,
  date TEXT,
  customer_id TEXT,
  customer_name TEXT,
  phone_number TEXT,
  gender TEXT,
  age INTEGER,
  customer_region TEXT,
  customer_type TEXT,
  product_id TEXT,
  product_name TEXT,
  brand TEXT,
  product_category TEXT,
  tags TEXT,                -- JSON array stored as string
  quantity INTEGER,
  price_per_unit REAL,
  discount_percentage REAL,
  discount_amount REAL,     -- Calculated from discount_percentage and total_amount
  total_amount REAL,
  final_amount REAL,
  payment_method TEXT,
  order_status TEXT,
  delivery_type TEXT,
  store_id TEXT,
  store_location TEXT,
  salesperson_id TEXT,
  employee_name TEXT
);
```

### 5. Key Features
- **Parameterized Queries:** Protection against SQL injection
- **Dynamic Filter Building:** Flexible WHERE clause construction
- **Aggregation Queries:** Efficient GROUP BY operations
- **Transaction Support:** ACID compliance via SQLite
- **WAL Mode:** Enables concurrent reads with single writer

---

## Frontend Architecture

### 1. Technology Stack
- **Framework:** React 18 with Hooks
- **Build Tool:** Vite (fast bundler)
- **Styling:** CSS with component-scoped styles
- **State Management:** React hooks (useState, useEffect)

### 2. Core Components

#### a) **Main App Component** (`src/App.jsx`)
- Central component managing all state
- View routing (Dashboard, Stores, Products, Customers, Orders)
- Filter management
- Data fetching logic
- Render delegation to views

#### b) **State Management**
```javascript
// View state
activeView: 'dashboard' | 'stores' | 'products' | 'customers' | 'orders'

// Filter state
search, selectedRegion, selectedGender, selectedCategory, selectedPayment, 
selectedTag, selectedAgeRange, dateStart, dateEnd, sortBy, page

// Data state
rows, stores, products, customers, orders
total, totalPages, metrics, options, loading, error
```

#### c) **Views / Sections**

1. **Navigation Sidebar** (`side-nav`)
   - Brand logo
   - Navigation items with active state
   - Click handlers for view switching

2. **Top Bar** (`top-bar`)
   - Page title: "Transactions"
   - User profile pill

3. **Dashboard View** (activeView === 'dashboard')
   - Search toolbar
   - Filter dropdowns (Region, Gender, Category, Payment, Tags, Date, Sort)
   - Metrics cards (Total Units, Total Amount, Total Discount)
   - Paginated transactions table
   - Pagination controls

4. **Stores View** (activeView === 'stores')
   - Store aggregation table
   - Columns: Store ID, Location, Transactions, Units, Total Amount, Discount
   - Sorted by transaction count

5. **Products View** (activeView === 'products')
   - Product aggregation table
   - Columns: Product, Brand, Category, Transactions, Units, Total Amount
   - Sorted by unit quantity

6. **Customers View** (activeView === 'customers')
   - Customer aggregation table
   - Columns: Customer, Gender, Region, Age, Orders, Units, Total Amount
   - Sorted by order count

7. **Orders View** (activeView === 'orders')
   - Recent orders table
   - Columns: Transaction ID, Date, Customer, Status, Delivery, Payment, Store, Amounts
   - Latest 200 orders

### 3. Data Fetching Pattern

```javascript
useEffect(() => {
  if (activeView === 'dashboard') fetch('/api/sales?...')
  if (activeView === 'stores') fetch('/api/sales/stores')
  if (activeView === 'products') fetch('/api/sales/products')
  if (activeView === 'customers') fetch('/api/sales/customers')
  if (activeView === 'orders') fetch('/api/sales/orders')
}, [activeView, ...dependencies])
```

**Features:**
- AbortController for cancelling in-flight requests
- Error handling with user-friendly messages
- Loading state management
- Automatic dependency tracking

### 4. Styling Architecture

**Global Styles:**
- `index.css` - Base styles, colors, typography

**Component Styles:**
- `App.css` - All component-specific styles
- CSS class naming: BEM-like pattern (block__element--modifier)

**Key Classes:**
- `.app-shell` - Main layout container
- `.side-nav` - Sidebar navigation
- `.main-panel` - Main content area
- `.toolbar` - Search and filter section
- `.filters` - Filter dropdowns
- `.metrics` - KPI cards
- `.table-card` - Table container
- `.table-scroll` - Horizontal scroll wrapper
- `.pagination` - Page navigation

---

## Data Flow

### 1. User Interaction Flow

```
User clicks navigation item
  ↓
setActiveView() updates state
  ↓
useEffect triggered (activeView dependency)
  ↓
setLoading(true)
  ↓
Fetch appropriate API endpoint
  ↓
Parse response JSON
  ↓
Update state (setRows/setStores/etc)
  ↓
Component re-renders with new data
  ↓
setLoading(false), display table
```

### 2. Dashboard Filter Flow

```
User changes filter/search/sort
  ↓
Handler updates filter state (reset page to 1)
  ↓
useEffect triggered (filter dependency)
  ↓
Build URLSearchParams from filter state
  ↓
Fetch `/api/sales?params...`
  ↓
Backend constructs dynamic SQL WHERE clause
  ↓
Execute query with bound parameters
  ↓
Calculate metrics (SUM, COUNT)
  ↓
Return paginated results
  ↓
Frontend displays filtered data
```

### 3. Aggregation Data Flow

```
User navigates to Stores/Products/Customers/Orders
  ↓
activeView state changes
  ↓
useEffect calls appropriate fetch
  ↓
Backend executes GROUP BY query
  ↓
Aggregates metrics per group
  ↓
Returns flat array of grouped records
  ↓
Frontend renders aggregation table
```

### 4. CSV to Database Flow

```
CSV file exists at /data/truestate_assignment_dataset.csv
  ↓
npm run ingest
  ↓
Node.js reads file stream
  ↓
csv-parser parses each row
  ↓
Data transformation (tags JSON, discount_amount calculation)
  ↓
Prepared statement INSERT OR REPLACE
  ↓
Bulk insert into sales table
  ↓
Database indexed by transaction_id
```

---

## Folder Structure

```
Retail Store/
├── backend/
│   ├── src/
│   │   ├── index.js                 # Express server entry point
│   │   ├── controllers/             # (Reserved for business logic layer)
│   │   ├── models/                  # (Reserved for data models)
│   │   ├── routes/
│   │   │   └── sales.js            # All /api/sales endpoints
│   │   ├── services/                # (Reserved for service layer)
│   │   └── utils/
│   │       ├── db.js               # Database initialization & connection
│   │       └── ingest.js           # CSV data ingestion script
│   ├── data/
│   │   ├── retail.db               # SQLite database file
│   │   ├── retail.db-shm           # Shared memory (WAL)
│   │   ├── retail.db-wal           # Write-ahead log
│   │   └── truestate_assignment_dataset.csv  # Source data
│   ├── node_modules/               # Dependencies
│   ├── package.json                # Dependencies & scripts
│   ├── package-lock.json           # Locked versions
│   └── .env                        # Environment variables (optional)
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx               # React app entry point
│   │   ├── App.jsx                # Main app component (all views)
│   │   ├── App.css                # All component styles
│   │   ├── index.css              # Global styles
│   │   ├── assets/                # Static images, SVGs
│   │   ├── components/            # (Reserved for sub-components)
│   │   ├── hooks/                 # (Reserved for custom hooks)
│   │   ├── pages/                 # (Currently empty, could contain page-level components)
│   │   ├── services/              # (Reserved for API services)
│   │   ├── styles/                # (Reserved for additional stylesheets)
│   │   └── utils/                 # (Reserved for utility functions)
│   ├── public/
│   │   └── index.html             # HTML template
│   ├── node_modules/              # Dependencies
│   ├── package.json               # Dependencies & scripts
│   ├── package-lock.json          # Locked versions
│   ├── vite.config.js             # Vite configuration
│   ├── eslint.config.js           # ESLint rules
│   ├── index.html                 # Root HTML file
│   └── README.md                  # Frontend documentation
│
├── docs/
│   ├── architecture.md            # This file
│   └── (other documentation)
│
└── .git/                          # Git repository metadata
```

---

## Module Responsibilities

### Backend Modules

#### **src/index.js** (Server Bootstrap)
**Responsibility:**
- Initialize Express application
- Configure middleware (CORS, JSON parser)
- Mount route handlers
- Start HTTP server
- Define health check endpoint

**Key Functions:**
- Server startup and port binding
- Request/response middleware pipeline
- Global error handling setup

---

#### **src/routes/sales.js** (API Endpoints)
**Responsibility:**
- Define all `/api/sales/*` endpoints
- Handle request parsing and validation
- Delegate to database operations
- Format and return responses

**Endpoints Provided:**
1. `GET /meta` - Filter metadata
2. `GET /` - Paginated sales with filters
3. `GET /stores` - Store aggregations
4. `GET /products` - Product aggregations
5. `GET /customers` - Customer aggregations
6. `GET /orders` - Recent orders list

**Key Functions:**
- Dynamic SQL WHERE clause building
- Parameter binding and SQL injection prevention
- Aggregation queries with GROUP BY
- Pagination calculation (offset/limit)
- Metrics calculation (SUM, COUNT)

---

#### **src/utils/db.js** (Database Connection)
**Responsibility:**
- Create and manage SQLite database connection
- Configure database pragmas (WAL mode)
- Export singleton database instance
- Handle database initialization

**Key Features:**
- WAL (Write-Ahead Logging) for concurrent reads
- In-process database (no external server)
- Synchronous API with prepared statements
- Automatic connection lifecycle management

**Configuration:**
```javascript
- DB_PATH environment variable (defaults to /data/retail.db)
- WAL mode enabled for performance
- Prepared statements for safety
```

---

#### **src/utils/ingest.js** (Data Ingestion)
**Responsibility:**
- Read CSV data from file
- Create database schema
- Transform and validate data
- Populate initial database

**Key Functions:**
1. **Table Creation** - CREATE TABLE IF NOT EXISTS
2. **Data Parsing** - CSV to JavaScript objects
3. **Transformation:**
   - JSON stringification of tags
   - Discount amount calculation from percentage
   - Type coercion (string to number)
4. **Batch Insertion** - Efficient bulk insert
5. **Error Handling** - Row-level error reporting

**Data Mappings:**
- CSV headers mapped to database columns
- Tags split and converted to JSON
- Numeric fields coerced with null fallbacks
- Discount amount computed: `total_amount * (discount_percentage / 100)`

---

### Frontend Modules

#### **src/main.jsx** (React Entry Point)
**Responsibility:**
- Initialize React application
- Mount app to DOM root
- Wrap with StrictMode for dev checks

**Key Functions:**
- Root component rendering
- Development strict checks

---

#### **src/App.jsx** (Main Application Component)
**Responsibility:**
- Central state management for entire app
- View routing and switching
- Data fetching orchestration
- Render all UI components and tables

**State Categories:**

1. **View State:**
   - `activeView` - Current page (dashboard, stores, products, customers, orders)

2. **Filter State (Dashboard only):**
   - Search: `search`
   - Dropdowns: `selectedRegion`, `selectedGender`, `selectedCategory`, `selectedPayment`, `selectedTag`, `selectedAgeRange`
   - Date range: `dateStart`, `dateEnd`
   - Sorting: `sortBy`
   - Pagination: `page`

3. **Data State:**
   - Dashboard: `rows` (transactions), `total`, `totalPages`, `metrics`
   - Stores: `stores`
   - Products: `products`
   - Customers: `customers`
   - Orders: `orders`

4. **UI State:**
   - `loading` - Data fetch in progress
   - `error` - Error messages
   - `options` - Filter dropdown options (regions, genders, etc.)
   - `datePickerOpen` - Date range picker visibility

**Key Functions:**
- `useEffect` hooks for data fetching
- Dynamic URL parameter building
- View-based data fetching logic
- Filter change handlers with page reset
- Pagination handlers
- Error and loading state management

**Render Logic:**
- Navigation sidebar
- Top bar
- Conditional rendering per view:
  - Dashboard: Filters + Metrics + Transactions table
  - Stores: Stores aggregation table
  - Products: Products aggregation table
  - Customers: Customers aggregation table
  - Orders: Recent orders table

---

#### **src/App.css** (Styling)
**Responsibility:**
- Define all component visual styles
- Layout and responsive design
- Color scheme and typography
- Interactive element states

**Key Sections:**
1. **Layout Classes:**
   - `.app-shell` - Main flex container
   - `.side-nav` - Fixed sidebar
   - `.main-panel` - Scrollable main content

2. **Component Classes:**
   - `.top-bar` - Header section
   - `.toolbar` - Search box area
   - `.filters` - Filter dropdown section
   - `.metrics` - KPI cards
   - `.table-card` - Table container

3. **Table Classes:**
   - `.table-scroll` - Horizontal scroll wrapper
   - `table` - Standard table styles
   - `.empty-row` - No results message

4. **Interactive Classes:**
   - `.nav-item.active` - Current page indicator
   - `.pagination button` - Page navigation
   - `.filter-dropdown` - Dropdown styling

5. **Status Classes:**
   - `.status-pill` - Loading/count badges
   - `.error-banner` - Error messages
   - `.tag-badge` - Tag styling in tables

---

#### **src/index.css** (Global Styles)
**Responsibility:**
- Base/reset styles
- Root color variables
- Global typography
- Default element styling

**Provides:**
- CSS custom properties (--color-primary, etc.)
- Font stack definition
- Margin/padding resets
- Default link and button styles

---

## API Contract Summary

### Request/Response Examples

#### GET /api/sales/meta
```json
Response:
{
  "regions": ["North", "South", "East", "West"],
  "genders": ["Male", "Female"],
  "categories": ["Electronics", "Furniture", "Home & Office", "Stationery"],
  "payments": ["Credit Card", "Debit Card", "Cash"],
  "tags": ["tech;portable;computer", "comfort;ergonomic;office", ...]
}
```

#### GET /api/sales?page=1&pageSize=10&sort=dateDesc
```json
Response:
{
  "data": [
    {
      "transaction_id": "TXN001",
      "date": "2025-01-15",
      "customer_name": "John Smith",
      "quantity": 1,
      "total_amount": 89999,
      "tags": ["tech", "portable", "computer"],
      ...
    }
  ],
  "page": 1,
  "pageSize": 10,
  "total": 25,
  "totalPages": 3,
  "metrics": {
    "totalQuantity": 50,
    "totalAmount": 250000,
    "totalDiscount": 25000
  }
}
```

#### GET /api/sales/stores
```json
Response:
[
  {
    "store_id": "ST001",
    "store_location": "New York",
    "transactions": 8,
    "totalQuantity": 15,
    "totalAmount": 200000,
    "totalDiscount": 20000
  }
]
```

#### GET /api/sales/orders
```json
Response:
[
  {
    "transaction_id": "TXN025",
    "date": "2025-02-08",
    "customer_name": "Daniel Adams",
    "order_status": "Delivered",
    "delivery_type": "Standard",
    "payment_method": "Credit Card",
    "store_location": "New York",
    "total_amount": 1198,
    "discount_amount": 60,
    "final_amount": 1138.1
  }
]
```

---

## Performance Considerations

### Backend
- **Prepared Statements:** Prevent SQL injection and improve performance
- **WAL Mode:** Enables concurrent reads
- **Pagination:** Limits result set size
- **Aggregation:** Pushes computation to database

### Frontend
- **AbortController:** Cancel stale requests
- **Conditional Rendering:** Only render visible views
- **useEffect Dependencies:** Prevent unnecessary re-fetching
- **React.StrictMode:** Development-only checks

---

## Error Handling

### Backend
- Try/catch in ingest script
- HTTP status codes (200, 400, 500)
- JSON error responses

### Frontend
- Catch blocks on fetch promises
- User-friendly error messages
- Error banner display
- Loading state management

---

## Future Extensibility

### Planned Directories (Reserved)
- `backend/src/controllers/` - Business logic extraction
- `backend/src/services/` - API service layer
- `backend/src/models/` - Data model definitions
- `frontend/src/components/` - Reusable React components
- `frontend/src/hooks/` - Custom React hooks
- `frontend/src/services/` - API client services
- `frontend/src/utils/` - Helper functions

### Enhancement Opportunities
1. Extract view components from App.jsx
2. Create API service layer
3. Implement caching/memoization
4. Add user authentication
5. Create custom hooks (useFetch, useFilters)
6. Add more sophisticated error handling
7. Implement data export functionality
8. Add real-time updates (WebSockets)

---

## Summary

This architecture provides a clear separation of concerns between frontend and backend, with:
- **Backend:** Lightweight Express API with SQLite data persistence
- **Frontend:** React SPA with state-driven view switching
- **Data Flow:** Event-driven updates through filter changes and view navigation
- **Scalability:** Prepared for component extraction and service layer integration
- **Maintainability:** Organized folder structure with clear module responsibilities

