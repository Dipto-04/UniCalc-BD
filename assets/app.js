// ==========================================================
// UniCalc BD — App Logic (hash router + calculators)
// ==========================================================

const view = document.getElementById('app-view');
let chartRefs = {};

/* ---------------- Theme ---------------- */
const themeToggle = document.getElementById('theme-toggle');
function applyTheme(t) {
  document.documentElement.classList.toggle('dark', t === 'dark');
  themeToggle.classList.toggle('on', t === 'dark');
  localStorage.setItem('unicalc-theme', t);
}
applyTheme(localStorage.getItem('unicalc-theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
themeToggle.addEventListener('click', () => {
  applyTheme(document.documentElement.classList.contains('dark') ? 'light' : 'dark');
});

/* ---------------- Mobile menu ---------------- */
document.getElementById('mobile-menu-btn').addEventListener('click', () => {
  document.getElementById('mobile-menu').classList.toggle('hidden');
});
document.querySelectorAll('#mobile-menu a').forEach(a => a.addEventListener('click', () => {
  document.getElementById('mobile-menu').classList.add('hidden');
}));

/* ---------------- Helpers ---------------- */
const fmt = (n, d = 2) => Number.isFinite(n) ? n.toFixed(d) : '0.00';
const bdt = (n) => '৳' + Math.round(n).toLocaleString('en-BD');
const uid = () => Math.random().toString(36).slice(2, 9);

function saveCalc(type, payload) {
  const key = 'unicalc-saved';
  const all = JSON.parse(localStorage.getItem(key) || '[]');
  all.unshift({ id: uid(), type, payload, ts: Date.now() });
  localStorage.setItem(key, JSON.stringify(all.slice(0, 50)));
}
function getSaved() { return JSON.parse(localStorage.getItem('unicalc-saved') || '[]'); }

function gaugeSVG(id, value, max = 4, colorVar = 'var(--primary)') {
  const r = 70, c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / max));
  return `
  <div class="gpa-dial">
    <svg viewBox="0 0 160 160">
      <defs>
        <linearGradient id="dialGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#2563EB"/>
          <stop offset="100%" stop-color="#22C55E"/>
        </linearGradient>
      </defs>
      <circle class="track" cx="80" cy="80" r="${r}" stroke-width="14"/>
      <circle id="${id}" class="progress" cx="80" cy="80" r="${r}" stroke-width="14"
        stroke-dasharray="${c}" stroke-dashoffset="${c}"/>
    </svg>
    <div class="dial-readout">
      <div class="font-mono font-bold text-3xl" style="color:${colorVar}">${fmt(value)}</div>
      <div class="text-xs uppercase tracking-wide" style="color:var(--ink-soft)">out of ${max.toFixed(2)}</div>
    </div>
  </div>`;
}
function animateGauge(id, value, max = 4) {
  requestAnimationFrame(() => {
    const el = document.getElementById(id);
    if (!el) return;
    const r = 70, c = 2 * Math.PI * r;
    const pct = Math.max(0, Math.min(1, value / max));
    el.style.strokeDashoffset = c - pct * c;
  });
}

function animateCounter(el, target, suffix = '') {
  const dur = 1200, start = performance.now();
  function tick(now) {
    const p = Math.min(1, (now - start) / dur);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * eased).toLocaleString() + suffix;
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function uniOptions(selectedId) {
  return UNIVERSITIES.map(u => `<option value="${u.id}" ${u.id===selectedId?'selected':''}>${u.name}</option>`).join('');
}

function gradeOptionsFor(scale) {
  return scale.map(g => `<option value="${g.grade}">${g.grade} (${g.point.toFixed(2)})</option>`).join('');
}

/* ---------------- Router ---------------- */
const routes = {
  '/': pageHome,
  '/sgpa': pageSGPA,
  '/cgpa': pageCGPA,
  '/target': pageTarget,
  '/waiver': pageWaiver,
  '/converter': pageConverter,
  '/credit': pageCredit,
  '/universities': pageUniversities,
  '/dashboard': pageDashboard,
  '/blog': pageBlog,
  '/faq': pageFAQ,
  '/about': pageAbout,
  '/contact': pageContact,
  '/privacy': pageLegal('Privacy Policy', 'privacy'),
  '/terms': pageLegal('Terms of Service', 'terms'),
};

function router() {
  Object.values(chartRefs).forEach(c => c && c.destroy && c.destroy());
  chartRefs = {};
  let hash = location.hash.replace('#', '') || '/';
  let uniDetail = hash.match(/^\/universities\/(.+)$/);
  document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('active', l.dataset.route === hash));
  window.scrollTo({ top: 0, behavior: 'instant' });

  if (uniDetail) { pageUniversityDetail(uniDetail[1]); return; }
  const page = routes[hash] || page404;
  page();
  view.classList.remove('page-enter');
  void view.offsetWidth;
  view.classList.add('page-enter');
}
window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);

/* ---------------- Shared layout bits ---------------- */
function sectionHeader(eyebrow, title, sub) {
  return `
  <div class="max-w-2xl mx-auto text-center mb-12">
    <div class="badge inline-block mb-3" style="background:color-mix(in srgb, var(--primary) 12%, transparent); color:var(--primary)">${eyebrow}</div>
    <h2 class="font-display font-bold text-3xl sm:text-4xl mb-3">${title}</h2>
    ${sub ? `<p style="color:var(--ink-soft)">${sub}</p>` : ''}
  </div>`;
}

function toolShell(title, sub, bodyHtml) {
  return `
  <section class="hero-bg pt-12 pb-16">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-8">
        <a href="#/" class="text-sm" style="color:var(--ink-soft)">← Back to home</a>
        <h1 class="font-display font-extrabold text-3xl sm:text-4xl mt-2">${title}</h1>
        <p class="mt-2" style="color:var(--ink-soft)">${sub}</p>
      </div>
      ${bodyHtml}
    </div>
  </section>`;
}

/* ============================================================
   HOME
   ============================================================ */
