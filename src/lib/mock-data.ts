export interface Ticket {
  id: string;
  source_system: "Jira" | "ServiceNow" | "Zendesk" | "Freshservice";
  raw_description: string;
  predicted_category: string;
  predicted_severity: "Critical" | "High" | "Medium" | "Low" | "Info";
  predicted_team: string;
  confidence_score: number;
  synced_back_to_source: boolean;
  created_at: string;
  business_impact: string;
  ai_reasoning: string;
}

export const mockTickets: Ticket[] = [
  {
    id: "TF-1024",
    source_system: "Jira",
    raw_description: "VPN connectivity failing on macOS Sonoma after latest security patch deployment. Multiple users in Building 3 affected. Cannot access internal resources or Confluence.",
    predicted_category: "Network",
    predicted_severity: "High",
    predicted_team: "Tier 2 - Network Ops",
    confidence_score: 0.94,
    synced_back_to_source: true,
    created_at: "2026-03-15T08:23:00Z",
    business_impact: "High - 47 users unable to access internal resources",
    ai_reasoning: "Pattern match: VPN + macOS + patch = known regression in Cisco AnyConnect 4.10.x after macOS 14.4 update. Historical resolution: rollback AnyConnect module or apply hotfix KB-2024-0891."
  },
  {
    id: "TF-1025",
    source_system: "ServiceNow",
    raw_description: "Password reset required for SAP ERP production environment. User locked out after 5 failed attempts. Finance quarter-end processing blocked.",
    predicted_category: "Access Management",
    predicted_severity: "Critical",
    predicted_team: "Tier 1 - Service Desk",
    confidence_score: 0.97,
    synced_back_to_source: true,
    created_at: "2026-03-15T09:05:00Z",
    business_impact: "Critical - Quarter-end financial processing blocked",
    ai_reasoning: "High confidence: Standard password reset with elevated urgency due to SAP production + quarter-end timing. Recommend immediate escalation path via SAP Basis team if standard reset fails."
  },
  {
    id: "TF-1026",
    source_system: "Zendesk",
    raw_description: "Outlook keeps crashing when opening attachments larger than 10MB. Happening across the marketing department on Windows 11 machines.",
    predicted_category: "End User Computing",
    predicted_severity: "Medium",
    predicted_team: "Tier 1 - Desktop Support",
    confidence_score: 0.88,
    synced_back_to_source: false,
    created_at: "2026-03-15T09:42:00Z",
    business_impact: "Medium - Marketing team productivity reduced 30%",
    ai_reasoning: "Likely cause: Outlook memory allocation issue with Office 365 build 16.0.17126. Similar pattern seen in 12 tickets last month. Fix: Update to latest Office channel or increase Outlook memory limit via registry."
  },
  {
    id: "TF-1027",
    source_system: "Freshservice",
    raw_description: "Production database server CPU at 98% utilization. Automated monitoring alert triggered. Application response times degraded to 12 seconds.",
    predicted_category: "Infrastructure",
    predicted_severity: "Critical",
    predicted_team: "Tier 3 - Database Admin",
    confidence_score: 0.96,
    synced_back_to_source: true,
    created_at: "2026-03-15T10:15:00Z",
    business_impact: "Critical - Production application performance severely degraded",
    ai_reasoning: "CPU spike correlates with scheduled index rebuild job that overlapped with peak usage. Recommend: kill runaway query PID 4472, reschedule maintenance window to 02:00-04:00 UTC."
  },
  {
    id: "TF-1028",
    source_system: "Jira",
    raw_description: "New employee onboarding: Need Active Directory account, email setup, VPN access, and Slack workspace invitation for 3 new hires starting Monday in Engineering.",
    predicted_category: "Access Management",
    predicted_severity: "Low",
    predicted_team: "Tier 1 - Provisioning",
    confidence_score: 0.92,
    synced_back_to_source: false,
    created_at: "2026-03-15T10:48:00Z",
    business_impact: "Low - Planned onboarding with 3-day lead time",
    ai_reasoning: "Standard onboarding request. Mapped to automated provisioning workflow WF-ONB-003. Estimated completion: 2 hours per user. All requested access types within standard engineering role template."
  },
  {
    id: "TF-1029",
    source_system: "ServiceNow",
    raw_description: "Printer on 4th floor not responding to print jobs. Paper jam cleared but still showing offline status. Affecting legal department document processing.",
    predicted_category: "End User Computing",
    predicted_severity: "Medium",
    predicted_team: "Tier 1 - Desktop Support",
    confidence_score: 0.85,
    synced_back_to_source: true,
    created_at: "2026-03-15T11:20:00Z",
    business_impact: "Medium - Legal team unable to print contracts",
    ai_reasoning: "Post-jam printer offline typically requires print spooler restart on print server + power cycle of device. Check: HP LaserJet firmware version may need update per vendor advisory HPE-2024-12."
  },
  {
    id: "TF-1030",
    source_system: "Zendesk",
    raw_description: "Suspicious login attempts detected on CEO email account from IP addresses in Eastern Europe. 14 failed attempts in last hour.",
    predicted_category: "Security",
    predicted_severity: "Critical",
    predicted_team: "Tier 3 - Security Operations",
    confidence_score: 0.99,
    synced_back_to_source: true,
    created_at: "2026-03-15T11:55:00Z",
    business_impact: "Critical - Potential executive account compromise",
    ai_reasoning: "URGENT: Brute force pattern detected. IP range 185.x.x.x matches known threat actor infrastructure (APT-29 associated). Immediate actions: force password reset, enable conditional access policy, block IP range at WAF, notify CISO."
  },
  {
    id: "TF-1031",
    source_system: "Jira",
    raw_description: "Zoom meeting rooms in Conference Center A and B not connecting to displays. IT setup needed before board meeting at 2pm today.",
    predicted_category: "End User Computing",
    predicted_severity: "High",
    predicted_team: "Tier 1 - AV Support",
    confidence_score: 0.91,
    synced_back_to_source: false,
    created_at: "2026-03-15T12:10:00Z",
    business_impact: "High - Board meeting in 2 hours without AV capability",
    ai_reasoning: "Time-sensitive AV issue. Zoom Rooms appliance likely needs firmware sync after weekend update push. Check HDMI-CEC handshake and Zoom Room Controller app version. Backup: deploy portable Zoom kit."
  },
];

export const sourceIcons: Record<string, string> = {
  Jira: "🔵",
  ServiceNow: "🟢",
  Zendesk: "🟡",
  Freshservice: "🟣",
};
