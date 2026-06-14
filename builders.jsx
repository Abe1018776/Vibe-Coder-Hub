/* global React, Ic, Avatar, Sparkle, ProjectCard, useReveal */
const { useState: useStateB } = React;

function BuilderCard({ b, go }) {
  const count = b.owns ? b.owns.length : 0;
  return (
    <button type="button" className="builder-card"
      style={{ borderTop: `3px solid hsl(${b.hue} 38% 72%)` }}
      onClick={() => go("builder:" + b.id)}>
      <div className="bc-top">
        <Avatar name={b.name} hue={b.hue} size={52} />
        <div className="bc-id">
          <span className="bc-name">
            {b.name}
            {b.verified && <Sparkle size={13} color="var(--gold-500)" style={{ marginLeft: 5, verticalAlign: "middle" }} />}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 2 }}>
            <span className="bc-handle">@{b.handle}</span>
            {b.available && (
              <span className="avail-badge" style={{ marginLeft: 0, fontSize: 11 }}>
                <span className="dot"></span> Open to work
              </span>
            )}
          </div>
        </div>
      </div>
      {b.bio && <p className="bc-bio">{b.bio}</p>}
      {((b.skills && b.skills.length > 0) || (b.tools && b.tools.length > 0)) && (
        <div className="bc-skills">
          {(b.skills || []).slice(0, 2).map((s) => <span key={s} className="chip">{s}</span>)}
          {(b.tools || []).slice(0, 2).map((t) => <span key={t} className="chip mono">{t}</span>)}
        </div>
      )}
      <div className="bc-foot">
        <span>{count} {count === 1 ? "project" : "projects"}</span>
        <Ic.arrow width="16" height="16" />
      </div>
    </button>
  );
}

