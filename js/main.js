/**
 * Alpha Nutri — main.js
 * Versão: 2.0.0
 *
 * Módulos:
 *  1. Menu mobile
 *  2. Scroll animation (IntersectionObserver)
 *  3. Formulário de contato
 *  4. Active nav link (scrollspy)
 *  5. Máscara de telefone
 *  6. Counter animation (estatísticas do hero)
 *  7. Year no footer
 */

'use strict';

/* ─── 1. MENU MOBILE ─────────────────────────────────── */
(function initMenu() {
  const btnMenu = document.getElementById('btn-menu');
  const nav     = document.getElementById('main-nav');
  if (!btnMenu || !nav) return;

  btnMenu.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    btnMenu.setAttribute('aria-expanded', isOpen);
    btnMenu.textContent = isOpen ? '✕' : '☰';
    // Bloqueia scroll do body quando menu aberto em mobile
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Fecha menu ao clicar em um link
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      btnMenu.setAttribute('aria-expanded', false);
      btnMenu.textContent = '☰';
      document.body.style.overflow = '';
    });
  });

  // Fecha menu ao clicar fora
  document.addEventListener('click', e => {
    if (!nav.contains(e.target) && !btnMenu.contains(e.target)) {
      nav.classList.remove('open');
      btnMenu.setAttribute('aria-expanded', false);
      btnMenu.textContent = '☰';
      document.body.style.overflow = '';
    }
  });
})();


/* ─── 2. SCROLL ANIMATION ────────────────────────────── */
(function initScrollAnimation() {
  const animEls = document.querySelectorAll('.animate');
  if (!animEls.length) return;

  // Se IntersectionObserver não estiver disponível, mostra tudo
  if (!('IntersectionObserver' in window)) {
    animEls.forEach(el => { el.style.animationPlayState = 'running'; });
    return;
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = 'running';
          observer.unobserve(entry.target); // Para de observar após animar
        }
      });
    },
    { threshold: 0.12 }
  );

  animEls.forEach(el => {
    el.style.animationPlayState = 'paused';
    observer.observe(el);
  });
})();


/* ─── 3. FORMULÁRIO DE CONTATO ───────────────────────── */
(function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const submitBtn = form.querySelector('[type="submit"]');
    const originalText = submitBtn.textContent;

    // Feedback visual de carregamento
    submitBtn.textContent = 'Enviando...';
    submitBtn.disabled = true;

    try {
      /**
       * TODO: Substituir pela chamada real à sua API ou serviço de e-mail.
       * Opções populares: FormSubmit.co, EmailJS, Formspree, backend próprio.
       *
       * Exemplo com fetch:
       *   const res = await fetch('/api/contact', {
       *     method: 'POST',
       *     headers: { 'Content-Type': 'application/json' },
       *     body: JSON.stringify(Object.fromEntries(new FormData(form)))
       *   });
       *   if (!res.ok) throw new Error('Erro ao enviar');
       */

      // Simulação de envio (remova ao integrar API real)
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Sucesso
      submitBtn.textContent = '✓ Mensagem enviada!';
      submitBtn.classList.remove('btn-lime');
      submitBtn.classList.add('btn-success');
      submitBtn.style.cssText = 'background:#1a8c3f; color:#fff;';

      form.reset();

      // Restore após 4 segundos
      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.style.cssText = '';
        submitBtn.classList.add('btn-lime');
        submitBtn.classList.remove('btn-success');
        submitBtn.disabled = false;
      }, 4000);

    } catch (err) {
      console.error('[Alpha Nutri] Erro no formulário:', err);
      submitBtn.textContent = '✗ Erro ao enviar. Tente novamente.';
      submitBtn.style.cssText = 'background:#c0392b; color:#fff;';

      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.style.cssText = '';
        submitBtn.disabled = false;
      }, 3000);
    }
  });
})();


/* ─── 4. SCROLLSPY (nav link ativo) ──────────────────── */
(function initScrollspy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.main-nav a[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${entry.target.id}`) {
              link.classList.add('active');
            }
          });
        }
      });
    },
    { rootMargin: '-30% 0px -60% 0px' }
  );

  sections.forEach(section => observer.observe(section));
})();


/* ─── 5. MÁSCARA DE TELEFONE ─────────────────────────── */
(function initPhoneMask() {
  const phoneInput = document.getElementById('phone');
  if (!phoneInput) return;

  phoneInput.addEventListener('input', e => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 11);
    if (v.length <= 2)       v = v.replace(/^(\d{0,2})/, '($1');
    else if (v.length <= 7)  v = v.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    else if (v.length <= 11) v = v.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    e.target.value = v;
  });
})();


/* ─── 6. CONTADOR ANIMADO (hero stats) ───────────────── */
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const formatValue = (val, suffix) => {
    if (suffix === '+') return `${val}+`;
    if (suffix === 'K+') return `${val}K+`;
    return `${val}`;
  };

  const animateCounter = el => {
    const target  = parseInt(el.dataset.count, 10);
    const suffix  = el.dataset.suffix || '';
    const dur     = 1500; // ms
    const start   = performance.now();

    const step = now => {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / dur, 1);
      // Easing out quart
      const eased    = 1 - Math.pow(1 - progress, 4);
      const current  = Math.round(eased * target);
      el.textContent = formatValue(current, suffix);
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(counter => observer.observe(counter));
})();


/* ─── 7. ANO DINÂMICO NO FOOTER ──────────────────────── */
(function setCurrentYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
