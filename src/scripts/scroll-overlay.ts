export function initScrollOverlay() {
  const overlay = document.getElementById('scroll-overlay');
  if (!overlay) return;

  function onScroll() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    const heroBottom = hero.getBoundingClientRect().bottom;
    const heroHeight = hero.getBoundingClientRect().height;
    const progress = Math.min(1, Math.max(0, 1 - heroBottom / (heroHeight * 0.5)));
    overlay.style.opacity = String(progress);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  return () => window.removeEventListener('scroll', onScroll);
}
