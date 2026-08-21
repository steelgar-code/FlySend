// FlySend - Vanilla JS Implementation
// Maintains 100% data compatibility with original LocalStorage key 'whatsapp-templates'

const STORAGE_KEY = 'whatsapp-templates';
const EXPORT_HEADER = "# FlySend WA Templates\n# Plain text export - each template is imported as a new template\n\n";

function singleLine(value) {
  return (value || "").replace(/\r?\n/g, " ").trim();
}

// Storage Operations
function getTemplates() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.sort((a, b) => a.order - b.order);
  } catch (e) {
    console.error("Failed to parse templates", e);
    return [];
  }
}

function saveTemplates(templates) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

function addTemplate(templateData) {
  const templates = getTemplates();
  const maxId = templates.reduce((max, t) => Math.max(max, t.id || 0), 0);
  const maxOrder = templates.reduce((max, t) => Math.max(max, t.order || 0), 0);
  
  const newTemplate = {
    id: maxId + 1,
    title: templateData.title,
    content: templateData.content,
    info: templateData.info || "",
    time: templateData.time || "",
    order: maxOrder + 1,
    createdAt: new Date().toISOString()
  };
  
  templates.push(newTemplate);
  saveTemplates(templates);
  return newTemplate;
}

function updateTemplate(id, updatedData) {
  let templates = getTemplates();
  templates = templates.map(t => {
    if (t.id === id) {
      return { ...t, ...updatedData };
    }
    return t;
  });
  saveTemplates(templates);
}

function deleteTemplate(id) {
  let templates = getTemplates();
  templates = templates.filter(t => t.id !== id);
  saveTemplates(templates);
}

function serializeTemplates(templates) {
  return EXPORT_HEADER + templates.slice().sort((a,b) => a.order - b.order).map(template => {
    const metadata = [
      `[TEMPLATE]`,
      `Title: ${singleLine(template.title)}`,
      template.info ? `Info: ${singleLine(template.info)}` : "",
      template.time ? `Time: ${singleLine(template.time)}` : "",
      `Content:`
    ].filter(Boolean).join("\n");
    return `${metadata}\n${template.content.trim()}`;
  }).join("\n\n---\n\n");
}

function parseImportedTemplates(text) {
  const blocks = text.split(/\n\s*---\s*\n/g);
  const parsed = [];

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const lines = trimmed.split("\n");
    let title = "";
    let info = "";
    let time = "";
    let contentLines = [];
    let parsingContent = false;

    for (const line of lines) {
      if (parsingContent) {
        contentLines.push(line);
        continue;
      }

      if (line.trim() === "[TEMPLATE]") continue;

      if (line.startsWith("Title:")) {
        title = line.substring("Title:".length).trim();
      } else if (line.startsWith("Info:")) {
        info = line.substring("Info:".length).trim();
      } else if (line.startsWith("Time:")) {
        time = line.substring("Time:".length).trim();
      } else if (line.startsWith("Content:")) {
        parsingContent = true;
      } else if (title && !parsingContent) {
        parsingContent = true;
        contentLines.push(line);
      }
    }

    const content = contentLines.join("\n").trim();
    if (title && content) {
      parsed.push({ title, info, time, content });
    }
  }

  return parsed;
}

// Variable Extractor
function extractVariables(content) {
  const matches = content.match(/\{\{([^}]+)\}\}/g) || [];
  const unique = new Set();
  matches.forEach(m => unique.add(m.replace(/[{}]/g, "").trim()));
  return Array.from(unique);
}

// UI State & Toast
function showToast(message, isError = false) {
  const toastContainer = document.getElementById("toast-container");
  const el = document.createElement("div");
  el.className = `px-4 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-300 transform translate-y-2 opacity-0 flex items-center gap-2 ${isError ? 'bg-red-600' : 'bg-emerald-600'}`;
  el.innerHTML = `<span>${message}</span>`;
  toastContainer.appendChild(el);
  
  setTimeout(() => {
    el.classList.remove("translate-y-2", "opacity-0");
  }, 10);

  setTimeout(() => {
    el.classList.add("opacity-0");
    setTimeout(() => el.remove(), 300);
  }, 2500);
}

// Search & Filter State
let currentSearchQuery = "";

