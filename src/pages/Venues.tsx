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

const empty = { venue_name: "", location: "", capacity: 100, availability_status: "Available" };

export default function VenuesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(empty);
  const [search, setSearch] = useState("");

  const { data: venues = [], isLoading } = useQuery({
    queryKey: ["venues-full"],
    queryFn: async () => { const { data, error } = await supabase.from("venues").select("*").order("created_at", { ascending: false }); if (error) throw error; return data; },
  });

  const save = useMutation({
    mutationFn: async () => {
      if (editing) { const { error } = await supabase.from("venues").update(form).eq("venue_id", editing.venue_id); if (error) throw error; }
      else { const { error } = await supabase.from("venues").insert(form); if (error) throw error; }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["venues-full"] }); qc.invalidateQueries({ queryKey: ["venues"] }); setOpen(false); setEditing(null); setForm(empty); toast({ title: editing ? "Venue updated" : "Venue added" }); },
    onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("venues").delete().eq("venue_id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["venues-full"] }); toast({ title: "Venue deleted" }); },
  });

  const filtered = venues.filter((v: any) => v.venue_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Venue Management</h2>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button onClick={() => { setEditing(null); setForm(empty); setOpen(true); }}><Plus className="mr-2 h-4 w-4" /> Add Venue</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing ? "Edit Venue" : "Add Venue"}</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2"><Label>Venue Name</Label><Input value={form.venue_name} onChange={e => setForm({ ...form, venue_name: e.target.value })} /></div>
                <div className="grid gap-2"><Label>Location</Label><Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2"><Label>Capacity</Label><Input type="number" min={1} value={form.capacity} onChange={e => setForm({ ...form, capacity: +e.target.value })} /></div>
                  <div className="grid gap-2"><Label>Status</Label>
                    <Select value={form.availability_status} onValueChange={v => setForm({ ...form, availability_status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Available","Occupied","Under Maintenance"].map(s=><SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
                  </div>
                </div>
                <Button onClick={() => save.mutate()} disabled={!form.venue_name || !form.location}>{editing ? "Update" : "Add"} Venue</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="relative max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search venues..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" /></div>
        <Card><CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Venue Name</TableHead><TableHead>Location</TableHead><TableHead>Capacity</TableHead><TableHead>Status</TableHead><TableHead className="w-24">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {isLoading ? <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow> :
                filtered.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No venues found</TableCell></TableRow> :
                  filtered.map((v: any) => (
                    <TableRow key={v.venue_id}>
                      <TableCell className="font-medium">{v.venue_name}</TableCell>
                      <TableCell>{v.location}</TableCell>
                      <TableCell>{v.capacity}</TableCell>
                      <TableCell>{v.availability_status}</TableCell>
                      <TableCell><div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setEditing(v); setForm({ venue_name: v.venue_name, location: v.location, capacity: v.capacity, availability_status: v.availability_status }); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => del.mutate(v.venue_id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
