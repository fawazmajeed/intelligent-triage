# TriageFlow AI

**Intelligent IT Service Management Triage & Routing Platform**

TriageFlow AI is a multi-tool automation platform that unifies your ITSM ecosystem. It uses AI to automatically classify, prioritize, and route support tickets across ServiceNow, Jira, Zendesk, Freshservice, and more — all from a single pane of glass.

## 🚀 Key Features

- **AI-Powered Ticket Classification** — Automatically categorize, assign severity, and route tickets to the right team using trained AI models.
- **Multi-Platform Integration** — Connect ServiceNow, Jira Service Management, Zendesk, Freshservice, BMC Remedy, and more via webhooks or REST APIs.
- **Live Triage Queue** — Real-time dashboard showing incoming tickets, AI predictions, confidence scores, and sync status.
- **Historical Training Data** — Upload CSV training data to fine-tune AI classification for your organization's specific categories, teams, and severity levels.
- **ROI Calculator** — Quantify time and cost savings from automated triage vs. manual routing.
- **Analytics Dashboard** — Track classification accuracy, ticket volumes, team workloads, and platform distribution over time.
- **Raw Payload Inspection** — View inbound webhook payloads and outbound API responses for full audit trail visibility.

## 🛠 Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend:** Lovable Cloud (Supabase) — authentication, database, edge functions
- **AI:** Lovable AI gateway for ticket classification
- **Animations:** Framer Motion
- **Charts:** Recharts

## 📦 Getting Started

### Prerequisites

- Node.js 18+ & npm

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd triageflow-ai

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/              # shadcn/ui primitives
│   ├── AIConfigSection  # AI training data & config
│   ├── AIInsightsPanel  # Ticket detail + raw payloads
│   ├── AppLayout        # Main app shell
│   ├── AppSidebar       # Navigation sidebar
│   ├── MetricsRibbon    # KPI metrics strip
│   ├── ROICalculator    # ROI estimation tool
│   ├── TriageTable      # Live triage queue with search
│   └── TrialBanner      # Trial/license status banner
├── contexts/            # Auth context provider
├── hooks/               # Custom React hooks
├── lib/                 # Utilities & mock data
├── pages/               # Route-level page components
│   ├── Index            # Landing page
│   ├── Auth             # Login/signup
│   ├── Analytics        # Analytics dashboard
│   ├── IntegrationHub   # Platform connections
│   └── Settings         # Org settings & AI config
└── integrations/        # Supabase client & types
```

## 🔐 Authentication

TriageFlow AI uses email-based authentication with email verification. Users are associated with organizations, and role-based access control (admin/operator) governs permissions.

## 🌐 Deployment

This project is deployed via [Lovable](https://lovable.dev).

- **Live URL:** [triageflowai.lovable.app](https://triageflowai.lovable.app)

## 📄 License

Proprietary — All rights reserved.