// Router & Views
function navigateTo(hash) {
  window.location.hash = hash;
}

function router() {
  const hash = window.location.hash || "#home";
  const app = document.getElementById("app");
  
  if (hash === "#home" || hash === "") {
    renderHome(app);
  } else if (hash === "#create") {
    renderCreate(app);
  } else if (hash.startsWith("#edit/")) {
    const id = parseInt(hash.replace("#edit/", ""), 10);
    renderEdit(app, id);
  } else if (hash.startsWith("#send/")) {
    const id = parseInt(hash.replace("#send/", ""), 10);
    renderSend(app, id);
  } else {
    renderHome(app);
  }
}

// HOME VIEW
function renderHome(container) {
  const templates = getTemplates();
  const filtered = templates.filter(t => 
    t.title.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
    t.content.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
    t.info.toLowerCase().includes(currentSearchQuery.toLowerCase())
  );

  container.innerHTML = `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
      <header class="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3 shadow-sm">
        <div class="max-w-xl mx-auto flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <svg class="w-7 h-7 text-emerald-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12c0 1.82.49 3.53 1.35 5L2 22l5.12-1.33A9.94 9.94 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.57 0-3.05-.44-4.33-1.2l-.31-.18-3.04.79.81-2.96-.2-.32A7.94 7.94 0 014 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z"/></svg>
            <h1 class="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">FlySend</h1>
          </div>
          <div class="flex items-center gap-2">
            <label class="cursor-pointer p-2 text-slate-600 hover:text-emerald-600 dark:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700" title="Import File">
              <input type="file" id="import-file" class="hidden" accept=".txt">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
            </label>
            <button id="export-btn" class="p-2 text-slate-600 hover:text-emerald-600 dark:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700" title="Export Templates">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            </button>
            <a href="#create" class="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm transition">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              <span>New</span>
            </a>
          </div>
        </div>
      </header>

      <main class="max-w-xl mx-auto px-4 pt-4 space-y-4">
        <!-- Search Bar -->
        <div class="relative">
          <input type="text" id="search-input" value="${currentSearchQuery}" placeholder="Search templates..." class="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm">
          <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </div>

        <!-- Template List -->
        <div id="template-list" class="space-y-3">
          ${filtered.length === 0 ? `
            <div class="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-6">
              <p class="text-slate-500 dark:text-slate-400 font-medium">No templates found</p>
              <p class="text-xs text-slate-400 mt-1">Create one or import a file to get started.</p>
            </div>
          ` : filtered.map(t => `
            <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm hover:shadow transition relative group">
              <div class="flex justify-between items-start mb-2">
                <div>
                  <h3 class="font-semibold text-slate-900 dark:text-slate-100">${t.title}</h3>
                  ${t.info ? `<span class="inline-block text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded mt-1">${t.info}</span>` : ''}
                </div>
                ${t.time ? `<span class="text-xs text-slate-400 font-medium">${t.time}</span>` : ''}
              </div>
              <p class="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 mb-4 whitespace-pre-wrap">${t.content}</p>
              <div class="flex items-center justify-between border-t border-slate-100 dark:border-slate-700/50 pt-3">
                <div class="flex gap-2">
                  <a href="#edit/${t.id}" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  </a>
                  <button onclick="handleDelete(${t.id})" class="text-slate-400 hover:text-red-600 p-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
                <a href="#send/${t.id}" class="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1 transition">
                  <span>Send</span>
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </a>
              </div>
            </div>
          `).join('')}
        </div>
      </main>
    </div>
  `;

  // Search bind
  document.getElementById("search-input").addEventListener("input", (e) => {
    currentSearchQuery = e.target.value;
    renderHome(container);
  });

  // Export bind
  document.getElementById("export-btn").addEventListener("click", () => {
    const list = getTemplates();
    if (list.length === 0) {
      showToast("No templates to export", true);
      return;
    }
    const txt = serializeTemplates(list);
    const blob = new Blob([txt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "flysend-templates.txt";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Templates exported successfully");
  });

  // Import bind
  document.getElementById("import-file").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const imported = parseImportedTemplates(text);
      if (imported.length === 0) {
        showToast("No valid templates found in file", true);
        return;
      }
      imported.forEach(item => addTemplate(item));
      showToast(`Imported ${imported.length} template(s)`);
      renderHome(container);
    };
    reader.readAsText(file);
  });
}

