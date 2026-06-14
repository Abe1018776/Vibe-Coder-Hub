/* global React, Ic, Avatar, Sparkle, useReveal */
const { useState: useStateEv } = React;

function ebyId(id) { return window.YV_BUILDERS.find((b) => b.id === id); }

function EventCard({ e }) {
  const host = ebyId(e.host);
  const [going, setGoing] = useStateEv(() => {
    try { return !!(localStorage.getItem("yv_rsvp_" + e.id)); } catch { return false; }
  });

  const toggleGoing = () => {
    const next = !going;
    setGoing(next);
    try {
      if (next) localStorage.setItem("yv_rsvp_" + e.id, "1");
      else localStorage.removeItem("yv_rsvp_" + e.id);
    } catch {}
  };

  return (
    <div className="event-card">
      <div className="event-date" style={{ background: `hsl(${e.hue} 30% 93%)`, color: `hsl(${e.hue} 34% 38%)` }}>
        <span className="ed-month">{e.month}</span>
        <span className="ed-day">{e.day}</span>
      </div>
      <div className="event-body">
        <div className="event-meta">
          <span className="chip blue">{e.type}</span>
          <span className="event-when">{e.time} · {e.place}</span>
        </div>
        <h3 className="event-title">{e.title}</h3>
        <div className="event-foot">
          <span className="pc-by">{host && <Avatar name={host.name} hue={host.hue} size={24} />} {host ? host.name : "Community"} · {e.going + (going ? 1 : 0)} going</span>
          <button className={"btn btn-sm " + (going ? "btn-ghost" : "btn-primary")} onClick={toggleGoing}>{going ? "Going ✓" : "RSVP"}</button>
        </div>
      </div>
    </div>
  );
}

function Events({ go }) {
  useReveal();
  const events = window.YV_EVENTS;
  return (
    <main>
      <section className="page-head">
        <div className="container">
          <div className="page-head-row reveal">
            <div>
              <span className="eyebrow">Meet in person</span>
              <h1>Events</h1>
              <p>Community workshops and meetups for builders.</p>
            </div>
            <button className="btn btn-primary" onClick={() => go("postevent")}><Ic.plus /> Add event</button>
          </div>
        </div>
      </section>
      <section style={{ paddingTop: 8 }}>
        <div className="container" style={{ maxWidth: 820 }}>
          <div className="event-list">
            {events.map((e, i) => (
              <div key={e.id} className="reveal" style={{ transitionDelay: (i * 60) + "ms" }}><EventCard e={e} /></div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function PostEvent({ go }) {
  useReveal();

  const [name,     setName]     = useStateEv("");
  const [type,     setType]     = useStateEv("Meetup");
  const [date,     setDate]     = useStateEv("");
  const [time,     setTime]     = useStateEv("");
  const [place,    setPlace]    = useStateEv("");
  const [details,  setDetails]  = useStateEv("");
  const [submitted, setSubmitted] = useStateEv(false);

  const canSubmit = name.trim() && date && time.trim() && place.trim();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    // Parse date into month/day display strings
    const d = new Date(date + "T12:00:00");
    const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
    const day   = d.getDate();

    const newEvent = {
      id:    "event_" + Date.now(),
      title: name.trim(),
      type:  type,
      month: month,
      day:   day,
      time:  time.trim(),
      place: place.trim(),
      desc:  details.trim(),
      going: 1,
      host:  "yidvibe",
      hue:   200,
    };

    try {
      const saved = JSON.parse(localStorage.getItem("yv_submitted_events") || "[]");
      saved.unshift(newEvent);
      localStorage.setItem("yv_submitted_events", JSON.stringify(saved));
    } catch {}
    window.YV_EVENTS = [newEvent, ...window.YV_EVENTS];
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <main className="submit-page">
        <div className="container submit-wrap">
          <div className="submit-card reveal in" style={{ textAlign: "center", padding: "60px 36px" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--teal-50)", display: "grid", placeItems: "center", margin: "0 auto 22px" }}>
              <Ic.calendar width={32} height={32} style={{ color: "var(--teal-700)" }} />
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 10 }}>Event added!</h2>
            <p style={{ color: "var(--muted)", fontSize: 16, marginBottom: 32 }}>
              Your event is now on the calendar. The community can RSVP and you'll see who's going.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button className="btn btn-primary btn-lg" onClick={() => go("events")}>View Events <Ic.arrow /></button>
              <button className="btn btn-ghost btn-lg" onClick={() => { setSubmitted(false); setName(""); setDate(""); setTime(""); setPlace(""); setDetails(""); }}>Add another</button>
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
          <span className="eyebrow">Bring people together</span>
          <h1>Add an event</h1>
          <p>Hosting a workshop or meetup? Add it so the community can join.</p>
        </div>
        <form className="submit-card reveal" onSubmit={handleSubmit}>
          <section className="field">
            <div className="field-label"><label>Event name <i>*</i></label></div>
            <div className="text-input lg"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Builders meetup &amp; coffee" required /></div>
          </section>
          <section className="field">
            <div className="field-label"><label>Type</label></div>
            <div className="seg" style={{ alignSelf: "flex-start" }}>
              {["Meetup", "Workshop", "Demo Day"].map((tp) => (
                <button type="button" key={tp} className={type === tp ? "active" : ""} onClick={() => setType(tp)}>{tp}</button>
              ))}
            </div>
          </section>
          <div className="link-row">
            <section className="field" style={{ flex: 1 }}>
              <div className="field-label"><label>Date <i>*</i></label></div>
              <div className="text-input"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} required /></div>
            </section>
            <section className="field" style={{ flex: 1 }}>
              <div className="field-label"><label>Time <i>*</i></label></div>
              <div className="text-input"><input value={time} onChange={(e) => setTime(e.target.value)} placeholder="8:00 PM" required /></div>
            </section>
          </div>
          <section className="field">
            <div className="field-label"><label>Location <i>*</i></label></div>
            <div className="text-input lg"><input value={place} onChange={(e) => setPlace(e.target.value)} placeholder="Online, or a city / address" required /></div>
          </section>
          <section className="field">
            <div className="field-label"><label>Details</label></div>
            <textarea className="text-area" rows={3} placeholder="What's it about? Who's it for?"
              value={details} onChange={(e) => setDetails(e.target.value)}></textarea>
          </section>
          <button type="submit" className="btn btn-primary submit-btn"
            disabled={!canSubmit} style={{ opacity: canSubmit ? 1 : .6 }}>
            Add event
          </button>
        </form>
      </div>
    </main>
  );
}

Object.assign(window, { Events, PostEvent });
