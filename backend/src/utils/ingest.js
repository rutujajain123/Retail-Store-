import fs from 'fs'
import path from 'path'
import csv from 'csv-parser'
import { fileURLToPath } from 'url'
import db from './db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const csvPath =
  process.env.CSV_PATH || path.join(__dirname, '..', '..', 'data', 'truestate_assignment_dataset.csv')

const createTableSQL = `
CREATE TABLE IF NOT EXISTS sales (
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
  tags TEXT,
  quantity INTEGER,
  price_per_unit REAL,
  discount_percentage REAL,
  discount_amount REAL,
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
`

const insertSQL = `
INSERT OR REPLACE INTO sales (
  transaction_id, date, customer_id, customer_name, phone_number, gender, age,
  customer_region, customer_type, product_id, product_name, brand, product_category,
  tags, quantity, price_per_unit, discount_percentage, discount_amount, total_amount, final_amount,
  payment_method, order_status, delivery_type, store_id, store_location,
  salesperson_id, employee_name
) VALUES (
  @transaction_id, @date, @customer_id, @customer_name, @phone_number, @gender, @age,
  @customer_region, @customer_type, @product_id, @product_name, @brand, @product_category,
  @tags, @quantity, @price_per_unit, @discount_percentage, @discount_amount, @total_amount, @final_amount,
  @payment_method, @order_status, @delivery_type, @store_id, @store_location,
  @salesperson_id, @employee_name
);
`

const clearSQL = 'DELETE FROM sales'

const parseTags = (raw) => {
  if (!raw) return []
  return raw
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
}

const toNumber = (value) => {
  const n = Number(value)
  return Number.isNaN(n) ? null : n
}

const ingest = async () => {
  db.prepare(createTableSQL).run()
  db.prepare(clearSQL).run()
  const insertStmt = db.prepare(insertSQL)

  return new Promise((resolve, reject) => {
    let count = 0
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        try {
          const totalAmount = toNumber(row['Total Amount']) || 0
          const discountPercentage = toNumber(row['Discount Percentage']) || 0
          const discountAmount = totalAmount * (discountPercentage / 100)
          
          insertStmt.run({
            transaction_id: row['Transaction ID'],
            date: row['Date'],
            customer_id: row['Customer ID'],
            customer_name: row['Customer Name'],
            phone_number: row['Phone Number'],
            gender: row['Gender'],
            age: toNumber(row['Age']),
            customer_region: row['Customer Region'],
            customer_type: row['Customer Type'],
            product_id: row['Product ID'],
            product_name: row['Product Name'],
            brand: row['Brand'],
            product_category: row['Product Category'],
            tags: JSON.stringify(parseTags(row['Tags'])),
            quantity: toNumber(row['Quantity']) || 0,
            price_per_unit: toNumber(row['Price per Unit']) || 0,
            discount_percentage: discountPercentage,
            discount_amount: discountAmount,
            total_amount: totalAmount,
            final_amount: toNumber(row['Final Amount']) || 0,
            payment_method: row['Payment Method'],
            order_status: row['Order Status'],
            delivery_type: row['Delivery Type'],
            store_id: row['Store ID'],
            store_location: row['Store Location'],
            salesperson_id: row['Salesperson ID'],
            employee_name: row['Employee Name'],
          })
          count += 1
        } catch (err) {
          console.error('Failed to insert row', err)
        }
      })
      .on('end', () => {
        console.log(`Ingested ${count} rows into sales table`)
        resolve(count)
      })
      .on('error', (err) => {
        reject(err)
      })
  })
}

ingest()
  .then(() => {
    console.log('Ingestion completed')
    process.exit(0)
  })
  .catch((err) => {
    console.error('Ingestion failed', err)
    process.exit(1)
  })