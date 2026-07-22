/* Mobile navigation, scroll reveal, and the pipeline spine's active node. */

const MOBILE_NAV_BREAKPOINT = 720;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/* ---------- Mobile navigation ---------- */

const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.masthead-nav');

if (toggle && nav) {
  if (!nav.id) nav.id = 'primary-navigation';
  toggle.setAttribute('aria-controls', nav.id);

  const setMenuState = (open, { returnFocus = false } = {}) => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    if (returnFocus) toggle.focus();
  };

  setMenuState(false);

  toggle.addEventListener('click', () => {
    setMenuState(!nav.classList.contains('is-open'));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenuState(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) {
      setMenuState(false, { returnFocus: true });
    }
  });

  document.addEventListener('click', (event) => {
    if (nav.classList.contains('is-open') && !nav.contains(event.target) && !toggle.contains(event.target)) {
      setMenuState(false);
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > MOBILE_NAV_BREAKPOINT) setMenuState(false);
  });
}

/* ---------- Scroll reveal ---------- */

const revealItems = document.querySelectorAll('.stage, .repo, .split-body, .tool-group, .readout-item');

const showAllRevealItems = () => {
  revealItems.forEach((item) => item.classList.add('is-visible'));
};

if (reduceMotion.matches || !('IntersectionObserver' in window)) {
  showAllRevealItems();
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealItems.forEach((item) => {
    item.classList.add('reveal');
    revealObserver.observe(item);
  });

  reduceMotion.addEventListener?.('change', (event) => {
    if (event.matches) {
      revealObserver.disconnect();
      showAllRevealItems();
    }
  });
}

/* ---------- Pipeline spine: mark the section you're in ---------- */

const spineLinks = Array.from(document.querySelectorAll('.spine a[data-spine]'));

if (spineLinks.length && 'IntersectionObserver' in window) {
  const sections = spineLinks
    .map((link) => {
      const section = document.getElementById(link.dataset.spine);
      return section ? { link, section } : null;
    })
    .filter(Boolean);

  const visible = new Set();

  const setCurrent = () => {
    // The topmost section currently in the middle band of the viewport wins.
    const active = sections.find((entry) => visible.has(entry.section));
    sections.forEach(({ link }) => {
      const isCurrent = Boolean(active) && link === active.link;
      link.classList.toggle('is-current', isCurrent);
      if (isCurrent) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  const spineObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        visible.add(entry.target);
      } else {
        visible.delete(entry.target);
      }
    });
    setCurrent();
  }, { rootMargin: '-45% 0px -45% 0px' });

  sections.forEach(({ section }) => spineObserver.observe(section));
}