function pageHome() {
  view.innerHTML = `
  <section class="hero-bg pt-10 sm:pt-16 pb-12 sm:pb-20 overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
      <div>
        <div class="badge inline-flex items-center gap-1.5 mb-5" style="background:color-mix(in srgb, var(--accent) 14%, transparent); color:#16803d">
          <span class="w-1.5 h-1.5 rounded-full" style="background:var(--accent)"></span> Trusted by students at 50+ universities
        </div>
        <h1 class="font-display font-extrabold text-3xl sm:text-5xl lg:text-[3.4rem] leading-tight tracking-tight break-words">
          Calculate SGPA, CGPA & University Waiver <span style="color:var(--primary)">Instantly</span>
        </h1>
        <p class="mt-5 text-base sm:text-lg" style="color:var(--ink-soft)">Support for all Bangladesh private universities — grading scales, waiver policies and graduation rules, built into one fast calculator.</p>
        <div class="mt-8 flex flex-col sm:flex-row gap-3">
          <a href="#/sgpa" class="btn-primary px-6 py-3.5 inline-block">Calculate Now</a>
          <a href="#/universities" class="btn-ghost px-6 py-3.5 inline-block">Explore Universities</a>
        </div>
        <div class="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-md">
          <div><div class="stat-num font-display font-extrabold text-3xl" id="stat-1" style="color:var(--primary)">0</div><div class="text-xs mt-1" style="color:var(--ink-soft)">Universities</div></div>
          <div><div class="stat-num font-display font-extrabold text-3xl" id="stat-2" style="color:var(--primary)">0</div><div class="text-xs mt-1" style="color:var(--ink-soft)">Calculations</div></div>
          <div><div class="stat-num font-display font-extrabold text-3xl" id="stat-3" style="color:var(--primary)">0%</div><div class="text-xs mt-1" style="color:var(--ink-soft)">Accuracy</div></div>
        </div>
      </div>

      <div class="card p-6 sm:p-8" id="home-mini-calc">
        <div class="flex items-center justify-between mb-5">
          <h3 class="font-display font-bold text-lg">Quick SGPA check</h3>
          <span class="badge" style="background:color-mix(in srgb, var(--primary) 12%, transparent); color:var(--primary)">Live</span>
        </div>
        <div id="mini-rows" class="grid gap-3"></div>
        <button id="mini-add" class="mt-3 text-sm font-semibold" style="color:var(--primary)">+ Add subject</button>
        <div class="mt-6 grid sm:grid-cols-2 gap-6 items-center">
          <div class="max-w-[180px] mx-auto sm:mx-0">${gaugeSVG('mini-gauge', 0)}</div>
          <div>
            <p class="text-sm" style="color:var(--ink-soft)">This is a live preview using BUBT's grading scale.</p>
            <a href="#/sgpa" class="btn-primary px-5 py-2.5 inline-block mt-4 text-sm">Open full calculator →</a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    ${sectionHeader('Features', 'Every calculator a student actually needs', 'From day-one GPA tracking to graduation eligibility and tuition waiver planning.')}
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5" id="feature-grid"></div>
  </section>

  <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    ${sectionHeader('Universities', 'Built around real grading systems', 'Starting with a fully modeled BUBT policy, expanding across Bangladesh.')}
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4" id="uni-preview"></div>
    <div class="text-center mt-8"><a href="#/universities" class="btn-ghost px-6 py-3 inline-block">View all universities</a></div>
  </section>

  <section class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
    <div class="card p-10 text-center" style="background:linear-gradient(135deg, color-mix(in srgb, var(--primary) 8%, var(--surface)), color-mix(in srgb, var(--accent) 8%, var(--surface)))">
      <h3 class="font-display font-bold text-2xl mb-2">Know your waiver before you register</h3>
      <p style="color:var(--ink-soft)" class="mb-6">Plan your semester's tuition with the waiver calculator, built on official BUBT bracket rules.</p>
      <a href="#/waiver" class="btn-primary px-6 py-3 inline-block">Open Waiver Calculator</a>
    </div>
  </section>
  `;

  animateCounter(document.getElementById('stat-1'), 50, '+');
  animateCounter(document.getElementById('stat-2'), 100000, '+');
  animateCounter(document.getElementById('stat-3'), 99, '%');

  const features = [
    ['📊','SGPA Calculator','Add unlimited subjects, auto-calculate instantly.'],
    ['📈','CGPA Calculator','Track every semester with visual progress charts.'],
    ['🎯','Target GPA Calculator','Find the GPA you need this semester to hit your goal.'],
    ['💸','Waiver Calculator','Know your tuition waiver bracket before you register.'],
    ['🔤','Grade Converter','Convert raw marks to letter grades and points.'],
    ['🎓','Graduation Eligibility','Check if you meet your minimum CGPA to graduate.'],
  ];
  document.getElementById('feature-grid').innerHTML = features.map(([icon,t,d]) => `
    <div class="card card-hover p-6">
      <div class="text-2xl mb-3">${icon}</div>
      <h4 class="font-display font-bold mb-1">${t}</h4>
      <p class="text-sm" style="color:var(--ink-soft)">${d}</p>
    </div>`).join('');

  document.getElementById('uni-preview').innerHTML = UNIVERSITIES.slice(0,8).map(u => `
    <a href="#/universities/${u.id}" class="card card-hover p-5 flex flex-col items-start gap-3">
      <div class="w-10 h-10 rounded-lg flex items-center justify-center font-display font-bold text-white text-sm" style="background:${u.color}">${u.name.slice(0,2).toUpperCase()}</div>
      <div>
        <div class="font-semibold text-sm">${u.name}</div>
        <div class="text-xs" style="color:var(--ink-soft)">Min CGPA ${u.minGraduationCGPA.toFixed(2)}</div>
      </div>
    </a>`).join('');

  // mini live calculator
  const scale = findUniversity('bubt').gradingScale;
  let miniRows = [{ id: uid(), name: 'Course 1', credit: 3, grade: 'A' }, { id: uid(), name: 'Course 2', credit: 3, grade: 'A-' }];
  function renderMini() {
    document.getElementById('mini-rows').innerHTML = miniRows.map(r => `
      <div class="grid grid-cols-[1fr_70px_100px_28px] gap-2 items-center" data-row="${r.id}">
        <input class="input px-3 py-2 text-sm mini-name" value="${r.name}" placeholder="Course name">
        <input type="number" min="0" max="6" class="input px-2 py-2 text-sm mini-credit" value="${r.credit}">
        <select class="input px-2 py-2 text-sm mini-grade">${gradeOptionsFor(scale).replace(`value="${r.grade}"`, `value="${r.grade}" selected`)}</select>
        <button class="mini-del text-red-500 text-lg leading-none">×</button>
      </div>`).join('');
    document.getElementById('mini-rows').querySelectorAll('[data-row]').forEach(rowEl => {
      const id = rowEl.dataset.row;
      rowEl.querySelector('.mini-name').addEventListener('input', e => { miniRows.find(r=>r.id===id).name = e.target.value; });
      rowEl.querySelector('.mini-credit').addEventListener('input', e => { miniRows.find(r=>r.id===id).credit = Number(e.target.value)||0; computeMini(); });
      rowEl.querySelector('.mini-grade').addEventListener('change', e => { miniRows.find(r=>r.id===id).grade = e.target.value; computeMini(); });
      rowEl.querySelector('.mini-del').addEventListener('click', () => { miniRows = miniRows.filter(r=>r.id!==id); renderMini(); computeMini(); });
    });
    computeMini();
  }
  function computeMini() {
    let tc = 0, tp = 0;
    miniRows.forEach(r => { tc += r.credit; tp += r.credit * gradePointByLetter(scale, r.grade); });
    const sgpa = tc ? tp / tc : 0;
    animateGauge('mini-gauge', sgpa);
    document.querySelector('#mini-gauge').parentElement.parentElement.querySelector('.font-mono').textContent = fmt(sgpa);
  }
  document.getElementById('mini-add').addEventListener('click', () => {
    miniRows.push({ id: uid(), name: `Course ${miniRows.length+1}`, credit: 3, grade: 'A' });
    renderMini();
  });
  renderMini();
}

