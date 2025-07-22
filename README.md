🪑 SPOT – Sitting + Bot Dashboard
📌 Overview

SPOT is a smart office seating and employee activity tracker dashboard. Built as a modern web application, it offers real-time visualization of seating arrangements and employee presence through an interactive floor plan. It simulates MAC-based heartbeats to reflect live employee activity statuses such as:

    Present, Idle, Sleep, Remote, Absent, and Unassigned

🧠 User Preferences

    Communication Style: Simple, everyday language.

🏗️ System Architecture
✨ Frontend

    Framework: React 18 (with TypeScript)

    Styling: Tailwind CSS + shadcn/ui components

    Routing: Wouter (lightweight SPA routing)

    Form Handling: React Hook Form + Zod

    State Management: React Query (@tanstack/react-query)

    Component Libraries: Radix UI, Lucide React

    Utility Tools: Class Variance Authority

⚙️ Backend

    Server: Node.js with Express (TypeScript)

    API: RESTful APIs with route modularization

    Storage: In-memory (with Drizzle ORM setup for PostgreSQL)

    Dev Tools: Vite for hot reloads, esbuild for server bundling

    Deployment-Ready: Environment-based config for DB support

🔍 Data Models

    Employees: Name, job info, status, seat assignment

    Tables: Office layout and capacity

    Activities: Tracks all state transitions and logs with metadata

🧩 Frontend Components

    Dashboard: Real-time interactive floor plan

    Floor Plan View: Color-coded seat status visualization

    Employee Manager: Add/Edit modals with validations

    Table Manager: Admin panel for floor configuration

    Reports Page: Exportable logs and employee summaries

🟢 Employee Statuses
Status	Description	Color
Present	Active and working	Green (pulsing)
Idle	Inactive for 5+ minutes	Yellow (pulsing)
Sleep	System sleep mode	Purple (pulsing)
Remote	Working remotely	Blue
Absent	Not in the office	Red
Unassigned	No assigned seat	Gray
🔁 Data Flow

    Employee Creation: Validated with Zod schemas → API

    Seat Assignment: UI-based drag/drop or modal form

    Status Tracking: Real-time updates with logging

    Activity Logs: Timestamped actions with user metadata

    Dashboard Updates: Auto-refetch every 30s via React Query

    Reports: Exportable data from activity logs

🧩 External Dependencies
UI Libraries

    Radix UI: Accessible and composable UI primitives

    Lucide React: Icon set

    Class Variance Authority: For style variants

Database (Optional but Ready)

    Drizzle ORM: Type-safe queries

    Neon DB (PostgreSQL): Serverless, cloud-native

    Schema Validation: drizzle-zod for runtime safety

Development Tools

    Replit Integration: Dev-specific plugins

    Error Overlay + HMR: Real-time dev feedback

    Vite + esbuild: Fast bundling and builds

🚀 Deployment Strategy
🧪 Development Mode

    Vite dev server for frontend

    Express backend with live API

    Hot reload for client & server

    Replit dev environment support

📦 Production Mode

    Frontend built to static files (served via Express)

    Server bundled via esbuild

    Environment-aware DB setup

    Schema migrations via:

    npm run db:push

⚙️ Configurations
🛠️ Replit .replit Config

run = ["npm", "run", "start"]

hidden = [
  ".config",
  ".git",
  "generated-icon.png",
  "node_modules",
  "dist"
]

[env]
PORT = "5432"
DATABASE_URL = "postgresql://username:password@localhost:5432/your_db_name"

[deployment]
deploymentTarget = "autoscale"
build = ["npm", "run", "build"]
run = ["npm", "run", "start"]

[[ports]]
localPort = 5432
externalPort = 80

[workflows]
runButton = "Project"

[[workflows.workflow]]
name = "Project"
mode = "parallel"
author = "agent"

[[workflows.workflow.tasks]]
task = "workflow.run"
args = "Start application"

[[workflows.workflow]]
name = "Start application"
author = "agent"

[[workflows.workflow.tasks]]
task = "shell.exec"
args = "npm run dev"
waitForPort = 5432

🧪 Future Improvements

    Switch from in-memory to PostgreSQL via Drizzle ORM

    Role-based access control (RBAC)

    Real-time WebSocket sync for collaborative views

    Heatmap-based analytics for seat utilization
