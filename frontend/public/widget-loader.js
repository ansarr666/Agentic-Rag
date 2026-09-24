(function () {
  if (window.__orionsoftWidgetLoaded) return;
  window.__orionsoftWidgetLoaded = true;

  var script = document.currentScript;
  var baseUrl = (script && script.getAttribute('data-base-url')) || window.location.origin;
  baseUrl = baseUrl.replace(/\/$/, '');

  var launcher = document.createElement('button');
  launcher.setAttribute('aria-label', 'Open OrionSoft assistant');
  launcher.textContent = '\uD83D\uDCAC';
  Object.assign(launcher.style, {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    zIndex: '2147483000',
    background: '#2563eb',
    color: '#ffffff',
    fontSize: '26px',
    lineHeight: '1',
    boxShadow: '0 8px 24px rgba(37, 99, 235, 0.35)'
  });

  var container = document.createElement('div');
  Object.assign(container.style, {
    position: 'fixed',
    bottom: '96px',
    right: '24px',
    width: '380px',
    height: '560px',
    maxWidth: 'calc(100vw - 32px)',
    maxHeight: 'calc(100vh - 120px)',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.18)',
    zIndex: '2147482999',
    display: 'none',
    background: '#ffffff'
  });

  var iframe = document.createElement('iframe');
  iframe.src = baseUrl + '/widget';
  iframe.setAttribute('title', 'OrionSoft Assistant');
  Object.assign(iframe.style, { width: '100%', height: '100%', border: 'none' });

  container.appendChild(iframe);

  launcher.addEventListener('click', function () {
    var isOpen = container.style.display !== 'none';
    container.style.display = isOpen ? 'none' : 'block';
    launcher.textContent = isOpen ? '\uD83D\uDCAC' : '\u2715';
  });

  document.body.appendChild(launcher);
  document.body.appendChild(container);
})();
