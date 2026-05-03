import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";

const empty = { player_id: "", team_id: "", date: "", status: "Present" };

export default function AttendancePage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);

  const { data: attendance = [], isLoading } = useQuery({
    queryKey: ["attendance"],
    queryFn: async () => {
      const { data, error } = await supabase.from("attendance").select("*, players(name), teams(team_name)").order("date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: players = [] } = useQuery({ queryKey: ["players-list"], queryFn: async () => { const { data } = await supabase.from("players").select("player_id, name"); return data ?? []; } });
  const { data: teams = [] } = useQuery({ queryKey: ["teams"], queryFn: async () => { const { data } = await supabase.from("teams").select("team_id, team_name"); return data ?? []; } });

  const save = useMutation({
    mutationFn: async () => { const { error } = await supabase.from("attendance").insert(form); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["attendance"] }); setOpen(false); setForm(empty); toast({ title: "Attendance marked" }); },
    onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("attendance").delete().eq("attendance_id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["attendance"] }); toast({ title: "Record deleted" }); },
  });

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Attendance Management</h2>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button onClick={() => { setForm(empty); setOpen(true); }}><Plus className="mr-2 h-4 w-4" /> Mark Attendance</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Mark Attendance</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2"><Label>Player</Label>
                  <Select value={form.player_id} onValueChange={v => setForm({ ...form, player_id: v })}><SelectTrigger><SelectValue placeholder="Select player" /></SelectTrigger><SelectContent>{players.map(p => <SelectItem key={p.player_id} value={p.player_id}>{p.name}</SelectItem>)}</SelectContent></Select>
                </div>
                <div className="grid gap-2"><Label>Team</Label>
                  <Select value={form.team_id} onValueChange={v => setForm({ ...form, team_id: v })}><SelectTrigger><SelectValue placeholder="Select team" /></SelectTrigger><SelectContent>{teams.map(t => <SelectItem key={t.team_id} value={t.team_id}>{t.team_name}</SelectItem>)}</SelectContent></Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2"><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
                  <div className="grid gap-2"><Label>Status</Label>
                    <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Present">Present</SelectItem><SelectItem value="Absent">Absent</SelectItem></SelectContent></Select>
                  </div>
                </div>
                <Button onClick={() => save.mutate()} disabled={!form.player_id || !form.team_id || !form.date}>Mark Attendance</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <Card><CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Player</TableHead><TableHead>Team</TableHead><TableHead>Status</TableHead><TableHead className="w-16">Del</TableHead></TableRow></TableHeader>
            <TableBody>
              {isLoading ? <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow> :
                attendance.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No attendance records</TableCell></TableRow> :
                  attendance.map((a: any) => (
                    <TableRow key={a.attendance_id}>
                      <TableCell>{a.date}</TableCell>
                      <TableCell className="font-medium">{a.players?.name}</TableCell>
                      <TableCell>{a.teams?.team_name}</TableCell>
                      <TableCell><span className={a.status === "Present" ? "text-success font-medium" : "text-destructive font-medium"}>{a.status}</span></TableCell>
                      <TableCell><Button variant="ghost" size="icon" onClick={() => del.mutate(a.attendance_id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </CardContent></Card>
      </div>
    </DashboardLayout>
  );
}
