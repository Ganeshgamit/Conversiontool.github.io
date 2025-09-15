// Back-to-Top button (listens to ALL likely scroll containers)
(function () {
  // ---- create button ----
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.ariaLabel = 'Back to top';
  btn.title = 'Back to top';
  btn.className = [
    'fixed','z-50','bottom-6','right-6',
    'rounded-full','p-3','shadow-lg',
    'bg-white','border','hover:bg-gray-50',
    'transition','duration-200','ease-out',
    'opacity-0','pointer-events-none','translate-y-2'
  ].join(' ');
  btn.innerHTML = `
    <span class="inline-flex h-10 w-10 items-center justify-center rounded-full
                 bg-gradient-to-tr from-blue-600 to-green-500 text-white">
      <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fill-rule="evenodd"
              d="M10 3a1 1 0 01.894.553l3 6a1 1 0 11-1.788.894L10 6.618 7.894 10.447A1 1 0 016.106 9.553l3-6A1 1 0 0110 3zM4 12a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z"
              clip-rule="evenodd"/>
      </svg>
    </span>
  `;
  document.body.appendChild(btn);

  const threshold = 160;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const behavior = prefersReduced ? 'auto' : 'smooth';

  // ---- collect ALL potential scroll roots ----
  const set = new Set();
  const se = document.scrollingElement || document.documentElement;

  function add(el){ if (el) set.add(el); }

  // window + document
  add(window);
  add(se);

  // common containers in your app
  add(document.querySelector('main'));
  document.querySelectorAll('[data-scroll-root],[data-scroll-container],.overflow-y-auto,.overflow-auto,.overflow-scroll,main,.main')
    .forEach(add);

  // de-dupe to array
  const roots = Array.from(set);

  // ---- utils ----
  function topOf(el){
    return el === window ? (window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0) : el.scrollTop;
  }
  function canScroll(el){
    const sh = el === window ? se.scrollHeight : el.scrollHeight;
    const ch = el === window ? se.clientHeight : el.clientHeight;
    return sh > ch + 2;
  }

  function update() {
    let anyScrollable = false, maxTop = 0;
    for (const el of roots) {
      if (canScroll(el)) anyScrollable = true;
      const t = topOf(el);
      if (t > maxTop) maxTop = t;
    }
    if (anyScrollable && maxTop > threshold) {
      btn.classList.remove('opacity-0','pointer-events-none','translate-y-2');
    } else {
      btn.classList.add('opacity-0','pointer-events-none','translate-y-2');
    }
  }

  // listen to scroll on ALL roots (scroll doesn't bubble!)
  roots.forEach(el => (el === window ? window : el).addEventListener('scroll', update, { passive: true }));
  window.addEventListener('resize', update);

  // initial + delayed updates (after layout settles)
  update(); setTimeout(update, 50); setTimeout(update, 300);

  // click: scroll every root that has scrolled
  btn.addEventListener('click', () => {
    let used = false;
    roots.forEach(el => {
      if (topOf(el) > 0) {
        used = true;
        if (el === window) window.scrollTo({ top: 0, behavior });
        else el.scrollTo({ top: 0, behavior });
      }
    });
    if (!used) window.scrollTo({ top: 0, behavior }); // fallback
  });

  // keyboard access
  btn.tabIndex = 0;
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
  });
})();
