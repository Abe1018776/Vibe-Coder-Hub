import { useState } from "react";
import { useListTags, useCreateTag, useDeleteTag, getListTagsQueryKey } from "@workspace/api-client-react";
import type { Tag } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";

const schema = z.object({
  name: z.string().min(1, "Required"),
  category: z.enum(["tool", "skill", "gig_type", "general"]),
});
type FormData = z.infer<typeof schema>;

const CATEGORY_COLORS: Record<string, string> = {
  tool: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  skill: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  gig_type: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  general: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
};

function TagRow({ tag, onDelete }: { tag: Tag; onDelete: (id: number) => void }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-border last:border-0" data-testid={`tag-row-${tag.id}`}>
      <div className="flex items-center gap-3">
        <span className={`text-xs px-2 py-0.5 rounded font-medium ${CATEGORY_COLORS[tag.category]}`}>
          {tag.category}
        </span>
        <span className="text-sm text-foreground font-medium">{tag.name}</span>
      </div>
      <button
        data-testid={`button-delete-tag-${tag.id}`}
        onClick={() => onDelete(tag.id)}
        className="text-muted-foreground hover:text-destructive transition-colors p-1"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

export default function Tags() {
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: tags, isLoading } = useListTags({ query: { queryKey: getListTagsQueryKey() } });

  const createTag = useCreateTag();
  const deleteTag = useDeleteTag();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", category: "general" },
  });

  async function onSubmit(data: FormData) {
    try {
      await createTag.mutateAsync({ data });
      qc.invalidateQueries({ queryKey: getListTagsQueryKey() });
      toast({ title: "Tag created" });
      form.reset();
      setShowForm(false);
    } catch {
      toast({ title: "Failed to create tag", variant: "destructive" });
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteTag.mutateAsync({ id });
      qc.invalidateQueries({ queryKey: getListTagsQueryKey() });
      toast({ title: "Tag deleted" });
    } catch {
      toast({ title: "Failed to delete tag", variant: "destructive" });
    }
  }

  const byCategory = (tags ?? []).reduce<Record<string, Tag[]>>((acc, t) => {
    (acc[t.category] ??= []).push(t);
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground" data-testid="page-title-tags">Tags</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{tags?.length ?? 0} tags</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)} data-testid="button-create-tag">
          <Plus size={14} className="mr-1" /> New tag
        </Button>
      </div>

      {showForm && (
        <div className="border border-border rounded-md bg-card p-4 mb-5">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-3 flex-wrap items-end">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem className="flex-1 min-w-36">
                  <FormLabel>Name</FormLabel>
                  <FormControl><Input {...field} placeholder="replit" data-testid="input-tag-name" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem className="flex-1 min-w-36">
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-tag-category">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="tool">Tool</SelectItem>
                      <SelectItem value="skill">Skill</SelectItem>
                      <SelectItem value="gig_type">Gig type</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={createTag.isPending} data-testid="button-submit-tag">
                  {createTag.isPending ? "Creating..." : "Create"}
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </Form>
        </div>
      )}

      <div className="border border-border rounded-md bg-card overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 rounded" />)}
          </div>
        ) : tags && tags.length > 0 ? (
          tags.map((t) => <TagRow key={t.id} tag={t} onDelete={handleDelete} />)
        ) : (
          <div className="p-8 text-center text-sm text-muted-foreground">No tags yet. Create one to get started.</div>
        )}
      </div>
    </div>
  );
}
