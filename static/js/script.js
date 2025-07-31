document.addEventListener('DOMContentLoaded', () => {
  // 1. Scroll suave com offset para header fixo
  function setupSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
      link.addEventListener('click', function(e) {
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
            observer.unobserve(entry.target);
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

    const toggleVisibility = () => {
      button.classList.toggle('show', window.pageYOffset > 300);
    };

    window.addEventListener('scroll', toggleVisibility);
    toggleVisibility();

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

    const toggleMenu = () => {
      const expanded = toggleBtn.getAttribute('aria-expanded') === 'true';
      toggleBtn.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('active');
      toggleBtn.classList.toggle('active');
      document.body.classList.toggle('menu-open');
    };

    toggleBtn.addEventListener('click', toggleMenu);

    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (nav.classList.contains('active')) {
          toggleMenu();
        }
      });
    });
  }

  // 5. Efeitos de Hover em Cards
  function setupCardHoverEffects() {
    const cards = document.querySelectorAll('.card, .column, .testimonial');
    
    const handleMouseMove = (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
      e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
    };

    cards.forEach(card => {
      card.addEventListener('mousemove', handleMouseMove);
    });
  }

  // 6. Feedback do Formulário Aprimorado
  function setupFormFeedback() {
  const forms = document.querySelectorAll('form:not(#formAgendamento)');
  
  forms.forEach(form => {
    const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
    if (!submitBtn) return;

    const originalContent = submitBtn.innerHTML;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (submitBtn.disabled) return;

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner"></span> Enviando...';

      try {
        const response = await fetch('https://sua-api.com/endpoint', {
          method: 'POST',
          body: new FormData(form)
        });

        const oldFeedback = form.querySelector('.form-feedback');
        if (oldFeedback) oldFeedback.remove();

        const feedback = document.createElement('div');
        feedback.className = 'form-feedback';
        feedback.setAttribute('aria-live', 'polite');

        if (response.ok) {
          feedback.classList.add('success');
          feedback.innerHTML = `
            <svg viewBox="0 0 24 24" width="24" height="24" fill="green">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
            </svg>
            <span>Obrigado! Seu formulário foi enviado com sucesso.</span>
          `;
          form.reset();
        } else {
          feedback.classList.add('error');
          feedback.innerHTML = `
            <svg viewBox="0 0 24 24" width="24" height="24" fill="red">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <span>Erro ao enviar. Por favor, tente novamente.</span>
          `;
        }

        form.appendChild(feedback);

        setTimeout(() => {
          feedback.style.opacity = '0';
          setTimeout(() => feedback.remove(), 300);
        }, 5000);

      } catch (error) {
        console.error('Erro:', error);
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalContent;
      }
    });
  });
}


  // 7. Sistema de Calendário - Versão Corrigida
  function setupCalendar() {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl || !window.FullCalendar) return;

    let calendar;
    let isLoading = false;
    let eventoSelecionado = null;

    function showAlert(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alertDiv.style.top = '20px';
        alertDiv.style.right = '20px';
        alertDiv.style.zIndex = '9999';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            alertDiv.classList.remove('show');
            setTimeout(() => alertDiv.remove(), 150);
        }, 5000);
    }

    function initCalendar() {
        calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            locale: 'pt-br',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek'
            },
            events: async function(fetchInfo, successCallback, failureCallback) {
                if (isLoading) return;
                
                isLoading = true;
                try {
                    const response = await fetch('/api/aulas');
                    if (!response.ok) throw new Error('Erro ao carregar agendamentos');

                    const data = await response.json();
                    const eventos = data.map(aula => ({
                        id: aula.id,
                        title: `${aula.aluno} (${aula.professor})`,
                        start: `${aula.data}T${aula.horario}`,
                        backgroundColor: getCorInstrumento(aula.professor)
                    }));
                    successCallback(eventos);
                } catch (error) {
                    console.error('Erro:', error);
                    failureCallback(error);
                    showAlert('Falha ao carregar agendamentos', 'danger');
                } finally {
                    isLoading = false;
                }
            },
            dateClick: function(info) {
                eventoSelecionado = null;
                document.getElementById('formAgendamento').reset();
                document.getElementById('dataSelecionada').value = info.dateStr;
                document.getElementById('btnSalvar').textContent = "Agendar Aula";
                document.getElementById('btnExcluir').style.display = 'none';
                new bootstrap.Modal(document.getElementById('modalAgendamento')).show();
            },
            eventClick: function(info) {
                eventoSelecionado = info.event;
                document.getElementById('dataSelecionada').value = info.event.startStr.slice(0, 10);
                document.getElementById('hora').value = info.event.startStr.slice(11, 16);
                document.getElementById('nomeAluno').value = info.event.title.split(' (')[0];
                document.getElementById('instrumento').value = info.event.title.split('(')[1]?.replace(')', '') || '';
                document.getElementById('btnSalvar').textContent = "Salvar Alterações";
                document.getElementById('btnExcluir').style.display = 'inline-block';
                new bootstrap.Modal(document.getElementById('modalAgendamento')).show();
            }
        });
        
        calendar.render();
        loadInitialEvents();
    }

    async function loadInitialEvents() {
        try {
            const response = await fetch('/api/aulas');
            if (!response.ok) throw new Error('Erro ao carregar agendamentos');
            
            const data = await response.json();
            const eventos = data.map(aula => ({
                id: aula.id,
                title: `${aula.aluno} (${aula.professor})`,
                start: `${aula.data}T${aula.horario}`,
                backgroundColor: getCorInstrumento(aula.professor)
            }));
            
            calendar.addEventSource(eventos);
        } catch (error) {
            console.error('Erro:', error);
            showAlert('Falha ao carregar agendamentos', 'danger');
        }
    }

    function getCorInstrumento(professor) {
        const cores = {
            'Teclado': '#4e73df',
            'Violão': '#1cc88a',
            'Canto': '#36b9cc'
        };
        return cores[professor] || '#858796';
    }

    function setupForm() {
        const form = document.getElementById('formAgendamento');
        if (!form) return;

        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = document.getElementById('btnSalvar');
            const originalText = submitBtn.textContent;
            
            try {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Salvando...';

                const dados = {
                    aluno: document.getElementById('nomeAluno').value.trim(),
                    professor: document.getElementById('instrumento').value.trim(),
                    horario: document.getElementById('hora').value.trim(),
                    data: document.getElementById('dataSelecionada').value.trim()
                };

                if (!dados.aluno || !dados.professor || !dados.horario || !dados.data) {
                    throw new Error('Preencha todos os campos obrigatórios');
                }

                if (eventoSelecionado) {
                    dados.id = parseInt(eventoSelecionado.id);
                }

                const response = await fetch('/api/aulas', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dados)
                });

                if (!response.ok) {
                    const error = await response.json().catch(() => ({}));
                    throw new Error(error.message || 'Erro ao salvar agendamento');
                }

                showAlert('Agendamento salvo com sucesso!', 'success');
                bootstrap.Modal.getInstance(document.getElementById('modalAgendamento')).hide();
                
                calendar.refetchEvents();
                form.reset();

            } catch (error) {
                console.error('Erro:', error);
                showAlert(error.message || 'Erro ao processar agendamento', 'danger');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }

    function setupDeleteButton() {
        const btnExcluir = document.getElementById('btnExcluir');
        if (!btnExcluir) return;

        btnExcluir.addEventListener('click', async function() {
            if (!eventoSelecionado || !confirm('Tem certeza que deseja excluir este agendamento?')) {
                return;
            }

            const originalText = btnExcluir.textContent;
            
            try {
                btnExcluir.disabled = true;
                btnExcluir.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Excluindo...';

                const response = await fetch(`/api/aulas/${eventoSelecionado.id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    throw new Error('Erro ao excluir agendamento');
                }

                showAlert('Agendamento excluído com sucesso!', 'success');
                bootstrap.Modal.getInstance(document.getElementById('modalAgendamento')).hide();
                
                calendar.refetchEvents();

            } catch (error) {
                console.error('Erro:', error);
                showAlert('Falha ao excluir agendamento', 'danger');
            } finally {
                btnExcluir.disabled = false;
                btnExcluir.textContent = originalText;
            }
        });
    }

    initCalendar();
    setupForm();
    setupDeleteButton();
  }

  // Inicialização de todas as funcionalidades
  function init() {
    setupSmoothScroll();
    setupAnimations();
    setupBackToTop();
    setupMobileMenu();
    setupCardHoverEffects();
    setupFormFeedback();
    setupCalendar();

    requestAnimationFrame(() => {
      window.dispatchEvent(new Event('scroll'));
    });
  }

  init();
});