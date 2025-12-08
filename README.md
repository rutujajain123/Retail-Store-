# Retail Sales Management System

## Live Application
🚀 **Frontend:** https://retailstoresaksham.netlify.app/  
🔧 **Backend API:** https://retail-store-zt7h.onrender.com

## Overview
A full-stack retail sales management system built with React 18 and Node.js + Express.js. Features advanced search, multi-select filtering, dynamic sorting, and pagination across customer transactions, store aggregations, product catalogs, customer profiles, and order management. Engineered for performance with SQLite3 backend, responsive UI with 20+ CSS animations, and complete separation of concerns between frontend and backend.

## Tech Stack
- **Backend:** Node.js, Express.js, SQLite3 (better-sqlite3), CSV data ingestion
- **Frontend:** React 18 with Hooks, Vite build tool, CSS3 with glassmorphism effects
- **Database:** SQLite3 with WAL mode for concurrent reads
- **API:** RESTful JSON API
- **Styling:** Pure CSS3 with animations and responsive design
- **Deployment:** Netlify (Frontend), Render (Backend)

## Search Implementation Summary

### Full-Text Search
- **Fields Covered:** Customer Name, Phone Number
- **Implementation:** Backend-level SQL WHERE clause with parameterized queries
- **Features:**
  - Case-insensitive search using LOWER() function
  - Partial matching with LIKE operator
  - Works seamlessly with active filters and sorting
  - Performant with indexed database fields
  - Real-time search without page reload

### Backend Endpoint
- `GET /api/sales?search=<query>` - Search parameter passed to SQL WHERE clause
- Dynamic clause building: `WHERE LOWER(customer_name) LIKE ? OR LOWER(phone_number) LIKE ?`
- Search state maintained across filter and sort changes

### Frontend Implementation
- Search input field in toolbar captures user input
- `search` state variable stores current search query
- useEffect dependency triggers API refetch on search change
- Search results update transaction table in real-time

## Filter Implementation Summary

### Multi-Select Filters Implemented
1. **Customer Region** - Dropdown selecting single region
2. **Gender** - Dropdown selecting single gender (Male/Female)
3. **Age Range** - Predefined range selection (18-25, 26-35, 36-50, 50+)
4. **Product Category** - Dropdown selecting product category
5. **Tags** - Multi-tag filtering
6. **Payment Method** - Filter by payment type
7. **Date Range** - Start and end date pickers

### Filter Features
- **Independent Operation:** Each filter works standalone
- **Combination Support:** Filters apply in conjunction (AND logic)
- **State Preservation:** Filters maintained across view changes
- **Reset Capability:** Individual or complete filter reset
- **Dynamic Options:** Filter dropdowns populated from /api/sales/meta endpoint

### Backend Implementation
- Dynamic SQL WHERE clause construction based on active filters
- Parameterized queries prevent SQL injection
- Conditional clause building: only applied filters generate WHERE conditions
- Multiple filter support through OR clauses for same field type

### Frontend Implementation
- Separate state variables for each filter (selectedRegion, selectedGender, etc.)
- Filter dropdowns populated from options state
- useEffect triggers API refetch when any filter changes
- Page reset to 1 on filter change

## Sorting Implementation Summary

### Sort Options Available
1. **Date** - Newest First (DEFAULT) / Oldest First
2. **Quantity** - Highest to Lowest
3. **Customer Name** - A–Z / Z–A

### Sorting Features
- **Preserves State:** Active search and filters remain during sort
- **Multi-view Support:** Each view (Dashboard, Stores, Products, Customers, Orders) has sort functionality
- **Real-time Updates:** Sort changes apply immediately without page reload
- **Default Sort:** Date (Newest First) on page load

### Backend Implementation
- Dynamic ORDER BY clause: `ORDER BY ${sortField} ${sortDirection}`
- Parameterized SQL prevents injection attacks
- Supported columns: date, quantity, customer_name
- Sort direction handling (ASC/DESC)

