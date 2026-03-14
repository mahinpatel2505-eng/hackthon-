# Phase 2: The Integration Hand-off

Awesome job Member 1! With the backend ready, it is time for Member 2 and Member 3 to shine.

## 🎨 Member 2 (UI/UX) - The Pivot
Since Member 1 has finalized the API, your components need to be ready to consume them.
1. **Push your code:** Ensure all your UI components (Forms, Tables, Dashboard metrics) are pushed to your GitHub branch.
2. **Review the API Contract:** Open `docs/API_CONTRACT.md`. Ensure that your forms are collecting *exactly* the data required by Member 1's endpoints.
   * *Example:* If the `createReceiptTransaction` requires a `productId` and a `toLocationId`, verify your dropdowns supply those specific IDs, not just string names.
3. **Notify Member 3:** Alert the Integrator that your branch is ready for wiring.

## 🧠 Member 3 (The Integrator) - The Final Boss
This is where the magic happens. You hold the keys to making the app actually work.

### Step 1: Merge Operations
1. Pull Member 1's backend branch.
2. Pull Member 2's UI branch.
3. Merge both into `main` (resolve any minor file structure conflicts gracefully).

### Step 2: Wiring the Forms (Using Antigravity)
Open the form component built by Member 2 (e.g., `ReceiptForm.tsx`).

**Prompt to provide to Antigravity:**
> "I am the Integrator for our hackathon team. 
> Here is the UI form component built by Member 2: [paste `ReceiptForm.tsx`]. 
> Here is the Server Action/API endpoint built by Member 1: [paste Member 1's API code or reference it].
> 
> Please update the UI component so that when `onSubmit` is triggered, it correctly calls Member 1's Server Action. 
> 1. Handle loading states (disable the submit button while waiting).
> 2. Show a success/error toast notification upon completion.
> 3. Ensure the exact interface from `types/index.ts` is maintained. Take your time to map the form fields to the API payload perfectly."

### Step 3: Wiring Data Fetching
Replace any `mockData.json` usage with live calls to the database.

**Prompt to provide to Antigravity:**
> "Here is our Dashboard component using mock data: [paste code]. Please refactor this to use the live `getRecentTransactions` and `getStockQuantities` functions from our backend. Implement a clean loading skeleton while the data fetches."

### Step 4: End-to-End Test
Run the app. Create a receipt. Then check the dashboard. Did the stock increase? If yes, celebrate. If no, feed the error directly into Antigravity to debug it instantly.
