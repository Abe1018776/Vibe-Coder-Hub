import { useState } from "react";
import { Link } from "wouter";
import { useListGigs, useListTags, getListGigsQueryKey, getListTagsQueryKey } from "@workspace/api-client-react";
import type { Gig } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, MessageSquare, Clock, Wrench, Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const TYPE_ICONS: Record<string, React.ElementType> = { task: Zap, hourly: Clock, build: Wrench };
const TYPE_COLORS: Record<string, string> = {
  task: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  hourly: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  build: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
};
const STATUS_COLORS: Record<string, string> = {
  open: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  closed: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
  in_progress: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
};

function GigRow({ gig }: { gig: Gig }) {
  const Icon = TYPE_ICONS[gig.type] ?? Zap;
  return (
    <Link href={`/gigs/${gig.id}`}>
      <div
        data-testid={`gig-card-${gig.id}`}
        className="border-b border-border last:border-0 px-5 py-4 hover:bg-muted/30 transition-colors cursor-pointer"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded ${TYPE_COLORS[gig.type]}`}>
                <Icon size={11} />
                {gig.type}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${STATUS_COLORS[gig.status]}`}>
                {gig.status.replace("_", " ")}
              </span>
            </div>
            <div className="text-sm font-semibold text-foreground truncate">{gig.title}</div>
            <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{gig.description}</div>
            {gig.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {gig.tags.map((t) => (
                  <span key={t} className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{t}</span>
                ))}
              </div>
            )}
          </div>
          <div className="shrink-0 text-right">
            <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
              <MessageSquare size={12} />
              {gig.replyCount}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {formatDistanceToNow(new Date(gig.createdAt), { addSuffix: true })}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function GigBoard() {
  const [type, setType] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [tag, setTag] = useState<string>("all");

  const { data: tags } = useListTags({ query: { queryKey: getListTagsQueryKey() } });

  const params = {
    ...(type !== "all" && { type: type as "task" | "hourly" | "build" }),
    ...(status !== "all" && { status: status as "open" | "closed" | "in_progress" }),
    ...(tag !== "all" && { tag }),
  };

  const { data: gigs, isLoading } = useListGigs(params, {
    query: { queryKey: getListGigsQueryKey(params) },
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground" data-testid="page-title-gigs">Gig Board</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {gigs ? `${gigs.length} gig${gigs.length !== 1 ? "s" : ""}` : "Loading..."}
          </p>
        </div>
        <Link href="/gigs/new">
          <Button size="sm" data-testid="button-create-gig">
            <Plus size={14} className="mr-1" /> Post Gig
          </Button>
        </Link>
      </div>

      <div className="flex gap-2 mb-4">
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-36 h-8 text-xs" data-testid="select-gig-type">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="task">Task</SelectItem>
            <SelectItem value="hourly">Hourly</SelectItem>
            <SelectItem value="build">Build</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-36 h-8 text-xs" data-testid="select-gig-status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={tag} onValueChange={setTag}>
          <SelectTrigger className="w-36 h-8 text-xs" data-testid="select-gig-tag">
            <SelectValue placeholder="Tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tags</SelectItem>
            {tags?.map((t) => <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="border border-border rounded-md bg-card overflow-hidden">
        {isLoading ? (
          <div className="p-4 flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded" />)}
          </div>
        ) : gigs && gigs.length > 0 ? (
          gigs.map((gig) => <GigRow key={gig.id} gig={gig} />)
        ) : (
          <div className="p-10 text-center text-sm text-muted-foreground">
            No gigs found. <Link href="/gigs/new"><span className="text-primary underline cursor-pointer">Post the first one.</span></Link>
          </div>
        )}
      </div>
    </div>
  );
}
