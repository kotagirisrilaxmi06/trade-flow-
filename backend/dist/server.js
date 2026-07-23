import express from 'express';
import cors from 'cors';
import { loadState, saveState } from './dataStore.js';
import { buildChallanNumber, calculateTotals, canConfirmChallan, createChallanSnapshot } from './domain/challanLogic.js';
const app = express();
app.use(cors());
app.use(express.json());
const state = loadState();
function getUserByEmail(email) {
    return state.users.find((user) => user.email === email);
}
function writeState() {
    saveState(state);
}
app.post('/auth/login', (req, res) => {
    const { email, password } = req.body;
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
    const customer = req.body;
    const newCustomer = {
        ...customer,
        id: `c${Date.now()}`,
        followUps: [],
        createdAt: new Date().toISOString()
    };
    state.customers.push(newCustomer);
    writeState();
    res.status(201).json(newCustomer);
});
app.post('/customers/:id/follow-ups', (req, res) => {
    const customer = state.customers.find((entry) => entry.id === req.params.id);
    if (!customer) {
        return res.status(404).json({ message: 'Customer not found.' });
    }
    const note = req.body.note;
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
    const product = req.body;
    const newProduct = {
        ...product,
        id: `p${Date.now()}`,
        createdAt: new Date().toISOString(),
        stockMovements: []
    };
    state.products.push(newProduct);
    writeState();
    res.status(201).json(newProduct);
});
app.post('/products/:id/stock-movements', (req, res) => {
    const product = state.products.find((entry) => entry.id === req.params.id);
    if (!product) {
        return res.status(404).json({ message: 'Product not found.' });
    }
    const movement = req.body;
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
app.post('/challans', (req, res) => {
    const payload = req.body;
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
const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
