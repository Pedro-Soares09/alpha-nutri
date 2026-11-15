'use strict';
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

// Cabeçalho + barra de progresso + parallax do hero (um único listener)
(function scroll() {
  const header = $('.site-header'), bar = $('.progress i');
  const layers = $$('[data-depth]');
  let ticking = false;
  const update = () => {
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    header.classList.toggle('scrolled', y > 40);
    bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    if (!reduce && y < innerHeight) layers.forEach(l => l.style.transform = `translate3d(0,${y * l.dataset.depth * -3}px,0)`);
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();
})();

// Tema claro/escuro
(function theme() {
  const btn = $('#theme-toggle'), root = document.documentElement, meta = $('meta[name="theme-color"]');
  const apply = t => {
    root.dataset.theme = t;
    btn.setAttribute('aria-pressed', t === 'light');
    btn.setAttribute('aria-label', t === 'light' ? 'Ativar tema escuro' : 'Ativar tema claro');
    meta.content = t === 'light' ? '#e8dff1' : '#0d0418';
  };
  apply(root.dataset.theme === 'light' ? 'light' : 'dark');
  btn.addEventListener('click', () => {
    const t = root.dataset.theme === 'light' ? 'dark' : 'light';
    apply(t);
    try { localStorage.setItem('alphanutri_theme', t); } catch (e) { }
  });
})();

// Menu mobile
(function menu() {
  const btn = $('#btn-menu'), nav = $('#main-nav');
  const set = open => {
    nav.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
    btn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.style.overflow = open ? 'hidden' : '';
  };
  btn.addEventListener('click', () => set(!nav.classList.contains('open')));
  $$('a', nav).forEach(a => a.addEventListener('click', () => set(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
  matchMedia('(min-width: 861px)').addEventListener('change', () => set(false));
})();

// Revelação ao rolar, com escalonamento dentro de cada grupo
(function reveal() {
  const els = $$('.rv');
  if (reduce || !('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
  els.forEach(el => {
    const sibs = $$(':scope > .rv', el.parentElement);
    el.style.transitionDelay = `${Math.min(sibs.indexOf(el), 5) * 90}ms`;
  });
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
  els.forEach(e => io.observe(e));
})();

// Contadores
(function counters() {
  const els = $$('[data-count]');
  const run = el => {
    const target = +el.dataset.count, suf = el.dataset.suffix || '', t0 = performance.now(), d = 1800;
    const step = now => {
      const p = Math.min((now - t0) / d, 1);
      el.textContent = Math.round((1 - Math.pow(1 - p, 4)) * target) + suf;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (reduce || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { run(e.target); io.unobserve(e.target); }
  }), { threshold: .6 });
  els.forEach(e => { e.textContent = '0' + (e.dataset.suffix || ''); io.observe(e); });
})();

// Menu ativo
(function spy() {
  const links = $$('.main-nav a[href^="#"]');
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => io.observe(s));
})();

// Spotlight nos cartões e brilho que segue o cursor (apenas mouse)
(function pointer() {
  if (!fine || reduce) return;
  $$('.spot').forEach(c => c.addEventListener('pointermove', e => {
    const r = c.getBoundingClientRect();
    c.style.setProperty('--x', e.clientX - r.left + 'px');
    c.style.setProperty('--y', e.clientY - r.top + 'px');
  }));
})();

// Formulário com validação e mensagem acessível
(function form() {
  const f = $('#contact-form'), status = $('#form-status');
  const btn = $('button[type="submit"]', f);
  f.addEventListener('submit', async e => {
    e.preventDefault();
    let ok = true;
    $$('input,textarea', f).forEach(i => {
      const bad = !i.value.trim() || (i.type === 'email' && !i.checkValidity());
      i.classList.toggle('err', bad);
      i.setAttribute('aria-invalid', bad);
      if (bad) ok = false;
    });
    status.classList.toggle('bad', !ok);
    if (!ok) { status.textContent = 'Preencha todos os campos com um e-mail válido.'; return; }
    btn.disabled = true; btn.textContent = 'Enviando...';
    try {
      // Substitua por fetch() para o seu endpoint de e-mail/backend
      await new Promise(r => setTimeout(r, 900));
      status.textContent = 'Mensagem enviada. Retornaremos em até 24 horas.';
      f.reset();
    } catch {
      status.classList.add('bad');
      status.textContent = 'Não foi possível enviar. Tente novamente ou ligue para (81) 3003-6212.';
    } finally { btn.disabled = false; btn.textContent = 'Enviar mensagem'; }
  });
})();

$('#year').textContent = new Date().getFullYear();