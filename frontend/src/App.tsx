import { useEffect, useState, type FormEvent } from 'react';
import { demoData } from './demoData';

interface User { id: string; name: string; email: string; role: string; }
interface Customer { id: string; name: string; mobile: string; email: string; businessName: string; gstNumber?: string; customerType: 'Retail' | 'Wholesale' | 'Distributor'; address: string; status: 'Lead' | 'Active' | 'Inactive'; followUpDate: string; notes: string; followUps: Array<{ id: string; note: string }> }
interface Product { id: string; name: string; sku: string; category: string; unitPrice: number; currentStock: number; minimumStockAlert: number; location: string; stockMovements: Array<{ id: string; movementType: string; quantityChanged: number; reason: string }> }
interface Challan { id: string; challanNumber: string; customerName: string; totalQuantity: number; totalAmount: number; status: string; createdAt: string; }
interface PurchaseOrder { id: string; poNumber: string; supplierName: string; totalAmount: number; status: 'Draft' | 'Approved' | 'Received'; createdBy: string; createdAt: string; }
interface Invoice { id: string; invoiceNumber: string; customerName: string; totalAmount: number; status: 'Draft' | 'Issued' | 'Paid'; dueDate: string; createdBy: string; createdAt: string; }

type CustomerFormState = {
  name: string;
  mobile: string;
  email: string;
  businessName: string;
  gstNumber: string;
  customerType: 'Retail' | 'Wholesale' | 'Distributor';
  address: string;
  status: 'Lead' | 'Active' | 'Inactive';
  followUpDate: string;
  notes: string;
};

type ProductFormState = {
  name: string;
  sku: string;
  category: string;
  unitPrice: string;
  currentStock: string;
  minimumStockAlert: string;
  location: string;
};

type ChallanLineState = {
  productId: string;
  quantity: string;
};

const initialCustomerForm: CustomerFormState = {
  name: '',
  mobile: '',
  email: '',
  businessName: '',
  gstNumber: '',
  customerType: 'Wholesale',
  address: '',
  status: 'Lead',
  followUpDate: '',
  notes: ''
};

