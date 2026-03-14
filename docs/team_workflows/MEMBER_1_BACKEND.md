# Member 1: The Backend Architect

**Your Workspace:** The `/backend` folder.

Your main job is to define the exact data structure that the rest of the team will use. You need to create the database schema and the API routes that the frontend will call.

## Your Tasks
1. **Define the Schema:** Go to `backend/database/schema.sql`. Use ChatGPT/Claude to generate the exact PostgreSQL schema for `Products`, `Locations`, `StockQuantities`, and `Transactions` based on the `CoreInventory.pdf`.
2. **Define the API Routes:** Go to `backend/api/routes.md` and document exactly what the API endpoints will look like (e.g., `POST /api/receipts`) so Member 3 knows how to call them.
3. **Setup Auth:** Set up Supabase Authentication (or your chosen Auth provider).

## Your AI Prompts
* **Prompt 1 (Schema):** "We are building an Inventory System for a hackathon. I need a clear SQL schema to track 1) Products, 2) Warehouses/Locations, 3) Stock quantities at those locations, and 4) A Ledger of transactions (receipts, deliveries, transfers). Provide the exact SQL create table statements."
* **Prompt 2 (API logic):** "Write a Node.js/Next.js function that handles an 'Internal Transfer'. It must take a product_id, quantity, from_location, and to_location, and it must atomically deduct stock from the from_location and add it to the to_location."
