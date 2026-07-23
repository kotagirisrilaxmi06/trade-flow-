export interface DemoData {
  customers: Array<{
    id: string;
    name: string;
    mobile: string;
    email: string;
    businessName: string;
    gstNumber?: string;
    customerType: 'Retail' | 'Wholesale' | 'Distributor';
    address: string;
    status: 'Lead' | 'Active' | 'Inactive';
    followUpDate: string;
    notes: string;
    followUps: Array<{ id: string; note: string; createdAt: string }>;
    createdAt: string;
  }>;
  products: Array<{
    id: string;
    name: string;
    sku: string;
    category: string;
    unitPrice: number;
    currentStock: number;
    minimumStockAlert: number;
    location: string;
    createdAt: string;
    stockMovements: Array<{ id: string; productId: string; quantityChanged: number; movementType: 'IN' | 'OUT'; reason: string; createdBy: string; createdAt: string }>;
  }>;
  challans: Array<{
    id: string;
    challanNumber: string;
    customerName: string;
    totalQuantity: number;
    totalAmount: number;
    status: string;
    createdAt: string;
  }>;
  purchaseOrders: Array<{
    id: string;
    poNumber: string;
    supplierName: string;
    totalAmount: number;
    status: 'Draft' | 'Approved' | 'Received';
    createdBy: string;
    createdAt: string;
  }>;
  invoices: Array<{
    id: string;
    invoiceNumber: string;
    customerName: string;
    totalAmount: number;
    status: 'Draft' | 'Issued' | 'Paid';
    dueDate: string;
    createdBy: string;
    createdAt: string;
  }>;
}

export const demoData: DemoData = {
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
  challans: [
    {
      id: 'ch1',
      challanNumber: 'CH-1001',
      customerName: 'Apex Traders',
      totalQuantity: 5,
      totalAmount: 2250,
      status: 'Confirmed',
      createdAt: '2026-07-21T10:00:00.000Z'
    }
  ],
  purchaseOrders: [
    {
      id: 'po1',
      poNumber: 'PO-1001',
      supplierName: 'Northstar Supplies',
      totalAmount: 18000,
      status: 'Approved',
      createdBy: 'admin@example.com',
      createdAt: '2026-07-22T10:00:00.000Z'
    }
  ],
  invoices: [
    {
      id: 'inv1',
      invoiceNumber: 'INV-1001',
      customerName: 'Apex Traders',
      totalAmount: 2250,
      status: 'Issued',
      dueDate: '2026-07-31',
      createdBy: 'accounts@example.com',
      createdAt: '2026-07-22T10:00:00.000Z'
    }
  ]
};
