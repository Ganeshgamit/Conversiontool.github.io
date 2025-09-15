// Inject a shared footer on pages that don't already have one
(function () {
  if (document.querySelector('footer')) return; // skip if page already has a footer

  const root = '/'; // site root on localhost:8080
  const links = [
    { href: root + 'index.html', text: 'Home' },
    { href: root + 'pages/pdf/pdf-tools.html', text: 'PDF Tools' },
    { href: root + 'pages/image/image-tools.html', text: 'Image Tools' },
    { href: root + 'pages/misc/about.html', text: 'About' },
    { href: root + 'pages/misc/contact.html', text: 'Contact' },
    { href: root + 'pages/settings/settings.html', text: 'Settings' },
  ];

  const footer = document.createElement('footer');
  footer.className = 'border-t bg-white';
  footer.setAttribute('data-toolhub', 'footer');
  footer.innerHTML = `
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between text-sm text-gray-600">
      <span>© <span id="footer-year"></span> ToolHub</span>
      <div class="flex gap-4">
        ${links.map(l => `<a class="hover:text-gray-900" href="${l.href}">${l.text}</a>`).join('')}
      </div>
    </div>`;
  document.body.appendChild(footer);
  const y = footer.querySelector('#footer-year');
  if (y) y.textContent = new Date().getFullYear();
})();
