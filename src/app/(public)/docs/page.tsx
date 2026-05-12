import Link from "next/link";
import {
  Users,
  Star,
  Briefcase,
  Calendar,
  Tag,
  MessageSquare,
  LayoutDashboard,
  Lock,
  Globe,
  Mail,
  Zap,
  Clock,
  Wrench,
  ChevronRight,
} from "lucide-react";

const modules = [
  {
    id: "builders",
    Icon: Users,
    title: "Builder Directory",
    audience: "Public",
    path: "/freelancers",
    desc: "The core of the platform. Browse AI-native freelancers by name, skill, or tag. Each builder profile shows their bio, hourly rate, tools they use (Cursor, Replit, Claude, etc.), and tags for discoverability.",
    features: [
      "Search builders by name or bio",
      "Filter by tag (e.g. web, mobile, automation)",
      "View individual profiles at /freelancers/[id]",
      "Admins add builders via /admin/freelancers/new",
    ],
  },
  {
    id: "showcase",
    Icon: Star,
    title: "Product Showcase",
    audience: "Public",
    path: "/showcase",
    desc: "A community board where builders submit vibe-coded projects. Anyone can upvote. It's the portfolio wall — proof that AI-native shipping works.",
    features: [
      "Submit projects with name, description, URL, tools, and tags",
      "Upvote system — the best projects float to the top",
      "Sorted by upvotes then recency",
      "Public submission via dialog form",
    ],
  },
  {
    id: "gigs",
    Icon: Briefcase,
    title: "Gig Board",
    audience: "Admin (scoped to your gigs)",
    path: "/admin/gigs",
    desc: "The internal job board where you post and manage your gigs. Three gig types: task (fixed scope), hourly (time-based), and build (full project). Each gig gets a unique public link for applicants. You only see gigs you created — other posters' gigs are invisible to you.",
    features: [
      'Three gig types: Task (Zap), Hourly (Clock), Build (Wrench)',
      "Auto-generated public slug for sharing (e.g. /gigs/public/my-project)",
      "Budget range or hourly rate",
      "Tags for categorization",
      "Status tracking: open → in_progress → completed / cancelled",
      "Admin detail view at /admin/gigs/[id] with all conversations",
    ],
  },
  {
    id: "apply",
    Icon: Globe,
    title: "Public Gig Application",
    audience: "Public (no login)",
    path: "/gigs/public/[slug]",
    desc: "When a gig is posted, the admin shares its public link. Freelancers land on a clean application page — no login required. They submit their name, optional email, and a message. On submission, they receive a private thread token to track the conversation.",
    features: [
      "No login required — frictionless application",
      "Shareable link per gig (auto-generated slug)",
      "Applicant submits name, optional email, optional message",
      "Instant thread token on apply — bookmark it to check replies",
    ],
  },
  {
    id: "threads",
    Icon: MessageSquare,
    title: "Conversation Threads",
    audience: "Token-based access",
    path: "/gigs/thread/[token]",
    desc: "Each application creates a private thread between the applicant and the gig poster. The freelancer accesses it via a unique token URL — no account needed. Only the gig owner (the poster who created the gig) can reply from the admin dashboard. Like a lightweight email thread, but in-app.",
    features: [
      "Token-URL access — no login needed for freelancers",
      "Only the gig owner can reply from /admin/gigs/[id]",
      "Freelancer checks thread at /gigs/thread/[token]",
      "Messages are timestamped and ordered chronologically",
      "Other gig posters cannot access your conversations",
    ],
  },
  {
    id: "availability",
    Icon: Calendar,
    title: "Availability Slots",
    audience: "Admin",
    path: "/admin/availability",
    desc: "Manage builder availability. Each slot belongs to a freelancer and has a date + time range. Slots can be booked or open. Helps match gigs to builders who are free.",
    features: [
      "Create slots tied to a specific builder",
      "Date + start/end time per slot",
      "Booked vs. open status",
      "Admin CRUD for slot management",
    ],
  },
  {
    id: "tags",
    Icon: Tag,
    title: "Tag Management",
    audience: "Admin",
    path: "/admin/tags",
    desc: "A shared taxonomy of tags used across builders, gigs, and showcase projects. Keeps categorization consistent — instead of freeform, tags are curated and reusable.",
    features: [
      "Curated tag list (no duplicates, no freeform sprawl)",
      "Used by builders, gigs, and showcase projects",
      "Admin CRUD — create, rename, delete",
    ],
  },
  {
    id: "dashboard",
    Icon: LayoutDashboard,
    title: "Admin Dashboard",
    audience: "Admin (auth required)",
    path: "/admin",
    desc: "The ops hub for your account. Shows live counts for your gigs, total freelancers, open slots, replies on your gigs, and showcase projects. Gig type breakdown and your recent gigs list. Everything at a glance — scoped to your data only.",
    features: [
      "Live stats: total/open gigs, freelancers, slots, replies, showcase count",
      "Gig type breakdown (task/hourly/build)",
      "Recent gigs list with type, status, and relative time",
    ],
  },
];

