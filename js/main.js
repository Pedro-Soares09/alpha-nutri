/**
 * Alpha Nutri — main.js
 * Interatividade moderna e de alta performance
 */

'use strict';

// ─── 1. HEADER SCROLL & STICKY ────────────────────────
(function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// ─── 2. MENU MOBILE ───────────────────────────────────
(function initMenu() {
  const btnMenu = document.getElementById('btn-menu');
  const nav     = document.getElementById('main-nav');
  if (!btnMenu || !nav) return;

  btnMenu.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    btnMenu.setAttribute('aria-expanded', isOpen);
    btnMenu.textContent = isOpen ? '✕' : '☰';
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      btnMenu.setAttribute('aria-expanded', 'false');
      btnMenu.textContent = '☰';
      document.body.style.overflow = '';
    });
  });

  document.addEventListener('click', e => {
    if (!nav.contains(e.target) && !btnMenu.contains(e.target)) {
      nav.classList.remove('open');
      btnMenu.setAttribute('aria-expanded', 'false');
      btnMenu.textContent = '☰';
      document.body.style.overflow = '';
    }
  });
})();

// ─── 3. ANIMAÇÃO DE SCROLL (IntersectionObserver) ────
(function initScrollAnimations() {
  const animEls = document.querySelectorAll('.animate, .animate-left, .animate-right, .animate-scale');
  if (!animEls.length) return;

  if (!('IntersectionObserver' in window)) {
    animEls.forEach(el => { el.style.animationPlayState = 'running'; el.style.opacity = '1'; });
    return;
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = 'running';
          entry.target.style.opacity = '1';
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  animEls.forEach(el => {
    el.style.animationPlayState = 'paused';
    observer.observe(el);
  });
})();

// ─── 4. CONTADORES DO HERO ────────────────────────────
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const formatValue = (val, suffix) => `${val}${suffix || ''}`;

  const animateCounter = el => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1600;
    const start = performance.now();

    const step = now => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      el.textContent = formatValue(current, suffix);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
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
    { threshold: 0.4 }
  );

  counters.forEach(counter => observer.observe(counter));
})();

// ─── 5. SCROLLSPY (Menu Ativo) ────────────────────────
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
    { rootMargin: '-25% 0px -65% 0px' }
  );

  sections.forEach(section => observer.observe(section));
})();

// ─── 6. FORMULÁRIO DE CONTATO ─────────────────────────
(function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const submitBtn = form.querySelector('[type="submit"]');
    const originalText = submitBtn.textContent;

    submitBtn.textContent = 'Enviando...';
    submitBtn.disabled = true;

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      submitBtn.textContent = '✓ Mensagem enviada com sucesso!';
      submitBtn.style.background = 'linear-gradient(135deg, #4b9c58, #2e7d32)';
      submitBtn.style.color = '#ffffff';

      form.reset();

      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.style.background = '';
        submitBtn.style.color = '';
        submitBtn.disabled = false;
      }, 4000);
    } catch (err) {
      submitBtn.textContent = '✗ Erro ao enviar. Tente novamente.';
      submitBtn.style.background = '#c0392b';
      submitBtn.style.color = '#ffffff';

      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.style.background = '';
        submitBtn.style.color = '';
        submitBtn.disabled = false;
      }, 3000);
    }
  });
})();

// ─── 7. THEME TOGGLE ──────────────────────────────────
(function initThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  const savedTheme = localStorage.getItem('alphanutri_theme') || 'dark';
  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
    toggle.textContent = '☀️';
  } else {
    toggle.textContent = '🌙';
  }

  toggle.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light-mode');
    localStorage.setItem('alphanutri_theme', isLight ? 'light' : 'dark');
    toggle.textContent = isLight ? '☀️' : '🌙';
  });
})();

// ─── 8. ANO DINÂMICO ──────────────────────────────────
(function setYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
