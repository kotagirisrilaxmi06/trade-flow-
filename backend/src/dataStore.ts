import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AppState } from './types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isVercel = process.env.VERCEL === '1';
const dataDirectory = path.resolve(
  process.env.DATA_DIRECTORY || (isVercel ? '/tmp' : path.join(__dirname, '..', 'data'))
);
const dataFilePath = path.resolve(
  process.env.DATA_FILE_PATH || path.join(dataDirectory, 'app-data.json')
);

const seedState: AppState = {
  users: [
    { id: 'u1', name: 'Admin User', email: 'admin@example.com', password: 'password123', role: 'Admin' },
    { id: 'u2', name: 'Sales User', email: 'sales@example.com', password: 'password123', role: 'Sales' },
    { id: 'u3', name: 'Warehouse User', email: 'warehouse@example.com', password: 'password123', role: 'Warehouse' },
    { id: 'u4', name: 'Accounts User', email: 'accounts@example.com', password: 'password123', role: 'Accounts' }
  ],
  customers: [
    {
      id: 'c1',
      name: 'Apex Traders',
      mobile: '9876543210',
      email: 'apex@demo.com',
      businessName: 'Apex Traders LLP',
      gstNumber: '27ABCDE1234F1Z5',
      customerType: 'Wholesale',
      address: 'Mumbai',
      status: 'Active',
      followUpDate: '2026-07-24',
      notes: 'Prefers delivery before 6 PM.',
      followUps: [{ id: 'f1', note: 'Discussed bulk order', createdAt: '2026-07-20T10:00:00.000Z' }],
      createdAt: '2026-07-20T10:00:00.000Z'
    }
  ],
  products: [
    {
      id: 'p1',
      name: 'Steel Chair',
      sku: 'ST-CHAIR-01',
      category: 'Furniture',
      unitPrice: 450,
      currentStock: 42,
      minimumStockAlert: 10,
      location: 'WH-1',
      createdAt: '2026-07-20T10:00:00.000Z',
      stockMovements: []
    },
    {
      id: 'p2',
      name: 'Office Desk',
      sku: 'OFF-DESK-01',
      category: 'Furniture',
      unitPrice: 1400,
      currentStock: 8,
      minimumStockAlert: 5,
      location: 'WH-2',
      createdAt: '2026-07-20T10:00:00.000Z',
      stockMovements: []
    }
  ],
  challans: [],
  purchaseOrders: [],
  invoices: []
};

export function loadState(): AppState {
  if (!existsSync(dataFilePath)) {
    saveState(seedState);
    return seedState;
  }

  const content = readFileSync(dataFilePath, 'utf8');
  return JSON.parse(content) as AppState;
}

export function saveState(state: AppState): void {
  mkdirSync(dataDirectory, { recursive: true });
  writeFileSync(dataFilePath, JSON.stringify(state, null, 2));
}
