# Member 3: The Flow Integrator (Fullstack/Glue)

**Goal:** Connect the UI built by Member 2 to the Backend/APIs built by Member 1 to make the app functional.

## Step 1: Align on Types
Before writing or integrating any code, review `types/index.ts` to ensure everyone is using the exact same data shapes (Product, Transaction, etc.). Do not deviate from these types.

## Step 2: The Priority Milestone (Receipts)
Your first team goal is to make **one thing work end-to-end**: The Incoming Stock Receipt.

**Prompt to provide to Antigravity:**
> "I have this React component for an 'Incoming Stock Receipt' form [paste Member 2's code]. I also have this database function to create a receipt transaction [paste Member 1's code]. Please update the React component to call this database function when the form is submitted. Ensure it strictly uses the TypeScript interfaces from `types/index.ts`. Add a loading state to the submit button and a toast notification on success or error."

## Step 3: Implement Dashboard Filtering
Once the Receipt creation flow works seamlessly, move onto the table display logic.

**Prompt to provide to Antigravity:**
> "I have a table component displaying Inventory Transactions [paste code]. Add dynamic filtering logic to this component so the user can filter the table by 'Document Type' (using `TransactionType` from our types) and let the UI update immediately. Also add a basic filter by Location."

## Workflow Rules for Member 3
1. **Never build UI from scratch:** If a piece is missing, wait for Member 2 to build it or mock it.
2. **Never build database actions:** If an API is missing, wait for Member 1 or use mock data.
3. **Use Mock Data early:** Ask Member 1 for a `mockData.json` matching the schema so you don't have to wait for the backend to be perfectly finished.