/* ============================================================
   SGPA CALCULATOR
   ============================================================ */
function pageSGPA() {
  let rows = [{ id: uid(), name: '', credit: 3, grade: 'A' }];
  let uniId = 'bubt';

  view.innerHTML = toolShell('SGPA Calculator', 'Add every course from this semester to get your exact SGPA.', `
    <div class="grid lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 card p-6">
        <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium">University grading scale</label>
            <select id="sgpa-uni" class="input px-3 py-2 text-sm">${uniOptions(uniId)}</select>
          </div>
          <div class="flex gap-2">
            <button id="sgpa-reset" class="btn-ghost px-4 py-2 text-sm">Reset</button>
            <button id="sgpa-print" class="btn-primary px-4 py-2 text-sm">Export / Print</button>
          </div>
        </div>
        <div class="grid grid-cols-[1fr_90px_120px_28px] gap-2 text-xs font-semibold mb-2 px-1" style="color:var(--ink-soft)">
          <div>Course name</div><div>Credit</div><div>Grade</div><div></div>
        </div>
        <div id="sgpa-rows" class="grid gap-2"></div>
        <button id="sgpa-add" class="mt-4 text-sm font-semibold" style="color:var(--primary)">+ Add subject</button>
      </div>

      <div class="card p-6 text-center">
        <h3 class="font-display font-bold mb-4">Your SGPA</h3>
        <div class="max-w-[220px] mx-auto">${gaugeSVG('sgpa-gauge', 0)}</div>
        <div class="grid grid-cols-2 gap-3 mt-6 text-sm">
          <div class="p-3 rounded-xl" style="background:color-mix(in srgb, var(--primary) 8%, transparent)">
            <div class="font-mono font-bold text-lg" id="sgpa-credits">0</div>
            <div class="text-xs" style="color:var(--ink-soft)">Total Credits</div>
          </div>
          <div class="p-3 rounded-xl" style="background:color-mix(in srgb, var(--accent) 10%, transparent)">
            <div class="font-mono font-bold text-lg" id="sgpa-points">0.00</div>
            <div class="text-xs" style="color:var(--ink-soft)">Quality Points</div>
          </div>
        </div>
        <div class="mt-6" style="max-width:220px;margin:0 auto"><canvas id="sgpa-donut"></canvas></div>
      </div>
    </div>
  `);

  function currentScale() { return findUniversity(uniId).gradingScale; }

  function renderRows() {
    document.getElementById('sgpa-rows').innerHTML = rows.map(r => `
      <div class="grid grid-cols-[1fr_90px_120px_28px] gap-2 items-center" data-row="${r.id}">
        <input class="input px-3 py-2 text-sm r-name" placeholder="e.g. Data Structures" value="${r.name}">
        <input type="number" min="0" max="6" class="input px-2 py-2 text-sm r-credit" value="${r.credit}">
        <select class="input px-2 py-2 text-sm r-grade">${gradeOptionsFor(currentScale())}</select>
        <button class="r-del text-red-500 text-xl leading-none">×</button>
      </div>`).join('');
    document.getElementById('sgpa-rows').querySelectorAll('[data-row]').forEach(rowEl => {
      const id = rowEl.dataset.row;
      const r = rows.find(x => x.id === id);
      rowEl.querySelector('.r-grade').value = r.grade;
      rowEl.querySelector('.r-name').addEventListener('input', e => { r.name = e.target.value; });
      rowEl.querySelector('.r-credit').addEventListener('input', e => { r.credit = Number(e.target.value) || 0; compute(); });
      rowEl.querySelector('.r-grade').addEventListener('change', e => { r.grade = e.target.value; compute(); });
      rowEl.querySelector('.r-del').addEventListener('click', () => {
        rows = rows.filter(x => x.id !== id);
        if (!rows.length) rows.push({ id: uid(), name: '', credit: 3, grade: 'A' });
        renderRows(); compute();
      });
    });
    compute();
  }

  function compute() {
    const scale = currentScale();
    let tc = 0, tp = 0;
    const dist = {};
    rows.forEach(r => { tc += r.credit; tp += r.credit * gradePointByLetter(scale, r.grade); dist[r.grade] = (dist[r.grade]||0) + r.credit; });
    const sgpa = tc ? tp / tc : 0;
    animateGauge('sgpa-gauge', sgpa);
    document.querySelector('#sgpa-gauge').closest('.card').querySelector('.font-mono.font-bold.text-3xl').textContent = fmt(sgpa);
    document.getElementById('sgpa-credits').textContent = tc;
    document.getElementById('sgpa-points').textContent = fmt(tp);

    const ctx = document.getElementById('sgpa-donut');
    if (chartRefs.donut) chartRefs.donut.destroy();
    const labels = Object.keys(dist);
    chartRefs.donut = new Chart(ctx, {
      type: 'doughnut',
      data: { labels, datasets: [{ data: labels.map(l => dist[l]), backgroundColor: ['#2563EB','#22C55E','#3B82F6','#F59E0B','#EF4444','#8B5CF6','#14B8A6','#EC4899','#64748B','#0EA5E9'] }] },
      options: { plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } }, cutout: '65%' }
    });
  }

  document.getElementById('sgpa-uni').addEventListener('change', e => { uniId = e.target.value; renderRows(); });
  document.getElementById('sgpa-add').addEventListener('click', () => { rows.push({ id: uid(), name: '', credit: 3, grade: 'A' }); renderRows(); });
  document.getElementById('sgpa-reset').addEventListener('click', () => { rows = [{ id: uid(), name: '', credit: 3, grade: 'A' }]; renderRows(); });
  document.getElementById('sgpa-print').addEventListener('click', () => {
    saveCalc('SGPA', { rows, uniId });
    window.print();
  });

  renderRows();
}

