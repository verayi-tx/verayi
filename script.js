const favorites = [
  {
    meta: "Book / kept nearby",
    title: "A shelf for pressure and tenderness",
    body: "Replace this with the books, essays, poems, or manuals you keep returning to when you need a better sentence or a better question."
  },
  {
    meta: "Sound / repeat",
    title: "Music that changes the room",
    body: "A place for albums, playlists, live sets, or one song that explains a whole season of your life."
  },
  {
    meta: "Object / tool",
    title: "Useful things with a point of view",
    body: "Tools, rituals, clothes, devices, apps, meals, materials, or anything else you like for reasons that are specific."
  }
];

const workingOn = [
  {
    date: "Now",
    title: "This personal site",
    body: "A public home for projects, favorites, notes, finished work, and small pieces of self-portraiture."
  },
  {
    date: "Soon",
    title: "A better archive of what I have made",
    body: "Collecting the projects, screenshots, writing, experiments, and traces that have been living in scattered places."
  },
  {
    date: "Open",
    title: "An index of taste",
    body: "A lightweight system for keeping track of what I love and why it stayed with me."
  }
];

const done = [
  {
    meta: "Project / 2026",
    title: "Immaterial",
    body: "AI-powered event matching for UT Austin students. A product about belonging, discovery, and meeting people who get you."
  },
  {
    meta: "Prototype / 2026",
    title: "Ontolize",
    body: "A portrait interface organized around memory, taste, momentum, people, and resonance."
  },
  {
    meta: "Archive / ongoing",
    title: "Personal experiments",
    body: "Small coded artifacts, visual systems, research sketches, and unfinished ideas that taught me something."
  },
  {
    meta: "Writing / ongoing",
    title: "Notes to make public",
    body: "Fragments that can become essays, captions, project writeups, or simply a record of what mattered."
  }
];

const notes = [
  {
    meta: "Question",
    title: "What is worth making slower?",
    body: "Some projects become clearer when they refuse to optimize for instant comprehension."
  },
  {
    meta: "Taste",
    title: "I trust interfaces with restraint.",
    body: "Small type, real hierarchy, fewer decorative moves, more attention to rhythm."
  },
  {
    meta: "Memory",
    title: "A website can be a room.",
    body: "Not every personal site needs to perform. Some can simply hold evidence."
  },
  {
    meta: "Momentum",
    title: "Keep the draft visible.",
    body: "Public incompleteness can be useful when the frame is honest."
  }
];

function renderList(id, items, template) {
  const root = document.getElementById(id);
  root.innerHTML = items.map(template).join("");
}

renderList("favorites-list", favorites, item => `
  <article class="entry">
    <p class="entry-meta">${item.meta}</p>
    <h3>${item.title}</h3>
    <p>${item.body}</p>
  </article>
`);

renderList("working-list", workingOn, item => `
  <article class="thread">
    <div class="thread-date">${item.date}</div>
    <div>
      <h3>${item.title}</h3>
      <p>${item.body}</p>
    </div>
  </article>
`);

renderList("done-list", done, item => `
  <article class="project">
    <p class="project-meta">${item.meta}</p>
    <h3>${item.title}</h3>
    <p>${item.body}</p>
  </article>
`);

renderList("notes-list", notes, item => `
  <article class="note">
    <p class="note-meta">${item.meta}</p>
    <h3>${item.title}</h3>
    <p>${item.body}</p>
  </article>
`);
