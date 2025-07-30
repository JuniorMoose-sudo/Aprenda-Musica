document.addEventListener('DOMContentLoaded', () => {

  // 1. Scroll suave com offset para header fixo
  function setupSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
      link.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        const target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();

        const headerOffset = document.querySelector('header')?.offsetHeight || 70;
        const offsetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

        // Atualiza a URL sem recarregar
        if (history.pushState) {
          history.pushState(null, null, targetId);
        } else {
          window.location.hash = targetId;
        }
      });
    });
  }

  // 2. Sistema de animações com Intersection Observer
  function setupAnimations() {
    const elements = document.querySelectorAll('[data-animate], .column, .testimonial, section ul, .about p, form, .faq li, .features li');

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate', 'show');
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      });

      elements.forEach(el => observer.observe(el));
    } else {
      // Fallback para navegadores antigos
      const checkAndAnimate = () => {
        const trigger = window.innerHeight * 0.85;
        elements.forEach(el => {
          if (el.getBoundingClientRect().top < trigger) {
            el.classList.add('animate', 'show');
          }
        });
      };

      window.addEventListener('scroll', checkAndAnimate);
      checkAndAnimate();
    }
  }

  // 3. Botão "Voltar ao Topo"
  function setupBackToTop() {
    const button = document.createElement('button');
    button.className = 'back-to-top';
    button.innerHTML = '↑';
    button.setAttribute('aria-label', 'Voltar ao topo');
    document.body.appendChild(button);

    window.addEventListener('scroll', () => {
      button.classList.toggle('show', window.pageYOffset > 300);
    });

    button.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // 4. Menu Mobile Responsivo
  function setupMobileMenu() {
    const nav = document.querySelector('nav');
    if (!nav || document.querySelector('.menu-toggle')) return;

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'menu-toggle';
    toggleBtn.innerHTML = '☰';
    toggleBtn.setAttribute('aria-label', 'Abrir menu');
    toggleBtn.setAttribute('aria-expanded', 'false');
    nav.parentNode.insertBefore(toggleBtn, nav);

    toggleBtn.addEventListener('click', () => {
      const expanded = toggleBtn.getAttribute('aria-expanded') === 'true';
      toggleBtn.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('active');
      toggleBtn.classList.toggle('active');
      document.body.classList.toggle('menu-open');
    });

    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggleBtn.setAttribute('aria-expanded', 'false');
        nav.classList.remove('active');
        toggleBtn.classList.remove('active');
        document.body.classList.remove('menu-open');
      });
    });
  }

  // 5. Efeitos de Hover em Cards
  function setupCardHoverEffects() {
    const cards = document.querySelectorAll('.card, .column, .testimonial');
    cards.forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });
  }

  // 6. Feedback do Formulário Aprimorado
  function setupFormFeedback() {
    const form = document.querySelector('form');
    if (!form) return;

    const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
    if (!submitBtn) return;

    const originalContent = submitBtn.innerHTML;

    form.addEventListener('submit', e => {
      e.preventDefault();
      if (submitBtn.disabled) return;

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner"></span> Enviando...';

      // Simula envio — troque por fetch/post real
      setTimeout(() => {
        const oldFeedback = form.querySelector('.form-feedback');
        if (oldFeedback) oldFeedback.remove();

        const feedback = document.createElement('div');
        feedback.className = 'form-feedback success';
        feedback.setAttribute('aria-live', 'polite');
        feedback.innerHTML = `
          <svg viewBox="0 0 24 24" width="24" height="24" fill="green">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
          </svg>
          <span>Obrigado! Em breve você receberá seu material no e-mail informado.</span>
        `;

        form.appendChild(feedback);
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalContent;
        form.reset();

        setTimeout(() => {
          feedback.style.opacity = '0';
          setTimeout(() => feedback.remove(), 300);
        }, 5000);
      }, 1500);
    });
  }

  // 7. Inicialização
  function init() {
    setupSmoothScroll();
    setupAnimations();
    setupBackToTop();
    setupMobileMenu();
    setupCardHoverEffects();
    setupFormFeedback();

    // Força animações ao carregar
    setTimeout(() => window.dispatchEvent(new Event('scroll')), 500);
  }

  init();
});
