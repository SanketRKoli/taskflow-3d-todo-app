/* =====================================================
   login.js — Taskflow Session-Only Authentication
   No backend. No Firebase. No email verification.
   Users stored in localStorage.
   Session stored in sessionStorage (clears on tab close).
   ===================================================== */

/* ── Guard: already logged in this session? ── */
(function sessionGuard() {
  if (sessionStorage.getItem('tf_session')) {
    window.location.href = 'app.html';
  }
})();

/* ═══════════════════════════════════════════════
   BACKGROUND FLOATING PARTICLES
═══════════════════════════════════════════════ */
(function spawnParticles() {
  const EMOJIS = ['✦','💣','🌱','💥','✔','📌','🔴','🌸','✏️','🎉','⭐','🌼'];
  const wrap   = document.getElementById('bgParticles');
  if (!wrap) return;

  for (let i = 0; i < 18; i++) {
    const span = document.createElement('span');
    span.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    span.style.cssText = `
      left:     ${Math.random() * 100}%;
      top:      ${100 + Math.random() * 10}%;
      font-size:${16 + Math.random() * 18}px;
      animation-duration: ${10 + Math.random() * 14}s;
      animation-delay:    ${Math.random() * 10}s;
    `;
    wrap.appendChild(span);
  }
})();

/* ═══════════════════════════════════════════════
   TAB SWITCHING
═══════════════════════════════════════════════ */
window.switchTab = function (tab) {
  const isSignup = (tab === 'signup');

  document.getElementById('formSignup').classList.toggle('hidden', !isSignup);
  document.getElementById('formLogin') .classList.toggle('hidden',  isSignup);
  document.getElementById('tabSignup') .classList.toggle('active',  isSignup);
  document.getElementById('tabLogin')  .classList.toggle('active', !isSignup);

  /* slide the tab underline */
  document.getElementById('tabSlider').classList.toggle('right', !isSignup);

  clearMsgs();
};

function clearMsgs() {
  setMsg('su-msg', '', '');
  setMsg('li-msg', '', '');
}

/* ═══════════════════════════════════════════════
   PASSWORD EYE TOGGLE
═══════════════════════════════════════════════ */
window.toggleEye = function (inputId, btn) {
  const inp = document.getElementById(inputId);
  if (inp.type === 'password') { inp.type = 'text';     btn.textContent = '🙈'; }
  else                         { inp.type = 'password'; btn.textContent = '👁'; }
};

/* ═══════════════════════════════════════════════
   PASSWORD STRENGTH METER
═══════════════════════════════════════════════ */
const suPass = document.getElementById('su-pass');
if (suPass) {
  suPass.addEventListener('input', function () {
    const v     = this.value;
    let   score = 0;
    if (v.length >= 4)              score++;
    if (v.length >= 8)              score++;
    if (/[A-Z]/.test(v))            score++;
    if (/[0-9]/.test(v))            score++;
    if (/[^A-Za-z0-9]/.test(v))     score++;

    const levels = [
      { w: '0%',    bg: 'transparent', lbl: '' },
      { w: '25%',   bg: '#f87171',     lbl: 'Weak' },
      { w: '50%',   bg: '#fb923c',     lbl: 'Fair' },
      { w: '75%',   bg: '#fbbf24',     lbl: 'Good' },
      { w: '100%',  bg: '#34d399',     lbl: 'Strong 💪' },
    ];
    const lv = levels[Math.min(score, 4)];
    const bar = document.getElementById('strengthBar');
    const txt = document.getElementById('strengthTxt');
    bar.style.width      = lv.w;
    bar.style.background = lv.bg;
    txt.textContent      = lv.lbl;
  });
}

/* ═══════════════════════════════════════════════
   STORAGE HELPERS
═══════════════════════════════════════════════ */
function getUsers() {
  try { return JSON.parse(localStorage.getItem('tf_users')) || {}; }
  catch { return {}; }
}
function saveUsers(u) { localStorage.setItem('tf_users', JSON.stringify(u)); }

function setMsg(id, text, type) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.className   = 'form-msg' + (type ? ' ' + type : '');
}

function animateBtn(btn, loading) {
  btn.disabled = loading;
  if (loading) {
    btn.dataset.orig = btn.querySelector('.btn-text').textContent;
    btn.querySelector('.btn-text').textContent = '…';
  } else {
    btn.querySelector('.btn-text').textContent = btn.dataset.orig || '';
  }
}

/* ═══════════════════════════════════════════════
   SIGN UP
═══════════════════════════════════════════════ */
window.handleSignup = function (e) {
  e.preventDefault();

  const name = document.getElementById('su-name').value.trim();
  const user = document.getElementById('su-user').value.trim().toLowerCase();
  const pass = document.getElementById('su-pass').value;

  /* Validate */
  if (!name)        return setMsg('su-msg', '⚠️ Enter your name.', 'error');
  if (!user)        return setMsg('su-msg', '⚠️ Choose a username.', 'error');
  if (user.length < 3)
    return setMsg('su-msg', '⚠️ Username must be at least 3 characters.', 'error');
  if (!/^[a-z0-9_]+$/.test(user))
    return setMsg('su-msg', '⚠️ Username: only letters, numbers, underscore.', 'error');
  if (pass.length < 4)
    return setMsg('su-msg', '⚠️ Password must be at least 4 characters.', 'error');

  const users = getUsers();
  if (users[user]) return setMsg('su-msg', '⚠️ Username already taken. Try another.', 'error');

  /* Save */
  users[user] = { name, password: pass };
  saveUsers(users);

  setMsg('su-msg', '✅ Account created! Please sign in.', 'success');

  /* Auto-switch to login after short delay */
  setTimeout(() => switchTab('login'), 1000);
};

/* ═══════════════════════════════════════════════
   SIGN IN
═══════════════════════════════════════════════ */
window.handleLogin = function (e) {
  e.preventDefault();

  const user = document.getElementById('li-user').value.trim().toLowerCase();
  const pass = document.getElementById('li-pass').value;

  if (!user) return setMsg('li-msg', '⚠️ Enter your username.', 'error');
  if (!pass) return setMsg('li-msg', '⚠️ Enter your password.', 'error');

  const users = getUsers();
  const found = users[user];

  if (!found)               return setMsg('li-msg', '⚠️ No account found with that username.', 'error');
  if (found.password !== pass) return setMsg('li-msg', '⚠️ Wrong password. Try again.', 'error');

  /* Create session — cleared when browser tab is closed */
  sessionStorage.setItem('tf_session', JSON.stringify({ username: user, name: found.name }));

  /* Redirect */
  window.location.href = 'app.html';
};

/* ═══════════════════════════════════════════════
   ENTER KEY SUPPORT
═══════════════════════════════════════════════ */
document.addEventListener('keydown', function (e) {
  if (e.key !== 'Enter') return;
  const signupVisible = !document.getElementById('formSignup').classList.contains('hidden');
  if (signupVisible) document.getElementById('formSignup').requestSubmit();
  else               document.getElementById('formLogin') .requestSubmit();
});
