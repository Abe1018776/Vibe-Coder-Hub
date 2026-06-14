// YidVibe — sample showcase data
window.YV_PROJECTS = [
  {
    id: "kehilla", name: "Kehilla", initial: "K",
    desc: "A curated local business directory that helps community members discover, connect with, and support nearby shops and services.",
    tools: ["Base44", "Leaflet"], tags: ["Community", "Finder"],
    by: "Anonymous", anon: true, votes: 14, hue: 168, featured: true, live: true, url: null,
  },
  {
    id: "arrive", name: "Arrive Accidents", initial: "A",
    desc: "Local residents report accidents they witness and receive real-time alerts about incidents in their neighborhood.",
    tools: ["Base44", "Leaflet", "OpenStreetMap"], tags: ["Community", "Safety"],
    by: "Anonymous", anon: true, votes: 6, hue: 158, live: true, url: null,
  },
  {
    id: "korbanos", name: "Korbanos", initial: "K",
    desc: "A modern-day price calculator for the sacrificial offerings of the Jewish Temple, with sources and explanations.",
    tools: ["Claude"], tags: ["Torah", "Education"],
    by: "Anonymous", anon: true, votes: 9, hue: 200, url: null,
  },
  {
    id: "havemeinmind", name: "havemeinmind.com", initial: "H",
    desc: "Manage and share your family kvittel and easily have loved ones and friends kept in mind at holy places.",
    tools: ["Lovable"], tags: ["Jewish", "Community"],
    by: "Joseph Landau", anon: false, votes: 22, hue: 172, live: true, url: "https://havemeinmind.com",
  },
  {
    id: "vibecoded", name: "Was It Vibe Coded?", initial: "W",
    desc: "A vibe-coding detector — paste any URL and it scans the site's source code for tell-tale signs of AI generation.",
    tools: ["Cursor", "Claude"], tags: ["Developer Tools", "AI"],
    by: "Anonymous", anon: true, votes: 31, hue: 192, url: null,
  },
  {
    id: "geniusbunks", name: "GeniusBunks", initial: "G",
    desc: "Import campers, set friendship requests and constraints, and auto-generate perfectly balanced bunk assignments.",
    tools: ["v0", "ChatGPT"], tags: ["SaaS", "Education"],
    by: "Anonymous", anon: true, votes: 5, hue: 184, url: null,
  },
  {
    id: "gemara", name: "GemaraGuide", initial: "G",
    desc: "An AI study companion that explains any daf with clarity, drawing on classic commentaries side by side.",
    tools: ["Claude", "Gemini"], tags: ["Torah", "Education"],
    by: "Shmuel B.", anon: false, votes: 18, hue: 164, url: null,
  },
  {
    id: "deals", name: "DealSheet", initial: "D",
    desc: "A clean way to track and compare community group-buy deals before they sell out, with price history.",
    tools: ["Lovable", "Bolt"], tags: ["Finance", "Marketplace"],
    by: "Anonymous", anon: true, votes: 11, hue: 206, url: null,
  },
  {
    id: "tefilla", name: "TefillaTimes", initial: "T",
    desc: "Accurate zmanim and minyan times for your exact location, with reminders that respect your schedule.",
    tools: ["Cursor", "Replit"], tags: ["Productivity", "Community"],
    by: "Avrohom K.", anon: false, votes: 27, hue: 176, url: null,
  },
  {
    id: "jewish-agent-skills", name: "Jewish Agent Skills", initial: "J",
    desc: "Jewish content agent skills for OpenClaw — zmanim, parsha summaries, Hebrew text tools. Drop-in skills for AI agents.",
    tools: ["Claude", "Cursor"], tags: ["Developer Tools", "AI", "Torah"],
    by: "Abe Perl", anon: false, votes: 2, hue: 212, live: true, url: null,
  },
];

// Single unified tool list — used for both the submit form and showcase filter
window.YV_ALL_TOOLS = [
  "Base44", "Bolt", "ChatGPT", "Claude", "Cursor",
  "Gemini", "GitHub Copilot", "Leaflet", "Lovable",
  "OpenStreetMap", "Replit", "v0", "Windsurf"
];
window.YV_TOOLS = window.YV_ALL_TOOLS;

// Single unified tag list — used for both the submit form and showcase filter
window.YV_ALL_TAGS = [
  "AI", "Automation", "Civic Tech", "Community", "Content",
  "Design", "Developer Tools", "Directory", "Education",
  "Events", "Finance", "Finder", "Games", "Health",
  "Jewish", "Map", "Marketplace", "Mobile",
  "Productivity", "Safety", "SaaS", "Social", "Torah"
];
window.YV_TAGS = window.YV_ALL_TAGS;

