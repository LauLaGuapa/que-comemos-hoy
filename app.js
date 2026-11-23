/* ¿Qué comemos hoy? — recetario personal, menú semanal y modo cocina.
   Sin dependencias ni paso de compilación. Los datos viven en el móvil (localStorage). */
(function () {
  'use strict';

  const APP_VERSION = '1.3.1';
  const STORE_KEY = 'qch.v1';
  const TIMERS_KEY = 'qch.timers';
  const DEFAULT_TAGS = ['Primeros y segundos', 'Pan, masas y repostería', 'Postres y helados', 'Rápidas y entre semana'];
  const UTENSIL_TYPES = ['Thermomix', 'Olla', 'Olla a presión', 'Horno', 'Airfryer', 'Sartén', 'Otro'];
  /* Pictogramas propios (dibujados para esta app, no son los oficiales de Thermomix).
     Orden y nombres de los modos tal y como aparecen en la pantalla de la Thermomix. */
  const ICONS = {
    modo: '<circle cx="24" cy="24" r="12" class="st"/><circle cx="24" cy="24" r="3"/>',
    amasar: '<path d="M24 44V18" class="st"/><ellipse cx="18" cy="31" rx="3" ry="6" transform="rotate(-35 18 31)"/><ellipse cx="30" cy="31" rx="3" ry="6" transform="rotate(35 30 31)"/><ellipse cx="18" cy="21" rx="3" ry="6" transform="rotate(-35 18 21)"/><ellipse cx="30" cy="21" rx="3" ry="6" transform="rotate(35 30 21)"/><ellipse cx="24" cy="11" rx="3" ry="6"/>',
    turbo: '<path d="M24 24a2 2 0 0 1 4 0a5 5 0 0 1-10 0a9 9 0 0 1 18 0a13 13 0 0 1-26 0" class="st"/>',
    triturar: '<circle cx="24" cy="24" r="19" class="st"/><path d="M24 24C21 17 24 10 33 8C34 16 30 22 24 24Z"/><path d="M24 24C21 17 24 10 33 8C34 16 30 22 24 24Z" transform="rotate(90 24 24)"/><path d="M24 24C21 17 24 10 33 8C34 16 30 22 24 24Z" transform="rotate(180 24 24)"/><path d="M24 24C21 17 24 10 33 8C34 16 30 22 24 24Z" transform="rotate(270 24 24)"/><circle cx="24" cy="24" r="3" class="bg"/>',
    huevos: '<path d="M24 6c9 0 14 12 14 20a14 14 0 0 1-28 0c0-8 5-20 14-20z"/><path d="M12 29q3-3 6 0t6 0t6 0t6 0" class="wv"/>',
    hervidor: '<path d="M13 20h18l3 20H10z"/><path d="M31 22l9-8" class="st"/><path d="M13 22c-8 0-8 12 0 12" class="st"/><rect x="16" y="14" width="12" height="5" rx="2"/>',
    calentar: '<rect x="21" y="6" width="6" height="26" rx="3"/><circle cx="24" cy="36" r="7"/><circle cx="35" cy="10" r="2.5"/>',
    balanza: '<path d="M24 10v28M15 38h18M9 16h30" class="st"/><path d="M9 16l-5 11h10zM39 16l-5 11h10z"/>',
    trocear: '<path d="M8 40L32 10Q38 10 40 16L16 42Z"/><circle cx="38" cy="36" r="1.8"/><circle cx="31" cy="40" r="1.8"/><circle cx="43" cy="29" r="1.8"/>',
    prelavado: '<path d="M10 14h22v16a8 8 0 0 1-8 8h-6a8 8 0 0 1-8-8z" class="st"/><path d="M32 18h3a5 5 0 0 1 0 10h-3" class="st"/><path d="M21 20c4 5 5 7 0 11-5-4-4-6 0-11z"/>',
    espesar: '<path d="M6 20h26c0 10-4 17-13 17S6 30 6 20z"/><path d="M32 20c3-5 8-7 11-6-2 4-6 6-11 6z"/><rect x="12" y="38" width="14" height="3" rx="1.5"/>',
    arroz: '<path d="M6 26h36a18 15 0 0 1-36 0z"/><path d="M15 8q4 4 0 9M24 6q4 4 0 9M33 8q4 4 0 9" class="st"/>',
    pelar: '<path d="M15 8h18v9a9 9 0 0 1-7 8.8V42h-4V25.8A9 9 0 0 1 15 17z"/><rect x="21" y="12" width="6" height="6" rx="2" class="bg"/>',
    rallar: '<path d="M17 6h14l5 36H12z"/><circle cx="20" cy="22" r="1.9" class="bg"/><circle cx="28" cy="22" r="1.9" class="bg"/><circle cx="24" cy="30" r="1.9" class="bg"/><circle cx="18" cy="35" r="1.9" class="bg"/><circle cx="30" cy="35" r="1.9" class="bg"/>',
    laminar: '<path d="M17 6h14l3 36H14z"/><rect x="19" y="16" width="10" height="2.8" rx="1.4" class="bg"/><rect x="19" y="24" width="10" height="2.8" rx="1.4" class="bg"/><rect x="19" y="32" width="10" height="2.8" rx="1.4" class="bg"/>',
    fermentar: '<rect x="14" y="7" width="20" height="7" rx="2"/><rect x="11" y="15" width="26" height="27" rx="6"/><circle cx="20" cy="25" r="1.8" class="bg"/><circle cx="28" cy="25" r="1.8" class="bg"/><circle cx="24" cy="31" r="1.8" class="bg"/><circle cx="19" cy="36" r="1.8" class="bg"/><circle cx="29" cy="36" r="1.8" class="bg"/>',
    lenta: '<circle cx="24" cy="24" r="17" class="st"/><path d="M24 24V11a13 13 0 0 1 11.3 19.5Z"/>',
    vacio: '<rect x="22" y="8" width="4" height="24" rx="2"/><circle cx="24" cy="36" r="5.5"/><path d="M4 18q3-3 6 0t6 0M32 18q3-3 6 0t6 0" class="st"/>',
    sintapa: '<path d="M9 20h30l-3 18a4 4 0 0 1-4 3H16a4 4 0 0 1-4-3z"/><path d="M5 22h4M39 22h4" class="st"/><path d="M18 8q3 3 0 7M30 8q3 3 0 7" class="st"/>',
    dorar: '<ellipse cx="22" cy="31" rx="16" ry="7"/><path d="M36 29l9-6" class="st"/><path d="M14 14l2 6M22 11l1 7M30 14l-1 6" class="st"/>',
    vapor: '<path d="M10 38h28" class="st"/><path d="M16 8q4 5 0 10t0 10M24 6q4 5 0 10t0 10M32 8q4 5 0 10t0 10" class="st"/>',
    time: '<circle cx="24" cy="24" r="16" class="st"/><path d="M24 14v11l7 4" class="st"/>',
    vel: '<path d="M7 36a17 17 0 0 1 34 0" class="st"/><path d="M24 36l9-13" class="st"/><circle cx="24" cy="36" r="3.2"/>',
    cuchara: '<ellipse cx="24" cy="15" rx="8" ry="10"/><path d="M24 25v18" class="st"/>',
    reverse: '<path d="M36 17a14 14 0 1 0 3 12" class="st"/><path d="M38 6v11H27" class="st"/>'
  };
  const tmIcon = (k) => `<svg class="tm-ic" viewBox="0 0 48 48" aria-hidden="true">${ICONS[k] || ICONS.modo}</svg>`;
  const MODES = [
    { k: ['amasar'], name: 'Amasar', ic: 'amasar', tip: 'Para panes, pizzas y pasta. Dos minutos equivalen a unos diez de amasado a mano.' },
    { k: ['turbo'], name: 'Turbo', ic: 'turbo', tip: 'Golpes de máxima potencia y corta duración.' },
    { k: ['triturar'], name: 'Triturar', ic: 'triturar', tip: 'Ideal para sopas y cremas.' },
    { k: ['huevo'], name: 'Cocción de huevos', ic: 'huevos', tip: 'De 2 a 6 huevos M fríos, sin el cestillo y con agua hasta la marca de 1 litro. Eliges el punto de cocción.' },
    { k: ['hervidor', 'hervir'], name: 'Hervidor', ic: 'hervidor', tip: 'Para hervir agua.' },
    { k: ['calentar'], name: 'Calentar', ic: 'calentar', tip: 'Para calentar.' },
    { k: ['balanza', 'bascula', 'pesar'], name: 'Balanza', ic: 'balanza', tip: 'Para pesar los ingredientes directamente en el vaso.' },
    { k: ['trocear', 'picar'], name: 'Trocear', ic: 'trocear', tip: 'Para trocear o picar con las cuchillas.' },
    { k: ['prelavado'], name: 'Prelavado', ic: 'prelavado', tip: 'Para prelavar el vaso.' },
    { k: ['espesar'], name: 'Espesar', ic: 'espesar', tip: 'Para espesar salsas y cremas.' },
    { k: ['arroz'], name: 'Cocción de arroz', ic: 'arroz', tip: 'Para cocer arroz.' },
    { k: ['pelar'], name: 'Pelar', ic: 'pelar', tip: 'Para pelar con el accesorio correspondiente.' },
    { k: ['rallar'], name: 'Rallar', ic: 'rallar', tip: 'Rallado grueso o fino, con el accesorio correspondiente.' },
    { k: ['laminar'], name: 'Laminar', ic: 'laminar', tip: 'Para cortar en láminas, con el accesorio correspondiente.' },
    { k: ['fermenta'], name: 'Fermentar', ic: 'fermentar', tip: 'Para fermentaciones, por ejemplo de masas.' },
    { k: ['lenta'], name: 'Cocción lenta', ic: 'lenta', tip: 'Para cocinar, hervir o guisar durante más tiempo.' },
    { k: ['al vacio', 'vacio'], name: 'Cocción al vacío', ic: 'vacio', tip: 'Cocción al vacío (sous-vide).' },
    { k: ['sin tapa'], name: 'Sin tapa', ic: 'sintapa', tip: 'Cocina hasta 100 °C sin giro de cuchillas y sin tapa. Ideal para ingredientes delicados.' },
    { k: ['dorar'], name: 'Dorar', ic: 'dorar', tip: 'La TM7 tiene dos tipos de dorado.' },
    { k: ['al vapor', 'vapor'], name: 'Al vapor', ic: 'vapor', tip: 'Cocina al vapor con el Varoma y el cestillo.' }
  ];
  const findMode = (name) => { const n = norm(name); return MODES.find((m) => m.k.some((k) => n.includes(k))); };
  const SLOT_LABELS = { desayuno: 'Desayuno', comida: 'Comida', cena: 'Cena' };

  /* ---------- utilidades ---------- */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = (p) => (p || 'r') + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3);
  const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const pad = (n) => String(n).padStart(2, '0');
  const dateKey = (d) => `${(d || new Date()).getFullYear()}-${pad((d || new Date()).getMonth() + 1)}-${pad((d || new Date()).getDate())}`;
  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const startOfWeek = (d) => addDays(d, -((d.getDay() + 6) % 7));
  const fromKey = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
  const cap1 = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const fmtDateLong = (d) => cap1(d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }));
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

  function fmtAgo(key) {
    if (!key) return 'nunca';
    const days = Math.round((fromKey(dateKey()) - fromKey(key)) / 86400000);
    if (days <= 0) return 'hoy';
    if (days === 1) return 'ayer';
    if (days < 30) return `hace ${days} días`;
    const months = Math.round(days / 30);
    return months === 1 ? 'hace 1 mes' : `hace ${months} meses`;
  }

  function fmtDuration(sec) {
    sec = Math.round(sec);
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    const parts = [];
    if (h) parts.push(`${h} h`);
    if (m) parts.push(`${m} min`);
    if (s && !h) parts.push(`${s} s`);
    return parts.join(' ') || '0 s';
  }
  function fmtClock(sec) {
    sec = Math.max(0, Math.round(sec));
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    return h ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  }

  /* ---------- estado y almacenamiento ---------- */
  let storageOk = true;
  const defaultState = () => ({
    version: 1,
    recipes: [],
    utensils: [],
    menu: {},
    log: [],
    settings: { created: new Date().toISOString(), lastBackup: null, showBreakfast: false }
  });

  function loadState() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (s && Array.isArray(s.recipes)) {
          const d = defaultState();
          return { ...d, ...s, settings: { ...d.settings, ...(s.settings || {}) }, utensils: s.utensils || [], menu: s.menu || {}, log: Array.isArray(s.log) ? s.log : [] };
        }
      }
    } catch (e) { storageOk = false; }
    return defaultState();
  }
  let state = loadState();

  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
    catch (e) { storageOk = false; toast('No he podido guardar en el móvil'); }
  }

  const ui = { q: '', tag: '', equip: '', weekOffset: 0, servings: {}, draft: null, picker: null, confirm: null };

  const getRecipe = (id) => state.recipes.find((r) => r.id === id);
  const sortedRecipes = () => state.recipes.slice().sort((a, b) => a.name.localeCompare(b.name, 'es'));
  const slotList = () => (state.settings.showBreakfast ? ['desayuno', 'comida', 'cena'] : ['comida', 'cena']);

  /* ---------- ingredientes ---------- */
  function parseQty(s) {
    s = String(s).trim();
    const fr = { '¼': 0.25, '½': 0.5, '¾': 0.75 };
    if (fr[s] != null) return fr[s];
    if (s.includes('/')) { const [a, b] = s.split('/').map((x) => parseFloat(x.replace(',', '.'))); return b ? a / b : NaN; }
    return parseFloat(s.replace(',', '.'));
  }
  const UNIT_RE = /^(kg|g|ml|cl|l|cdas?|cdtas?|uds?|dientes?|ramas?|sobres?|latas?|pizcas?|vasos?)\b\.?\s*/i;
  function parseIng(line) {
    let s = String(line || '').trim();
    if (!s) return null;
    let qty = null, unit = '';
    const m = s.match(/^(\d+(?:[.,]\d+)?(?:\s*\/\s*\d+)?|[¼½¾])\s*/);
    if (m) {
      qty = parseQty(m[1]); if (isNaN(qty)) qty = null;
      s = s.slice(m[0].length);
      const u = s.match(UNIT_RE);
      if (u) { unit = u[1].toLowerCase(); s = s.slice(u[0].length); }
      s = s.replace(/^de\s+/i, '');
    }
    return { qty, unit, name: s.trim() };
  }
  const trimNum = (n) => String(Math.round(n * 10) / 10).replace('.', ',');
  function ingToLine(i) {
    const q = i.qty == null ? '' : trimNum(i.qty).replace(',', '.');
    return [q, i.unit, i.unit || q ? (/^\d/.test(i.name) ? '' : (i.unit ? 'de ' : '')) : '', i.name].filter(Boolean).join(' ').replace(/\s+/g, ' ').replace(/ de de /, ' de ');
  }
  const COUNTABLE = ['', 'ud', 'uds', 'cda', 'cdas', 'cdta', 'cdtas', 'diente', 'dientes', 'pizca', 'pizcas', 'rama', 'ramas', 'sobre', 'sobres', 'lata', 'latas', 'vaso', 'vasos'];
  function fmtQty(q, unit) {
    if (q == null || isNaN(q)) return '';
    if (q >= 100) return String(Math.round(q));
    if (q >= 10) return trimNum(q);
    if (COUNTABLE.includes(unit || '')) {
      const r = Math.round(q * 4) / 4;
      if (r === 0) return '¼';
      const whole = Math.floor(r), frac = r - whole;
      const f = { 0: '', 0.25: '¼', 0.5: '½', 0.75: '¾' }[frac];
      return (whole ? String(whole) : '') + f;
    }
    return trimNum(q);
  }
  function ingHtml(i, factor) {
    const q = i.qty == null ? '' : `${fmtQty(i.qty * factor, i.unit)}${i.unit ? ' ' + esc(i.unit) : ''}`;
    return `<li><span class="q">${q}</span><span>${esc(i.name)}</span></li>`;
  }
  function approxTotal(r, factor) {
    let total = 0;
    for (const i of r.ingredients || []) {
      if (i.qty == null) continue;
      const mult = { g: 1, ml: 1, kg: 1000, l: 1000, cl: 10 }[i.unit];
      if (mult) total += i.qty * factor * mult;
    }
    return Math.round(total);
  }

  /* ---------- normalización de recetas (importar / editar) ---------- */
  function normStep(s) {
    if (typeof s === 'string') s = { text: s };
    const tm = s.tm && typeof s.tm === 'object' ? s.tm : null;
    const out = { text: String(s.text || '').trim() };
    if (tm) {
      const t = {};
      if (tm.mode) t.mode = String(tm.mode);
      if (tm.time) t.time = String(tm.time);
      if (tm.temp != null && tm.temp !== '') t.temp = String(tm.temp);
      if (tm.speed != null && tm.speed !== '') t.speed = String(tm.speed);
      if (tm.reverse) t.reverse = true;
      if (Object.keys(t).length) out.tm = t;
    }
    let sec = null;
    if (s.timer != null) sec = typeof s.timer === 'object' ? Number(s.timer.seconds) : Number(s.timer);
    if (sec && sec > 0) out.timer = { seconds: Math.round(sec) };
    if (s.hint) out.hint = String(s.hint);
    return out;
  }
  function normRecipe(r) {
    if (!r || typeof r !== 'object') throw new Error('Una receta no tiene el formato correcto');
    const out = {
      id: r.id ? String(r.id) : uid('r'),
      name: String(r.name || '').trim() || 'Receta sin nombre',
      servings: Number(r.servings) > 0 ? Number(r.servings) : 2,
      time: r.time ? String(r.time) : '',
      source: r.source ? String(r.source) : '',
      tags: Array.isArray(r.tags) ? r.tags.map(String).filter(Boolean) : [],
      equipment: Array.isArray(r.equipment) ? r.equipment.map(String).filter(Boolean) : [],
      ingredients: (Array.isArray(r.ingredients) ? r.ingredients : []).map((i) => (typeof i === 'string' ? parseIng(i) : { qty: i.qty == null || i.qty === '' ? null : Number(i.qty), unit: i.unit || '', name: String(i.name || '') })).filter((i) => i && i.name),
      steps: (Array.isArray(r.steps) ? r.steps : []).map(normStep).filter((s) => s.text),
      notes: r.notes ? String(r.notes) : '',
      rating: Number(r.rating) >= 1 && Number(r.rating) <= 5 ? Math.round(Number(r.rating)) : 0,
      lastCooked: r.lastCooked ? String(r.lastCooked) : null,
      createdAt: r.createdAt || new Date().toISOString()
    };
    return out;
  }
  function normUtensil(u) {
    return {
      id: u.id ? String(u.id) : uid('u'),
      name: String(u.name || 'Utensilio'),
      type: UTENSIL_TYPES.includes(u.type) ? u.type : 'Otro',
      capacity: u.capacity != null && u.capacity !== '' && !isNaN(Number(u.capacity)) ? Number(u.capacity) : null,
      notes: u.notes ? String(u.notes) : ''
    };
  }

  const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
  function normMenu(m) {
    const out = {};
    if (!m || typeof m !== 'object') return out;
    for (const [day, slots] of Object.entries(m)) {
      if (!DATE_RE.test(day) || !slots || typeof slots !== 'object') continue;
      for (const slot of Object.keys(SLOT_LABELS)) {
        const e = slots[slot];
        if (!e) continue;
        const v = typeof e === 'string' ? { text: e } : e;
        const entry = {};
        if (v.recipeId) entry.recipeId = String(v.recipeId);
        if (v.text) entry.text = String(v.text);
        if (entry.recipeId || entry.text) { out[day] = out[day] || {}; out[day][slot] = entry; }
      }
    }
    return out;
  }
  function normLog(l) {
    if (!l || !DATE_RE.test(String(l.date || ''))) return null;
    return { id: l.id ? String(l.id) : uid('l'), recipeId: l.recipeId ? String(l.recipeId) : '', name: String(l.name || 'Receta'), date: String(l.date), servings: Number(l.servings) > 0 ? Number(l.servings) : null, rating: Number(l.rating) >= 1 && Number(l.rating) <= 5 ? Number(l.rating) : 0 };
  }

  /* ---------- UI: toast, hojas y confirmaciones ---------- */
  let toastTimer = null;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 3200);
  }
  function openSheet(html) {
    const o = $('#overlay');
    o.innerHTML = `<div class="sheet" role="dialog" aria-modal="true">${html}</div>`;
    o.hidden = false;
  }
  function closeSheet() {
    const o = $('#overlay');
    o.hidden = true; o.innerHTML = '';
    ui.picker = null;
  }
  function confirmDialog(msg, okLabel, danger, cancelLabel) {
    return new Promise((resolve) => {
      ui.confirm = resolve;
      openSheet(`<h3>${esc(msg)}</h3><div class="btn-row"><button class="btn ghost" data-act="confirmNo">${esc(cancelLabel || 'Cancelar')}</button><button class="btn ${danger ? 'danger' : ''}" data-act="confirmYes">${esc(okLabel || 'Aceptar')}</button></div>`);
    });
  }

  /* ---------- enrutado ---------- */
  function currentRoute() {
    const h = (location.hash || '#inicio').replace(/^#/, '') || 'inicio';
    const [name, ...rest] = h.split('/');
    return { name, arg: decodeURIComponent(rest.join('/')) };
  }
  const go = (hash) => { if (location.hash === hash) render(); else location.hash = hash; };

  function render() {
    const { name, arg } = currentRoute();
    const view = $('#view');
    let title = '¿Qué comemos hoy?', html = '', tab = name, back = false;
    if (name === 'recetas') { title = 'Recetas'; html = viewRecipes(); }
    else if (name === 'receta') {
      const r = getRecipe(arg);
      tab = 'recetas'; back = true;
      if (!r) { title = 'Receta'; html = emptyState('🤔', 'No encuentro esa receta.', '<a class="btn" href="#recetas">Ver recetas</a>'); }
      else { title = r.name; html = viewRecipe(r); }
    } else if (name === 'editar') { tab = 'recetas'; back = true; title = arg === 'nuevo' ? 'Nueva receta' : 'Editar receta'; html = viewEditor(arg); }
    else if (name === 'menu') { title = 'Menú semanal'; html = viewMenu(); }
    else if (name === 'cocina') { title = 'Mi cocina'; html = viewKitchen(); }
    else if (name === 'guia') { tab = 'cocina'; back = true; title = 'Guía Thermomix'; html = viewGuide(); }
    else if (name === 'estadisticas') { tab = 'cocina'; back = true; title = 'Estadísticas'; html = viewStats(); }
    else { tab = 'inicio'; html = viewHome(); }
    view.innerHTML = html;
    $('#pageTitle').textContent = title;
    $('#backBtn').hidden = !back;
    $$('#tabbar a').forEach((a) => a.classList.toggle('active', a.dataset.tab === tab));
    if (render.last !== location.hash) window.scrollTo(0, 0);
    render.last = location.hash;
  }

  const emptyState = (emoji, text, extra) => `<div class="empty-state"><div class="big">${emoji}</div><p>${text}</p>${extra || ''}</div>`;

  /* ---------- vistas: inicio ---------- */
  function slotValueHtml(entry) {
    if (entry && entry.recipeId) {
      const r = getRecipe(entry.recipeId);
      if (r) return `<a href="#receta/${esc(r.id)}">${esc(r.name)}</a>`;
    }
    if (entry && entry.text) return esc(entry.text);
    return '<span class="empty">Sin planificar</span>';
  }
  function dayHasAny(key) {
    const d = state.menu[key];
    return !!d && slotList().some((s) => d[s] && (d[s].recipeId || d[s].text));
  }
  function dayCard(label, key) {
    const d = state.menu[key] || {};
    return `<div class="card day-card"><div class="row spread"><h3 class="serif">${label}</h3><a class="small" href="#menu">Editar</a></div>${slotList().map((s) => `<div class="slot"><span class="lbl">${SLOT_LABELS[s]}</span><span class="val">${slotValueHtml(d[s])}</span></div>`).join('')}</div>`;
  }
  function backupBanner() {
    if (!state.recipes.length && !state.utensils.length) return '';
    const last = state.settings.lastBackup || state.settings.created;
    const days = Math.floor((Date.now() - new Date(last).getTime()) / 86400000);
    if (days < 7) return '';
    const msg = state.settings.lastBackup ? `Hace ${days} días de tu última copia de seguridad.` : 'Todavía no has hecho ninguna copia de seguridad.';
    return `<div class="banner"><strong>Toca copia de seguridad.</strong> ${msg}<div class="row wrap"><button class="btn small" data-act="shareBackup">Compartir copia</button><button class="btn small secondary" data-act="copyBackup">Copiar al portapapeles</button></div></div>`;
  }
  function activeTimersHtml() {
    const running = Object.entries(timers).filter(([, t]) => !t.done);
    if (!running.length) return '';
    return `<div class="banner" style="background:var(--green-soft);color:#2f5429">⏲ ${running.map(([k, t]) => `<a href="#receta/${esc(t.recipeId)}">${esc(t.label)}</a>: <strong data-digits="${esc(k)}">${fmtClock((t.end - Date.now()) / 1000)}</strong>`).join(' · ')}</div>`;
  }
  function viewHome() {
    const now = new Date(), h = now.getHours();
    const greet = h < 13 ? 'Buenos días' : h < 20 ? 'Buenas tardes' : 'Buenas noches';
    const t = dateKey(now), m = dateKey(addDays(now, 1));
    let html = `<h2 class="serif" style="margin-top:.2rem">${greet}</h2><p class="muted">${fmtDateLong(now)}</p>`;
    if (!storageOk) html += '<div class="warn">Este navegador no deja guardar datos. Lo que añadas se perderá al cerrar.</div>';
    html += backupBanner() + activeTimersHtml();
    if (!state.recipes.length) {
      html += emptyState('🍲', 'Todavía no hay recetas. Importa tus datos desde <strong>Mi cocina → Importar</strong> o crea una nueva.', '<a class="btn" href="#editar/nuevo">Crear una receta</a>');
      return html;
    }
    html += dayCard('Hoy', t) + dayCard('Mañana', m);
    if (!dayHasAny(t) && !dayHasAny(m)) html += '<a class="btn block" href="#menu">Planificar el menú de la semana</a>';
    const ideas = state.recipes.slice().sort((a, b) => (a.lastCooked || '').localeCompare(b.lastCooked || '')).slice(0, 3);
    html += '<h2 class="serif">Hace tiempo que no haces</h2>';
    html += ideas.map((r) => `<a class="card recipe-item" href="#receta/${esc(r.id)}"><p class="title">${esc(r.name)}</p><div class="muted small">Última vez: ${fmtAgo(r.lastCooked)}</div></a>`).join('');
    if (state.log.length) html += `<a class="card recipe-item" href="#estadisticas"><p class="title">📊 Tus estadísticas</p><div class="muted small">${plural(state.log.length, 'comida registrada', 'comidas registradas')}. Toca para verlas.</div></a>`;
    return html;
  }

  /* ---------- vistas: recetas ---------- */
  function allTags() {
    const set = new Set(DEFAULT_TAGS);
    state.recipes.forEach((r) => r.tags.forEach((t) => set.add(t)));
    return Array.from(set);
  }
  function allEquip() {
    const set = new Set();
    state.recipes.forEach((r) => r.equipment.forEach((e) => set.add(e)));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'));
  }
  function filteredRecipes() {
    const words = norm(ui.q).split(/\s+/).filter(Boolean);
    return sortedRecipes().filter((r) => {
      if (ui.tag && !r.tags.includes(ui.tag)) return false;
      if (ui.equip && !r.equipment.includes(ui.equip)) return false;
      if (!words.length) return true;
      const hay = norm([r.name, r.tags.join(' '), r.equipment.join(' '), r.ingredients.map((i) => i.name).join(' ')].join(' '));
      return words.every((w) => hay.includes(w));
    });
  }
  function stars(n) { return n ? `<span class="stars" aria-label="${n} de 5">${'★'.repeat(n)}${'☆'.repeat(5 - n)}</span>` : ''; }
  function recipeListHtml() {
    const list = filteredRecipes();
    if (!state.recipes.length) return emptyState('📖', 'Aún no tienes recetas guardadas.', '<a class="btn" href="#editar/nuevo">Crear una receta</a>');
    if (!list.length) return emptyState('🔎', 'No hay recetas con esos filtros.');
    return list.map((r) => `<a class="card recipe-item" href="#receta/${esc(r.id)}"><p class="title">${esc(r.name)}</p><div class="muted small">${[r.time, plural(r.servings, 'ración', 'raciones')].filter(Boolean).map(esc).join(' · ')}</div><div class="chips">${r.tags.map((t) => `<span class="chip static">${esc(t)}</span>`).join('')}${r.equipment.map((e) => `<span class="chip green static">${esc(e)}</span>`).join('')}</div><div class="row spread small"><span>${stars(r.rating)}</span><span class="muted">Última vez: ${fmtAgo(r.lastCooked)}</span></div></a>`).join('');
  }
  function viewRecipes() {
    const tags = allTags(), equips = allEquip();
    return `<div class="row"><input type="search" id="q" class="grow" placeholder="Buscar por nombre o ingrediente" aria-label="Buscar recetas" value="${esc(ui.q)}" data-input="search"><a class="btn small" href="#editar/nuevo">+ Nueva</a></div>
      <div class="chips" aria-label="Filtrar por etiqueta">${tags.map((t) => `<button class="chip ${ui.tag === t ? 'on' : ''}" data-act="filterTag" data-v="${esc(t)}">${esc(t)}</button>`).join('')}</div>
      ${equips.length ? `<div class="chips" aria-label="Filtrar por aparato">${equips.map((e) => `<button class="chip ${ui.equip === e ? 'on' : ''}" data-act="filterEquip" data-v="${esc(e)}">${esc(e)}</button>`).join('')}</div>` : ''}
      <div id="recipeList">${recipeListHtml()}</div>`;
  }

  /* ---------- vistas: receta ---------- */
  const badge = (ic, label) => `<span class="tm-badge"><span class="tm-circ">${tmIcon(ic)}</span><span class="tm-lab">${label}</span></span>`;
  function tmChips(tm) {
    if (!tm) return '';
    const b = [];
    if (tm.mode) { const m = findMode(tm.mode); b.push(badge(m ? m.ic : 'modo', esc(tm.mode))); }
    if (tm.time) b.push(badge('time', esc(tm.time)));
    if (tm.temp) b.push(/varoma/i.test(tm.temp) ? badge('vapor', 'Varoma') : badge('calentar', /^\d+$/.test(tm.temp) ? tm.temp + ' °C' : esc(tm.temp)));
    if (tm.speed) b.push(/cuchara/i.test(tm.speed) ? badge('cuchara', 'cuchara') : badge('vel', /^\d+([.,]\d+)?$/.test(tm.speed) ? 'vel. ' + esc(tm.speed) : esc(tm.speed)));
    if (tm.reverse) b.push(badge('reverse', 'giro inverso'));
    return b.length ? `<div class="tm-row">${b.join('')}</div>` : '';
  }
  function tmHowTo(tm) {
    const out = [], m = tm.mode ? findMode(tm.mode) : null;
    out.push(m && m.k.includes('sin tapa') ? 'Este modo se usa sin tapa. Si la pantalla te pide algo más, hazle caso.' : 'Cierra bien la tapa y coloca el cubilete (salvo que la receta diga otra cosa).');
    if (tm.mode) out.push(`En la pantalla de la Thermomix elige el modo «${tm.mode}».`);
    if (tm.temp) out.push(/varoma/i.test(tm.temp) ? 'Temperatura: Varoma (cocción al vapor).' : /^\d+$/.test(tm.temp) ? `Temperatura: ${tm.temp} °C.` : `Temperatura: ${tm.temp}.`);
    if (tm.speed) out.push(/cuchara/i.test(tm.speed) ? 'Velocidad cuchara: la más suave, para remover sin triturar.' : /^\d+([.,]\d+)?$/.test(tm.speed) ? `Velocidad ${tm.speed} (de 1 a 10: cuanto más alta, más fuerte giran las cuchillas).` : `Velocidad: ${tm.speed}.`);
    if (tm.reverse) out.push('Activa el giro inverso (símbolo ↺): las cuchillas giran al revés y mezclan sin cortar.');
    if (tm.time) out.push(`Tiempo: ${tm.time}.`);
    out.push('Pulsa el botón de inicio y espera a que la Thermomix termine y avise.');
    return out;
  }
  const helpBtn = (rid, i) => `<button class="btn small ghost" data-act="tmHelp" data-r="${esc(rid)}" data-i="${i}">❓ Cómo se hace</button>`;
  function currentServings(r) { return ui.servings[r.id] || r.servings; }
  function tmWarning(r, factor) {
    const hasTM = r.steps.some((s) => s.tm) || r.equipment.some((e) => /thermomix/i.test(e));
    if (!hasTM) return '';
    const tm = state.utensils.find((u) => /thermomix/i.test(u.type + ' ' + u.name) && u.capacity);
    if (!tm) return '';
    const total = approxTotal(r, factor);
    const limit = Math.round(tm.capacity * 1000 * 0.9);
    if (total <= limit) return '';
    return `<div class="warn">⚠️ Con estas raciones llevas unos ${total} g/ml de ingredientes y el vaso es de ${esc(String(tm.capacity).replace('.', ','))} L (conviene no pasar de unos ${limit}). Puede que haya que hacerlo en dos tandas o usar otro utensilio.</div>`;
  }
  function viewRecipe(r) {
    const serv = currentServings(r), factor = serv / r.servings;
    const meta = [r.time && `⏱ ${esc(r.time)}`, r.source && `Origen: ${esc(r.source)}`].filter(Boolean).join(' · ');
    return `
      <div class="chips">${r.tags.map((t) => `<span class="chip static">${esc(t)}</span>`).join('')}${r.equipment.map((e) => `<span class="chip green static">${esc(e)}</span>`).join('')}</div>
      ${meta ? `<p class="muted">${meta}</p>` : ''}
      <div class="row wrap"><button class="btn grow" data-act="startCook" data-id="${esc(r.id)}">▶ Cocinar paso a paso</button></div>
      <div class="card">
        <div class="row spread"><strong>Raciones</strong>
          <div class="stepper"><button data-act="servDec" data-id="${esc(r.id)}" aria-label="Menos raciones">−</button><span>${serv}</span><button data-act="servInc" data-id="${esc(r.id)}" aria-label="Más raciones">+</button></div>
        </div>
        ${factor !== 1 ? `<p class="muted small">Cantidades ajustadas ×${trimNum(factor)} respecto a ${plural(r.servings, 'ración', 'raciones')}. Ojo: las cantidades escritas dentro del texto de los pasos son las de la receta original.</p>` : ''}
        ${tmWarning(r, factor)}
        <h3>Ingredientes</h3>
        <ul class="ing-list">${r.ingredients.map((i) => ingHtml(i, factor)).join('') || '<li class="muted">Sin ingredientes.</li>'}</ul>
      </div>
      <div class="card"><h3>Pasos</h3>
        <ol class="steps">${r.steps.map((s, i) => `<li>${esc(s.text)}${tmChips(s.tm)}${s.tm ? helpBtn(r.id, i) : ''}${s.timer ? `<div class="chips"><span class="chip static">⏲ ${fmtDuration(s.timer.seconds)}</span></div>` : ''}${s.hint ? `<div class="hint">👀 ${esc(s.hint)}</div>` : ''}</li>`).join('') || '<li class="muted">Sin pasos.</li>'}</ol>
      </div>
      <div class="card"><div class="row spread"><h3 style="margin:0">Notas</h3><button class="btn small secondary" data-act="editNotes" data-id="${esc(r.id)}">Editar</button></div>
        <p>${r.notes ? esc(r.notes).replace(/\n/g, '<br>') : '<span class="muted">Sin notas todavía.</span>'}</p></div>
      <div class="card"><div class="row spread"><strong>Tu valoración</strong><span>${[1, 2, 3, 4, 5].map((n) => `<button class="stars" style="background:none;border:0;font-size:1.7rem;padding:0 .1rem;cursor:pointer" data-act="rate" data-id="${esc(r.id)}" data-v="${n}" aria-label="${n} estrellas">${n <= r.rating ? '★' : '☆'}</button>`).join('')}</span></div>
        <p class="muted small">Última vez cocinada: ${fmtAgo(r.lastCooked)}</p>
        <div class="row wrap"><button class="btn small secondary" data-act="cookedToday" data-id="${esc(r.id)}">✓ Cocinada hoy</button><button class="btn small secondary" data-act="addToMenu" data-id="${esc(r.id)}">🗓️ Añadir al menú</button></div></div>
      <div class="row wrap" style="margin-top:1rem"><a class="btn ghost small" href="#editar/${esc(r.id)}">Editar receta</a><button class="btn danger small" data-act="deleteRecipe" data-id="${esc(r.id)}">Eliminar</button></div>`;
  }

  /* ---------- vistas: editor de receta ---------- */
  function recipeToDraft(r) {
    return {
      id: r ? r.id : null,
      name: r ? r.name : '', servings: r ? r.servings : 2, time: r ? r.time : '', source: r ? r.source : '',
      tags: r ? r.tags.join(', ') : '', equipment: r ? r.equipment.join(', ') : '',
      ingredients: r ? r.ingredients.map(ingToLine).join('\n') : '',
      steps: r ? r.steps.map((s) => ({ text: s.text, mode: (s.tm && s.tm.mode) || '', time: (s.tm && s.tm.time) || '', temp: (s.tm && s.tm.temp) || '', speed: (s.tm && s.tm.speed) || '', reverse: !!(s.tm && s.tm.reverse), timerMin: s.timer ? Math.round(s.timer.seconds / 60) : '', hint: s.hint || '' })) : [{ text: '', mode: '', time: '', temp: '', speed: '', reverse: false, timerMin: '', hint: '' }],
      notes: r ? r.notes : ''
    };
  }
  function syncDraft() {
    if (!ui.draft || currentRoute().name !== 'editar') return;
    $$('[data-f]').forEach((el) => { ui.draft[el.dataset.f] = el.value; });
    $$('.editor-step').forEach((box, i) => {
      const st = ui.draft.steps[i]; if (!st) return;
      $$('[data-s]', box).forEach((el) => { st[el.dataset.s] = el.type === 'checkbox' ? el.checked : el.value; });
    });
  }
  function viewEditor(arg) {
    const existing = arg === 'nuevo' ? null : getRecipe(arg);
    if (arg !== 'nuevo' && !existing) return emptyState('🤔', 'No encuentro esa receta.');
    if (!ui.draft || ui.draft.id !== (existing ? existing.id : null) || ui.draft._arg !== arg) { ui.draft = recipeToDraft(existing); ui.draft._arg = arg; }
    const d = ui.draft;
    const F = (k, label, extra) => `<label for="f-${k}">${label}</label><input type="text" id="f-${k}" data-f="${k}" value="${esc(d[k])}" ${extra || ''}>`;
    return `
      ${F('name', 'Nombre')}
      <div class="grid2"><div><label for="f-servings">Raciones</label><input type="number" id="f-servings" min="1" data-f="servings" value="${esc(d.servings)}"></div><div>${F('time', 'Tiempo total', 'placeholder="p. ej. 45 min"')}</div></div>
      ${F('source', 'Origen', 'placeholder="Propia, de quién, enlace…"')}
      ${F('tags', 'Etiquetas (separadas por comas)', `placeholder="${esc(DEFAULT_TAGS[0])}"`)}
      ${F('equipment', 'Aparatos que usa (separados por comas)', 'placeholder="Thermomix, Horno"')}
      <label for="f-ingredients">Ingredientes (uno por línea: cantidad unidad nombre)</label>
      <textarea id="f-ingredients" rows="8" data-f="ingredients" placeholder="660 g harina de fuerza&#10;2 huevos&#10;sal">${esc(d.ingredients)}</textarea>
      <h3>Pasos</h3>
      ${d.steps.map((s, i) => `<div class="editor-step"><strong>Paso ${i + 1}</strong>
        <textarea data-s="text" aria-label="Texto del paso ${i + 1}" placeholder="Qué hay que hacer">${esc(s.text)}</textarea>
        <div class="grid3"><input type="text" data-s="mode" aria-label="Modo Thermomix" placeholder="Modo (Amasar…)" value="${esc(s.mode)}"><input type="text" data-s="time" aria-label="Tiempo" placeholder="Tiempo (20 s)" value="${esc(s.time)}"><input type="text" data-s="temp" aria-label="Temperatura" placeholder="Temp. (100)" value="${esc(s.temp)}"></div>
        <div class="grid2" style="margin-top:.5rem"><input type="text" data-s="speed" aria-label="Velocidad" placeholder="Velocidad (6, cuchara)" value="${esc(s.speed)}"><input type="number" min="0" data-s="timerMin" aria-label="Temporizador en minutos" placeholder="Temporizador (min)" value="${esc(s.timerMin)}"></div>
        <label class="checkline"><input type="checkbox" data-s="reverse" ${s.reverse ? 'checked' : ''}> Giro inverso</label>
        <input type="text" data-s="hint" aria-label="Señal o aviso" placeholder="Señal o aviso (p. ej. burbujas)" value="${esc(s.hint)}">
        <div class="row wrap" style="margin-top:.5rem"><button class="btn small ghost" data-act="stepUp" data-i="${i}" ${i === 0 ? 'disabled' : ''}>↑</button><button class="btn small ghost" data-act="stepDown" data-i="${i}" ${i === d.steps.length - 1 ? 'disabled' : ''}>↓</button><button class="btn small danger" data-act="stepDel" data-i="${i}">Quitar</button></div></div>`).join('')}
      <button class="btn secondary small" data-act="stepAdd">+ Añadir paso</button>
      <label for="f-notes">Notas</label><textarea id="f-notes" data-f="notes">${esc(d.notes)}</textarea>
      <div class="row" style="margin-top:1rem"><button class="btn ghost grow" data-act="cancelEdit">Cancelar</button><button class="btn grow" data-act="saveRecipe">Guardar</button></div>`;
  }
  function draftToRecipe(d, base) {
    const splitList = (s) => String(s || '').split(',').map((x) => x.trim()).filter(Boolean);
    return normRecipe({
      id: base ? base.id : undefined, name: d.name, servings: d.servings, time: d.time, source: d.source,
      tags: splitList(d.tags), equipment: splitList(d.equipment),
      ingredients: String(d.ingredients || '').split('\n').map((l) => parseIng(l)).filter(Boolean),
      steps: d.steps.map((s) => ({ text: s.text, tm: { mode: s.mode, time: s.time, temp: s.temp, speed: s.speed, reverse: s.reverse }, timer: s.timerMin ? Number(s.timerMin) * 60 : null, hint: s.hint })),
      notes: d.notes, rating: base ? base.rating : 0, lastCooked: base ? base.lastCooked : null, createdAt: base ? base.createdAt : undefined
    });
  }

  /* ---------- vistas: menú semanal ---------- */
  function viewMenu() {
    const ws = startOfWeek(addDays(new Date(), ui.weekOffset * 7)), we = addDays(ws, 6), today = dateKey();
    const ms = (d) => d.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '');
    let html = `<div class="row wrap" style="margin-bottom:.5rem"><button class="btn small secondary" data-act="openImport">⬇ Importar menú o recetas</button></div><div class="row spread"><button class="icon-btn" data-act="weekPrev" aria-label="Semana anterior">‹</button><div style="text-align:center"><strong>${ws.getDate()} ${ms(ws)} – ${we.getDate()} ${ms(we)}</strong>${ui.weekOffset === 0 ? '<div class="muted small">Esta semana</div>' : '<div><button class="btn small ghost" data-act="weekToday">Ir a hoy</button></div>'}</div><button class="icon-btn" data-act="weekNext" aria-label="Semana siguiente">›</button></div>`;
    for (let i = 0; i < 7; i++) {
      const d = addDays(ws, i), key = dateKey(d), entry = state.menu[key] || {};
      html += `<div class="card day-card" style="${key === today ? 'border-color:var(--accent)' : ''}"><h3 class="serif">${cap1(d.toLocaleDateString('es-ES', { weekday: 'long' }))} ${d.getDate()}${key === today ? ' · hoy' : ''}</h3>${slotList().map((s) => `<div class="slot"><span class="lbl">${SLOT_LABELS[s]}</span><button class="slot-btn val" data-act="pickSlot" data-date="${key}" data-slot="${s}">${entry[s] && (entry[s].recipeId && getRecipe(entry[s].recipeId) || entry[s].text) ? (entry[s].recipeId && getRecipe(entry[s].recipeId) ? `<strong>${esc(getRecipe(entry[s].recipeId).name)}</strong>` : esc(entry[s].text)) : '<span class="empty">Toca para elegir</span>'}</button></div>`).join('')}</div>`;
    }
    return html;
  }
  function pickerHtml() {
    const p = ui.picker, words = norm(p.q || '').split(/\s+/).filter(Boolean);
    const list = sortedRecipes().filter((r) => !words.length || words.every((w) => norm(r.name + ' ' + r.tags.join(' ') + ' ' + r.ingredients.map((i) => i.name).join(' ')).includes(w)));
    return list.length ? list.map((r) => `<button data-act="pickRecipe" data-id="${esc(r.id)}">${esc(r.name)}</button>`).join('') : '<p class="muted">No hay recetas con ese nombre. Puedes escribir un texto libre abajo.</p>';
  }
  function openPicker(date, slot) {
    ui.picker = { date, slot, q: '' };
    const label = `${cap1(fromKey(date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' }))} · ${SLOT_LABELS[slot]}`;
    openSheet(`<h3>${esc(label)}</h3>
      <input type="search" aria-label="Buscar receta" placeholder="Buscar receta" data-input="pickerSearch">
      <div class="pick-list" id="pickList">${pickerHtml()}</div>
      <label for="freeText">O escribe algo (p. ej. «sobras», «comemos fuera»)</label>
      <div class="row"><input type="text" id="freeText" class="grow"><button class="btn small" data-act="pickText">Guardar</button></div>
      <div class="btn-row"><button class="btn ghost" data-act="pickClear">Quitar</button><button class="btn ghost" data-act="closeSheet">Cerrar</button></div>`);
  }
  function setSlot(date, slot, value) {
    state.menu[date] = state.menu[date] || {};
    if (value) state.menu[date][slot] = value; else delete state.menu[date][slot];
    if (!Object.keys(state.menu[date]).length) delete state.menu[date];
    save();
  }

  /* ---------- vistas: mi cocina ---------- */
  function viewKitchen() {
    const last = state.settings.lastBackup ? `${fmtAgo(state.settings.lastBackup.slice(0, 10))}` : 'nunca';
    return `
      <a class="card recipe-item" href="#guia"><p class="title">🔰 Guía Thermomix</p><div class="muted small">Qué significan los modos y los parámetros, para cocinar a mano.</div></a>
      <a class="card recipe-item" href="#estadisticas"><p class="title">📊 Estadísticas</p><div class="muted small">${plural(state.log.length, 'comida registrada', 'comidas registradas')}</div></a>
      <div class="row spread"><h2 class="serif" style="margin:.2rem 0">Utensilios</h2><button class="btn small" data-act="addUtensil">+ Añadir</button></div>
      ${state.utensils.length ? state.utensils.map((u) => `<div class="card"><div class="row spread"><div class="grow"><strong>${esc(u.name)}</strong><div class="chips"><span class="chip static">${esc(u.type)}</span>${u.capacity ? `<span class="chip green static">${esc(String(u.capacity).replace('.', ','))} L</span>` : '<span class="chip static">Capacidad: por confirmar</span>'}</div>${u.notes ? `<p class="muted small">${esc(u.notes)}</p>` : ''}</div><button class="btn small secondary" data-act="editUtensil" data-id="${esc(u.id)}">Editar</button></div></div>`).join('') : emptyState('🍳', 'Aún no has añadido utensilios.')}
      <h2 class="serif">Ajustes</h2>
      <label class="checkline card"><input type="checkbox" data-change="breakfast" ${state.settings.showBreakfast ? 'checked' : ''}> Incluir desayunos en el menú</label>
      <h2 class="serif">Copia de seguridad</h2>
      <div class="card"><p class="muted">Tus datos están solo en este móvil. Última copia: <strong>${last}</strong>. Haz una copia cada semana y compártela para poder recuperarla si cambias de móvil.</p>
        <div class="row wrap"><button class="btn small" data-act="shareBackup">Compartir copia</button><button class="btn small secondary" data-act="copyBackup">Copiar al portapapeles</button><button class="btn small secondary" data-act="exportBackup">Descargar archivo</button></div>
        <div class="row wrap" style="margin-top:.6rem"><button class="btn small ghost" data-act="openImport">Importar datos</button><button class="btn small danger" data-act="wipe">Borrar todo</button></div></div>
      <p class="muted small">¿Qué comemos hoy? v${APP_VERSION}. Para instalarla: menú ⋮ del navegador → «Instalar aplicación».</p>`;
  }
  function openUtensilSheet(id) {
    const u = id ? state.utensils.find((x) => x.id === id) : { name: '', type: 'Otro', capacity: '', notes: '' };
    openSheet(`<h3>${id ? 'Editar utensilio' : 'Nuevo utensilio'}</h3>
      <label for="u-name">Nombre</label><input type="text" id="u-name" value="${esc(u.name)}" placeholder="Olla de hierro fundido">
      <label for="u-type">Tipo</label><select id="u-type">${UTENSIL_TYPES.map((t) => `<option ${t === u.type ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select>
      <label for="u-cap">Capacidad en litros (opcional)</label><input type="number" step="0.1" min="0" id="u-cap" value="${esc(u.capacity == null ? '' : u.capacity)}">
      <label for="u-notes">Notas (diámetro, inducción, apta para horno…)</label><textarea id="u-notes" rows="3">${esc(u.notes)}</textarea>
      <div class="btn-row">${id ? '<button class="btn danger" data-act="delUtensil" data-id="' + esc(id) + '">Eliminar</button>' : ''}<button class="btn ghost" data-act="closeSheet">Cancelar</button><button class="btn" data-act="saveUtensil" data-id="${esc(id || '')}">Guardar</button></div>`);
  }

  /* ---------- copia de seguridad ---------- */
  function exportObject() {
    return { app: 'que-comemos-hoy', version: 1, exportedAt: new Date().toISOString(), recipes: state.recipes, utensils: state.utensils, menu: state.menu, log: state.log, settings: { showBreakfast: state.settings.showBreakfast } };
  }
  function markBackup() { state.settings.lastBackup = new Date().toISOString(); save(); if (currentRoute().name === 'cocina' || currentRoute().name === 'inicio') render(); }
  const backupName = () => `que-comemos-hoy-${dateKey()}.json`;
  function exportBackup() {
    const blob = new Blob([JSON.stringify(exportObject(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = backupName();
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 3000);
    markBackup(); toast('Copia descargada');
  }
  async function copyBackup() {
    const text = JSON.stringify(exportObject(), null, 2);
    try { await navigator.clipboard.writeText(text); markBackup(); toast('Copia en el portapapeles: pégala en el chat'); }
    catch (e) { openSheet(`<h3>Copia de seguridad</h3><p class="muted">No he podido copiarla automáticamente. Selecciona todo el texto y cópialo.</p><textarea rows="10" readonly>${esc(text)}</textarea><div class="btn-row"><button class="btn" data-act="closeSheet">Cerrar</button></div>`); }
  }
  async function shareBackup() {
    const text = JSON.stringify(exportObject(), null, 2);
    try {
      const file = new File([text], backupName(), { type: 'application/json' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: '¿Qué comemos hoy? — copia de seguridad' });
        markBackup(); toast('Copia compartida'); return;
      }
    } catch (e) { if (e && e.name === 'AbortError') return; }
    copyBackup();
  }
  function openImport() {
    openSheet(`<h3>Importar datos</h3>
      <p class="muted">Pega aquí el texto de la copia (JSON) o elige un archivo.</p>
      <textarea id="importText" rows="8" aria-label="Texto de importación"></textarea>
      <div class="row wrap" style="margin-top:.5rem"><button class="btn small ghost" data-act="pasteClip">Pegar del portapapeles</button><input type="file" id="importFile" accept=".json,application/json" class="grow"></div>
      <label class="checkline"><input type="radio" name="imode" value="merge" checked> Combinar con lo que ya tengo (las recetas con el mismo identificador se actualizan)</label>
      <label class="checkline"><input type="radio" name="imode" value="replace"> Reemplazar todo</label>
      <div class="btn-row"><button class="btn ghost" data-act="closeSheet">Cancelar</button><button class="btn" data-act="doImport">Importar</button></div>`);
    const f = $('#importFile');
    if (f) f.addEventListener('change', () => { const file = f.files[0]; if (!file) return; const rd = new FileReader(); rd.onload = () => { $('#importText').value = String(rd.result); }; rd.readAsText(file); });
  }
  function doImport() {
    const text = ($('#importText').value || '').trim();
    if (!text) { toast('Pega primero el texto o elige un archivo'); return; }
    let obj;
    try { obj = JSON.parse(text); } catch (e) { toast('El texto no es un JSON válido'); return; }
    if (Array.isArray(obj)) obj = { recipes: obj };
    if (!obj || typeof obj !== 'object' || (!obj.recipes && !obj.utensils && !obj.menu && !obj.log)) { toast('No encuentro recetas, utensilios ni menús en ese texto'); return; }
    let recipes, utensils, menu, log;
    try {
      recipes = (obj.recipes || []).map(normRecipe);
      utensils = (obj.utensils || []).map(normUtensil);
      menu = normMenu(obj.menu);
      log = (Array.isArray(obj.log) ? obj.log : []).map(normLog).filter(Boolean);
    } catch (e) { toast(e.message || 'Formato no válido'); return; }
    const replace = ($('input[name=imode]:checked') || {}).value === 'replace';
    if (replace) { state.recipes = []; state.utensils = []; state.menu = {}; state.log = []; }
    for (const r of recipes) { const i = state.recipes.findIndex((x) => x.id === r.id); if (i >= 0) state.recipes[i] = r; else state.recipes.push(r); }
    for (const u of utensils) { const i = state.utensils.findIndex((x) => x.id === u.id); if (i >= 0) state.utensils[i] = u; else state.utensils.push(u); }
    for (const [day, slots] of Object.entries(menu)) state.menu[day] = { ...(state.menu[day] || {}), ...slots };
    for (const l of log) if (!state.log.some((x) => x.id === l.id)) state.log.push(l);
    if (obj.settings && typeof obj.settings.showBreakfast === 'boolean') state.settings.showBreakfast = obj.settings.showBreakfast;
    save(); closeSheet(); render();
    toast(`Importado: ${[recipes.length && plural(recipes.length, 'receta', 'recetas'), utensils.length && plural(utensils.length, 'utensilio', 'utensilios'), Object.keys(menu).length && plural(Object.keys(menu).length, 'día de menú', 'días de menú')].filter(Boolean).join(', ') || 'sin cambios'}`);
  }

  /* ---------- registro de comidas ---------- */
  function logCook(recipeId, servings) {
    const r = getRecipe(recipeId);
    const entry = { id: uid('l'), recipeId, name: r ? r.name : 'Receta', date: dateKey(), servings: servings || (r ? r.servings : null), rating: 0 };
    state.log.push(entry);
    if (r) r.lastCooked = entry.date;
    save();
    return entry;
  }
  function openRateSheet(entry) {
    ui.rating = entry.id;
    const n = state.log.filter((l) => l.recipeId === entry.recipeId).length;
    openSheet(`<h3>¡Receta finalizada!</h3><p class="muted">Anotada. Ya la has cocinado ${plural(n, 'vez', 'veces')}. ¿Qué tal ha salido?</p>
      <div class="row" style="justify-content:center">${[1, 2, 3, 4, 5].map((v) => `<button data-act="rateDone" data-v="${v}" aria-label="${v} estrellas" style="background:none;border:0;font-size:2.2rem;color:#d9a43b;cursor:pointer">☆</button>`).join('')}</div>
      <div class="btn-row"><button class="btn ghost" data-act="closeSheet">Saltar</button></div>`);
  }

  /* ---------- vistas: guía Thermomix ---------- */
  function viewGuide() {
    const P = (t, d) => `<div class="slot"><span class="lbl" style="width:6.5rem"><strong>${t}</strong></span><span class="val">${d}</span></div>`;
    return `<p class="muted">Para cocinar a mano en la Thermomix sin saber nada. Los dibujos son de esta app, parecidos a los botones de la pantalla de la Thermomix (no son los símbolos oficiales): sirven para reconocer cada modo por su nombre. Ante cualquier duda, manda el manual de tu modelo.</p>
      <div class="card"><h3>Cómo leer los parámetros</h3>
        ${P('Modo', 'Se elige en la pantalla. Prepara la Thermomix para un tipo de tarea (amasar, triturar, cocinar al vapor…).')}
        ${P('Tiempo', 'Cuánto debe funcionar. Por ejemplo «20 s» son veinte segundos y «6 min», seis minutos.')}
        ${P('Temperatura', 'Grados centígrados. «Varoma» significa cocción al vapor.')}
        ${P('Velocidad', 'De 1 a 10. La 1 es muy suave y la 10 muy fuerte. «Cuchara» es la más suave, para remover sin triturar.')}
        ${P('Giro inverso', 'Símbolo ↺. Las cuchillas giran al revés: mezclan sin cortar, para no deshacer los ingredientes.')}
        ${P('Cubilete', 'La tapa pequeña del centro de la tapa del vaso. Suele ir puesto.')}
        ${P('Cestillo', 'Para escurrir o cocer al vapor dentro del vaso.')}
        ${P('Varoma', 'Recipiente que se coloca encima del vaso para cocinar al vapor.')}
        ${P('Mariposa', 'Para montar o mezclar suave. En general no se sube de velocidad 4 con ella: mira el manual de tu modelo.')}
      </div>
      <div class="card"><h3>Los modos de la TM7</h3>
        ${MODES.map((m) => `<div class="slot" style="align-items:center"><span class="tm-circ" style="width:3rem;height:3rem;flex:none">${tmIcon(m.ic)}</span><span class="val"><strong>${esc(m.name)}</strong><div class="muted small">${esc(m.tip)}</div></span></div>`).join('')}
      </div>`;
  }

  /* ---------- vistas: estadísticas ---------- */
  function barRows(items) {
    const max = Math.max(...items.map((i) => i[1]), 1);
    return items.map(([l, n]) => `<div class="bar-row"><span class="bar-l">${esc(l)}</span><div class="bar"><div style="width:${(n / max) * 100}%"></div></div><span class="bar-n">${n}</span></div>`).join('');
  }
  function viewStats() {
    if (!state.log.length) return emptyState('📊', 'Todavía no hay comidas registradas. Cuando termines una receta en el modo cocina, o pulses «Cocinada hoy», aparecerá aquí.');
    const log = state.log.slice().sort((a, b) => b.date.localeCompare(a.date));
    const now = new Date(), today = dateKey(now), weekAgo = dateKey(addDays(now, -6)), monthPrefix = today.slice(0, 7);
    const week = log.filter((l) => l.date >= weekAgo).length, month = log.filter((l) => l.date.startsWith(monthPrefix)).length;
    const byRecipe = {};
    for (const l of log) { const k = l.recipeId || l.name; byRecipe[k] = byRecipe[k] || { name: l.name, n: 0, id: l.recipeId }; byRecipe[k].n++; byRecipe[k].name = (getRecipe(l.recipeId) || {}).name || l.name; }
    const top = Object.values(byRecipe).sort((a, b) => b.n - a.n).slice(0, 5);
    const tagCount = {}, equipCount = {};
    for (const l of log) { const r = getRecipe(l.recipeId); if (!r) continue; r.tags.forEach((t) => { tagCount[t] = (tagCount[t] || 0) + 1; }); r.equipment.forEach((e) => { equipCount[e] = (equipCount[e] || 0) + 1; }); }
    const months = [];
    for (let i = 5; i >= 0; i--) { const d = new Date(now.getFullYear(), now.getMonth() - i, 1); const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`; months.push([cap1(d.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '')), log.filter((l) => l.date.startsWith(key)).length]); }
    const sortedPairs = (o) => Object.entries(o).sort((a, b) => b[1] - a[1]);
    const best = state.recipes.filter((r) => r.rating >= 4).sort((a, b) => b.rating - a.rating).slice(0, 5);
    return `
      <div class="card"><div class="grid3" style="text-align:center">
        <div><div class="serif" style="font-size:1.8rem">${log.length}</div><div class="muted small">en total</div></div>
        <div><div class="serif" style="font-size:1.8rem">${week}</div><div class="muted small">últimos 7 días</div></div>
        <div><div class="serif" style="font-size:1.8rem">${month}</div><div class="muted small">este mes</div></div></div>
        <p class="muted small" style="text-align:center">${plural(new Set(log.map((l) => l.recipeId || l.name)).size, 'receta distinta', 'recetas distintas')}</p></div>
      <div class="card"><h3>Por mes</h3>${barRows(months)}</div>
      <div class="card"><h3>Las que más repites</h3>${barRows(top.map((t) => [t.name, t.n]))}</div>
      ${sortedPairs(tagCount).length ? `<div class="card"><h3>Por tipo de plato</h3>${barRows(sortedPairs(tagCount))}</div>` : ''}
      ${sortedPairs(equipCount).length ? `<div class="card"><h3>Por aparato</h3>${barRows(sortedPairs(equipCount))}</div>` : ''}
      ${best.length ? `<div class="card"><h3>Mejor valoradas</h3>${best.map((r) => `<div class="slot"><span class="val"><a href="#receta/${esc(r.id)}">${esc(r.name)}</a></span><span>${stars(r.rating)}</span></div>`).join('')}</div>` : ''}
      <div class="card"><h3>Últimas cocinadas</h3>${log.slice(0, 12).map((l) => `<div class="slot"><span class="lbl">${esc(fmtAgo(l.date))}</span><span class="val">${getRecipe(l.recipeId) ? `<a href="#receta/${esc(l.recipeId)}">${esc(getRecipe(l.recipeId).name)}</a>` : esc(l.name)}</span></div>`).join('')}</div>`;
  }

  /* ---------- temporizadores y modo cocina ---------- */
  let timers = {};
  try { timers = JSON.parse(localStorage.getItem(TIMERS_KEY) || '{}') || {}; } catch (e) { timers = {}; }
  const saveTimers = () => { try { localStorage.setItem(TIMERS_KEY, JSON.stringify(timers)); } catch (e) { /* sin almacenamiento */ } };
  const cook = { id: null, i: 0, factor: 1, ing: false };
  let wakeLock = null, audioCtx = null, ticker = null;

  async function lockScreen() { try { if ('wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen'); } catch (e) { wakeLock = null; } }
  function unlockScreen() { try { if (wakeLock) wakeLock.release(); } catch (e) { /* nada */ } wakeLock = null; }
  function unlockAudio() {
    try { const AC = window.AudioContext || window.webkitAudioContext; if (AC && !audioCtx) audioCtx = new AC(); if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume(); } catch (e) { /* sin audio */ }
  }
  function ring() {
    try { if (navigator.vibrate) navigator.vibrate([500, 250, 500, 250, 500]); } catch (e) { /* nada */ }
    try {
      if (!audioCtx) return;
      for (let n = 0; n < 6; n++) {
        const o = audioCtx.createOscillator(), g = audioCtx.createGain(), t0 = audioCtx.currentTime + n * 0.9;
        o.type = 'sine'; o.frequency.value = 880; g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.4, t0 + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.6);
        o.connect(g); g.connect(audioCtx.destination); o.start(t0); o.stop(t0 + 0.65);
      }
    } catch (e) { /* sin audio */ }
  }
  function notify(label) {
    try {
      if ('Notification' in window && Notification.permission === 'granted' && navigator.serviceWorker) {
        navigator.serviceWorker.ready.then((reg) => reg.showNotification('⏲ ¡Tiempo!', { body: label, tag: 'qch-timer', vibrate: [300, 150, 300] }));
      }
    } catch (e) { /* sin notificaciones */ }
  }
  function ensureTicker() { if (!ticker) ticker = setInterval(tick, 1000); }
  function tick() {
    const now = Date.now();
    let changed = false;
    for (const [k, t] of Object.entries(timers)) {
      if (t.done) continue;
      const left = Math.ceil((t.end - now) / 1000);
      if (left <= 0) { t.done = true; changed = true; ring(); notify(t.label); toast(`⏲ ¡Tiempo! ${t.label}`); }
      else $$(`[data-digits="${CSS.escape(k)}"]`).forEach((el) => { el.textContent = fmtClock(left); });
    }
    if (changed) { saveTimers(); if (!$('#cookmode').hidden) renderCook(); if (currentRoute().name === 'inicio') render(); }
    if (!Object.values(timers).some((t) => !t.done)) { clearInterval(ticker); ticker = null; }
  }
  const timerKey = (id, i) => `${id}:${i}`;

  function startCook(id) {
    const r = getRecipe(id);
    if (!r || !r.steps.length) { toast('Esta receta no tiene pasos'); return; }
    cook.id = id; cook.i = 0; cook.factor = currentServings(r) / r.servings; cook.ing = false;
    $('#cookmode').hidden = false; document.body.style.overflow = 'hidden';
    unlockAudio(); lockScreen(); renderCook();
  }
  function closeCook() {
    $('#cookmode').hidden = true; document.body.style.overflow = '';
    unlockScreen(); cook.id = null;
    render();
  }
  function renderCook() {
    const r = getRecipe(cook.id);
    if (!r) { closeCook(); return; }
    const s = r.steps[cook.i], last = cook.i === r.steps.length - 1, key = timerKey(r.id, cook.i), t = timers[key];
    let timerHtml = '';
    if (s.timer) {
      if (t && t.done) timerHtml = `<div class="timer-box done"><div>¡Tiempo cumplido!</div><div class="digits">00:00</div><button class="btn block" data-act="timerStop" data-key="${esc(key)}">Parar alarma</button></div>`;
      else if (t) timerHtml = `<div class="timer-box"><div class="muted">Temporizador en marcha</div><div class="digits" data-digits="${esc(key)}">${fmtClock((t.end - Date.now()) / 1000)}</div><button class="btn block" data-act="clockTimer" data-key="${esc(key)}">⏰ Avisar también con el reloj del móvil</button><div class="row" style="margin-top:.5rem"><button class="btn secondary grow" data-act="timerAdd" data-key="${esc(key)}">+5 min</button><button class="btn danger grow" data-act="timerStop" data-key="${esc(key)}">Cancelar</button></div></div>`;
      else timerHtml = `<div class="timer-box"><div class="muted">Temporizador</div><div class="digits">${fmtClock(s.timer.seconds)}</div><button class="btn block" data-act="timerStart" data-key="${esc(key)}" data-sec="${s.timer.seconds}" data-label="${esc(r.name + ' · paso ' + (cook.i + 1))}" data-rid="${esc(r.id)}">▶ Iniciar ${esc(fmtDuration(s.timer.seconds))}</button></div>`;
    }
    const others = Object.entries(timers).filter(([k, x]) => k.startsWith(r.id + ':') && k !== key && !x.done);
    $('#cookmode').innerHTML = `
      <div class="cook-top"><button class="icon-btn" data-act="closeCook" aria-label="Salir del modo cocina">✕</button><div class="name">${esc(r.name)}</div><button class="btn small secondary" data-act="toggleIng">${cook.ing ? 'Ocultar' : 'Ingredientes'}</button></div>
      <div class="cook-progress"><div style="width:${((cook.i + 1) / r.steps.length) * 100}%"></div></div>
      <div class="cook-body">
        <div class="stepno">Paso ${cook.i + 1} de ${r.steps.length}</div>
        ${others.length ? `<div class="chips">${others.map(([k, x]) => `<span class="chip static">⏲ ${esc(x.label.split('· ')[1] || '')}: <strong data-digits="${esc(k)}">${fmtClock((x.end - Date.now()) / 1000)}</strong></span>`).join('')}</div>` : ''}
        ${cook.ing ? `<div class="ing-panel"><ul class="ing-list">${r.ingredients.map((i) => ingHtml(i, cook.factor)).join('')}</ul></div>` : ''}
        <div class="text">${esc(s.text)}</div>
        ${tmChips(s.tm)}${s.tm ? helpBtn(r.id, cook.i) : ''}
        ${s.hint ? `<div class="hint" style="font-size:1.1rem">👀 ${esc(s.hint)}</div>` : ''}
        ${timerHtml}
      </div>
      <div class="cook-nav"><button class="btn ghost" data-act="cookPrev" ${cook.i === 0 ? 'disabled' : ''}>‹ Atrás</button><button class="btn" data-act="${last ? 'cookFinish' : 'cookNext'}">${last ? 'Terminar ✓' : 'Siguiente ›'}</button></div>`;
  }

  /* ---------- acciones (delegación de eventos) ---------- */
  const actions = {
    back() { const { name, arg } = currentRoute(); go(name === 'estadisticas' || name === 'guia' ? '#cocina' : name === 'editar' && arg !== 'nuevo' ? `#receta/${arg}` : '#recetas'); },
    filterTag(el) { ui.tag = ui.tag === el.dataset.v ? '' : el.dataset.v; render(); },
    filterEquip(el) { ui.equip = ui.equip === el.dataset.v ? '' : el.dataset.v; render(); },
    servInc(el) { const r = getRecipe(el.dataset.id); ui.servings[r.id] = Math.min(60, currentServings(r) + 1); render(); },
    servDec(el) { const r = getRecipe(el.dataset.id); ui.servings[r.id] = Math.max(1, currentServings(r) - 1); render(); },
    rate(el) { const r = getRecipe(el.dataset.id), v = Number(el.dataset.v); r.rating = r.rating === v ? 0 : v; save(); render(); },
    cookedToday(el) { const e = logCook(el.dataset.id); render(); toast('Anotada como cocinada hoy'); if (e) openRateSheet(e); },
    rateDone(el) { const l = state.log.find((x) => x.id === ui.rating), v = Number(el.dataset.v); if (l) { l.rating = v; const r = getRecipe(l.recipeId); if (r) r.rating = v; save(); } closeSheet(); render(); toast('¡Valoración guardada!'); },
    editNotes(el) { const r = getRecipe(el.dataset.id); openSheet(`<h3>Notas de ${esc(r.name)}</h3><textarea id="notesText" rows="7">${esc(r.notes)}</textarea><div class="btn-row"><button class="btn ghost" data-act="closeSheet">Cancelar</button><button class="btn" data-act="saveNotes" data-id="${esc(r.id)}">Guardar</button></div>`); },
    saveNotes(el) { getRecipe(el.dataset.id).notes = $('#notesText').value.trim(); save(); closeSheet(); render(); },
    async deleteRecipe(el) {
      const r = getRecipe(el.dataset.id);
      if (await confirmDialog(`¿Eliminar «${r.name}»? No se puede deshacer.`, 'Eliminar', true)) {
        state.recipes = state.recipes.filter((x) => x.id !== r.id);
        for (const d of Object.keys(state.menu)) for (const s of Object.keys(state.menu[d])) if (state.menu[d][s].recipeId === r.id) delete state.menu[d][s];
        save(); closeSheet(); go('#recetas'); toast('Receta eliminada');
      }
    },
    confirmYes() { const f = ui.confirm; ui.confirm = null; closeSheet(); if (f) f(true); },
    confirmNo() { const f = ui.confirm; ui.confirm = null; closeSheet(); if (f) f(false); },
    closeSheet() { closeSheet(); },
    /* editor */
    stepAdd() { syncDraft(); ui.draft.steps.push({ text: '', mode: '', time: '', temp: '', speed: '', reverse: false, timerMin: '', hint: '' }); render(); },
    stepDel(el) { syncDraft(); ui.draft.steps.splice(Number(el.dataset.i), 1); if (!ui.draft.steps.length) ui.draft.steps.push({ text: '', mode: '', time: '', temp: '', speed: '', reverse: false, timerMin: '', hint: '' }); render(); },
    stepUp(el) { syncDraft(); const i = Number(el.dataset.i), a = ui.draft.steps; [a[i - 1], a[i]] = [a[i], a[i - 1]]; render(); },
    stepDown(el) { syncDraft(); const i = Number(el.dataset.i), a = ui.draft.steps; [a[i + 1], a[i]] = [a[i], a[i + 1]]; render(); },
    cancelEdit() { const d = ui.draft; ui.draft = null; go(d && d.id ? `#receta/${d.id}` : '#recetas'); },
    saveRecipe() {
      syncDraft();
      const d = ui.draft;
      if (!String(d.name).trim()) { toast('Ponle un nombre a la receta'); return; }
      const base = d.id ? getRecipe(d.id) : null;
      const r = draftToRecipe(d, base);
      const i = state.recipes.findIndex((x) => x.id === r.id);
      if (i >= 0) state.recipes[i] = r; else state.recipes.push(r);
      ui.draft = null; save(); go(`#receta/${r.id}`); toast('Receta guardada');
    },
    /* menú */
    weekPrev() { ui.weekOffset--; render(); },
    weekNext() { ui.weekOffset++; render(); },
    weekToday() { ui.weekOffset = 0; render(); },
    pickSlot(el) { openPicker(el.dataset.date, el.dataset.slot); },
    pickRecipe(el) {
      const p = ui.picker;
      if (p.add) { setSlot(p.date = ($('#addDate') || {}).value || p.date, ($('#addSlot') || {}).value || p.slot, { recipeId: el.dataset.id }); }
      else setSlot(p.date, p.slot, { recipeId: el.dataset.id });
      closeSheet(); render(); toast('Menú actualizado');
    },
    pickText() { const v = ($('#freeText').value || '').trim(); if (!v) { toast('Escribe algo primero'); return; } setSlot(ui.picker.date, ui.picker.slot, { text: v }); closeSheet(); render(); },
    pickClear() { setSlot(ui.picker.date, ui.picker.slot, null); closeSheet(); render(); },
    addToMenu(el) {
      const r = getRecipe(el.dataset.id);
      openSheet(`<h3>Añadir «${esc(r.name)}» al menú</h3><label for="addDate">Día</label><input type="date" id="addDate" value="${dateKey()}"><label for="addSlot">Comida</label><select id="addSlot">${slotList().map((s) => `<option value="${s}" ${s === 'comida' ? 'selected' : ''}>${SLOT_LABELS[s]}</option>`).join('')}</select><div class="btn-row"><button class="btn ghost" data-act="closeSheet">Cancelar</button><button class="btn" data-act="confirmAdd" data-id="${esc(r.id)}">Añadir</button></div>`);
    },
    confirmAdd(el) { const date = $('#addDate').value || dateKey(); setSlot(date, $('#addSlot').value, { recipeId: el.dataset.id }); closeSheet(); toast('Añadida al menú'); render(); },
    /* cocina */
    addUtensil() { openUtensilSheet(null); },
    editUtensil(el) { openUtensilSheet(el.dataset.id); },
    saveUtensil(el) {
      const name = $('#u-name').value.trim();
      if (!name) { toast('Ponle un nombre'); return; }
      const u = normUtensil({ id: el.dataset.id || undefined, name, type: $('#u-type').value, capacity: $('#u-cap').value, notes: $('#u-notes').value.trim() });
      const i = state.utensils.findIndex((x) => x.id === u.id);
      if (i >= 0) state.utensils[i] = u; else state.utensils.push(u);
      save(); closeSheet(); render();
    },
    async delUtensil(el) { if (await confirmDialog('¿Eliminar este utensilio?', 'Eliminar', true)) { state.utensils = state.utensils.filter((x) => x.id !== el.dataset.id); save(); closeSheet(); render(); } },
    exportBackup() { exportBackup(); },
    copyBackup() { copyBackup(); },
    shareBackup() { shareBackup(); },
    openImport() { openImport(); },
    doImport() { doImport(); },
    async pasteClip() { try { $('#importText').value = await navigator.clipboard.readText(); } catch (e) { toast('No puedo leer el portapapeles: pega el texto a mano'); } },
    async wipe() { if (await confirmDialog('¿Borrar TODAS las recetas, utensilios y menús de este móvil? Haz antes una copia.', 'Borrar todo', true)) { const created = state.settings.created; state = defaultState(); state.settings.created = created; save(); render(); toast('Todo borrado'); } },
    /* modo cocina */
    openGuide() { closeSheet(); if (!$('#cookmode').hidden) closeCook(); go('#guia'); },
    tmHelp(el) {
      const r = getRecipe(el.dataset.r), st = r && r.steps[Number(el.dataset.i)];
      if (!st || !st.tm) return;
      openSheet(`<h3>Cómo se hace en la Thermomix</h3><p class="muted">${esc(st.text)}</p>${tmChips(st.tm)}<ol class="steps">${tmHowTo(st.tm).map((t) => `<li>${esc(t)}</li>`).join('')}</ol>${st.tm.mode && findMode(st.tm.mode) ? `<div class="hint">💡 ${esc(findMode(st.tm.mode).tip)}</div>` : ''}<p class="muted small">Si la receta dice algo distinto, sigue siempre lo de la receta.</p><div class="btn-row"><button class="btn ghost" data-act="openGuide">Guía completa</button><button class="btn" data-act="closeSheet">Entendido</button></div>`);
    },
    startCook(el) { startCook(el.dataset.id); },
    closeCook() { closeCook(); },
    toggleIng() { cook.ing = !cook.ing; renderCook(); },
    cookPrev() { if (cook.i > 0) { cook.i--; renderCook(); $('.cook-body').scrollTop = 0; } },
    cookNext() { const r = getRecipe(cook.id); if (cook.i < r.steps.length - 1) { cook.i++; renderCook(); $('.cook-body').scrollTop = 0; } },
    async cookFinish() {
      const id = cook.id, r = getRecipe(id), servings = Math.round(cook.factor * r.servings * 100) / 100;
      closeCook();
      if (await confirmDialog('¿Has finalizado la receta?', 'Sí, finalizada', false, 'Todavía no')) { const e = logCook(id, servings); render(); openRateSheet(e); }
    },
    clockTimer(el) {
      const t = timers[el.dataset.key]; if (!t) return;
      const sec = Math.max(1, Math.round((t.end - Date.now()) / 1000));
      const msg = encodeURIComponent((t.label || 'Temporizador').replace(/;/g, ','));
      location.href = 'intent:#Intent;action=android.intent.action.SET_TIMER;i.android.intent.extra.alarm.LENGTH=' + sec + ';S.android.intent.extra.alarm.MESSAGE=' + msg + ';end';
    },
    timerStart(el) {
      unlockAudio();
      try { if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission(); } catch (e) { /* nada */ }
      timers[el.dataset.key] = { end: Date.now() + Number(el.dataset.sec) * 1000, total: Number(el.dataset.sec), done: false, label: el.dataset.label, recipeId: el.dataset.rid };
      saveTimers(); ensureTicker(); renderCook();
    },
    timerAdd(el) { const t = timers[el.dataset.key]; if (t) { t.end += 300000; saveTimers(); renderCook(); } },
    timerStop(el) { delete timers[el.dataset.key]; saveTimers(); renderCook(); }
  };

  document.addEventListener('click', (e) => {
    if (e.target.id === 'overlay') { if (ui.confirm) actions.confirmNo(); else closeSheet(); return; }
    const t = e.target.closest('[data-act]');
    if (t && actions[t.dataset.act]) { e.preventDefault(); actions[t.dataset.act](t, e); }
  });
  document.addEventListener('input', (e) => {
    const k = e.target.dataset && e.target.dataset.input;
    if (k === 'search') { ui.q = e.target.value; const l = $('#recipeList'); if (l) l.innerHTML = recipeListHtml(); }
    else if (k === 'pickerSearch' && ui.picker) { ui.picker.q = e.target.value; const l = $('#pickList'); if (l) l.innerHTML = pickerHtml(); }
  });
  document.addEventListener('change', (e) => {
    if (e.target.dataset && e.target.dataset.change === 'breakfast') { state.settings.showBreakfast = e.target.checked; save(); }
  });
  window.addEventListener('hashchange', () => { if (!$('#cookmode').hidden) closeCook(); render(); });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') { if (!$('#cookmode').hidden) lockScreen(); tick(); }
  });

  /* ---------- arranque ---------- */
  function init() {
    try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) { /* nada */ }
    save();
    if (Object.values(timers).some((t) => !t.done)) { ensureTicker(); tick(); }
    render();
    if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
      navigator.serviceWorker.register('sw.js').catch(() => { /* sin service worker */ });
    }
  }
  init();
})();
