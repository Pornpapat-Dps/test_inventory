// In-memory store — module singleton persists across requests in dev mode
let categoryId = 3
let productId = 0
let transactionId = 0

export const db = {
  categories: [
    { id: 1, name: 'IT' },
    { id: 2, name: 'Office Supply' },
    { id: 3, name: 'Furniture' },
  ],
  products: [],
  transactions: [],
}

export function nextCategoryId() { return ++categoryId }
export function nextProductId() { return ++productId }
export function nextTransactionId() { return ++transactionId }
