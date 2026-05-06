"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { AvailabilitySlot } from "@/lib/db";

type Slot = AvailabilitySlot & { freelancerName: string | null };

export default function AvailabilityClient({
  initialSlots,
  freelancers,
}: {
  initialSlots: Slot[];
  freelancers: { id: number; name: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    freelancerId: freelancers[0]?.id.toString() ?? "",
    date: "",
    startTime: "",
    endTime: "",
    durationHours: "1",
    workType: "any",
    hourlyRate: "",
    notes: "",
  });

  async function create() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/availability", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          freelancerId: Number(form.freelancerId),
          date: form.date,
          startTime: form.startTime,
          endTime: form.endTime,
          durationHours: Number(form.durationHours),
          workType: form.workType,
          hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : null,
          notes: form.notes || null,
        }),
      });
      if (!res.ok) throw new Error();
      setOpen(false);
      router.refresh();
      toast.success("Slot added");
    } catch {
      toast.error("Failed to add");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleBooked(slot: Slot) {
    await fetch(`/api/availability/${slot.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ isBooked: !slot.isBooked }),
    });
    router.refresh();
  }

  async function remove(slot: Slot) {
    await fetch(`/api/availability/${slot.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" disabled={freelancers.length === 0}>
              <Plus size={14} /> Add slot
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New availability slot</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Freelancer</Label>
                <Select
                  value={form.freelancerId}
                  onValueChange={(v) => setForm({ ...form, freelancerId: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {freelancers.map((f) => (
                      <SelectItem key={f.id} value={f.id.toString()}>
                        {f.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Start</Label>
                  <Input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label>End</Label>
                  <Input
                    type="time"
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Duration (hours)</Label>
                  <Input
                    type="number"
                    step="0.25"
                    value={form.durationHours}
                    onChange={(e) =>
                      setForm({ ...form, durationHours: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Hourly rate ($)</Label>
                  <Input
                    type="number"
                    value={form.hourlyRate}
                    onChange={(e) =>
                      setForm({ ...form, hourlyRate: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Work type</Label>
                <Select
                  value={form.workType}
                  onValueChange={(v) => setForm({ ...form, workType: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="troubleshooting">Troubleshooting</SelectItem>
                    <SelectItem value="coworking">Co-working</SelectItem>
                    <SelectItem value="build">Build</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Notes</Label>
                <Input
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
              <Button onClick={create} disabled={submitting} className="w-full">
                {submitting ? "Saving…" : "Save slot"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border border-border rounded-md bg-card overflow-hidden">
        {initialSlots.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            No availability yet.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {initialSlots.map((s) => (
              <li
                key={s.id}
                className="px-4 py-3 flex items-center gap-4 flex-wrap"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">
                    {s.freelancerName ?? "—"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {s.date} · {s.startTime}–{s.endTime} · {s.durationHours}h ·{" "}
                    {s.workType}
                    {s.hourlyRate ? ` · $${s.hourlyRate}/hr` : ""}
                  </div>
                  {s.notes && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {s.notes}
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleBooked(s)}
                >
                  {s.isBooked ? "Mark open" : "Mark booked"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(s)}
                  className="text-destructive"
                >
                  <Trash2 size={13} />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
