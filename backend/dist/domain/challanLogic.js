export function canConfirmChallan(items, products) {
    for (const item of items) {
        const product = products.find((candidate) => candidate.id === item.productId);
        if (!product) {
            return { ok: false, error: `Product ${item.productId} was not found.` };
        }
        if (product.currentStock < item.quantity) {
            return { ok: false, error: `Insufficient stock for ${product.name}.` };
        }
    }
    return { ok: true };
}
export function buildChallanNumber() {
    const date = new Date();
    const pad = (value) => String(value).padStart(2, '0');
    return `CH-${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${Math.floor(Math.random() * 9000 + 1000)}`;
}
export function createChallanSnapshot(items) {
    return items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        sku: item.sku,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        lineTotal: item.unitPrice * item.quantity
    }));
}
export function calculateTotals(items) {
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = items.reduce((sum, item) => sum + item.lineTotal, 0);
    return { totalQuantity, totalAmount };
}
