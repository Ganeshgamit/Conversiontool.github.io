// Dashboard Drag & Drop Overlay (routes PDFs to PDF Tools, images to Image Tools)
(function () {
  // Only run on dashboard page
  const p = location.pathname.replace(/\\/g, '/').toLowerCase();
  if (!p.includes('/pages/dashboard/dashboard.html')) return;

  // Build overlay
  const overlay = document.createElement('div');
  overlay.className = [
    'fixed','inset-0','z-[60]','hidden',
    'bg-gradient-to-br','from-white/85','to-white/70',
    'backdrop-blur-sm','border-t','border-b','border-gray-200'
  ].join(' ');

  overlay.innerHTML = `
    <div class="absolute inset-0 grid place-items-center pointer-events-none">
      <div class="pointer-events-auto rounded-2xl border bg-white shadow-xl p-6 max-w-md w-[92%] text-center">
        <div class="mx-auto h-14 w-14 rounded-xl bg-gradient-to-tr from-blue-600 to-green-500 text-white grid place-items-center mb-3">
          <svg class="w-7 h-7" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M3 3a2 2 0 012-2h3l2 2h5a2 2 0 012 2v2H3V3z"></path>
            <path d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"></path>
          </svg>
        </div>
        <h2 class="text-xl font-semibold">Drop files to get started</h2>
        <p class="text-gray-600 text-sm mt-1">PDF → Merge/Split/Convert • Images → Resize/Convert/Compress</p>
        <div class="grid grid-cols-2 gap-3 mt-5 text-sm">
          <div class="rounded-lg border p-3">
            <div class="font-medium">PDF detected</div>
            <div class="text-gray-500">Opens PDF Tools</div>
          </div>
          <div class="rounded-lg border p-3">
            <div class="font-medium">Image detected</div>
            <div class="text-gray-500">Opens Image Tools</div>
          </div>
        </div>
        <div class="text-xs text-gray-500 mt-4">Tip: press <kbd class="px-1 py-0.5 border rounded">Esc</kbd> to cancel</div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  // Helpers
  const show = () => overlay.classList.remove('hidden');
  const hide = () => overlay.classList.add('hidden');

  function isPDF(name) {
    return /\.pdf$/i.test(name || '');
  }
  function isImage(name) {
    return /\.(png|jpe?g|webp|gif|bmp|tiff?)$/i.test(name || '');
  }

  // Routing (dashboard-relative paths)
  function gotoPDF()   { location.href = '../pdf/pdf-tools.html#merge'; }
  function gotoImage() { location.href = '../image/image-tools.html'; }

  // DnD events (on window because many sections have inner scrollers)
  let enterCounter = 0;

  window.addEventListener('dragenter', (e) => {
    e.preventDefault();
    enterCounter++;
    show();
  });

  window.addEventListener('dragover', (e) => {
    e.preventDefault();
  }, { passive: false });

  window.addEventListener('dragleave', (e) => {
    e.preventDefault();
    enterCounter = Math.max(0, enterCounter - 1);
    if (enterCounter === 0) hide();
  });

  window.addEventListener('drop', (e) => {
    e.preventDefault();
    hide();
    enterCounter = 0;

    const files = Array.from(e.dataTransfer?.files || []);
    if (!files.length) return;

    // Decide route by first file type (simple & effective)
    const first = files[0].name || '';
    if (isPDF(first)) { gotoPDF(); return; }
    if (isImage(first)) { gotoImage(); return; }

    // Fallback: if mixed types or unknown → keep on dashboard (or route to PDF Tools)
    gotoPDF();
  });

  // ESC closes overlay
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hide();
  });

  // Small “Drop anywhere” hint in the sidebar footer (non-blocking)
  const hint = document.createElement('div');
  hint.className = 'text-xs text-gray-500 mt-3 px-3';
  hint.textContent = 'Tip: Drag & drop files anywhere to jump to the right tool.';
  // Try to place it under sidebar if present
  (document.querySelector('aside') || document.querySelector('nav'))?.appendChild(hint);
})();
