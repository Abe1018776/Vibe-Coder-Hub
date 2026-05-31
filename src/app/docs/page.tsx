import Link from "next/link";
import {
  LayoutGrid,
  Users,
  Briefcase,
  Trophy,
  CalendarDays,
  ShieldCheck,
} from "lucide-react";
import { Container, Eyebrow } from "@/components/brand/layout";

export const metadata = {
  title: "How YidVibe works",
  description:
    "YidVibe is the home where our community's builders show their work, get hired, find funding, compete, and connect — for the community, by the community.",
};

function Section({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-border pt-8">
      <h2 className="font-display text-2xl font-bold text-ink">{title}</h2>
      <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-ink/90">
        {children}
      </div>
    </section>
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
    title: "Builders & Directory",
    body: "Every project is tied to the person who made it. Browse builders, see their work, and reach them through the contact methods they choose to share.",
  },
  {
    icon: Briefcase,
    title: "Gigs",
    body: "Have work to offer? Post a gig with a budget or rate. Looking for work? Apply and chat privately with the poster.",
  },
  {
    icon: Trophy,
    title: "Competitions",
    body: "Run or enter build challenges with a prize and a deadline. Winners get a badge and the spotlight.",
  },
  {
    icon: CalendarDays,
    title: "Events",
    body: "Meetups, demos, and gatherings — see what's coming up and add your own.",
  },
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
        community show their work, get hired, find funding and buyers, compete,
        and connect — for the community, by the community.
      </p>

      <div className="mt-10 space-y-8">
        <Section title="What you can do here">
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

        <Section id="accounts" title="Accounts & posting">
          <p>
            You can browse everything without an account. To post a project,
            comment, upvote, apply to a gig, or message someone, create a free
            account — continue with Google, or sign up with your name, a
            username, email, and password. Then build out a profile so people
            know who you are.
          </p>
          <p>
            Prefer to stay private? You can post a project or a comment{" "}
            <strong>anonymously</strong> — your name is hidden and you show as
            &ldquo;Anonymous.&rdquo; (Gigs and competitions are always posted
            under your name so people know who they&apos;re dealing with.)
          </p>
        </Section>

        <Section id="contact" title="Getting in touch & doing business">
          <p>
            There are no public phone numbers or emails unless you add them.
            On your profile you choose which contact methods to show — email,
            phone, WhatsApp, Instagram, a website. When you post a gig or mark a
            project as <em>seeking funding</em>, <em>for sale</em>, or{" "}
            <em>open to partners</em>, we ask you to add at least one contact
            method first, so interested people can actually reach you.
          </p>
        </Section>

        <Section id="guidelines" title="Community guidelines">
          <p>Keep it useful and respectful. In short:</p>
          <ul className="ml-5 list-disc space-y-1.5 text-[15px] text-ink/90">
            <li>Post real work and honest information.</li>
            <li>No spam, scams, or misleading offers.</li>
            <li>Be respectful — no harassment or offensive content.</li>
            <li>Only share what you have the right to share.</li>
          </ul>
          <p>
            Anything off can be reported from the <strong>3-dot menu</strong> on
            a project, comment, or profile. Reports go to our team, who can hide
            or remove content.
          </p>
        </Section>

        <Section id="faq" title="FAQ">
          <p className="font-medium text-ink">Does it cost anything?</p>
          <p>No — posting, browsing, and connecting are free.</p>
          <p className="mt-3 font-medium text-ink">
            Can I post something I built with AI tools?
          </p>
          <p>
            Yes — that&apos;s the point. Tag the tools you used (Claude, Cursor,
            Lovable, and so on) so others can see how it was made.
          </p>
          <p className="mt-3 font-medium text-ink">
            How do notifications work?
          </p>
          <p>
            You&apos;ll get in-app notifications (the bell up top) when people
            engage with your work. You control exactly which ones in{" "}
            <Link href="/settings/notifications" className="text-teal-700 hover:underline">
              notification settings
            </Link>
            .
          </p>
        </Section>

        <Section id="contact-us" title="Contact us">
          <p>
            Found a bug, have an idea, or need help? Reach out through the
            contact details on the site, or report a problem from any{" "}
            <ShieldCheck size={15} className="inline -mt-0.5 text-teal-600" />{" "}
            3-dot menu.
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
