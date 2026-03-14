# 🔥 The "Win the Hackathon" Execution Guide 🔥

This is the ultimate, step-by-step master plan for your 3-person team. Since everyone is powered by **Antigravity / Gemini Pro**, speed and precision are your biggest advantages. The key to winning is **Parallel Execution** followed by **Seamless Integration**.

---

## Phase 1: The Parallel Sprint (Hours  1-6)
*Everyone works at exactly the same time. No one waits for anyone.*

### 👨‍💻 Member 1 (The Data Architect - Backend)
**Your Mission:** Give the app a memory.
1. Initialize the Database: Ask Antigravity to generate the exact Supabase/Prisma schemas using `types/index.ts`.
2. Deploy the DB: Run the migrations to get a live database URL.
3. Build the Core APIs: Ask Antigravity: *"Using the `API_CONTRACT.md` and `types/index.ts`, write the Next.js Server Actions (or Express routes) for creating a Stock Receipt and getting all Products."*
4. Test: Ensure you can hit the database and get a 200 OK response.

### 🎨 Member 2 (The Visionary - UI)
**Your Mission:** Make the judges say "Wow."
1. Setup Layout: Ask Antigravity: *"Build a premium, dark-mode dashboard layout using Tailwind CSS, Shadcn UI, and Lucide Icons. It needs a sidebar and a top nav."*
2. Build Components: Ask Antigravity: *"Create the 'Incoming Stock Receipt Form' using `react-hook-form` and `zod` for validation. Make it look sleek."*
3. Use Mock Data: Inject `mockData.json` into your components so they look completely functional on screen, even without a real database.

### 🧠 Member 3 (The Master Integrator - Fullstack)
**Your Mission:** Build the bridge and the "Wow Factors".
1. Setup Repo: Initialize the Next.js project and push it to GitHub. Invite Members 1 & 2.
2. Build the "Wow Factor" (The AI Chatbot): While Members 1 & 2 do the heavy lifting, build the killer feature. Ask Antigravity: *"Build a simple AI chat interface strictly using the Vercel AI SDK that allows the user to ask 'What products are low on stock?'"*
3. Enforce the Git Rule: Remind everyone: **"Do not push to main. Create PRs."**

---

## Phase 2: The Grand Connection (Hours 6-12)
*This is where most teams fail. We win here because of `API_CONTRACT.md`.*

### Member 3 Takes the Reins:
1. Member 1 pushes their Backend APIs to their branch.
2. Member 2 pushes their beautiful UI components to their branch.
3. Member 3 reviews and merges both branches into `main`.
4. **The Connection Prompt:** Member 3 asks Antigravity: *"I have Member 2's UI Component and Member 1's Server Action. Replace the `mockData` in the UI and wire the `onSubmit` function directly to the Server Action. Add a toast notification."*

### Member 1 & 2 Pivot to Enhancements:
- **Member 1:** Continue building the remaining APIs from `API_CONTRACT.md` (Deliveries, Transfers).
- **Member 2:** Build the secondary UI components (Product List Table, Settings Page, KPI Metric Cards).

---

## Phase 3: Polish & The Winning Edge (Hours 12-24)
*The app works. Now we make it indisputable.*

### The Final Checklist:
- [ ] **Data Seeding (Member 1):** Write a script to generate 100 realistic products, 5 locations, and 50 past transactions. An empty app looks boring to judges. A populated app looks like a real business.
- [ ] **Animations & Polish (Member 2):** Ask Antigravity to add Framer Motion. *"Add subtle fade-in animations to the dashboard cards and a slide-up animation for the table rows."*
- [ ] **End-to-End Test (Member 3):** Click through the entire app. Receive a product -> View it in stock -> Transfer it -> Deliver it. Fix any bugs using Antigravity.

### 🏆 The Pitch Strategy (How to demo to judges)
1. **The Hook:** Don't start by talking about code. Say: *"Inventory systems are broken. Operations freeze when data is mismatched. We built CoreInventory to fix this."*
2. **The Demo:** Show the clean UI (Member 2's work) immediately.
3. **The Proof:** Create a transaction live and show it instantly updating the KPI metric cards (Member 1's work).
4. **The Closer:** Show the AI Chatbot (Member 3's work) asking it a complex question about the live data. Drop the mic.

You have the blueprints. You have Antigravity. Go win.
