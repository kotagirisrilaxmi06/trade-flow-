# TradeFlow ERP + CRM Operations Portal

> **Full Stack Developer Case Study Assignment Submission**  
> A compact, production-ready ERP/CRM system designed for wholesale and distribution companies. It handles customer management, product inventory, stock movement logging, sales challans with automatic stock validation, purchase orders, invoices, and role-based access.

---

## 🚀 Live Submission Links

- **GitHub Repository**: [https://github.com/kotagirisrilaxmi06/trade-flow-](https://github.com/kotagirisrilaxmi06/trade-flow-)
- **Live Frontend Application**: [https://trade-flow-cnc8oix2v-kotagirisrilaxmi06s-projects.vercel.app](https://trade-flow-cnc8oix2v-kotagirisrilaxmi06s-projects.vercel.app)
- **Live Backend API**: [https://trade-flow-cnc8oix2v-kotagirisrilaxmi06s-projects.vercel.app/health](https://trade-flow-cnc8oix2v-kotagirisrilaxmi06s-projects.vercel.app/health)
- **Postman Collection**: [`postman_collection.json`](./postman_collection.json) in the repository root

---

## 🔑 Test Credentials for All Roles

| Role | Email | Password | Allowed Workflows |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@example.com` | `password123` | Full access across all modules, settings, and team tracking |
| **Sales** | `sales@example.com` | `password123` | Customer CRM, Follow-up notes, Sales Challans creation |
| **Warehouse** | `warehouse@example.com` | `password123` | Product stock management, Stock IN/OUT movement logs |
| **Accounts** | `accounts@example.com` | `password123` | Invoices and Purchase Order financial tracking |

---

## 🛠️ Required Tech Stack

### **Backend**
- **Runtime**: Node.js & TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (Hosted on **Neon Cloud PostgreSQL**)
- **Driver**: Node `pg` (PostgreSQL Client Pool with SSL)
- **APIs**: REST APIs with input validation, error handling, and standard HTTP status codes

### **Frontend**
- **Framework**: React 18 + TypeScript + Vite
- **UI & Styling**: Vanilla CSS with modern glassmorphic design, subtle float animations, and custom brand logo
- **Design Systems**: Dynamic dark mode, responsive layout across desktop and mobile devices

### **Deployment & DevOps**
- **Hosting**: Vercel (Frontend static assets + Serverless API Functions)
- **Database Hosting**: Neon Cloud PostgreSQL (`postgresql://neondb_owner:npg_...`)
- **CI/CD**: Automatic GitHub deployment triggers on push to `main` branch

---

## 🏛️ Architecture Explanation

The project uses a clean **unified monorepo design** optimized for fast development and seamless cloud deployment:

```
trade-flow/
├── api/
│   └── index.ts                 # Serverless function entry point for Vercel
├── backend/
│   ├── src/
│   │   ├── app.ts               # Express API endpoints & middleware
│   │   ├── dataStore.ts         # Neon PostgreSQL schema init & queries
│   │   ├── types.ts             # Shared TypeScript interface definitions
│   │   └── domain/
│   │       └── challanLogic.ts  # Business logic for stock validation & totals
│   └── tsconfig.json
├── frontend/
│   ├── public/
│   │   └── logo.png             # Official TradeFlow Brand Logo
│   ├── src/
│   │   ├── App.tsx              # React Admin Operations Portal UI
│   │   ├── styles.css           # Modern CSS system with glassmorphism & animations
│   │   └── main.tsx
│   └── vite.config.ts
├── vercel.json                  # Deployment routing & function configuration
├── postman_collection.json       # API endpoint test suite
└── package.json                 # Unified build scripts & root dependencies
```

### **Architecture Flow**:
1. **Frontend**: Vite builds static React bundles into `/dist`. Vercel serves these files with filesystem routing.
2. **Backend API**: Incoming API requests (`/auth/*`, `/customers*`, `/products*`, `/challans*`, `/purchase-orders*`, `/invoices*`, `/health`) are rewritten by `vercel.json` to `/api/index.ts`.
3. **Serverless Handler**: `/api/index.ts` exports the main Express `app`.
4. **Database Layer**: `dataStore.ts` connects to Neon PostgreSQL using `pg.Pool`. On first startup, `initDb()` automatically creates necessary tables (`users`, `customers`, `products`, `challans`, `purchase_orders`, `invoices`) and seeds initial user accounts.

---

## 📋 Core Modules & Business Logic

### 1. **Authentication and Roles**
- Role-based login for Admin, Sales, Warehouse, and Accounts roles.
- Returns authenticated user details upon valid credential verification.

### 2. **Customer CRM Module**
- Stores Customer Name, Mobile Number, Email, Business Name, optional GST Number, Address, Status (`Lead`, `Active`, `Inactive`), and Follow-up Date.
- Supports adding customers, editing customer profiles, searching, and logging follow-up notes.

### 3. **Product & Inventory Module**
- Tracks Product Name, SKU/Code, Category, Unit Price, Current Stock, Minimum Stock Alert Quantity, and Warehouse Location.
- **Stock Movement Log**: Tracks every quantity change with movement type (`IN` or `OUT`), reason, created by user, and timestamp.

### 4. **Sales Challan Module**
- Allows sales staff to select a customer, add multiple line items with quantities, and auto-generate unique Challan numbers (`CH-YYYYMMDD-XXXX`).
- Saves challans as `Draft` or `Confirmed`.
- **Business Logic**: When a challan is **Confirmed**, stock is automatically reduced. Stock cannot go negative; if requested quantity exceeds available stock, the API returns a proper HTTP `400` error message. Stores a snapshot of product details (product name, SKU, price) so historical challan data remains immutable.

### 5. **Purchase Orders & Invoices**
- Create and manage purchase orders from suppliers and issue customer invoices linked to sales challans.

---

## ⚙️ Environment Variables Management

| Variable | Scope | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | Backend | Neon PostgreSQL connection string (`postgresql://neondb_owner:...`) |
| `PORT` | Backend | Local server port (Default: `4000`) |
| `VITE_API_URL` | Frontend | Optional external backend URL. If omitted, relative paths are used. |

---

## 💻 Local Setup & Development

### **Prerequisites**
- Node.js (v18 or higher)
- npm (v9 or higher)

### **Steps**
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/kotagirisrilaxmi06/trade-flow-.git
   cd trade-flow-
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Set Environment Variable**:
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=postgresql://neondb_owner:npg_NYOZ7pKI0VuU@ep-square-cell-az2du0fl.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
4. **Run Development Server**:
   ```bash
   npm run dev
   ```
   - Frontend runs on: `http://localhost:5173`
   - Backend runs on: `http://localhost:4000`

5. **Build Production Assets**:
   ```bash
   npm run build
   ```

---

## ☁️ Deployment Instructions

### **Deploying to Vercel (Frontend + Serverless API)**
1. Import `kotagirisrilaxmi06/trade-flow-` into Vercel.
2. Under **Environment Variables**, add:
   - `DATABASE_URL` = `postgresql://neondb_owner:npg_NYOZ7pKI0VuU@ep-square-cell-az2du0fl.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`
3. Click **Deploy**. Vercel will automatically build the Vite React UI and deploy Express serverless functions.

---

## 📌 Assumptions Made

1. **Role Access Scope**: Client side and server API validate user roles (`Admin`, `Sales`, `Warehouse`, `Accounts`) for role-specific operations.
2. **Challan Stock Reduction**: Stock reduction occurs when a Challan is saved as `Confirmed` or updated from `Draft` to `Confirmed`.
3. **Database Auto-Initialization**: Database tables and default role users are initialized automatically upon backend API execution if they do not exist.

---

## 🚀 Known Limitations & Bonus Features

- **Bonus Completed**: PostgreSQL Database integration via Neon Cloud, automated CI/CD via GitHub Actions, and custom brand design animations.
- **Future Enhancements**: PDF export for invoices and AWS S3 direct image uploads can be enabled as additional feature modules.
