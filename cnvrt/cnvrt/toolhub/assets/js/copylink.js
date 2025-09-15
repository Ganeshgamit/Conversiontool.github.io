// Copy current page URL (incl. hash) to clipboard with a tiny floating button
(function () {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.title = 'Copy link';
  btn.ariaLabel = 'Copy link';
  btn.className = [
    'fixed','z-50','bottom-6','right-20', // sits left of Back-to-Top
    'rounded-full','p-2.5','shadow-lg','border','bg-white','hover:bg-gray-50',
    'transition','duration-200','ease-out'
  ].join(' ');
  btn.innerHTML = `
    <span class="inline-flex h-9 w-9 items-center justify-center rounded-full
                 bg-gradient-to-tr from-blue-600 to-green-500 text-white">
      <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M8.59 13.41a1 1 0 001.41 1.41l4-4a1 1 0 10-1.41-1.41l-4 4z"/>
        <path d="M7 7a3 3 0 014.243-.172 1 1 0 001.414-1.414A5 5 0 105 12a1 1 0 102 0 3 3 0 010-5z"/>
      </svg>
    </span>
  `;
  document.body.appendChild(btn);

  // little toast
  function toast(msg){
    const t = document.createElement('div');
    t.className = 'fixed bottom-20 right-6 z-50 bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg shadow';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(()=>t.remove(), 1500);
  }

  async function copyURL() {
    const url = location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast('Link copied!');
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = url; ta.style.position='fixed'; ta.style.opacity='0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); toast('Link copied!'); }
      catch { toast('Copy failed'); }
      ta.remove();
    }
  }

  btn.addEventListener('click', copyURL);

  // keyboard shortcut: Shift + C
  window.addEventListener('keydown', (e)=>{
    if (e.shiftKey && (e.key === 'c' || e.key === 'C')) {
      e.preventDefault(); copyURL();
    }
  });

  // hide on very short pages (no scroll)
  function updateVis(){
    const se = document.scrollingElement || document.documentElement;
    const scrollable = (se.scrollHeight - se.clientHeight) > 80;
    btn.style.display = scrollable ? '' : 'none';
  }
  updateVis(); window.addEventListener('resize', updateVis);
})();
