# Member 3: The API Integrator

**Your Workspace:** You will jump between both `/frontend` and `/backend` folders.

Your main job is to **integrate** Member 1's backend logic with Member 2's frontend UI. You make the app actually "work".

## Your Tasks
1. **Define the Data Contract:** Go to `docs/API_CONTRACT.md` and define the agreed-upon TypeScript Types for the application immediately (e.g., `type Product = { id: string, name: string }`). Ensure Member 1 and Member 2 use these exact types!
2. **Connect the Dots:** Take Member 2's forms (e.g., `frontend/operations/receipts.tsx`) and add the fetching logic using `fetch` or a tool like React Query to actually call Member 1's endpoint (e.g., `POST /api/receipts`).
3. **Handle State & Errors:** Ensure the UI shows a Loading spinner when submitting data and a Success/Error toast message when the API responds.

## Your AI Prompts
* **Prompt 1 (Integrating Frontend & Backend):** "I have this React component built by my teammate (paste Member 2's code). I also have this API endpoint built by another teammate (paste Member 1's code). Please update the React component to call the API when the user presses 'Submit'. Add proper error handling and a loading state."
* **Prompt 2 (Filtering Logic):** "I have an array of Transaction objects and a Table displaying them. I need to add filter logic so the user can filter the table by Document Type (Receipts, Delivery, Internal, Adjustments) and by Status. Please write the sorting and filtering function."
