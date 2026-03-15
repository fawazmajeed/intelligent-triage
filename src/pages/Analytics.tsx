import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const categoryData = [
  { name: "Network", count: 67 },
  { name: "Access Mgmt", count: 54 },
  { name: "End User", count: 89 },
  { name: "Infrastructure", count: 41 },
  { name: "Security", count: 23 },
  { name: "Software", count: 38 },
];

const severityData = [
  { name: "Critical", value: 12, color: "hsl(0, 72%, 55%)" },
  { name: "High", value: 28, color: "hsl(25, 95%, 58%)" },
  { name: "Medium", value: 45, color: "hsl(45, 93%, 55%)" },
  { name: "Low", value: 31, color: "hsl(142, 71%, 50%)" },
];

const trendData = [
  { day: "Mon", tickets: 42, confidence: 91 },
  { day: "Tue", tickets: 56, confidence: 93 },
  { day: "Wed", tickets: 38, confidence: 89 },
  { day: "Thu", tickets: 61, confidence: 94 },
  { day: "Fri", tickets: 48, confidence: 92 },
  { day: "Sat", tickets: 22, confidence: 95 },
  { day: "Sun", tickets: 17, confidence: 96 },
];

export default function Analytics() {
  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-xl font-bold text-foreground">Analytics</h1>
        <p className="text-xs text-muted-foreground font-mono mt-0.5">Triage performance metrics — Last 7 days</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Tickets by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 18%, 16%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(220, 10%, 50%)" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(220, 10%, 50%)" }} />
                  <Tooltip contentStyle={{ background: "hsl(222, 22%, 9%)", border: "1px solid hsl(220, 18%, 16%)", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" fill="hsl(173, 80%, 40%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Severity Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={severityData} cx="50%" cy="50%" outerRadius={90} innerRadius={50} dataKey="value" paddingAngle={3}>
                    {severityData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(222, 22%, 9%)", border: "1px solid hsl(220, 18%, 16%)", borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-2">
                {severityData.map((s) => (
                  <div key={s.name} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                    {s.name}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Weekly Trend — Volume & Confidence</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 18%, 16%)" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(220, 10%, 50%)" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(220, 10%, 50%)" }} />
                  <Tooltip contentStyle={{ background: "hsl(222, 22%, 9%)", border: "1px solid hsl(220, 18%, 16%)", borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="tickets" stroke="hsl(173, 80%, 40%)" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="confidence" stroke="hsl(199, 89%, 55%)" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
