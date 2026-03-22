# TriageFlow AI

**Intelligent IT Service Management Triage & Routing Platform**

TriageFlow AI is a multi-tool automation platform that unifies your ITSM ecosystem. It uses AI to automatically classify, prioritize, and route support tickets across ServiceNow, Jira, Zendesk, Freshservice, and more — all from a single pane of glass.

**Live URL:** [triageflowai.lovable.app](https://triageflowai.lovable.app)

---

## Table of Contents

1. [Key Features](#-key-features)
2. [Getting Started](#-getting-started)
3. [User Guide](#-user-guide)
4. [Use Cases & ROI](#-use-cases--roi)
5. [Integration Instructions](#-integration-instructions)
6. [Admin Guide](#-admin-guide)
7. [Tech Stack](#-tech-stack)
8. [Project Structure](#-project-structure)
9. [Self-Hosting](#-self-hosting)

---

## 🚀 Key Features

| Feature | Description |
|---------|-------------|
| **AI-Powered Ticket Classification** | Automatically categorize, assign severity, and route tickets to the right team using AI trained on your org's data. |
| **Self-Learning Feedback Loop** | Correct AI predictions inline → corrections auto-feed as training examples → model accuracy improves over time. |
| **Confidence-Based Review Queue** | Tickets below 75% confidence are flagged for mandatory human review before syncing back to ITSM. |
| **Feedback Analytics Dashboard** | Track correction rates, accuracy trends, and top misclassification patterns to measure AI improvement. |
| **9 ITSM Platform Integrations** | Connect Jira SM, ServiceNow, Zendesk, Freshservice, ManageEngine, Zoho Desk, BMC Helix, SolarWinds, and HaloITSM. |
| **Live Triage Queue** | Real-time dashboard with full-text search, confidence scores, severity badges, and sync status. |
| **AI Insights Panel** | Click any ticket to see full AI analysis — category, severity, team, business impact, confidence score, and raw REST payloads. |
| **Integration Hub** | Toggle platform connections, simulate traffic, and test single tickets with custom descriptions. |
| **ROI Calculator** | Quantify time and cost savings with configurable triage-time benchmarks and hourly rates. |
| **Analytics Dashboard** | Track category distribution, severity breakdown, volume trends, confidence trends, and source platform metrics. |
| **Multi-Currency Support** | Display ROI in USD, EUR, GBP, INR, AUD, CAD, CHF, JPY, or SGD. |
| **Configurable Triage Time** | Set your organization's standard manual triage time (1–60 min) for accurate ROI calculations. |
| **Training Data Upload** | Upload CSV files with historical tickets to fine-tune AI categories, teams, and severity levels. |
| **License Management** | Trial-based access with license key activation for permanent use. |
| **Admin Panel** | System admin can manage all organizations, generate/revoke license keys. |
| **Raw Payload Inspection** | View inbound webhook payloads and outbound REST API responses for full audit trails. |

---

## 📦 Getting Started

### Prerequisites

- Node.js 18+ & npm (for local development)
- A modern web browser

### Quick Start (Cloud)

1. Visit [triageflowai.lovable.app](https://triageflowai.lovable.app)
2. Click **Sign Up** and create an account with your email
3. Verify your email address (check inbox for confirmation link)
4. Log in — you'll land on the **Live Queue** dashboard with a 7-day free trial

### Local Development

```sh
git clone <YOUR_GIT_URL>
cd triageflow-ai
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 📖 User Guide

### 1. Login & Registration

1. Navigate to the app URL
2. **New users:** Fill in your email and password (min 6 characters), then click **Sign Up**
3. Check your email for a verification link and click it
4. Return to the app and **Sign In** with your credentials
5. You'll be assigned to a new organization with a **7-day free trial**

> **Note:** After the trial expires, the app enters read-only mode. Contact your administrator for a license key or enter one in **Settings → License Management**.

### 2. Live Queue (Home Dashboard)

The Live Queue is your command center for real-time incident triage.

**What you see:**

- **Metrics Ribbon** — Three KPI cards at the top:
  - *Tickets Processed* — total count of all tickets triaged
  - *Avg. AI Confidence Score* — how confident the AI is across all classifications
  - *Estimated Hours Saved* — calculated using your configured triage time (default 8 min/ticket), with approximate cost savings shown below
- **Triage Table** — A live-updating table of the 50 most recent tickets showing:
  - Ticket ID (click to open details)
  - Source platform (ServiceNow 🟢, Jira 🔵, Zendesk 🟡, Freshservice 🟣, etc.)
  - Raw description (the original user complaint)
  - Predicted category (e.g., "Network", "Application", "Security")
  - Predicted severity (Critical / High / Medium / Low — color-coded)
  - AI confidence score (progress bar + percentage)
  - Sync status (✓ Synced or ⏳ Pending)
- **Search** — Full-text search across ID, description, category, team, severity, and source

**How to use it:**

1. Scan the metrics ribbon for a quick health check
2. Use the search bar to find specific incidents
3. Click any ticket row to open the **AI Insights Panel** (slide-out drawer)

### 3. AI Insights Panel (Ticket Detail)

When you click a ticket in the Live Queue, a detail panel slides open showing:

1. **Raw User Complaint** — The original ticket description as submitted
2. **AI Processing Indicator** — Visual divider showing AI analysis was performed
3. **Structured AI Output:**
   - Category (e.g., "Application / POS", "Network")
   - Severity (e.g., "Critical", "High", "Medium", "Low")
   - Routing Group (the team assigned, e.g., "Retail IT — POS Support")
   - Business Impact (e.g., "Revenue Loss — Active customers leaving")
4. **AI Confidence Score** — Large percentage display with progress bar
5. **Business Impact Assessment** — Detailed explanation of organizational impact
6. **Raw Webhook Input** — Expandable JSON showing the inbound webhook payload
7. **Raw API Response (Outbound)** — Expandable JSON showing the PATCH/PUT request sent back to the source ITSM tool, including endpoint URL, headers, body, and sync status

> **Pro Tip:** Use the raw payload sections to debug integration issues or verify that the correct fields are being sent back to your ITSM platform.

### 4. Integration Hub

The Integration Hub lets you connect ITSM platforms and test the AI pipeline.

**Platform Cards:**

- 9 supported platforms displayed as cards
- Each shows: platform name, ticket count, tier (Enterprise / SMB), and sync status (syncing / inactive)
- Click any card to open the **Platform Detail Dialog** with setup instructions and auto-sync toggle

**Auto-Sync Toggle:**

- Enable "Auto-Sync" on a platform card to mark it as active
- Only active platforms are used during traffic simulation

**Webhook Endpoint:**

- Your unique webhook URL is displayed at the top
- Copy it and configure your ITSM tools to POST ticket data to this endpoint
- Method: POST, Format: JSON, Auth: Bearer Token

**Simulate Incoming Traffic:**

1. Enable Auto-Sync on at least one platform
2. Click **Simulate Traffic** — generates 3–5 random tickets from your active platforms
3. Check the Live Queue to see them categorized by AI in real-time

**Test Single Ticket:**

1. Click **Test Single Ticket** to expand the test form
2. Write or paste a ticket description (e.g., the sample CEGID POS complaint)
3. Select the source platform from the dropdown
4. Click **Submit & Categorize**
5. A toast notification shows the AI's predicted category, team, and severity
6. Navigate to the Live Queue and click the new ticket to see full details

**Sample test description you can try:**
```
I have a line of five customers at the Geneva register and CEGID Retail Y2 
has just frozen for the fourth time this morning. I've already tried 
restarting the terminal but it's stuck on the login screen. This is a total 
joke. We are losing sales every minute this stays broken. Fix the server or 
whatever is wrong on your end immediately. I'm not calling the helpdesk to 
wait on hold for 20 minutes. Just fix it.
```

### 5. Analytics Dashboard

The Analytics page provides four real-time charts based on your organization's ticket data:

1. **Tickets by Category** — Bar chart showing distribution across AI-predicted categories
2. **Severity Distribution** — Donut/pie chart with color-coded severity breakdown (Critical, High, Medium, Low)
3. **Daily Trend — Volume & Confidence** — Dual-line chart showing ticket volume and average AI confidence over the last 14 days
4. **Tickets by Source Platform** — Horizontal bar chart showing which ITSM tools are generating the most traffic

> Charts auto-refresh every 10 seconds. If you see "No ticket data yet," go to the Integration Hub and simulate some traffic first.

### 6. Settings

#### Display Currency
Choose your preferred currency for all financial calculations:
- Supported: USD, EUR, GBP, INR, AUD, CAD, CHF, JPY, SGD
- Changes apply immediately to the ROI Calculator and metrics ribbon

#### Standard Triage Time
Set your organization's average manual triage time per ticket:
- Default: **8 minutes** (ITSM industry average for L1 manual triage)
- Range: 1–60 minutes
- Typical values:
  - 2–5 min — mature orgs with runbooks
  - 8 min — industry average
  - 10–15 min — complex environments
- Changes immediately recalculate Hours Saved and ROI values on the Live Queue

#### AI Triage Configuration
Fine-tune the AI model for your organization:

**Custom Categories:**
- Add category names (e.g., "Network", "Application", "Security", "Hardware")
- These are used by the AI when classifying tickets

**Custom Teams:**
- Add team names (e.g., "Network Operations", "Tier 1 Service Desk", "Security Team")
- These are used for routing predictions

**Training Data Upload:**
1. Prepare a CSV file with columns: `description, category, team, severity`
2. Multi-word values are fully supported
3. Click **Upload CSV** and select your file
4. The AI uses this data to learn your org's specific taxonomy

#### License Management
- View current license status (Trial / Licensed / Expired)
- Trial: 7 days from first login
- Enter a license key (format: `TF-XXXXX-XXXXX-XXXXX-XXXXX`) to activate permanent access
- Licensed users have full access with no expiry

#### Outbound ITSM API Configuration
Push AI predictions back to your source ITSM platform:
1. Select target platform (ServiceNow, Jira, Zendesk, Freshservice)
2. Enter your instance URL
3. Choose HTTP method (POST / PUT / PATCH)
4. Provide API Key and Bearer Token
5. Save — TriageFlow will automatically sync predictions back

### 7. ROI Calculator

Located at the bottom of the Live Queue dashboard:

1. **Monthly Ticket Volume** — Pre-filled from your actual last 30 days of data (editable)
2. **Avg. Tech Hourly Rate** — Default $70/hr (editable, respects your currency setting)
3. **Projected Monthly Savings:**
   - Cost Savings = Hours Recovered × Hourly Rate
   - Hours Recovered = (Tickets × Standard Triage Time) ÷ 60
   - FTE Equivalent = Hours Recovered ÷ 160 hrs/month

Click the **?** icon for a full breakdown of the calculation methodology.

---

## 💰 Use Cases & ROI

### Use Case 1: Unified Multi-Tool Triage Automation

**Problem:** Organizations using 2–5 ITSM tools manually re-categorize and route tickets in each system.

**Solution:** TriageFlow AI ingests tickets from all platforms via webhooks, classifies them with a single AI model, and pushes predictions back automatically.

**ROI Impact:** A 5,000 ticket/month org at 8 min/ticket saves ~667 hours/month (~4 FTEs).

### Use Case 2: L1 Help Desk Acceleration

**Problem:** L1 analysts spend 60–70% of their time reading, categorizing, and routing tickets.

**Solution:** TriageFlow auto-fills category, severity, and assignment group before the analyst opens the ticket.

**ROI Impact:** Reduces average handle time from 8 min to <1 min per ticket. 2,000 tickets/month = ~233 hours recovered.

### Use Case 3: Incident Severity & Business Impact Assessment

**Problem:** Severity misclassification leads to SLA breaches and delayed P1/P2 response.

**Solution:** AI evaluates descriptions against trained patterns to predict severity and flag high-impact incidents immediately.

**ROI Impact:** Reduces mean time to engage (MTTE) for critical incidents by 40–60%.

### Use Case 4: New Employee Onboarding

**Problem:** New L1 analysts take 2–4 weeks to learn routing rules and organizational taxonomy.

**Solution:** TriageFlow handles classification from day one. New analysts learn by reviewing AI predictions.

**ROI Impact:** Reduces onboarding from weeks to days. Consistent quality from day one.

### Use Case 5: Cross-Platform Analytics & Reporting

**Problem:** Consolidated reports across ServiceNow, Jira, and Zendesk require manual exports and spreadsheets.

**Solution:** TriageFlow centralizes all ticket data with normalized categories for unified dashboards.

**ROI Impact:** Saves 5–10 hours/week on reporting.

### Use Case 6: ITSM Tool Migration Support

**Problem:** Migrating ITSM tools requires re-mapping categories, teams, and severity levels.

**Solution:** Run both tools in parallel through TriageFlow. AI learns the new taxonomy from training data.

**ROI Impact:** Reduces migration risk and eliminates months of parallel manual triage.

### Sample ROI Calculations

| Scenario | Tickets/Month | Triage Time | Hourly Rate | Hours Saved | Cost Saved | FTE Saved |
|----------|--------------|-------------|-------------|-------------|------------|-----------|
| Small IT team | 500 | 8 min | $70 | 67h | $4,667 | 0.4 |
| Mid-size enterprise | 5,000 | 8 min | $70 | 667h | $46,667 | 4.2 |
| Large enterprise | 20,000 | 8 min | $70 | 2,667h | $186,667 | 16.7 |
| Optimized org | 5,000 | 2 min | $70 | 167h | $11,667 | 1.0 |
| Complex environment | 3,000 | 15 min | $85 | 750h | $63,750 | 4.7 |
| Offshore team (INR) | 10,000 | 8 min | ₹800 (~$10) | 1,333h | ₹1,066,667 | 8.3 |

> Customize the "Standard Triage Time" in **Settings** to match your organization's actual average.

---

## 🔌 Integration Instructions

### Supported Platforms

| Platform | Inbound (Webhooks) | Outbound (REST API) | Tier |
|----------|-------------------|--------------------| -----|
| Jira Service Management | ✅ Automation Rules / Webhooks | ✅ Issue API (PUT) | Enterprise |
| ServiceNow | ✅ Business Rules / Flow Designer | ✅ Table API (PATCH) | Enterprise |
| Zendesk | ✅ Triggers & Webhooks | ✅ Tickets API (PUT) | SMB / Enterprise |
| Freshservice | ✅ Workflow Automator | ✅ Tickets API (PUT) | SMB |
| ManageEngine ServiceDesk Plus | ✅ Custom Triggers | ✅ Request API (PUT) | SMB / Enterprise |
| Zoho Desk | ✅ Workflow Rules | ✅ Tickets API (PATCH) | SMB |
| BMC Helix ITSM | ✅ Filters & Webhooks | ✅ REST API (PATCH) | Enterprise |
| SolarWinds Service Desk | ✅ Automation Rules | ✅ Incidents API (PUT) | SMB / Enterprise |
| HaloITSM | ✅ Workflow Triggers | ✅ Tickets API (PUT) | SMB |

### Step 1: Enable Platform in Integration Hub

1. Go to **Integration Hub**
2. Click the platform card you want to connect
3. Toggle **Auto-Sync** to "Active"
4. Copy the webhook endpoint URL displayed on the page

### Step 2: Configure Inbound Webhook

Configure your ITSM tool to send ticket data to TriageFlow when tickets are created or updated.

**ServiceNow:**
```
POST https://<your-triageflow-url>/functions/v1/categorize-ticket
Headers:
  Content-Type: application/json
  Authorization: Bearer <your-anon-key>
Body:
{
  "organization_id": "<your-org-id>",
  "source_system": "ServiceNow",
  "raw_description": "${current.short_description} ${current.description}"
}
```

**Jira Service Management:**
```
POST https://<your-triageflow-url>/functions/v1/categorize-ticket
Body:
{
  "organization_id": "<your-org-id>",
  "source_system": "Jira",
  "raw_description": "{{issue.summary}} {{issue.description}}"
}
```

**Zendesk:**
```
POST https://<your-triageflow-url>/functions/v1/categorize-ticket
Body:
{
  "organization_id": "<your-org-id>",
  "source_system": "Zendesk",
  "raw_description": "{{ticket.title}} {{ticket.description}}"
}
```

**Freshservice:**
```
POST https://<your-triageflow-url>/functions/v1/categorize-ticket
Body:
{
  "organization_id": "<your-org-id>",
  "source_system": "Freshservice",
  "raw_description": "{{ticket.subject}} {{ticket.description}}"
}
```

### Step 3: Configure Outbound API (Push Predictions Back)

In **Settings → Outbound ITSM API Configuration**:

1. Select **Target Platform**
2. Enter **Instance URL** (e.g., `https://yourcompany.service-now.com`)
3. Choose **HTTP Method** (PATCH for updates, POST for new records)
4. Provide **API Key** and/or **Bearer Token**
5. Click **Save Configuration**

TriageFlow pushes AI predictions (category, severity, assignment group, business impact) back to the source ticket.

### Step 4: Upload Training Data (Optional)

1. Go to **Settings → AI Triage Configuration**
2. Prepare a CSV file with columns: `description, category, team, severity`
3. Upload the CSV — the AI will use this data to learn your org's taxonomy

**Sample CSV:**
```csv
description,category,team,severity
"VPN tunnel dropping for remote users",Network,Network Operations,High
"SAP GUI login failing with SSO error",Application,Enterprise Apps,Critical
"New hire needs AD account and O365",Access Request,Identity Management,Low
"Printer not printing on 3rd floor",Hardware,Desktop Support,Low
```

### Step 5: Set Your Triage Time Benchmark

1. Go to **Settings → Standard Triage Time**
2. Set your org's average manual triage time (default: 8 min)
3. All ROI calculations update immediately across the dashboard

---

## 🔐 Admin Guide

### System Administrator

The system admin account (`admin@triageflow.ai`) has exclusive access to:

- **Admin Panel** — visible in the sidebar only for the system admin
- **View all organizations** — see every registered org, their users, trial status, and license status
- **Generate license keys** — create keys in format `TF-XXXXX-XXXXX-XXXXX-XXXXX` for any organization
- **Revoke licenses** — remove license access from any organization
- **View all users** — see all registered user emails and their org associations

### Standard Users

Standard users who navigate to the Admin page see only:

- Their own organization's license status
- Trial days remaining or licensed status
- Organization name and their email
- They **cannot** see other organizations, other users, or manage licenses

### License Key Workflow

1. User signs up → receives a 7-day trial
2. Trial expires → app enters read-only mode
3. System admin generates a license key in the Admin Panel
4. Admin shares the key with the user
5. User enters the key in **Settings → License Management → Enter License Key**
6. License activates immediately — full access with no expiry

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui |
| Backend | Lovable Cloud (Supabase) — auth, database, edge functions |
| AI | Lovable AI gateway for ticket classification |
| Animations | Framer Motion |
| Charts | Recharts |
| State | TanStack React Query |
| Routing | React Router v6 |

---

## 📁 Project Structure

```
src/
├── components/              # Reusable UI components
│   ├── ui/                  # shadcn/ui primitives (button, card, dialog, etc.)
│   ├── AIConfigSection.tsx  # AI training data management (categories, teams, CSV upload)
│   ├── AIInsightsPanel.tsx  # Ticket detail slide-out with AI analysis + raw payloads
│   ├── AppLayout.tsx        # Main app shell (sidebar + outlet)
│   ├── AppSidebar.tsx       # Navigation sidebar with role-based menu items
│   ├── MetricsRibbon.tsx    # KPI metrics strip (tickets, confidence, hours saved)
│   ├── NavLink.tsx          # Active-aware navigation link
│   ├── PlatformDetailDialog.tsx  # Platform setup dialog with auto-sync toggle
│   ├── ProtectedRoute.tsx   # Auth guard for protected pages
│   ├── ROICalculator.tsx    # Interactive ROI estimation tool
│   ├── TriageTable.tsx      # Live triage queue with search and ticket rows
│   └── TrialBanner.tsx      # Trial/license status banner
├── contexts/
│   └── AuthContext.tsx      # Authentication context (user, org, trial, license state)
├── hooks/
│   ├── use-currency.ts      # Multi-currency formatting hook
│   ├── use-mobile.tsx       # Mobile breakpoint detection
│   └── use-toast.ts         # Toast notification hook
├── lib/
│   ├── mock-data.ts         # Ticket types, source icons, severity class mappings
│   └── utils.ts             # Utility functions (cn class merger)
├── pages/
│   ├── Index.tsx            # Live Queue dashboard (home)
│   ├── IntegrationHub.tsx   # Platform connections, simulate traffic, test tickets
│   ├── Analytics.tsx        # Charts dashboard (category, severity, trends, sources)
│   ├── Settings.tsx         # Currency, triage time, AI config, license, outbound API
│   ├── Admin.tsx            # Admin panel (system admin) / My License (standard users)
│   ├── Auth.tsx             # Login / signup page
│   ├── Expired.tsx          # Trial expired redirect
│   └── NotFound.tsx         # 404 page
└── integrations/
    └── supabase/            # Auto-generated Supabase client & types

supabase/
├── config.toml              # Project configuration
└── functions/
    ├── categorize-ticket/   # AI ticket classification edge function
    └── seed-admin/          # System admin account seeder
```

---

## 🌐 Self-Hosting

1. Clone the repository from GitHub
2. Set up a Supabase project and configure environment variables
3. Run database migrations from the `supabase/migrations/` directory
4. Deploy edge functions to your Supabase project
5. Build and deploy the frontend: `npm run build` → serve the `dist/` folder

---

## 📄 License

Proprietary — All rights reserved.
