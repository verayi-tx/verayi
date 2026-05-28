const STORAGE_KEY = "verayi.portrait.entries.v1";
const OWNER_SESSION_KEY = "verayi.owner.session.v1";
const EDIT_PASSWORD = "verayi";

const layers = {
  now: {
    label: "Now",
    color: "var(--now)",
    prompt: "What has my attention?",
    sub: "Current obsessions, active experiments, and the decisions shaping the week."
  },
  memory: {
    label: "Memory",
    color: "var(--memory)",
    prompt: "What made me?",
    sub: "Past work, milestones, places, lessons, and things worth carrying forward."
  },
  taste: {
    label: "Taste",
    color: "var(--taste)",
    prompt: "What do I return to?",
    sub: "Books, songs, images, rooms, tools, meals, and other recurring loyalties."
  },
  momentum: {
    label: "Momentum",
    color: "var(--momentum)",
    prompt: "What am I building?",
    sub: "Projects, prototypes, research threads, drafts, and early-stage ideas."
  },
  people: {
    label: "People",
    color: "var(--people)",
    prompt: "Who changes the shape of things?",
    sub: "Collaborators, friends, teachers, communities, and the people around the work."
  }
};

const navItems = [
  ["now", "Now"],
  ["memory", "Memory"],
  ["taste", "Taste"],
  ["momentum", "Momentum"],
  ["people", "People"],
  ["portrait", "Portrait"],
  ["resonance", "Resonance"]
];

const defaultEntries = [
  {
    id: "now-site",
    layer: "now",
    title: "This site is becoming the home base.",
    text: "A place for work, favorites, fragments, questions, finished things, and the pieces that do not fit neatly anywhere else.",
    date: "May 2026",
    conn: ["momentum-immaterial", "taste-interface"]
  },
  {
    id: "now-index",
    layer: "now",
    title: "I want the structure to feel like a portrait, not a resume.",
    text: "The important thing is not chronology. It is relation: taste next to work, memory beside momentum, people threaded through everything.",
    date: "May 2026",
    conn: ["memory-ontolize", "people-room"]
  },
  {
    id: "memory-ontolize",
    layer: "memory",
    title: "Ontolize as product truth.",
    text: "A portrait interface organized around now, memory, taste, momentum, people, and resonance. It set the visual and conceptual language for this personal site.",
    date: "2026",
    conn: ["now-index", "taste-interface"]
  },
  {
    id: "memory-experiments",
    layer: "memory",
    title: "Small coded artifacts taught me how I like to think.",
    text: "Not everything needs to become a company, a launch, or a finished artifact. Some things exist because they sharpen taste.",
    date: "Ongoing",
    conn: ["taste-interface"]
  },
  {
    id: "taste-interface",
    layer: "taste",
    title: "I trust interfaces with restraint.",
    text: "Small type, real hierarchy, generous silence, warm dark surfaces, and controls that feel quiet until they are needed.",
    date: "Always",
    conn: ["memory-ontolize", "momentum-site"]
  },
  {
    id: "taste-cabinet",
    layer: "taste",
    title: "A cabinet for books, songs, rooms, meals, and tools.",
    text: "Favorites belong here because taste is evidence. It shows what I notice before I can fully explain what I believe.",
    date: "Open",
    conn: ["now-site"]
  },
  {
    id: "momentum-site",
    layer: "momentum",
    title: "A personal website that can hold edits over time.",
    text: "The next version should make adding, revising, and connecting entries feel native, without turning the site into a dashboard.",
    date: "Now",
    conn: ["now-site", "taste-interface"]
  },
  {
    id: "momentum-immaterial",
    layer: "momentum",
    title: "Immaterial.",
    text: "AI-powered event matching for UT Austin students. A product about belonging, discovery, and meeting people who get you.",
    date: "2026",
    conn: ["people-room", "now-site"]
  },
  {
    id: "people-room",
    layer: "people",
    title: "The room matters.",
    text: "The people around the work change the work: what feels possible, what gets named, what becomes worth finishing.",
    date: "Ongoing",
    conn: ["momentum-immaterial", "now-index"]
  }
];

const state = {
  view: "now",
  selectedId: null,
  compose: null,
  owner: localStorage.getItem(OWNER_SESSION_KEY) === "true",
  ownerModal: false,
  ownerError: "",
  entries: loadEntries()
};

