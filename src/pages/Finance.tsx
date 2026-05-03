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

const empty = { player_id: "", amount: 0, payment_date: "", payment_status: "Pending", invoice_number: "" };

export default function FinancePage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);

  const { data: finance = [], isLoading } = useQuery({
    queryKey: ["finance"],
    queryFn: async () => {
      const { data, error } = await supabase.from("finance").select("*, players(name)").order("payment_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: players = [] } = useQuery({ queryKey: ["players-list"], queryFn: async () => { const { data } = await supabase.from("players").select("player_id, name"); return data ?? []; } });

  const save = useMutation({
    mutationFn: async () => {
      if (form.amount <= 0) throw new Error("Amount must be positive");
      const { error } = await supabase.from("finance").insert(form);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["finance"] }); qc.invalidateQueries({ queryKey: ["revenue-total"] }); setOpen(false); setForm(empty); toast({ title: "Payment added" }); },
    onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("finance").delete().eq("finance_id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["finance"] }); qc.invalidateQueries({ queryKey: ["revenue-total"] }); toast({ title: "Payment deleted" }); },
  });

  const totalRevenue = finance.reduce((sum: number, f: any) => f.payment_status === "Completed" ? sum + Number(f.amount) : sum, 0);

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Finance Management</h2>
            <p className="text-muted-foreground">Total Revenue (Completed): <span className="font-bold text-foreground">₹{totalRevenue.toLocaleString()}</span></p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button onClick={() => { setForm(empty); setOpen(true); }}><Plus className="mr-2 h-4 w-4" /> Add Payment</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Payment</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2"><Label>Player</Label>
                  <Select value={form.player_id} onValueChange={v => setForm({ ...form, player_id: v })}><SelectTrigger><SelectValue placeholder="Select player" /></SelectTrigger><SelectContent>{players.map(p => <SelectItem key={p.player_id} value={p.player_id}>{p.name}</SelectItem>)}</SelectContent></Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2"><Label>Amount (₹)</Label><Input type="number" min={1} value={form.amount || ""} onChange={e => setForm({ ...form, amount: +e.target.value })} /></div>
                  <div className="grid gap-2"><Label>Payment Date</Label><Input type="date" value={form.payment_date} onChange={e => setForm({ ...form, payment_date: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2"><Label>Payment Status</Label>
                    <Select value={form.payment_status} onValueChange={v => setForm({ ...form, payment_status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Pending","Completed","Failed","Refunded"].map(s=><SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
                  </div>
                  <div className="grid gap-2"><Label>Invoice Number</Label><Input value={form.invoice_number} onChange={e => setForm({ ...form, invoice_number: e.target.value })} /></div>
                </div>
                <Button onClick={() => save.mutate()} disabled={!form.player_id || form.amount <= 0 || !form.payment_date || !form.invoice_number}>Add Payment</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <Card><CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Player</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Invoice</TableHead><TableHead className="w-16">Del</TableHead></TableRow></TableHeader>
            <TableBody>
              {isLoading ? <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow> :
                finance.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No payments found</TableCell></TableRow> :
                  finance.map((f: any) => (
                    <TableRow key={f.finance_id}>
                      <TableCell>{f.payment_date}</TableCell>
                      <TableCell className="font-medium">{f.players?.name}</TableCell>
                      <TableCell>₹{Number(f.amount).toLocaleString()}</TableCell>
                      <TableCell>{f.payment_status}</TableCell>
                      <TableCell>{f.invoice_number}</TableCell>
                      <TableCell><Button variant="ghost" size="icon" onClick={() => del.mutate(f.finance_id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </CardContent></Card>
      </div>
    </DashboardLayout>
  );
}
