import { useState } from "react";
import { Link } from "wouter";
import { useListFreelancers, useListTags, getListFreelancersQueryKey, getListTagsQueryKey } from "@workspace/api-client-react";
import type { Freelancer } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function FreelancerCard({ f }: { f: Freelancer }) {
  return (
    <Link href={`/freelancers/${f.id}`}>
      <div
        data-testid={`freelancer-card-${f.id}`}
        className="border border-border rounded-md bg-card p-4 hover:border-primary/50 transition-colors cursor-pointer"
      >
        <div className="flex items-start gap-3">
          {f.avatarPath ? (
            <img
              src={`/api/storage/objects/${f.avatarPath.replace(/^\/objects\//, "")}`}
              alt={f.name}
              className="w-10 h-10 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
              {f.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm text-foreground">{f.name}</div>
            {f.hourlyRate && <div className="text-xs text-muted-foreground">${f.hourlyRate}/hr</div>}
            {f.bio && <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{f.bio}</div>}
            {f.tools.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {f.tools.slice(0, 4).map((t) => (
                  <span key={t} className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">{t}</span>
                ))}
                {f.tools.length > 4 && (
                  <span className="text-xs text-muted-foreground">+{f.tools.length - 4}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Freelancers() {
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState<string>("all");

  const { data: tags } = useListTags({ query: { queryKey: getListTagsQueryKey() } });

  const params = {
    ...(search ? { search } : {}),
    ...(tag !== "all" ? { tag } : {}),
  };
  const { data: freelancers, isLoading } = useListFreelancers(params, {
    query: { queryKey: getListFreelancersQueryKey(params) },
  });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground" data-testid="page-title-freelancers">Freelancers</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {freelancers ? `${freelancers.length} builder${freelancers.length !== 1 ? "s" : ""}` : "Loading..."}
          </p>
        </div>
        <Link href="/freelancers/new">
          <Button size="sm" data-testid="button-add-freelancer">
            <Plus size={14} className="mr-1" /> Add Freelancer
          </Button>
        </Link>
      </div>

      <div className="flex gap-2 mb-5">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8 h-9 text-sm"
            placeholder="Search by name or bio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search-freelancers"
          />
        </div>
        <Select value={tag} onValueChange={setTag}>
          <SelectTrigger className="w-36 h-9 text-sm" data-testid="select-freelancer-tag">
            <SelectValue placeholder="Tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tags</SelectItem>
            {tags?.map((t) => <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-md" />)}
        </div>
      ) : freelancers && freelancers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {freelancers.map((f) => <FreelancerCard key={f.id} f={f} />)}
        </div>
      ) : (
        <div className="text-center py-12 text-sm text-muted-foreground">
          No freelancers found. <Link href="/freelancers/new"><span className="text-primary underline cursor-pointer">Add the first one.</span></Link>
        </div>
      )}
    </div>
  );
}
