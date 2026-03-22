import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { sourceIcons, severityClass, type Ticket } from "@/lib/mock-data";
import { AIInsightsPanel } from "./AIInsightsPanel";
import { CheckCircle2, Clock, Search, X, MessageSquareWarning } from "lucide-react";

const CONFIDENCE_REVIEW_THRESHOLD = 0.75;

function DesktopTableWithTopScroll({
  ticketList,
  setSelectedTicket,
}: {
  ticketList: Ticket[];
  setSelectedTicket: (t: Ticket) => void;
}) {
  const topBarRef = useRef<HTMLDivElement>(null);
  const tableWrapRef = useRef<HTMLDivElement>(null);
  const [scrollWidth, setScrollWidth] = useState(0);

  const syncScroll = useCallback((source: "top" | "table") => {
    const top = topBarRef.current;
    const table = tableWrapRef.current;
    if (!top || !table) return;
    if (source === "top") {
      table.scrollLeft = top.scrollLeft;
    } else {
      top.scrollLeft = table.scrollLeft;
    }
  }, []);

  useEffect(() => {
    const table = tableWrapRef.current;
    if (!table) return;
    const update = () => setScrollWidth(table.scrollWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(table);
    return () => ro.disconnect();
  }, [ticketList]);

  return (
    <div className="hidden md:block">
      {/* Sticky top scrollbar */}
      <div
        ref={topBarRef}
        onScroll={() => syncScroll("top")}
        className="overflow-x-auto sticky top-0 z-10 bg-card border-b border-border"
        style={{ scrollbarWidth: "thin" }}
      >
        <div style={{ width: scrollWidth, height: 1 }} />
      </div>
      {/* Actual table */}
      <div
        ref={tableWrapRef}
        onScroll={() => syncScroll("table")}
        className="overflow-x-auto"
        style={{ scrollbarWidth: "none" }}
      >
        <style>{`.triage-table-wrap::-webkit-scrollbar { display: none; }`}</style>
        <div className="triage-table-wrap">
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
              {ticketList.map((ticket, i) => (
                <motion.tr
                  key={ticket.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-border cursor-pointer transition-colors hover:bg-muted/50 group"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <TableCell className="font-mono text-xs text-primary font-medium">
                    {ticket.id.slice(0, 8)}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs flex items-center gap-1.5">
                      <span>{sourceIcons[ticket.source_system] ?? "⚪"}</span>
                      {ticket.source_system}
                    </span>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs text-foreground/80 truncate max-w-[300px]">{ticket.raw_description}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-[10px] font-mono">{ticket.predicted_category ?? "—"}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold ${severityClass[ticket.predicted_severity ?? ""] ?? ""}`}>
                      {ticket.predicted_severity ?? "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${(ticket.confidence_score ?? 0) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {ticket.confidence_score ? Math.round(ticket.confidence_score * 100) + "%" : "—"}
                      </span>
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
      </div>
    </div>
  );
}

export function TriageTable() {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showReviewOnly, setShowReviewOnly] = useState(false);

  const { data: tickets, isLoading } = useQuery({
    queryKey: ["tickets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as Ticket[];
    },
    refetchInterval: 10000,
  });

  const reviewCount = useMemo(() => {
    return (tickets ?? []).filter((t) => (t.confidence_score ?? 0) < CONFIDENCE_REVIEW_THRESHOLD).length;
  }, [tickets]);

  const ticketList = useMemo(() => {
    let all = tickets ?? [];
    if (showReviewOnly) {
      all = all.filter((t) => (t.confidence_score ?? 0) < CONFIDENCE_REVIEW_THRESHOLD);
    }
    if (!searchQuery.trim()) return all;
    const q = searchQuery.toLowerCase();
    return all.filter(
      (t) =>
        t.id.toLowerCase().includes(q) ||
        t.raw_description.toLowerCase().includes(q) ||
        (t.predicted_category ?? "").toLowerCase().includes(q) ||
        (t.predicted_team ?? "").toLowerCase().includes(q) ||
        (t.predicted_severity ?? "").toLowerCase().includes(q) ||
        t.source_system.toLowerCase().includes(q)
    );
  }, [tickets, searchQuery, showReviewOnly]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-border space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
              <h2 className="text-sm font-semibold text-foreground">Live Triage Queue</h2>
              <span className="text-xs text-muted-foreground font-mono hidden sm:inline">
                ({ticketList.length}{searchQuery || showReviewOnly ? ` of ${tickets?.length ?? 0}` : ""} incidents)
              </span>
            </div>
            <div className="flex items-center gap-2">
              {reviewCount > 0 && (
                <Button
                  variant={showReviewOnly ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-[10px] gap-1.5"
                  onClick={() => setShowReviewOnly(!showReviewOnly)}
                >
                  <MessageSquareWarning className="w-3 h-3" />
                  Review Queue ({reviewCount})
                </Button>
              )}
              <Badge variant="outline" className="text-[10px] font-mono hidden sm:inline-flex">Auto-refresh: 30s</Badge>
            </div>
          </div>
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by ID, description, category, team, severity, or source…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 text-xs pl-8 pr-8 bg-muted/50 border-border"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {ticketList.length === 0 && searchQuery ? (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-muted-foreground">No incidents match "<span className="text-foreground">{searchQuery}</span>"</p>
          </div>
        ) : (
          <>
            {/* Desktop table with top sticky scrollbar */}
            <DesktopTableWithTopScroll
              ticketList={ticketList}
              setSelectedTicket={setSelectedTicket}
            />

            {/* Mobile card list */}
            <div className="md:hidden divide-y divide-border">
              {ticketList.map((ticket, i) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-primary font-medium">{ticket.id.slice(0, 8)}</span>
                      <span className="text-[10px]">{sourceIcons[ticket.source_system] ?? "⚪"} {ticket.source_system}</span>
                    </div>
                    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold ${severityClass[ticket.predicted_severity ?? ""] ?? ""}`}>
                      {ticket.predicted_severity ?? "—"}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/80 line-clamp-2 mb-1.5">{ticket.raw_description}</p>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <Badge variant="secondary" className="text-[9px] font-mono py-0 h-4">{ticket.predicted_category ?? "—"}</Badge>
                    <span className="font-mono">{ticket.confidence_score ? Math.round(ticket.confidence_score * 100) + "%" : "—"}</span>
                    {ticket.synced_back_to_source ? (
                      <span className="flex items-center gap-0.5 text-success"><CheckCircle2 className="w-2.5 h-2.5" /> Synced</span>
                    ) : (
                      <span className="flex items-center gap-0.5 text-warning"><Clock className="w-2.5 h-2.5" /> Pending</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>

      <AIInsightsPanel ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
    </>
  );
}
