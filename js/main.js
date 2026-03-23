/* ================================================================
   Jana Sankalpa Seva Charitable Trust — main.js
   ================================================================ */

(function () {
  'use strict';

  /* ── Helpers ────────────────────────────────────────────────── */
  const qs  = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ── Set current year in footer ────────────────────────────── */
  const yearEl = qs('#currentYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ── Sticky header shadow ───────────────────────────────────── */
  const header = qs('#header');
  if (header) {
    const onScroll = () =>
      header.classList.toggle('scrolled', window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ── Mobile hamburger navigation ───────────────────────────── */
  const hamburger = qs('#hamburger');
  const nav       = qs('#nav');

  if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      nav.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    // Close nav on link click
    qsa('.nav-link', nav).forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        nav.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });

    // Close nav on outside click
    document.addEventListener('click', (e) => {
      if (!header.contains(e.target)) {
        hamburger.classList.remove('open');
        nav.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ── Active nav link on scroll ──────────────────────────────── */
  const sections  = qsa('section[id]');
  const navLinks  = qsa('.nav-link[href^="#"]');

  const setActiveLink = () => {
    const scrollY = window.scrollY;
    let current = '';

    sections.forEach(sec => {
      const offsetTop    = sec.offsetTop - 100;
      const offsetBottom = offsetTop + sec.offsetHeight;
      if (scrollY >= offsetTop && scrollY < offsetBottom) {
        current = sec.id;
      }
    });

    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  };

  window.addEventListener('scroll', setActiveLink, { passive: true });
  setActiveLink();

  /* ── Scroll-to-top button ───────────────────────────────────── */
  const scrollTopBtn = qs('#scrollTop');
  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });

    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ── Toast notification ─────────────────────────────────────── */
  const toastEl = qs('#toast');
  let toastTimer;

  function showToast(message, type = 'success') {
    if (!toastEl) return;
    clearTimeout(toastTimer);
    toastEl.textContent = message;
    toastEl.className   = `toast show ${type}`;
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('show');
    }, 3500);
  }

  /* ── Counter animation ──────────────────────────────────────── */
  function animateCounter(el) {
    const target   = parseInt(el.getAttribute('data-target'), 10);
    const duration = 2000;
    const step     = 30;
    const increment = target / (duration / step);
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        el.textContent = target.toLocaleString('en-IN');
        clearInterval(timer);
      } else {
        el.textContent = Math.floor(current).toLocaleString('en-IN');
      }
    }, step);
  }

  /* Trigger counters when section enters viewport */
  const counterEls = qsa('[data-target]');
  if (counterEls.length && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    counterEls.forEach(el => counterObserver.observe(el));
  } else {
    // Fallback: set values immediately
    counterEls.forEach(el => {
      const t = parseInt(el.getAttribute('data-target'), 10);
      el.textContent = t.toLocaleString('en-IN');
    });
  }

  /* ── Fade-in-up on scroll ───────────────────────────────────── */
  const fadeEls = qsa('.program-card, .impact-card, .testimonial-card, .gallery-item, .donate-impact-item, .contact-item');

  if ('IntersectionObserver' in window) {
    const fadeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            entry.target.style.animationDelay = `${i * 60}ms`;
            entry.target.classList.add('fade-in-up');
            fadeObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    fadeEls.forEach(el => fadeObserver.observe(el));
  }

  /* ── Donate amount buttons ──────────────────────────────────── */
  const amountBtns   = qsa('.amount-btn');
  const customAmount = qs('#donorAmount');

  amountBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      amountBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (customAmount) {
        customAmount.value = btn.getAttribute('data-amount');
      }
    });
  });

  if (customAmount) {
    customAmount.addEventListener('input', () => {
      amountBtns.forEach(b => b.classList.remove('active'));
    });
  }

  /* ── Form validation helper ─────────────────────────────────── */
  function validateForm(form) {
    const requiredFields = qsa('[required]', form);
    let valid = true;

    requiredFields.forEach(field => {
      field.style.borderColor = '';
      if (!field.value.trim()) {
        field.style.borderColor = '#e53935';
        valid = false;
      } else if (field.type === 'email') {
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRe.test(field.value.trim())) {
          field.style.borderColor = '#e53935';
          valid = false;
        }
      }
    });

    return valid;
  }

  /* ── Donate form ────────────────────────────────────────────── */
  const donateForm = qs('#donateForm');
  if (donateForm) {
    donateForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateForm(donateForm)) {
        showToast('Please fill in all required fields.', 'error');
        return;
      }

      // Simulate submission
      const submitBtn = qs('[type=submit]', donateForm);
      submitBtn.disabled  = true;
      submitBtn.textContent = 'Processing…';

      setTimeout(() => {
        submitBtn.disabled  = false;
        submitBtn.textContent = 'Donate Now 💚';
        donateForm.reset();
        amountBtns.forEach(b => b.classList.remove('active'));
        amountBtns[2]?.classList.add('active');
        showToast('🙏 Thank you for your generous donation!', 'success');
      }, 1500);
    });
  }

  /* ── Contact form ───────────────────────────────────────────── */
  const contactForm = qs('#contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateForm(contactForm)) {
        showToast('Please fill in all required fields.', 'error');
        return;
      }

      const submitBtn = qs('[type=submit]', contactForm);
      submitBtn.disabled  = true;
      submitBtn.textContent = 'Sending…';

      setTimeout(() => {
        submitBtn.disabled  = false;
        submitBtn.textContent = 'Send Message';
        contactForm.reset();
        showToast('✅ Message sent! We will get back to you soon.', 'success');
      }, 1200);
    });
  }

  /* ── Newsletter form ────────────────────────────────────────── */
  const newsletterForm = qs('#newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = qs('#newsletterEmail');
      const emailRe    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailInput || !emailRe.test(emailInput.value.trim())) {
        showToast('Please enter a valid email address.', 'error');
        return;
      }

      setTimeout(() => {
        newsletterForm.reset();
        showToast('🎉 You have subscribed to our newsletter!', 'success');
      }, 600);
    });
  }

  /* ── Smooth scroll for anchor links ────────────────────────── */
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;
    const id = anchor.getAttribute('href').slice(1);
    if (!id) return;
    const target = qs(`#${id}`);
    if (target) {
      e.preventDefault();
      const headerH = header ? header.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });

})();
