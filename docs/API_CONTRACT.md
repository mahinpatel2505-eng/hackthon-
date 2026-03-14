# API Contract & Server Actions

This document outlines the expected inputs and outputs for the CoreInventory API / Server Actions.
This ensures Member 1 (Backend) and Member 3 (Integrator) can work independently without conflicts.

## Core Reference Data

### 1. `getProducts()`
- **Method:** GET (or Server Action read)
- **Input:** None (optional search query)
- **Output:** `Product[]`

### 2. `getLocations()`
- **Method:** GET
- **Input:** None
- **Output:** `Location[]`

### 3. `getStockQuantities(locationId?: string)`
- **Method:** GET
- **Input:** Optional `locationId`
- **Output:** `StockQuantity[]`

## Transactions

### 4. `createReceiptTransaction(data)`
- **Method:** POST
- **Input:**
  ```typescript
  {
    type: 'RECEIPT';
    productId: string;
    quantity: number;
    toLocationId: string;
    userId: string;
  }
  ```
- **Output:** `Transaction` (The newly created transaction record)

### 5. `createDeliveryTransaction(data)`
- **Method:** POST
- **Input:**
  ```typescript
  {
    type: 'DELIVERY';
    productId: string;
    quantity: number;
    fromLocationId: string;
    userId: string;
  }
  ```
- **Output:** `Transaction`

### 6. `getRecentTransactions(limit?: number)`
- **Method:** GET
- **Input:** Optional `limit` (default: 50)
- **Output:** `Transaction[]`
