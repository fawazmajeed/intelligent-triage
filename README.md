# TriageFlow AI

**Intelligent IT Service Management Triage & Routing Platform**

TriageFlow AI is a multi-tool automation platform that unifies your ITSM ecosystem. It uses AI to automatically classify, prioritize, and route support tickets across ServiceNow, Jira, Zendesk, Freshservice, and more — all from a single pane of glass.

---

## 🚀 Key Features

- **AI-Powered Ticket Classification** — Automatically categorize, assign severity, and route tickets to the right team.
- **Multi-Platform Integration** — Connect ServiceNow, Jira SM, Zendesk, Freshservice, BMC Remedy via webhooks or REST.
- **Live Triage Queue** — Real-time dashboard with search, confidence scores, and sync status.
- **Historical Training Data** — Upload CSV data to fine-tune AI for your org's categories, teams, and severity levels.
- **ROI Calculator** — Quantify time and cost savings with configurable triage-time benchmarks.
- **Analytics Dashboard** — Track accuracy, volumes, team workloads, and platform distribution.
- **Raw Payload Inspection** — View inbound webhook payloads and outbound API responses for full audit trails.
- **Configurable Triage Time** — Set your organization's standard manual triage time (default: 8 min/ticket) in Settings for accurate ROI projections.

---

## 📖 Use Cases

### 1. Unified Multi-Tool Triage Automation
**Problem:** Organizations using 2–5 ITSM tools (e.g., ServiceNow for IT, Jira for DevOps, Zendesk for customer support) manually re-categorize and route tickets in each system.

**Solution:** TriageFlow AI ingests tickets from all platforms via webhooks, classifies them with a single AI model trained on your org's data, and pushes predictions back to each source system automatically.

**ROI Impact:** Eliminates duplicate triage effort across tools. A 5,000 ticket/month org at 8 min/ticket saves ~667 hours/month (~4 FTEs).

### 2. L1 Help Desk Acceleration
**Problem:** L1 analysts spend 60–70% of their time reading, categorizing, and routing tickets instead of resolving them.

**Solution:** TriageFlow auto-fills category, severity, and assignment group before the analyst even opens the ticket. Analysts review and confirm rather than research and decide.

**ROI Impact:** Reduces average handle time from 8 min to <1 min per ticket. A 2,000 ticket/month team recovers ~233 hours/month.

### 3. Incident Severity & Business Impact Assessment
**Problem:** Severity misclassification leads to SLA breaches, delayed response to P1/P2 incidents, and revenue loss.

**Solution:** AI evaluates ticket descriptions against trained patterns and historical data to predict severity and flag high business-impact incidents immediately.

**ROI Impact:** Reduces mean time to engage (MTTE) for critical incidents by 40–60%.

### 4. New Employee Onboarding / Knowledge Transfer
**Problem:** New L1 analysts take 2–4 weeks to learn which team handles what, how to categorize, and organizational routing rules.

**Solution:** TriageFlow AI handles classification from day one. New analysts learn routing logic by reviewing AI predictions rather than memorizing tribal knowledge.

**ROI Impact:** Reduces onboarding time from weeks to days. Consistent quality from day one.

### 5. Cross-Platform Analytics & Reporting
**Problem:** Generating consolidated reports across ServiceNow, Jira, and Zendesk requires manual data exports and spreadsheet merging.

**Solution:** TriageFlow centralizes all ticket data with normalized categories, enabling unified dashboards across all source systems.

**ROI Impact:** Saves 5–10 hours/week on reporting. Enables data-driven decisions about team capacity and tool consolidation.

### 6. ITSM Tool Migration Support
**Problem:** Migrating from one ITSM tool to another (e.g., BMC Remedy → ServiceNow) requires re-mapping categories, teams, and severity levels.

**Solution:** Run both tools in parallel through TriageFlow. The AI learns the new tool's taxonomy from training data and routes consistently during migration.

**ROI Impact:** Reduces migration risk and eliminates months of parallel manual triage.

---

## 💰 Sample ROI Calculations

All calculations use the formula:
```
Hours Recovered = (Monthly Tickets × Triage Time per Ticket) ÷ 60
Cost Savings    = Hours Recovered × Avg. Hourly Rate
FTE Equivalent  = Hours Recovered ÷ 160 hrs/month
```

| Scenario | Tickets/Month | Triage Time | Hourly Rate | Hours Saved | Cost Saved | FTE Saved |
|----------|--------------|-------------|-------------|-------------|------------|-----------|
| Small IT team | 500 | 8 min | $70 | 67h | $4,667 | 0.4 |
| Mid-size enterprise | 5,000 | 8 min | $70 | 667h | $46,667 | 4.2 |
| Large enterprise | 20,000 | 8 min | $70 | 2,667h | $186,667 | 16.7 |
| Optimized org (low triage time) | 5,000 | 2 min | $70 | 167h | $11,667 | 1.0 |
| Complex environment | 3,000 | 15 min | $85 | 750h | $63,750 | 4.7 |
| Offshore team (INR) | 10,000 | 8 min | ₹800 (~$10) | 1,333h | ₹1,066,667 | 8.3 |

