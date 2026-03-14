# Member 2: The UI/UX Visionary (Frontend Components)

**Goal:** Build beautiful, responsive interfaces quickly without worrying about the backend logic initially.
**Tools:** Antigravity / Gemini Pro.

## Step 1: Standardize Data Models
Review `types/index.ts`. Any components you build must expect data that matches these structures exactly.
Use the `mockData.json` file provided in the repository to test your components visually before the real APIs are ready.

## Step 2: Dashboard Layout & Shell
Start with the overall layout of the application.

**Prompt to provide to Antigravity:**
> "Generate a modern, enterprise-grade Inventory Management Dashboard using React, Tailwind CSS, and Shadcn UI components. Needs a left sidebar with navigation (Products, Operations, Dashboard, Settings). The main view should have 4 KPI metric cards at the top: 'Total Products', 'Low/Out of Stock', 'Pending Receipts', and 'Pending Deliveries'. Below that, include a 'Recent Movements' table. Make it look premium with subtle borders and a clean layout."

## Step 3: Incoming Stock Receipt Form
This is the highest priority form for the hackathon.

**Prompt to provide to Antigravity:**
> "Create a React component for an 'Incoming Stock Receipt' form using Tailwind and React Hook Form. It needs a searchable dropdown for `Product` selection, `Quantity Received` (Must be > 0), and a `Destination Location` dropdown. Include a complete 'Validate/Submit' button. Make the UI intuitive for warehouse staff. Do not implement the actual API call, just use a placeholder function `onSubmit` that console logs the data. Use Shadcn UI forms."

## Step 4: Hand-off to Member 3
Once a UI component looks good, export the code into the Next.js project. Tell Member 3 (The Integrator) that the component is ready to be wired up to the mock data or the real backend API.