function loadEntries() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return defaultEntries;
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : defaultEntries;
  } catch {
    return defaultEntries;
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.entries));
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function layerMeta(layer) {
  return layers[layer] || layers.now;
}

function entriesFor(layer) {
  return state.entries.filter(entry => entry.layer === layer);
}

function selectedEntry() {
  return state.entries.find(entry => entry.id === state.selectedId);
}

function connectedEntries(entry) {
  if (!entry) return [];
  const outbound = (entry.conn || []).map(id => state.entries.find(item => item.id === id)).filter(Boolean);
  const inbound = state.entries.filter(item => item.id !== entry.id && (item.conn || []).includes(entry.id));
  return [...outbound, ...inbound.filter(item => !outbound.some(out => out.id === item.id))];
}

function render() {
  document.getElementById("app").innerHTML = `
    <div class="chrome ${state.owner ? "owner-on" : ""}">
      ${renderNav()}
      <main class="stage">
        ${renderView()}
      </main>
      ${selectedEntry() ? renderEntryPanel(selectedEntry()) : ""}
      ${state.compose ? renderComposeModal(state.compose) : ""}
      ${state.ownerModal ? renderOwnerModal() : ""}
    </div>
  `;
  bindEvents();
}

function renderNav() {
  return `
    <header class="masthead">
      <button class="wordmark" data-view="now" type="button">Verayi</button>
      <nav class="nav-links" aria-label="Portrait layers">
        ${navItems.map(([view, label]) => `
          <button class="${state.view === view ? "active" : ""}" data-view="${view}" type="button">${label}</button>
        `).join("")}
      </nav>
      <div class="owner-tools">
        ${state.owner ? `
          <button class="owner-pill" data-action="compose" type="button">Add</button>
          <button class="owner-link" data-action="lock" type="button">Lock</button>
        ` : `
          <button class="owner-link" data-action="owner" type="button">Owner</button>
        `}
      </div>
    </header>
  `;
}

function renderView() {
  if (state.view === "portrait") return renderPortrait();
  if (state.view === "resonance") return renderResonance();
  return renderLayer(state.view);
}

function renderLayer(layer) {
  const meta = layerMeta(layer);
  const entries = entriesFor(layer);
  const lead = layer === "now"
    ? "A living portrait of what I am making, noticing, and becoming."
    : meta.prompt;

  return `
    <section class="layer-view" style="--layer-color: ${meta.color}">
      <div class="layer-hero">
        <div class="constellation" aria-hidden="true">
          ${Object.keys(layers).map(key => `<span class="node ${key} ${key === layer ? "current" : ""}"></span>`).join("")}
        </div>
        <p class="eyebrow">${escapeHtml(meta.label)}</p>
        <h1>${escapeHtml(lead)}</h1>
        <p class="hero-copy">${escapeHtml(meta.sub)}</p>
        ${state.owner ? `<button class="quiet-add" data-action="compose-layer" data-layer="${layer}" type="button">Add to ${escapeHtml(meta.label)}</button>` : ""}
      </div>
      <div class="entry-grid">
        ${entries.map(renderEntryCard).join("") || renderEmptyLayer(layer)}
      </div>
    </section>
  `;
}

function renderEntryCard(entry) {
  const meta = layerMeta(entry.layer);
  return `
    <article class="entry-card" style="--layer-color: ${meta.color}">
      <button class="entry-open" data-entry="${entry.id}" type="button">
        <span class="entry-meta"><i></i>${escapeHtml(meta.label)} · ${escapeHtml(entry.date)}</span>
        <h2>${escapeHtml(entry.title)}</h2>
        <p>${escapeHtml(entry.text)}</p>
      </button>
      ${state.owner ? `
        <div class="entry-admin">
          <button data-action="edit" data-entry="${entry.id}" type="button">Edit</button>
          <button data-action="delete" data-entry="${entry.id}" type="button">Delete</button>
        </div>
      ` : ""}
    </article>
  `;
}

function renderEmptyLayer(layer) {
  return `
    <article class="empty-card">
      <p>No public entries here yet.</p>
      ${state.owner ? `<button data-action="compose-layer" data-layer="${layer}" type="button">Add first entry</button>` : ""}
    </article>
  `;
}

