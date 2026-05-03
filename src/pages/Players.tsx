import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

type Player = {
  player_id: string; name: string; age: number; gender: string;
  contact_number: string; medical_history: string | null; skill_level: string;
  eligibility_status: string; team_id: string | null;
};

const emptyPlayer = { name: "", age: 18, gender: "Male", contact_number: "", medical_history: "", skill_level: "Beginner", eligibility_status: "Eligible", team_id: null as string | null };

export default function PlayersPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Player | null>(null);
  const [form, setForm] = useState(emptyPlayer);
  const [search, setSearch] = useState("");

  const { data: players = [], isLoading } = useQuery({
    queryKey: ["players"],
    queryFn: async () => {
      const { data, error } = await supabase.from("players").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Player[];
    },
  });

  const { data: teams = [] } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const { data } = await supabase.from("teams").select("team_id, team_name");
      return data ?? [];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      if (editing) {
        const { error } = await supabase.from("players").update(form).eq("player_id", editing.player_id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("players").insert(form);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["players"] }); qc.invalidateQueries({ queryKey: ["players-count"] }); setOpen(false); setEditing(null); setForm(emptyPlayer); toast({ title: editing ? "Player updated" : "Player added" }); },
    onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("players").delete().eq("player_id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["players"] }); qc.invalidateQueries({ queryKey: ["players-count"] }); toast({ title: "Player deleted" }); },
  });

  const filtered = players.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const openEdit = (p: Player) => { setEditing(p); setForm({ name: p.name, age: p.age, gender: p.gender, contact_number: p.contact_number, medical_history: p.medical_history ?? "", skill_level: p.skill_level, eligibility_status: p.eligibility_status, team_id: p.team_id }); setOpen(true); };
  const openNew = () => { setEditing(null); setForm(emptyPlayer); setOpen(true); };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Player Management</h2>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button onClick={openNew}><Plus className="mr-2 h-4 w-4" />{" "}Add Player</Button></DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{editing ? "Edit Player" : "Add Player"}</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2"><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2"><Label>Age</Label><Input type="number" min={1} max={99} value={form.age} onChange={e => setForm({ ...form, age: +e.target.value })} /></div>
                  <div className="grid gap-2"><Label>Gender</Label>
                    <Select value={form.gender} onValueChange={v => setForm({ ...form, gender: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2"><Label>Contact Number</Label><Input value={form.contact_number} onChange={e => setForm({ ...form, contact_number: e.target.value })} /></div>
                <div className="grid gap-2"><Label>Medical History</Label><Textarea value={form.medical_history} onChange={e => setForm({ ...form, medical_history: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2"><Label>Skill Level</Label>
                    <Select value={form.skill_level} onValueChange={v => setForm({ ...form, skill_level: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{["Beginner","Intermediate","Advanced","Professional"].map(s=><SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2"><Label>Eligibility</Label>
                    <Select value={form.eligibility_status} onValueChange={v => setForm({ ...form, eligibility_status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{["Eligible","Ineligible","Under Review"].map(s=><SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2"><Label>Team</Label>
                  <Select value={form.team_id ?? "none"} onValueChange={v => setForm({ ...form, team_id: v === "none" ? null : v })}>
                    <SelectTrigger><SelectValue placeholder="Select team" /></SelectTrigger>
                    <SelectContent><SelectItem value="none">No Team</SelectItem>{teams.map(t=><SelectItem key={t.team_id} value={t.team_id}>{t.team_name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <Button onClick={() => save.mutate()} disabled={!form.name || !form.contact_number}>{editing ? "Update" : "Add"} Player</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search players..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead><TableHead>Age</TableHead><TableHead>Gender</TableHead><TableHead>Skill</TableHead><TableHead>Status</TableHead><TableHead>Contact</TableHead><TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow> :
                  filtered.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No players found</TableCell></TableRow> :
                    filtered.map(p => (
                      <TableRow key={p.player_id}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell>{p.age}</TableCell>
                        <TableCell>{p.gender}</TableCell>
                        <TableCell>{p.skill_level}</TableCell>
                        <TableCell>{p.eligibility_status}</TableCell>
                        <TableCell>{p.contact_number}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => del.mutate(p.player_id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
