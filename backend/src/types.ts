export type Role = 'Admin' | 'Sales' | 'Warehouse' | 'Accounts';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface Customer {
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
  followUps: FollowUpNote[];
  createdAt: string;
}

export interface FollowUpNote {
  id: string;
  note: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minimumStockAlert: number;
  location: string;
  createdAt: string;
  stockMovements: StockMovement[];
}

export interface StockMovement {
  id: string;
  productId: string;
  quantityChanged: number;
  movementType: 'IN' | 'OUT';
  reason: string;
  createdBy: string;
  createdAt: string;
}

export interface ChallanItemSnapshot {
  productId: string;
  productName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Challan {
  id: string;
  challanNumber: string;
  customerId: string;
  customerName: string;
  items: ChallanItemSnapshot[];
  totalQuantity: number;
  totalAmount: number;
  status: 'Draft' | 'Confirmed' | 'Cancelled';
  createdBy: string;
  createdAt: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierName: string;
  items: Array<{ productId: string; productName: string; quantity: number; unitPrice: number }>;
  totalAmount: number;
  status: 'Draft' | 'Approved' | 'Received';
  createdBy: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  challanId?: string;
  totalAmount: number;
  status: 'Draft' | 'Issued' | 'Paid';
  dueDate: string;
  createdBy: string;
  createdAt: string;
}

export interface AppState {
  users: User[];
  customers: Customer[];
  products: Product[];
  challans: Challan[];
  purchaseOrders: PurchaseOrder[];
  invoices: Invoice[];
}
