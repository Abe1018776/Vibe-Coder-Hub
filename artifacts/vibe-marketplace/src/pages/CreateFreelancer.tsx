import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation, Link } from "wouter";
import { useCreateFreelancer, useRequestUploadUrl, getListFreelancersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";

const schema = z.object({
  name: z.string().min(1, "Name required"),
  bio: z.string().optional(),
  skills: z.string(),
  tags: z.string(),
  tools: z.string(),
  hourlyRate: z.string().optional(),
  portfolioLinks: z.string(),
  contactInfo: z.string().optional(),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function CreateFreelancer() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [avatarPath, setAvatarPath] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", bio: "", skills: "", tags: "", tools: "", hourlyRate: "", portfolioLinks: "", contactInfo: "", notes: "" },
  });

  const createFreelancer = useCreateFreelancer();
  const requestUpload = useRequestUploadUrl();

  async function handleAvatarUpload(file: File) {
    setUploading(true);
    try {
      const { uploadUrl, objectPath } = await requestUpload.mutateAsync({ data: { fileName: file.name, contentType: file.type, isPublic: true } });
      await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      setAvatarPath(objectPath);
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }

  function splitCSV(val: string) {
    return val ? val.split(",").map((s) => s.trim()).filter(Boolean) : [];
  }

  async function onSubmit(data: FormData) {
    try {
      const f = await createFreelancer.mutateAsync({
        data: {
          name: data.name,
          bio: data.bio || undefined,
          avatarPath: avatarPath || undefined,
          skills: splitCSV(data.skills),
          tags: splitCSV(data.tags),
          tools: splitCSV(data.tools),
          hourlyRate: data.hourlyRate ? Number(data.hourlyRate) : undefined,
          portfolioLinks: splitCSV(data.portfolioLinks),
          contactInfo: data.contactInfo || undefined,
          notes: data.notes || undefined,
        },
      });
      qc.invalidateQueries({ queryKey: getListFreelancersQueryKey() });
      toast({ title: "Freelancer added" });
      setLocation(`/freelancers/${f.id}`);
    } catch {
      toast({ title: "Failed to add freelancer", variant: "destructive" });
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/freelancers">
          <span className="text-xs text-muted-foreground hover:text-foreground cursor-pointer">&larr; Back to Freelancers</span>
        </Link>
        <h1 className="text-xl font-bold text-foreground mt-2" data-testid="page-title-create-freelancer">Add Freelancer</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Avatar upload */}
          <div>
            <div className="text-sm font-medium mb-1.5">Avatar <span className="text-muted-foreground font-normal">(optional)</span></div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleAvatarUpload(e.target.files[0])} data-testid="input-avatar" />
            {avatarPath ? (
              <div className="flex items-center gap-3">
                <img src={`/api/storage/objects/${avatarPath.replace(/^\//, "")}`} className="w-12 h-12 rounded-full object-cover" alt="avatar" />
                <button type="button" onClick={() => setAvatarPath(null)} className="text-xs text-muted-foreground hover:text-destructive"><X size={14} /></button>
              </div>
            ) : (
              <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => fileRef.current?.click()} data-testid="button-upload-avatar">
                <Upload size={14} className="mr-1.5" /> {uploading ? "Uploading..." : "Upload avatar"}
              </Button>
            )}
          </div>

          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl><Input {...field} placeholder="Alex Vibe" data-testid="input-freelancer-name" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="bio" render={({ field }) => (
            <FormItem>
              <FormLabel>Bio <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
              <FormControl><Textarea {...field} rows={3} placeholder="AI-native builder specializing in..." data-testid="input-freelancer-bio" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="tools" render={({ field }) => (
              <FormItem>
                <FormLabel>AI tools <span className="text-muted-foreground font-normal">(CSV)</span></FormLabel>
                <FormControl><Input {...field} placeholder="Replit, Cursor, Lovable" data-testid="input-freelancer-tools" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="skills" render={({ field }) => (
              <FormItem>
                <FormLabel>Skills <span className="text-muted-foreground font-normal">(CSV)</span></FormLabel>
                <FormControl><Input {...field} placeholder="Python, React, Postgres" data-testid="input-freelancer-skills" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="tags" render={({ field }) => (
              <FormItem>
                <FormLabel>Tags <span className="text-muted-foreground font-normal">(CSV)</span></FormLabel>
                <FormControl><Input {...field} placeholder="debug, ai-apps, backend" data-testid="input-freelancer-tags" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="hourlyRate" render={({ field }) => (
              <FormItem>
                <FormLabel>Hourly rate ($)</FormLabel>
                <FormControl><Input {...field} type="number" placeholder="75" data-testid="input-freelancer-rate" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <FormField control={form.control} name="portfolioLinks" render={({ field }) => (
            <FormItem>
              <FormLabel>Portfolio links <span className="text-muted-foreground font-normal">(CSV of URLs)</span></FormLabel>
              <FormControl><Input {...field} placeholder="https://github.com/..., https://..." data-testid="input-freelancer-portfolio" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="contactInfo" render={({ field }) => (
            <FormItem>
              <FormLabel>Contact info</FormLabel>
              <FormControl><Input {...field} placeholder="@username on Slack / wa.me/..." data-testid="input-freelancer-contact" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="notes" render={({ field }) => (
            <FormItem>
              <FormLabel>Internal notes</FormLabel>
              <FormControl><Textarea {...field} rows={2} placeholder="Context, history, recommendations..." data-testid="input-freelancer-notes" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={createFreelancer.isPending} data-testid="button-submit-freelancer">
              {createFreelancer.isPending ? "Saving..." : "Add Freelancer"}
            </Button>
            <Link href="/freelancers">
              <Button type="button" variant="outline" data-testid="button-cancel-freelancer">Cancel</Button>
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
}
