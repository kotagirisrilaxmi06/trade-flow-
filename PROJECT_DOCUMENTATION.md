# TradeFlow ERP + CRM Operations Portal
## Executive Technical & Architecture Blueprint

---

## 1. Executive Summary & Business Context

**TradeFlow Operations Portal** is an enterprise-grade, cloud-native Mini ERP and CRM platform engineered specifically for wholesale, distribution, and supply chain operations.

The system unifies multi-department workflows into a single high-performance dashboard:
- **Sales & CRM Operations**: Lead lifecycle management, customer profiling, timestamped follow-up logs, and automated sales challan issuance.
- **Inventory & Warehouse Operations**: SKU tracking, minimum stock alert triggers, automated stock movement logging (IN/OUT), and inventory guardrails preventing negative stock.
- **Finance & Accounts Operations**: Purchase order tracking, billing invoice generation, and real-time payment status tracking.
- **Executive Administration**: System-wide role-based access control (RBAC), audit oversight, and operational insights.

---

## 2. Live System Matrix & Submission Credentials

| System Layer | Environment / Hosting | Target URL / Reference |
| :--- | :--- | :--- |
| **GitHub Source Code** | GitHub Cloud Repository | [github.com/kotagirisrilaxmi06/trade-flow-](https://github.com/kotagirisrilaxmi06/trade-flow-) |
| **Live Web App (UI)** | Vercel Static Hosting | [trade-flow-cnc8oix2v-kotagirisrilaxmi06s-projects.vercel.app](https://trade-flow-cnc8oix2v-kotagirisrilaxmi06s-projects.vercel.app) |
| **Live Serverless API** | Vercel Serverless Functions | [trade-flow-cnc8oix2v-kotagirisrilaxmi06s-projects.vercel.app/health](https://trade-flow-cnc8oix2v-kotagirisrilaxmi06s-projects.vercel.app/health) |
| **Database Cluster** | Neon Cloud PostgreSQL | PostgreSQL 18.4 (AWS ap-southeast-1) |
| **API Test Suite** | Postman Collection | [`postman_collection.json`](https://github.com/kotagirisrilaxmi06/trade-flow-/blob/main/postman_collection.json) |

### **Role-Based Access Control Credentials**:
- **Admin**: `admin@example.com` / `password123` *(Full System Access)*
- **Sales**: `sales@example.com` / `password123` *(CRM & Challans Workflows)*
- **Warehouse**: `warehouse@example.com` / `password123` *(Products & Stock Movements)*
- **Accounts**: `accounts@example.com` / `password123` *(PO & Invoice Workflows)*

---

## 3. High-Level Architecture & Technology Stack

The platform is constructed using a **Unified Monorepo Architecture** running serverless on Vercel with an SSL-encrypted PostgreSQL cloud backend.

```mermaid
graph TD
    Client[React 18 + Vite Web App] -->|HTTPS REST API| VercelRouter[Vercel Serverless Gateway]
    VercelRouter -->|Static Assets| ViteDist[Vite Compiled /dist]
    VercelRouter -->|API Rewrites /api/*| ServerlessFunc[Serverless Node.js Handler /api/index.ts]
    ServerlessFunc -->|Express Application| ExpressApp[Express REST API Middleware]
    ExpressApp -->|Domain Guardrails| InventoryEngine[Atomic Stock & Validation Engine]
    ExpressApp -->|node-postgres Pool| NeonPostgres[(Neon Cloud PostgreSQL Database)]
```

### **Tech Stack Breakdown**:
- **Frontend Core**: React 18, TypeScript, Vite, CSS with glassmorphism aesthetics, brand logo, and smooth micro-animations.
- **Serverless API**: Node.js, TypeScript, Express.js deployed to Vercel Serverless Functions (`api/index.ts`).
- **Database Engine**: Neon Cloud PostgreSQL (PostgreSQL 18.4) with connection pooling (`pg.Pool`).
- **DevOps**: Vercel CI/CD pipeline integrated directly with GitHub `main` branch pushes.

---

## 4. Core Modules & Business Logic Specifications

### **4.1 Authentication & Role-Based Access Control**
Secures system actions based on assigned user roles:
- **Admin**: Full read/write access across all system modules.
- **Sales**: Customer CRM creation, editing, follow-up notes, and draft/confirmed sales challans.
- **Warehouse**: Product cataloging, manual stock adjustments, and movement history auditing.
- **Accounts**: Purchase order processing and invoice issuance.

---

### **4.2 Customer CRM Module**
Manages customer entities throughout the sales funnel:
- **Attributes**: Name, Mobile, Email, Business Name, GST Number (Optional), Customer Type (`Retail`, `Wholesale`, `Distributor`), Physical Address, Status (`Lead`, `Active`, `Inactive`), and Follow-up Date.
- **Follow-up Log System**: Timestamped history entries appended directly to customer records.

---

### **4.3 Product & Inventory Management Engine**
- **Catalog Fields**: Product Name, SKU/Code, Category, Unit Price, Current Stock, Minimum Stock Alert Quantity, and Warehouse Location.
- **Immutable Stock Movement Auditing**: Records all stock events:
  - Movement Type: `IN` (Receiving) or `OUT` (Dispatching)
  - Quantity Changed
  - Audit Reason & Responsible User Email
  - ISO Timestamp

---

### **4.4 Sales Challan Lifecycle & Inventory Guardrails**
- **Automatic Challan Numbering**: Generates `CH-YYYYMMDD-XXXX`.
- **Immutable Snapshot Storage**: Stores full product data (name, SKU, unit price) at the time of sale to preserve transaction integrity regardless of future price changes.
- **Atomic Inventory Guardrail**:
  - When status changes to **`Confirmed`**, stock availability is checked line by line.
  - If requested quantity exceeds available stock (`currentStock < quantity`), the API aborts the transaction and returns HTTP `400 Bad Request` with an explicit error message.
  - On valid confirmation, stock is automatically decremented.

---

### **4.5 Purchase Orders & Invoices**
- **Purchase Orders**: Tracks supplier orders, order items, total amounts, and delivery status (`Draft`, `Approved`, `Received`).
- **Invoices**: Generates billing invoices linked to customer records and challans with payment status tracking (`Draft`, `Issued`, `Paid`).

---

## 5. Database Schema & Data Models

The system runs on **PostgreSQL** with relational tables using `JSONB` document payloads for flexible entity management:

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

## 6. API Endpoint Technical Contract

| Method | Endpoint | Description | Expected Status Codes |
| :--- | :--- | :--- | :---: |
| `GET` | `/health` | Server status health check | `200` |
| `POST` | `/auth/login` | User authentication | `200`, `400`, `401` |
| `GET` | `/customers` | List all customer profiles | `200` |
| `POST` | `/customers` | Register new customer | `201`, `400` |
| `PUT` | `/customers/:id` | Update customer record | `200`, `404` |
| `POST` | `/customers/:id/follow-ups` | Add follow-up note | `201`, `400`, `404` |
| `GET` | `/products` | List product catalog | `200` |
| `POST` | `/products` | Create product item | `201`, `400` |
| `PUT` | `/products/:id` | Update product details | `200`, `404` |
| `POST` | `/products/:id/stock-movements` | Log stock IN/OUT movement | `201`, `400`, `404` |
| `GET` | `/challans` | List sales challans | `200` |
| `POST` | `/challans` | Issue sales challan (with stock checks) | `201`, `400`, `404` |
| `GET` | `/purchase-orders` | List purchase orders | `200` |
| `POST` | `/purchase-orders` | Issue purchase order | `201`, `400` |
| `GET` | `/invoices` | List customer invoices | `200` |
| `POST` | `/invoices` | Generate sales invoice | `201`, `400`, `404` |

---

## 7. Local Setup & Execution Guide

### **Requirements**
- Node.js (v18+)
- npm (v9+)

### **Commands**
```bash
# 1. Clone repository
git clone https://github.com/kotagirisrilaxmi06/trade-flow-.git
cd trade-flow-

# 2. Install dependencies
npm install

# 3. Environment configuration (.env)
DATABASE_URL=postgresql://neondb_owner:npg_NYOZ7pKI0VuU@ep-square-cell-az2du0fl.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require

# 4. Start development mode
npm run dev

# 5. Build production bundle
npm run build
```
