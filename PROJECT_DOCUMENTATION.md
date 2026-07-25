# TradeFlow ERP + CRM Operations Portal
## Comprehensive Technical & Operational Documentation

---

## 1. Executive Summary & Business Context

**TradeFlow Operations Portal** is a production-ready, full-stack Mini ERP and CRM system engineered specifically for wholesale and distribution enterprises. 

The application streamlines business-critical workflows across multi-department teams:
- **Sales Teams**: Lead tracking, customer CRM management, follow-up logs, and sales challan generation.
- **Warehouse Teams**: Product cataloging, real-time stock management, minimum stock alert tracking, and immutable stock movement logging (IN/OUT).
- **Accounts Teams**: Financial invoice creation, payment status management, and purchase order tracking.
- **Administrators**: End-to-end system visibility and role-based access management.

---

## 2. Deployment & Repository Reference

| Component | Target / Environment | URL / Details |
| :--- | :--- | :--- |
| **GitHub Repository** | Public Source Code | [github.com/kotagirisrilaxmi06/trade-flow-](https://github.com/kotagirisrilaxmi06/trade-flow-) |
| **Live Frontend App** | Vercel Static Hosting | [trade-flow-cnc8oix2v-kotagirisrilaxmi06s-projects.vercel.app](https://trade-flow-cnc8oix2v-kotagirisrilaxmi06s-projects.vercel.app) |
| **Live Backend API** | Vercel Serverless Function | [trade-flow-cnc8oix2v-kotagirisrilaxmi06s-projects.vercel.app/health](https://trade-flow-cnc8oix2v-kotagirisrilaxmi06s-projects.vercel.app/health) |
| **Database Server** | Neon Cloud PostgreSQL | PostgreSQL 18.4 (AWS ap-southeast-1) |
| **API Test Suite** | Postman Collection | [`postman_collection.json`](https://github.com/kotagirisrilaxmi06/trade-flow-/blob/main/postman_collection.json) |

---

## 3. System Architecture & Component Design

The platform uses a **unified monorepo architecture** deployed on Vercel's serverless infrastructure with a cloud-native PostgreSQL backend database.

```mermaid
graph TD
    Client[React 18 + Vite Frontend] -->|HTTP / REST API| VercelEdge[Vercel Edge / Serverless Router]
    VercelEdge -->|Static Routes| StaticDist[Vite Compiled /dist]
    VercelEdge -->|API Rewrites /api/*| ServerlessFunc[Vercel Node.js Function /api/index.ts]
    ServerlessFunc -->|Express App Middleware| ExpressRouter[Express REST API Controllers]
    ExpressRouter -->|Domain Validation| ChallanLogic[Challan & Stock Validation Logic]
    ExpressRouter -->|node-postgres Pool| NeonDB[(Neon Cloud PostgreSQL Database)]
```

### **Architecture Highlights**:
1. **Frontend Layer**: Built with React 18, TypeScript, and Vite. Implements a responsive, dark-mode glassmorphic interface with floating logo animations and smooth CSS transitions.
2. **Serverless API Layer**: Located at `/api/index.ts`, exporting an Express.js application configured for Vercel's Node.js runtime environment.
3. **Data Access Layer**: `dataStore.ts` manages database queries using `pg.Pool` with SSL verification. Implements auto-schema migration and initial role account seeding upon system initialization.

---

## 4. Core Modules & Business Logic

### **4.1 Authentication & Role-Based Access Control (RBAC)**
Secures system actions based on assigned user roles:
- **Admin**: Unrestricted read/write access across all system modules.
- **Sales**: Customer CRM creation, editing, follow-up notes, and draft/confirmed sales challans.
- **Warehouse**: Product management, manual stock adjustments, and movement history tracking.
- **Accounts**: Purchase order processing and invoice issuance.

#### **Demo Credentials**:
- **Admin**: `admin@example.com` / `password123`
- **Sales**: `sales@example.com` / `password123`
- **Warehouse**: `warehouse@example.com` / `password123`
- **Accounts**: `accounts@example.com` / `password123`

---

### **4.2 Customer CRM Module**
Manages the complete lifecycle of customer entities:
- **Customer Attributes**: Name, Mobile, Email, Business Name, GST Number (Optional), Customer Type (`Retail`, `Wholesale`, `Distributor`), Physical Address, Status (`Lead`, `Active`, `Inactive`), and Follow-up Date.
- **Follow-up Log System**: Allows sales staff to append timestamped note entries to customer records.

---

### **4.3 Product & Inventory Module**
- **Catalog Fields**: Product Name, SKU/Code, Category, Unit Price, Current Stock, Minimum Stock Alert Threshold, and Warehouse Location.
- **Stock Movement Log**: Automatically records inventory changes with:
  - Movement Type: `IN` (Receiving stock) or `OUT` (Dispatching stock)
  - Quantity Changed
  - Audit Reason & Responsible User
  - ISO Timestamp

---

### **4.4 Sales Challan Module & Inventory Protection Logic**
The Sales Challan module includes strict real-world business constraints:
- **Challan Auto-Numbering**: Formats unique numbers (`CH-YYYYMMDD-XXXX`).
- **Product Snapshotting**: Stores full product state (name, SKU, price at time of sale) rather than volatile foreign references.
- **Atomic Stock Validation**:
  - When a Challan status changes to **`Confirmed`**, the backend validates current stock levels for all line items.
  - If any product stock is insufficient (`currentStock < requestedQuantity`), the API aborts the transaction and returns HTTP `400 Bad Request` with an explicit error message.
  - Stock levels are automatically decremented upon successful confirmation.

---

### **4.5 Purchase Orders & Invoices**
- **Purchase Orders**: Tracks supplier orders, order items, total amounts, and delivery status (`Draft`, `Approved`, `Received`).
- **Invoices**: Generates billing invoices linked to customer records and challans with payment status tracking (`Draft`, `Issued`, `Paid`).

---

## 5. Database Schema & Data Models

The system runs on **PostgreSQL** with 6 relational tables utilizing `JSONB` document storage for flexible record metadata:

```sql
-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL
);

-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL
);

-- Challans Table
CREATE TABLE IF NOT EXISTS challans (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL
);

-- Purchase Orders Table
CREATE TABLE IF NOT EXISTS purchase_orders (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL
);

-- Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL
);
```

---

## 6. API Specifications

| Method | Endpoint | Description | Request Body / Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Server health check | None |
| `POST` | `/auth/login` | Authenticate user credentials | `{ "email": "...", "password": "..." }` |
| `GET` | `/customers` | Fetch all customers | None |
| `POST` | `/customers` | Create new customer profile | `{ "name": "...", "mobile": "...", ... }` |
| `PUT` | `/customers/:id` | Update customer record | `{ "status": "Active", ... }` |
| `POST` | `/customers/:id/follow-ups` | Add customer follow-up note | `{ "note": "Contacted client for order update" }` |
| `GET` | `/products` | Fetch product catalog & inventory | None |
| `POST` | `/products` | Add new product | `{ "name": "...", "sku": "...", "unitPrice": 450, "currentStock": 50 }` |
| `PUT` | `/products/:id` | Update product details | `{ "unitPrice": 480 }` |
| `POST` | `/products/:id/stock-movements` | Log manual stock adjustment | `{ "quantityChanged": 10, "movementType": "IN", "reason": "Restock" }` |
| `GET` | `/challans` | Fetch sales challans | None |
| `POST` | `/challans` | Create sales challan | `{ "customerId": "c1", "items": [...], "status": "Confirmed" }` |
| `GET` | `/purchase-orders` | Fetch purchase orders | None |
| `POST` | `/purchase-orders` | Create purchase order | `{ "poNumber": "PO-1001", "supplierName": "Supplier Inc", "items": [...] }` |
| `GET` | `/invoices` | Fetch customer invoices | None |
| `POST` | `/invoices` | Generate sales invoice | `{ "invoiceNumber": "INV-5001", "customerId": "c1", "totalAmount": 1200 }` |

---

## 7. Environment Variables & Setup Guide

### **Required Environment Variables**
- **`DATABASE_URL`**: Neon PostgreSQL connection URI (`postgresql://neondb_owner:npg_NYOZ7pKI0VuU@ep-square-cell-az2du0fl.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`)
- **`PORT`**: Server execution port for local development (`4000`)

### **Local Environment Execution**
```bash
# 1. Clone the project repository
git clone https://github.com/kotagirisrilaxmi06/trade-flow-.git
cd trade-flow-

# 2. Install all root and subpackage dependencies
npm install

# 3. Start local development environment
npm run dev

# 4. Build production static bundle & verify TypeScript compilation
npm run build
```

---

## 8. Verification & Case Study Checklist

- [x] **Backend REST API**: Node.js + Express + TypeScript with full error handling.
- [x] **Frontend Admin UI**: Responsive React UI featuring modern glassmorphism, brand logo, and CSS animations.
- [x] **PostgreSQL Integration**: Live connection to Neon Cloud PostgreSQL with seed data.
- [x] **Core Business Logic**: Inventory validation, non-negative stock protection, challan numbering.
- [x] **Vercel Cloud Deployment**: Production web hosting with serverless API integration.
- [x] **Full Case Study Documentation**: Detailed README, deployment steps, and Postman API collection.
