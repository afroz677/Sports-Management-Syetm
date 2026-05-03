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
import { Plus, Pencil, Trash2, Search } from "lucide-react";

const empty = { team_name: "", sport_type: "", coach_id: null as string | null };

export default function TeamsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(empty);
  const [search, setSearch] = useState("");

  const { data: teams = [], isLoading } = useQuery({
    queryKey: ["teams-full"],
    queryFn: async () => {
      const { data, error } = await supabase.from("teams").select("*, coaches(name)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: coaches = [] } = useQuery({
    queryKey: ["coaches"],
    queryFn: async () => { const { data } = await supabase.from("coaches").select("coach_id, name"); return data ?? []; },
  });

  const save = useMutation({
    mutationFn: async () => {
      if (editing) {
        const { error } = await supabase.from("teams").update(form).eq("team_id", editing.team_id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("teams").insert(form);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["teams-full"] }); qc.invalidateQueries({ queryKey: ["teams"] }); qc.invalidateQueries({ queryKey: ["teams-count"] }); setOpen(false); setEditing(null); setForm(empty); toast({ title: editing ? "Team updated" : "Team added" }); },
    onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("teams").delete().eq("team_id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["teams-full"] }); qc.invalidateQueries({ queryKey: ["teams-count"] }); toast({ title: "Team deleted" }); },
  });

  const filtered = teams.filter((t: any) => t.team_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Team Management</h2>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button onClick={() => { setEditing(null); setForm(empty); setOpen(true); }}><Plus className="mr-2 h-4 w-4" /> Add Team</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing ? "Edit Team" : "Add Team"}</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2"><Label>Team Name</Label><Input value={form.team_name} onChange={e => setForm({ ...form, team_name: e.target.value })} /></div>
                <div className="grid gap-2"><Label>Sport Type</Label><Input value={form.sport_type} onChange={e => setForm({ ...form, sport_type: e.target.value })} /></div>
                <div className="grid gap-2"><Label>Coach</Label>
                  <Select value={form.coach_id ?? "none"} onValueChange={v => setForm({ ...form, coach_id: v === "none" ? null : v })}>
                    <SelectTrigger><SelectValue placeholder="Select coach" /></SelectTrigger>
                    <SelectContent><SelectItem value="none">No Coach</SelectItem>{coaches.map(c => <SelectItem key={c.coach_id} value={c.coach_id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <Button onClick={() => save.mutate()} disabled={!form.team_name || !form.sport_type}>{editing ? "Update" : "Add"} Team</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="relative max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search teams..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" /></div>
        <Card><CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Team Name</TableHead><TableHead>Sport</TableHead><TableHead>Coach</TableHead><TableHead className="w-24">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {isLoading ? <TableRow><TableCell colSpan={4} className="text-center py-8">Loading...</TableCell></TableRow> :
                filtered.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No teams found</TableCell></TableRow> :
                  filtered.map((t: any) => (
                    <TableRow key={t.team_id}>
                      <TableCell className="font-medium">{t.team_name}</TableCell>
                      <TableCell>{t.sport_type}</TableCell>
                      <TableCell>{t.coaches?.name ?? "—"}</TableCell>
                      <TableCell><div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setEditing(t); setForm({ team_name: t.team_name, sport_type: t.sport_type, coach_id: t.coach_id }); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => del.mutate(t.team_id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div></TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </CardContent></Card>
      </div>
    </DashboardLayout>
  );
}
