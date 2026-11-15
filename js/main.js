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


// Ir ao formulário com mensagem preenchida
const goContact = msg => {
  const m = $('#mensagem');
  if (m) m.value = msg;
  $('#contato').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  setTimeout(() => $('#nome').focus({ preventScroll: true }), reduce ? 0 : 700);
};

// Quiz de objetivo
(function quiz() {
  const Q = [
    {
      q: 'Qual é o seu principal objetivo?', o: [
        { t: 'Ganhar massa muscular', s: { whey: 3 } },
        { t: 'Emagrecer com saúde', s: { termo: 2, whey: 1 } },
        { t: 'Ter mais energia e disposição', s: { termo: 2, vitd: 1 } },
        { t: 'Cuidar da saúde em geral', s: { vitd: 2 } }]
    },
    {
      q: 'Quantas vezes por semana você treina?', o: [
        { t: 'Até 1 vez', s: { vitd: 1 } },
        { t: '2 a 3 vezes', s: { whey: 1 } },
        { t: '4 vezes ou mais', s: { whey: 2, termo: 1 } }]
    },
    {
      q: 'Como está a sua alimentação?', o: [
        { t: 'Tenho dificuldade de atingir minha meta de proteína', s: { whey: 2 } },
        { t: 'Pulo refeições com frequência', s: { termo: 1, vitd: 1 } },
        { t: 'Como bem e em horários regulares', s: {} }]
    },
    {
      q: 'Quanto tempo você passa ao sol?', o: [
        { t: 'Pouco, fico a maior parte do dia em ambientes fechados', s: { vitd: 2 } },
        { t: 'Algumas vezes por semana', s: { vitd: 1 } },
        { t: 'Bastante, quase todo dia', s: {} }]
    }
  ];
  const P = {
    whey: ['Whey Protein', 'Ajuda a completar a meta diária de proteína e a recuperação depois do treino.'],
    vitd: ['Vitamina D', 'Costuma ser considerada por quem tem pouca exposição ao sol. Vale confirmar com exame.'],
    termo: ['Termogênico Natural', 'Apoio de energia e foco durante os treinos e na rotina.']
  };
  const stage = $('#quiz-stage'), bar = $('#quiz-bar');
  let picks = [];
  const focusTitle = () => { const t = $('#q-title'); if (t) t.focus({ preventScroll: true }); };

  const render = () => {
    bar.style.width = (picks.length / Q.length * 100) + '%';
    if (picks.length >= Q.length) return result();
    const i = picks.length, q = Q[i];
    stage.innerHTML = `<p class="q-step">Pergunta ${i + 1} de ${Q.length}</p>
      <h3 id="q-title" tabindex="-1">${q.q}</h3>
      <div class="opts" role="group" aria-labelledby="q-title">${q.o.map((o, k) => `<button type="button" class="opt" data-k="${k}">${o.t}</button>`).join('')}</div>
      ${i ? '<button type="button" class="q-back" data-act="back">Voltar</button>' : ''}`;
    if (i) focusTitle();
  };

  const result = () => {
    const sc = { whey: 0, vitd: 0, termo: 0 };
    picks.forEach((k, i) => Object.entries(Q[i].o[k].s).forEach(([p, v]) => sc[p] += v));
    const top = Object.keys(sc).sort((a, b) => sc[b] - sc[a]).filter(p => sc[p] > 0).slice(0, 2);
    const names = top.map(p => P[p][0]);
    stage.innerHTML = `<p class="q-step">Resultado</p>
      <h3 id="q-title" tabindex="-1">Sua recomendação inicial</h3>
      ${top.length ? `<ul class="rec">${top.map(p => `<li><strong>${P[p][0]}</strong><span>${P[p][1]}</span></li>`).join('')}</ul>` : '<p class="note">Pelo seu perfil, o melhor primeiro passo é uma avaliação individual com a nossa equipe.</p>'}
      <p class="note">Recomendação inicial, sem caráter de prescrição. A indicação ideal depende de uma avaliação individual.</p>
      <div class="q-actions"><button type="button" class="btn btn-green" data-act="book">Agendar consulta</button><button type="button" class="btn btn-ghost" data-act="again">Refazer o quiz</button></div>`;
    focusTitle();
    stage.dataset.msg = `Fiz o quiz no site. Meu objetivo: ${Q[0].o[picks[0]].t.toLowerCase()}. Recomendação inicial: ${names.join(' e ') || 'avaliação individual'}. Gostaria de agendar uma consulta.`;
  };

  stage.addEventListener('click', e => {
    const opt = e.target.closest('.opt'), act = e.target.closest('[data-act]')?.dataset.act;
    if (opt) {
      opt.classList.add('on');
      picks.push(+opt.dataset.k);
      setTimeout(render, reduce ? 0 : 280);
    } else if (act === 'back') { picks.pop(); render(); }
    else if (act === 'again') { picks = []; render(); }
    else if (act === 'book') goContact(stage.dataset.msg);
  });
  render();
})();

// Calculadoras: IMC, proteína e água
(function calc() {
  const $v = id => $('#' + id);
  const peso = $v('c-peso'), alt = $v('c-altura'), obj = $v('c-obj'), tr = $v('c-treino'), cta = $v('calc-cta');
  const faixa = { saude: [0.8, 1.2], massa: [1.6, 2.2], emagrecer: [1.6, 2.0] };
  const cat = i => i < 18.5 ? 'Abaixo do peso' : i < 25 ? 'Peso adequado' : i < 30 ? 'Sobrepeso' : 'Obesidade';
  const fmt = n => n.toFixed(1).replace('.', ',');
  let msg = '';
  const update = () => {
    const p = peso.valueAsNumber, a = alt.valueAsNumber;
    const ok = p >= 30 && p <= 300 && a >= 120 && a <= 230;
    cta.disabled = !ok;
    if (!ok) {
      ['o-imc', 'o-prot', 'o-agua'].forEach(id => $v(id).textContent = '--');
      $v('o-imc-n').textContent = 'Informe peso (30 a 300 kg) e altura (120 a 230 cm).';
      return;
    }
    const imc = p / Math.pow(a / 100, 2), [lo, hi] = faixa[obj.value].map(f => Math.round(f * p));
    const agua = (p * 35 + parseFloat(tr.value) * 500) / 1000;
    $v('o-imc').textContent = fmt(imc);
    $v('o-imc-n').textContent = cat(imc);
    $v('o-prot').textContent = `${lo} a ${hi} g`;
    $v('o-agua').textContent = `${fmt(agua)} L`;
    msg = `Usei as calculadoras do site. Peso ${p} kg, altura ${a} cm, IMC ${fmt(imc)}. Proteína estimada de ${lo} a ${hi} g por dia e água de ${fmt(agua)} L por dia. Gostaria de uma orientação personalizada.`;
  };
  [peso, alt, obj, tr].forEach(el => el.addEventListener('input', update));
  cta.addEventListener('click', () => goContact(msg));
  update();
})();

$('#year').textContent = new Date().getFullYear();