const flowSteps = [
  {
    num: 1,
    title: "Admin posts a gig",
    desc: "Via /admin/gigs/new — sets title, type, budget, tags, requirements. A public slug is auto-generated.",
  },
  {
    num: 2,
    title: "Public link is shared",
    desc: "The gig's public page (/gigs/public/[slug]) is shared to freelancers — no login needed to view or apply.",
  },
  {
    num: 3,
    title: "Freelancer applies",
    desc: "They submit their name + optional email + message. A private thread token is returned instantly.",
  },
  {
    num: 4,
    title: "Thread is created",
    desc: "The application opens a conversation thread. The freelancer bookmarks /gigs/thread/[token] to check replies.",
  },
  {
    num: 5,
    title: "Admin replies",
    desc: "From /admin/gigs/[id], the admin sees all conversations and replies inline. The freelancer sees it on their thread page.",
  },
];

export default function DocsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold">Documentation</h1>
        <p className="text-sm text-muted-foreground mt-1">
          How Vibe Coder Hub works — every module, every flow.
        </p>
      </div>

      {/* Overview */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold mb-3">Overview</h2>
        <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
          <p>
            Vibe Coder Hub is an AI-native marketplace with two sides: a <strong className="text-foreground">public face</strong> where
            freelancers browse builders, explore showcase projects, and apply to gigs — and an <strong className="text-foreground">admin
            backend</strong> where gig posters manage their gigs, review applications, and track conversations.
          </p>
          <p>
            Each user who signs in gets their own isolated workspace. You only see the gigs you posted and the
            conversations on those gigs. Other gig posters can&apos;t see your data — and you can&apos;t see theirs.
            Public pages (builder directory, showcase, gig application) are shared across all users.
          </p>
          <p>
            Auth is handled by Clerk. Public pages are open to everyone. Admin pages
            (under <code className="text-xs bg-muted px-1.5 py-0.5 rounded">/admin/*</code>) require sign-in and
            are scoped to the logged-in user. The gig application flow is deliberately login-free — freelancers
            apply with just a name and track their thread via a private token URL.
          </p>
        </div>
        <div className="flex gap-3 mt-4 flex-wrap">
          <div className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 font-medium">
            <Globe size={12} /> Public — no login
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
            <Lock size={12} /> Admin — Clerk auth
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 font-medium">
            <Mail size={12} /> Token — no login, secret URL
          </div>
        </div>
      </section>

      {/* Gig application flow */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold mb-3">Gig Application Flow</h2>
        <p className="text-sm text-muted-foreground mb-5">
          The core loop: post → share → apply → converse.
        </p>
        <div className="space-y-3">
          {flowSteps.map((step) => (
            <div
              key={step.num}
              className="flex gap-4 items-start border border-border rounded-md p-4 bg-card"
            >
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                {step.num}
              </div>
              <div>
                <div className="text-sm font-semibold">{step.title}</div>
                <div className="text-sm text-muted-foreground mt-0.5">{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Module reference */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold mb-5">Module Reference</h2>
        <div className="space-y-6">
          {modules.map((m) => (
            <div
              key={m.id}
              id={m.id}
              className="border border-border rounded-lg bg-card"
            >
              <div className="p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <m.Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-sm">{m.title}</h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        m.audience === "Public"
                          ? "bg-green-500/10 text-green-600"
                          : m.audience === "Admin"
                          ? "bg-primary/10 text-primary"
                          : "bg-amber-500/10 text-amber-600"
                      }`}
                    >
                      {m.audience}
                    </span>
                  </div>
                  <Link
                    href={m.path}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors mt-0.5 inline-flex items-center gap-0.5"
                  >
                    {m.path} <ChevronRight size={10} />
                  </Link>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    {m.desc}
                  </p>
                </div>
              </div>
              <div className="border-t border-border px-5 py-3">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Features
                </div>
                <ul className="space-y-1">
                  {m.features.map((f, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Architecture notes */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold mb-3">Tech Stack</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: "Framework", value: "Next.js 15 (App Router)" },
            { label: "Auth", value: "Clerk" },
            { label: "Database", value: "PostgreSQL + Drizzle ORM" },
            { label: "Styling", value: "Tailwind CSS 4 + shadcn/ui" },
            { label: "State", value: "React Query (TanStack)" },
            { label: "Validation", value: "Zod + React Hook Form" },
            { label: "Hosting", value: "Vercel / xhostd" },
            { label: "DB Host", value: "Hostinger VPS (PostgreSQL 16)" },
          ].map((item) => (
            <div
              key={item.label}
              className="border border-border rounded-md px-4 py-3 bg-card flex items-center justify-between"
            >
              <span className="text-xs text-muted-foreground">{item.label}</span>
              <span className="text-sm font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Gig types reference */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold mb-3">Gig Types</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              Icon: Zap,
              type: "Task",
              desc: "Fixed-scope deliverable. One shot, one price. Budget min/max range.",
            },
            {
              Icon: Clock,
              type: "Hourly",
              desc: "Time-based engagement. Set an hourly rate. Track as it goes.",
            },
            {
              Icon: Wrench,
              type: "Build",
              desc: "Full project build. Larger scope, budget range, milestones implied.",
            },
          ].map((g) => (
            <div
              key={g.type}
              className="border border-border rounded-md p-4 bg-card"
            >
              <div className="flex items-center gap-2 mb-2">
                <g.Icon size={16} className="text-primary" />
                <span className="text-sm font-semibold">{g.type}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {g.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