window.YV_BUILDERS = [
  { id: "yidvibe", name: "YidVibe Community", handle: "yidvibe", hue: 168, bio: "The official account — featured community projects and demos.", verified: true, available: false, skills: ["Product", "AI/ML"], tools: ["Claude", "Cursor"], owns: ["korbanos", "vibecoded", "geniusbunks", "deals", "arrive", "tefilla", "gemara", "kehilla"] },
  { id: "joseph", name: "Joseph Landau", handle: "josephlandau", hue: 172, bio: "Building tools to help loved ones stay connected.", available: true, skills: ["Full-stack", "No-code"], tools: ["Lovable"], owns: ["havemeinmind"] },
  { id: "meilech", name: "Meilech Moster", handle: "elimelechmoster", hue: 158, bio: "Maps, directories and Torah tools. Shipping small, useful things.", available: true, skills: ["Frontend", "Design"], tools: ["Base44", "Leaflet", "Cursor"], owns: ["kehilla", "arrive"] },
  { id: "dicta", name: "Dicta", handle: "dicta", hue: 200, bio: "OCR and digitization for rabbinic texts. From Dicta / Bar-Ilan University.", available: false, skills: ["AI/ML", "Data"], tools: ["Claude"], owns: ["korbanos"] },
  { id: "shmuel", name: "Shmuel B.", handle: "shmuelb", hue: 164, bio: "Learning by building — AI study companions for the beis medrash.", available: true, skills: ["Backend", "AI/ML"], tools: ["Claude", "Gemini"], owns: ["gemara"] },
  { id: "avrohom", name: "Avrohom K.", handle: "avrohomk", hue: 176, bio: "Productivity & zmanim tools for a busy community.", available: true, skills: ["Full-stack", "Mobile"], tools: ["Cursor", "Replit"], owns: ["tefilla"] },
  { id: "chezky", name: "Chezky Kohn", handle: "chezkynewemail", hue: 184, bio: "Just getting started.", available: false, skills: ["No-code"], tools: [], owns: [] },
  { id: "aberl", name: "Abe Perl", handle: "abeperl", hue: 212, bio: "Building open-source Jewish content tools for AI agents — zmanim, parsha, and Hebrew text.", available: true, skills: ["Backend", "AI/ML"], tools: ["Claude", "Cursor"], owns: ["jewish-agent-skills"] },
];

window.YV_SKILLS = ["Full-stack", "Frontend", "Backend", "Design", "AI/ML", "Data", "Mobile", "No-code", "DevOps", "Product"];

window.YV_GIGS = [
  { id: "g1", title: "Build a Shabbos-mode scheduling app", by: "joseph", budget: "$2,500", rate: "fixed", skills: ["Full-stack", "No-code"], desc: "Looking for a builder to ship a simple scheduling app with automatic Shabbos/Yom Tov awareness. Calendar sync, reminders, clean mobile UI.", posted: "2d ago", applicants: 4, hue: 172 },
  { id: "g2", title: "Landing page for a kosher travel startup", by: "avrohom", budget: "$800", rate: "fixed", skills: ["Design", "Frontend"], desc: "One-page marketing site with a waitlist form. Warm, premium look. Copy is mostly ready — need design + build.", posted: "5d ago", applicants: 9, hue: 176 },
  { id: "g3", title: "AI chatbot for a community gemach", by: "yidvibe", budget: "$40", rate: "hourly", skills: ["AI/ML", "Backend"], desc: "Build a retrieval chatbot that answers questions about loan policies and availability. Hebrew + English. Ongoing maintenance possible.", posted: "1w ago", applicants: 6, hue: 168 },
  { id: "g4", title: "Migrate a directory from Base44 to Next.js", by: "dicta", budget: "$1,200", rate: "fixed", skills: ["Full-stack"], desc: "Existing no-code directory needs a proper rebuild with search, filters, and an admin panel. Data export is ready.", posted: "1w ago", applicants: 3, hue: 200 },
];

window.YV_COMPETITIONS = [
  { id: "c1", title: "Best Torah-learning tool of the month", prize: "$1,000", by: "yidvibe", deadline: "12 days left", entries: 7, status: "open", tag: "Education", hue: 230, desc: "Build the most useful tool for learning — anything from a daf companion to a chazara tracker. Judged by the community + a panel." },
  { id: "c2", title: "48-hour sprint: Community safety", prize: "$500 + badge", by: "meilech", deadline: "3 days left", entries: 14, status: "open", tag: "Civic Tech", hue: 20, desc: "A weekend build challenge. Ship anything that helps keep the neighborhood safer. Solo or teams of two." },
  { id: "c3", title: "Design the cleanest zmanim widget", prize: "$750", by: "avrohom", deadline: "Judging", entries: 21, status: "judging", tag: "Design", hue: 168, desc: "An embeddable zmanim widget that any shul site can drop in. Cleanest, most accurate design wins." },
];

window.YV_EVENTS = [
  { id: "e1", title: "YidVibe Demo Night", month: "JUN", day: "12", time: "8:00 PM", place: "Online", host: "yidvibe", going: 42, type: "Demo Day", hue: 168 },
  { id: "e2", title: "Vibe-coding workshop: ship in a day", month: "JUN", day: "18", time: "1:00 PM", place: "Boro Park, NY", host: "meilech", going: 18, type: "Workshop", hue: 200 },
  { id: "e3", title: "Builders meetup & coffee", month: "JUN", day: "24", time: "9:00 AM", place: "Lakewood, NJ", host: "joseph", going: 11, type: "Meetup", hue: 172 },
  { id: "e4", title: "Intro to building with Claude", month: "JUL", day: "02", time: "7:30 PM", place: "Online", host: "shmuel", going: 27, type: "Workshop", hue: 164 },
];

// Merge user-submitted content from localStorage into the in-memory data so
// the whole app sees new submissions immediately on reload.
;(function () {
  var load = function(key, def) {
    try { return JSON.parse(localStorage.getItem(key) || "null") || def; } catch(e) { return def; }
  };
  var uProjects = load("yv_submitted_projects", []);
  if (uProjects.length) window.YV_PROJECTS = uProjects.concat(window.YV_PROJECTS);
  var uGigs = load("yv_submitted_gigs", []);
  if (uGigs.length) window.YV_GIGS = uGigs.concat(window.YV_GIGS);
  var uComps = load("yv_submitted_comps", []);
  if (uComps.length) window.YV_COMPETITIONS = uComps.concat(window.YV_COMPETITIONS);
  var uEvents = load("yv_submitted_events", []);
  if (uEvents.length) window.YV_EVENTS = uEvents.concat(window.YV_EVENTS);
})();
