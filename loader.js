(() => {
  const loader = document.getElementById('page-loader') || document.getElementById('loader');
  const EXIT_DELAY = 600; // ms après la fin du chargement

  function hideLoader() {
    if (!loader) return;
    loader.classList.add('hide');
    // Restorer le scroll
    try { document.documentElement.style.overflow = ''; document.body.style.overflow = ''; } catch (e) {}
    // Retirer du DOM après la transition
    setTimeout(() => {
      try { loader.parentNode && loader.parentNode.removeChild(loader); } catch (e) {}
    }, EXIT_DELAY + 200);
  }

  // Bloquer le scroll tant que le loader est visible
  try { document.documentElement.style.overflow = 'hidden'; document.body.style.overflow = 'hidden'; } catch (e) {}

  if (document.readyState === 'complete') {
    setTimeout(hideLoader, EXIT_DELAY);
  } else {
    window.addEventListener('load', () => setTimeout(hideLoader, EXIT_DELAY));
  }

  // Click pour bypasser le loader
  if (loader) loader.addEventListener('click', hideLoader);
})();