/* ============================================================
   CGPA CALCULATOR
   ============================================================ */
function pageCGPA() {
  let semesters = [{ id: uid(), label: 'Semester 1', sgpa: 3.75, credits: 15 }];

  view.innerHTML = toolShell('CGPA Calculator', 'Combine every completed semester into your cumulative GPA.', `
    <div class="grid lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 card p-6">
        <div class="grid grid-cols-[1fr_100px_100px_28px] gap-2 text-xs font-semibold mb-2 px-1" style="color:var(--ink-soft)">
          <div>Semester</div><div>SGPA</div><div>Credits</div><div></div>
        </div>
        <div id="cgpa-rows" class="grid gap-2"></div>
        <button id="cgpa-add" class="mt-4 text-sm font-semibold" style="color:var(--primary)">+ Add semester</button>
        <div class="mt-6"><canvas id="cgpa-line"></canvas></div>
      </div>
      <div class="card p-6 text-center">
        <h3 class="font-display font-bold mb-4">Your CGPA</h3>
        <div class="max-w-[220px] mx-auto">${gaugeSVG('cgpa-gauge', 0)}</div>
        <div class="mt-6 p-3 rounded-xl text-sm" style="background:color-mix(in srgb, var(--primary) 8%, transparent)">
          <div class="font-mono font-bold text-lg" id="cgpa-total-credits">0</div>
          <div class="text-xs" style="color:var(--ink-soft)">Total Completed Credits</div>
        </div>
        <button id="cgpa-save" class="btn-primary px-5 py-2.5 mt-6 text-sm w-full">Save to Dashboard</button>
      </div>
    </div>
  `);

  function renderRows() {
    document.getElementById('cgpa-rows').innerHTML = semesters.map((s, i) => `
      <div class="grid grid-cols-[1fr_100px_100px_28px] gap-2 items-center" data-row="${s.id}">
        <input class="input px-3 py-2 text-sm s-label" value="${s.label}">
        <input type="number" step="0.01" min="0" max="4" class="input px-2 py-2 text-sm s-sgpa" value="${s.sgpa}">
        <input type="number" min="0" class="input px-2 py-2 text-sm s-credits" value="${s.credits}">
        <button class="s-del text-red-500 text-xl leading-none">×</button>
      </div>`).join('');
    document.getElementById('cgpa-rows').querySelectorAll('[data-row]').forEach(rowEl => {
      const id = rowEl.dataset.row;
      const s = semesters.find(x => x.id === id);
      rowEl.querySelector('.s-label').addEventListener('input', e => { s.label = e.target.value; compute(); });
      rowEl.querySelector('.s-sgpa').addEventListener('input', e => { s.sgpa = Number(e.target.value)||0; compute(); });
      rowEl.querySelector('.s-credits').addEventListener('input', e => { s.credits = Number(e.target.value)||0; compute(); });
      rowEl.querySelector('.s-del').addEventListener('click', () => {
        semesters = semesters.filter(x => x.id !== id);
        if (!semesters.length) semesters.push({ id: uid(), label: 'Semester 1', sgpa: 3.5, credits: 15 });
        renderRows(); compute();
      });
    });
    compute();
  }

  function compute() {
    let tc = 0, tp = 0; const trend = [];
    semesters.forEach(s => { tc += s.credits; tp += s.sgpa * s.credits; trend.push(tp / (tc || 1)); });
    const cgpa = tc ? tp / tc : 0;
    animateGauge('cgpa-gauge', cgpa);
    document.querySelector('#cgpa-gauge').closest('.card').querySelector('.font-mono.font-bold.text-3xl').textContent = fmt(cgpa);
    document.getElementById('cgpa-total-credits').textContent = tc;

    const ctx = document.getElementById('cgpa-line');
    if (chartRefs.line) chartRefs.line.destroy();
    chartRefs.line = new Chart(ctx, {
      type: 'line',
      data: { labels: semesters.map(s => s.label), datasets: [{ label: 'Cumulative CGPA', data: trend, borderColor: '#2563EB', backgroundColor: 'rgba(37,99,235,.15)', fill: true, tension: .35, pointBackgroundColor: '#22C55E' }] },
      options: { scales: { y: { min: 0, max: 4 } }, plugins: { legend: { display: false } } }
    });
  }

  document.getElementById('cgpa-add').addEventListener('click', () => {
    semesters.push({ id: uid(), label: `Semester ${semesters.length+1}`, sgpa: 3.5, credits: 15 });
    renderRows();
  });
  document.getElementById('cgpa-save').addEventListener('click', () => { saveCalc('CGPA', { semesters }); alert('Saved to your dashboard.'); });

  renderRows();
}

/* ============================================================
   TARGET GPA CALCULATOR
   ============================================================ */
