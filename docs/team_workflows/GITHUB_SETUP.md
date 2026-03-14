# The "Fail-Proof" GitHub Setup Guide

If the team is stuck connecting their code, follow these exact steps to get everyone on the same repository without conflicts.

## Part 1: The Repo Owner (Member 3 - The Integrator)
*Member 3 is in charge of creating the official repository.*

1. **Create the Repo on GitHub.com:**
   - Go to [GitHub.com](https://github.com/new).
   - Name it `CoreInventory-Hackathon`.
   - Ensure it is set to **Public** or **Private**.
   - **Do not** check "Add a README file" (keep it completely empty).
   - Click "Create repository".

2. **Initialize the Local Code:**
   Open your terminal in the `Hackthon` folder on your computer and run these exact commands:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Hackathon starting"
   ```

3. **Link Local to GitHub:**
   Run the commands GitHub provided on the empty repo page. They look like this:
   ```bash
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/CoreInventory-Hackathon.git
   git push -u origin main
   ```

4. **Invite the Team:**
   - Go to the repository on GitHub.
   - Click **Settings** -> **Collaborators** -> **Add people**.
   - Type in the GitHub usernames for Member 1 and Member 2 and send the invites.

---

## Part 2: Team Members (Member 1 & Member 2)
*Members 1 & 2 need to download the base code and create their own workspaces.*

1. **Accept the Invite:** Check your email or GitHub notifications to accept Member 3's invitation.
2. **Clone the Repo:** Open your terminal and run:
   ```bash
   git clone https://github.com/YOUR_USERNAME/CoreInventory-Hackathon.git
   cd CoreInventory-Hackathon
   ```
3. **Create Your Isolated Branch:** You must **never** work on the `main` branch directly.
   - **Member 1 (Backend) run:** `git checkout -b backend-dev`
   - **Member 2 (UI) run:** `git checkout -b ui-dev`

---

## Part 3: How to Work Together (The Core Loop)

Whenever a team member finishes a piece of work (like an API endpoint or a UI form), they must follow this loop.

**Step 1: Save and Push (Member 1 or 2)**
```bash
git add .
git commit -m "Added the new Inventory Dashboard UI"
git push origin backend-dev # (or ui-dev)
```

**Step 2: Create a Pull Request (PR)**
- Go to the GitHub repository page in your browser.
- You will see a yellow banner saying "backend-dev had recent pushes". Click **Compare & pull request**.
- Click **Create pull request**.

**Step 3: Review and Merge (Member 3)**
- Member 3 goes to the "Pull requests" tab on GitHub.
- Reviews the code.
- Clicks **Merge pull request**.

**Step 4: Everyone Updates (CRITICAL)**
Whenever Member 3 merges a PR into `main`, Members 1 and 2 must immediately run these commands in their terminals to get the latest code without deleting their own work:
```bash
git fetch origin
git merge origin/main
```

---

## Next Steps: What To Do After Git Is Setup
Once all three members have successfully cloned the repo and created their `backend-dev` and `ui-dev` branches:

1. **Member 1** pastes the Prisma/Supabase schema into the code and pushes their first PR.
2. **Member 2** pastes their Antigravity-generated React components into the `components/` folder and pushes their first PR.
3. **Member 3** merges both PRs, runs the app locally, and wires the UI to the backend using `PHASE_2_INTEGRATION.md`.
