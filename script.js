/**
 * FITPLANILHAS - INTERACTIVE SCRIPTS
 * - Urgency Countdown Timer
 * - Dynamic Upsell Modal (Básico R$ 5,90 -> Oferta VIP R$ 19,90)
 * - Social Proof Sales Notifications (Interval ~20s)
 * - Accordion FAQ Interaction
 * - Smooth Mobile Bar Logic
 */

document.addEventListener('DOMContentLoaded', () => {

  // 1. DYNAMIC COUNTDOWN TIMER (15 Minutes Rolling Timer)
  const timerMinutesEl = document.getElementById('timer-minutes');
  const timerSecondsEl = document.getElementById('timer-seconds');
  
  if (timerMinutesEl && timerSecondsEl) {
    let duration = 14 * 60 + 59; // 14m 59s
    
    // Check if there was an existing timer in localStorage
    const savedEndTime = localStorage.getItem('fit_offer_end_time');
    const now = Math.floor(Date.now() / 1000);
    
    let endTime;
    if (savedEndTime && parseInt(savedEndTime, 10) > now) {
      endTime = parseInt(savedEndTime, 10);
    } else {
      endTime = now + duration;
      localStorage.setItem('fit_offer_end_time', endTime);
    }

    const updateTimer = () => {
      const currentTime = Math.floor(Date.now() / 1000);
      let remaining = endTime - currentTime;

      if (remaining <= 0) {
        // Reset 15 minutes rolling so urgency is always maintained
        endTime = currentTime + duration;
        localStorage.setItem('fit_offer_end_time', endTime);
        remaining = duration;
      }

      const minutes = Math.floor(remaining / 60);
      const seconds = remaining % 60;

      timerMinutesEl.textContent = minutes < 10 ? `0${minutes}` : minutes;
      timerSecondsEl.textContent = seconds < 10 ? `0${seconds}` : seconds;
    };

    updateTimer();
    setInterval(updateTimer, 1000);
  }

  // 2. UPSELL MODAL LOGIC
  const upsellModal = document.getElementById('upsell-modal');
  const modalCloseBtn = document.getElementById('modal-close');
  const openUpsellTriggers = document.querySelectorAll('.open-upsell-trigger');

  function openModal() {
    if (upsellModal) {
      upsellModal.classList.add('is-open');
      upsellModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden'; // prevent background scrolling
    }
  }

  function closeModal() {
    if (upsellModal) {
      upsellModal.classList.remove('is-open');
      upsellModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  openUpsellTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }

  // Close modal when clicking outside the dialog
  if (upsellModal) {
    upsellModal.addEventListener('click', (e) => {
      if (e.target === upsellModal) {
        closeModal();
      }
    });
  }

  // Escape key to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && upsellModal && upsellModal.classList.contains('is-open')) {
      closeModal();
    }
  });

  // 3. SOCIAL PROOF NOTIFICATIONS (Live Sales Toast Every ~20 Seconds)
  const salesToast = document.getElementById('sale-toast');
  const toastAvatar = document.getElementById('toast-avatar');
  const toastTitle = document.getElementById('toast-title');
  const toastMessage = document.getElementById('toast-message');
  const toastCloseBtn = document.getElementById('toast-close-btn');

  const buyersList = [
    { name: "Lucas R.", location: "São Paulo - SP", item: "acabou de garantir o Pacote Completo", avatar: "LR" },
    { name: "Matheus S.", location: "Belo Horizonte - MG", item: "comprou o Acesso às 100+ Planilhas", avatar: "MS" },
    { name: "Fernanda P.", location: "Curitiba - PR", item: "adquiriu o Protocolo 24 Dias + Bônus", avatar: "FP" },
    { name: "Rodrigo M.", location: "Rio de Janeiro - RJ", item: "garantiu o Pacote Completo VIP", avatar: "RM" },
    { name: "Gabriel A.", location: "Goiânia - GO", item: "acabou de garantir o Acesso Vitalício", avatar: "GA" },
    { name: "Juliana T.", location: "Porto Alegre - RS", item: "adquiriu as Planilhas para Hipertrofia", avatar: "JT" },
    { name: "Thiago B.", location: "Fortaleza - CE", item: "comprou o Pacote Completo com Bônus", avatar: "TB" },
    { name: "Rafael C.", location: "Brasília - DF", item: "garantiu o Acesso Vitalício com 93% OFF", avatar: "RC" },
    { name: "Diego F.", location: "Campinas - SP", item: "adquiriu o Combo VIP com 275 GIFs", avatar: "DF" },
    { name: "Marcos V.", location: "Salvador - BA", item: "acabou de entrar para o time de alunos", avatar: "MV" }
  ];

  let currentBuyerIndex = 0;
  let toastTimeout;

  function showSaleNotification() {
    if (!salesToast) return;

    const buyer = buyersList[currentBuyerIndex];
    if (toastAvatar) toastAvatar.textContent = buyer.avatar;
    if (toastTitle) toastTitle.textContent = `${buyer.name} de ${buyer.location}`;
    if (toastMessage) toastMessage.textContent = buyer.item;

    salesToast.classList.add('show');

    // Keep visible for 5 seconds
    toastTimeout = setTimeout(() => {
      salesToast.classList.remove('show');
    }, 5000);

    currentBuyerIndex = (currentBuyerIndex + 1) % buyersList.length;
  }

  if (toastCloseBtn && salesToast) {
    toastCloseBtn.addEventListener('click', () => {
      salesToast.classList.remove('show');
      if (toastTimeout) clearTimeout(toastTimeout);
    });
  }

  // Trigger first after 4 seconds, then repeat every 20 seconds
  setTimeout(() => {
    showSaleNotification();
    setInterval(showSaleNotification, 20000); // 20s interval as requested
  }, 4000);

  // 4. FAQ ACCORDION INTERACTION
  const accordionHeaders = document.querySelectorAll('.accordion-header');

  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const content = item.querySelector('.accordion-content');
      const isAlreadyActive = item.classList.contains('active');

      // Optional: close other open items for clean look
      document.querySelectorAll('.accordion-item').forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          const otherHeader = otherItem.querySelector('.accordion-header');
          const otherContent = otherItem.querySelector('.accordion-content');
          if (otherHeader) otherHeader.setAttribute('aria-expanded', 'false');
          if (otherContent) otherContent.style.maxHeight = null;
        }
      });

      if (isAlreadyActive) {
        item.classList.remove('active');
        header.setAttribute('aria-expanded', 'false');
        if (content) content.style.maxHeight = null;
      } else {
        item.classList.add('active');
        header.setAttribute('aria-expanded', 'true');
        if (content) content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });

  // Open the initially active accordion item
  const initialActive = document.querySelector('.accordion-item.active .accordion-content');
  if (initialActive) {
    initialActive.style.maxHeight = initialActive.scrollHeight + 'px';
  }

  // 5. AUTO UPDATE COPYRIGHT YEAR
  const yearEl = document.getElementById('year');
  if (yearEl) {
    const currentYear = new Date().getFullYear();
    yearEl.textContent = currentYear >= 2026 ? currentYear : '2026';
  }



  // ============================================================
  // 6. META PIXEL — ARQUITETURA DE RASTREAMENTO (AUDITORIA)
  // ============================================================
  // REGRAS APLICADAS:
  //   - autoConfig: false no init (index.html) elimina eventos automáticos
  //     da Meta (SubscribedButtonClick, ViewContent, etc).
  //   - Cada botão de checkout registra o listener UMA ÚNICA VEZ.
  //   - Um Set garante que o mesmo elemento nunca dispare duas vezes.
  //   - A flag global window.__fbIcFired garante disparo único por pageload,
  //     mesmo que o DOM seja manipulado dinamicamente no futuro.
  //   - eventID único por disparo para deduplicação server-side (CAPI).
  // ============================================================

  (function initPixelTracking() {
    // Guard: se o módulo já rodou (ex: script carregado 2x), aborta.
    if (window.__fbTrackingInitialized) return;
    window.__fbTrackingInitialized = true;

    // Flag de controle: InitiateCheckout só dispara UMA VEZ por pageload.
    window.__fbIcFired = false;

    // Set de elementos já com listener registrado (evita duplicidade de binding).
    var boundElements = new Set();

    function fireInitiateCheckout(el) {
      if (typeof fbq !== 'function') return;
      if (window.__fbIcFired) return;

      window.__fbIcFired = true;

      // eventID único para deduplicação server-side via CAPI
      var eventId = 'ic_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

      fbq('track', 'InitiateCheckout', {
        content_name: el.getAttribute('data-checkout-item') || 'Checkout',
        value: parseFloat(el.getAttribute('data-checkout-value')) || 0,
        currency: 'BRL'
      }, { eventID: eventId });
    }

    function bindCheckoutListeners() {
      document.querySelectorAll('[data-checkout="true"]').forEach(function(el) {
        if (boundElements.has(el)) return; // já tem listener — não registra de novo
        boundElements.add(el);
        el.addEventListener('click', function() {
          fireInitiateCheckout(el);
        });
      });
    }

    // Registra listeners nos elementos presentes no DOM agora.
    bindCheckoutListeners();

  })();

});
