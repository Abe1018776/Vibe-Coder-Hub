/* global React, Ic, useReveal */
const { useState: useStateHow } = React;

function FaqItem({ q, a }) {
  const [open, setOpen] = useStateHow(false);
  return (
    <div className={"faq" + (open ? " open" : "")}>
      <button type="button" className="faq-q" onClick={() => setOpen(!open)}>
        {q}<span className="faq-chev"><Ic.chevDown /></span>
      </button>
      {open && <p className="faq-a">{a}</p>}
    </div>
  );
}

function HowItWorks({ go }) {
  useReveal();
  const cards = [
    { icon: <Ic.grid />, tint: "tint-teal", title: "Showcase", body: "Post anything you built — an app, a tool, a site. Add a screenshot or a live link, tag it, and the community can upvote and comment.", to: "showcase" },
    { icon: <Ic.users />, tint: "tint-blue", title: "Builders & Directory", body: "Every project is tied to the person who made it. Browse builders and reach them through the contact methods they choose to share.", to: "directory" },
    { icon: <Ic.briefcase />, tint: "tint-orange", title: "Gigs", body: "Have work to offer? Post a gig with a budget or rate. Looking for work? Apply and chat privately with the poster.", to: "gigs" },
    { icon: <Ic.trophy />, tint: "tint-gold", title: "Competitions", body: "Run or enter build challenges with a prize and a deadline. Winners get a badge and the spotlight.", to: "competitions" },
    { icon: <Ic.calendar />, tint: "tint-sage", title: "Events", body: "Meetups, demos, and gatherings — see what's coming up and add your own.", to: "events" },
  ];
  const faqs = [
    { q: "Does it cost anything?", a: "No — posting, browsing, and connecting are free." },
    { q: "Can I post something I built with AI tools?", a: "Yes — that's the point. Tag the tools you used (Claude, Cursor, Lovable, and so on) so others can see how it was made." },
    { q: "How do notifications work?", a: "You'll get in-app notifications (the bell up top) when people engage with your work. You control exactly which ones in notification settings." },
    { q: "Can I stay anonymous?", a: "You can post a project or comment anonymously — your name is hidden and you show as “Anonymous.” Gigs and competitions are always under your name." },
  ];

  return (
    <main className="how-page">
      <div className="container how-wrap">
        <header className="how-hero reveal">
          <span className="eyebrow">How it works</span>
          <h1>The home for our community's builders</h1>
          <p>YidVibe is where the people building software and AI tools in our community show their work, get hired, find funding and buyers, compete, and connect — for the community, by the community.</p>
        </header>

        <section className="how-section reveal">
          <h2 className="sub-h2">What you can do here</h2>
          <div className="how-grid">
            {cards.map((c) => (
              <button type="button" key={c.title} className={"how-card " + c.tint} onClick={() => go(c.to)}>
                <span className="a-icon">{c.icon}</span>
                <h3>{c.title}</h3>
                <p>{c.body}</p>
                <span className="link-arrow" style={{ fontSize: 13.5 }}>Open <Ic.arrow width="15" height="15" /></span>
              </button>
            ))}
          </div>
        </section>

        <section className="how-section reveal">
          <h2 className="sub-h2">Accounts &amp; posting</h2>
          <p className="how-prose">You can browse everything right now without an account. Full accounts — with a profile, notifications, and messaging — are coming soon. In the meantime you can still post projects, comments, and gigs under your name, and everything you do is saved in your browser.</p>
          <p className="how-prose">Prefer to stay private? You can post a project or a comment anonymously — your name is hidden and you show as “Anonymous.” Gigs and competitions are always posted under your name so people know who they're dealing with.</p>
        </section>

        <section className="how-section reveal">
          <h2 className="sub-h2">Getting in touch &amp; doing business</h2>
          <p className="how-prose">There are no public phone numbers or emails unless you add them. On your profile you choose which contact methods to show — email, phone, WhatsApp, Instagram, a website. When you post a gig or mark a project as seeking funding, for sale, or open to partners, we ask you to add at least one contact method first, so interested people can actually reach you.</p>
        </section>

        <section className="how-section reveal">
          <h2 className="sub-h2">Community guidelines</h2>
          <ul className="how-list">
            <li>Post real work and honest information.</li>
            <li>No spam, scams, or misleading offers.</li>
            <li>Be respectful — no harassment or offensive content.</li>
            <li>Only share what you have the right to share.</li>
          </ul>
          <p className="how-prose" style={{ marginTop: 14 }}>Anything off can be reported from the 3-dot menu on a project, comment, or profile. Reports go to our team, who can hide or remove content.</p>
        </section>

        <section className="how-section reveal">
          <h2 className="sub-h2">FAQ</h2>
          <div className="faq-list">{faqs.map((f) => <FaqItem key={f.q} q={f.q} a={f.a} />)}</div>
        </section>

        <div className="cta-band reveal" style={{ marginTop: 56 }}>
          <h2>Ready to vibe?</h2>
          <p>Join the place where builders, businesses, and curious minds meet.</p>
          <div className="hero-cta">
            <button className="btn btn-ghost btn-lg" onClick={() => go("submit")}>Post a project</button>
            <button className="btn btn-gold btn-lg" onClick={() => go("showcase")}>Explore <Ic.arrow /></button>
          </div>
        </div>
      </div>
    </main>
  );
}

window.HowItWorks = HowItWorks;
