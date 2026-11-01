const DAILY_VERSES = [
  {
    text: "This is the day which the LORD hath made; we will rejoice and be glad in it.",
    ref: "Psalm 118:24 . King James Version (Public Domain)",
  },
  {
    text: "The LORD is my shepherd; I shall not want. He maketh me to lie down in green pastures: he leadeth me beside the still waters.",
    ref: "Psalm 23:1-2 . King James Version (Public Domain)",
  },
  {
    text: "Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.",
    ref: "Proverbs 3:5-6 . King James Version (Public Domain)",
  },
  {
    text: "Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.",
    ref: "Philippians 4:6 . King James Version (Public Domain)",
  },
];

const PROMPTS = [
  "What do you want to write down today?",
  "What are three things you are grateful for right now?",
  "Which phrase from today's verse stood out to you the most?",
  "What intention or prayer do you want to carry into tomorrow?",
];

const DEFAULT_ENTRIES = [
  {
    id: "entry-1",
    date: "2026-11-01",
    verseRef: "Psalm 118:24 . KJV",
    mood: "Grateful",
    tags: ["gratitude", "morning", "family"],
    favorite: true,
    text: "Taking ten quiet minutes this morning before starting work. Reading Psalm 118:24 reminded me to focus on what is already present in my life and to approach today's responsibilities with patience and gratitude.",
  },
  {
    id: "entry-2",
    date: "2026-10-31",
    verseRef: "Proverbs 3:5-6 . KJV",
    mood: "Peaceful",
    tags: ["wisdom", "work", "prayer"],
    favorite: true,
    text: "Reflected on Proverbs 3:5-6 during my evening notes. Wrote down my main priorities for November and set aside unnecessary worry about decisions that are already moving forward.",
  },
  {
    id: "entry-3",
    date: "2026-10-30",
    verseRef: "Psalm 23:1-2 . KJV",
    mood: "Hopeful",
    tags: ["peace", "study", "rest"],
    favorite: false,
    text: "Quiet evening reading. Helpful reminder to slow down, rest properly, and keep a consistent daily writing habit.",
  },
];

const STORAGE_KEY = "the_sacred_notes_entries_v1";

export function loadEntries(storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw) return [...DEFAULT_ENTRIES];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...DEFAULT_ENTRIES];
  } catch {
    return [...DEFAULT_ENTRIES];
  }
}

export function saveEntries(entries, storage = globalThis.localStorage) {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Ignore storage quota errors in private browsing
  }
}