function Builders({ go }) {
  useReveal();
  const [filter, setFilter] = useStateB("all");
  const builders = window.YV_BUILDERS;
  const available = builders.filter((b) => b.available);
  const shown = filter === "available" ? available : builders;

  return (
    <main>
      <section className="page-head">
        <div className="container">
          <div className="page-head-row reveal">
            <div>
              <span className="eyebrow">The people behind it</span>
              <h1>Builders</h1>
              <p>Meet the people shipping AI apps and tools in the community.</p>
            </div>
            <button className="btn btn-ghost" onClick={() => go("directory")}>Full directory <Ic.arrow width="16" height="16" /></button>
          </div>

          <div className="seg reveal" style={{ marginTop: 24 }}>
            <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>
              All builders&nbsp;<span style={{ opacity: .55 }}>{builders.length}</span>
            </button>
            <button className={filter === "available" ? "active" : ""} onClick={() => setFilter("available")}>
              Open to work&nbsp;<span style={{ opacity: .55 }}>{available.length}</span>
            </button>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 8 }}>
        <div className="container">
          {shown.length === 0 ? (
            <div className="empty reveal">
              <h3 style={{ marginTop: 14 }}>No builders here yet</h3>
              <p>Check back soon — the community is growing.</p>
            </div>
          ) : (
            <div className="builders-grid">
              {shown.map((b, i) => (
                <div key={b.id} className="reveal" style={{ transitionDelay: (i % 3 * 70) + "ms" }}>
                  <BuilderCard b={b} go={go} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta-band reveal">
            <h2>Are you building too?</h2>
            <p>Add your profile and show the community what you're working on.</p>
            <div className="hero-cta">
              <button className="btn btn-ghost btn-lg" onClick={() => go("submit")}>Submit a project <Ic.arrow /></button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function BuilderProfile({ id, go, t, isMe }) {
  useReveal();
  const [following, setFollowing] = useStateB(() => {
    try { return !!(localStorage.getItem("yv_follow_" + id)); } catch { return false; }
  });

  const toggleFollow = () => {
    const next = !following;
    setFollowing(next);
    try {
      if (next) localStorage.setItem("yv_follow_" + id, "1");
      else localStorage.removeItem("yv_follow_" + id);
    } catch {}
  };
  const b = window.YV_BUILDERS.find((x) => x.id === id);

  if (!b) {
    return (
      <main>
        <section className="page-head">
          <div className="container">
            <button className="back-link" onClick={() => go("builders")}>
              <Ic.chevDown style={{ transform: "rotate(90deg)" }} /> All builders
            </button>
            <div className="empty" style={{ marginTop: 40 }}>
              <h3>Builder not found</h3>
              <p>This profile doesn't exist yet — but they might join soon.</p>
              <button className="btn btn-ghost" style={{ marginTop: 18 }} onClick={() => go("builders")}>Browse builders</button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const mine = (b.owns || []).map((pid) => window.YV_PROJECTS.find((p) => p.id === pid)).filter((p) => p && !p.anon);
  const hasSkills = b.skills && b.skills.length > 0;
  const hasTools = b.tools && b.tools.length > 0;

  return (
    <main>
      <section className="page-head">
        <div className="container">
          <button className="back-link" onClick={() => go("builders")}>
            <Ic.chevDown style={{ transform: "rotate(90deg)" }} /> All builders
          </button>
          <div className="profile-card reveal">
            <div className="pf-main">
              <Avatar name={b.name} hue={b.hue} size={76} />
              <div className="pf-id">
                <h1>{b.name}{b.verified && <Sparkle size={18} color="var(--gold-500)" style={{ marginLeft: 8, verticalAlign: "middle" }} />}</h1>
                <span className="pf-handle">@{b.handle}</span>
                {b.bio && <p className="pf-bio">{b.bio}</p>}
                {b.available && (
                  <span className="avail-badge" style={{ marginTop: 10, display: "inline-flex" }}>
                    <span className="dot"></span> Available for hire
                  </span>
                )}
              </div>
            </div>
            <div className="pf-actions">
              {isMe
                ? <button className="btn btn-ghost btn-sm" onClick={() => alert("Profile editing coming soon — stay tuned!")}><Ic.pencil /> Edit profile</button>
                : <button className={following ? "btn btn-ghost btn-sm" : "btn btn-primary btn-sm"} onClick={toggleFollow}>{following ? "Following" : "Follow"}</button>}
              <button className="icon-btn" aria-label="More"><Ic.dots /></button>
            </div>
          </div>

          {(hasSkills || hasTools) && (
            <div className="pf-meta reveal">
              {hasSkills && (
                <div className="pf-meta-row">
                  <span className="pf-meta-label">Skills</span>
                  <div className="chip-set">
                    {b.skills.map((s) => <span key={s} className="chip">{s}</span>)}
                  </div>
                </div>
              )}
              {hasTools && (
                <div className="pf-meta-row">
                  <span className="pf-meta-label">Tools</span>
                  <div className="chip-set">
                    {b.tools.map((tool) => <span key={tool} className="chip mono">{tool}</span>)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <section style={{ paddingTop: 12 }}>
        <div className="container">
          <h2 className="sub-h2 reveal">{isMe ? "Your projects" : "Projects"}</h2>
          {mine.length === 0 ? (
            <div className="empty reveal">
              <Sparkle size={26} color="var(--teal-400)" />
              <h3 style={{ marginTop: 14 }}>Nothing here yet</h3>
              <p>{isMe ? "Post your first project to show it here." : "This builder hasn't posted a project yet."}</p>
              {isMe && <button className="btn btn-primary" style={{ marginTop: 18 }} onClick={() => go("submit")}><Ic.plus /> Submit a project</button>}
            </div>
          ) : (
            <div className="showcase-grid">
              {mine.map((p, i) => (
                <div key={p.id} className="reveal" style={{ transitionDelay: (i % 3 * 70) + "ms" }}>
                  <ProjectCard p={p} coverStyle={t.coverStyle} go={go} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

Object.assign(window, { Builders, BuilderProfile });
