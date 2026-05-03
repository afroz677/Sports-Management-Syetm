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

const empty = { team_id: "", coach_id: "", venue_id: "", date: "", time_slot: "", event_type: "Training" };

export default function SchedulesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);

  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ["schedules"],
    queryFn: async () => {
      const { data, error } = await supabase.from("schedules").select("*, teams(team_name), coaches(name), venues(venue_name)").order("date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: teams = [] } = useQuery({ queryKey: ["teams"], queryFn: async () => { const { data } = await supabase.from("teams").select("team_id, team_name"); return data ?? []; } });
  const { data: coaches = [] } = useQuery({ queryKey: ["coaches"], queryFn: async () => { const { data } = await supabase.from("coaches").select("coach_id, name"); return data ?? []; } });
  const { data: venues = [] } = useQuery({ queryKey: ["venues"], queryFn: async () => { const { data } = await supabase.from("venues").select("venue_id, venue_name"); return data ?? []; } });

  const save = useMutation({
    mutationFn: async () => { const { error } = await supabase.from("schedules").insert(form); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["schedules"] }); setOpen(false); setForm(empty); toast({ title: "Schedule added" }); },
    onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("schedules").delete().eq("schedule_id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["schedules"] }); toast({ title: "Schedule deleted" }); },
  });

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Schedule Management</h2>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button onClick={() => { setForm(empty); setOpen(true); }}><Plus className="mr-2 h-4 w-4" /> Add Schedule</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Schedule</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2"><Label>Team</Label>
                  <Select value={form.team_id} onValueChange={v => setForm({ ...form, team_id: v })}><SelectTrigger><SelectValue placeholder="Select team" /></SelectTrigger><SelectContent>{teams.map(t => <SelectItem key={t.team_id} value={t.team_id}>{t.team_name}</SelectItem>)}</SelectContent></Select>
                </div>
                <div className="grid gap-2"><Label>Coach</Label>
                  <Select value={form.coach_id} onValueChange={v => setForm({ ...form, coach_id: v })}><SelectTrigger><SelectValue placeholder="Select coach" /></SelectTrigger><SelectContent>{coaches.map(c => <SelectItem key={c.coach_id} value={c.coach_id}>{c.name}</SelectItem>)}</SelectContent></Select>
                </div>
                <div className="grid gap-2"><Label>Venue</Label>
                  <Select value={form.venue_id} onValueChange={v => setForm({ ...form, venue_id: v })}><SelectTrigger><SelectValue placeholder="Select venue" /></SelectTrigger><SelectContent>{venues.map(v => <SelectItem key={v.venue_id} value={v.venue_id}>{v.venue_name}</SelectItem>)}</SelectContent></Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2"><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
                  <div className="grid gap-2"><Label>Time Slot</Label><Input placeholder="e.g. 10:00-12:00" value={form.time_slot} onChange={e => setForm({ ...form, time_slot: e.target.value })} /></div>
                </div>
                <div className="grid gap-2"><Label>Event Type</Label>
                  <Select value={form.event_type} onValueChange={v => setForm({ ...form, event_type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Training","Match","Practice"].map(s=><SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
                </div>
                <Button onClick={() => save.mutate()} disabled={!form.team_id || !form.coach_id || !form.venue_id || !form.date || !form.time_slot}>Add Schedule</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <Card><CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Time</TableHead><TableHead>Team</TableHead><TableHead>Coach</TableHead><TableHead>Venue</TableHead><TableHead>Type</TableHead><TableHead className="w-16">Del</TableHead></TableRow></TableHeader>
            <TableBody>
              {isLoading ? <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow> :
                schedules.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No schedules found</TableCell></TableRow> :
                  schedules.map((s: any) => (
                    <TableRow key={s.schedule_id}>
                      <TableCell>{s.date}</TableCell><TableCell>{s.time_slot}</TableCell>
                      <TableCell>{s.teams?.team_name}</TableCell><TableCell>{s.coaches?.name}</TableCell><TableCell>{s.venues?.venue_name}</TableCell>
                      <TableCell>{s.event_type}</TableCell>
                      <TableCell><Button variant="ghost" size="icon" onClick={() => del.mutate(s.schedule_id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </CardContent></Card>
      </div>
    </DashboardLayout>
  );
}
