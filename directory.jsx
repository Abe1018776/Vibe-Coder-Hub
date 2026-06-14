/* global React, Ic, Avatar, Sparkle, useReveal */
const { useState: useStateDir, useMemo: useMemoDir } = React;

function DirCard({ b, go }) {
  const count = b.owns ? b.owns.length : 0;
  return (
    <button type="button" className="builder-card"
      style={{ borderTop: `3px solid hsl(${b.hue} 38% 72%)` }}
      onClick={() => go("builder:" + b.id)}>
      <div className="bc-top">
        <Avatar name={b.name} hue={b.hue} size={50} />
        <div className="bc-id">
          <span className="bc-name">{b.name}{b.verified && <Sparkle size={13} color="var(--gold-500)" style={{ marginLeft: 5, verticalAlign: "middle" }} />}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 2 }}>
            <span className="bc-handle">@{b.handle}</span>
            {b.available && <span className="avail-badge" style={{ marginLeft: 0, fontSize: 11 }}><span className="dot"></span> Open to work</span>}
          </div>
        </div>
      </div>
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

function Directory({ go }) {
  useReveal();
  const all = window.YV_BUILDERS;
  const [q, setQ] = useStateDir("");
  const [tool, setTool] = useStateDir("");
  const [skill, setSkill] = useStateDir("");
  const [avail, setAvail] = useStateDir(false);

  const results = useMemoDir(() => all.filter((b) => {
    const hay = (b.name + " " + b.handle + " " + (b.bio || "") + " " + (b.skills || []).join(" ") + " " + (b.tools || []).join(" ")).toLowerCase();
    if (q && !hay.includes(q.toLowerCase())) return false;
    if (tool && !(b.tools || []).includes(tool)) return false;
    if (skill && !(b.skills || []).includes(skill)) return false;
    if (avail && !b.available) return false;
    return true;
  }), [q, tool, skill, avail]);

  return (
    <main>
      <section className="page-head">
        <div className="container">
          <div className="reveal">
            <span className="eyebrow">Find your builder</span>
            <h1>Directory</h1>
            <p>Find builders by skill, tool, or vibe. Every one ships fast.</p>
          </div>

          <div className="filterbar reveal">
            <label className="filter-search">
              <Ic.search style={{ color: "var(--muted)", flexShrink: 0 }} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search builders…" />
              {q && (
                <button style={{ border: 0, background: "transparent", color: "var(--muted)", cursor: "pointer", display: "grid", placeItems: "center" }}
                  onClick={() => setQ("")} aria-label="Clear search"><Ic.x /></button>
              )}
            </label>
            <div className="select">
              <select value={tool} onChange={(e) => setTool(e.target.value)}>
                <option value="">All tools</option>
                {window.YV_ALL_TOOLS.map((x) => <option key={x} value={x}>{x}</option>)}
              </select>
              <span className="chev"><Ic.chevDown /></span>
            </div>
            <div className="select">
              <select value={skill} onChange={(e) => setSkill(e.target.value)}>
                <option value="">All skills</option>
                {window.YV_SKILLS.map((x) => <option key={x} value={x}>{x}</option>)}
              </select>
              <span className="chev"><Ic.chevDown /></span>
            </div>
            <button type="button" className={"check-row pill" + (avail ? " on" : "")} onClick={() => setAvail(!avail)}>
              <span className="cb">{avail && <Ic.check />}</span> Available
            </button>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="result-meta">
            <div className="active-filters">
              {(q || tool || skill || avail) ? (
                <>
                  {q    && <span className="fchip">"{q}"  <button onClick={() => setQ("")}><Ic.x /></button></span>}
                  {tool && <span className="fchip">{tool}  <button onClick={() => setTool("")}><Ic.x /></button></span>}
                  {skill && <span className="fchip">{skill} <button onClick={() => setSkill("")}><Ic.x /></button></span>}
                  {avail && <span className="fchip">Available <button onClick={() => setAvail(false)}><Ic.x /></button></span>}
                  <button className="link-arrow" style={{ fontSize: 13, color: "var(--muted)" }} onClick={() => { setQ(""); setTool(""); setSkill(""); setAvail(false); }}>Clear all</button>
                </>
              ) : (
                <span className="count"><strong>{results.length}</strong> {results.length === 1 ? "builder" : "builders"}</span>
              )}
            </div>
            {(q || tool || skill || avail) && <span className="count"><strong>{results.length}</strong> {results.length === 1 ? "match" : "matches"}</span>}
          </div>
          {results.length === 0 ? (
            <div className="empty"><Sparkle size={26} color="var(--teal-400)" /><h3 style={{ marginTop: 14 }}>No builders match</h3><p>Try a different skill or clear the filters.</p></div>
          ) : (
            <div className="builders-grid">
              {results.map((b, i) => (
                <div key={b.id} className="reveal" style={{ transitionDelay: (i % 3 * 70) + "ms" }}><DirCard b={b} go={go} /></div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

window.Directory = Directory;
