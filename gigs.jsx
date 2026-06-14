/* global React, Ic, Avatar, Sparkle, useReveal */
const { useState: useStateGig, useCallback: useCallbackGig } = React;

function byId(id) { return window.YV_BUILDERS.find((b) => b.id === id); }

function GigCard({ g, go }) {
  const host = byId(g.by);
  return (
    <button type="button" className="gig-card" onClick={() => go("gig:" + g.id)}>
      <div className="gig-top">
        <span className="budget-badge">{g.budget}<i>{g.rate === "hourly" ? "/hr" : " · fixed"}</i></span>
        <span className="gig-posted">{g.posted}</span>
      </div>
      <h3 className="gig-title">{g.title}</h3>
      <p className="gig-desc">{g.desc}</p>
      <div className="bc-skills">{g.skills.map((s) => <span key={s} className="chip orange">{s}</span>)}</div>
      <div className="gig-foot">
        <span className="pc-by">{host && <Avatar name={host.name} hue={host.hue} size={26} />} by <strong>{host ? host.name : "Someone"}</strong></span>
        <span className="gig-applicants">{g.applicants} applied</span>
      </div>
    </button>
  );
}

function Gigs({ go }) {
  useReveal();
  const gigs = window.YV_GIGS;
  return (
    <main>
      <section className="page-head">
        <div className="container">
          <div className="page-head-row reveal">
            <div>
              <span className="eyebrow" style={{ color: "var(--orange-deep)" }}>Work &amp; hire</span>
              <h1>Gigs</h1>
              <p>Post a gig, get applicants, manage it all in one place.</p>
            </div>
            <button className="btn btn-orange" onClick={() => go("postgig")}><Ic.plus /> Post a gig</button>
          </div>
        </div>
      </section>
      <section style={{ paddingTop: 8 }}>
        <div className="container">
          <div className="result-meta">
            <span className="count"><strong>{gigs.length}</strong> open gigs</span>
          </div>
          <div className="gig-grid">
            {gigs.map((g, i) => (
              <div key={g.id} className="reveal" style={{ transitionDelay: (i % 2 * 70) + "ms" }}>
                <GigCard g={g} go={go} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function GigDetail({ id, go }) {
  useReveal();
  const g = window.YV_GIGS.find((x) => x.id === id) || window.YV_GIGS[0];
  const host = byId(g.by);

  // Persist application state so navigating away doesn't lose it
  const [msg, setMsg] = useStateGig(() => {
    try { return localStorage.getItem("yv_gig_draft_" + id) || ""; } catch { return ""; }
  });
  const [sent, setSent] = useStateGig(() => {
    try { return !!(localStorage.getItem("yv_gig_applied_" + id)); } catch { return false; }
  });

  const updateMsg = (v) => {
    setMsg(v);
    try { localStorage.setItem("yv_gig_draft_" + id, v); } catch {}
  };

  const sendApplication = () => {
    if (!msg.trim()) return;
    setSent(true);
    try {
      localStorage.setItem("yv_gig_applied_" + id, "1");
      localStorage.removeItem("yv_gig_draft_" + id);
    } catch {}
  };

  return (
    <main>
      <section className="page-head">
        <div className="container" style={{ maxWidth: 820 }}>
          <button className="back-link reveal" onClick={() => go("gigs")}>
            <Ic.arrow width="15" height="15" style={{ transform: "rotate(180deg)" }} /> Back to Gigs
          </button>
          <div className="detail-card reveal">
            <div className="gig-top">
              <span className="budget-badge lg">{g.budget}<i>{g.rate === "hourly" ? "/hr" : " · fixed"}</i></span>
              <span className="gig-posted">Posted {g.posted} · {g.applicants} applied</span>
            </div>
            <h1 style={{ marginTop: 14 }}>{g.title}</h1>
            <div className="bc-skills" style={{ marginTop: 14 }}>
              {g.skills.map((s) => <span key={s} className="chip orange">{s}</span>)}
            </div>
            <p className="pd-desc" style={{ marginTop: 18 }}>{g.desc}</p>
            <div className="built-by" style={{ marginTop: 6 }}>
              <span className="bb-label">Posted by</span>
              <div className="bb-row">
                <div className="bb-person">
                  {host && <Avatar name={host.name} hue={host.hue} size={44} />}
                  <div>
                    <strong>{host ? host.name : "Someone"}</strong>
                    {host && <span className="bb-handle">@{host.handle}</span>}
                  </div>
                </div>
                {host && <button className="btn btn-ghost btn-sm" onClick={() => go("builder:" + host.id)}>View profile</button>}
              </div>
            </div>
          </div>

          <div className="apply-card reveal">
            <h2 className="sub-h2" style={{ marginBottom: 14 }}>Apply privately</h2>
            {sent ? (
              <div style={{ textAlign: "center", padding: "28px 0" }}>
                <Sparkle size={30} color="var(--teal-400)" />
                <h3 style={{ marginTop: 14, color: "var(--teal-700)" }}>Application sent!</h3>
                <p style={{ color: "var(--muted)", marginTop: 6 }}>The poster will review your message and reach out.</p>
              </div>
            ) : (
              <>
                <textarea className="text-area" rows={4}
                  placeholder="Introduce yourself and how you'd approach this…"
                  value={msg} onChange={(e) => updateMsg(e.target.value)}></textarea>
                <button className="btn btn-orange" style={{ marginTop: 14 }}
                  disabled={!msg.trim()} style={{ marginTop: 14, opacity: !msg.trim() ? .6 : 1 }}
                  onClick={sendApplication}>
                  Send application
                </button>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function PostGig({ go }) {
  useReveal();

  const [title,   setTitle]   = useStateGig("");
  const [desc,    setDesc]    = useStateGig("");
  const [budget,  setBudget]  = useStateGig("");
  const [rate,    setRate]    = useStateGig("fixed");
  const [contact, setContact] = useStateGig("");
  const [skills,  setSkills]  = useStateGig([]);
  const [submitted, setSubmitted] = useStateGig(false);

  const toggle = (v) => setSkills(skills.includes(v) ? skills.filter((x) => x !== v) : [...skills, v]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !desc.trim() || !budget.trim()) return;

    const newGig = {
      id:         "gig_" + Date.now(),
      title:      title.trim(),
      desc:       desc.trim(),
      budget:     budget.trim(),
      rate:       rate,
      skills:     skills,
      by:         "yidvibe",
      posted:     "just now",
      applicants: 0,
      contact:    contact.trim(),
      hue:        168,
    };

    try {
      const saved = JSON.parse(localStorage.getItem("yv_submitted_gigs") || "[]");
      saved.unshift(newGig);
      localStorage.setItem("yv_submitted_gigs", JSON.stringify(saved));
    } catch {}
    window.YV_GIGS = [newGig, ...window.YV_GIGS];
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <main className="submit-page">
        <div className="container submit-wrap">
          <div className="submit-card reveal in" style={{ textAlign: "center", padding: "60px 36px" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--orange-bg)", display: "grid", placeItems: "center", margin: "0 auto 22px" }}>
              <Sparkle size={32} color="var(--orange-deep)" />
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 10 }}>Gig posted!</h2>
            <p style={{ color: "var(--muted)", fontSize: 16, marginBottom: 32 }}>
              Your gig is now live. Builders can apply and you'll receive their messages privately.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button className="btn btn-orange btn-lg" onClick={() => go("gigs")}>View Gigs <Ic.arrow /></button>
              <button className="btn btn-ghost btn-lg" onClick={() => { setSubmitted(false); setTitle(""); setDesc(""); setBudget(""); setSkills([]); setContact(""); }}>Post another</button>
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
          <span className="eyebrow" style={{ color: "var(--orange-deep)" }}>Hire a builder</span>
          <h1>Post a gig</h1>
          <p>Describe the work and your budget. Applicants chat with you privately.</p>
        </div>
        <form className="submit-card reveal" onSubmit={handleSubmit}>

          <section className="field">
            <div className="field-label"><label>Title <i>*</i></label></div>
            <div className="text-input lg">
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What needs building?" required />
            </div>
          </section>

          <section className="field">
            <div className="field-label"><label>Description <i>*</i></label></div>
            <textarea className="text-area" rows={4} placeholder="Scope, timeline, what done looks like…"
              value={desc} onChange={(e) => setDesc(e.target.value)} required></textarea>
          </section>

          <section className="field">
            <div className="field-label"><label>Budget <i>*</i></label></div>
            <div className="link-row">
              <div className="text-input grow">
                <input value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="e.g. $1,500 or $40" required />
              </div>
              <div className="seg">
                <button type="button" className={rate === "fixed"  ? "active" : ""} onClick={() => setRate("fixed")}>Fixed</button>
                <button type="button" className={rate === "hourly" ? "active" : ""} onClick={() => setRate("hourly")}>Hourly</button>
              </div>
            </div>
          </section>

          <section className="field">
            <div className="field-label">
              <label>How to reach you <i>*</i></label>
              <span className="hint">email, WhatsApp, or phone — applicants will contact you here</span>
            </div>
            <div className="text-input lg">
              <input value={contact} onChange={(e) => setContact(e.target.value)}
                placeholder="your@email.com or +1 (555) 000-0000" required />
            </div>
          </section>

          <section className="field">
            <div className="field-label"><label>Skills needed</label></div>
            <div className="chip-set">
              {window.YV_SKILLS.map((s) => (
                <button type="button" key={s} className={"select-chip" + (skills.includes(s) ? " on" : "")} onClick={() => toggle(s)}>
                  {skills.includes(s) && <Ic.check />}{s}
                </button>
              ))}
            </div>
          </section>

          <div className="info-banner orange">
            <Sparkle size={15} color="var(--orange-deep)" />
            <span>Gigs are posted under your name. Winners and applicants get a <strong>private message thread</strong> so all business stays off public channels.</span>
          </div>

          <button type="submit" className="btn btn-orange submit-btn"
            disabled={!title.trim() || !desc.trim() || !budget.trim() || !contact.trim()}
            style={{ opacity: (!title.trim() || !desc.trim() || !budget.trim() || !contact.trim()) ? .6 : 1 }}>
            Post gig
          </button>
        </form>
      </div>
    </main>
  );
}

Object.assign(window, { Gigs, GigDetail, PostGig });
