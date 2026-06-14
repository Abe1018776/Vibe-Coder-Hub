/* global React, ReactDOM, Nav, Footer, Landing, Showcase, Submit, Builders, BuilderProfile, Directory, Gigs, GigDetail, PostGig, Competitions, CompetitionDetail, PostCompetition, Events, PostEvent, HowItWorks, ProjectDetail, useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakSlider */
const { useState: useStateA, useEffect: useEffectA, useCallback: useCallbackA, useRef: useRefA } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "headlineFont": "serif",
  "accent": "teal",
  "coverStyle": "soft",
  "density": "airy",
  "radius": 16
}/*EDITMODE-END*/;

// ── Hash-based URL router ─────────────────────────────────────
// Converts internal route strings to/from URL hashes so browser
// back/forward and bookmarked/shared links work correctly.

function routeToHash(r) {
  if (!r || r === "home") return "#/";
  if (r.startsWith("project:"))     return "#/project/"     + r.slice(8);
  if (r.startsWith("gig:"))         return "#/gig/"         + r.slice(4);
  if (r.startsWith("competition:")) return "#/competition/" + r.slice(12);
  if (r.startsWith("builder:"))     return "#/builder/"     + r.slice(8);
  return "#/" + r;
}

function hashToRoute(hash) {
  var h = (hash || "").replace(/^#\/?/, "");
  if (!h) return "home";
  var parts = h.split("/");
  var seg = parts[0], id = parts[1];
  if (seg === "project"     && id) return "project:"     + id;
  if (seg === "gig"         && id) return "gig:"         + id;
  if (seg === "competition" && id) return "competition:" + id;
  if (seg === "builder"     && id) return "builder:"     + id;
  return seg || "home";
}

// Expose so other modules can build shareable URLs without re-implementing the mapping
window.YV_ROUTE_TO_HASH = routeToHash;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Read the initial route from the URL hash so bookmarks and shared links work
  const [route, setRoute] = useStateA(() => hashToRoute(window.location.hash));

  // Flag to skip the hashchange event that fires as a result of our own navigation
  // (avoids a redundant setState call, not critical but cleaner)
  const skipNext = useRefA(false);

  const go = useCallbackA((r) => {
    skipNext.current = true;
    setRoute(r);
    const newHash = routeToHash(r);
    if (window.location.hash !== newHash) window.location.hash = newHash;
    window.scrollTo({ top: 0, behavior: "instant" });
    if (window.gtag) window.gtag("event", "page_view", { page_path: routeToHash(r) });
    requestAnimationFrame(() => { skipNext.current = false; });
  }, []);

  // Browser back / forward buttons
  useEffectA(() => {
    const onHash = () => {
      if (skipNext.current) return;
      setRoute(hashToRoute(window.location.hash));
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // Apply tweaks to CSS custom properties
  useEffectA(() => {
    const root = document.documentElement.style;
    root.setProperty("--font-display", t.headlineFont === "sans"
      ? '"Nunito Sans", system-ui, sans-serif'
      : '"Comfortaa", "Nunito Sans", system-ui, sans-serif');
    if (t.accent === "gold") {
      root.setProperty("--accent", "var(--gold-500)");
      root.setProperty("--accent-strong", "var(--gold-700)");
    } else {
      root.setProperty("--accent", "var(--teal-600)");
      root.setProperty("--accent-strong", "var(--teal-700)");
    }
    root.setProperty("--space-section", t.density === "cozy" ? "72px" : "120px");
    root.setProperty("--radius", t.radius + "px");
    root.setProperty("--radius-sm", Math.max(6, t.radius - 6) + "px");
    root.setProperty("--radius-lg", (t.radius + 8) + "px");
  }, [t]);

  const navRoute = (() => {
    if (route === "showcase" || route.startsWith("project:")) return "showcase";
    if (route === "builders" || route.startsWith("builder:")) return "builders";
    if (route === "directory") return "directory";
    if (route === "gigs" || route.startsWith("gig:") || route === "postgig") return "gigs";
    if (route === "competitions" || route.startsWith("competition:") || route === "postcompetition") return "competitions";
    if (route === "events" || route === "postevent") return "events";
    if (route === "how") return "how";
    return "";
  })();

  const renderRoute = () => {
    if (route === "showcase")       return <Showcase go={go} t={t} />;
    if (route === "submit")         return <Submit go={go} />;
    if (route === "builders")       return <Builders go={go} />;
    if (route === "directory")      return <Directory go={go} />;
    if (route === "gigs")           return <Gigs go={go} />;
    if (route === "postgig")        return <PostGig go={go} />;
    if (route === "competitions")   return <Competitions go={go} />;
    if (route === "postcompetition") return <PostCompetition go={go} />;
    if (route === "events")         return <Events go={go} />;
    if (route === "postevent")      return <PostEvent go={go} />;
    if (route === "how")            return <HowItWorks go={go} />;
    if (route.startsWith("project:"))     return <ProjectDetail id={route.slice(8)}  go={go} t={t} />;
    if (route.startsWith("gig:"))         return <GigDetail id={route.slice(4)}      go={go} />;
    if (route.startsWith("competition:")) return <CompetitionDetail id={route.slice(12)} go={go} />;
    if (route.startsWith("builder:")) {
      const id = route.slice(8);
      return <BuilderProfile id={id} go={go} t={t} isMe={id === "meilech"} />;
    }
    return <Landing go={go} t={t} />;
  };

  return (
    <div className="app">
      <Nav route={navRoute} go={go} />
      {renderRoute()}
      <Footer go={go} />

      <TweaksPanel>
        <TweakSection label="Typography" />
        <TweakRadio label="Headline font" value={t.headlineFont}
          options={[{ value: "serif", label: "Comfortaa" }, { value: "sans", label: "Plain" }]}
          onChange={(v) => setTweak("headlineFont", v)} />

        <TweakSection label="Color" />
        <TweakRadio label="Accent" value={t.accent}
          options={[{ value: "teal", label: "Teal" }, { value: "gold", label: "Gold" }]}
          onChange={(v) => setTweak("accent", v)} />

        <TweakSection label="Project covers" />
        <TweakRadio label="Fallback style" value={t.coverStyle}
          options={[{ value: "soft", label: "Soft" }, { value: "glow", label: "Glow" }, { value: "rings", label: "Rings" }]}
          onChange={(v) => setTweak("coverStyle", v)} />

        <TweakSection label="Layout" />
        <TweakRadio label="Density" value={t.density}
          options={[{ value: "airy", label: "Airy" }, { value: "cozy", label: "Cozy" }]}
          onChange={(v) => setTweak("density", v)} />
        <TweakSlider label="Corner radius" value={t.radius} min={4} max={28} step={2} unit="px"
          onChange={(v) => setTweak("radius", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
