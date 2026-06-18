export function initReveal() {
  if (typeof IntersectionObserver === 'undefined') return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    document.querySelectorAll('.reveal, .reveal-stagger').forEach((el) => {
      el.classList.add('is-visible');
    });
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
  );

  function attach() {
    document.querySelectorAll('.reveal, .reveal-stagger').forEach((el) => {
      if (!el.classList.contains('is-visible')) io.observe(el);
    });
  }

  attach();
  requestAnimationFrame(attach);

  return () => io.disconnect();
}
