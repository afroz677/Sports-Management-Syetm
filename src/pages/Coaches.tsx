import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

const empty = { name: "", specialization: "", experience: 0, contact_number: "" };

export default function CoachesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(empty);
  const [search, setSearch] = useState("");

  const { data: coaches = [], isLoading } = useQuery({
    queryKey: ["coaches-full"],
    queryFn: async () => { const { data, error } = await supabase.from("coaches").select("*").order("created_at", { ascending: false }); if (error) throw error; return data; },
  });

  const save = useMutation({
    mutationFn: async () => {
      if (editing) { const { error } = await supabase.from("coaches").update(form).eq("coach_id", editing.coach_id); if (error) throw error; }
      else { const { error } = await supabase.from("coaches").insert(form); if (error) throw error; }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["coaches-full"] }); qc.invalidateQueries({ queryKey: ["coaches"] }); qc.invalidateQueries({ queryKey: ["coaches-count"] }); setOpen(false); setEditing(null); setForm(empty); toast({ title: editing ? "Coach updated" : "Coach added" }); },
    onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("coaches").delete().eq("coach_id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["coaches-full"] }); qc.invalidateQueries({ queryKey: ["coaches-count"] }); toast({ title: "Coach deleted" }); },
  });

  const filtered = coaches.filter((c: any) => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Coach Management</h2>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button onClick={() => { setEditing(null); setForm(empty); setOpen(true); }}><Plus className="mr-2 h-4 w-4" /> Add Coach</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing ? "Edit Coach" : "Add Coach"}</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2"><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                <div className="grid gap-2"><Label>Specialization</Label><Input value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })} /></div>
                <div className="grid gap-2"><Label>Experience (years)</Label><Input type="number" min={0} value={form.experience} onChange={e => setForm({ ...form, experience: +e.target.value })} /></div>
                <div className="grid gap-2"><Label>Contact Number</Label><Input value={form.contact_number} onChange={e => setForm({ ...form, contact_number: e.target.value })} /></div>
                <Button onClick={() => save.mutate()} disabled={!form.name || !form.specialization || !form.contact_number}>{editing ? "Update" : "Add"} Coach</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="relative max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search coaches..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" /></div>
        <Card><CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Specialization</TableHead><TableHead>Experience</TableHead><TableHead>Contact</TableHead><TableHead className="w-24">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {isLoading ? <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow> :
                filtered.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No coaches found</TableCell></TableRow> :
                  filtered.map((c: any) => (
                    <TableRow key={c.coach_id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>{c.specialization}</TableCell>
                      <TableCell>{c.experience} yrs</TableCell>
                      <TableCell>{c.contact_number}</TableCell>
                      <TableCell><div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setEditing(c); setForm({ name: c.name, specialization: c.specialization, experience: c.experience, contact_number: c.contact_number }); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => del.mutate(c.coach_id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
