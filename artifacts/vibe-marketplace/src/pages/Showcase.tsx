import { useState } from "react";
import { useListShowcaseProjects, useCreateShowcaseProject, useUpvoteShowcaseProject, getListShowcaseProjectsQueryKey } from "@workspace/api-client-react";
import type { ShowcaseProject } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, ChevronUp, ExternalLink } from "lucide-react";

const schema = z.object({
  name: z.string().min(1, "Required"),
  description: z.string().min(5, "Required"),
  builderName: z.string().min(1, "Required"),
  url: z.string().optional(),
  tags: z.string(),
  tools: z.string(),
});
type FormData = z.infer<typeof schema>;

function ProjectCard({ project, onUpvote }: { project: ShowcaseProject; onUpvote: (id: number) => void }) {
  return (
    <div className="border border-border rounded-md bg-card flex gap-0 overflow-hidden" data-testid={`showcase-card-${project.id}`}>
      {project.screenshotPath && (
        <img
          src={`/api/storage/objects/${project.screenshotPath.replace(/^\//, "")}`}
          alt={project.name}
          className="w-24 object-cover shrink-0"
        />
      )}
      <div className="p-4 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-foreground">{project.name}</span>
              {project.url && (
                <a href={project.url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary">
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">by {project.builderName}</div>
            <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">{project.description}</p>
            {project.tools.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {project.tools.map((t) => (
                  <span key={t} className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">{t}</span>
                ))}
              </div>
            )}
          </div>
          <button
            data-testid={`button-upvote-${project.id}`}
            onClick={() => onUpvote(project.id)}
            className="flex flex-col items-center gap-0.5 border border-border rounded-md px-2.5 py-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors shrink-0 min-w-[44px]"
          >
            <ChevronUp size={14} />
            <span className="text-xs font-bold">{project.upvotes}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Showcase() {
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: projects, isLoading } = useListShowcaseProjects(undefined, {
    query: { queryKey: getListShowcaseProjectsQueryKey() },
  });

  const createProject = useCreateShowcaseProject();
  const upvote = useUpvoteShowcaseProject();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "", builderName: "", url: "", tags: "", tools: "" },
  });

  function splitCSV(val: string) {
    return val ? val.split(",").map((s) => s.trim()).filter(Boolean) : [];
  }

  async function onSubmit(data: FormData) {
    try {
      await createProject.mutateAsync({
        data: {
          name: data.name,
          description: data.description,
          builderName: data.builderName,
          url: data.url || undefined,
          tags: splitCSV(data.tags),
          tools: splitCSV(data.tools),
        },
      });
      qc.invalidateQueries({ queryKey: getListShowcaseProjectsQueryKey() });
      toast({ title: "Project submitted" });
      form.reset();
      setShowForm(false);
    } catch {
      toast({ title: "Failed to submit", variant: "destructive" });
    }
  }

  async function handleUpvote(id: number) {
    try {
      await upvote.mutateAsync({ id });
      qc.invalidateQueries({ queryKey: getListShowcaseProjectsQueryKey() });
    } catch {
      toast({ title: "Failed to upvote", variant: "destructive" });
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground" data-testid="page-title-showcase">Product Showcase</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Vibe Coded projects by the community</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(true)} data-testid="button-submit-project">
          <Plus size={14} className="mr-1" /> Submit project
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-md" />)}
        </div>
      ) : projects && projects.length > 0 ? (
        <div className="grid gap-4">
          {projects.map((p) => <ProjectCard key={p.id} project={p} onUpvote={handleUpvote} />)}
        </div>
      ) : (
        <div className="text-center py-12 text-sm text-muted-foreground">
          No projects yet. Be the first to showcase something.
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Submit a project</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Project name</FormLabel>
                  <FormControl><Input {...field} placeholder="My Vibe App" data-testid="input-project-name" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="builderName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Your name</FormLabel>
                  <FormControl><Input {...field} placeholder="Alex Vibe" data-testid="input-project-builder" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea {...field} rows={3} placeholder="What does it do? How was it built?" data-testid="input-project-description" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="url" render={({ field }) => (
                <FormItem>
                  <FormLabel>URL <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                  <FormControl><Input {...field} placeholder="https://..." data-testid="input-project-url" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="tools" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tools <span className="text-muted-foreground font-normal">(CSV)</span></FormLabel>
                    <FormControl><Input {...field} placeholder="Replit, Cursor" data-testid="input-project-tools" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="tags" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags <span className="text-muted-foreground font-normal">(CSV)</span></FormLabel>
                    <FormControl><Input {...field} placeholder="ai, web-app" data-testid="input-project-tags" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="flex gap-2 pt-1">
                <Button type="submit" disabled={createProject.isPending} data-testid="button-submit-showcase-form">
                  {createProject.isPending ? "Submitting..." : "Submit"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
