import pkg from 'pg';
import type { AppState, Customer, Product, Challan, PurchaseOrder, Invoice, User, StockMovement, FollowUpNote } from './types.js';

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function query(text: string, params?: unknown[]) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

export async function initDb(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, name TEXT, email TEXT UNIQUE, password TEXT, role TEXT
    );
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY, data JSONB NOT NULL
    );
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY, data JSONB NOT NULL
    );
    CREATE TABLE IF NOT EXISTS challans (
      id TEXT PRIMARY KEY, data JSONB NOT NULL
    );
    CREATE TABLE IF NOT EXISTS purchase_orders (
      id TEXT PRIMARY KEY, data JSONB NOT NULL
    );
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY, data JSONB NOT NULL
    );
  `);

  const { rowCount } = await query(`SELECT 1 FROM users LIMIT 1`);
  if (!rowCount) {
    await query(`
      INSERT INTO users (id, name, email, password, role) VALUES
      ('u1','Admin User','admin@example.com','password123','Admin'),
      ('u2','Sales User','sales@example.com','password123','Sales'),
      ('u3','Warehouse User','warehouse@example.com','password123','Warehouse'),
      ('u4','Accounts User','accounts@example.com','password123','Accounts')
      ON CONFLICT DO NOTHING;
    `);
    await query(`INSERT INTO customers (id, data) VALUES ('c1', $1) ON CONFLICT DO NOTHING`, [JSON.stringify({
      id: 'c1', name: 'Apex Traders', mobile: '9876543210', email: 'apex@demo.com',
      businessName: 'Apex Traders LLP', gstNumber: '27ABCDE1234F1Z5', customerType: 'Wholesale',
      address: 'Mumbai', status: 'Active', followUpDate: '2026-07-24',
      notes: 'Prefers delivery before 6 PM.',
      followUps: [{ id: 'f1', note: 'Discussed bulk order', createdAt: '2026-07-20T10:00:00.000Z' }],
      createdAt: '2026-07-20T10:00:00.000Z'
    })]);
    await query(`INSERT INTO products (id, data) VALUES ('p1', $1), ('p2', $2) ON CONFLICT DO NOTHING`, [
      JSON.stringify({ id: 'p1', name: 'Steel Chair', sku: 'ST-CHAIR-01', category: 'Furniture', unitPrice: 450, currentStock: 42, minimumStockAlert: 10, location: 'WH-1', createdAt: '2026-07-20T10:00:00.000Z', stockMovements: [] }),
      JSON.stringify({ id: 'p2', name: 'Office Desk', sku: 'OFF-DESK-01', category: 'Furniture', unitPrice: 1400, currentStock: 8, minimumStockAlert: 5, location: 'WH-2', createdAt: '2026-07-20T10:00:00.000Z', stockMovements: [] })
    ]);
  }
}

export async function getUsers(): Promise<User[]> {
  const { rows } = await query(`SELECT id, name, email, password, role FROM users`);
  return rows as User[];
}

export async function getAll<T>(table: string): Promise<T[]> {
  const { rows } = await query(`SELECT data FROM ${table} ORDER BY data->>'createdAt'`);
  return rows.map((r) => r.data as T);
}

export async function upsert(table: string, id: string, data: unknown): Promise<void> {
  await query(
    `INSERT INTO ${table} (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = $2`,
    [id, JSON.stringify(data)]
  );
}

export async function loadState(): Promise<AppState> {
  await initDb();
  const [users, customers, products, challans, purchaseOrders, invoices] = await Promise.all([
    getUsers(),
    getAll<Customer>('customers'),
    getAll<Product>('products'),
    getAll<Challan>('challans'),
    getAll<PurchaseOrder>('purchase_orders'),
    getAll<Invoice>('invoices')
  ]);
  return { users, customers, products, challans, purchaseOrders, invoices };
}