function pageTarget() {
  view.innerHTML = toolShell('Target GPA Calculator', 'Find the SGPA you need this semester to reach your target CGPA.', `
    <div class="grid lg:grid-cols-2 gap-6">
      <div class="card p-6 grid gap-4">
        <div><label class="text-sm font-medium">Current CGPA</label><input id="t-current" type="number" step="0.01" min="0" max="4" value="3.40" class="input w-full px-3 py-2 mt-1"></div>
        <div><label class="text-sm font-medium">Completed Credits</label><input id="t-credits" type="number" min="0" value="60" class="input w-full px-3 py-2 mt-1"></div>
        <div><label class="text-sm font-medium">Target CGPA</label><input id="t-target" type="number" step="0.01" min="0" max="4" value="3.60" class="input w-full px-3 py-2 mt-1"></div>
        <div><label class="text-sm font-medium">This Semester's Credits</label><input id="t-sem-credits" type="number" min="1" value="15" class="input w-full px-3 py-2 mt-1"></div>
      </div>
      <div class="card p-6 text-center flex flex-col items-center justify-center">
        <h3 class="font-display font-bold mb-4">Required SGPA</h3>
        <div class="max-w-[220px]">${gaugeSVG('t-gauge', 0)}</div>
        <p id="t-message" class="text-sm mt-4" style="color:var(--ink-soft)"></p>
      </div>
    </div>
  `);

  function compute() {
    const cur = Number(document.getElementById('t-current').value) || 0;
    const cc = Number(document.getElementById('t-credits').value) || 0;
    const target = Number(document.getElementById('t-target').value) || 0;
    const sc = Number(document.getElementById('t-sem-credits').value) || 1;
    const required = ((target * (cc + sc)) - (cur * cc)) / sc;
    const clamped = Math.max(0, required);
    animateGauge('t-gauge', Math.min(clamped, 4));
    document.querySelector('#t-gauge').closest('.card').querySelector('.font-mono.font-bold.text-3xl').textContent = fmt(clamped);
    const msg = document.getElementById('t-message');
    if (required > 4.0) msg.innerHTML = `That target isn't reachable this semester alone — even a 4.00 SGPA lands below it. Consider spreading the goal across more semesters.`;
    else if (required <= 0) msg.innerHTML = `You've already secured this target — any passing SGPA keeps you there.`;
    else msg.innerHTML = `Score at least <strong>${fmt(clamped)}</strong> SGPA this semester to reach a ${fmt(target)} CGPA.`;
  }
  ['t-current','t-credits','t-target','t-sem-credits'].forEach(id => document.getElementById(id).addEventListener('input', compute));
  compute();
}

/* ============================================================
   WAIVER CALCULATOR
   ============================================================ */
function pageWaiver() {
  let uniId = 'bubt';
  view.innerHTML = toolShell('Waiver Calculator', 'Estimate your tuition fee waiver bracket based on continuing CGPA.', `
    <div class="grid lg:grid-cols-2 gap-6">
      <div class="card p-6 grid gap-4">
        <div><label class="text-sm font-medium">University</label><select id="w-uni" class="input w-full px-3 py-2 mt-1">${uniOptions(uniId)}</select></div>
        <div><label class="text-sm font-medium">Department Category</label><select id="w-dept" class="input w-full px-3 py-2 mt-1"></select></div>
        <div><label class="text-sm font-medium">Current CGPA</label><input id="w-cgpa" type="number" step="0.01" min="0" max="4" value="3.90" class="input w-full px-3 py-2 mt-1"></div>
        <div><label class="text-sm font-medium">Current Credits Completed</label><input id="w-credits" type="number" min="0" value="90" class="input w-full px-3 py-2 mt-1"></div>
        <div><label class="text-sm font-medium">Per-Semester Tuition Fee (৳)</label><input id="w-tuition" type="number" min="0" value="60000" class="input w-full px-3 py-2 mt-1"></div>
      </div>
      <div class="card p-6">
        <h3 class="font-display font-bold mb-4">Result</h3>
        <div id="w-result" class="grid gap-3"></div>
        <div class="mt-5 p-4 rounded-xl text-xs" style="background:color-mix(in srgb, var(--accent) 8%, transparent); color:var(--ink-soft)" id="w-policy-note"></div>
      </div>
    </div>
  `);

  function refreshDept() {
    const u = findUniversity(uniId);
    const cats = Object.keys(u.minWaiverCGPAByDept);
    document.getElementById('w-dept').innerHTML = cats.map(c => `<option value="${c}">${c}</option>`).join('');
  }

  function compute() {
    const u = findUniversity(uniId);
    const dept = document.getElementById('w-dept').value;
    const cgpa = Number(document.getElementById('w-cgpa').value) || 0;
    const tuition = Number(document.getElementById('w-tuition').value) || 0;
    const minReq = u.minWaiverCGPAByDept[dept] ?? 3.00;

    let bracket = u.continuingWaiver.slice().sort((a,b) => b.min - a.min).find(b => cgpa >= b.min && cgpa <= b.max);
    let percent = 0, eligible = cgpa >= minReq;
    if (eligible && bracket) percent = bracket.percent;

    const discount = tuition * (percent / 100);
    const payable = tuition - discount;

    document.getElementById('w-result').innerHTML = `
      <div class="flex items-center justify-between p-3 rounded-xl" style="background:color-mix(in srgb, var(--primary) 8%, transparent)">
        <span class="text-sm">Waiver Bracket</span><span class="font-mono font-bold text-lg" style="color:var(--primary)">${percent}%</span>
      </div>
      <div class="flex items-center justify-between p-3 rounded-xl" style="background:color-mix(in srgb, var(--accent) 10%, transparent)">
        <span class="text-sm">Tuition Discount</span><span class="font-mono font-bold text-lg">${bdt(discount)}</span>
      </div>
      <div class="flex items-center justify-between p-3 rounded-xl border" style="border-color:var(--border)">
        <span class="text-sm">Payable Amount</span><span class="font-mono font-bold text-lg">${bdt(payable)}</span>
      </div>
      ${!eligible ? `<div class="text-sm p-3 rounded-xl" style="background:color-mix(in srgb, #DC2626 10%, transparent); color:#DC2626">Below the minimum ${minReq.toFixed(2)} CGPA required for ${dept} waiver eligibility at ${u.name}.</div>` : ''}
    `;
    document.getElementById('w-policy-note').textContent = `${u.name} policy: waiver applies to ${u.waiverAppliesTo}. ${u.scholarshipPolicy}`;
  }

  document.getElementById('w-uni').addEventListener('change', e => { uniId = e.target.value; refreshDept(); compute(); });
  document.getElementById('w-dept').addEventListener('change', compute);
  ['w-cgpa','w-credits','w-tuition'].forEach(id => document.getElementById(id).addEventListener('input', compute));
  refreshDept(); compute();
}