export function initJournalApp(doc = globalThis.document, win = globalThis.window) {
  if (!doc || !win) return;

  let entries = loadEntries(win.localStorage);
  let selectedMood = "Grateful";
  let promptIndex = 0;
  let searchFilter = "";
  let onlyFavorites = false;

  const tabButtons = doc.querySelectorAll("[data-tab]");
  const tabPanels = doc.querySelectorAll("[data-panel]");

  const switchTab = (tabName) => {
    tabButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-tab") === tabName);
    });
    tabPanels.forEach((panel) => {
      panel.hidden = panel.getAttribute("data-panel") !== tabName;
    });
  };

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-tab");
      if (target) switchTab(target);
    });
  });

  // Check URL query param ?tab=...
  try {
    const params = new URLSearchParams(win.location.search);
    const initialTab = params.get("tab");
    if (initialTab && ["today", "history", "journey", "settings", "support"].includes(initialTab)) {
      switchTab(initialTab);
    }
  } catch {
    // Default tab is today
  }

  // Prompt cycling
  const promptLabel = doc.getElementById("app-prompt-label");
  const nextPromptBtn = doc.getElementById("app-next-prompt");
  if (nextPromptBtn && promptLabel) {
    nextPromptBtn.addEventListener("click", () => {
      promptIndex = (promptIndex + 1) % PROMPTS.length;
      promptLabel.textContent = PROMPTS[promptIndex];
    });
  }

  // Mood selection
  const moodBtns = doc.querySelectorAll("[data-mood]");
  moodBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      moodBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      selectedMood = btn.getAttribute("data-mood") || "Grateful";
    });
  });

  // Render History & Journey stats
  const historyListEl = doc.getElementById("app-history-list");
  const statStreakEl = doc.getElementById("stat-current-streak");
  const statWordsEl = doc.getElementById("stat-total-words");
  const statEntriesEl = doc.getElementById("stat-total-entries");

  const renderAll = () => {
    if (historyListEl) {
      historyListEl.innerHTML = "";
      const filtered = entries.filter((item) => {
        if (onlyFavorites && !item.favorite) return false;
        if (!searchFilter) return true;
        const hay = `${item.text} ${item.tags.join(" ")} ${item.verseRef} ${item.date}`.toLowerCase();
        return hay.includes(searchFilter.toLowerCase());
      });

      filtered.forEach((item) => {
        const card = doc.createElement("article");
        card.className = "app-entry-card";
        card.innerHTML = `
          <div class="app-entry-header">
            <span class="app-entry-date">${item.date} . ${item.verseRef}</span>
            <span class="app-entry-mood">${item.mood}</span>
          </div>
          <p class="app-entry-body"></p>
          <div class="app-entry-tags"></div>
        `;
        card.querySelector(".app-entry-body").textContent = item.text;
        const tagsWrap = card.querySelector(".app-entry-tags");
        item.tags.forEach((t) => {
          const span = doc.createElement("span");
          span.className = "app-tag-pill";
          span.textContent = `#${t}`;
          tagsWrap.appendChild(span);
        });
        historyListEl.appendChild(card);
      });
    }

    const totalWords = entries.reduce(
      (acc, cur) => acc + cur.text.trim().split(/\s+/).filter(Boolean).length,
      0
    );
    if (statStreakEl) statStreakEl.textContent = `${Math.max(3, entries.length)} days`;
    if (statWordsEl) statWordsEl.textContent = String(totalWords);
    if (statEntriesEl) statEntriesEl.textContent = String(entries.length);
  };

  // Save new entry
  const saveEntryBtn = doc.getElementById("app-save-entry-btn");
  const noteTextarea = doc.getElementById("app-note-textarea");
  const tagsInput = doc.getElementById("app-tags-input");
  const saveFeedback = doc.getElementById("app-save-feedback");

  if (saveEntryBtn && noteTextarea) {
    saveEntryBtn.addEventListener("click", () => {
      const text = noteTextarea.value.trim();
      if (!text) return;
      const rawTags = (tagsInput?.value || "reflection, gratitude")
        .split(",")
        .map((t) => t.trim().replace(/^#/, ""))
        .filter(Boolean);

      const newEntry = {
        id: `entry-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        verseRef: "Psalm 118:24 . KJV",
        mood: selectedMood,
        tags: rawTags.length ? rawTags : ["reflection"],
        favorite: true,
        text,
      };
      entries = [newEntry, ...entries];
      saveEntries(entries, win.localStorage);
      noteTextarea.value = "";
      renderAll();
      if (saveFeedback) {
        saveFeedback.textContent = "Entry saved to your private History.";
        win.setTimeout(() => {
          saveFeedback.textContent = "";
        }, 3000);
      }
    });
  }

  // Search and favorites filter
  const searchInput = doc.getElementById("app-search-input");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      searchFilter = searchInput.value;
      renderAll();
    });
  }

  const favFilterBtn = doc.getElementById("app-fav-filter-btn");
  if (favFilterBtn) {
    favFilterBtn.addEventListener("click", () => {
      onlyFavorites = !onlyFavorites;
      favFilterBtn.classList.toggle("active", onlyFavorites);
      renderAll();
    });
  }

  // Export .txt
  const exportBtn = doc.getElementById("app-export-txt-btn");
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      const content = entries
        .map((e) => `[${e.date}] (${e.verseRef}) - Mood: ${e.mood}\nTags: ${e.tags.join(", ")}\n${e.text}\n`)
        .join("\n----------------------------------------\n\n");
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = doc.createElement("a");
      a.href = url;
      a.download = "the-sacred-notes-export.txt";
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  renderAll();
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => initJournalApp(document, window));
  } else {
    initJournalApp(document, window);
  }
}

