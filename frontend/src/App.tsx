import { useEffect, useState, type FormEvent } from 'react';
import { demoData } from './demoData';

interface User { id: string; name: string; email: string; role: string; }
interface Customer { id: string; name: string; mobile: string; email: string; businessName: string; gstNumber?: string; customerType: 'Retail' | 'Wholesale' | 'Distributor'; address: string; status: 'Lead' | 'Active' | 'Inactive'; followUpDate: string; notes: string; followUps: Array<{ id: string; note: string; createdAt?: string }> }
interface Product { id: string; name: string; sku: string; category: string; unitPrice: number; currentStock: number; minimumStockAlert: number; location: string; stockMovements: Array<{ id: string; movementType: string; quantityChanged: number; reason: string; createdAt?: string }> }
interface Challan { id: string; challanNumber: string; customerId?: string; customerName: string; totalQuantity: number; totalAmount: number; status: string; createdAt: string; items?: Array<{ productId: string; productName: string; quantity: number; unitPrice: number }> }
interface PurchaseOrder { id: string; poNumber: string; supplierName: string; totalAmount: number; status: 'Draft' | 'Approved' | 'Received'; createdBy: string; createdAt: string; }
interface Invoice { id: string; invoiceNumber: string; customerId?: string; customerName: string; totalAmount: number; status: 'Draft' | 'Issued' | 'Paid'; dueDate: string; createdBy: string; createdAt: string; }

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
  const [activeTab, setActiveTab] = useState<'overview' | 'crm' | 'products' | 'challans' | 'finance'>('overview');

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
      body: JSON.stringify(customerForm)
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

  // Analytics Computation
  const confirmedChallans = challans.filter((c) => c.status === 'Confirmed');
  const draftChallans = challans.filter((c) => c.status === 'Draft');
  const cancelledChallans = challans.filter((c) => c.status === 'Cancelled');

  const totalRevenue = confirmedChallans.reduce((sum, c) => sum + (c.totalAmount || 0), 0);
  const draftRevenue = draftChallans.reduce((sum, c) => sum + (c.totalAmount || 0), 0);

  const lowStockProducts = products.filter((p) => p.currentStock <= p.minimumStockAlert);
  const activeCustomers = customers.filter((c) => c.status === 'Active');

  const maxBarVal = Math.max(confirmedChallans.length, draftChallans.length, cancelledChallans.length, 1);

  return (
    <div className="app-shell">
      {/* HEADER HERO BANNER */}
      <header className="hero">
        <div className="brand-wrapper">
          <img src="/logo.png" alt="TradeFlow Operations Portal Logo" className="app-logo" />
          <div className="brand-text">
            <span className="eyebrow">Enterprise Mini ERP + CRM</span>
            <h1>TradeFlow Operations Portal</h1>
            <p>End-to-end workflow for customer deals, stock inventory, challans, and financial invoices.</p>
          </div>
        </div>

        {!user ? (
          <form className="login-card" onSubmit={handleLogin}>
            <h2>Operations Sign In</h2>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
            {error ? <p className="error-banner">{error}</p> : null}
            {message ? <p className="success-banner">{message}</p> : null}
            <button type="submit">Sign in</button>
          </form>
        ) : (
          <div className="user-pill">
            Signed in as {user.name} ({user.role})
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>Active Workspace: Operations Cloud</div>
          </div>
        )}
      </header>

      {/* DASHBOARD TAB NAVIGATION */}
      {user ? (
        <>
          <nav className="nav-tabs">
            <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
              📊 Executive Overview & Analytics
            </button>
            <button className={`tab-btn ${activeTab === 'crm' ? 'active' : ''}`} onClick={() => setActiveTab('crm')}>
              👥 Customer & Dealer CRM ({customers.length})
            </button>
            <button className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
              📦 Products & Inventory ({products.length})
            </button>
            <button className={`tab-btn ${activeTab === 'challans' ? 'active' : ''}`} onClick={() => setActiveTab('challans')}>
              📋 Sales Challans ({challans.length})
            </button>
            <button className={`tab-btn ${activeTab === 'finance' ? 'active' : ''}`} onClick={() => setActiveTab('finance')}>
              📑 Orders & Invoices ({invoices.length + purchaseOrders.length})
            </button>
          </nav>

          {error ? <p className="error-banner">{error}</p> : null}
          {message ? <p className="success-banner">{message}</p> : null}

          {/* TAB 1: EXECUTIVE OVERVIEW & ANALYTICS */}
          {activeTab === 'overview' && (
            <div>
              {/* KPI CARDS GRID */}
              <div className="kpi-grid">
                <div className="kpi-card">
                  <div className="kpi-title">Confirmed Sales Revenue</div>
                  <div className="kpi-value">₹{totalRevenue.toLocaleString()}</div>
                  <div className="kpi-subtitle">⚡ {confirmedChallans.length} Confirmed Challans</div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-title">Pipeline Draft Sales</div>
                  <div className="kpi-value">₹{draftRevenue.toLocaleString()}</div>
                  <div className="kpi-subtitle">⏳ {draftChallans.length} Pending Challans</div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-title">Active Customers & Dealers</div>
                  <div className="kpi-value">{activeCustomers.length} / {customers.length}</div>
                  <div className="kpi-subtitle">🎯 High-value account network</div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-title">Low Stock Alerts</div>
                  <div className="kpi-value" style={{ color: lowStockProducts.length > 0 ? '#f87171' : '#4ade80' }}>
                    {lowStockProducts.length}
                  </div>
                  <div className="kpi-subtitle">
                    {lowStockProducts.length > 0 ? '⚠️ Immediate restock required' : '✅ Inventory levels optimal'}
                  </div>
                </div>
              </div>

              {/* CHALLAN GRAPH & DEALER ACTIVITY MATRIX */}
              <div className="analytics-section">
                {/* CHALLANS ANALYTICS BAR CHART */}
                <div className="chart-card">
                  <div className="chart-header">
                    <div>
                      <h3>Sales Challans Performance Graph</h3>
                      <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
                        Breakdown of total issued challans by status and revenue allocation
                      </p>
                    </div>
                    <span className="eyebrow">Real-Time</span>
                  </div>

                  <div className="graph-container">
                    <div className="bar-chart-visual">
                      <div className="chart-bar-group">
                        <div className="chart-bar confirmed" style={{ height: `${(confirmedChallans.length / maxBarVal) * 100}%` }}>
                          <span className="bar-val">{confirmedChallans.length}</span>
                        </div>
                        <span className="bar-label">Confirmed ({confirmedChallans.length})</span>
                      </div>
                      <div className="chart-bar draft" style={{ height: `${(draftChallans.length / maxBarVal) * 100}%` }}>
                        <span className="bar-val">{draftChallans.length}</span>
                      </div>
                      <span className="bar-label">Drafts ({draftChallans.length})</span>
                      <div className="chart-bar cancelled" style={{ height: `${(cancelledChallans.length / maxBarVal) * 100}%` }}>
                        <span className="bar-val">{cancelledChallans.length}</span>
                      </div>
                      <span className="bar-label">Cancelled ({cancelledChallans.length})</span>
                    </div>
                  </div>
                </div>

                {/* DEALER & CUSTOMER SUMMARY MATRIX */}
                <div className="chart-card">
                  <div className="chart-header">
                    <h3>Dealer & Account Activity</h3>
                    <span className="eyebrow">Network</span>
                  </div>
                  <ul className="item-list">
                    {customers.slice(0, 5).map((cust) => {
                      const customerChallans = challans.filter((c) => c.customerName === cust.name || c.customerId === cust.id);
                      const customerSpent = customerChallans.reduce((sum, c) => sum + (c.totalAmount || 0), 0);
                      return (
                        <li key={cust.id}>
                          <div>
                            <strong>{cust.name}</strong>
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                              {cust.customerType} • {customerChallans.length} Deals Issued
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 700, color: '#38bdf8' }}>₹{customerSpent.toLocaleString()}</div>
                            <span className={`badge ${cust.status === 'Active' ? 'badge-active' : 'badge-lead'}`}>
                              <span className="badge-dot"></span>{cust.status}
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CUSTOMER & DEALER CRM */}
          {activeTab === 'crm' && (
            <main className="dashboard">
              <section className="card">
                <h2>Manage Customer / Dealer Profile</h2>
                <form onSubmit={handleCustomerSubmit} className="stacked-form">
                  <label>Customer name <input value={customerForm.name} onChange={(e) => updateCustomerForm('name', e.target.value)} placeholder="Full name" /></label>
                  <label>Mobile <input value={customerForm.mobile} onChange={(e) => updateCustomerForm('mobile', e.target.value)} placeholder="Mobile number" /></label>
                  <label>Email <input value={customerForm.email} onChange={(e) => updateCustomerForm('email', e.target.value)} placeholder="Email address" /></label>
                  <label>Business Name <input value={customerForm.businessName} onChange={(e) => updateCustomerForm('businessName', e.target.value)} placeholder="Business entity" /></label>
                  <label>GST Number (Optional) <input value={customerForm.gstNumber} onChange={(e) => updateCustomerForm('gstNumber', e.target.value)} placeholder="GSTIN" /></label>
                  <label>Customer Type
                    <select value={customerForm.customerType} onChange={(e) => updateCustomerForm('customerType', e.target.value)} title="Customer type">
                      <option value="Retail">Retail</option>
                      <option value="Wholesale">Wholesale</option>
                      <option value="Distributor">Distributor</option>
                    </select>
                  </label>
                  <label>Address <input value={customerForm.address} onChange={(e) => updateCustomerForm('address', e.target.value)} placeholder="City / Address" /></label>
                  <label>Status
                    <select value={customerForm.status} onChange={(e) => updateCustomerForm('status', e.target.value)} title="Status">
                      <option value="Lead">Lead</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </label>
                  <label>Follow-up Date <input type="date" value={customerForm.followUpDate} onChange={(e) => updateCustomerForm('followUpDate', e.target.value)} /></label>
                  <label>Notes <textarea value={customerForm.notes} onChange={(e) => updateCustomerForm('notes', e.target.value)} placeholder="Key business notes" /></label>
                  <button type="submit">{editingCustomerId ? 'Update Customer Record' : 'Add Customer Record'}</button>
                </form>
              </section>

              <section className="card">
                <h2>Customer Directory & Follow-ups Log</h2>
                <form onSubmit={handleFollowUpSubmit} className="stacked-form" style={{ marginBottom: '16px' }}>
                  <label>Select Customer for Follow-up
                    <select value={followUpCustomerId} onChange={(e) => setFollowUpCustomerId(e.target.value)} title="Select customer">
                      <option value="">-- Choose Customer --</option>
                      {customers.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.businessName})</option>)}
                    </select>
                  </label>
                  <label>Follow-up Note <textarea value={followUpText} onChange={(e) => setFollowUpText(e.target.value)} placeholder="Enter discussion notes..." /></label>
                  <button type="submit" className="btn-secondary">Log Follow-Up Note</button>
                </form>

                <ul className="item-list">
                  {customers.map((cust) => (
                    <li key={cust.id}>
                      <div>
                        <strong>{cust.name} ({cust.businessName})</strong>
                        <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                          📱 {cust.mobile} | ✉️ {cust.email} | 📍 {cust.address}
                        </div>
                        {cust.followUps && cust.followUps.length > 0 ? (
                          <div style={{ fontSize: '0.8rem', color: '#7dd3fc', marginTop: '4px' }}>
                            💬 Latest Note: "{cust.followUps[cust.followUps.length - 1].note}"
                          </div>
                        ) : null}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span className={`badge ${cust.status === 'Active' ? 'badge-active' : cust.status === 'Lead' ? 'badge-lead' : 'badge-inactive'}`}>
                          <span className="badge-dot"></span>{cust.status}
                        </span>
                        <button type="button" className="btn-secondary" onClick={() => {
                          setEditingCustomerId(cust.id);
                          setCustomerForm({
                            name: cust.name,
                            mobile: cust.mobile,
                            email: cust.email,
                            businessName: cust.businessName,
                            gstNumber: cust.gstNumber || '',
                            customerType: cust.customerType,
                            address: cust.address,
                            status: cust.status,
                            followUpDate: cust.followUpDate,
                            notes: cust.notes
                          });
                        }}>Edit</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            </main>
          )}

          {/* TAB 3: PRODUCTS & INVENTORY */}
          {activeTab === 'products' && (
            <main className="dashboard">
              <section className="card">
                <h2>Manage Product Inventory</h2>
                <form onSubmit={handleProductSubmit} className="stacked-form">
                  <label>Product Name <input value={productForm.name} onChange={(e) => updateProductForm('name', e.target.value)} placeholder="Product Name" /></label>
                  <label>SKU / Code <input value={productForm.sku} onChange={(e) => updateProductForm('sku', e.target.value)} placeholder="e.g. ST-CHAIR-01" /></label>
                  <label>Category <input value={productForm.category} onChange={(e) => updateProductForm('category', e.target.value)} placeholder="Category" /></label>
                  <label>Unit Price (₹) <input type="number" value={productForm.unitPrice} onChange={(e) => updateProductForm('unitPrice', e.target.value)} placeholder="0" /></label>
                  <label>Current Stock <input type="number" value={productForm.currentStock} onChange={(e) => updateProductForm('currentStock', e.target.value)} placeholder="0" /></label>
                  <label>Min Alert Quantity <input type="number" value={productForm.minimumStockAlert} onChange={(e) => updateProductForm('minimumStockAlert', e.target.value)} placeholder="0" /></label>
                  <label>Location / Warehouse <input value={productForm.location} onChange={(e) => updateProductForm('location', e.target.value)} placeholder="WH-1" /></label>
                  <button type="submit">{editingProductId ? 'Update Product' : 'Add Product'}</button>
                </form>
              </section>

              <section className="card">
                <h2>Product Catalog & Low Stock Warnings</h2>
                <ul className="item-list">
                  {products.map((prod) => {
                    const isLowStock = prod.currentStock <= prod.minimumStockAlert;
                    return (
                      <li key={prod.id} style={{ borderColor: isLowStock ? 'rgba(239, 68, 68, 0.4)' : '' }}>
                        <div>
                          <strong>{prod.name} ({prod.sku})</strong>
                          <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                            Category: {prod.category} | Price: ₹{prod.unitPrice} | Location: {prod.location}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 800, color: isLowStock ? '#f87171' : '#4ade80' }}>
                            Stock: {prod.currentStock} units
                          </div>
                          {isLowStock ? <span className="badge" style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171' }}>⚠️ Low Stock Alert</span> : null}
                          <button type="button" className="btn-secondary" style={{ marginLeft: '8px' }} onClick={() => {
                            setEditingProductId(prod.id);
                            setProductForm({
                              name: prod.name,
                              sku: prod.sku,
                              category: prod.category,
                              unitPrice: String(prod.unitPrice),
                              currentStock: String(prod.currentStock),
                              minimumStockAlert: String(prod.minimumStockAlert),
                              location: prod.location
                            });
                          }}>Edit</button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            </main>
          )}

          {/* TAB 4: SALES CHALLANS */}
          {activeTab === 'challans' && (
            <main className="dashboard">
              <section className="card">
                <h2>Generate Sales Challan</h2>
                <form onSubmit={handleChallanSubmit} className="stacked-form">
                  <label>Select Customer / Dealer
                    <select value={challanCustomerId} onChange={(e) => setChallanCustomerId(e.target.value)} title="Customer">
                      <option value="">-- Choose Customer --</option>
                      {customers.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.businessName})</option>)}
                    </select>
                  </label>

                  <div style={{ marginTop: '8px' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px', color: '#cbd5e1' }}>Challan Line Items</div>
                    {challanLines.map((line, idx) => (
                      <div key={idx} className="row-fields" style={{ marginBottom: '8px' }}>
                        <select value={line.productId} onChange={(e) => updateChallanLine(idx, 'productId', e.target.value)} title="Select product">
                          <option value="">-- Select Product --</option>
                          {products.map((p) => <option key={p.id} value={p.id}>{p.name} (Stock: {p.currentStock} • ₹{p.unitPrice})</option>)}
                        </select>
                        <input type="number" value={line.quantity} min="1" onChange={(e) => updateChallanLine(idx, 'quantity', e.target.value)} placeholder="Qty" />
                      </div>
                    ))}
                    <button type="button" className="btn-secondary" onClick={() => setChallanLines([...challanLines, { productId: '', quantity: '1' }])}>
                      + Add Item Line
                    </button>
                  </div>

                  <label>Challan Status
                    <select value={challanStatus} onChange={(e) => setChallanStatus(e.target.value as 'Draft' | 'Confirmed')} title="Status">
                      <option value="Draft">Save as Draft</option>
                      <option value="Confirmed">Confirm & Reduce Stock</option>
                    </select>
                  </label>

                  <button type="submit">Create Sales Challan</button>
                </form>
              </section>

              <section className="card">
                <h2>Issued Sales Challans History</h2>
                <ul className="item-list">
                  {challans.map((ch) => (
                    <li key={ch.id}>
                      <div>
                        <strong>{ch.challanNumber} — {ch.customerName}</strong>
                        <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                          Total Qty: {ch.totalQuantity} items | Issued: {new Date(ch.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, color: '#38bdf8' }}>₹{(ch.totalAmount || 0).toLocaleString()}</div>
                        <span className={`badge ${ch.status === 'Confirmed' ? 'badge-confirmed' : 'badge-lead'}`}>
                          <span className="badge-dot"></span>{ch.status}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            </main>
          )}

          {/* TAB 5: ORDERS & INVOICES */}
          {activeTab === 'finance' && (
            <main className="dashboard">
              <section className="card">
                <h2>Generate Customer Invoice</h2>
                <form onSubmit={handleInvoiceSubmit} className="stacked-form">
                  <label>Invoice Number <input value={invoiceForm.invoiceNumber} onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceNumber: e.target.value })} placeholder="e.g. INV-2026-001" /></label>
                  <label>Customer
                    <select value={invoiceForm.customerId} onChange={(e) => setInvoiceForm({ ...invoiceForm, customerId: e.target.value })} title="Customer">
                      <option value="">-- Choose Customer --</option>
                      {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </label>
                  <label>Total Amount (₹) <input type="number" value={invoiceForm.totalAmount} onChange={(e) => setInvoiceForm({ ...invoiceForm, totalAmount: e.target.value })} placeholder="0" /></label>
                  <label>Due Date <input type="date" value={invoiceForm.dueDate} onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })} /></label>
                  <label>Invoice Status
                    <select value={invoiceForm.status} onChange={(e) => setInvoiceForm({ ...invoiceForm, status: e.target.value as 'Draft' | 'Issued' | 'Paid' })} title="Status">
                      <option value="Draft">Draft</option>
                      <option value="Issued">Issued</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </label>
                  <button type="submit">Issue Billing Invoice</button>
                </form>
              </section>

              <section className="card">
                <h2>Purchase Orders & Invoices List</h2>
                <h3 style={{ fontSize: '1rem', color: '#7dd3fc', margin: '8px 0 4px' }}>Invoices</h3>
                <ul className="item-list" style={{ marginBottom: '16px' }}>
                  {invoices.map((inv) => (
                    <li key={inv.id}>
                      <div>
                        <strong>{inv.invoiceNumber} — {inv.customerName}</strong>
                        <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Due Date: {inv.dueDate || 'N/A'}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, color: '#38bdf8' }}>₹{inv.totalAmount.toLocaleString()}</div>
                        <span className="badge badge-active">{inv.status}</span>
                      </div>
                    </li>
                  ))}
                </ul>

                <h3 style={{ fontSize: '1rem', color: '#7dd3fc', margin: '8px 0 4px' }}>Purchase Orders</h3>
                <form onSubmit={handlePurchaseOrderSubmit} className="stacked-form" style={{ marginBottom: '12px' }}>
                  <label>PO Number <input value={purchaseOrderForm.poNumber} onChange={(e) => setPurchaseOrderForm({ ...purchaseOrderForm, poNumber: e.target.value })} placeholder="PO-1001" /></label>
                  <label>Supplier Name <input value={purchaseOrderForm.supplierName} onChange={(e) => setPurchaseOrderForm({ ...purchaseOrderForm, supplierName: e.target.value })} placeholder="Supplier Entity" /></label>
                  <label>Total Amount (₹) <input type="number" value={purchaseOrderForm.totalAmount} onChange={(e) => setPurchaseOrderForm({ ...purchaseOrderForm, totalAmount: e.target.value })} placeholder="0" /></label>
                  <button type="submit" className="btn-secondary">Create Purchase Order</button>
                </form>

                <ul className="item-list">
                  {purchaseOrders.map((po) => (
                    <li key={po.id}>
                      <div>
                        <strong>{po.poNumber} — {po.supplierName}</strong>
                        <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Issued: {new Date(po.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, color: '#38bdf8' }}>₹{po.totalAmount.toLocaleString()}</div>
                        <span className="badge badge-lead">{po.status}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            </main>
          )}
        </>
      ) : null}
    </div>
  );
}

export default App;
