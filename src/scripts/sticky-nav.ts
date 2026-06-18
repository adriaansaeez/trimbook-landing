type StickyState = 'idle' | 'visible' | 'hidden';

export function initStickyNav() {
  const stickyNav = document.querySelector<HTMLElement>('[data-sticky-nav]');
  if (!stickyNav) return;

  let pastHero = false;

  function setState(state: StickyState) {
    stickyNav!.dataset.stickyState = state;
    stickyNav!.classList.remove('nav-sticky--visible', 'nav-sticky--hidden');

    if (state === 'visible') {
      stickyNav!.classList.add('nav-sticky--visible');
      stickyNav!.hidden = false;
    } else if (state === 'hidden') {
      stickyNav!.classList.add('nav-sticky--hidden');
    } else {
      stickyNav!.hidden = true;
    }
  }

  function onScroll() {
    const heroSectionBottom =
      document.querySelector('.hero-section-wrap')?.getBoundingClientRect().bottom ?? 0;
    const nowPast = heroSectionBottom < 0;

    if (nowPast !== pastHero) {
      pastHero = nowPast;
      setState(nowPast ? 'visible' : 'hidden');
    }
  }

  setState('idle');
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  return () => window.removeEventListener('scroll', onScroll);
}
