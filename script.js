/**
 * MAISON DORÉE — Premium Restaurant Website
 * script.js — All JavaScript interactions
 */

'use strict';

/* ============================================================
   PRELOADER
   ============================================================ */
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  // Give the bar animation time to finish
  setTimeout(() => {
    preloader.classList.add('hidden');
    // Trigger hero reveals after preloader fades
    setTimeout(() => {
      document.querySelectorAll('.hero .reveal').forEach((el, i) => {
        el.style.transitionDelay = (i * 0.12) + 's';
        el.classList.add('visible');
      });
    }, 200);
  }, 1900);
});


/* ============================================================
   NAVIGATION — Scroll behaviour + Mobile toggle
   ============================================================ */
const nav         = document.getElementById('nav');
const hamburger   = document.getElementById('hamburger');
const navLinks    = document.getElementById('navLinks');
const allNavLinks = navLinks.querySelectorAll('.nav__link');

// Scroll: add .scrolled class
const handleNavScroll = () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
};
window.addEventListener('scroll', handleNavScroll, { passive: true });
handleNavScroll(); // run once on load

// Mobile hamburger toggle
hamburger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  hamburger.classList.toggle('active', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
  // Prevent body scroll when menu open
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Close nav on link click (mobile)
allNavLinks.forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', false);
    document.body.style.overflow = '';
  });
});

// Active nav link on scroll
const sections = document.querySelectorAll('section[id]');

const setActiveLink = () => {
  const scrollPos = window.scrollY + 120;
  sections.forEach(section => {
    const top    = section.offsetTop;
    const height = section.offsetHeight;
    const id     = section.getAttribute('id');
    const link   = navLinks.querySelector(`a[href="#${id}"]`);
    if (!link) return;
    if (scrollPos >= top && scrollPos < top + height) {
      allNavLinks.forEach(l => l.classList.remove('active-link'));
      link.classList.add('active-link');
    }
  });
};
window.addEventListener('scroll', setActiveLink, { passive: true });


/* ============================================================
   DARK / LIGHT MODE TOGGLE
   ============================================================ */
const themeToggle = document.getElementById('themeToggle');
const themeIcon   = themeToggle.querySelector('.theme-icon');

// Load saved preference
const savedTheme = localStorage.getItem('md-theme') || 'light';
if (savedTheme === 'dark') {
  document.documentElement.setAttribute('data-theme', 'dark');
  themeIcon.textContent = '☀';
}

themeToggle.addEventListener('click', () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  if (isDark) {
    document.documentElement.removeAttribute('data-theme');
    themeIcon.textContent = '☾';
    localStorage.setItem('md-theme', 'light');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeIcon.textContent = '☀';
    localStorage.setItem('md-theme', 'dark');
  }
});


/* ============================================================
   HERO — Parallax Effect (lightweight)
   ============================================================ */
const heroBg = document.querySelector('.hero__bg');

const heroParallax = () => {
  if (!heroBg) return;
  const offset = window.scrollY;
  heroBg.style.transform = `translateY(${offset * 0.35}px)`;
};

window.addEventListener('scroll', heroParallax, { passive: true });


/* ============================================================
   SCROLL REVEAL
   (skip hero elements — those are handled by preloader)
   ============================================================ */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -60px 0px'
});

// Observe all .reveal elements EXCEPT those in hero (pre-animated)
document.querySelectorAll('.reveal:not(.hero .reveal)').forEach((el, i) => {
  // Stagger siblings inside same parent
  const siblings = el.parentElement.querySelectorAll('.reveal');
  siblings.forEach((s, idx) => {
    s.style.transitionDelay = (idx * 0.1) + 's';
  });
  revealObserver.observe(el);
});


/* ============================================================
   ANIMATED COUNTERS (stats section)
   ============================================================ */
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el     = entry.target;
    const target = parseInt(el.dataset.count, 10);
    const duration = 1800;
    const step   = duration / target;
    let current  = 0;

    const timer = setInterval(() => {
      current++;
      el.textContent = current;
      if (current >= target) {
        clearInterval(timer);
        el.textContent = target;
      }
    }, step);

    counterObserver.unobserve(el);
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stats__num').forEach(num => {
  counterObserver.observe(num);
});


/* ============================================================
   MENU TABS
   ============================================================ */
const tabs    = document.querySelectorAll('.menu__tab');
const grids   = document.querySelectorAll('.menu__grid');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;

    // Update active tab
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    // Show target grid
    grids.forEach(grid => {
      const isTarget = grid.id === `tab-${target}`;
      grid.classList.toggle('active', isTarget);
      if (isTarget) {
        // Re-trigger reveal animations on newly shown cards
        grid.querySelectorAll('.reveal').forEach((el, i) => {
          el.classList.remove('visible');
          el.style.transitionDelay = (i * 0.07) + 's';
          setTimeout(() => el.classList.add('visible'), 50);
        });
      }
    });
  });
});

// Initialise first tab's cards
document.querySelectorAll('#tab-breakfast .reveal').forEach((el, i) => {
  el.style.transitionDelay = (i * 0.07) + 's';
});


/* ============================================================
   TESTIMONIALS SLIDER
   ============================================================ */
const track        = document.getElementById('testimonialTrack');
const prevBtn      = document.getElementById('prevTestimonial');
const nextBtn      = document.getElementById('nextTestimonial');
const dotsContainer= document.getElementById('testimonialDots');
const testimonials = track ? track.querySelectorAll('.testimonial') : [];
let currentSlide   = 0;
let autoplayTimer;

