/* global React, Ic, Avatar, Sparkle, useReveal */
const { useState: useStateComp } = React;

function cbyId(id) { return window.YV_BUILDERS.find((b) => b.id === id); }

function CompCard({ c, go }) {
  const host = cbyId(c.by);
  return (
    <button type="button" className={"comp-card" + (c.status === "judging" ? " judging" : "")} onClick={() => go("competition:" + c.id)}>
      <div className="comp-top">
        <span className="prize-badge"><Ic.trophy width="16" height="16" /> {c.prize}</span>
        <span className={"comp-status " + c.status}>{c.status === "judging" ? "Judging" : c.deadline}</span>
      </div>
      <h3 className="comp-title">{c.title}</h3>
      <p className="gig-desc">{c.desc}</p>
      <div className="comp-foot">
        <span className="pc-by">{host && <Avatar name={host.name} hue={host.hue} size={26} />} by <strong>{host ? host.name : "Someone"}</strong></span>
        <span className="comp-entries">{c.entries} entries</span>
      </div>
    </button>
  );
}

function Competitions({ go }) {
  useReveal();
  const comps = window.YV_COMPETITIONS;
  return (
    <main>
      <section className="page-head">
        <div className="container">
          <div className="page-head-row reveal">
            <div>
              <span className="eyebrow" style={{ color: "var(--gold-700)" }}>Build &amp; win</span>
              <h1>Competitions</h1>
              <p>Post a bounty. Anyone submits. You pick the winner.</p>
            </div>
            <button className="btn btn-gold" onClick={() => go("postcompetition")}><Ic.plus /> Post a competition</button>
          </div>
        </div>
      </section>
      <section style={{ paddingTop: 8 }}>
        <div className="container">
          <div className="result-meta"><span className="count"><strong>{comps.filter((c) => c.status === "open").length}</strong> open</span></div>
          <div className="gig-grid">
            {comps.map((c, i) => (
              <div key={c.id} className="reveal" style={{ transitionDelay: (i % 2 * 70) + "ms" }}><CompCard c={c} go={go} /></div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function CompetitionDetail({ id, go }) {
  useReveal();
  const c = window.YV_COMPETITIONS.find((x) => x.id === id) || window.YV_COMPETITIONS[0];
  const host = cbyId(c.by);
  return (
    <main>
      <section className="page-head">
        <div className="container" style={{ maxWidth: 820 }}>
          <button className="back-link reveal" onClick={() => go("competitions")}><Ic.arrow width="15" height="15" style={{ transform: "rotate(180deg)" }} /> Back to Competitions</button>
          <div className="detail-card reveal">
            <div className="comp-top">
              <span className="prize-badge lg"><Ic.trophy width="18" height="18" /> {c.prize}</span>
              <span className={"comp-status " + c.status}>{c.status === "judging" ? "Judging" : c.deadline}</span>
            </div>
            <h1 style={{ marginTop: 14 }}>{c.title}</h1>
            <div className="bc-skills" style={{ marginTop: 12 }}><span className="chip blue">{c.tag}</span><span className="chip">{c.entries} entries</span></div>
            <p className="pd-desc" style={{ marginTop: 18 }}>{c.desc}</p>
            <div className="built-by" style={{ marginTop: 6 }}>
              <span className="bb-label">Hosted by</span>
              <div className="bb-row">
                <div className="bb-person">{host && <Avatar name={host.name} hue={host.hue} size={44} />}<div><strong>{host ? host.name : "Someone"}</strong>{host && <span className="bb-handle">@{host.handle}</span>}</div></div>
                {host && <button className="btn btn-ghost btn-sm" onClick={() => go("builder:" + host.id)}>View profile</button>}
              </div>
            </div>
          </div>
          <div className="apply-card reveal" style={{ textAlign: "center" }}>
            <Sparkle size={28} color="var(--gold-500)" />
            <h2 className="sub-h2" style={{ margin: "12px 0 6px" }}>{c.status === "judging" ? "Submissions closed" : "Enter this competition"}</h2>
            <p style={{ color: "var(--muted)", marginBottom: 18 }}>{c.status === "judging" ? "Winners announced soon — watch this space." : "Submit a project before the deadline to compete for the prize."}</p>
            {c.status !== "judging" && <button className="btn btn-gold" onClick={() => go("submit")}>Submit an entry</button>}
          </div>
        </div>
      </section>
    </main>
  );
}

function PostCompetition({ go }) {
  useReveal();

  const [title,    setTitle]    = useStateComp("");
  const [desc,     setDesc]     = useStateComp("");
  const [prize,    setPrize]    = useStateComp("");
  const [deadline, setDeadline] = useStateComp("");
  const [tag,      setTag]      = useStateComp("");
  const [submitted, setSubmitted] = useStateComp(false);

  const canSubmit = title.trim() && desc.trim() && prize.trim() && deadline.trim();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    const newComp = {
      id:       "comp_" + Date.now(),
      title:    title.trim(),
      desc:     desc.trim(),
      prize:    prize.trim(),
      deadline: deadline.trim(),
      tag:      tag.trim() || "Open",
      by:       "yidvibe",
      entries:  0,
      status:   "open",
      hue:      45,
    };

    try {
      const saved = JSON.parse(localStorage.getItem("yv_submitted_comps") || "[]");
      saved.unshift(newComp);
      localStorage.setItem("yv_submitted_comps", JSON.stringify(saved));
    } catch {}
    window.YV_COMPETITIONS = [newComp, ...window.YV_COMPETITIONS];
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <main className="submit-page">
        <div className="container submit-wrap">
          <div className="submit-card reveal in" style={{ textAlign: "center", padding: "60px 36px" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--gold-50)", display: "grid", placeItems: "center", margin: "0 auto 22px" }}>
              <Sparkle size={32} color="var(--gold-700)" />
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 10 }}>Competition posted!</h2>
            <p style={{ color: "var(--muted)", fontSize: 16, marginBottom: 32 }}>
              Your challenge is now live. Builders can submit entries before the deadline.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button className="btn btn-gold btn-lg" onClick={() => go("competitions")}>View Competitions <Ic.arrow /></button>
              <button className="btn btn-ghost btn-lg" onClick={() => { setSubmitted(false); setTitle(""); setDesc(""); setPrize(""); setDeadline(""); setTag(""); }}>Post another</button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="submit-page">
      <div className="container submit-wrap">
        <div className="submit-head reveal">
          <span className="eyebrow" style={{ color: "var(--gold-700)" }}>Run a challenge</span>
          <h1>Post a competition</h1>
          <p>Put up a prize and let the community build for it.</p>
        </div>
        <form className="submit-card reveal" onSubmit={handleSubmit}>
          <section className="field">
            <div className="field-label"><label>Title <i>*</i></label></div>
            <div className="text-input lg"><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What's the challenge?" required /></div>
          </section>
          <section className="field">
            <div className="field-label"><label>Description <i>*</i></label></div>
            <textarea className="text-area" rows={4} placeholder="Rules, what counts, how you'll judge…"
              value={desc} onChange={(e) => setDesc(e.target.value)} required></textarea>
          </section>
          <div className="link-row">
            <section className="field" style={{ flex: 1 }}>
              <div className="field-label"><label>Prize <i>*</i></label></div>
              <div className="text-input"><input value={prize} onChange={(e) => setPrize(e.target.value)} placeholder="$1,000 + badge" required /></div>
            </section>
            <section className="field" style={{ flex: 1 }}>
              <div className="field-label"><label>Deadline <i>*</i></label></div>
              <div className="text-input"><input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} required /></div>
            </section>
          </div>
          <section className="field">
            <div className="field-label"><label>Category tag</label><span className="hint">optional — e.g. "Education", "Finance"</span></div>
            <div className="text-input lg"><input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="Education" /></div>
          </section>
          <div className="info-banner" style={{ background: "var(--gold-50)", color: "var(--gold-900)" }}>
            <Sparkle size={15} color="var(--gold-700)" />
            <span>Competitions are posted under your name. Winners get a <strong>badge</strong> and the spotlight on the Showcase.</span>
          </div>
          <button type="submit" className="btn btn-gold submit-btn"
            disabled={!canSubmit} style={{ opacity: canSubmit ? 1 : .6 }}>
            Post competition
          </button>
        </form>
      </div>
    </main>
  );
}

Object.assign(window, { Competitions, CompetitionDetail, PostCompetition });
