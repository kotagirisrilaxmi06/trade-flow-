import express from 'express';
import cors from 'cors';
import { initDb, getUsers, getAll, upsert } from './dataStore.js';
import { buildChallanNumber, calculateTotals, canConfirmChallan, createChallanSnapshot } from './domain/challanLogic.js';
import type { Customer, Invoice, Product, PurchaseOrder, User } from './types.js';

const app = express();
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',').map((o) => o.trim()).filter(Boolean);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Initialize DB on startup
initDb().catch(console.error);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });
  const users = await getUsers();
  const user = users.find((u: User) => u.email === email);
  if (!user || user.password !== password) return res.status(401).json({ message: 'Invalid credentials.' });
  return res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

app.get('/customers', async (_req, res) => {
  res.json(await getAll<Customer>('customers'));
});

app.post('/customers', async (req, res) => {
  const customer = req.body as Customer;
  const newCustomer: Customer = { ...customer, id: `c${Date.now()}`, followUps: customer.followUps ?? [], createdAt: new Date().toISOString() };
  await upsert('customers', newCustomer.id, newCustomer);
  res.status(201).json(newCustomer);
});

app.put('/customers/:id', async (req, res) => {
  const customers = await getAll<Customer>('customers');
  const customer = customers.find((c) => c.id === req.params.id);
  if (!customer) return res.status(404).json({ message: 'Customer not found.' });
  const updated = { ...customer, ...req.body as Partial<Customer>, id: customer.id, followUps: customer.followUps, createdAt: customer.createdAt };
  await upsert('customers', updated.id, updated);
  return res.json(updated);
});

app.post('/customers/:id/follow-ups', async (req, res) => {
  const customers = await getAll<Customer>('customers');
  const customer = customers.find((c) => c.id === req.params.id);
  if (!customer) return res.status(404).json({ message: 'Customer not found.' });
  const note = req.body.note as string;
  if (!note) return res.status(400).json({ message: 'Note is required.' });
  customer.followUps.push({ id: `f${Date.now()}`, note, createdAt: new Date().toISOString() });
  await upsert('customers', customer.id, customer);
  return res.status(201).json(customer.followUps);
});

app.get('/products', async (_req, res) => {
  res.json(await getAll<Product>('products'));
});

app.post('/products', async (req, res) => {
  const product = req.body as Product;
  const newProduct: Product = { ...product, id: `p${Date.now()}`, createdAt: new Date().toISOString(), stockMovements: [] };
  await upsert('products', newProduct.id, newProduct);
  res.status(201).json(newProduct);
});

app.put('/products/:id', async (req, res) => {
  const products = await getAll<Product>('products');
  const product = products.find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found.' });
  const updated = { ...product, ...req.body as Partial<Product>, id: product.id, createdAt: product.createdAt, stockMovements: product.stockMovements };
  await upsert('products', updated.id, updated);
  return res.json(updated);
});

app.post('/products/:id/stock-movements', async (req, res) => {
  const products = await getAll<Product>('products');
  const product = products.find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found.' });
  const movement = req.body as { quantityChanged: number; movementType: 'IN' | 'OUT'; reason: string; createdBy: string };
  if (!movement.reason) return res.status(400).json({ message: 'Reason is required.' });
  if (movement.movementType === 'OUT' && product.currentStock < movement.quantityChanged)
    return res.status(400).json({ message: 'Insufficient stock.' });
  product.currentStock += movement.quantityChanged * (movement.movementType === 'OUT' ? -1 : 1);
  product.stockMovements.push({ id: `m${Date.now()}`, productId: product.id, ...movement, createdAt: new Date().toISOString() });
  await upsert('products', product.id, product);
  return res.status(201).json(product);
});

app.get('/challans', async (_req, res) => {
  res.json(await getAll('challans'));
});

app.post('/challans', async (req, res) => {
  const payload = req.body as { customerId: string; items: Array<{ productId: string; productName: string; sku: string; unitPrice: number; quantity: number }>; status: 'Draft' | 'Confirmed' | 'Cancelled'; createdBy: string };
  const customers = await getAll<Customer>('customers');
  const customer = customers.find((c) => c.id === payload.customerId);
  if (!customer) return res.status(404).json({ message: 'Customer not found.' });
  const items = createChallanSnapshot(payload.items);
  const { totalQuantity, totalAmount } = calculateTotals(items);
  const challan = { id: `ch${Date.now()}`, challanNumber: buildChallanNumber(), customerId: customer.id, customerName: customer.name, items, totalQuantity, totalAmount, status: payload.status, createdBy: payload.createdBy, createdAt: new Date().toISOString() };
  if (payload.status === 'Confirmed') {
    const products = await getAll<Product>('products');
    const confirmation = canConfirmChallan(items, products);
    if (!confirmation.ok) return res.status(400).json({ message: confirmation.error });
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (product) { product.currentStock -= item.quantity; await upsert('products', product.id, product); }
    }
  }
  await upsert('challans', challan.id, challan);
  return res.status(201).json(challan);
});

app.get('/purchase-orders', async (_req, res) => {
  res.json(await getAll('purchase_orders'));
});

app.post('/purchase-orders', async (req, res) => {
  const payload = req.body as Partial<PurchaseOrder>;
  const po: PurchaseOrder = { id: `po${Date.now()}`, poNumber: payload.poNumber || `PO-${Date.now()}`, supplierName: payload.supplierName || 'Unknown Supplier', items: payload.items || [], totalAmount: payload.totalAmount || 0, status: payload.status || 'Draft', createdBy: payload.createdBy || 'admin@example.com', createdAt: new Date().toISOString() };
  await upsert('purchase_orders', po.id, po);
  return res.status(201).json(po);
});

app.put('/purchase-orders/:id', async (req, res) => {
  const orders = await getAll<PurchaseOrder>('purchase_orders');
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ message: 'Purchase order not found.' });
  const updated = { ...order, ...req.body as Partial<PurchaseOrder> };
  await upsert('purchase_orders', updated.id, updated);
  return res.json(updated);
});

app.get('/invoices', async (_req, res) => {
  res.json(await getAll('invoices'));
});

app.post('/invoices', async (req, res) => {
  const payload = req.body as Partial<Invoice>;
  const customers = await getAll<Customer>('customers');
  const customer = customers.find((c) => c.id === payload.customerId);
  if (!customer) return res.status(404).json({ message: 'Customer not found.' });
  const invoice: Invoice = { id: `inv${Date.now()}`, invoiceNumber: payload.invoiceNumber || `INV-${Date.now()}`, customerId: customer.id, customerName: customer.name, challanId: payload.challanId, totalAmount: payload.totalAmount || 0, status: payload.status || 'Draft', dueDate: payload.dueDate || '', createdBy: payload.createdBy || 'admin@example.com', createdAt: new Date().toISOString() };
  await upsert('invoices', invoice.id, invoice);
  return res.status(201).json(invoice);
});

app.put('/invoices/:id', async (req, res) => {
  const invoices = await getAll<Invoice>('invoices');
  const invoice = invoices.find((i) => i.id === req.params.id);
  if (!invoice) return res.status(404).json({ message: 'Invoice not found.' });
  const updated = { ...invoice, ...req.body as Partial<Invoice> };
  await upsert('invoices', updated.id, updated);
  return res.json(updated);
});

export default app;