// Build dots
testimonials.forEach((_, i) => {
  const dot = document.createElement('button');
  dot.className = 'testimonials__dot' + (i === 0 ? ' active' : '');
  dot.setAttribute('aria-label', `Go to review ${i + 1}`);
  dot.addEventListener('click', () => goToSlide(i));
  dotsContainer.appendChild(dot);
});

const goToSlide = (index) => {
  currentSlide = (index + testimonials.length) % testimonials.length;
  track.style.transform = `translateX(-${currentSlide * 100}%)`;
  document.querySelectorAll('.testimonials__dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === currentSlide);
  });
};

prevBtn && prevBtn.addEventListener('click', () => {
  goToSlide(currentSlide - 1);
  resetAutoplay();
});

nextBtn && nextBtn.addEventListener('click', () => {
  goToSlide(currentSlide + 1);
  resetAutoplay();
});

// Autoplay
const startAutoplay = () => {
  autoplayTimer = setInterval(() => goToSlide(currentSlide + 1), 5000);
};

const resetAutoplay = () => {
  clearInterval(autoplayTimer);
  startAutoplay();
};

// Pause autoplay on hover
const sliderEl = document.querySelector('.testimonials__slider');
if (sliderEl) {
  sliderEl.addEventListener('mouseenter', () => clearInterval(autoplayTimer));
  sliderEl.addEventListener('mouseleave', startAutoplay);
}

// Touch/swipe support
let touchStartX = 0;
if (track) {
  track.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      goToSlide(diff > 0 ? currentSlide + 1 : currentSlide - 1);
      resetAutoplay();
    }
  });
}

startAutoplay();


/* ============================================================
   RESERVATION FORM VALIDATION
   ============================================================ */
const form        = document.getElementById('reservationForm');
const formSuccess = document.getElementById('formSuccess');

const validators = {
  name: {
    el: document.getElementById('name'),
    err: document.getElementById('nameError'),
    validate(val) {
      if (!val.trim()) return 'Please enter your full name.';
      if (val.trim().length < 2) return 'Name must be at least 2 characters.';
      return '';
    }
  },
  phone: {
    el: document.getElementById('phone'),
    err: document.getElementById('phoneError'),
    validate(val) {
      if (!val.trim()) return 'Please enter your phone number.';
      if (!/^[\d\s\+\-\(\)]{7,}$/.test(val)) return 'Please enter a valid phone number.';
      return '';
    }
  },
  date: {
    el: document.getElementById('date'),
    err: document.getElementById('dateError'),
    validate(val) {
      if (!val) return 'Please select a date.';
      const selected = new Date(val);
      const today    = new Date(); today.setHours(0, 0, 0, 0);
      if (selected < today) return 'Please select a future date.';
      return '';
    }
  },
  time: {
    el: document.getElementById('time'),
    err: document.getElementById('timeError'),
    validate(val) {
      if (!val) return 'Please select a time.';
      return '';
    }
  },
  guests: {
    el: document.getElementById('guests'),
    err: document.getElementById('guestsError'),
    validate(val) {
      if (!val) return 'Please select number of guests.';
      return '';
    }
  }
};

// Set min date to today
const dateInput = document.getElementById('date');
if (dateInput) {
  const today = new Date().toISOString().split('T')[0];
  dateInput.setAttribute('min', today);
}

// Inline validation on blur
Object.values(validators).forEach(({ el, err, validate }) => {
  if (!el) return;
  el.addEventListener('blur', () => {
    const msg = validate(el.value);
    err.textContent = msg;
    el.classList.toggle('error', !!msg);
  });
  el.addEventListener('input', () => {
    if (el.classList.contains('error')) {
      const msg = validate(el.value);
      err.textContent = msg;
      el.classList.toggle('error', !!msg);
    }
  });
});

// Submit
form && form.addEventListener('submit', (e) => {
  e.preventDefault();
  let valid = true;

  Object.values(validators).forEach(({ el, err, validate }) => {
    if (!el) return;
    const msg = validate(el.value);
    err.textContent = msg;
    el.classList.toggle('error', !!msg);
    if (msg) valid = false;
  });

  if (valid) {
    // Simulate submission
    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.textContent = 'Sending…';
    submitBtn.disabled = true;

    setTimeout(() => {
      formSuccess.classList.add('show');
      form.reset();
      submitBtn.textContent = 'Confirm Reservation';
      submitBtn.disabled = false;
      formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      // Hide success message after 8 seconds
      setTimeout(() => formSuccess.classList.remove('show'), 8000);
    }, 1200);
  }
});


/* ============================================================
   BACK TO TOP BUTTON
   ============================================================ */
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  backToTop.classList.toggle('show', window.scrollY > 400);
}, { passive: true });

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});


/* ============================================================
   SMOOTH SCROLL for anchor links
   (native smooth-scroll is in CSS; this is a polyfill-level
   fallback and also closes mobile nav)
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const id = link.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth' });
  });
});


/* ============================================================
   GALLERY — optional lightbox hint effect
   ============================================================ */
document.querySelectorAll('.gallery__item').forEach(item => {
  item.addEventListener('click', () => {
    // Subtle pulse effect on click as placeholder for a real lightbox
    item.style.transform = 'scale(0.97)';
    setTimeout(() => item.style.transform = '', 200);
  });
});