function renderPortrait() {
  return `
    <section class="portrait-view">
      <div class="portrait-intro">
        <p class="eyebrow">A portrait</p>
        <h1>Not a resume. A set of traces.</h1>
        <p>This page gathers every layer at once: current attention, memory, taste, momentum, and people.</p>
      </div>
      <div class="portrait-columns">
        ${Object.entries(layers).map(([key, meta]) => `
          <section class="portrait-column" style="--layer-color: ${meta.color}">
            <p class="column-label"><i></i>${escapeHtml(meta.label)}</p>
            ${entriesFor(key).map(entry => `
              <button class="mini-entry" data-entry="${entry.id}" type="button">
                <span>${escapeHtml(entry.date)}</span>
                ${escapeHtml(entry.title)}
              </button>
            `).join("")}
          </section>
        `).join("")}
      </div>
    </section>
  `;
}

function renderResonance() {
  const pairs = state.entries
    .flatMap(entry => (entry.conn || []).map(id => [entry, state.entries.find(item => item.id === id)]))
    .filter(([, other]) => other);

  return `
    <section class="resonance-view">
      <div class="portrait-intro">
        <p class="eyebrow">Resonance</p>
        <h1>The point is the relation.</h1>
        <p>Connections reveal what belongs near what: a project beside a taste, a memory beside a person, a note beside the thing it made possible.</p>
      </div>
      <div class="resonance-list">
        ${pairs.map(([a, b]) => renderResonancePair(a, b)).join("") || "<p class='muted'>No connections yet.</p>"}
      </div>
    </section>
  `;
}

function renderResonancePair(a, b) {
  return `
    <article class="resonance-pair">
      ${renderResonanceHalf(a)}
      ${renderResonanceHalf(b)}
    </article>
  `;
}

function renderResonanceHalf(entry) {
  const meta = layerMeta(entry.layer);
  return `
    <button class="resonance-half" data-entry="${entry.id}" style="--layer-color: ${meta.color}" type="button">
      <span><i></i>${escapeHtml(meta.label)}</span>
      <strong>${escapeHtml(entry.title)}</strong>
    </button>
  `;
}

function renderEntryPanel(entry) {
  const meta = layerMeta(entry.layer);
  const connected = connectedEntries(entry);
  return `
    <aside class="panel-wrap">
      <button class="panel-scrim" data-action="close-panel" type="button" aria-label="Close"></button>
      <section class="entry-panel" style="--layer-color: ${meta.color}">
        <header>
          <p><i></i>${escapeHtml(meta.label)}</p>
          <button data-action="close-panel" type="button" aria-label="Close">x</button>
        </header>
        <div class="panel-body">
          <h2>${escapeHtml(entry.title)}</h2>
          <time>${escapeHtml(entry.date)}</time>
          <p>${escapeHtml(entry.text)}</p>
          <div class="connections">
            <p class="panel-label">Connections</p>
            ${connected.map(item => `
              <button class="connection-card" data-entry="${item.id}" type="button">
                <span>${escapeHtml(layerMeta(item.layer).label)} · ${escapeHtml(item.date)}</span>
                ${escapeHtml(item.title)}
              </button>
            `).join("") || "<span class='muted'>No connections yet.</span>"}
          </div>
        </div>
        ${state.owner ? `
          <footer>
            <button data-action="edit" data-entry="${entry.id}" type="button">Edit</button>
            <button data-action="compose" type="button">Add another</button>
          </footer>
        ` : ""}
      </section>
    </aside>
  `;
}

function renderComposeModal(mode) {
  const editing = typeof mode === "string" ? state.entries.find(entry => entry.id === mode) : null;
  const layer = editing?.layer || mode?.layer || "now";
  const meta = layerMeta(layer);
  return `
    <div class="modal-wrap">
      <button class="modal-scrim" data-action="close-compose" type="button" aria-label="Close"></button>
      <form class="compose-modal" style="--layer-color: ${meta.color}">
        <header>
          <div>
            <p class="eyebrow">${editing ? "Edit entry" : "Hold something"}</p>
            <h2>${escapeHtml(meta.prompt)}</h2>
          </div>
          <button data-action="close-compose" type="button" aria-label="Close">x</button>
        </header>
        <label>
          Layer
          <select name="layer">
            ${Object.entries(layers).map(([key, item]) => `<option value="${key}" ${key === layer ? "selected" : ""}>${escapeHtml(item.label)}</option>`).join("")}
          </select>
        </label>
        <label>
          Title
          <input name="title" value="${escapeHtml(editing?.title || "")}" required>
        </label>
        <label>
          Date
          <input name="date" value="${escapeHtml(editing?.date || "Now")}" required>
        </label>
        <label>
          Text
          <textarea name="text" rows="6" required>${escapeHtml(editing?.text || "")}</textarea>
        </label>
        <label>
          Connections
          <input name="conn" value="${escapeHtml((editing?.conn || []).join(", "))}" placeholder="entry-id, entry-id">
        </label>
        <footer>
          <button data-action="close-compose" type="button">Discard</button>
          <button class="primary" type="submit" data-editing="${editing?.id || ""}">${editing ? "Save" : "Hold"}</button>
        </footer>
      </form>
    </div>
  `;
}