const initialProductForm: ProductFormState = {
  name: '',
  sku: '',
  category: '',
  unitPrice: '0',
  currentStock: '0',
  minimumStockAlert: '0',
  location: ''
};

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [challans, setChallans] = useState<Challan[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [customerForm, setCustomerForm] = useState<CustomerFormState>(initialCustomerForm);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<ProductFormState>(initialProductForm);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [challanCustomerId, setChallanCustomerId] = useState('');
  const [challanStatus, setChallanStatus] = useState<'Draft' | 'Confirmed'>('Draft');
  const [challanLines, setChallanLines] = useState<ChallanLineState[]>([{ productId: '', quantity: '1' }]);
  const [followUpCustomerId, setFollowUpCustomerId] = useState('');
  const [followUpText, setFollowUpText] = useState('');
  const [purchaseOrderForm, setPurchaseOrderForm] = useState({ poNumber: '', supplierName: '', totalAmount: '0', status: 'Draft' as 'Draft' | 'Approved' | 'Received' });
  const [invoiceForm, setInvoiceForm] = useState({ invoiceNumber: '', customerId: '', dueDate: '', totalAmount: '0', status: 'Draft' as 'Draft' | 'Issued' | 'Paid' });
  const apiBase = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

  const fetchData = async () => {
    try {
      const [customersRes, productsRes, challansRes, purchaseOrdersRes, invoicesRes] = await Promise.all([
        fetch(`${apiBase}/customers`),
        fetch(`${apiBase}/products`),
        fetch(`${apiBase}/challans`),
        fetch(`${apiBase}/purchase-orders`),
        fetch(`${apiBase}/invoices`)
      ]);

      if (!customersRes.ok || !productsRes.ok || !challansRes.ok || !purchaseOrdersRes.ok || !invoicesRes.ok) {
        throw new Error('Backend unavailable');
      }

      setCustomers(await customersRes.json());
      setProducts(await productsRes.json());
      setChallans(await challansRes.json());
      setPurchaseOrders(await purchaseOrdersRes.json());
      setInvoices(await invoicesRes.json());
    } catch {
      setCustomers(demoData.customers as Customer[]);
      setProducts(demoData.products as Product[]);
      setChallans(demoData.challans as Challan[]);
      setPurchaseOrders(demoData.purchaseOrders as PurchaseOrder[]);
      setInvoices(demoData.invoices as Invoice[]);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');
    const response = await fetch(`${apiBase}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.message || 'Login failed');
      return;
    }
    setUser(data.user);
    await fetchData();
    setMessage('Welcome back.');
  };

  const handleCustomerSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');
    const method = editingCustomerId ? 'PUT' : 'POST';
    const url = editingCustomerId ? `/customers/${editingCustomerId}` : '/customers';
    const response = await fetch(`${apiBase}${url}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...customerForm, followUpDate: customerForm.followUpDate || new Date().toISOString().slice(0, 10) })
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.message || 'Unable to save customer');
      return;
    }
    setCustomerForm(initialCustomerForm);
    setEditingCustomerId(null);
    await fetchData();
    setMessage(editingCustomerId ? 'Customer updated.' : 'Customer created.');
  };

  const handleProductSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');
    const method = editingProductId ? 'PUT' : 'POST';
    const url = editingProductId ? `/products/${editingProductId}` : '/products';
    const response = await fetch(`${apiBase}${url}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...productForm,
        unitPrice: Number(productForm.unitPrice),
        currentStock: Number(productForm.currentStock),
        minimumStockAlert: Number(productForm.minimumStockAlert)
      })
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.message || 'Unable to save product');
      return;
    }
    setProductForm(initialProductForm);
    setEditingProductId(null);
    await fetchData();
    setMessage(editingProductId ? 'Product updated.' : 'Product created.');
  };

  const handleChallanSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');

    const validLines = challanLines.filter((line) => line.productId && Number(line.quantity) > 0);
    if (!challanCustomerId || validLines.length === 0) {
      setError('Select a customer and at least one product.');
      return;
    }

    const items = validLines.map((line) => {
      const product = products.find((entry) => entry.id === line.productId);
      return {
        productId: line.productId,
        productName: product?.name || '',
        sku: product?.sku || '',
        unitPrice: product?.unitPrice || 0,
        quantity: Number(line.quantity)
      };
    });

    const response = await fetch(`${apiBase}/challans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId: challanCustomerId, items, status: challanStatus, createdBy: user?.email || 'admin@example.com' })
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.message || 'Unable to create challan');
      return;
    }
    setChallanCustomerId('');
    setChallanStatus('Draft');
    setChallanLines([{ productId: '', quantity: '1' }]);
    await fetchData();
    setMessage(`Challan ${data.challanNumber} created.`);
  };

  const handleFollowUpSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');
    if (!followUpCustomerId || !followUpText.trim()) {
      setError('Select a customer and provide a note.');
      return;
    }

    const response = await fetch(`${apiBase}/customers/${followUpCustomerId}/follow-ups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: followUpText })
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.message || 'Unable to add follow-up');
      return;
    }
    setFollowUpCustomerId('');
    setFollowUpText('');
    await fetchData();
    setMessage('Follow-up note added.');
  };

  const handlePurchaseOrderSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');

    const response = await fetch(`${apiBase}/purchase-orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        poNumber: purchaseOrderForm.poNumber,
        supplierName: purchaseOrderForm.supplierName,
        totalAmount: Number(purchaseOrderForm.totalAmount),
        status: purchaseOrderForm.status,
        createdBy: user?.email || 'admin@example.com'
      })
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.message || 'Unable to create purchase order');
      return;
    }
    setPurchaseOrderForm({ poNumber: '', supplierName: '', totalAmount: '0', status: 'Draft' });
    await fetchData();
    setMessage(`Purchase order ${data.poNumber} created.`);
  };

  const handleInvoiceSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');

    const response = await fetch(`${apiBase}/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invoiceNumber: invoiceForm.invoiceNumber,
        customerId: invoiceForm.customerId,
        totalAmount: Number(invoiceForm.totalAmount),
        dueDate: invoiceForm.dueDate,
        status: invoiceForm.status,
        createdBy: user?.email || 'admin@example.com'
      })
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.message || 'Unable to create invoice');
      return;
    }
    setInvoiceForm({ invoiceNumber: '', customerId: '', dueDate: '', totalAmount: '0', status: 'Draft' });
    await fetchData();
    setMessage(`Invoice ${data.invoiceNumber} created.`);
  };

  const updateCustomerForm = (field: keyof CustomerFormState, value: string) => {
    setCustomerForm((current) => ({ ...current, [field]: value }));
  };

  const updateProductForm = (field: keyof ProductFormState, value: string) => {
    setProductForm((current) => ({ ...current, [field]: value }));
  };

  const updateChallanLine = (index: number, field: keyof ChallanLineState, value: string) => {
    setChallanLines((current) => current.map((line, lineIndex) => lineIndex === index ? { ...line, [field]: value } : line));
  };

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="brand-wrapper">
          <img src="/logo.png" alt="TradeFlow Operations Portal Logo" className="app-logo" />
          <div className="brand-text">
            <span className="eyebrow">Mini ERP + CRM</span>
            <h1>TradeFlow Operations Portal</h1>
            <p>End-to-end workflow for customers, inventory, purchasing, challans, and invoices.</p>
          </div>
        </div>
        {!user ? (
          <form className="login-card" onSubmit={handleLogin}>
            <h2>Login</h2>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
            {error ? <p className="error">{error}</p> : null}
            {message ? <p className="success">{message}</p> : null}
            <button type="submit">Sign in</button>
          </form>
        ) : (
          <div className="user-pill">
            Signed in as {user.name} ({user.role})
            <div>Sales, warehouse, and accounts workflows enabled</div>
          </div>
        )}
      </header>

      {user ? (
        <main className="dashboard">
          <section className="card">
            <h2>Customers</h2>
            <form onSubmit={handleCustomerSubmit} className="stacked-form">
              <label>
                Customer name
                <input value={customerForm.name} onChange={(e) => updateCustomerForm('name', e.target.value)} placeholder="Customer name" />
              </label>
              <label>
                Mobile
                <input value={customerForm.mobile} onChange={(e) => updateCustomerForm('mobile', e.target.value)} placeholder="Mobile" />
              </label>
              <label>
                Email
                <input value={customerForm.email} onChange={(e) => updateCustomerForm('email', e.target.value)} placeholder="Email" />
              </label>
              <label>
                Business name
                <input value={customerForm.businessName} onChange={(e) => updateCustomerForm('businessName', e.target.value)} placeholder="Business name" />
              </label>
              <label>
                GST number
                <input value={customerForm.gstNumber} onChange={(e) => updateCustomerForm('gstNumber', e.target.value)} placeholder="GST number" />
              </label>
              <label>
                Customer type
                <select value={customerForm.customerType} onChange={(e) => updateCustomerForm('customerType', e.target.value)} title="Customer type">
                  <option value="Retail">Retail</option>
                  <option value="Wholesale">Wholesale</option>
                  <option value="Distributor">Distributor</option>
                </select>
              </label>
              <label>
                Address
                <input value={customerForm.address} onChange={(e) => updateCustomerForm('address', e.target.value)} placeholder="Address" />
              </label>
              <label>
                Status
                <select value={customerForm.status} onChange={(e) => updateCustomerForm('status', e.target.value)} title="Customer status">
                  <option value="Lead">Lead</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </label>
              <label>
                Follow-up date
                <input type="date" value={customerForm.followUpDate} onChange={(e) => updateCustomerForm('followUpDate', e.target.value)} />
              </label>
              <label>
                Notes
                <textarea value={customerForm.notes} onChange={(e) => updateCustomerForm('notes', e.target.value)} placeholder="Notes" />
              </label>
              <button type="submit">{editingCustomerId ? 'Update customer' : 'Add customer'}</button>
            </form>
            <ul className="item-list">
              {customers.map((customer) => (
                <li key={customer.id}>
                  <div>
                    <strong>{customer.name}</strong>
                    <div>{customer.businessName} • {customer.status}</div>
                  </div>
                  <button type="button" onClick={() => {
                    setEditingCustomerId(customer.id);
                    setCustomerForm({
                      name: customer.name,
                      mobile: customer.mobile,
                      email: customer.email,
                      businessName: customer.businessName,
                      gstNumber: customer.gstNumber || '',
                      customerType: customer.customerType,
                      address: customer.address,
                      status: customer.status,
                      followUpDate: customer.followUpDate,
                      notes: customer.notes
                    });
                  }}>Edit</button>
                </li>
              ))}
            </ul>
          </section>

          <section className="card">
            <h2>Products</h2>
            <form onSubmit={handleProductSubmit} className="stacked-form">
              <label>
                Product name
                <input value={productForm.name} onChange={(e) => updateProductForm('name', e.target.value)} placeholder="Product name" />
              </label>
              <label>
                SKU
                <input value={productForm.sku} onChange={(e) => updateProductForm('sku', e.target.value)} placeholder="SKU" />
              </label>
              <label>
                Category
                <input value={productForm.category} onChange={(e) => updateProductForm('category', e.target.value)} placeholder="Category" />
              </label>
              <label>
                Unit price
                <input type="number" value={productForm.unitPrice} onChange={(e) => updateProductForm('unitPrice', e.target.value)} placeholder="Unit price" />
              </label>
              <label>
                Current stock
                <input type="number" value={productForm.currentStock} onChange={(e) => updateProductForm('currentStock', e.target.value)} placeholder="Current stock" />
              </label>
              <label>
                Minimum stock alert
                <input type="number" value={productForm.minimumStockAlert} onChange={(e) => updateProductForm('minimumStockAlert', e.target.value)} placeholder="Minimum stock" />
              </label>
              <label>
                Location
                <input value={productForm.location} onChange={(e) => updateProductForm('location', e.target.value)} placeholder="Location" />
              </label>
              <button type="submit">{editingProductId ? 'Update product' : 'Add product'}</button>
            </form>
            <ul className="item-list">
              {products.map((product) => (
                <li key={product.id}>
                  <div>
                    <strong>{product.name}</strong>
                    <div>SKU {product.sku} • Stock {product.currentStock}</div>
                  </div>
                  <button type="button" onClick={() => {
                    setEditingProductId(product.id);
                    setProductForm({
                      name: product.name,
                      sku: product.sku,
                      category: product.category,
                      unitPrice: String(product.unitPrice),
                      currentStock: String(product.currentStock),
                      minimumStockAlert: String(product.minimumStockAlert),
                      location: product.location
                    });
                  }}>Edit</button>
                </li>
              ))}
            </ul>
          </section>

          <section className="card">
            <h2>Sales Challans</h2>
            <form onSubmit={handleChallanSubmit} className="stacked-form">
              <label>
                Customer
                <select value={challanCustomerId} onChange={(e) => setChallanCustomerId(e.target.value)} title="Select customer">
                  <option value="">Select customer</option>
                  {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
                </select>
              </label>
              <label>
                Status
                <select value={challanStatus} onChange={(e) => setChallanStatus(e.target.value as 'Draft' | 'Confirmed')} title="Challan status">
                  <option value="Draft">Draft</option>
                  <option value="Confirmed">Confirmed</option>
                </select>
              </label>
              {challanLines.map((line, index) => (
                <div key={index} className="row-fields">
                  <label>
                    Product
                    <select value={line.productId} onChange={(e) => updateChallanLine(index, 'productId', e.target.value)} title={`Product ${index + 1}`}>
                      <option value="">Select product</option>
                      {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
                    </select>
                  </label>
                  <input type="number" value={line.quantity} onChange={(e) => updateChallanLine(index, 'quantity', e.target.value)} placeholder="Qty" />
                </div>
              ))}
              <div className="button-row">
                <button type="button" onClick={() => setChallanLines((current) => [...current, { productId: '', quantity: '1' }])}>Add line</button>
                <button type="submit">Create challan</button>
              </div>
            </form>
            <ul className="item-list">
              {challans.map((challan) => (
                <li key={challan.id}>
                  <div>
                    <strong>{challan.challanNumber}</strong>
                    <div>{challan.customerName} • {challan.status}</div>
                  </div>
                  <span>{challan.totalQuantity} items</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="card">
            <h2>Purchase Orders</h2>
            <form onSubmit={handlePurchaseOrderSubmit} className="stacked-form">
              <label>
                PO number
                <input value={purchaseOrderForm.poNumber} onChange={(e) => setPurchaseOrderForm((current) => ({ ...current, poNumber: e.target.value }))} placeholder="PO-1001" />
              </label>
              <label>
                Supplier
                <input value={purchaseOrderForm.supplierName} onChange={(e) => setPurchaseOrderForm((current) => ({ ...current, supplierName: e.target.value }))} placeholder="Supplier name" />
              </label>
              <label>
                Total amount
                <input type="number" value={purchaseOrderForm.totalAmount} onChange={(e) => setPurchaseOrderForm((current) => ({ ...current, totalAmount: e.target.value }))} placeholder="Amount" />
              </label>
              <label>
                Status
                <select value={purchaseOrderForm.status} onChange={(e) => setPurchaseOrderForm((current) => ({ ...current, status: e.target.value as 'Draft' | 'Approved' | 'Received' }))} title="Purchase order status">
                  <option value="Draft">Draft</option>
                  <option value="Approved">Approved</option>
                  <option value="Received">Received</option>
                </select>
              </label>
              <button type="submit">Create PO</button>
            </form>
            <ul className="item-list">
              {purchaseOrders.map((order) => (
                <li key={order.id}>
                  <div>
                    <strong>{order.poNumber}</strong>
                    <div>{order.supplierName} • {order.status}</div>
                  </div>
                  <span>₹{order.totalAmount}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="card">
            <h2>Invoices</h2>
            <form onSubmit={handleInvoiceSubmit} className="stacked-form">
              <label>
                Invoice number
                <input value={invoiceForm.invoiceNumber} onChange={(e) => setInvoiceForm((current) => ({ ...current, invoiceNumber: e.target.value }))} placeholder="INV-1001" />
              </label>
              <label>
                Customer
                <select value={invoiceForm.customerId} onChange={(e) => setInvoiceForm((current) => ({ ...current, customerId: e.target.value }))} title="Invoice customer">
                  <option value="">Select customer</option>
                  {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
                </select>
              </label>
              <label>
                Due date
                <input type="date" value={invoiceForm.dueDate} onChange={(e) => setInvoiceForm((current) => ({ ...current, dueDate: e.target.value }))} />
              </label>
              <label>
                Total amount
                <input type="number" value={invoiceForm.totalAmount} onChange={(e) => setInvoiceForm((current) => ({ ...current, totalAmount: e.target.value }))} placeholder="Amount" />
              </label>
              <label>
                Status
                <select value={invoiceForm.status} onChange={(e) => setInvoiceForm((current) => ({ ...current, status: e.target.value as 'Draft' | 'Issued' | 'Paid' }))} title="Invoice status">
                  <option value="Draft">Draft</option>
                  <option value="Issued">Issued</option>
                  <option value="Paid">Paid</option>
                </select>
              </label>
              <button type="submit">Create invoice</button>
            </form>
            <ul className="item-list">
              {invoices.map((invoice) => (
                <li key={invoice.id}>
                  <div>
                    <strong>{invoice.invoiceNumber}</strong>
                    <div>{invoice.customerName} • {invoice.status}</div>
                  </div>
                  <span>₹{invoice.totalAmount}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="card">
            <h2>Follow-up notes</h2>
            <form onSubmit={handleFollowUpSubmit} className="stacked-form">
              <label>
                Customer
                <select value={followUpCustomerId} onChange={(e) => setFollowUpCustomerId(e.target.value)} title="Follow-up customer">
                  <option value="">Select customer</option>
                  {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
                </select>
              </label>
              <textarea value={followUpText} onChange={(e) => setFollowUpText(e.target.value)} placeholder="Add a follow-up note" />
              <button type="submit">Add note</button>
            </form>
          </section>
        </main>
      ) : null}
      {error ? <p className="error-banner">{error}</p> : null}
      {message ? <p className="success-banner">{message}</p> : null}
    </div>
  );
}

export default App;