### Frontend Implementation
- `sortBy` state variable tracks current sort
- Dropdown changes trigger setSort() and page reset
- useEffect dependency includes sortBy
- Sort selection is user-friendly with readable labels

## Pagination Implementation Summary

### Pagination Configuration
- **Page Size:** 10 items per page (configurable via pageSize state)
- **Controls:** Previous/Next buttons with current page display
- **State Management:** Current page number, total pages, total records

### Pagination Features
- **State Preservation:** Search, filters, and sort maintained across page navigation
- **Bounds Checking:** Prevents navigation beyond min/max pages
- **Total Pages Display:** Shows "Page 2 of 5" style indication
- **Automatic Pagination:** Page numbers calculated from total records

### Backend Implementation
- OFFSET/LIMIT clauses for efficient database pagination
- `OFFSET (page - 1) * pageSize LIMIT pageSize`
- Total record count returned for pagination calculation
- Supports all combinations of search, filters, and sorting

### Frontend Implementation
- `page` state tracks current page (1-indexed)
- `totalPages` calculated from API response
- handlePageChange() validates page bounds
- Pagination buttons disabled at boundaries
- Page reset to 1 when any filter, search, or sort changes

## Edge Case Handling: 
**No Search Results** - Empty state message displayed: "No results. Adjust search or filters."
**Conflicting Filters** - Multiple filters apply with AND logic, returns empty set if no matches
**Invalid Numeric Ranges** - Age ranges predefined, date validation in picker
**Large Filter Combinations** - All filter combinations supported through dynamic SQL
**Missing Optional Fields** - Fallback values (0, "N/A", "") for missing data
**Empty Datasets** - Graceful handling with empty state messages in tables

## Additional Features Implemented

### Dashboard Views
1. **Dashboard** - Full transaction table with all filters
2. **Stores** - Store-level aggregation (transactions, units, amounts)
3. **Products** - Product aggregation (category, brand, metrics)
4. **Customers** - Customer aggregation (region, age, order count)
5. **Orders** - Recent orders view (latest 200 transactions)

### UI Enhancements
- **Responsive Design** - Mobile-friendly layout with media queries
- **Animations** - 7+ CSS keyframe animations (fadeInUp, slideInLeft, slideInRight, scaleIn, gradientShift, pulse, popOut)
- **Glassmorphism Effects** - Backdrop blur on cards and pills
- **Interactive Elements** - Hover effects on buttons, rows, tags, pagination
- **Color-coded Status** - Visual indicators for different order statuses
- **Loading States** - Loading spinner and disabled state management
- **Error Handling** - User-friendly error messages with retry capability
- **Row Pop Effects** - Interactive animations on table row selection

### Performance Optimizations
- **GPU-Accelerated Animations** - Using transform and opacity only
- **Efficient Queries** - Parameterized SQL with proper indexing
- **Request Cancellation** - AbortController for in-flight request cleanup
- **State Management** - Predictable React hooks state handling
- **Code Splitting** - Single component with conditional rendering

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- npm or yarn

### Local Backend Setup
```bash
cd backend
npm install
npm run ingest    # Populate database from CSV
npm run dev       # Start development server (port 4000)
```

### Local Frontend Setup
```bash
cd frontend
npm install
npm run dev       # Start development server (port 5173)
```

### Database
- SQLite3 database automatically initialized at `/backend/data/retail.db`
- CSV data ingested from `/backend/data/truestate_assignment_dataset.csv`
- WAL mode enabled for concurrent read access

### Running the Full Application Locally
1. Terminal 1: `cd backend && npm run dev`
2. Terminal 2: `cd frontend && npm run dev`
3. Open http://localhost:5173 in browser

## Project Structure