/* ============================================================
   GRADE CONVERTER
   ============================================================ */
function pageConverter() {
  let uniId = 'bubt';
  view.innerHTML = toolShell('Grade Converter', 'Convert raw marks into a letter grade and grade point.', `
    <div class="grid lg:grid-cols-2 gap-6">
      <div class="card p-6 grid gap-4">
        <div><label class="text-sm font-medium">University Scale</label><select id="c-uni" class="input w-full px-3 py-2 mt-1">${uniOptions(uniId)}</select></div>
        <div><label class="text-sm font-medium">Marks (out of 100)</label><input id="c-marks" type="number" min="0" max="100" value="82" class="input w-full px-3 py-2 mt-1"></div>
        <div id="c-result" class="mt-2 p-5 rounded-xl text-center" style="background:color-mix(in srgb, var(--primary) 8%, transparent)"></div>
      </div>
      <div class="card p-6">
        <h3 class="font-display font-bold mb-4">Full Grading Table</h3>
        <table class="w-full text-sm" id="c-table"></table>
      </div>
    </div>
  `);

  function render() {
    const u = findUniversity(uniId);
    const marks = Number(document.getElementById('c-marks').value) || 0;
    const row = gradeFromMarks(u.gradingScale, marks);
    document.getElementById('c-result').innerHTML = `
      <div class="text-4xl font-display font-extrabold" style="color:var(--primary)">${row.grade}</div>
      <div class="font-mono text-lg mt-1">${row.point.toFixed(2)} points</div>
    `;
    document.getElementById('c-table').innerHTML = `
      <thead><tr class="text-left text-xs" style="color:var(--ink-soft)"><th class="py-2">Grade</th><th>Range</th><th>Point</th></tr></thead>
      <tbody>${u.gradingScale.map(g => `<tr class="table-row ${g.grade===row.grade?'font-bold':''}"><td class="py-1.5">${g.grade}</td><td>${g.min}-${g.max}</td><td class="font-mono">${g.point.toFixed(2)}</td></tr>`).join('')}</tbody>
    `;
  }
  document.getElementById('c-uni').addEventListener('change', e => { uniId = e.target.value; render(); });
  document.getElementById('c-marks').addEventListener('input', render);
  render();
}

/* ============================================================
   CREDIT CALCULATOR
   ============================================================ */
function pageCredit() {
  let rows = [{ id: uid(), name: '', credit: 3 }];
  view.innerHTML = toolShell('Credit Calculator', 'Add your courses to total up credit hours for the semester.', `
    <div class="card p-6 max-w-xl">
      <div id="cr-rows" class="grid gap-2"></div>
      <button id="cr-add" class="mt-4 text-sm font-semibold" style="color:var(--primary)">+ Add course</button>
      <div class="mt-6 p-4 rounded-xl flex items-center justify-between" style="background:color-mix(in srgb, var(--primary) 8%, transparent)">
        <span class="text-sm font-medium">Total Credits</span>
        <span class="font-mono font-bold text-2xl" id="cr-total">0</span>
      </div>
    </div>
  `);
  function render() {
    document.getElementById('cr-rows').innerHTML = rows.map(r => `
      <div class="grid grid-cols-[1fr_90px_28px] gap-2" data-row="${r.id}">
        <input class="input px-3 py-2 text-sm cr-name" placeholder="Course name" value="${r.name}">
        <input type="number" min="0" max="6" class="input px-2 py-2 text-sm cr-credit" value="${r.credit}">
        <button class="cr-del text-red-500 text-xl leading-none">×</button>
      </div>`).join('');
    document.getElementById('cr-rows').querySelectorAll('[data-row]').forEach(rowEl => {
      const id = rowEl.dataset.row; const r = rows.find(x=>x.id===id);
      rowEl.querySelector('.cr-name').addEventListener('input', e => r.name = e.target.value);
      rowEl.querySelector('.cr-credit').addEventListener('input', e => { r.credit = Number(e.target.value)||0; compute(); });
      rowEl.querySelector('.cr-del').addEventListener('click', () => { rows = rows.filter(x=>x.id!==id); if(!rows.length) rows.push({id:uid(),name:'',credit:3}); render(); });
    });
    compute();
  }
  function compute() { document.getElementById('cr-total').textContent = rows.reduce((a,r)=>a+r.credit,0); }
  document.getElementById('cr-add').addEventListener('click', () => { rows.push({id:uid(),name:'',credit:3}); render(); });
  render();
}

/* ============================================================
   UNIVERSITIES DIRECTORY + DETAIL
   ============================================================ */
function pageUniversities() {
  view.innerHTML = `
  <section class="hero-bg py-14">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      ${sectionHeader('Directory', 'Bangladesh Private Universities', 'Grading systems, waiver policies and credit requirements in one place.')}
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        ${UNIVERSITIES.map(u => `
          <a href="#/universities/${u.id}" class="card card-hover p-6 flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center font-display font-bold text-white" style="background:${u.color}">${u.name.slice(0,2).toUpperCase()}</div>
              ${u.verified ? `<span class="badge" style="background:color-mix(in srgb, var(--accent) 15%, transparent); color:#16803d">Full Policy</span>` : `<span class="badge" style="background:color-mix(in srgb, var(--border) 60%, transparent); color:var(--ink-soft)">Demo Data</span>`}
            </div>
            <div>
              <h3 class="font-display font-bold">${u.name}</h3>
              <p class="text-xs mt-1" style="color:var(--ink-soft)">${u.fullName}</p>
            </div>
            <p class="text-sm" style="color:var(--ink-soft)">${u.description}</p>
            <div class="text-xs mt-1" style="color:var(--ink-soft)">Min Graduation CGPA: <strong style="color:var(--ink)">${u.minGraduationCGPA.toFixed(2)}</strong></div>
          </a>`).join('')}
      </div>
    </div>
  </section>`;
}

