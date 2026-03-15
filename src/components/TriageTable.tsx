import { useState } from "react";
import { motion } from "framer-motion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { mockTickets, sourceIcons, type Ticket } from "@/lib/mock-data";
import { AIInsightsPanel } from "./AIInsightsPanel";
import { CheckCircle2, Clock, ArrowUpRight } from "lucide-react";

const severityClass: Record<string, string> = {
  Critical: "severity-critical",
  High: "severity-high",
  Medium: "severity-medium",
  Low: "severity-low",
  Info: "severity-info",
};

export function TriageTable() {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [loading] = useState(false);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
            <h2 className="text-sm font-semibold text-foreground">Live Triage Queue</h2>
            <span className="text-xs text-muted-foreground font-mono">({mockTickets.length} incidents)</span>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono">Auto-refresh: 30s</Badge>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold w-[80px]">ID</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold w-[100px]">Source</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold">Description</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold w-[130px]">Category</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold w-[100px]">Severity</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold w-[100px]">Confidence</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold w-[90px]">Sync</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockTickets.map((ticket, i) => (
              <motion.tr
                key={ticket.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="border-b border-border cursor-pointer transition-colors hover:bg-muted/50 group"
                onClick={() => setSelectedTicket(ticket)}
              >
                <TableCell className="font-mono text-xs text-primary font-medium">{ticket.id}</TableCell>
                <TableCell>
                  <span className="text-xs flex items-center gap-1.5">
                    <span>{sourceIcons[ticket.source_system]}</span>
                    {ticket.source_system}
                  </span>
                </TableCell>
                <TableCell>
                  <p className="text-xs text-foreground/80 truncate max-w-[300px]">{ticket.raw_description}</p>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-[10px] font-mono">{ticket.predicted_category}</Badge>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold ${severityClass[ticket.predicted_severity]}`}>
                    {ticket.predicted_severity}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${ticket.confidence_score * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">{Math.round(ticket.confidence_score * 100)}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  {ticket.synced_back_to_source ? (
                    <span className="flex items-center gap-1 text-success text-[10px] font-medium">
                      <CheckCircle2 className="w-3 h-3" /> Synced
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-warning text-[10px] font-medium">
                      <Clock className="w-3 h-3" /> Pending
                    </span>
                  )}
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>

      <AIInsightsPanel ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
    </>
  );
}
