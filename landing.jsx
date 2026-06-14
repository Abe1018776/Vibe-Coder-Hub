/* global React, Ic, Sparkle, ProjectCard, useReveal */

function Landing({ go, t }) {
  useReveal();
  const projects = window.YV_PROJECTS;

  // Pick featured projects by ID so the list is order-independent
  const freshIds = ["vibecoded", "tefilla", "kehilla"];
  const fresh = freshIds.map((id) => projects.find((p) => p.id === id)).filter(Boolean);

  // Derive stats from actual data
  const projectCount  = projects.length;
  const builderCount  = window.YV_BUILDERS.length;
  const openGigCount  = window.YV_GIGS.length;

  const audiences = [
    {
      tint: "tint-teal", icon: <Ic.hammer />, tag: "I build",
      title: "Show what you made",
      body: "Post an app, a tool, a site. Add a screenshot or a live link, tag how you built it, and let the community find it.",
      cta: "Post a project", to: "submit",
    },
    {
      tint: "tint-gold", icon: <Ic.coins />, tag: "I'm looking",
      title: "Find, hire & invest",
      body: "Browse what the community is building. Reach the people behind it to hire, fund, buy, or partner — no tech background needed.",
      cta: "Browse builders", to: "builders",
    },
    {
      tint: "tint-blue", icon: <Ic.compass />, tag: "I'm curious",
      title: "Just look around",
      body: "New to all of this? Explore freely — no account required. See what's possible when the community builds together.",
      cta: "Explore the showcase", to: "showcase",
    },
  ];

  // Feature cards each link to their correct destination
  const features = [
    { tint: "tint-teal",   icon: <Ic.grid />,      title: "Showcase",          body: "Show off what you built. Upvote the best.",                              to: "showcase"     },
    { tint: "tint-blue",   icon: <Ic.users />,      title: "Builder Directory", body: "Find builders by skill, tool, or vibe.",                                 to: "directory"    },
    { tint: "tint-orange", icon: <Ic.briefcase />,  title: "Gig Board",         body: "Post a gig, get applicants, manage it in one place.",                    to: "gigs"         },
    { tint: "tint-gold",   icon: <Ic.trophy />,     title: "Competitions",      body: "Post a bounty. Anyone submits. You pick the winner.",                    to: "competitions" },
  ];

  return (
    <main>
      {/* HERO */}
      <section className="hero">
        <div className="hero-grain"></div>
        <div className="hero-bg">
          <div className="aurora-field f1"></div>
          <div className="aurora-field f2"></div>
        </div>
        <div className="container hero-inner">
          <span className="badge-pill reveal in"><Sparkle size={14} /> The home for our community's builders</span>
          <h1 className="reveal in">
            Discover what the<br />community is <span className="accent">building</span>
          </h1>
          <p className="hero-sub reveal in">
            Apps, tools and ideas — made by the people in our community, for the people in our community.
            Find them, back them, or build your own.
          </p>

          {/* Search bar — clicking navigates to Showcase with the typed query */}
          <HeroSearch go={go} />

          <div className="hero-cta reveal in">
            <button className="btn btn-primary btn-lg" onClick={() => go("showcase")}>Explore the Showcase <Ic.arrow /></button>
            <button className="btn btn-ghost btn-lg" onClick={() => go("builders")}>Browse builders</button>
          </div>

          <div className="stats reveal in">
            <div className="stat">
              <div className="stat-num">{projectCount}</div>
              <div className="stat-label">Projects</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <div className="stat-num">{builderCount}</div>
              <div className="stat-label">Builders</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <div className="stat-num"><span className="gold">{openGigCount}</span></div>
              <div className="stat-label">Open gigs</div>
            </div>
          </div>
        </div>
      </section>

      {/* AUDIENCE */}
      <section className="section">
        <div className="container">
          <div className="section-head reveal">
            <div>
              <span className="eyebrow">However you show up</span>
              <h2 style={{ marginTop: 14 }}>There's a place for you here</h2>
            </div>
          </div>
          <div className="audience-grid">
            {audiences.map((a, i) => (
              <div key={a.title} className={"audience-card reveal " + a.tint} style={{ transitionDelay: i * 80 + "ms" }}>
                <div className="a-icon">{a.icon}</div>
                <span className="a-tag">{a.tag}</span>
                <h3 style={{ marginTop: 6 }}>{a.title}</h3>
                <p>{a.body}</p>
                <div className="a-links">
                  <a className="link-arrow" href={"#/" + a.to} onClick={(e) => { e.preventDefault(); go(a.to); }}>
                    {a.cta} <Ic.arrow width="16" height="16" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section">
        <div className="container">
          <div className="section-head reveal">
            <div>
              <span className="eyebrow">Everything in one place</span>
              <h2 style={{ marginTop: 14 }}>Everything you need</h2>
              <p>A simple home for showing your work, finding people, and doing business — together.</p>
            </div>
          </div>
          <div className="feature-grid">
            {features.map((f, i) => (
              <div key={f.title} className={"feature-card reveal " + f.tint} style={{ transitionDelay: i * 70 + "ms" }}>
                <div className="f-icon">{f.icon}</div>
                <h4>{f.title}</h4>
                <p>{f.body}</p>
                <div className="f-link">
                  <a className="link-arrow" href={"#/" + f.to} onClick={(e) => { e.preventDefault(); go(f.to); }} style={{ fontSize: 13.5 }}>
                    Explore <Ic.arrow width="15" height="15" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FRESH FROM SHOWCASE */}
      <section className="section">
        <div className="container">
          <div className="section-head reveal">
            <div>
              <span className="eyebrow">Just shipped</span>
              <h2 style={{ marginTop: 14 }}>Fresh from the Showcase</h2>
            </div>
            <a className="link-arrow" href="#/showcase" onClick={(e) => { e.preventDefault(); go("showcase"); }}>
              See all <Ic.arrow width="16" height="16" />
            </a>
          </div>
          <div className="showcase-grid">
            {fresh.map((p, i) => (
              <div key={p.id} className="reveal" style={{ transitionDelay: i * 80 + "ms" }}>
                <ProjectCard p={p} coverStyle={t.coverStyle} go={go} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container">
          <div className="cta-band reveal">
            <h2>Ready to vibe?</h2>
            <p>Join the place where builders, businesses, and curious minds meet.</p>
            <div className="hero-cta">
              <button className="btn btn-ghost btn-lg" onClick={() => go("submit")}>Submit a project</button>
              <button className="btn btn-gold btn-lg" onClick={() => go("showcase")}>Explore <Ic.arrow /></button>
            </div>
            <p className="small-note">New here? <a href="#/how" onClick={(e) => { e.preventDefault(); go("how"); }}>See how YidVibe works</a></p>
          </div>
        </div>
      </section>
    </main>
  );
}

/* Hero search — actual input that carries the query into Showcase */
const { useState: useStateHS, useRef: useRefHS } = React;
function HeroSearch({ go }) {
  const [q, setQ] = useStateHS("");

  const doSearch = () => {
    // Store the query so Showcase can pick it up
    window.YV_PENDING_SEARCH = q.trim();
    go("showcase");
  };

  return (
    <div className="hero-search reveal in">
      <Ic.search style={{ color: "var(--muted)", flexShrink: 0 }} />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search projects, builders, tools…"
        onKeyDown={(e) => { if (e.key === "Enter") doSearch(); }}
      />
      <button className="btn btn-primary btn-sm" onClick={doSearch}>Search</button>
    </div>
  );
}

window.Landing = Landing;