function renderOwnerModal() {
  return `
    <div class="modal-wrap">
      <button class="modal-scrim" data-action="close-owner" type="button" aria-label="Close"></button>
      <form class="owner-modal">
        <p class="eyebrow">Owner unlock</p>
        <h2>Enter the edit password.</h2>
        <p class="muted">Owner mode reveals Add, Edit, and Delete controls and stores changes in this browser.</p>
        <input name="password" type="password" autocomplete="current-password" autofocus>
        ${state.ownerError ? `<p class="error">${escapeHtml(state.ownerError)}</p>` : ""}
        <footer>
          <button data-action="close-owner" type="button">Cancel</button>
          <button class="primary" type="submit">Unlock</button>
        </footer>
      </form>
    </div>
  `;
}

function bindEvents() {
  document.querySelectorAll("[data-view]").forEach(button => {
    button.addEventListener("click", () => {
      state.view = button.dataset.view;
      state.selectedId = null;
      render();
    });
  });

  document.querySelectorAll("[data-entry]").forEach(button => {
    button.addEventListener("click", event => {
      const action = button.dataset.action;
      if (action === "edit" || action === "delete") return;
      state.selectedId = button.dataset.entry;
      render();
    });
  });

  document.querySelectorAll("[data-action]").forEach(button => {
    button.addEventListener("click", event => handleAction(event, button));
  });

  document.querySelector(".compose-modal")?.addEventListener("submit", saveEntry);
  document.querySelector(".owner-modal")?.addEventListener("submit", unlockOwner);
}

function handleAction(event, button) {
  const action = button.dataset.action;
  if (["close-compose", "close-owner", "close-panel", "delete", "edit"].includes(action)) event.stopPropagation();

  if (action === "owner") {
    state.ownerModal = true;
    state.ownerError = "";
  }
  if (action === "lock") {
    state.owner = false;
    localStorage.removeItem(OWNER_SESSION_KEY);
  }
  if (action === "compose") state.compose = { layer: state.view in layers ? state.view : "now" };
  if (action === "compose-layer") state.compose = { layer: button.dataset.layer };
  if (action === "edit") state.compose = button.dataset.entry;
  if (action === "delete") deleteEntry(button.dataset.entry);
  if (action === "close-compose") state.compose = null;
  if (action === "close-owner") state.ownerModal = false;
  if (action === "close-panel") state.selectedId = null;
  render();
}

function deleteEntry(id) {
  if (!state.owner) return;
  state.entries = state.entries
    .filter(entry => entry.id !== id)
    .map(entry => ({ ...entry, conn: (entry.conn || []).filter(connId => connId !== id) }));
  state.selectedId = null;
  persist();
}

function saveEntry(event) {
  event.preventDefault();
  if (!state.owner) return;
  const form = new FormData(event.currentTarget);
  const editingId = event.submitter.dataset.editing;
  const entry = {
    id: editingId || `entry-${Date.now()}`,
    layer: form.get("layer"),
    title: form.get("title").trim(),
    date: form.get("date").trim(),
    text: form.get("text").trim(),
    conn: form.get("conn").split(",").map(item => item.trim()).filter(Boolean)
  };
  if (editingId) {
    state.entries = state.entries.map(item => item.id === editingId ? entry : item);
  } else {
    state.entries = [entry, ...state.entries];
  }
  state.compose = null;
  state.selectedId = entry.id;
  state.view = entry.layer;
  persist();
  render();
}

function unlockOwner(event) {
  event.preventDefault();
  const password = new FormData(event.currentTarget).get("password");
  if (password === EDIT_PASSWORD) {
    localStorage.setItem(OWNER_SESSION_KEY, "true");
    state.owner = true;
    state.ownerModal = false;
    state.ownerError = "";
  } else {
    state.ownerError = "That password did not match.";
  }
  render();
}

render();
