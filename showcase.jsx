/* global React, Ic, ProjectCard, useReveal */
const { useState: useStateS, useMemo, useEffect: useEffectS } = React;

function Showcase({ go, t }) {
  const all = window.YV_PROJECTS;

  // Pick up a search query forwarded from the landing-page hero search
  const [q, setQ] = useStateS(() => {
    const pending = window.YV_PENDING_SEARCH || "";
    window.YV_PENDING_SEARCH = "";
    return pending;
  });
  const [tool, setTool] = useStateS("");
  const [tag,  setTag]  = useStateS("");
  const [sort, setSort] = useStateS("top");

  const results = useMemo(() => {
    let r = all.filter((p) => {
      const hay = (p.name + " " + p.desc + " " + p.tools.join(" ") + " " + p.tags.join(" ")).toLowerCase();
      if (q    && !hay.includes(q.toLowerCase()))      return false;
      if (tool && !p.tools.includes(tool))             return false;
      if (tag  && !p.tags.includes(tag))               return false;
      return true;
    });
    if (sort === "top") r = [...r].sort((a, b) => b.votes - a.votes);
    if (sort === "new") r = [...r]; // data is already newest-first after user submissions merge
    return r;
  }, [q, tool, tag, sort, all]);

  const clearAll = () => { setQ(""); setTool(""); setTag(""); };
  const activeCount = (q ? 1 : 0) + (tool ? 1 : 0) + (tag ? 1 : 0);

  return (
    <main>
      <section className="page-head">
        <div className="container">
          <div className="page-head-row reveal">
            <div>
              <h1>Showcase</h1>
              <p>Discover what the community is building.</p>
            </div>
            <button className="btn btn-primary" onClick={() => go("submit")}><Ic.plus /> Submit a project</button>
          </div>

          <div className="filterbar">
            <label className="filter-search">
              <Ic.search style={{ color: "var(--muted)", flexShrink: 0 }} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search projects, tools, tags…" />
              {q && (
                <button style={{ border: 0, background: "transparent", color: "var(--muted)", cursor: "pointer", display: "grid", placeItems: "center" }}
                  onClick={() => setQ("")} aria-label="Clear search"><Ic.x /></button>
              )}
            </label>
            <div className="select">
              <select value={tool} onChange={(e) => setTool(e.target.value)}>
                <option value="">All tools</option>
                {window.YV_TOOLS.map((x) => <option key={x} value={x}>{x}</option>)}
              </select>
              <span className="chev"><Ic.chevDown /></span>
            </div>
            <div className="select">
              <select value={tag} onChange={(e) => setTag(e.target.value)}>
                <option value="">All tags</option>
                {window.YV_TAGS.map((x) => <option key={x} value={x}>{x}</option>)}
              </select>
              <span className="chev"><Ic.chevDown /></span>
            </div>
            <div className="seg">
              <button className={sort === "top" ? "active" : ""} onClick={() => setSort("top")}>Top</button>
              <button className={sort === "new" ? "active" : ""} onClick={() => setSort("new")}>New</button>
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="result-meta">
            <div className="active-filters">
              {activeCount > 0 ? (
                <>
                  {q    && <span className="fchip">"{q}"  <button onClick={() => setQ("")}><Ic.x /></button></span>}
                  {tool && <span className="fchip">{tool}  <button onClick={() => setTool("")}><Ic.x /></button></span>}
                  {tag  && <span className="fchip">{tag}   <button onClick={() => setTag("")}><Ic.x /></button></span>}
                  <button className="link-arrow" style={{ fontSize: 13, color: "var(--muted)" }} onClick={clearAll}>Clear all</button>
                </>
              ) : (
                <span className="count"><strong>{results.length}</strong> projects</span>
              )}
            </div>
            {activeCount > 0 && <span className="count"><strong>{results.length}</strong> {results.length === 1 ? "match" : "matches"}</span>}
          </div>

          {results.length === 0 ? (
            <div className="empty">
              <h3>Nothing here yet</h3>
              <p>Try clearing a filter or searching for something else.</p>
              <button className="btn btn-ghost" style={{ marginTop: 18 }} onClick={clearAll}>Clear filters</button>
            </div>
          ) : (
            <div className="showcase-grid">
              {results.map((p) => <ProjectCard key={p.id} p={p} coverStyle={t.coverStyle} go={go} />)}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

window.Showcase = Showcase;
