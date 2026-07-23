# TradeFlow ERP CRM Portal

This project is a compact full-stack ERP/CRM portal built for the case study assignment. It supports customer management, inventory, purchase orders, sales challans, invoices, and CRM follow-ups for internal operations teams.

- Authentication with seeded demo users
- Customer CRM management
- Product and inventory management
- Stock movement logging
- Sales challan creation with stock validation
- Responsive admin-style React frontend

## Tech stack

- Backend: Node.js, TypeScript, Express
- Frontend: React, TypeScript, Vite
- Data storage: JSON file in the backend workspace for the MVP

## Project structure

- backend/: Express API and JSON-backed data store
- frontend/: React app for the UI

## Quick start

### Backend

```bash
cd backend
npm install
npm run dev
```

The API runs on http://localhost:4000.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The UI runs on http://localhost:5173.

For deployed environments, set the frontend environment variable VITE_API_URL to your backend URL.

## Environment variables

### Backend
Create a .env file in the backend folder with:

```env
PORT=4000
CORS_ORIGIN=http://localhost:5173
DATA_FILE_PATH=./data/app-data.json
```

### Frontend
Create a .env file in the frontend folder with:

```env
VITE_API_URL=http://localhost:4000
```

## AWS deployment notes

A simple AWS-friendly deployment approach is:

1. Host the frontend on S3 + CloudFront or a static hosting service such as Vercel.
2. Host the backend on EC2, Elastic Beanstalk, or App Runner.
3. Set the backend environment variables for PORT, CORS_ORIGIN, and DATA_FILE_PATH.
4. Set the frontend environment variable VITE_API_URL to the deployed backend URL.

### Example EC2 / Node.js setup

```bash
sudo apt update
sudo apt install -y nodejs npm
cd /home/ubuntu/app/backend
npm install
npm run build
PORT=4000 CORS_ORIGIN=https://your-frontend-domain.com npm start
```

## GitHub and commit workflow

1. Initialize a Git repository if not already present.
2. Commit changes with clear messages such as:
   - `feat: add purchase order and invoice workflows`
   - `docs: add AWS deployment instructions`
   - `chore: add environment variable examples`
3. Push the repository to GitHub and keep the main branch updated.

## Demo credentials

- Admin: admin@example.com / password123
- Sales: sales@example.com / password123
- Warehouse: warehouse@example.com / password123
- Accounts: accounts@example.com / password123

## API overview

- POST /auth/login
- GET /customers
- POST /customers
- PUT /customers/:id
- POST /customers/:id/follow-ups
- GET /products
- POST /products
- PUT /products/:id
- POST /products/:id/stock-movements
- GET /challans
- POST /challans

## Notes

- This is an MVP and uses a JSON file for persistence.
- Confirmed challans reduce stock and reject insufficient-stock requests.
- Deployment and Docker support can be added next if desired.
