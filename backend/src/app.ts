import express from 'express';
import cors from 'cors';
import { loadState, saveState } from './dataStore.js';
import { buildChallanNumber, calculateTotals, canConfirmChallan, createChallanSnapshot } from './domain/challanLogic.js';
import type { Customer, Invoice, Product, PurchaseOrder, User } from './types.js';

const app = express();
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

const state = loadState();

function getUserByEmail(email: string): User | undefined {
  return state.users.find((user) => user.email === email);
}

function writeState() {
  saveState(state);
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = getUserByEmail(email);
  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  return res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

app.get('/customers', (_req, res) => {
  res.json(state.customers);
});

app.post('/customers', (req, res) => {
  const customer = req.body as Customer;
  const newCustomer: Customer = {
    ...customer,
    id: `c${Date.now()}`,
    followUps: customer.followUps ?? [],
    createdAt: new Date().toISOString()
  };
  state.customers.push(newCustomer);
  writeState();
  res.status(201).json(newCustomer);
});

app.put('/customers/:id', (req, res) => {
  const customer = state.customers.find((entry) => entry.id === req.params.id);
  if (!customer) {
    return res.status(404).json({ message: 'Customer not found.' });
  }

  const updatedCustomer = req.body as Partial<Customer>;
  Object.assign(customer, {
    ...customer,
    ...updatedCustomer,
    id: customer.id,
    followUps: customer.followUps,
    createdAt: customer.createdAt
  });
  writeState();
  return res.json(customer);
});

app.post('/customers/:id/follow-ups', (req, res) => {
  const customer = state.customers.find((entry) => entry.id === req.params.id);
  if (!customer) {
    return res.status(404).json({ message: 'Customer not found.' });
  }

  const note = req.body.note as string;
  if (!note) {
    return res.status(400).json({ message: 'Note is required.' });
  }

  customer.followUps.push({ id: `f${Date.now()}`, note, createdAt: new Date().toISOString() });
  writeState();
  return res.status(201).json(customer.followUps);
});

app.get('/products', (_req, res) => {
  res.json(state.products);
});

app.post('/products', (req, res) => {
  const product = req.body as Product;
  const newProduct: Product = {
    ...product,
    id: `p${Date.now()}`,
    createdAt: new Date().toISOString(),
    stockMovements: []
  };
  state.products.push(newProduct);
  writeState();
  res.status(201).json(newProduct);
});

app.put('/products/:id', (req, res) => {
  const product = state.products.find((entry) => entry.id === req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found.' });
  }

  const updatedProduct = req.body as Partial<Product>;
  Object.assign(product, {
    ...product,
    ...updatedProduct,
    id: product.id,
    createdAt: product.createdAt,
    stockMovements: product.stockMovements
  });
  writeState();
  return res.json(product);
});

app.post('/products/:id/stock-movements', (req, res) => {
  const product = state.products.find((entry) => entry.id === req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found.' });
  }

  const movement = req.body as { quantityChanged: number; movementType: 'IN' | 'OUT'; reason: string; createdBy: string };
  if (!movement.reason) {
    return res.status(400).json({ message: 'Reason is required.' });
  }

  if (movement.movementType === 'OUT' && product.currentStock < movement.quantityChanged) {
    return res.status(400).json({ message: 'Insufficient stock.' });
  }

  product.currentStock += movement.quantityChanged * (movement.movementType === 'OUT' ? -1 : 1);
  product.stockMovements.push({
    id: `m${Date.now()}`,
    productId: product.id,
    quantityChanged: movement.quantityChanged,
    movementType: movement.movementType,
    reason: movement.reason,
    createdBy: movement.createdBy,
    createdAt: new Date().toISOString()
  });
  writeState();
  return res.status(201).json(product);
});

app.get('/challans', (_req, res) => {
  res.json(state.challans);
});

app.get('/purchase-orders', (_req, res) => {
  res.json(state.purchaseOrders);
});

app.post('/purchase-orders', (req, res) => {
  const payload = req.body as Partial<PurchaseOrder>;
  const purchaseOrder: PurchaseOrder = {
    id: `po${Date.now()}`,
    poNumber: payload.poNumber || `PO-${Date.now()}`,
    supplierName: payload.supplierName || 'Unknown Supplier',
    items: payload.items || [],
    totalAmount: payload.totalAmount || 0,
    status: payload.status || 'Draft',
    createdBy: payload.createdBy || 'admin@example.com',
    createdAt: new Date().toISOString()
  };

  state.purchaseOrders.push(purchaseOrder);
  writeState();
  return res.status(201).json(purchaseOrder);
});

app.put('/purchase-orders/:id', (req, res) => {
  const purchaseOrder = state.purchaseOrders.find((entry) => entry.id === req.params.id);
  if (!purchaseOrder) {
    return res.status(404).json({ message: 'Purchase order not found.' });
  }

  Object.assign(purchaseOrder, req.body);
  writeState();
  return res.json(purchaseOrder);
});

app.get('/invoices', (_req, res) => {
  res.json(state.invoices);
});

app.post('/invoices', (req, res) => {
  const payload = req.body as Partial<Invoice>;
  const customer = state.customers.find((entry) => entry.id === payload.customerId);
  if (!customer) {
    return res.status(404).json({ message: 'Customer not found.' });
  }

  const invoice: Invoice = {
    id: `inv${Date.now()}`,
    invoiceNumber: payload.invoiceNumber || `INV-${Date.now()}`,
    customerId: customer.id,
    customerName: customer.name,
    challanId: payload.challanId,
    totalAmount: payload.totalAmount || 0,
    status: payload.status || 'Draft',
    dueDate: payload.dueDate || '',
    createdBy: payload.createdBy || 'admin@example.com',
    createdAt: new Date().toISOString()
  };

  state.invoices.push(invoice);
  writeState();
  return res.status(201).json(invoice);
});

app.put('/invoices/:id', (req, res) => {
  const invoice = state.invoices.find((entry) => entry.id === req.params.id);
  if (!invoice) {
    return res.status(404).json({ message: 'Invoice not found.' });
  }

  Object.assign(invoice, req.body);
  writeState();
  return res.json(invoice);
});

app.post('/challans', (req, res) => {
  const payload = req.body as {
    customerId: string;
    items: Array<{ productId: string; productName: string; sku: string; unitPrice: number; quantity: number }>;
    status: 'Draft' | 'Confirmed' | 'Cancelled';
    createdBy: string;
  };

  const customer = state.customers.find((entry) => entry.id === payload.customerId);
  if (!customer) {
    return res.status(404).json({ message: 'Customer not found.' });
  }

  const items = createChallanSnapshot(payload.items);
  const { totalQuantity, totalAmount } = calculateTotals(items);
  const challan = {
    id: `ch${Date.now()}`,
    challanNumber: buildChallanNumber(),
    customerId: customer.id,
    customerName: customer.name,
    items,
    totalQuantity,
    totalAmount,
    status: payload.status,
    createdBy: payload.createdBy,
    createdAt: new Date().toISOString()
  };

  if (payload.status === 'Confirmed') {
    const confirmation = canConfirmChallan(items, state.products);
    if (!confirmation.ok) {
      return res.status(400).json({ message: confirmation.error });
    }

    for (const item of items) {
      const product = state.products.find((entry) => entry.id === item.productId);
      if (product) {
        product.currentStock -= item.quantity;
      }
    }
  }

  state.challans.push(challan);
  writeState();
  return res.status(201).json(challan);
});

export default app;
