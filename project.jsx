/* global React, Ic, Avatar, Sparkle, AnimatedCover, Upvote, useReveal */
const { useState: useStatePr, useEffect: useEffectPr, useRef: useRefPr, useCallback: useCallbackPr } = React;

function ProjectDetail({ id, go, t }) {
  useReveal();
  const p = window.YV_PROJECTS.find((x) => x.id === id) || window.YV_PROJECTS[0];
  const builder = !p.anon ? window.YV_BUILDERS.find((b) => b.owns && b.owns.includes(p.id)) || window.YV_BUILDERS.find((b) => b.name === p.by) : null;

  const [anon, setAnon]       = useStatePr(false);
  const [comment, setComment] = useStatePr("");

  // Comments persist to localStorage per project
  const [comments, setComments] = useStatePr(() => {
    try { return JSON.parse(localStorage.getItem("yv_comments_" + id) || "[]"); } catch { return []; }
  });

  const saveComments = useCallbackPr((next) => {
    setComments(next);
    try { localStorage.setItem("yv_comments_" + id, JSON.stringify(next)); } catch {}
  }, [id]);

  const submitComment = () => {
    if (!comment.trim()) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    saveComments([...comments, { text: comment.trim(), anon, time: timeStr }]);
    setComment("");
    setAnon(false);
  };

  // "Share" — copies shareable URL to clipboard
  const [copied, setCopied] = useStatePr(false);
  const shareProject = (e) => {
    e.preventDefault();
    const url = window.location.href.split("#")[0] + "#/project/" + p.id;
    const copy = (text) => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).catch(() => fallback(text));
      } else { fallback(text); }
    };
    const fallback = (text) => {
      const el = document.createElement("input");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      try { document.execCommand("copy"); } catch {}
      document.body.removeChild(el);
    };
    copy(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  // "More" dots menu
  const [dotsOpen, setDotsOpen] = useStatePr(false);
  const dotsRef = useRefPr(null);
  useEffectPr(() => {
    if (!dotsOpen) return;
    const close = (e) => { if (dotsRef.current && !dotsRef.current.contains(e.target)) setDotsOpen(false); };
    window.addEventListener("mousedown", close);
    return () => window.removeEventListener("mousedown", close);
  }, [dotsOpen]);

  const reportProject = () => {
    setDotsOpen(false);
    alert("Report received — our team will review this project.");
  };

  return (
    <main>
      <section className="page-head">
        <div className="container" style={{ maxWidth: 920 }}>
          <button className="back-link reveal" onClick={() => go("showcase")}>
            <Ic.arrow width="15" height="15" style={{ transform: "rotate(180deg)" }} /> Back to Showcase
          </button>

          <div className="pd-cover reveal">
            {p.cover
              ? <img src={p.cover} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <AnimatedCover initial={p.initial} hue={p.hue} style={t.coverStyle} />}
            {p.featured && <span className="pc-flag"><Ic.spark width="13" height="13" /> Featured</span>}
            {!p.featured && p.live && <span className="pc-flag live"><span className="lf-dot"></span> Live</span>}
          </div>

          <div className="pd-head reveal">
            <div>
              <h1>{p.name}</h1>
              <div className="pd-toolbar">
                {p.tools.map((tl) => <span key={tl} className="chip mono">{tl}</span>)}
                {p.tags.map((tg) => <span key={tg} className="chip blue">{tg}</span>)}
              </div>
            </div>
            <div className="pd-actions">
              <Upvote count={p.votes} id={p.id} />
              <div ref={dotsRef} style={{ position: "relative" }}>
                <button className="icon-btn" aria-label="More options" onClick={() => setDotsOpen((v) => !v)}>
                  <Ic.dots />
                </button>
                {dotsOpen && (
                  <div className="dots-panel">
                    <button onClick={() => { shareProject({ preventDefault: () => {} }); setDotsOpen(false); }}>
                      <Ic.link width="14" height="14" /> Copy link
                    </button>
                    <button className="danger" onClick={reportProject}>
                      <Ic.flag width="14" height="14" /> Report project
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <p className="pd-desc reveal">{p.desc}</p>

          <div className="pd-row reveal">
            {p.live && (
              p.url
                ? <a className="btn btn-primary" href={p.url} target="_blank" rel="noopener noreferrer">
                    <Ic.globe width="16" height="16" /> Visit project
                  </a>
                : <button className="btn btn-primary" onClick={() => alert("The builder hasn't linked a live URL yet — contact them directly.")}>
                    <Ic.globe width="16" height="16" /> Visit project
                  </button>
            )}
            <button className="btn btn-ghost" onClick={shareProject}>
              {copied ? "✓ Link copied!" : "Share"}
            </button>
          </div>

          <div className="built-by reveal">
            <span className="bb-label">Built by</span>
            <div className="bb-row">
              <div className="bb-person">
                {builder
                  ? <Avatar name={builder.name} hue={builder.hue} size={44} />
                  : <span className="yv-avatar anon" style={{ width: 44, height: 44, fontSize: 16 }}>?</span>}
                <div>
                  <strong>{p.by}</strong>
                  {builder && <span className="bb-handle">@{builder.handle}</span>}
                </div>
              </div>
              {builder && (
                <button className="btn btn-ghost btn-sm" onClick={() => go("builder:" + builder.id)}>View profile</button>
              )}
            </div>
          </div>

          {/* Comments */}
          <div className="comments reveal">
            <h2 className="sub-h2" style={{ marginBottom: 18 }}>Comments</h2>
            <div className="comment-box">
              <textarea className="text-area" placeholder="Add a comment…" rows={3}
                value={comment} onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && e.metaKey) submitComment(); }}></textarea>
              <div className="comment-actions">
                <button type="button" className={"check-row" + (anon ? " on" : "")} onClick={() => setAnon(!anon)}>
                  <span className="cb">{anon && <Ic.check />}</span> Post anonymously
                </button>
                <button className="btn btn-primary btn-sm" onClick={submitComment}
                  disabled={!comment.trim()} style={{ opacity: !comment.trim() ? .6 : 1 }}>
                  Comment
                </button>
              </div>
            </div>
            {comments.map((c, i) => (
              <div key={i} className="comment-item" style={{ marginTop: 14, padding: "12px 16px", background: "var(--canvas)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ width: 26, height: 26, borderRadius: "50%", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700, background: c.anon ? "var(--orange-bg)" : "var(--teal-50)", color: c.anon ? "var(--orange-deep)" : "var(--teal-700)" }}>
                    {c.anon ? "?" : "YV"}
                  </span>
                  <strong style={{ fontSize: 13.5, color: "var(--ink)" }}>{c.anon ? "Anonymous" : "You"}</strong>
                  <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: "auto" }}>{c.time || "just now"}</span>
                </div>
                <p style={{ fontSize: 14.5, color: "var(--ink)", lineHeight: 1.55, margin: 0 }}>{c.text}</p>
              </div>
            ))}
            {comments.length === 0 && <p className="no-comments">No comments yet — be the first.</p>}
          </div>
        </div>
      </section>
    </main>
  );
}

window.ProjectDetail = ProjectDetail;
