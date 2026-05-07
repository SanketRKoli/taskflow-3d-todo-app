/* =====================================================
   app.js — Taskflow Main App Logic
   Session-only auth. Tasks in localStorage per user.
   Features:
     ✦ Auth guard (session)
     ✦ Add task — spin-in 3D animation
     ✦ Click to select
     ✦ ✔ Complete — grass grows + flowers bloom
     ✦ ✏️ Edit modal
     ✦ 🗑 5-sec bomb countdown
     ✦ Tap bomb to cancel
     ✦ 💥 Canvas particle explosion on delete
     ✦ Filter: All / Pending / Done / High
     ✦ Live search
     ✦ Priority (High / Normal / Low) + Due date
     ✦ Dark / Light theme toggle
     ✦ Stats bar
   ===================================================== */

'use strict';

/* ═══════════════════════════════════════════════
   1. AUTH GUARD
═══════════════════════════════════════════════ */
const _session = sessionStorage.getItem('tf_session');
if (!_session) {
  window.location.href = 'index.html';
}

const currentUser = JSON.parse(_session);          // { username, name }
const STORAGE_KEY  = `tf_tasks_${currentUser.username}`;

/* ═══════════════════════════════════════════════
   2. THEME
═══════════════════════════════════════════════ */
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  document.getElementById('themeBtn').textContent = t === 'dark' ? '🌙' : '☀️';
  localStorage.setItem('tf_theme', t);
}

window.toggleTheme = function () {
  const cur = document.documentElement.getAttribute('data-theme') || 'dark';
  applyTheme(cur === 'dark' ? 'light' : 'dark');
};

applyTheme(localStorage.getItem('tf_theme') || 'dark');

/* ═══════════════════════════════════════════════
   3. STATE
═══════════════════════════════════════════════ */
let tasks      = [];     /* Array<{ id, text, done, priority, due, createdAt }> */
let selectedId = null;   /* Currently selected task id */
let filterMode = 'all';  /* 'all' | 'pending' | 'done' | 'high' */
let editingId  = null;   /* Task id being edited */
let bombTimers = {};     /* { [taskId]: { remaining, interval, cancelled } } */

