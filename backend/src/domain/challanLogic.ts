import type { Challan, ChallanItemSnapshot, Product } from '../types.js';

export interface ChallanConfirmationResult {
  ok: boolean;
  error?: string;
}

export function canConfirmChallan(items: ChallanItemSnapshot[], products: Product[]): ChallanConfirmationResult {
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

export function buildChallanNumber(): string {
  const date = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  return `CH-${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${Math.floor(Math.random() * 9000 + 1000)}`;
}

export function createChallanSnapshot(items: Array<{ productId: string; productName: string; sku: string; unitPrice: number; quantity: number }>): ChallanItemSnapshot[] {
  return items.map((item) => ({
    productId: item.productId,
    productName: item.productName,
    sku: item.sku,
    unitPrice: item.unitPrice,
    quantity: item.quantity,
    lineTotal: item.unitPrice * item.quantity
  }));
}

export function calculateTotals(items: ChallanItemSnapshot[]) {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.lineTotal, 0);
  return { totalQuantity, totalAmount };
}
