import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useCreateGig, useRequestUploadUrl, getListGigsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { Link } from "wouter";

const schema = z.object({
  title: z.string().min(3, "Title required"),
  description: z.string().min(10, "Description required"),
  type: z.enum(["task", "hourly", "build"]),
  tags: z.string(),
  requirements: z.string().optional(),
  budgetMin: z.string().optional(),
  budgetMax: z.string().optional(),
  hourlyRate: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const TYPE_DESCRIPTIONS = {
  task: "One-off AI deliverable — build a thing, done",
  hourly: "Co-working or troubleshooting session",
  build: "Fixing or extending an existing Vibe Coded project",
};

export default function CreateGig() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [recordingPath, setRecordingPath] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", description: "", type: "task", tags: "", requirements: "", budgetMin: "", budgetMax: "", hourlyRate: "" },
  });

  const createGig = useCreateGig();
  const requestUpload = useRequestUploadUrl();

  async function handleFileUpload(file: File) {
    setUploading(true);
    try {
      const { uploadURL, objectPath } = await requestUpload.mutateAsync({ data: { name: file.name, size: file.size, contentType: file.type } });
      await fetch(uploadURL, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      setRecordingPath(objectPath);
      toast({ title: "Recording uploaded" });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(data: FormData) {
    const tagsArr = data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
    try {
      const gig = await createGig.mutateAsync({
        data: {
          title: data.title,
          description: data.description,
          type: data.type,
          tags: tagsArr,
          requirements: data.requirements || undefined,
          budgetMin: data.budgetMin ? Number(data.budgetMin) : undefined,
          budgetMax: data.budgetMax ? Number(data.budgetMax) : undefined,
          hourlyRate: data.hourlyRate ? Number(data.hourlyRate) : undefined,
          recordingPath: recordingPath || undefined,
        },
      });
      qc.invalidateQueries({ queryKey: getListGigsQueryKey() });
      toast({ title: "Gig posted" });
      setLocation(`/gigs/${gig.id}`);
    } catch {
      toast({ title: "Failed to post gig", variant: "destructive" });
    }
  }

  const watchedType = form.watch("type");

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/gigs">
          <span className="text-xs text-muted-foreground hover:text-foreground cursor-pointer">&larr; Back to Gigs</span>
        </Link>
        <h1 className="text-xl font-bold text-foreground mt-2" data-testid="page-title-create-gig">Post a Gig</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField control={form.control} name="title" render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. Fix my Replit deploy pipeline" data-testid="input-gig-title" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="type" render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-create-gig-type">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="task">Task — {TYPE_DESCRIPTIONS.task}</SelectItem>
                  <SelectItem value="hourly">Hourly — {TYPE_DESCRIPTIONS.hourly}</SelectItem>
                  <SelectItem value="build">Build — {TYPE_DESCRIPTIONS.build}</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-xs text-muted-foreground">{TYPE_DESCRIPTIONS[watchedType]}</div>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} rows={4} placeholder="What exactly needs to be done? What tools/context?" data-testid="input-gig-description" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="requirements" render={({ field }) => (
            <FormItem>
              <FormLabel>Requirements <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
              <FormControl>
                <Textarea {...field} rows={2} placeholder="Must know: Replit, Cursor, etc." data-testid="input-gig-requirements" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="tags" render={({ field }) => (
            <FormItem>
              <FormLabel>Tags <span className="text-muted-foreground font-normal">(comma separated)</span></FormLabel>
              <FormControl>
                <Input {...field} placeholder="Replit, Cursor, Python, Debug" data-testid="input-gig-tags" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <div className="grid grid-cols-2 gap-4">
            {watchedType !== "hourly" ? (
              <>
                <FormField control={form.control} name="budgetMin" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget min ($)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" placeholder="50" data-testid="input-budget-min" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="budgetMax" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget max ($)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" placeholder="200" data-testid="input-budget-max" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </>
            ) : (
              <FormField control={form.control} name="hourlyRate" render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Hourly rate ($/hr)</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" placeholder="75" data-testid="input-hourly-rate" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            )}
          </div>

          {/* Screen recording upload */}
          <div>
            <div className="text-sm font-medium mb-1.5">Screen recording <span className="text-muted-foreground font-normal">(optional)</span></div>
            <input
              ref={fileRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              data-testid="input-screen-recording"
            />
            {recordingPath ? (
              <div className="flex items-center gap-2 text-sm text-foreground border border-border rounded-md px-3 py-2">
                <span className="flex-1 truncate text-xs">{recordingPath}</span>
                <button type="button" onClick={() => setRecordingPath(null)} className="text-muted-foreground hover:text-destructive">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                data-testid="button-upload-recording"
              >
                <Upload size={14} className="mr-1.5" />
                {uploading ? "Uploading..." : "Upload recording"}
              </Button>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={createGig.isPending} data-testid="button-submit-gig">
              {createGig.isPending ? "Posting..." : "Post Gig"}
            </Button>
            <Link href="/gigs">
              <Button type="button" variant="outline" data-testid="button-cancel-gig">Cancel</Button>
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
}