window.handleDelete = function(id) {
  if (confirm("Are you sure you want to delete this template?")) {
    deleteTemplate(id);
    showToast("Template deleted");
    router();
  }
};

// CREATE VIEW
function renderCreate(container) {
  container.innerHTML = `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-900 pb-12">
      <header class="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3 shadow-sm">
        <div class="max-w-xl mx-auto flex items-center justify-between">
          <a href="#home" class="text-slate-600 dark:text-slate-300 hover:text-emerald-600 p-1 flex items-center gap-1 text-sm font-medium">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            Back
          </a>
          <h1 class="text-base font-semibold text-slate-800 dark:text-slate-100">Create Template</h1>
          <div class="w-12"></div>
        </div>
      </header>

      <main class="max-w-xl mx-auto px-4 pt-4">
        <form id="create-form" class="space-y-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title *</label>
            <input type="text" id="tmpl-title" required placeholder="e.g. Appointment Reminder" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm">
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category / Info</label>
              <input type="text" id="tmpl-info" placeholder="e.g. Work, Sales" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Time Label</label>
              <input type="text" id="tmpl-time" placeholder="e.g. 5 mins" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm">
            </div>
          </div>

          <div>
            <div class="flex justify-between items-center mb-1">
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Message Content *</label>
              <span class="text-xs text-slate-400">Use {{variable}} for dynamic inputs</span>
            </div>
            <textarea id="tmpl-content" required rows="6" placeholder="Hi {{name}}, your booking is confirmed for {{date}}." class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm font-mono"></textarea>
          </div>

          <button type="submit" class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium shadow-sm transition mt-2">Save Template</button>
        </form>
      </main>
    </div>
  `;

  document.getElementById("create-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("tmpl-title").value.trim();
    const info = document.getElementById("tmpl-info").value.trim();
    const time = document.getElementById("tmpl-time").value.trim();
    const content = document.getElementById("tmpl-content").value.trim();

    if (!title || !content) return;

    addTemplate({ title, info, time, content });
    showToast("Template created successfully");
    navigateTo("#home");
  });
}

// EDIT VIEW
function renderEdit(container, id) {
  const templates = getTemplates();
  const template = templates.find(t => t.id === id);

  if (!template) {
    navigateTo("#home");
    return;
  }

  container.innerHTML = `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-900 pb-12">
      <header class="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3 shadow-sm">
        <div class="max-w-xl mx-auto flex items-center justify-between">
          <a href="#home" class="text-slate-600 dark:text-slate-300 hover:text-emerald-600 p-1 flex items-center gap-1 text-sm font-medium">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            Back
          </a>
          <h1 class="text-base font-semibold text-slate-800 dark:text-slate-100">Edit Template</h1>
          <div class="w-12"></div>
        </div>
      </header>

      <main class="max-w-xl mx-auto px-4 pt-4">
        <form id="edit-form" class="space-y-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title *</label>
            <input type="text" id="tmpl-title" required value="${template.title}" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm">
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category / Info</label>
              <input type="text" id="tmpl-info" value="${template.info || ''}" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Time Label</label>
              <input type="text" id="tmpl-time" value="${template.time || ''}" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm">
            </div>
          </div>

          <div>
            <div class="flex justify-between items-center mb-1">
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Message Content *</label>
              <span class="text-xs text-slate-400">Use {{variable}} for placeholders</span>
            </div>
            <textarea id="tmpl-content" required rows="6" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm font-mono">${template.content}</textarea>
          </div>

          <button type="submit" class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium shadow-sm transition mt-2">Update Template</button>
        </form>
      </main>
    </div>
  `;

  document.getElementById("edit-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("tmpl-title").value.trim();
    const info = document.getElementById("tmpl-info").value.trim();
    const time = document.getElementById("tmpl-time").value.trim();
    const content = document.getElementById("tmpl-content").value.trim();

    if (!title || !content) return;

    updateTemplate(id, { title, info, time, content });
    showToast("Template updated");
    navigateTo("#home");
  });
}

