/* global React, Ic, Sparkle, useReveal */
const { useState: useStateSub, useEffect: useEffectSub, useRef: useRefSub } = React;

function Chip({ label, active, onClick }) {
  return (
    <button type="button" className={"select-chip" + (active ? " on" : "")} onClick={onClick}>
      {active && <Ic.check />}
      {label}
    </button>
  );
}

function Submit({ go }) {
  useReveal();

  // form fields
  const [link,         setLink]         = useStateSub("");
  const [name,         setName]         = useStateSub("");
  const [desc,         setDesc]         = useStateSub("");
  const [videoUrl,     setVideoUrl]     = useStateSub("");
  const [coverPreview, setCoverPreview] = useStateSub("");
  const [coverUrlInput,setCoverUrlInput]= useStateSub("");
  const [shotPreviews, setShotPreviews] = useStateSub([]);
  const [tools,        setTools]        = useStateSub(["Claude"]);
  const [tags,         setTags]         = useStateSub([]);
  const [customTool,   setCustomTool]   = useStateSub("");
  const [customTag,    setCustomTag]    = useStateSub("");
  const [toolOpts,     setToolOpts]     = useStateSub(window.YV_ALL_TOOLS);
  const [tagOpts,      setTagOpts]      = useStateSub(window.YV_ALL_TAGS);
  const [looking,      setLooking]      = useStateSub({});
  const [anon,         setAnon]         = useStateSub(false);

  // autofill state
  const [autofilling, setAutofilling] = useStateSub(false);
  const [autofillMsg, setAutofillMsg] = useStateSub("");

  // drag state
  const [dragOver,    setDragOver]    = useStateSub(false);
  const [shotDragOver,setShotDragOver]= useStateSub(false);

  // submission state
  const [submitted, setSubmitted] = useStateSub(false);
  const [submittedName, setSubmittedName] = useStateSub("");

  const coverInputRef = useRefSub(null);
  const shotInputRef  = useRefSub(null);

  // ── helpers ──────────────────────────────────────────────
  const toggle = (arr, set, v) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const addCustom = (val, opts, setOpts, sel, setSel, clear) => {
    const v = val.trim();
    if (!v) return;
    if (!opts.includes(v)) setOpts([...opts, v]);
    if (!sel.includes(v)) setSel([...sel, v]);
    clear("");
  };

  const readFileAsDataURL = (file, onDone) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => onDone(e.target.result);
    reader.readAsDataURL(file);
  };

  const applyCoverFile = (file) => {
    readFileAsDataURL(file, (src) => { setCoverPreview(src); setCoverUrlInput(""); });
  };

  const addShotFile = (file) => {
    readFileAsDataURL(file, (src) => {
      setShotPreviews((prev) => prev.length < 5 ? [...prev, src] : prev);
    });
  };

  const removeShot = (idx) => setShotPreviews((prev) => prev.filter((_, i) => i !== idx));

  const applyCoverUrl = () => {
    const u = coverUrlInput.trim();
    if (u) setCoverPreview(u);
  };

  // ── Paste anywhere on the page ────────────────────────────
  useEffectSub(() => {
    const onPaste = (e) => {
      const items = Array.from(e.clipboardData?.items || []);
      const imgItem = items.find((it) => it.type.startsWith("image/"));
      if (!imgItem) return;
      const file = imgItem.getAsFile();
      setCoverPreview((existing) => {
        if (!existing) {
          readFileAsDataURL(file, (src) => setCoverPreview(src));
          return existing;
        }
        addShotFile(file);
        return existing;
      });
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, []);

  // ── Autofill via CORS proxy ───────────────────────────────
  const doAutofill = async () => {
    const url = link.trim();
    if (!url) return;
    setAutofilling(true);
    setAutofillMsg("");
    try {
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 9000);
      const res = await fetch("https://corsproxy.io/?" + encodeURIComponent(url), { signal: ctrl.signal });
      clearTimeout(tid);
      if (!res.ok) throw new Error("bad response");
      const html = await res.text();
      const doc  = new DOMParser().parseFromString(html, "text/html");
      const meta = (prop) =>
        doc.querySelector(`meta[property="${prop}"]`)?.content ||
        doc.querySelector(`meta[name="${prop}"]`)?.content || "";

      const fetchedTitle = (meta("og:title") || doc.title || "").replace(/\s+/g, " ").trim().slice(0, 80);
      const fetchedDesc  = (meta("og:description") || meta("description") || "").replace(/\s+/g, " ").trim().slice(0, 500);
      const fetchedImg   = meta("og:image") || "";

      if (fetchedTitle) setName(fetchedTitle);
      if (fetchedDesc)  setDesc(fetchedDesc);
      if (fetchedImg)   { setCoverPreview(fetchedImg); setCoverUrlInput(fetchedImg); }

      setAutofillMsg(fetchedTitle || fetchedDesc
        ? "✓ Filled in from the page"
        : "Page loaded but no metadata found — fill in manually.");
    } catch (e) {
      setAutofillMsg(e.name === "AbortError"
        ? "Timed out — the site may be slow or unreachable."
        : "Couldn't reach that URL. Fill in the details manually.");
    }
    setAutofilling(false);
  };

  const lookOpts = [
    { k: "funding",  label: "Funding / investors",    icon: <Ic.coins     width="20" height="20" />, tint: "tint-gold"   },
    { k: "buyer",    label: "A buyer (for sale)",      icon: <Ic.briefcase width="20" height="20" />, tint: "tint-orange" },
    { k: "partners", label: "Partners / co-founders", icon: <Ic.users     width="20" height="20" />, tint: "tint-blue"   },
  ];

  // ── Submit ────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !desc.trim()) return;

    const newProject = {
      id:       "user_" + Date.now(),
      name:     name.trim(),
      initial:  name.trim()[0].toUpperCase(),
      desc:     desc.trim(),
      tools:    tools,
      tags:     tags,
      by:       anon ? "Anonymous" : "You",
      anon:     anon,
      votes:    0,
      hue:      Math.floor(Math.random() * 80) + 150,
      live:     !!link.trim(),
      url:      link.trim() || null,
      videoUrl: videoUrl.trim() || null,
      cover:    coverPreview || null,
      featured: false,
      looking:  looking,
    };

    // Persist to localStorage so it survives refreshes
    try {
      const saved = JSON.parse(localStorage.getItem("yv_submitted_projects") || "[]");
      saved.unshift(newProject);
      localStorage.setItem("yv_submitted_projects", JSON.stringify(saved));
    } catch {}

    // Add to in-memory list immediately
    window.YV_PROJECTS = [newProject, ...window.YV_PROJECTS];

    setSubmittedName(name.trim());
    setSubmitted(true);
  };

  // ── Success state ─────────────────────────────────────────
  if (submitted) {
    return (
      <main className="submit-page">
        <div className="container submit-wrap">
          <div className="submit-card reveal in" style={{ textAlign: "center", padding: "60px 36px" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--teal-50)", display: "grid", placeItems: "center", margin: "0 auto 22px" }}>
              <Sparkle size={32} color="var(--teal-600)" />
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: "var(--ink)", marginBottom: 10 }}>
              "{submittedName}" is live on the Showcase!
            </h2>
            <p style={{ color: "var(--muted)", fontSize: 16, marginBottom: 32, maxWidth: "44ch", marginInline: "auto" }}>
              Your project has been added to the community showcase. Anyone can find, upvote, and comment on it.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button className="btn btn-primary btn-lg" onClick={() => go("showcase")}>View on Showcase <Ic.arrow /></button>
              <button className="btn btn-ghost btn-lg" onClick={() => {
                setSubmitted(false); setName(""); setDesc(""); setLink(""); setVideoUrl("");
                setCoverPreview(""); setShotPreviews([]); setTools(["Claude"]); setTags([]);
                setLooking({}); setAnon(false);
              }}>Submit another</button>
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
          <span className="eyebrow">Share your work</span>
          <h1>Submit a project</h1>
          <p>Show the community what you built — it appears on the Showcase automatically.</p>
        </div>

        <form className="submit-card reveal" onSubmit={handleSubmit}>

          {/* ── Project link + Autofill ── */}
          <div className="link-box">
            <div className="field-label">
              <label>Project link</label>
              <span className="hint">paste a URL and hit Autofill — we'll do the rest</span>
            </div>
            <div className="link-row">
              <div className="text-input grow">
                <Ic.globe style={{ color: "var(--muted)", flexShrink: 0 }} />
                <input
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://your-app.com"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); doAutofill(); } }}
                />
              </div>
              <button type="button" className="btn btn-gold" onClick={doAutofill}
                disabled={!link.trim() || autofilling}
                style={{ opacity: (!link.trim() || autofilling) ? .7 : 1 }}>
                {autofilling ? <><span className="af-spinner"></span> Filling…</> : <><Ic.wand /> Autofill</>}
              </button>
            </div>
            {autofillMsg && (
              <p className={"autofill-msg" + (autofillMsg.startsWith("✓") ? " ok" : " err")}>{autofillMsg}</p>
            )}
          </div>

          {/* ── Cover image ── */}
          <section className="field">
            <div className="field-label">
              <label>Cover image</label>
              <span className="hint">upload, drag &amp; drop, or paste with Ctrl+V</span>
            </div>
            <div className="cover-row">
              <div
                className={"cover-drop" + (dragOver ? " drag-over" : "")}
                onClick={() => coverInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); applyCoverFile(e.dataTransfer.files[0]); }}
                style={{ cursor: "pointer" }}>
                {coverPreview
                  ? <img src={coverPreview} alt="Cover preview" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit", display: "block" }} />
                  : <>
                      <Ic.imagePlus width="26" height="26" style={{ color: "var(--muted)" }} />
                      <span style={{ textAlign: "center", lineHeight: 1.4 }}>
                        Drop or click<br />
                        <span style={{ fontSize: 11, opacity: .7 }}>or paste Ctrl+V</span>
                      </span>
                    </>}
              </div>
              <div className="cover-actions">
                <button type="button" className="btn btn-ghost" onClick={() => coverInputRef.current?.click()}>
                  <Ic.upload /> Upload image
                </button>
                {coverPreview && (
                  <button type="button" className="btn btn-ghost"
                    style={{ color: "var(--clay-mid)", borderColor: "var(--clay-bg)" }}
                    onClick={() => { setCoverPreview(""); setCoverUrlInput(""); }}>
                    <Ic.x /> Remove cover
                  </button>
                )}
                <div className="text-input">
                  <input
                    value={coverUrlInput}
                    onChange={(e) => setCoverUrlInput(e.target.value)}
                    placeholder="…or paste an image URL"
                    onBlur={applyCoverUrl}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyCoverUrl(); } }}
                  />
                </div>
              </div>
            </div>

            <input ref={coverInputRef} type="file" accept="image/*" style={{ display: "none" }}
              onChange={(e) => { applyCoverFile(e.target.files[0]); e.target.value = ""; }} />
            <input ref={shotInputRef}  type="file" accept="image/*" style={{ display: "none" }}
              onChange={(e) => { addShotFile(e.target.files[0]); e.target.value = ""; }} />

            <div className="field-label" style={{ marginTop: 22 }}>
              <label>More screenshots</label>
              <span className="hint">optional · up to 5 · paste or drag to add</span>
            </div>
            <div
              className={"shots-row" + (shotDragOver ? " drag-over-shots" : "")}
              onDragOver={(e) => { e.preventDefault(); setShotDragOver(true); }}
              onDragLeave={() => setShotDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setShotDragOver(false); Array.from(e.dataTransfer.files).forEach(addShotFile); }}>
              {shotPreviews.map((src, i) => (
                <div key={i} className="shot-thumb" style={{ position: "relative", overflow: "hidden" }}>
                  <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  <button type="button" aria-label="Remove screenshot"
                    style={{ position: "absolute", top: 3, right: 3, width: 20, height: 20, borderRadius: "50%", border: 0, background: "rgba(0,0,0,.55)", color: "#fff", display: "grid", placeItems: "center", cursor: "pointer", padding: 0 }}
                    onClick={() => removeShot(i)}>
                    <Ic.x />
                  </button>
                </div>
              ))}
              {shotPreviews.length < 5 && (
                <button type="button" className="shot-add" onClick={() => shotInputRef.current?.click()}>
                  <Ic.imagePlus /><span>Add</span>
                </button>
              )}
            </div>
            <p className="shots-count">{shotPreviews.length}/5 screenshots</p>
            <div className="info-banner">
              <Sparkle size={15} color="var(--teal-600)" />
              <span>Add a <strong>cover image</strong> or a <strong>live link</strong> (or both) so people can actually see your project.</span>
            </div>
          </section>

          {/* ── Name ── */}
          <section className="field">
            <div className="field-label"><label>Name <i>*</i></label></div>
            <div className="text-input lg">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="What's it called?" required />
            </div>
          </section>

          {/* ── Description ── */}
          <section className="field">
            <div className="field-label"><label>Description <i>*</i></label></div>
            <textarea className="text-area" value={desc} onChange={(e) => setDesc(e.target.value)}
              placeholder="What does it do? Who's it for?" rows={4} required></textarea>
          </section>

          {/* ── Video / demo ── */}
          <section className="field">
            <div className="field-label"><label>Video / demo URL</label></div>
            <div className="text-input lg">
              <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://loom.com/…" />
            </div>
          </section>

          {/* ── Tools ── */}
          <section className="field">
            <div className="field-label"><label>Tools used</label><span className="hint">how it was built</span></div>
            <div className="chip-set">
              {toolOpts.map((tl) => <Chip key={tl} label={tl} active={tools.includes(tl)} onClick={() => toggle(tools, setTools, tl)} />)}
            </div>
            <div className="add-row">
              <div className="text-input">
                <input value={customTool} onChange={(e) => setCustomTool(e.target.value)} placeholder="Add another tool"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustom(customTool, toolOpts, setToolOpts, tools, setTools, setCustomTool); } }} />
              </div>
              <button type="button" className="btn btn-ghost"
                onClick={() => addCustom(customTool, toolOpts, setToolOpts, tools, setTools, setCustomTool)}>
                <Ic.plus width="15" height="15" /> Add
              </button>
            </div>
          </section>

          {/* ── Tags ── */}
          <section className="field">
            <div className="field-label"><label>Tags</label><span className="hint">what it's about</span></div>
            <div className="chip-set">
              {tagOpts.map((tg) => <Chip key={tg} label={tg} active={tags.includes(tg)} onClick={() => toggle(tags, setTags, tg)} />)}
            </div>
            <div className="add-row">
              <div className="text-input">
                <input value={customTag} onChange={(e) => setCustomTag(e.target.value)} placeholder="Add another tag"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustom(customTag, tagOpts, setTagOpts, tags, setTags, setCustomTag); } }} />
              </div>
              <button type="button" className="btn btn-ghost"
                onClick={() => addCustom(customTag, tagOpts, setTagOpts, tags, setTags, setCustomTag)}>
                <Ic.plus width="15" height="15" /> Add
              </button>
            </div>
          </section>

          {/* ── Looking for ── */}
          <section className="field">
            <div className="field-label">
              <label>Looking for…</label>
              <span className="hint">optional · shows badges on your project</span>
            </div>
            <div className="look-grid">
              {lookOpts.map((o) => (
                <button type="button" key={o.k}
                  className={"look-card " + o.tint + (looking[o.k] ? " on" : "")}
                  onClick={() => setLooking({ ...looking, [o.k]: !looking[o.k] })}>
                  <span className="look-check">{looking[o.k] && <Ic.check />}</span>
                  <span className="look-icon">{o.icon}</span>
                  <span className="look-label">{o.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* ── Anonymous ── */}
          <div className="anon-row">
            <div>
              <strong>Post anonymously</strong>
              <p>Hide your name publicly — shown as "Anonymous." Only you and admins know it's yours.</p>
            </div>
            <button type="button" className={"toggle" + (anon ? " on" : "")} onClick={() => setAnon(!anon)} aria-label="Post anonymously">
              <span className="knob"></span>
            </button>
          </div>

          <button type="submit" className="btn btn-primary submit-btn"
            disabled={!name.trim() || !desc.trim()}
            style={{ opacity: (!name.trim() || !desc.trim()) ? .6 : 1 }}>
            Submit project
          </button>
        </form>
      </div>
    </main>
  );
}

window.Submit = Submit;