> **Note:** You can customize the "Standard Triage Time" in **Settings** to match your organization's actual average. Default is 8 minutes (ITSM industry benchmark).

---

## 🔌 Integration Instructions

### Supported Platforms

| Platform | Inbound (Webhooks) | Outbound (REST API) | API Docs |
|----------|-------------------|--------------------| ---------|
| ServiceNow | ✅ Business Rules / Flow Designer | ✅ Table API (PATCH) | [docs.servicenow.com](https://docs.servicenow.com) |
| Jira Service Management | ✅ Automation Rules / Webhooks | ✅ Issue API (PUT) | [developer.atlassian.com](https://developer.atlassian.com) |
| Zendesk | ✅ Triggers & Webhooks | ✅ Tickets API (PUT) | [developer.zendesk.com](https://developer.zendesk.com) |
| Freshservice | ✅ Workflow Automator | ✅ Tickets API (PUT) | [api.freshservice.com](https://api.freshservice.com) |
| BMC Remedy / Helix | ✅ Filters & Webhooks | ✅ REST API (PATCH) | [docs.bmc.com](https://docs.bmc.com) |
| PagerDuty | ✅ Event Rules / Webhooks | ✅ Events API v2 | [developer.pagerduty.com](https://developer.pagerduty.com) |

### Step 1: Configure Inbound Webhook

Each ITSM tool sends new/updated tickets to TriageFlow via a webhook.

**ServiceNow Example:**
1. Navigate to **System Definition → Business Rules** (or **Flow Designer**)
2. Create a new rule that fires on ticket insert/update
3. Add a REST action pointing to your TriageFlow webhook endpoint:
   ```
   POST https://<your-triageflow-url>/functions/v1/categorize-ticket
   Headers:
     Content-Type: application/json
     Authorization: Bearer <your-anon-key>
   Body:
   {
     "organization_id": "<your-org-id>",
     "source_system": "servicenow",
     "raw_description": "${current.short_description} ${current.description}",
     "ticket_id": "${current.number}"
   }
   ```

**Jira Example:**
1. Go to **Project Settings → Automation**
2. Create a rule: **When: Issue Created → Then: Send Web Request**
3. Configure:
   ```
   POST https://<your-triageflow-url>/functions/v1/categorize-ticket
   Body:
   {
     "organization_id": "<your-org-id>",
     "source_system": "jira",
     "raw_description": "{{issue.summary}} {{issue.description}}"
   }
   ```

**Zendesk Example:**
1. Go to **Admin → Business Rules → Triggers**
2. Create a trigger: Condition = Ticket is Created
3. Action = Notify webhook:
   ```
   POST https://<your-triageflow-url>/functions/v1/categorize-ticket
   Body:
   {
     "organization_id": "<your-org-id>",
     "source_system": "zendesk",
     "raw_description": "{{ticket.title}} {{ticket.description}}"
   }
   ```

### Step 2: Configure Outbound API (Push Predictions Back)

In **Settings → Outbound ITSM API Configuration**:

1. Select your **Target Platform** (ServiceNow, Jira, Zendesk, Freshservice)
2. Enter your **Instance URL** (e.g., `https://yourcompany.service-now.com`)
3. Choose the **HTTP Method** (PATCH for updates, POST for new records)
4. Provide your **API Key** and/or **Bearer Token**
5. Click **Save Configuration**

TriageFlow will automatically push AI predictions (category, severity, assignment group) back to the source ticket.

### Step 3: Upload Training Data

1. Go to **Settings → AI Triage Configuration**
2. Prepare a CSV file with columns: `description, category, team, severity`
3. Multi-word values (e.g., "Network Operations", "Tier 1 - Service Desk") are fully supported
4. Upload the CSV — TriageFlow will use this data to train the AI model for your org

### Step 4: Set Your Triage Time Benchmark

1. Go to **Settings → Standard Triage Time**
2. Set your org's average manual triage time (default: 8 min)
3. This value is used in all ROI calculations and reports

---

## 🛠 Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend:** Lovable Cloud — authentication, database, edge functions
- **AI:** Lovable AI gateway for ticket classification
- **Animations:** Framer Motion
- **Charts:** Recharts

## 📦 Getting Started

### Prerequisites

- Node.js 18+ & npm

### Installation

```sh
git clone <YOUR_GIT_URL>
cd triageflow-ai
npm install
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
└── integrations/        # Supabase client & types
```

## 🔐 Authentication

Email-based authentication with email verification. Users are associated with organizations, and role-based access control (admin/operator) governs permissions.

## 🌐 Deployment

Deployed via [Lovable](https://lovable.dev). **Live URL:** [triageflowai.lovable.app](https://triageflowai.lovable.app)

## 📄 License

Proprietary — All rights reserved.
