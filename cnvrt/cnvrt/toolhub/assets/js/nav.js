// Auto-highlight the current page link in the top nav
(function () {
  const p = location.pathname.replace(/\\/g, '/').toLowerCase();

  function mark(link) {
    link.classList.add('text-green-700', 'font-semibold');
  }

  const navLinks = document.querySelectorAll('nav a[href]');
  if (!navLinks.length) return;

  // 1) direct filename match (e.g., dashboard.html)
  let matched = false;
  navLinks.forEach(a => {
    const href = a.getAttribute('href') || '';
    const fname = href.split('/').pop().toLowerCase();
    if (p.endsWith('/' + fname)) { mark(a); matched = true; }
  });

  // 2) served as directory index (…/toolhub/ without index.html)
  if (!matched && /\/toolhub\/?$/.test(p)) {
    const idx = Array.from(navLinks).find(a => (a.getAttribute('href') || '').endsWith('index.html'));
    if (idx) { mark(idx); matched = true; }
  }

  // 3) fallback by section folder (e.g., /pages/pdf/)
  if (!matched) {
    if (p.includes('/pages/pdf/')) {
      const l = Array.from(navLinks).find(a => (a.getAttribute('href') || '').includes('pdf-tools.html'));
      if (l) mark(l);
    } else if (p.includes('/pages/image/')) {
      const l = Array.from(navLinks).find(a => (a.getAttribute('href') || '').includes('image-tools.html'));
      if (l) mark(l);
    } else if (p.includes('/pages/dashboard/')) {
      const l = Array.from(navLinks).find(a => (a.getAttribute('href') || '').includes('dashboard.html'));
      if (l) mark(l);
    } else if (p.includes('/pages/settings/')) {
      const l = Array.from(navLinks).find(a => (a.getAttribute('href') || '').includes('settings.html'));
      if (l) mark(l);
    }
  }
})();