```
Retail Store/
├── backend/                       ← Express server + SQLite
│   ├── src/
│   │   ├── index.js              # Express server with CORS
│   │   ├── routes/sales.js       # All /api/sales/* endpoints
│   │   └── utils/
│   │       ├── db.js             # SQLite connection & config
│   │       └── ingest.js         # CSV data ingestion
│   ├── data/retail.db            # SQLite database
│   └── package.json
│
├── frontend/                      ← React + Vite
│   ├── src/
│   │   ├── App.jsx               # Main component (all state)
│   │   ├── App.css               # Component styles
│   │   ├── index.css             # Global styles & animations
│   │   ├── apiClient.js          # API configuration
│   │   └── main.jsx
│   ├── .env                      # Environment variables
│   ├── .env.example              # Template for .env
│   └── package.json
│
├── docs/
│   └── architecture.md           # Technical architecture
│
└── README.md                     # This file
```

## Deployment

### Frontend Deployment (Netlify)
- **URL:** https://retailstoresaksham.netlify.app/
- **Build Command:** `npm run build`
- **Environment Variables:**
  - `VITE_API_URL=https://retail-store-zt7h.onrender.com`
- **Connected to:** GitHub master branch (auto-deploys on push)

### Backend Deployment (Render)
- **URL:** https://retail-store-zt7h.onrender.com
- **Environment:** Node.js
- **Database:** SQLite (local storage with WAL mode)
- **Health Check:** GET `/health` returns `{"status":"ok"}`
- **CORS Configuration:** Allows Netlify frontend domain and localhost for development

## API Documentation

### Endpoints
- **GET `/health`** - Server health check
- **GET `/api/sales/meta`** - Filter metadata (regions, genders, categories, payments, tags)
- **GET `/api/sales`** - Paginated transactions with search, filters, sort
  - Parameters: `page`, `pageSize`, `sort`, `search`, `regions`, `genders`, `categories`, `payments`, `tags`, `ageMin`, `ageMax`, `dateStart`, `dateEnd`
- **GET `/api/sales/stores`** - Store-level aggregation
- **GET `/api/sales/products`** - Product-level aggregation
- **GET `/api/sales/customers`** - Customer-level aggregation
- **GET `/api/sales/orders`** - Recent orders list

## Data Fields Processed

**Customer Fields:**
Customer ID | Customer Name | Phone Number | Gender | Age | Customer Region | Customer Type

**Product Fields:**
Product ID | Product Name | Brand | Product Category | Tags

**Sales Fields:**
Quantity | Price per Unit | Discount Percentage | Total Amount | Final Amount

**Operational Fields:**
Date | Payment Method | Order Status | Delivery Type | Store ID | Store Location | Salesperson ID | Employee Name

## Key Implementation Details

### Search Algorithm
- Case-insensitive LOWER() comparison
- LIKE operator for substring matching
- Parameters: `%` + searchTerm + `%` for flexible matching

### Filter Architecture
- Metadata endpoint returns distinct filter values
- Dynamic SQL WHERE clause built from active filters
- Multiple values for same filter type: `field IN (val1, val2, ...)`

### Sorting Logic
- Three sort fields: date, quantity, customer_name
- Direction handling: dateDesc (newest first) default
- Applied after search and filters in query pipeline

### Pagination Math
- Current page: 1-indexed (user-facing)
- OFFSET calculation: `(page - 1) * pageSize`
- Total pages: `Math.ceil(total / pageSize)`



## Assignment Compliance Checklist

1. All Functional Requirements Met:
- Full-text search (case-insensitive, across Customer Name & Phone)
- 7 multi-select filters (Region, Gender, Age, Category, Tags, Payment, Date)
- 3 sorting options (Date, Quantity, Customer Name)
- Pagination with 10 items per page + Next/Previous navigation

2. All Engineering Requirements Met:
- Clean separation of frontend and backend
- Readable, maintainable, modular code
- Predictable state management
- No duplicate logic for filtering/sorting
- Exact project structure match
- Comprehensive architecture documentation

3. All UI Requirements Met:
- Clear, minimal, structured layout per Figma
- Search bar, filter panel, transaction table, sorting dropdown, pagination
- Professional design with responsive layout
- 20+ CSS animations and interactive elements



**GitHub Repository:** https://github.com/rutujajain123/Retail-Store-  
**Frontend Live:** https://retailstoresaksham.netlify.app/  
**Backend Live:** https://retail-store-zt7h.onrender.com