function pageUniversityDetail(id) {
  const u = findUniversity(id);
  if (!u) { page404(); return; }
  view.innerHTML = `
  <section class="hero-bg py-14">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <a href="#/universities" class="text-sm" style="color:var(--ink-soft)">← All universities</a>
      <div class="flex items-center gap-4 mt-4 mb-8">
        <div class="w-16 h-16 rounded-2xl flex items-center justify-center font-display font-bold text-white text-xl" style="background:${u.color}">${u.name.slice(0,2).toUpperCase()}</div>
        <div>
          <h1 class="font-display font-extrabold text-3xl">${u.name}</h1>
          <p style="color:var(--ink-soft)">${u.fullName}</p>
        </div>
      </div>

      <div class="grid lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 grid gap-6">
          <div class="card p-6">
            <h3 class="font-display font-bold mb-3">Overview</h3>
            <p class="text-sm" style="color:var(--ink-soft)">${u.description}</p>
            <div class="grid sm:grid-cols-2 gap-4 mt-5 text-sm">
              <div><div style="color:var(--ink-soft)" class="text-xs">Minimum Graduation CGPA</div><div class="font-mono font-bold">${u.minGraduationCGPA.toFixed(2)}</div></div>
              <div><div style="color:var(--ink-soft)" class="text-xs">Credit Requirement</div><div class="font-semibold">${u.creditRequirement}</div></div>
              <div class="sm:col-span-2"><div style="color:var(--ink-soft)" class="text-xs">Retake Policy</div><div class="font-semibold">${u.retakePolicy}</div></div>
            </div>
          </div>

          <div class="card p-6">
            <h3 class="font-display font-bold mb-3">Grading Scale</h3>
            <table class="w-full text-sm">
              <thead><tr class="text-left text-xs" style="color:var(--ink-soft)"><th class="py-2">Grade</th><th>Marks Range</th><th>Point</th></tr></thead>
              <tbody>${u.gradingScale.map(g => `<tr class="table-row"><td class="py-1.5">${g.grade}</td><td>${g.min}-${g.max}</td><td class="font-mono">${g.point.toFixed(2)}</td></tr>`).join('')}</tbody>
            </table>
          </div>

          <div class="card p-6">
            <h3 class="font-display font-bold mb-3">Entry Waiver (Admission)</h3>
            <div class="grid gap-2">
              ${u.entryWaiver.map(w => `<div class="flex items-center justify-between p-3 rounded-xl" style="background:color-mix(in srgb, var(--primary) 6%, transparent)"><span class="text-sm">${w.label}</span><span class="font-mono font-bold">${w.value}</span></div>`).join('')}
            </div>
          </div>

          <div class="card p-6">
            <h3 class="font-display font-bold mb-3">Continuing Semester Waiver</h3>
            <div class="grid gap-2">
              ${u.continuingWaiver.map(w => `<div class="flex items-center justify-between p-3 rounded-xl" style="background:color-mix(in srgb, var(--accent) 8%, transparent)"><span class="text-sm">CGPA ${w.min.toFixed(2)}–${w.max.toFixed(2)}</span><span class="font-mono font-bold">${w.percent}%</span></div>`).join('')}
            </div>
            <p class="text-xs mt-3" style="color:var(--ink-soft)">Waiver applies to: ${u.waiverAppliesTo}</p>
          </div>
        </div>

        <div class="grid gap-6 content-start">
          <div class="card p-6">
            <h3 class="font-display font-bold mb-3">Minimum Waiver CGPA by Category</h3>
            <div class="grid gap-2 text-sm">
              ${Object.entries(u.minWaiverCGPAByDept).map(([k,v]) => `<div class="flex justify-between"><span style="color:var(--ink-soft)">${k}</span><span class="font-mono font-bold">${v.toFixed(2)}</span></div>`).join('')}
            </div>
          </div>
          <div class="card p-6">
            <h3 class="font-display font-bold mb-3">Departments</h3>
            <div class="flex flex-wrap gap-2">${u.departments.map(d => `<span class="badge" style="background:color-mix(in srgb, var(--border) 60%, transparent)">${d}</span>`).join('')}</div>
          </div>
          <a href="#/waiver" class="btn-primary px-5 py-3 text-center">Calculate My Waiver</a>
        </div>
      </div>
      ${!u.verified ? `<p class="text-xs mt-8" style="color:var(--ink-soft)">${ADMIN_NOTE}</p>` : ''}
    </div>
  </section>`;
}

/* ============================================================
   DASHBOARD
   ============================================================ */
function pageDashboard() {
  const saved = getSaved();
  view.innerHTML = `
  <section class="hero-bg py-14">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="font-display font-extrabold text-3xl mb-2">Your Dashboard</h1>
      <p style="color:var(--ink-soft)" class="mb-8">Calculations saved from this browser (stored locally on your device).</p>

      ${saved.length === 0 ? `
        <div class="empty-state p-14 text-center">
          <div class="text-3xl mb-3">📭</div>
          <h3 class="font-display font-bold mb-1">No saved calculations yet</h3>
          <p class="text-sm mb-5" style="color:var(--ink-soft)">Run a CGPA calculation and hit "Save to Dashboard" to see it here.</p>
          <a href="#/cgpa" class="btn-primary px-5 py-2.5 inline-block">Go to CGPA Calculator</a>
        </div>` : `
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          ${saved.map(s => `
            <div class="card p-5">
              <div class="flex items-center justify-between mb-2">
                <span class="badge" style="background:color-mix(in srgb, var(--primary) 12%, transparent); color:var(--primary)">${s.type}</span>
                <span class="text-xs" style="color:var(--ink-soft)">${new Date(s.ts).toLocaleDateString()}</span>
              </div>
              <pre class="text-xs overflow-hidden text-ellipsis" style="max-height:120px; color:var(--ink-soft)">${JSON.stringify(s.payload, null, 1).slice(0,240)}</pre>
            </div>`).join('')}
        </div>
        <button id="clear-saved" class="btn-ghost px-5 py-2.5 mt-6">Clear all saved data</button>
      `}
    </div>
  </section>`;
  const clearBtn = document.getElementById('clear-saved');
  if (clearBtn) clearBtn.addEventListener('click', () => { localStorage.removeItem('unicalc-saved'); pageDashboard(); });
}

