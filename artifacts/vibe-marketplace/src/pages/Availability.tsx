import { useState } from "react";
import { useListAvailabilitySlots, useCreateAvailabilitySlot, useUpdateAvailabilitySlot, useListFreelancers, getListAvailabilitySlotsQueryKey, getListFreelancersQueryKey } from "@workspace/api-client-react";
import type { AvailabilitySlot } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Calendar } from "lucide-react";

const schema = z.object({
  freelancerId: z.string().min(1, "Required"),
  date: z.string().min(1, "Required"),
  startTime: z.string().min(1, "Required"),
  endTime: z.string().min(1, "Required"),
  durationHours: z.string().min(1, "Required"),
  hourlyRate: z.string().optional(),
  workType: z.enum(["troubleshooting", "coworking", "build", "any"]),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

function SlotCard({ slot, onBook }: { slot: AvailabilitySlot; onBook: (id: number) => void }) {
  const wt = slot.workType.replace("_", " ");
  return (
    <div className="border border-border rounded-md bg-card p-4 flex items-start justify-between gap-3" data-testid={`slot-card-${slot.id}`}>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm text-foreground">{slot.freelancerName}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{slot.date} · {slot.startTime}–{slot.endTime} ({slot.durationHours}h)</div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground capitalize">{wt}</span>
          {slot.hourlyRate && <span className="text-xs text-muted-foreground">${slot.hourlyRate}/hr</span>}
        </div>
        {slot.notes && <div className="text-xs text-muted-foreground mt-1">{slot.notes}</div>}
        {slot.bookedByNote && <div className="text-xs text-orange-600 mt-1">Booked by: {slot.bookedByNote}</div>}
      </div>
      <div className="shrink-0">
        {slot.isBooked ? (
          <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600 font-medium">Booked</span>
        ) : (
          <Button size="sm" variant="outline" onClick={() => onBook(slot.id)} data-testid={`button-book-slot-${slot.id}`}>
            Book
          </Button>
        )}
      </div>
    </div>
  );
}

export default function Availability() {
  const [showForm, setShowForm] = useState(false);
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [bookedBy, setBookedBy] = useState("");
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: slots, isLoading } = useListAvailabilitySlots(undefined, {
    query: { queryKey: getListAvailabilitySlotsQueryKey() },
  });
  const { data: freelancers } = useListFreelancers(undefined, {
    query: { queryKey: getListFreelancersQueryKey() },
  });

  const createSlot = useCreateAvailabilitySlot();
  const updateSlot = useUpdateAvailabilitySlot();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { freelancerId: "", date: "", startTime: "", endTime: "", durationHours: "", hourlyRate: "", workType: "any", notes: "" },
  });

  async function onSubmit(data: FormData) {
    try {
      await createSlot.mutateAsync({
        data: {
          freelancerId: Number(data.freelancerId),
          date: data.date,
          startTime: data.startTime,
          endTime: data.endTime,
          durationHours: Number(data.durationHours),
          hourlyRate: data.hourlyRate ? Number(data.hourlyRate) : undefined,
          workType: data.workType,
          notes: data.notes || undefined,
        },
      });
      qc.invalidateQueries({ queryKey: getListAvailabilitySlotsQueryKey() });
      toast({ title: "Slot added" });
      form.reset();
      setShowForm(false);
    } catch {
      toast({ title: "Failed to add slot", variant: "destructive" });
    }
  }

  async function handleBook() {
    if (!bookingId) return;
    try {
      await updateSlot.mutateAsync({ id: bookingId, data: { isBooked: true, bookedByNote: bookedBy } });
      qc.invalidateQueries({ queryKey: getListAvailabilitySlotsQueryKey() });
      toast({ title: "Slot booked" });
      setBookingId(null);
      setBookedBy("");
    } catch {
      toast({ title: "Failed to book slot", variant: "destructive" });
    }
  }

  const open = slots?.filter((s) => !s.isBooked) ?? [];
  const booked = slots?.filter((s) => s.isBooked) ?? [];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground" data-testid="page-title-availability">Availability Board</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {slots ? `${open.length} open slot${open.length !== 1 ? "s" : ""}` : "Loading..."}
          </p>
        </div>
        <Button size="sm" onClick={() => setShowForm(true)} data-testid="button-add-slot">
          <Plus size={14} className="mr-1" /> Add Slot
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-md" />)}
        </div>
      ) : (
        <>
          {open.length > 0 && (
            <div className="mb-6">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Available</div>
              <div className="grid gap-3">
                {open.map((s) => <SlotCard key={s.id} slot={s} onBook={(id) => setBookingId(id)} />)}
              </div>
            </div>
          )}
          {booked.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Booked</div>
              <div className="grid gap-3">
                {booked.map((s) => <SlotCard key={s.id} slot={s} onBook={() => {}} />)}
              </div>
            </div>
          )}
          {slots?.length === 0 && (
            <div className="text-center py-12 text-sm text-muted-foreground">No availability slots yet. Add one to get started.</div>
          )}
        </>
      )}

      {/* Add slot dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add availability slot</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="freelancerId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Freelancer</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-slot-freelancer">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {freelancers?.map((f) => (
                        <SelectItem key={f.id} value={String(f.id)}>{f.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-3 gap-3">
                <FormField control={form.control} name="date" render={({ field }) => (
                  <FormItem className="col-span-3">
                    <FormLabel>Date</FormLabel>
                    <FormControl><Input {...field} type="date" data-testid="input-slot-date" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="startTime" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start</FormLabel>
                    <FormControl><Input {...field} type="time" data-testid="input-slot-start" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="endTime" render={({ field }) => (
                  <FormItem>
                    <FormLabel>End</FormLabel>
                    <FormControl><Input {...field} type="time" data-testid="input-slot-end" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="durationHours" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hours</FormLabel>
                    <FormControl><Input {...field} type="number" step="0.5" min="0.5" placeholder="1" data-testid="input-slot-duration" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="workType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-slot-work-type">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="troubleshooting">Troubleshooting</SelectItem>
                        <SelectItem value="coworking">Co-working</SelectItem>
                        <SelectItem value="build">Build</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="hourlyRate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate ($/hr)</FormLabel>
                    <FormControl><Input {...field} type="number" placeholder="75" data-testid="input-slot-rate" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl><Textarea {...field} rows={2} placeholder="Anything the booker should know..." data-testid="input-slot-notes" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="flex gap-2 pt-1">
                <Button type="submit" disabled={createSlot.isPending} data-testid="button-submit-slot">
                  {createSlot.isPending ? "Saving..." : "Add slot"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Book dialog */}
      <Dialog open={!!bookingId} onOpenChange={(o) => !o && setBookingId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Book this slot</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Your name / note</label>
              <Input
                className="mt-1"
                placeholder="Alex Vibe — debug session"
                value={bookedBy}
                onChange={(e) => setBookedBy(e.target.value)}
                data-testid="input-booked-by"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleBook} disabled={!bookedBy || updateSlot.isPending} data-testid="button-confirm-book">
                {updateSlot.isPending ? "Booking..." : "Confirm booking"}
              </Button>
              <Button variant="outline" onClick={() => setBookingId(null)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
