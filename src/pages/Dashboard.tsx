import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, Shield, UserCog, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import DashboardLayout from "@/components/DashboardLayout";

const COLORS = ["hsl(217,91%,50%)", "hsl(142,71%,45%)", "hsl(38,92%,50%)", "hsl(0,84%,60%)"];

export default function Dashboard() {
  const { data: players } = useQuery({
    queryKey: ["players-count"],
    queryFn: async () => {
      const { count } = await supabase.from("players").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });
  const { data: teams } = useQuery({
    queryKey: ["teams-count"],
    queryFn: async () => {
      const { count } = await supabase.from("teams").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });
  const { data: coaches } = useQuery({
    queryKey: ["coaches-count"],
    queryFn: async () => {
      const { count } = await supabase.from("coaches").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });
  const { data: revenue } = useQuery({
    queryKey: ["revenue-total"],
    queryFn: async () => {
      const { data } = await supabase.from("finance").select("amount");
      return data?.reduce((sum, r) => sum + Number(r.amount), 0) ?? 0;
    },
  });

  const stats = [
    { title: "Total Players", value: players ?? 0, icon: Users, color: "text-primary" },
    { title: "Total Teams", value: teams ?? 0, icon: Shield, color: "text-success" },
    { title: "Total Coaches", value: coaches ?? 0, icon: UserCog, color: "text-warning" },
    { title: "Total Revenue", value: `₹${(revenue ?? 0).toLocaleString()}`, icon: DollarSign, color: "text-info" },
  ];

  const barData = [
    { name: "Players", count: players ?? 0 },
    { name: "Teams", count: teams ?? 0 },
    { name: "Coaches", count: coaches ?? 0 },
  ];

  const pieData = [
    { name: "Players", value: players ?? 0 },
    { name: "Teams", value: teams ?? 0 },
    { name: "Coaches", value: coaches ?? 0 },
  ].filter(d => d.value > 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Dashboard Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <Card key={s.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{s.title}</CardTitle>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{s.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Entity Overview</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(217,91%,50%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Distribution</CardTitle></CardHeader>
            <CardContent className="h-64">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label>
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">No data yet</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
