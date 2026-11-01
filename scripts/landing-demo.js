const DEMO_I18N = {
  en: {
    badge: "Private journal app . Daily Bible verse",
    verse: "This is the day which the LORD hath made; we will rejoice and be glad in it.",
    ref: "Psalm 118:24 . KJV",
    placeholder: "What do you want to write down today? Write a reflection, prayer, or gratitude note...",
    saveBtn: "Save entry to demo journal",
    savedToast: "Entry saved in interactive preview",
  },
  es: {
    badge: "Diario privado . Versiculo biblico diario",
    verse: "Este es el dia que hizo Jehova; nos gozaremos y alegraremos en el.",
    ref: "Salmos 118:24 . RV 1909",
    placeholder: "Que quieres escribir hoy? Escribe una nota, reflexion o agradecimiento...",
    saveBtn: "Guardar nota en la demo",
    savedToast: "Nota guardada en la vista previa",
  },
  fr: {
    badge: "Journal prive . Verset biblique quotidien",
    verse: "C'est ici la journee que l'Eternel a faite: qu'elle soit pour nous un sujet d'allegresse et de joie.",
    ref: "Psaume 118:24 . LSG 1910",
    placeholder: "Que souhaitez-vous ecrire aujourd'hui? Notez une reflexion ou une priere...",
    saveBtn: "Enregistrer dans la demo",
    savedToast: "Note enregistree dans l'apercu",
  },
};

export function initLandingDemo(doc = globalThis.document) {
  if (!doc) return;

  const langSelect = doc.getElementById("landing-lang-select");
  const verseTextEl = doc.getElementById("demo-verse-text");
  const verseRefEl = doc.getElementById("demo-verse-ref");
  const noteInput = doc.getElementById("demo-note-input");
  const saveBtn = doc.getElementById("demo-save-btn");
  const savedList = doc.getElementById("demo-saved-list");
  const tagChips = doc.querySelectorAll("[data-demo-tag]");

  let selectedTag = "gratitude";

  tagChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      tagChips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      selectedTag = chip.getAttribute("data-demo-tag") || "gratitude";
    });
  });

  if (langSelect) {
    langSelect.addEventListener("change", () => {
      const lang = DEMO_I18N[langSelect.value] || DEMO_I18N.en;
      if (verseTextEl) verseTextEl.textContent = lang.verse;
      if (verseRefEl) verseRefEl.textContent = lang.ref;
      if (noteInput) noteInput.setAttribute("placeholder", lang.placeholder);
      if (saveBtn) saveBtn.textContent = lang.saveBtn;
    });
  }

  if (saveBtn && noteInput && savedList) {
    saveBtn.addEventListener("click", () => {
      const val = noteInput.value.trim();
      if (!val) return;
      const item = doc.createElement("div");
      item.className = "demo-saved-item";
      const meta = doc.createElement("div");
      meta.className = "demo-saved-meta";
      meta.textContent = `Today . #${selectedTag}`;
      const body = doc.createElement("div");
      body.textContent = val;
      item.appendChild(meta);
      item.appendChild(body);
      savedList.prepend(item);
      noteInput.value = "";
    });
  }
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => initLandingDemo(document));
  } else {
    initLandingDemo(document);
  }
}

