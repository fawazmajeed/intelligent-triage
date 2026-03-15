export interface Ticket {
  id: string;
  source_system: string;
  raw_description: string;
  predicted_category: string | null;
  predicted_severity: string | null;
  predicted_team: string | null;
  confidence_score: number | null;
  synced_back_to_source: boolean;
  created_at: string;
  business_impact: string | null;
  organization_id: string;
}

export const sourceIcons: Record<string, string> = {
  Jira: "🔵",
  ServiceNow: "🟢",
  Zendesk: "🟡",
  Freshservice: "🟣",
};

export const severityClass: Record<string, string> = {
  Critical: "severity-critical",
  High: "severity-high",
  Medium: "severity-medium",
  Low: "severity-low",
  Info: "severity-info",
};
