import { useEffect, useState } from 'react'
import './App.css'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000'

const sortOptions = [
  { value: 'dateDesc', label: 'Date (Newest First)' },
  { value: 'quantity', label: 'Quantity' },
  { value: 'customerName', label: 'Customer Name (A–Z)' },
]

function App() {
  const [activeView, setActiveView] = useState('dashboard')
  const [search, setSearch] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedGender, setSelectedGender] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedPayment, setSelectedPayment] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [selectedAgeRange, setSelectedAgeRange] = useState('')
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [sortBy, setSortBy] = useState('dateDesc')
  const [page, setPage] = useState(1)
  const pageSize = 10

  const ageRanges = [
    { label: '0-10', min: 0, max: 10 },
    { label: '11-20', min: 11, max: 20 },
    { label: '21-30', min: 21, max: 30 },
    { label: '31-40', min: 31, max: 40 },
    { label: '41-50', min: 41, max: 50 },
    { label: '51-60', min: 51, max: 60 },
    { label: '61-70', min: 61, max: 70 },
    { label: '71-80', min: 71, max: 80 },
    { label: '81-90', min: 81, max: 90 },
    { label: '91-100', min: 91, max: 100 },
    { label: '101-110', min: 101, max: 110 },
    { label: '111-120', min: 111, max: 120 },
  ]

  const [options, setOptions] = useState({
    regions: [],
    genders: [],
    categories: [],
    payments: [],
    tags: [],
  })
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [metrics, setMetrics] = useState({
    totalQuantity: 0,
    totalAmount: 0,
    totalDiscount: 0,
  })
  const [stores, setStores] = useState([])
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [poppingRow, setPoppingRow] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    fetch(`${API_BASE}/api/sales/meta`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load filter options')
        return r.json()
      })
      .then((json) => {
        setOptions({
          regions: json.regions || [],
          genders: json.genders || [],
          categories: json.categories || [],
          payments: json.payments || [],
          tags: json.tags || [],
        })
      })
      .catch((err) => {
        if (err.name === 'AbortError') return
        console.error(err)
      })
    return () => controller.abort()
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')

    const params = new URLSearchParams()
    params.set('page', page.toString())
    params.set('pageSize', pageSize.toString())
    params.set('sort', sortBy)
    if (search.trim()) params.set('search', search.trim())
    if (selectedRegion) params.set('regions', selectedRegion)
    if (selectedGender) params.set('genders', selectedGender)
    if (selectedCategory) params.set('categories', selectedCategory)
    if (selectedPayment) params.set('payments', selectedPayment)
    if (selectedTag) params.set('tags', selectedTag)
    if (selectedAgeRange) {
      const selected = ageRanges.find(r => r.label === selectedAgeRange)
      if (selected) {
        params.set('ageMin', selected.min)
        params.set('ageMax', selected.max)
      }
    }
    if (dateStart) params.set('dateStart', dateStart)
    if (dateEnd) params.set('dateEnd', dateEnd)

    const fetchDashboard = () => fetch(`${API_BASE}/api/sales?${params.toString()}`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch sales data')
        return r.json()
      })
      .then((json) => {
        setRows(json.data || [])
        setTotal(json.total || 0)
        setTotalPages(json.totalPages || 1)
        setPage(Math.min(json.page || 1, json.totalPages || 1))
        setMetrics(json.metrics || { totalQuantity: 0, totalAmount: 0, totalDiscount: 0 })
      })

    const fetchStores = () => fetch(`${API_BASE}/api/sales/stores`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch stores data')
        return r.json()
      })
      .then(setStores)

    const fetchProducts = () => fetch(`${API_BASE}/api/sales/products`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch products data')
        return r.json()
      })
      .then(setProducts)

    const fetchCustomers = () => fetch(`${API_BASE}/api/sales/customers`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch customers data')
        return r.json()
      })
      .then(setCustomers)

    const fetchOrders = () => fetch(`${API_BASE}/api/sales/orders`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch orders data')
        return r.json()
      })
      .then(setOrders)

    const work = async () => {
      try {
        if (activeView === 'dashboard') await fetchDashboard()
        if (activeView === 'stores') await fetchStores()
        if (activeView === 'products') await fetchProducts()
        if (activeView === 'customers') await fetchCustomers()
        if (activeView === 'orders') await fetchOrders()
      } catch (err) {
        if (err.name === 'AbortError') return
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    work()

    return () => controller.abort()
  }, [activeView, search, selectedRegion, selectedGender, selectedCategory, selectedPayment, selectedTag, selectedAgeRange, dateStart, dateEnd, sortBy, page])

  const handlePageChange = (next) => {
    if (next < 1 || next > totalPages) return
    setPage(next)
  }

  const handleRowPop = (rowId) => {
    setPoppingRow(rowId)
    setTimeout(() => setPoppingRow(null), 800)
  }

  return (
    <div className="app-shell">
      <aside className="side-nav">
        <div className="brand">Retail Sales</div>
        <nav>
          <span className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveView('dashboard')}>Dashboard</span>
          <span className={`nav-item ${activeView === 'stores' ? 'active' : ''}`} onClick={() => setActiveView('stores')}>Stores</span>
          <span className={`nav-item ${activeView === 'products' ? 'active' : ''}`} onClick={() => setActiveView('products')}>Products</span>
          <span className={`nav-item ${activeView === 'customers' ? 'active' : ''}`} onClick={() => setActiveView('customers')}>Customers</span>
          <span className={`nav-item ${activeView === 'orders' ? 'active' : ''}`} onClick={() => setActiveView('orders')}>Orders</span>
        </nav>
      </aside>

      <main className="main-panel">
        <header className="top-bar">
          <div>
            <p className="eyebrow">Sales Management System</p>
            <h1 className="page-title">Transactions</h1>
          </div>
          <div className="user-pill">
            <div className="user-dot" />
            <div>
              <div className="user-name">Harish Pasupuleti</div>
              <div className="user-role">Admin</div>
            </div>
          </div>
        </header>

        <section className="toolbar">
          <div className="search-box">
            <input
              value={search}
              onChange={(e) => {
                setPage(1)
                setSearch(e.target.value)
              }}
              placeholder="Name, Phone no."
              aria-label="Search"
            />
          </div>
        </section>

        {activeView === 'dashboard' && (
        <section className="filters">
          <div className="filters-left">
            <div className="filter-dropdown">
              <label>Customer Region</label>
              <select value={selectedRegion} onChange={(e) => { setPage(1); setSelectedRegion(e.target.value) }}>
                <option value="">All Regions</option>
                {options.regions.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div className="filter-dropdown">
              <label>Gender</label>
              <select value={selectedGender} onChange={(e) => { setPage(1); setSelectedGender(e.target.value) }}>
                <option value="">All Genders</option>
                {options.genders.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <div className="filter-dropdown">
              <label>Age Range</label>
              <select value={selectedAgeRange} onChange={(e) => { setPage(1); setSelectedAgeRange(e.target.value) }}>
                <option value="">All Ages</option>
                {ageRanges.map((range) => (
                  <option key={range.label} value={range.label}>{range.label}</option>
                ))}
              </select>
            </div>

            <div className="filter-dropdown">
              <label>Product Category</label>
              <select value={selectedCategory} onChange={(e) => { setPage(1); setSelectedCategory(e.target.value) }}>
                <option value="">All Categories</option>
                {options.categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="filter-dropdown">
              <label>Tags</label>
              <select value={selectedTag} onChange={(e) => { setPage(1); setSelectedTag(e.target.value) }}>
                <option value="">All Tags</option>
                {options.tags.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="filter-dropdown">
              <label>Payment Method</label>
              <select value={selectedPayment} onChange={(e) => { setPage(1); setSelectedPayment(e.target.value) }}>
                <option value="">All Methods</option>
                {options.payments.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div className="filter-dropdown date-filter">
              <label>Date</label>
              <div className="date-display" onClick={() => setDatePickerOpen(!datePickerOpen)}>
                {!dateStart && !dateEnd && <span className="date-placeholder">Select dates</span>}
                {dateStart && <span>{dateStart}</span>}
                {dateStart && dateEnd && <span>–</span>}
                {dateEnd && <span>{dateEnd}</span>}
              </div>
              {datePickerOpen && (
                <div className="date-range-picker">
                  <input
                    type="date"
                    value={dateStart}
                    onChange={(e) => { setPage(1); setDateStart(e.target.value) }}
                    placeholder="Start"
                  />
                  <input
                    type="date"
                    value={dateEnd}
                    onChange={(e) => { setPage(1); setDateEnd(e.target.value) }}
                    placeholder="End"
                  />
                </div>
              )}
            </div>

            <div className="filter-dropdown">
              <label>Sort by</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </section>
        )}

        {activeView === 'dashboard' && (
        <section className="metrics">
          <div className="metric-card">
            <div className="metric-label">Total units sold</div>
            <div className="metric-value">{metrics.totalQuantity.toLocaleString()}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Total Amount</div>
            <div className="metric-value">₹{metrics.totalAmount.toLocaleString('en-IN')} ({total} SRs)</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Total Discount</div>
            <div className="metric-value">₹{metrics.totalDiscount.toLocaleString('en-IN')} ({total} SRs)</div>
          </div>
        </section>
        )}

        {activeView === 'dashboard' && (
        <section className="table-card">
          <div className="table-head">
            <div className="table-title">Full table view</div>
            <div className="status-pill">{total} results</div>
          </div>
          {error && <div className="error-banner">{error}</div>}
          {loading && <div className="status-pill">Loading...</div>}
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Date</th>
                  <th>Customer ID</th>
                  <th>Customer Name</th>
                  <th>Phone Number</th>
                  <th>Gender</th>
                  <th>Age</th>
                  <th>Product Category</th>
                  <th>Quantity</th>
                  <th>Total Amount</th>
                  <th>Region</th>
                  <th>Payment</th>
                  <th>Tags</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="empty-row">
                      No results. Adjust search or filters.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr 
                      key={row.transaction_id}
                      className={`row-pop-active ${poppingRow === row.transaction_id ? 'row-popping' : ''}`}
                      onClick={() => handleRowPop(row.transaction_id)}
                    >
                      <td>{row.transaction_id}</td>
                      <td>{row.date}</td>
                      <td>{row.customer_id}</td>
                      <td>{row.customer_name}</td>
                      <td>{row.phone_number}</td>
                      <td>{row.gender}</td>
                      <td>{row.age}</td>
                      <td>{row.product_category}</td>
                      <td>{row.quantity}</td>
                      <td>₹ {Number(row.total_amount || 0).toLocaleString('en-IN')}</td>
                      <td>{row.customer_region}</td>
                      <td>{row.payment_method}</td>
                      <td className="tag-cell">
                        {(row.tags || []).map((tag) => (
                          <span key={tag} className="tag-badge">
                            {tag}
                          </span>
                        ))}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <button onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
              Prev
            </button>
            <div className="page-numbers">
              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((p) => (
                <button
                  key={p}
                  className={p === page ? 'active' : ''}
                  onClick={() => handlePageChange(p)}
                >
                  {p}
                </button>
              ))}
            </div>
            <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}>
              Next
            </button>
          </div>
        </section>
        )}

        {activeView === 'stores' && (
          <section className="table-card">
            <div className="table-head">
              <div className="table-title">Stores overview</div>
              <div className="status-pill">{stores.length} stores</div>
            </div>
            {error && <div className="error-banner">{error}</div>}
            {loading && <div className="status-pill">Loading...</div>}
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Store ID</th>
                    <th>Location</th>
                    <th>Transactions</th>
                    <th>Units</th>
                    <th>Total Amount</th>
                    <th>Total Discount</th>
                  </tr>
                </thead>
                <tbody>
                  {stores.length === 0 ? (
                    <tr><td colSpan={6} className="empty-row">No store data</td></tr>
                  ) : (
                    stores.map((s) => (
                      <tr 
                        key={s.store_id}
                        className={`row-pop-active ${poppingRow === s.store_id ? 'row-popping' : ''}`}
                        onClick={() => handleRowPop(s.store_id)}
                      >
                        <td>{s.store_id}</td>
                        <td>{s.store_location}</td>
                        <td>{s.transactions}</td>
                        <td>{s.totalQuantity}</td>
                        <td>₹ {Number(s.totalAmount || 0).toLocaleString('en-IN')}</td>
                        <td>₹ {Number(s.totalDiscount || 0).toLocaleString('en-IN')}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeView === 'products' && (
          <section className="table-card">
            <div className="table-head">
              <div className="table-title">Products overview</div>
              <div className="status-pill">{products.length} products</div>
            </div>
            {error && <div className="error-banner">{error}</div>}
            {loading && <div className="status-pill">Loading...</div>}
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Brand</th>
                    <th>Category</th>
                    <th>Transactions</th>
                    <th>Units</th>
                    <th>Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr><td colSpan={6} className="empty-row">No product data</td></tr>
                  ) : (
                    products.map((p) => (
                      <tr 
                        key={p.product_id}
                        className={`row-pop-active ${poppingRow === p.product_id ? 'row-popping' : ''}`}
                        onClick={() => handleRowPop(p.product_id)}
                      >
                        <td>{p.product_name}</td>
                        <td>{p.brand}</td>
                        <td>{p.product_category}</td>
                        <td>{p.transactions}</td>
                        <td>{p.totalQuantity}</td>
                        <td>₹ {Number(p.totalAmount || 0).toLocaleString('en-IN')}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeView === 'customers' && (
          <section className="table-card">
            <div className="table-head">
              <div className="table-title">Customers overview</div>
              <div className="status-pill">{customers.length} customers</div>
            </div>
            {error && <div className="error-banner">{error}</div>}
            {loading && <div className="status-pill">Loading...</div>}
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Gender</th>
                    <th>Region</th>
                    <th>Age</th>
                    <th>Orders</th>
                    <th>Units</th>
                    <th>Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.length === 0 ? (
                    <tr><td colSpan={7} className="empty-row">No customer data</td></tr>
                  ) : (
                    customers.map((c) => (
                      <tr 
                        key={c.customer_id}
                        className={`row-pop-active ${poppingRow === c.customer_id ? 'row-popping' : ''}`}
                        onClick={() => handleRowPop(c.customer_id)}
                      >
                        <td>{c.customer_name}</td>
                        <td>{c.gender}</td>
                        <td>{c.customer_region}</td>
                        <td>{c.age}</td>
                        <td>{c.orders}</td>
                        <td>{c.totalQuantity}</td>
                        <td>₹ {Number(c.totalAmount || 0).toLocaleString('en-IN')}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeView === 'orders' && (
          <section className="table-card">
            <div className="table-head">
              <div className="table-title">Recent orders</div>
              <div className="status-pill">{orders.length} orders</div>
            </div>
            {error && <div className="error-banner">{error}</div>}
            {loading && <div className="status-pill">Loading...</div>}
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Transaction</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Delivery</th>
                    <th>Payment</th>
                    <th>Store</th>
                    <th>Total</th>
                    <th>Discount</th>
                    <th>Final</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr><td colSpan={10} className="empty-row">No orders</td></tr>
                  ) : (
                    orders.map((o) => (
                      <tr 
                        key={o.transaction_id}
                        className={`row-pop-active ${poppingRow === o.transaction_id ? 'row-popping' : ''}`}
                        onClick={() => handleRowPop(o.transaction_id)}
                      >
                        <td>{o.transaction_id}</td>
                        <td>{o.date}</td>
                        <td>{o.customer_name}</td>
                        <td>{o.order_status}</td>
                        <td>{o.delivery_type}</td>
                        <td>{o.payment_method}</td>
                        <td>{o.store_location}</td>
                        <td>₹ {Number(o.total_amount || 0).toLocaleString('en-IN')}</td>
                        <td>₹ {Number(o.discount_amount || 0).toLocaleString('en-IN')}</td>
                        <td>₹ {Number(o.final_amount || 0).toLocaleString('en-IN')}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

export default App