/* ============================================================
   BLOG
   ============================================================ */
const BLOG_POSTS = [
  { slug: 'how-to-calculate-sgpa', title: 'How to Calculate SGPA (Step by Step)', excerpt: 'A plain-language walkthrough of the SGPA formula with a worked example.' },
  { slug: 'how-to-calculate-cgpa', title: 'How to Calculate CGPA Across Semesters', excerpt: 'Understand how each semester\'s credits and SGPA combine into your CGPA.' },
  { slug: 'best-cgpa-for-scholarship', title: 'What CGPA Do You Need for a Scholarship?', excerpt: 'A look at common CGPA brackets used for merit-based tuition waivers.' },
  { slug: 'bubt-waiver-guide', title: 'BUBT Waiver Guide: Entry & Continuing Brackets', excerpt: 'Breaking down BUBT\'s entry waiver and semester-by-semester waiver rules.' },
  { slug: 'brac-gpa-calculator', title: 'Using a GPA Calculator for BRAC University', excerpt: 'How BRAC\'s grading scale compares and what to watch for when calculating.' },
  { slug: 'nsu-gpa-calculator', title: 'NSU GPA Calculator: Common Questions Answered', excerpt: 'Frequently asked questions students have about tracking GPA at NSU.' },
];
function pageBlog() {
  view.innerHTML = `
  <section class="hero-bg py-14">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      ${sectionHeader('Blog', 'Guides for Academic Planning', 'Practical explainers on GPA, CGPA and waiver calculations.')}
      <div class="grid sm:grid-cols-2 gap-5">
        ${BLOG_POSTS.map(p => `
          <div class="card card-hover p-6">
            <h3 class="font-display font-bold mb-2">${p.title}</h3>
            <p class="text-sm" style="color:var(--ink-soft)">${p.excerpt}</p>
          </div>`).join('')}
      </div>
    </div>
  </section>`;
}

/* ============================================================
   FAQ
   ============================================================ */
function pageFAQ() {
  const faqs = [
    ['How is SGPA different from CGPA?', 'SGPA reflects a single semester\'s performance, while CGPA is the cumulative average across every completed semester, weighted by credit hours.'],
    ['Does a retake replace my old grade?', 'This depends on your university\'s policy. BUBT does not allow optional retakes once a course is passed — only failed courses require a mandatory retake.'],
    ['Is the waiver applied to all fees?', 'For BUBT and most universities modeled here, the tuition waiver applies only to the tuition fee, not to admission or other charges.'],
    ['Is my data saved anywhere?', 'Saved calculations are stored only in your browser\'s local storage — nothing is sent to a server in this version.'],
  ];
  view.innerHTML = `
  <section class="hero-bg py-14">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      ${sectionHeader('FAQ', 'Frequently Asked Questions', '')}
      <div class="grid gap-3">
        ${faqs.map(([q,a],i) => `
          <div class="card p-5">
            <button class="faq-q w-full text-left font-semibold flex items-center justify-between" data-i="${i}">
              ${q} <span class="faq-icon">+</span>
            </button>
            <div class="faq-a text-sm mt-2 hidden" style="color:var(--ink-soft)">${a}</div>
          </div>`).join('')}
      </div>
    </div>
  </section>`;
  document.querySelectorAll('.faq-q').forEach(btn => btn.addEventListener('click', () => {
    const a = btn.nextElementSibling;
    a.classList.toggle('hidden');
    btn.querySelector('.faq-icon').textContent = a.classList.contains('hidden') ? '+' : '−';
  }));
}

/* ============================================================
   ABOUT / CONTACT / LEGAL / 404
   ============================================================ */
function pageAbout() {
  view.innerHTML = `
  <section class="hero-bg py-14">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="font-display font-extrabold text-3xl mb-4">About UniCalc BD</h1>
      <p style="color:var(--ink-soft)" class="mb-4">UniCalc BD is a free academic calculator built for students at Bangladesh's private universities. It started with a fully modeled BUBT grading and waiver system, and is expanding to cover more institutions.</p>
      <p style="color:var(--ink-soft)">This is a demo build — figures for universities beyond BUBT are illustrative and should be verified against each institution's official policy before relying on them.</p>
    </div>
  </section>`;
}
function pageContact() {
  view.innerHTML = `
  <section class="hero-bg py-14">
    <div class="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="font-display font-extrabold text-3xl mb-6">Contact Us</h1>
      <form class="card p-6 grid gap-4" onsubmit="event.preventDefault(); alert('Thanks — this demo form does not send data anywhere yet.');">
        <input class="input px-3 py-2" placeholder="Your name" required>
        <input class="input px-3 py-2" type="email" placeholder="Email address" required>
        <textarea class="input px-3 py-2" rows="4" placeholder="Message" required></textarea>
        <button class="btn-primary px-5 py-2.5">Send Message</button>
      </form>
    </div>
  </section>`;
}
function pageLegal(title, key) {
  return function() {
    view.innerHTML = `
    <section class="hero-bg py-14">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 class="font-display font-extrabold text-3xl mb-4">${title}</h1>
        <p style="color:var(--ink-soft)">This is placeholder ${key} text for the demo build of UniCalc BD. Replace with your organization's actual ${title.toLowerCase()} before launch.</p>
      </div>
    </section>`;
  };
}
function page404() {
  view.innerHTML = `
  <section class="hero-bg py-24 text-center">
    <div class="max-w-md mx-auto px-4">
      <div class="text-5xl mb-4">🧭</div>
      <h1 class="font-display font-extrabold text-3xl mb-2">Page not found</h1>
      <p style="color:var(--ink-soft)" class="mb-6">That page doesn't exist. Let's get you back on track.</p>
      <a href="#/" class="btn-primary px-6 py-3 inline-block">Back to Home</a>
    </div>
  </section>`;
}
