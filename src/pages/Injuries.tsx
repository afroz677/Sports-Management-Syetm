import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";

const empty = { player_id: "", injury_type: "", injury_date: "", recovery_status: "Under Treatment", return_to_play_approval: false };

export default function InjuriesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);

  const { data: injuries = [], isLoading } = useQuery({
    queryKey: ["injuries"],
    queryFn: async () => {
      const { data, error } = await supabase.from("injuries").select("*, players(name)").order("injury_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: players = [] } = useQuery({ queryKey: ["players-list"], queryFn: async () => { const { data } = await supabase.from("players").select("player_id, name"); return data ?? []; } });

  const save = useMutation({
    mutationFn: async () => { const { error } = await supabase.from("injuries").insert(form); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["injuries"] }); setOpen(false); setForm(empty); toast({ title: "Injury record added" }); },
    onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("injuries").delete().eq("injury_id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["injuries"] }); toast({ title: "Record deleted" }); },
  });

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Injury Management</h2>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button onClick={() => { setForm(empty); setOpen(true); }}><Plus className="mr-2 h-4 w-4" /> Add Injury Record</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Injury Record</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2"><Label>Player</Label>
                  <Select value={form.player_id} onValueChange={v => setForm({ ...form, player_id: v })}><SelectTrigger><SelectValue placeholder="Select player" /></SelectTrigger><SelectContent>{players.map(p => <SelectItem key={p.player_id} value={p.player_id}>{p.name}</SelectItem>)}</SelectContent></Select>
                </div>
                <div className="grid gap-2"><Label>Injury Type</Label><Input value={form.injury_type} onChange={e => setForm({ ...form, injury_type: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2"><Label>Injury Date</Label><Input type="date" value={form.injury_date} onChange={e => setForm({ ...form, injury_date: e.target.value })} /></div>
                  <div className="grid gap-2"><Label>Recovery Status</Label>
                    <Select value={form.recovery_status} onValueChange={v => setForm({ ...form, recovery_status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Under Treatment","Recovered","Chronic"].map(s=><SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.return_to_play_approval} onCheckedChange={v => setForm({ ...form, return_to_play_approval: v })} />
                  <Label>Return to Play Approved</Label>
                </div>
                <Button onClick={() => save.mutate()} disabled={!form.player_id || !form.injury_type || !form.injury_date}>Add Record</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <Card><CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Player</TableHead><TableHead>Injury Type</TableHead><TableHead>Recovery</TableHead><TableHead>RTP Approved</TableHead><TableHead className="w-16">Del</TableHead></TableRow></TableHeader>
            <TableBody>
              {isLoading ? <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow> :
                injuries.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No injury records</TableCell></TableRow> :
                  injuries.map((i: any) => (
                    <TableRow key={i.injury_id}>
                      <TableCell>{i.injury_date}</TableCell>
                      <TableCell className="font-medium">{i.players?.name}</TableCell>
                      <TableCell>{i.injury_type}</TableCell>
                      <TableCell>{i.recovery_status}</TableCell>
                      <TableCell>{i.return_to_play_approval ? "✅ Yes" : "❌ No"}</TableCell>
                      <TableCell><Button variant="ghost" size="icon" onClick={() => del.mutate(i.injury_id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </CardContent></Card>
      </div>
    </DashboardLayout>
  );
}
