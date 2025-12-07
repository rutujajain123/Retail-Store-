import express from 'express'
import db from '../utils/db.js'

const router = express.Router()

const SORT_MAP = {
  dateDesc: 'date DESC',
  quantity: 'quantity DESC',
  customerName: 'customer_name ASC',
}

const parseList = (value) => {
  if (!value) return []
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
}

router.get('/meta', (_req, res) => {
  const list = (sql) => db.prepare(sql).all().map((r) => r.value).filter(Boolean)

  const regions = list('SELECT DISTINCT customer_region as value FROM sales WHERE customer_region IS NOT NULL')
  const genders = list('SELECT DISTINCT gender as value FROM sales WHERE gender IS NOT NULL')
  const categories = list(
    'SELECT DISTINCT product_category as value FROM sales WHERE product_category IS NOT NULL',
  )
  const payments = list('SELECT DISTINCT payment_method as value FROM sales WHERE payment_method IS NOT NULL')

  const tagsRows = db.prepare('SELECT DISTINCT value as tag FROM sales, json_each(tags)').all()
  const tags = tagsRows.map((r) => r.tag).filter(Boolean)

  res.json({ regions, genders, categories, payments, tags })
})

// Aggregated view: stores
router.get('/stores', (_req, res) => {
  const rows = db.prepare(`
    SELECT 
      store_id,
      store_location,
      COUNT(*) as transactions,
      SUM(quantity) as totalQuantity,
      SUM(total_amount) as totalAmount,
      SUM(discount_amount) as totalDiscount
    FROM sales
    GROUP BY store_id, store_location
    ORDER BY transactions DESC
  `).all()

  res.json(rows)
})

// Aggregated view: products
router.get('/products', (_req, res) => {
  const rows = db.prepare(`
    SELECT 
      product_id,
      product_name,
      brand,
      product_category,
      SUM(quantity) as totalQuantity,
      SUM(total_amount) as totalAmount,
      SUM(discount_amount) as totalDiscount,
      COUNT(*) as transactions
    FROM sales
    GROUP BY product_id, product_name, brand, product_category
    ORDER BY totalQuantity DESC
  `).all()

  res.json(rows)
})

// Aggregated view: customers
router.get('/customers', (_req, res) => {
  const rows = db.prepare(`
    SELECT 
      customer_id,
      customer_name,
      gender,
      customer_region,
      age,
      COUNT(*) as orders,
      SUM(total_amount) as totalAmount,
      SUM(discount_amount) as totalDiscount,
      SUM(quantity) as totalQuantity
    FROM sales
    GROUP BY customer_id, customer_name, gender, customer_region, age
    ORDER BY orders DESC
  `).all()

  res.json(rows)
})

// Flat view: recent orders
router.get('/orders', (req, res) => {
  const limit = Math.min(500, parseInt(req.query.limit ?? '200', 10) || 200)

  const rows = db.prepare(`
    SELECT 
      transaction_id,
      date,
      customer_name,
      order_status,
      delivery_type,
      payment_method,
      store_location,
      total_amount,
      discount_amount,
      final_amount
    FROM sales
    ORDER BY date DESC
    LIMIT @limit
  `).all({ limit })

  res.json(rows)
})

router.get('/', (req, res) => {
  const {
    search = '',
    regions,
    genders,
    categories,
    payments,
    tags,
    ageMin,
    ageMax,
    dateStart,
    dateEnd,
    sort = 'dateDesc',
    page = '1',
    pageSize = '10',
  } = req.query

  const filters = []
  const params = {}

  const pageNum = Math.max(1, parseInt(page, 10) || 1)
  const sizeNum = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 10))

  if (search.trim()) {
    filters.push('(LOWER(customer_name) LIKE @search OR LOWER(phone_number) LIKE @search)')
    params.search = `%${search.trim().toLowerCase()}%`
  }

  const regionList = parseList(regions)
  if (regionList.length) {
    filters.push(`customer_region IN (${regionList.map((_, i) => `@r${i}`).join(',')})`)
    regionList.forEach((val, i) => {
      params[`r${i}`] = val
    })
  }

  const genderList = parseList(genders)
  if (genderList.length) {
    filters.push(`gender IN (${genderList.map((_, i) => `@g${i}`).join(',')})`)
    genderList.forEach((val, i) => {
      params[`g${i}`] = val
    })
  }

  const categoryList = parseList(categories)
  if (categoryList.length) {
    filters.push(`product_category IN (${categoryList.map((_, i) => `@c${i}`).join(',')})`)
    categoryList.forEach((val, i) => {
      params[`c${i}`] = val
    })
  }

  const paymentList = parseList(payments)
  if (paymentList.length) {
    filters.push(`payment_method IN (${paymentList.map((_, i) => `@p${i}`).join(',')})`)
    paymentList.forEach((val, i) => {
      params[`p${i}`] = val
    })
  }

  const tagList = parseList(tags)
  if (tagList.length) {
    tagList.forEach((tag, i) => {
      filters.push(`tags LIKE @t${i}`)
      params[`t${i}`] = `%"${tag}"%`
    })
  }

  if (ageMin) {
    filters.push('age >= @ageMin')
    params.ageMin = Number(ageMin)
  }

  if (ageMax) {
    filters.push('age <= @ageMax')
    params.ageMax = Number(ageMax)
  }

  if (dateStart) {
    filters.push('date >= @dateStart')
    params.dateStart = dateStart
  }

  if (dateEnd) {
    filters.push('date <= @dateEnd')
    params.dateEnd = dateEnd
  }

  const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : ''
  const orderBy = SORT_MAP[sort] || SORT_MAP.dateDesc
  const offset = (pageNum - 1) * sizeNum

  const countStmt = db.prepare(`SELECT COUNT(*) as count FROM sales ${whereClause}`)
  const total = countStmt.get(params).count

  // Get metrics
  const metricsStmt = db.prepare(`
    SELECT 
      SUM(quantity) as totalQuantity,
      SUM(total_amount) as totalAmount,
      SUM(discount_amount) as totalDiscount
    FROM sales ${whereClause}
  `)
  const metrics = metricsStmt.get(params)

  const queryStmt = db.prepare(
    `SELECT * FROM sales ${whereClause} ORDER BY ${orderBy} LIMIT @limit OFFSET @offset`,
  )

  const rows = queryStmt.all({ ...params, limit: sizeNum, offset })

  // convert tags back to array
  const data = rows.map((row) => ({
    ...row,
    tags: row.tags ? JSON.parse(row.tags) : [],
  }))

  res.json({
    data,
    page: pageNum,
    pageSize: sizeNum,
    total,
    totalPages: Math.max(1, Math.ceil(total / sizeNum)),
    metrics: {
      totalQuantity: metrics.totalQuantity || 0,
      totalAmount: metrics.totalAmount || 0,
      totalDiscount: metrics.totalDiscount || 0,
    },
  })
})

export default router