// SEND VIEW
function renderSend(container, id) {
  const templates = getTemplates();
  const template = templates.find(t => t.id === id);

  if (!template) {
    navigateTo("#home");
    return;
  }

  const vars = extractVariables(template.content);
  const varValues = {};

  function buildMessage() {
    let result = template.content;
    vars.forEach(v => {
      const val = varValues[v] || `{{${v}}}`;
      result = result.replace(new RegExp(`\\{\\{\\s*${v}\\s*\\}\\}` , 'g'), val);
    });
    return result;
  }

  container.innerHTML = `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-900 pb-12">
      <header class="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3 shadow-sm">
        <div class="max-w-xl mx-auto flex items-center justify-between">
          <a href="#home" class="text-slate-600 dark:text-slate-300 hover:text-emerald-600 p-1 flex items-center gap-1 text-sm font-medium">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            Back
          </a>
          <h1 class="text-base font-semibold text-slate-800 dark:text-slate-100">${template.title}</h1>
          <div class="w-12"></div>
        </div>
      </header>

      <main class="max-w-xl mx-auto px-4 pt-4 space-y-4">
        <!-- Direct Phone Field -->
        <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number (Optional)</label>
          <input type="tel" id="phone-input" placeholder="e.g. 1234567890 (Include country code without +)" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm">
        </div>

        <!-- Dynamic Variables Form -->
        ${vars.length > 0 ? `
          <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <h2 class="text-sm font-semibold text-slate-800 dark:text-slate-200">Fill Variables</h2>
            ${vars.map(v => `
              <div>
                <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 capitalize">${v}</label>
                <input type="text" data-var="${v}" placeholder="Enter ${v}" class="var-field w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm">
              </div>
            `).join('')}
          </div>
        ` : ''}

        <!-- Message Preview -->
        <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <div class="flex justify-between items-center">
            <h2 class="text-sm font-semibold text-slate-800 dark:text-slate-200">Live Preview</h2>
            <button id="copy-btn" class="text-xs text-emerald-600 hover:text-emerald-700 font-medium p-1">Copy Message</button>
          </div>
          <div id="msg-preview" class="p-3 bg-emerald-50/50 dark:bg-slate-900/50 rounded-xl border border-emerald-100 dark:border-slate-700 text-sm whitespace-pre-wrap font-sans text-slate-800 dark:text-slate-200">
            ${template.content}
          </div>
        </div>

        <!-- Launch Button -->
        <button id="launch-wa-btn" class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-semibold shadow-md flex items-center justify-center gap-2 transition text-base">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12c0 1.82.49 3.53 1.35 5L2 22l5.12-1.33A9.94 9.94 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.57 0-3.05-.44-4.33-1.2l-.31-.18-3.04.79.81-2.96-.2-.32A7.94 7.94 0 014 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z"/></svg>
          Open in WhatsApp
        </button>
      </main>
    </div>
  `;

  // Bind Variable Input Live Preview
  const updatePreview = () => {
    document.querySelectorAll(".var-field").forEach(input => {
      const v = input.getAttribute("data-var");
      varValues[v] = input.value;
    });
    const finalMsg = buildMessage();
    document.getElementById("msg-preview").textContent = finalMsg;
  };

  document.querySelectorAll(".var-field").forEach(input => {
    input.addEventListener("input", updatePreview);
  });

  // Copy Action
  document.getElementById("copy-btn").addEventListener("click", () => {
    const finalMsg = buildMessage();
    navigator.clipboard.writeText(finalMsg).then(() => {
      showToast("Message copied to clipboard");
    });
  });

  // Launch WA Action
  document.getElementById("launch-wa-btn").addEventListener("click", () => {
    const finalMsg = buildMessage();
    const phone = document.getElementById("phone-input").value.replace(/[^0-9]/g, "");
    
    let url = "";
    if (phone) {
      url = `https://wa.me/${phone}?text=${encodeURIComponent(finalMsg)}`;
    } else {
      url = `https://wa.me/?text=${encodeURIComponent(finalMsg)}`;
    }

    window.open(url, "_blank");
  });
}

// Global Init & Event Listeners
window.addEventListener("hashchange", router);
window.addEventListener("DOMContentLoaded", () => {
  router();

  // Register PWA Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(err => {
      console.log('Service Worker Registration failed:', err);
    });
  }
});