/* ═══════════════════════════════════════════════
   4. STORAGE
═══════════════════════════════════════════════ */
function loadTasks() {
  try { tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { tasks = []; }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/* ═══════════════════════════════════════════════
   5. GREETING
═══════════════════════════════════════════════ */
document.getElementById('greeting').textContent =
  `Hi, ${currentUser.name.split(' ')[0]} 👋`;

/* ═══════════════════════════════════════════════
   6. LOGOUT
═══════════════════════════════════════════════ */
window.logout = function () {
  /* Cancel all bomb timers */
  Object.values(bombTimers).forEach(t => clearInterval(t.interval));
  sessionStorage.removeItem('tf_session');
  window.location.href = 'index.html';
};

/* ═══════════════════════════════════════════════
   7. FILTER
═══════════════════════════════════════════════ */
window.setFilter = function (mode) {
  filterMode = mode;
  document.querySelectorAll('.f-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.f === mode);
  });
  renderTasks();
};

function getFiltered() {
  const q = (document.getElementById('searchInput').value || '').toLowerCase().trim();
  return tasks.filter(t => {
    const matchQ = !q || t.text.toLowerCase().includes(q);
    let   matchF = true;
    if (filterMode === 'pending') matchF = !t.done;
    if (filterMode === 'done')    matchF =  t.done;
    if (filterMode === 'high')    matchF =  t.priority === 'high';
    return matchQ && matchF;
  });
}

/* ═══════════════════════════════════════════════
   8. STATS
═══════════════════════════════════════════════ */
function updateStats() {
  document.getElementById('stTotal')  .textContent = tasks.length;
  document.getElementById('stPending').textContent = tasks.filter(t => !t.done).length;
  document.getElementById('stDone')   .textContent = tasks.filter(t =>  t.done).length;
  document.getElementById('stHigh')   .textContent = tasks.filter(t =>  t.priority === 'high').length;
}

/* ═══════════════════════════════════════════════
   9. GRADIENT PALETTE
═══════════════════════════════════════════════ */
const GRADS = [
  'linear-gradient(135deg,#a78bfa,#f472b6)',
  'linear-gradient(135deg,#38bdf8,#6366f1)',
  'linear-gradient(135deg,#fb923c,#f472b6)',
  'linear-gradient(135deg,#34d399,#38bdf8)',
  'linear-gradient(135deg,#fbbf24,#fb923c)',
  'linear-gradient(135deg,#e879f9,#a78bfa)',
  'linear-gradient(135deg,#22d3ee,#34d399)',
];
const getGrad = i => GRADS[i % GRADS.length];

/* ═══════════════════════════════════════════════
   10. RENDER
═══════════════════════════════════════════════ */
function renderTasks() {
  updateStats();

  const list    = document.getElementById('taskList');
  const visible = getFiltered();

  /* Keep pending tasks at top, done at bottom */
  const pending = visible.filter(t => !t.done);
  const done    = visible.filter(t =>  t.done);
  const ordered = [...pending, ...done];

  if (ordered.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">🌿</span>
        <p>No tasks here — add one above!</p>
      </div>`;
    return;
  }

  list.innerHTML = '';
  ordered.forEach((task, i) => {
    list.appendChild(buildCard(task, i));
  });
}

/* ─────────────────────────────────────────────
   Build a single task card DOM element
───────────────────────────────────────────── */
function buildCard(task, idx) {
  const card = document.createElement('div');
  card.className  = 'task-card'
    + (task.done          ? ' done'     : '')
    + (task.id===selectedId ? ' selected' : '');
  card.dataset.id  = task.id;
  card.dataset.pri = task.priority || 'normal';
  card.style.animationDelay = `${idx * 0.045}s`;

  /* Dot gradient: green checkmark if done */
  const dotBg  = task.done ? 'linear-gradient(135deg,#34d399,#22c55e)' : getGrad(idx);
  const dotTxt = task.done ? '✓' : (idx + 1);

  /* Due date badge */
  let dueBadge = '';
  if (task.due) {
    const today   = new Date(); today.setHours(0,0,0,0);
    const dueDate = new Date(task.due + 'T00:00:00');
    const over    = dueDate < today;
    const fmt     = dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    dueBadge = `<span class="due-badge ${over ? 'over' : ''}">📅 ${fmt}${over ? ' ⚠️' : ''}</span>`;
  }

  /* Priority badge */
  const priMap = { high: '🔴 High', normal: '📌 Normal', low: '🟢 Low' };
  const priKey = task.priority || 'normal';
  const priBadge = `<span class="pri-badge ${priKey}">${priMap[priKey]}</span>`;

  card.innerHTML = `
    <div class="task-dot" style="background:${dotBg}">${dotTxt}</div>
    <div class="task-body">
      <div class="task-txt">${escHtml(task.text)}</div>
      <div class="task-meta">${priBadge}${dueBadge}</div>
    </div>
    <div class="task-acts">
      <button class="act ok"  title="Mark complete">✔</button>
      <button class="act ed"  title="Edit task">✏️</button>
      <button class="act del" title="Delete (5-sec bomb)">🗑</button>
    </div>
  `;

  /* ── Attach grass if done ── */
  if (task.done) attachGrass(card);

  /* ── Restore bomb overlay if timer is running ── */
  if (bombTimers[task.id] && !bombTimers[task.id].cancelled) {
    attachBombOverlay(card, task.id);
  }

  /* ── Events ── */
  card.addEventListener('click', e => {
    /* Don't select if clicking action buttons or bomb overlay */
    if (e.target.closest('.task-acts') || e.target.closest('.bomb-overlay')) return;
    toggleSelect(task.id, card);
  });

  card.querySelector('.act.ok').addEventListener('click', e => {
    e.stopPropagation();
    toggleDone(task.id);
  });

  card.querySelector('.act.ed').addEventListener('click', e => {
    e.stopPropagation();
    openEdit(task);
  });

  card.querySelector('.act.del').addEventListener('click', e => {
    e.stopPropagation();
    startBomb(task.id, card);
  });

  return card;
}

/* ═══════════════════════════════════════════════
   11. SELECT
═══════════════════════════════════════════════ */
function toggleSelect(id, card) {
  if (selectedId === id) {
    selectedId = null;
    card.classList.remove('selected');
    return;
  }
  document.querySelectorAll('.task-card.selected')
    .forEach(c => c.classList.remove('selected'));
  selectedId = id;
  card.classList.add('selected');
}

/* ═══════════════════════════════════════════════
   12. TOGGLE COMPLETE + GRASS
═══════════════════════════════════════════════ */
function toggleDone(id) {
  const t = tasks.find(t => t.id === id);
  if (!t) return;
  t.done = !t.done;
  saveTasks();
  renderTasks();
}

function attachGrass(card) {
  const clone = document.getElementById('grassTpl').content.cloneNode(true);
  card.appendChild(clone);
}

/* ═══════════════════════════════════════════════
   13. ADD TASK
═══════════════════════════════════════════════ */
function addTask(text) {
  text = text.trim();
  if (!text) return;

  const priority = document.getElementById('priSelect').value;
  const due      = document.getElementById('dueInput').value;

  const task = {
    id:        uid(),
    text,
    done:      false,
    priority,
    due,
    createdAt: Date.now(),
  };

  tasks.unshift(task);
  saveTasks();
  renderTasks();

  /* Find the new card and apply spin-in animation manually (already on CSS but refresh) */
  const newCard = document.querySelector(`.task-card[data-id="${task.id}"]`);
  if (newCard) {
    newCard.classList.remove('spin-in-done');
    void newCard.offsetWidth; /* reflow */
    newCard.style.animation = 'none';
    void newCard.offsetWidth;
    newCard.style.animation = '';
  }

  /* Reset due input */
  document.getElementById('dueInput').value = '';
}

/* ── Enter key on task input ── */
document.getElementById('taskInput').addEventListener('keydown', function (e) {
  if (e.key !== 'Enter') return;
  addTask(this.value);
  this.value = '';
});

/* ═══════════════════════════════════════════════
   14. EDIT MODAL
═══════════════════════════════════════════════ */
function openEdit(task) {
  editingId = task.id;
  document.getElementById('editText').value = task.text;
  document.getElementById('editPri') .value = task.priority || 'normal';
  document.getElementById('editDue') .value = task.due || '';
  document.getElementById('editModal').classList.remove('hidden');
  setTimeout(() => document.getElementById('editText').focus(), 60);
}

window.closeModal = function () {
  document.getElementById('editModal').classList.add('hidden');
  editingId = null;
};

window.saveEdit = function () {
  if (!editingId) return;
  const text = document.getElementById('editText').value.trim();
  if (!text) { document.getElementById('editText').focus(); return; }

  const t = tasks.find(t => t.id === editingId);
  if (t) {
    t.text     = text;
    t.priority = document.getElementById('editPri').value;
    t.due      = document.getElementById('editDue').value;
    saveTasks();
    renderTasks();
  }
  closeModal();
};

/* Close modal on backdrop click */
document.getElementById('editModal').addEventListener('click', function (e) {
  if (e.target === this) closeModal();
});

/* Escape key closes modal */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

/* ═══════════════════════════════════════════════
   15. BOMB SYSTEM (5-sec countdown delete)
═══════════════════════════════════════════════ */
function startBomb(id, card) {
  /* Ignore if bomb already ticking */
  if (bombTimers[id]) return;

  bombTimers[id] = { remaining: 5, cancelled: false, interval: null };
  attachBombOverlay(card, id);

  bombTimers[id].interval = setInterval(() => {
    const timer = bombTimers[id];
    if (!timer || timer.cancelled) {
      clearInterval(timer?.interval);
      delete bombTimers[id];
      renderTasks();
      return;
    }

    timer.remaining -= 1;

    /* Update counter on screen */
    const counter = card.querySelector('.bomb-num');
    if (counter) counter.textContent = timer.remaining;

    if (timer.remaining <= 0) {
      clearInterval(timer.interval);
      delete bombTimers[id];
      triggerBlast(id);
    }
  }, 1000);
}

function attachBombOverlay(card, id) {
  const timer = bombTimers[id];
  if (!timer) return;

  const ov       = document.createElement('div');
  ov.className   = 'bomb-overlay';
  ov.innerHTML   = `
    <span class="bomb-emoji" title="Tap to cancel!">💣</span>
    <span class="bomb-num">${timer.remaining}</span>
    <span class="bomb-hint">Tap bomb<br>to cancel!</span>
  `;

  /* Tapping anywhere on overlay — or the bomb emoji — cancels */
  ov.addEventListener('click', e => {
    e.stopPropagation();
    cancelBomb(id);
  });

  card.appendChild(ov);
}

function cancelBomb(id) {
  const timer = bombTimers[id];
  if (!timer) return;
  clearInterval(timer.interval);
  timer.cancelled = true;
  delete bombTimers[id];
  renderTasks();
}

/* ═══════════════════════════════════════════════
   16. BLAST PARTICLE EFFECT
═══════════════════════════════════════════════ */
function triggerBlast(id) {
  const card = document.querySelector(`.task-card[data-id="${id}"]`);

  /* Get screen position for particle origin */
  let cx = window.innerWidth  / 2;
  let cy = window.innerHeight / 2;
  if (card) {
    const r = card.getBoundingClientRect();
    cx = r.left + r.width  / 2;
    cy = r.top  + r.height / 2;
    card.classList.add('blasting');
  }

  /* Slight delay so blasting animation plays */
  setTimeout(() => {
    tasks = tasks.filter(t => t.id !== id);
    if (selectedId === id) selectedId = null;
    saveTasks();
    renderTasks();
  }, 350);

  launchParticles(cx, cy);
}

/* ── Canvas particle engine ── */
const canvas = document.getElementById('blastCanvas');
const ctx    = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function launchParticles(ox, oy) {
  const COLORS = [
    '#a78bfa','#f472b6','#38bdf8','#fbbf24',
    '#34d399','#fb923c','#e879f9','#ff6b6b','#60a5fa',
  ];

  /* 70 particles */
  const pts = Array.from({ length: 70 }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * 10;
    return {
      x:      ox,
      y:      oy,
      vx:     Math.cos(angle) * speed,
      vy:     Math.sin(angle) * speed - Math.random() * 4,
      r:      2.5 + Math.random() * 5.5,
      color:  COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha:  1,
      rot:    Math.random() * Math.PI * 2,
      rotV:   (Math.random() - .5) * .35,
      isRect: Math.random() > .5,
    };
  });

  let raf;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;

    for (const p of pts) {
      if (p.alpha <= 0) continue;
      alive = true;

      /* Physics */
      p.x   += p.vx;
      p.y   += p.vy;
      p.vy  += 0.38;    /* gravity */
      p.vx  *= 0.97;    /* air friction */
      p.alpha -= 0.020;
      p.rot += p.rotV;

      /* Draw */
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle   = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur  = 7;

      if (p.isRect) {
        ctx.fillRect(-p.r, -p.r * .45, p.r * 2, p.r * .9);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    if (alive) {
      raf = requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      cancelAnimationFrame(raf);
    }
  }

  draw();
}

/* ═══════════════════════════════════════════════
   17. UTILS
═══════════════════════════════════════════════ */
function escHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

/* ═══════════════════════════════════════════════
   18. INIT
═══════════════════════════════════════════════ */
(function init() {
  loadTasks();
  renderTasks();
  document.getElementById('taskInput').focus();
})();
