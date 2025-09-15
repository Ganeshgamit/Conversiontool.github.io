// ToolHub prefs: remember last-used PDF tab, Image settings, Settings section, and Dashboard view
(function () {
  const NS = 'toolhub:';
  const set = (k, v) => { try { localStorage.setItem(NS + k, v); } catch (_) {} };
  const get = (k, d) => { try { const v = localStorage.getItem(NS + k); return v === null ? d : v; } catch (_) { return d; } };

  document.addEventListener('DOMContentLoaded', () => {
    const p = location.pathname.replace(/\\/g, '/').toLowerCase();

    // --- PDF Tools: remember last tab (#convert/#merge/...) ---
    if (p.includes('/pages/pdf/')) {
      const storeHash = () => {
        const h = (location.hash || '').replace('#', '');
        if (h) set('pdf:lastTab', h);
      };
      window.addEventListener('hashchange', storeHash);
      if (!location.hash) {
        const last = get('pdf:lastTab', 'convert');
        if (last) location.hash = '#' + last; // uses the page's router
      } else {
        storeHash();
      }
    }

    // --- Image Tools: remember key controls (fmt, quality, compression, lock) ---
    if (p.includes('/pages/image/')) {
      const fmt  = document.getElementById('fmt');
      const q    = document.getElementById('q');
      const cmp  = document.getElementById('cmp');
      const lock = document.getElementById('lock');

      // restore
      if (fmt) fmt.value = get('image:fmt', fmt.value || 'jpg');
      if (q)   { q.value = get('image:q', q.value || '85'); q.dispatchEvent(new Event('input')); }
      if (cmp) { cmp.value = get('image:cmp', cmp.value || '2'); cmp.dispatchEvent(new Event('input')); }
      if (lock){ lock.checked = get('image:lock', '1') === '1'; }

      // persist
      fmt  && fmt.addEventListener('change', e => set('image:fmt', e.target.value));
      q    && q.addEventListener('input',  e => set('image:q',   e.target.value));
      cmp  && cmp.addEventListener('input',e => set('image:cmp', e.target.value));
      lock && lock.addEventListener('change', e => set('image:lock', e.target.checked ? '1' : '0'));
    }

    // --- Settings page: remember last opened section (#profile/#account/...) ---
    if (p.includes('/pages/settings/')) {
      const storeHash = () => {
        const h = (location.hash || '').replace('#', '');
        if (h) set('settings:lastTab', h);
      };
      window.addEventListener('hashchange', storeHash);
      if (!location.hash) {
        const last = get('settings:lastTab', 'profile');
        if (last) location.hash = '#' + last; // triggers the page's hash router
      } else {
        storeHash();
      }
    }

    // --- Dashboard page: remember last view (chat/tools/recent/favorites/settings) ---
    if (p.includes('/pages/dashboard/')) {
      const names = ['chat','tools','recent','favorites','settings'];
      const btns = document.querySelectorAll('.sidebar-item');
      btns.forEach((btn, idx) => {
        btn.addEventListener('click', () => set('dash:lastView', names[idx] || 'chat'));
      });
      // Restore after globals (switchView) exist
      setTimeout(() => {
        const last = get('dash:lastView', 'chat');
        try { window.switchView && window.switchView(last); } catch (_) {}
      }, 0);
    }
  });
})();
