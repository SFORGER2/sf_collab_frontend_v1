# SFCOLAB - Project Collaboration Guide

## 📌 Branching Strategy & Workflow
To maintain organized development, follow these rules:

1. **Do NOT push directly to `main` branch**
2. **Each developer works on their own branch**

---

## 🛠️ Setup & Development
1. **Clone the repo:**
   ```bash
   git clone [repo-url]
   cd [repo-name]
   git checkout -b [your-branch-name]
2. **Create and switch to your branch:**
   ```bash
   git clone [repo-url]
   cd [repo-name]
   git checkout -b [your-branch-name]
3. **Commit and push changes:**
   ```bash
   git add .
   git commit -m "Descriptive commit message"
   git push origin [your-branch-name]

⚠️ Important Notes: 
- Never force-push to shared branches
- Always pull latest changes before pushing.

---

## 🚀 ERP MVP - Recent Changes (Frontend)

The following changes have been implemented as part of the ERP MVP Phase 1 (Frontend):

### ✨ Key Features Added
- **Task Board UI (`/erp/tasks`):**
  - Interactive Kanban Board (To Do, In Progress, Done).
  - Toggleable List View for detailed task management.
  - Features for creating tasks, assigning users, and updating status.
- **Admin Settings UI (`/erp/admin-settings`):**
  - **User Management:** View and manage workspace members and roles.
  - **Holiday System:** Interface for setting workspace holidays.
  - **Workspace Settings:** General configuration for workspace name and defaults.
- **Execution Dashboard UI (`/erp/execution`):**
  - High-fidelity KPI grid with real-time status signals.
  - Interactive "Submit Proof" workflow with multi-stage verification.
  - Formula breakdowns and activity auditing details.
- **Navigation Integration:**
  - Integrated a new **ERP Section** in the sidebar containing the Task Board and Admin Settings.

### 📁 Modified/Added Files
#### [NEW] New Components
- `src/components/pages/erp/TaskBoard.jsx`
- `src/components/pages/erp/AdminSettings.jsx`
- `src/components/pages/erp/data/` (Modular mock data storage)

#### [MODIFY] Existing Files
- `src/App.jsx`: Registered new ERP routes and imported components.
- `src/components/pages/erp/ExecutionDashboard.jsx`: Refactored to SF-OS standard with high-fidelity proof workflow.
- `src/components/pages/sidebars/sidebarCommons.jsx`: Added `erpSection` logic.
- `src/components/pages/sidebars/sidebar/links.jsx`: Integrated the ERP section into the main sidebar structure.

