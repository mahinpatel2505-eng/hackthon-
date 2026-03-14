# Member 1: The Data & Auth Architect (Backend/Schema)

**Goal:** Build the foundation so the others have real data to connect to.
**Tools:** Antigravity / Gemini Pro.

## Step 1: Align on Types & API Contract
Before writing or integrating any code, review `types/index.ts` to ensure everyone is using the exact same data shapes (`Product`, `Transaction`, etc.).
Also review `docs/API_CONTRACT.md` which defines the endpoints and inputs/outputs needed by the frontend.

## Step 2: Database Schema (Supabase/Prisma)
Generate the database schema using the exact types defined in `types/index.ts`. 

**Prompt to provide to Antigravity:**
> "We are building an Inventory Management System (CoreInventory) for a hackathon using [Next.js/Supabase/Prisma - based on your choice]. Here are the TypeScript interfaces we agreed upon: [paste contents of `types/index.ts`]. Please provide the exact SQL schema definition or Prisma schema that matches this perfectly, along with foreign key relationships."

## Step 3: Core API Endpoints (Transactions)
Focus on the most critical endpoints first: creating a "Receipt" transaction.

**Prompt to provide to Antigravity:**
> "Based on the schema we just created, write a Server Action (or API route) for creating a 'Receipt' transaction. It must strictly match the `API_CONTRACT.md` [paste API contract for receipt]. It takes a productId, quantity, toLocationId, and userId. It must update the `StockQuantity` table and the `Transaction` table in a single database transaction to prevent inconsistencies."

## Step 4: Continue with remaining APIs
Once "Receipts" are working, move on to "Deliveries" and "Internal Transfers". Remember to notify Member 3 (The Flow Integrator) as each endpoint becomes available.
