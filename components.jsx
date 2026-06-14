/* global React */
const { useState, useEffect, useRef, useCallback } = React;

/* ============================================================
   Icons (Lucide-style, 1.7 stroke)
   ============================================================ */
const Ic = {
  arrow:     (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>,
  search:    (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></svg>,
  bell:      (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" /><path d="M10.5 19a1.8 1.8 0 0 0 3 0" /></svg>,
  trophy:    (p) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M7 4h10v5a5 5 0 0 1-10 0z" /><path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3" /><path d="M10 15h4M9 20h6M12 15v5" /></svg>,
  briefcase: (p) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18" /></svg>,
  users:     (p) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="9" cy="8" r="3.2" /><path d="M3 19a6 6 0 0 1 12 0M16 6.5a3 3 0 0 1 0 5.8M21 19a5.5 5.5 0 0 0-4-5.3" /></svg>,
  grid:      (p) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>,
  calendar:  (p) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" /></svg>,
  spark:     (p) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /></svg>,
  chevDown:  (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m6 9 6 6 6-6" /></svg>,
  chevUp:    (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m6 15 6-6 6 6" /></svg>,
  x:         (p) => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M18 6 6 18M6 6l12 12" /></svg>,
  plus:      (p) => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 5v14M5 12h14" /></svg>,
  hammer:    (p) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M14.5 5.5 19 10l-3 3-4.5-4.5zM12.5 7.5l-7 7a2 2 0 0 0 0 3 2 2 0 0 0 3 0l7-7M16 3l5 5" /></svg>,
  compass:   (p) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5z" /></svg>,
  coins:     (p) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><ellipse cx="9" cy="7" rx="6" ry="3" /><path d="M3 7v5c0 1.7 2.7 3 6 3s6-1.3 6-3M15 11.5c2.5.3 6 1.4 6 3.5 0 1.7-2.7 3-6 3-1.2 0-2.3-.2-3.2-.5" /></svg>,
  wand:      (p) => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M15 4V2M15 10V8M19 6h2M9 6h2M17.5 8.5 19 10M17.5 3.5 19 2" /><path d="m3 21 11-11" /><path d="m12.5 6.5 5 5" /></svg>,
  upload:    (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 16V4M7 9l5-5 5 5M5 20h14" /></svg>,
  imagePlus: (p) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M19 13v6H5V5h6" /><path d="M16 4h5M18.5 1.5v5" /><path d="m5 16 4-4 3 3 3-3 4 4" /><circle cx="9.5" cy="9.5" r="1.2" /></svg>,
  check:     (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m5 12 5 5 9-10" /></svg>,
  dots:      (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></svg>,
  pencil:    (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M16.5 4.5 19.5 7.5 8 19l-4 1 1-4z" /><path d="M14.5 6.5 17.5 9.5" /></svg>,
  globe:     (p) => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" /></svg>,
  menu:      (p) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 6h16M4 12h16M4 18h16" /></svg>,
  link:      (p) => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  flag:      (p) => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>,
};

/* rounded 4-point AI sparkle */
function Sparkle({ size = 16, color = "var(--gold-500)", style }) {
  return (
    <svg width={size} height={size} viewBox="-12 -12 24 24" style={style} aria-hidden="true">
      <path d="M0 -10 C1.6 -10 1.2 -4.5 2.8 -2.8 C4.5 -1.2 10 -1.6 10 0 C10 1.6 4.5 1.2 2.8 2.8 C1.2 4.5 1.6 10 0 10 C-1.6 10 -1.2 4.5 -2.8 2.8 C-4.5 1.2 -10 1.6 -10 0 C-10 -1.6 -4.5 -1.2 -2.8 -2.8 C-1.2 -4.5 -1.6 -10 0 -10 Z" fill={color} />
    </svg>
  );
}

/* YidVibe figure mark */
function LogoMark({ size = 30, stroke = "var(--teal-600)", spark = "var(--gold-500)" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <g stroke={stroke} strokeWidth="10.5" strokeLinecap="round" fill="none">
        <path d="M24 24 C34 38, 45 51, 50 61 C53 69, 56 81, 59 92" />
        <path d="M76 24 C66 38, 55 51, 50 61 C47 69, 44 81, 41 92" />
      </g>
      <g transform="translate(50 13) scale(0.6)">
        <path d="M0 -10 C1.6 -10 1.2 -4.5 2.8 -2.8 C4.5 -1.2 10 -1.6 10 0 C10 1.6 4.5 1.2 2.8 2.8 C1.2 4.5 1.6 10 0 10 C-1.6 10 -1.2 4.5 -2.8 2.8 C-4.5 1.2 -10 1.6 -10 0 C-10 -1.6 -4.5 -1.2 -2.8 -2.8 C-1.2 -4.5 -1.6 -10 0 -10 Z" fill={spark} />
      </g>
    </svg>
  );
}

/* builder avatar — initials on a soft brand tint */
function Avatar({ name, hue = 168, size = 48 }) {
  const initials = name.split(" ").filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <span className="yv-avatar" style={{
      width: size, height: size, fontSize: size * 0.36,
      background: `hsl(${hue} 30% 92%)`, color: `hsl(${hue} 32% 38%)`
    }}>{initials}</span>
  );
}

/* app-icon style mark */
function LogoBadge({ size = 34 }) {
  return (
    <span className="logo-badge" style={{ width: size, height: size }}>
      <LogoMark size={size * 0.74} stroke="#fff" spark="var(--gold-300)" />
    </span>
  );
}

/* ============================================================
   AnimatedCover
   ============================================================ */
function AnimatedCover({ initial, hue = 168, style = "soft" }) {
  const tint   = `hsl(${hue} 30% 93%)`;
  const tintDp = `hsl(${hue} 33% 85%)`;
  const ink    = `hsl(${hue} 32% 41%)`;
  const sparkC = `hsl(${hue} 30% 66%)`;

  if (style === "glow") {
    return (
      <div className="pc-fill" style={{ background: `radial-gradient(115% 85% at 50% 24%, ${tintDp}, ${tint} 72%)` }}>
        <div className="pc-initial" style={{ color: ink }}>{initial}</div>
      </div>
    );
  }
  if (style === "rings") {
    return (
      <div className="pc-fill pc-rings" style={{ background: tint, "--ring": tintDp }}>
        <div className="pc-initial" style={{ color: ink }}>{initial}</div>
      </div>
    );
  }
  return (
    <div className="pc-fill" style={{ background: tint }}>
      <Sparkle size={20} color={sparkC} style={{ position: "absolute", top: 14, right: 14, opacity: .8 }} />
      <div className="pc-initial" style={{ color: ink }}>{initial}</div>
    </div>
  );
}

/* ============================================================
   Upvote — persists to localStorage by project id
   ============================================================ */
function Upvote({ count, id }) {
  const [voted, setVoted] = useState(() => {
    try { return !!(JSON.parse(localStorage.getItem("yv_votes") || "{}")[id]); } catch { return false; }
  });

  const n = count + (voted ? 1 : 0);

  const toggle = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !voted;
    setVoted(next);
    try {
      const v = JSON.parse(localStorage.getItem("yv_votes") || "{}");
      if (next) v[id] = true; else delete v[id];
      localStorage.setItem("yv_votes", JSON.stringify(v));
    } catch {}
  }, [voted, id]);

  return (
    <button className={"upvote" + (voted ? " voted" : "")} onClick={toggle} aria-label="Upvote">
      <Ic.chevUp />
      <span className="uv-count">{n}</span>
    </button>
  );
}

/* ============================================================
   Project card
   ============================================================ */
function ProjectCard({ p, coverStyle, go }) {
  const builder = !p.anon ? window.YV_BUILDERS.find((b) => b.name === p.by || (b.owns || []).includes(p.id) && !p.anon) : null;
  const onAuthorClick = (builder && go) ? (e) => { e.preventDefault(); e.stopPropagation(); go("builder:" + builder.id); } : null;

  return (
    <a className={"project-card" + (p.featured ? " featured" : "")}
      href={"#/project/" + p.id}
      onClick={(e) => { e.preventDefault(); if (go) go("project:" + p.id); }}>
      <div className="pc-cover">
        <AnimatedCover initial={p.initial} hue={p.hue} style={coverStyle} />
        {p.featured && <span className="pc-flag"><Ic.spark width="13" height="13" /> Featured</span>}
        {!p.featured && p.live && <span className="pc-flag live"><span className="lf-dot"></span> Live</span>}
        <div className="pc-tools">
          {p.tools.slice(0, 2).map((t) => <span key={t} className="chip">{t}</span>)}
        </div>
      </div>
      <div className="pc-body">
        <div className="pc-head">
          <h3 className="pc-title">{p.name}</h3>
          <Upvote count={p.votes} id={p.id} />
        </div>
        <p className="pc-desc">{p.desc}</p>
        <div className="pc-tags">
          {p.tags.map((t) => <span key={t} className="chip blue">{t}</span>)}
        </div>
        <div className="pc-foot">
          <span className="pc-by" onClick={onAuthorClick}
            style={onAuthorClick ? { cursor: "pointer" } : {}}>
            <span className={"av" + (p.anon ? " anon" : "")}>{p.anon ? "?" : p.by.split(" ").map((w) => w[0]).join("").slice(0, 2)}</span>
            by <strong style={onAuthorClick ? { color: "var(--accent-strong)" } : {}}>{p.by}</strong>
          </span>
          <Ic.arrow width="16" height="16" style={{ color: "var(--muted)" }} />
        </div>
      </div>
    </a>
  );
}

/* ============================================================
   Nav — with working bell panel and user menu
   ============================================================ */
function Nav({ route, go }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);   // mobile hamburger
  const [bellOpen, setBellOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const bellRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    if (!bellOpen && !userOpen) return;
    const close = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
    };
    window.addEventListener("mousedown", close);
    return () => window.removeEventListener("mousedown", close);
  }, [bellOpen, userOpen]);

  const links = [
    { k: "showcase",     label: "Showcase" },
    { k: "builders",     label: "Builders" },
    { k: "directory",    label: "Directory" },
    { k: "gigs",         label: "Gigs" },
    { k: "competitions", label: "Competitions" },
    { k: "events",       label: "Events" },
    { k: "how",          label: "How it works" },
  ];

  const navGo = (r) => { setMenuOpen(false); setBellOpen(false); setUserOpen(false); go(r); };

  return (
    <nav className={"nav" + (scrolled ? " scrolled" : "")}>
      <div className="container nav-inner">
        <a className="brand" href="#/" onClick={(e) => { e.preventDefault(); navGo("home"); }}>
          <LogoMark size={34} />
          YidVibe
        </a>

        <div className="nav-links">
          {links.map((l) => (
            <a key={l.k} className={"nav-link" + (route === l.k ? " active" : "")}
              href={"#/" + l.k}
              onClick={(e) => { e.preventDefault(); navGo(l.k); }}>
              {l.label}
            </a>
          ))}
        </div>

        <div className="nav-right">
          {/* Notification bell */}
          <div className="nav-popover-wrap" ref={bellRef}>
            <button className={"icon-btn nav-bell" + (bellOpen ? " active" : "")}
              aria-label="Notifications" aria-expanded={bellOpen}
              onClick={() => { setBellOpen((v) => !v); setUserOpen(false); }}>
              <Ic.bell />
            </button>
            {bellOpen && (
              <div className="nav-dropdown notif-panel" role="dialog" aria-label="Notifications">
                <div className="notif-header"><strong>Notifications</strong></div>
                <div className="notif-empty">
                  <Ic.bell width="22" height="22" style={{ opacity: .3, margin: "0 auto", display: "block" }} />
                  <p>Nothing new yet — we'll let you know when someone engages with your work.</p>
                </div>
              </div>
            )}
          </div>

          <a className="btn btn-primary btn-sm nav-submit"
            href="#/submit"
            onClick={(e) => { e.preventDefault(); navGo("submit"); }}>Submit</a>

          {/* User avatar menu */}
          <div className="nav-popover-wrap" ref={userRef}>
            <span className="avatar nav-avatar" role="button" tabIndex={0}
              aria-label="Your account" aria-expanded={userOpen}
              onClick={() => { setUserOpen((v) => !v); setBellOpen(false); }}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setUserOpen((v) => !v); } }}>
              YV
            </span>
            {userOpen && (
              <div className="nav-dropdown user-menu-panel" role="menu">
                <button role="menuitem" onClick={() => navGo("builders")}>Browse builders</button>
                <button role="menuitem" onClick={() => navGo("directory")}>Builder directory</button>
                <button role="menuitem" onClick={() => navGo("submit")}>Submit a project</button>
                <div className="menu-item-divider" />
                <button role="menuitem" className="menu-muted" onClick={() => setUserOpen(false)}>
                  Sign in — coming soon
                </button>
              </div>
            )}
          </div>

          <button className="icon-btn nav-menu-btn" aria-label="Menu" aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}>
            {menuOpen ? <Ic.x /> : <Ic.menu />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          <div className="container">
            <a className="mobile-menu-link mobile-menu-submit" href="#/submit"
              onClick={(e) => { e.preventDefault(); navGo("submit"); }}>
              + Submit a project
            </a>
            {links.map((l) => (
              <a key={l.k} className={"mobile-menu-link" + (route === l.k ? " active" : "")}
                href={"#/" + l.k}
                onClick={(e) => { e.preventDefault(); navGo(l.k); }}>
                {l.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

/* ============================================================
   Footer
   ============================================================ */
function Footer({ go }) {
  const links = [
    ["Showcase", "showcase"], ["Builders", "builders"], ["Directory", "directory"],
    ["Gigs", "gigs"], ["Competitions", "competitions"], ["Events", "events"],
    ["How it works", "how"],
  ];
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <LogoMark size={26} />
          <strong>YidVibe</strong>
          <span>— the home for our community's builders</span>
        </div>
        <div className="footer-links">
          {links.map(([l, k]) => (
            <a key={k} href={"#/" + k} onClick={(e) => { e.preventDefault(); go(k); }}>{l}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

/* ============================================================
   useReveal — reveal-on-scroll with polling fallback
   ============================================================ */
function useReveal() {
  useEffect(() => {
    let stopped = false;
    const reveal = () => {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      document.querySelectorAll(".reveal:not(.in)").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < vh * 0.92 && r.bottom > 0) el.classList.add("in");
      });
    };
    const onScroll = () => requestAnimationFrame(reveal);
    reveal();
    const iv = setInterval(() => { if (!stopped) reveal(); }, 200);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      stopped = true;
      clearInterval(iv);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
}

Object.assign(window, {
  Ic, Sparkle, LogoMark, LogoBadge, Avatar, AnimatedCover,
  Upvote, ProjectCard, Nav, Footer, useReveal,
});
