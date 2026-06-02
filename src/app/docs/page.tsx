import Link from "next/link";
import {
  LayoutGrid,
  Users,
  Compass,
  Briefcase,
  Trophy,
  CalendarDays,
  UserCircle,
  LogIn,
  Rocket,
  MessageSquare,
  Share2,
  Bell,
  Phone,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";
import { Container, Eyebrow } from "@/components/brand/layout";

export const metadata = {
  title: "How YidVibe works",
  description:
    "A complete guide to YidVibe — how to sign in, post your work, get hired, find work, compete, and connect privately. Free to use, for the community, by the community.",
};

function Section({
  id,
  title,
  icon: Icon,
  children,
}: {
  id?: string;
  title: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-border pt-8">
      <h2 className="flex items-center gap-2.5 font-display text-2xl font-bold text-ink">
        {Icon && <Icon size={22} className="shrink-0 text-teal-600" />}
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-ink/90">
        {children}
      </div>
    </section>
  );
}

/** Small reusable sub-heading inside a section. */
function Sub({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-5 font-display text-lg font-semibold text-ink">
      {children}
    </h3>
  );
}

const PILLARS = [
  {
    icon: LayoutGrid,
    title: "Showcase",
    body: "Post anything you built — an app, a tool, a site. Add a screenshot or a live link (or both), tag what it's about and what you built it with, and the community can upvote and comment.",
  },
  {
    icon: Users,
    title: "Builders",
    body: "Every project is tied to the person who made it. Browse builders, see their work, filter by tools and skills, and reach them through the contact methods they choose to share.",
  },
  {
    icon: Compass,
    title: "Directory",
    body: "A free listing of builders, makers, agencies, and services. Anyone can get listed — no account needed — and our team reviews each submission before it appears.",
  },
  {
    icon: Briefcase,
    title: "Gigs",
    body: "Have work to offer? Post a gig with a budget or rate. Looking for work? Apply and talk it through with the poster in a private thread.",
  },
  {
    icon: Trophy,
    title: "Competitions",
    body: "Run or enter build challenges with a prize and a deadline. Submit an entry, and the host picks a winner when it ends.",
  },
  {
    icon: CalendarDays,
    title: "Events",
    body: "Workshops and meetups for builders. Browse what's coming up, RSVP, and request to host your own.",
  },
];

const TOC = [
  { href: "#pillars", label: "What you can do here" },
  { href: "#accounts", label: "Accounts & sign-in" },
  { href: "#showcase", label: "The Showcase" },
  { href: "#builders", label: "Builders & Directory" },
  { href: "#gigs", label: "Gigs" },
  { href: "#competitions", label: "Competitions" },
  { href: "#events", label: "Events" },
  { href: "#dashboard", label: "Your dashboard" },
  { href: "#notes", label: "Private notes" },
  { href: "#sharing", label: "Sharing" },
  { href: "#notifications", label: "Notifications" },
  { href: "#contact", label: "Contact & doing business" },
  { href: "#safety", label: "Reporting & safety" },
  { href: "#guidelines", label: "Community guidelines" },
  { href: "#faq", label: "FAQ" },
];

export default function DocsPage() {
  return (
    <Container className="max-w-2xl py-12 md:py-16">
      <Eyebrow>How it works</Eyebrow>
      <h1 className="mt-3 font-display text-[clamp(2.2rem,5vw,3rem)] font-bold leading-tight tracking-tight text-ink">
        The home for our community&apos;s builders
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        YidVibe is where the people building software and AI tools in our
        community show their work, get hired, find buyers, compete, and
        connect — all completely free, for the community, by the community. This guide walks
        through every part of the site, so you know exactly how it all works and
        why.
      </p>

      {/* Quick jump */}
      <nav
        aria-label="On this page"
        className="mt-8 rounded-2xl border border-border bg-surface p-5"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          On this page
        </p>
        <ul className="mt-3 grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2">
          {TOC.map((t) => (
            <li key={t.href}>
              <Link
                href={t.href}
                className="text-[15px] text-teal-700 hover:underline"
              >
                {t.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-10 space-y-8">
        <Section id="pillars" title="What you can do here" icon={LayoutGrid}>
          <p>
            There are six places to spend your time. Everything else on the site
            supports these.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {PILLARS.map((p) => (
              <div
                key={p.title}
                className="rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-border-hover"
              >
                <p className="flex items-center gap-2 font-semibold text-ink">
                  <p.icon size={17} className="text-teal-600" />
                  {p.title}
                </p>
                <p className="mt-1.5 text-sm text-muted-foreground">{p.body}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section id="accounts" title="Accounts & sign-in" icon={LogIn}>
          <p>
            You can browse the whole site without an account. To post, comment,
            upvote, apply to a gig, enter a competition, or message someone,
            you&apos;ll need a free account.
          </p>
          <Sub>Two ways to join</Sub>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>
              <strong>Continue with Google</strong> — one click, nothing to
              remember.
            </li>
            <li>
              <strong>Email &amp; password</strong> — sign up with your name, a
              username, your email, and a password.
            </li>
          </ul>

          <Sub>Your profile is private by default</Sub>
          <p>
            When you join, your profile stays <strong>private</strong> — there&apos;s
            no public page for you yet, and you won&apos;t appear in Builders. The
            moment you first do something public <em>under your name</em> — like
            posting a project or leaving a comment — your profile becomes{" "}
            <strong>public</strong> so people can see who&apos;s behind the work.
            That switch happens once, and only because of something you chose to
            do.
          </p>

          <Sub>The &ldquo;I&apos;m a builder&rdquo; toggle</Sub>
          <p>
            In your profile settings there&apos;s a{" "}
            <strong>I&apos;m a builder / freelancer</strong> toggle. Turn it on to
            be listed on the <Link href="/builders" className="text-teal-700 hover:underline">Builders</Link>{" "}
            page so clients and the community can find you. There&apos;s also an{" "}
            <strong>Available for hire</strong> toggle that adds a green badge to
            your profile.
          </p>

          <Sub>Posting anonymously</Sub>
          <p>
            Prefer to stay behind the curtain? You can post a{" "}
            <strong>project</strong> or write a <strong>comment</strong>{" "}
            anonymously — your name is hidden and you show up as
            &ldquo;Anonymous.&rdquo; Only you and our team know it&apos;s yours,
            and an anonymous post never flips your profile to public. Anonymous
            posting is for projects and comments only; gigs and competitions are
            always under your name so people know who they&apos;re dealing with.
          </p>
        </Section>

        <Section id="showcase" title="The Showcase" icon={Rocket}>
          <p>
            The Showcase is the heart of YidVibe — a feed of what the community
            is building. Anything you post here also appears on your profile
            automatically.
          </p>

          <Sub>Posting a project</Sub>
          <p>
            Paste a live link and hit <strong>Autofill</strong> and we&apos;ll
            pull in a title, description, and cover image for you to edit. Then
            round it out:
          </p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>
              <strong>A screenshot, a live link, or both</strong> — so people can
              actually see what you made.
            </li>
            <li>
              <strong>Built with</strong> — the tools you used (Claude, Cursor,
              Lovable, and so on). These show as{" "}
              <span className="font-medium text-blue-deep">blue</span> chips.
            </li>
            <li>
              <strong>About</strong> — topic tags like AI, Education, or
              Productivity. These show as{" "}
              <span className="font-medium text-teal-800">teal</span> chips.
            </li>
            <li>
              <strong>A video or demo link</strong> (optional) — a Loom or clip
              that walks people through it.
            </li>
          </ul>

          <Sub>Commercial intent badges</Sub>
          <p>
            If your project is more than a show-and-tell, you can flag what
            you&apos;re looking for, and a badge appears on the project:
          </p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>
              <strong>For sale</strong> — the project itself is up for grabs.
            </li>
            <li>
              <strong>Open to partners</strong> — you want co-founders or
              collaborators.
            </li>
          </ul>
          <p>
            Because these invite people to reach out, you&apos;ll be asked to add
            at least one public contact method first (more on that{" "}
            <Link href="#contact" className="text-teal-700 hover:underline">below</Link>).
          </p>

          <Sub>Upvotes, comments &amp; the Featured badge</Sub>
          <p>
            Anyone signed in can <strong>upvote</strong> a project (it&apos;s how
            good work rises) and leave a <strong>comment</strong> — under your
            name or anonymously. A gold{" "}
            <strong>Featured</strong> badge is hand-picked by our team to
            spotlight standout work; you can&apos;t buy it or toggle it yourself.
            You can also <strong>save</strong> any project with the star to find
            it again later.
          </p>
        </Section>

        <Section id="builders" title="Builders & Directory" icon={Users}>
          <p>
            These are two different ways to find people — and they work
            differently.
          </p>
          <Sub>Builders</Sub>
          <p>
            <Link href="/builders" className="text-teal-700 hover:underline">Builders</Link>{" "}
            is the searchable list of community members who&apos;ve set up a
            public profile and turned on the builder toggle. You can search by
            name and filter by the tools they use, their skills, or whether
            they&apos;re available for hire. Each builder has a profile with their
            bio, projects, tools, skills, and the contact links they chose to
            share.
          </p>
          <Sub>Directory</Sub>
          <p>
            The <Link href="/directory" className="text-teal-700 hover:underline">Directory</Link>{" "}
            is a free listing of builders, makers, agencies, and services — think
            of it as a community business directory. The key difference:{" "}
            <strong>you don&apos;t need an account to get listed.</strong> Hit{" "}
            <strong>Get listed</strong>, tell us who you are and what you do, pick
            a category, and our team reviews every submission before it goes live.
          </p>
        </Section>

        <Section id="gigs" title="Gigs" icon={Briefcase}>
          <p>
            Gigs connect people who have work with people who can do it.
          </p>
          <Sub>Posting a gig</Sub>
          <p>
            Describe the work, choose a type — <strong>Task</strong> (one-off),{" "}
            <strong>Build</strong> (a full project), or <strong>Hourly</strong>{" "}
            (ongoing) — and add a <strong>budget range or hourly rate</strong> so
            applicants know what to expect. Because a gig invites people to reach
            you, you&apos;ll need at least one public contact method on your
            profile first.
          </p>
          <Sub>Applying &amp; private threads</Sub>
          <p>
            See a gig you want? Hit <strong>Apply</strong> and it opens a{" "}
            <strong>private thread</strong> between you and the poster — a
            one-on-one conversation no one else can see. The poster sees a list
            of all their applicants and can chat with each privately, then mark
            the gig <strong>Open</strong>, <strong>In progress</strong>, or{" "}
            <strong>Closed</strong>.
          </p>
        </Section>

        <Section id="competitions" title="Competitions" icon={Trophy}>
          <p>
            Competitions are build challenges with a prize and a deadline — a fun
            way to push the community and reward great work.
          </p>
          <Sub>Running one</Sub>
          <p>
            Write a brief (what to build, how you&apos;ll judge it), set a{" "}
            <strong>prize</strong> and a <strong>deadline</strong>, and post it.
            New competitions are <strong>reviewed by our team</strong> before
            they go public — until then, only you and admins can see it. When the
            deadline passes you pick the winner from the entries; they get a gold{" "}
            <strong>Winner</strong> badge.
          </p>
          <Sub>Entering one</Sub>
          <p>
            On any open competition, submit your entry with a link and an
            optional demo video before the deadline. Everyone&apos;s entries are
            listed on the page so the community can see what people built.
          </p>
        </Section>

        <Section id="events" title="Events" icon={CalendarDays}>
          <p>
            <Link href="/events" className="text-teal-700 hover:underline">Events</Link>{" "}
            is where community workshops and meetups live. Browse what&apos;s
            coming up and RSVP through the link on each event.
          </p>
          <p>
            Hosting something? Use <strong>Request to post an event</strong> and
            tell us about it. We review every request and post the good ones, so
            the events list stays relevant — you&apos;ll hear back by email.
          </p>
        </Section>

        <Section id="dashboard" title="Your dashboard" icon={UserCircle}>
          <p>
            Click your <strong>profile photo</strong> any time to open your{" "}
            <strong>dashboard</strong> — your private home base. It&apos;s
            organized into a few tabs:
          </p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>
              <strong>Overview</strong> — all your stats (projects, upvotes,
              gigs, competitions, events, saved items, followers, unread notes)
              plus quick cards to post something new.
            </li>
            <li>
              <strong>My posts</strong> — everything you&apos;ve published, in one
              place.
            </li>
            <li>
              <strong>Saved</strong> — projects you starred to revisit.
            </li>
            <li>
              <strong>Inbox</strong> — your private note threads.
            </li>
            <li>
              <strong>Profile &amp; skills</strong> — edit your bio, photo, tools,
              skills, contact links, and privacy settings.
            </li>
            <li>
              <strong>Account</strong> — your sign-in and account details.
            </li>
            <li>
              <strong>How it works</strong> — this guide, always one click away.
            </li>
          </ul>

          <Sub>Finding your way around</Sub>
          <p>
            On a computer, the main navigation lives in a{" "}
            <strong>sidebar on the left</strong>; on a phone it&apos;s the bar
            along the <strong>bottom</strong>. Every inner page has a clear,
            branded <strong>&larr; Back</strong>, and every form has a{" "}
            <strong>Cancel</strong> button — if you&apos;ve started typing,
            we&apos;ll ask before discarding your draft so you never lose work by
            accident.
          </p>
        </Section>

        <Section id="notes" title="Private notes" icon={MessageSquare}>
          <p>
            Sometimes you want to reach someone directly without it being public.
            Private notes are a light, two-way thread for exactly that — not a
            busy chat app, just a simple back-and-forth.
          </p>
          <Sub>Starting a note</Sub>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>
              Hit <strong>Message</strong> on someone&apos;s profile.
            </li>
            <li>
              Or hit <strong>Reply privately</strong> on a project to write to the
              builder about that specific project.
            </li>
          </ul>
          <p>
            Your notes live in your{" "}
            <Link href="/dashboard/inbox" className="text-teal-700 hover:underline">
              dashboard inbox
            </Link>
            , and you&apos;re notified when someone writes back.
          </p>
          <Sub>You decide who can reach you</Sub>
          <p>
            In your profile settings, the <strong>Private notes</strong> control
            lets you choose who can send you one:
          </p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>
              <strong>Anyone</strong> can send me a note.
            </li>
            <li>
              <strong>Only people who follow me.</strong>
            </li>
            <li>
              <strong>No one</strong> — turn private notes off entirely.
            </li>
          </ul>
        </Section>

        <Section id="sharing" title="Sharing your work" icon={Share2}>
          <p>
            Proud of something? Hit <strong>Share</strong> on any project to send
            a link. It comes with a ready-made caption like &ldquo;Check out my
            project on YidVibe,&rdquo; which you can edit before sending. Right
            after you post a project, a <strong>Posted! Share it</strong> moment
            gives you the same one-tap share.
          </p>
          <p>
            Shared links carry a <strong>rich preview</strong> — the project image
            and title show up automatically wherever you paste them, so your work
            looks good everywhere.
          </p>
        </Section>

        <Section id="notifications" title="Notifications" icon={Bell}>
          <p>
            When people engage with your work, you&apos;ll see it in the{" "}
            <strong>bell</strong> at the top of the site. Notifications are
            in-app, and everything is on by default.
          </p>
          <p>
            You&apos;re in full control of which ones you get. In{" "}
            <Link href="/settings/notifications" className="text-teal-700 hover:underline">
              notification settings
            </Link>{" "}
            you can toggle each type on or off: comments, upvotes, commercial
            interest (buying or partnering), gig applications, new
            messages in a gig thread, and competition wins.
          </p>
        </Section>

        <Section id="contact" title="Contact & doing business" icon={Phone}>
          <p>
            There are no public phone numbers or emails on YidVibe unless you add
            them yourself. On your profile you choose exactly which contact
            methods to show — email, phone, WhatsApp, Instagram, a website,
            GitHub, X, or LinkedIn. Only the ones you fill in appear, as clickable
            buttons on your public profile.
          </p>
          <p>
            Because some actions are about doing business, we make sure people can
            actually reach you first. Before you can{" "}
            <strong>post a gig</strong> or mark a project as{" "}
            <em>for sale</em> or{" "}
            <em>open to partners</em>, you&apos;ll be asked to add at least one
            public contact method.
          </p>
        </Section>

        <Section id="safety" title="Reporting & safety" icon={ShieldCheck}>
          <p>
            See something that doesn&apos;t belong? Every project, comment, and
            profile has a quiet <strong>3-dot menu</strong> with a{" "}
            <strong>Report</strong> option. Reports go straight to our team, who
            can hide or remove content. It&apos;s tucked out of the way so it
            never gets in the way — but it&apos;s always there when you need it.
          </p>
        </Section>

        <Section id="guidelines" title="Community guidelines" icon={Users}>
          <p>Keep it useful and respectful. In short:</p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>Post real work and honest information.</li>
            <li>No spam, scams, or misleading offers.</li>
            <li>Be respectful — no harassment or offensive content.</li>
            <li>Only share what you have the right to share.</li>
          </ul>
          <p>
            Anything off can be reported from the 3-dot menu, and our team
            reviews it.
          </p>
        </Section>

        <Section id="faq" title="FAQ" icon={HelpCircle}>
          <p className="font-medium text-ink">Does it cost anything?</p>
          <p>
            No. Browsing, posting, getting listed, and connecting are all free.
          </p>

          <p className="mt-3 font-medium text-ink">
            Can I post something I built with AI tools?
          </p>
          <p>
            Yes — that&apos;s the point. Tag the tools you used (Claude, Cursor,
            Lovable, and so on) so others can see how it was made and learn from
            it.
          </p>

          <p className="mt-3 font-medium text-ink">
            How do notifications work?
          </p>
          <p>
            You get in-app notifications via the bell up top when people engage
            with your work. You choose exactly which types in{" "}
            <Link href="/settings/notifications" className="text-teal-700 hover:underline">
              notification settings
            </Link>
            .
          </p>

          <p className="mt-3 font-medium text-ink">
            Do I have to use my real name?
          </p>
          <p>
            No. You can post projects and comments anonymously, and you decide
            which contact details (if any) appear on your profile. Gigs and
            competitions are the exception — those are always under your name.
          </p>

          <p className="mt-3 font-medium text-ink">
            When does my profile become public?
          </p>
          <p>
            Only when you first post something under your name — a project or a
            comment. Until then, you stay private. Anonymous posts never make you
            public.
          </p>
        </Section>

        <Section id="contact-us" title="Need help?" icon={HelpCircle}>
          <p>
            Found a bug, have an idea, or need a hand? Reach out through the
            contact details on the site, or report a problem from any{" "}
            <ShieldCheck size={15} className="inline -mt-0.5 text-teal-600" />{" "}
            3-dot menu. Now you know how everything works — go build something.
          </p>
          <div className="pt-2">
            <Link
              href="/showcase"
              className="btn-sweep inline-flex h-12 items-center justify-center rounded-full px-6 text-[15px] font-semibold"
            >
              Explore the showcase
            </Link>
          </div>
        </Section>
      </div>
    </Container>
  );
}
