export function initGalleryTabs(root: HTMLElement) {
  if (root.dataset.galleryInit === 'true') return;
  root.dataset.galleryInit = 'true';

  const tabs = root.querySelectorAll<HTMLButtonElement>('[data-gallery-tab]');
  const panels = root.querySelectorAll<HTMLElement>('[data-gallery-panel]');
  const descLabel = root.querySelector<HTMLElement>('[data-gallery-desc-label]');
  const descText = root.querySelector<HTMLElement>('[data-gallery-desc-text]');

  let active = 0;
  let animating = false;

  function setActive(index: number, animate = true) {
    active = index;

    tabs.forEach((tab, i) => {
      tab.classList.toggle('gallery-tab--active', i === index);
      tab.setAttribute('aria-selected', i === index ? 'true' : 'false');
      tab.querySelector('.gallery-tab-bar')?.remove();
      if (i === index) {
        const bar = document.createElement('div');
        bar.className = 'gallery-tab-bar';
        tab.appendChild(bar);
      }
    });

    panels.forEach((panel, i) => {
      const isActive = i === index;
      panel.hidden = !isActive;
      panel.classList.remove('gallery-mockup--in', 'gallery-mockup--out');
      if (isActive && animate) panel.classList.add('gallery-mockup--in');
    });

    const tab = tabs[index];
    if (tab && descLabel && descText) {
      descLabel.textContent = tab.dataset.subtitle ?? '';
      descText.textContent = tab.dataset.desc ?? '';
    }
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => {
      if (i === active || animating) return;

      animating = true;
      const currentPanel = panels[active];
      currentPanel?.classList.add('gallery-mockup--out');

      setTimeout(() => {
        setActive(i);
        animating = false;
      }, 220);
    });
  });

  setActive(0, false);
}
