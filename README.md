# Employee360 — AI-Powered Enterprise Workforce Management Platform

Employee360 is an enterprise-grade cloud-native HR and workforce platform built to showcase a complete DevOps lifecycle across **DEV → TEST → PROD** environments on Microsoft Azure.

---

## 🌟 Key Capabilities
- **React Frontend:** Modern responsive single-page web portal with executive KPI dashboard, employee directory, leave management workflows, and an interactive Cloud DevOps topology viewer.
- **.NET 8 Web API:** High-performance RESTful API with Entity Framework Core, JWT authentication, and Swagger documentation.
- **AI HR Copilot:** Intelligent assistant capable of natural language personnel queries, executive profile summaries, and policy lookup (Azure OpenAI integration ready).
- **Docker Multi-Stage Containers:** Production-optimized lightweight containers for both Frontend and Backend tiers.
- **Azure Cloud Ready:** Configured for Azure App Service (Containers), Azure SQL, Azure Key Vault, Application Insights, and Azure Container Registry.

---

## 📁 Repository Structure
```text
E:\employee360/
├── docker-compose.yml              # Local multi-container full stack
├── .gitignore
├── README.md
│
├── src/
│   ├── backend/
│   │   ├── Dockerfile              # Multi-stage .NET 8 build
│   │   └── Employee360.API/
│   │       ├── Controllers/        # Auth, Employees, Leaves, Copilot, Health
│   │       ├── Models/             # Domain entities and DTOs
│   │       ├── Data/               # EF Core DbContext & Seed Initializer
│   │       ├── Services/           # AIService & AuthService
│   │       ├── Program.cs
│   │       └── appsettings.json
│   │
│   └── frontend/
│       ├── Dockerfile              # Multi-stage Node 20 + Nginx Alpine build
│       ├── nginx.conf              # Reverse proxy configuration
│       ├── package.json
│       ├── vite.config.js
│       ├── index.html
│       └── src/
│           ├── App.jsx             # Comprehensive HR & DevOps UI
│           ├── main.jsx
│           └── index.css
│
├── terraform/                      # (Phase 3/4: Azure IaC Modules)
└── pipelines/                      # (Phase 5: Azure DevOps YAML Pipelines)
```

---

## 🚀 Quick Start (Local Run)

### Option 1: Run with Docker Compose (Recommended)
You do not need .NET or Node installed locally. Simply run:

```bash
cd E:\employee360
docker compose up --build
```

- **Frontend Application:** Open `http://localhost:3000`
- **Backend Swagger API Docs:** Open `http://localhost:5000/swagger`
- **Health Live Probe:** Open `http://localhost:5000/health/live`
- **Health Ready Probe:** Open `http://localhost:5000/health/ready`

### Option 2: Run Frontend Locally with Node.js
```bash
cd E:\employee360\src\frontend
npm install
npm run dev
```

---

## 🔄 Environments Topology
- **DEV:** `rg-emp360-dev`
- **TEST:** `rg-emp360-test`
- **PROD:** `rg-emp360-prod`
- **SHARED:** `rg-emp360-shared` (ACR, Key Vault, Application Insights, Azure OpenAI)
