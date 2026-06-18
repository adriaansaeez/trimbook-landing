type LeadState = 'idle' | 'loading' | 'success' | 'error';

interface LeadElements {
  root: HTMLElement;
  form: HTMLFormElement;
  success: HTMLElement;
  errorEl: HTMLElement | null;
  submitBtn: HTMLButtonElement;
  submitLabel: string;
}

function getLeadElements(root: HTMLElement): LeadElements | null {
  const form = root.querySelector<HTMLFormElement>('[data-lead-form]');
  const success = root.querySelector<HTMLElement>('[data-lead-success]');
  const submitBtn = root.querySelector<HTMLButtonElement>('[data-lead-submit]');

  if (!form || !success || !submitBtn) return null;

  return {
    root,
    form,
    success,
    errorEl: root.querySelector<HTMLElement>('[data-lead-error]'),
    submitBtn,
    submitLabel: submitBtn.dataset.defaultLabel ?? submitBtn.textContent?.trim() ?? 'Contactar con ventas →',
  };
}

function setLeadState(els: LeadElements, state: LeadState, errorMessage?: string) {
  const { form, success, errorEl, submitBtn, submitLabel } = els;

  if (state === 'success') {
    form.hidden = true;
    success.hidden = false;
    success.setAttribute('aria-hidden', 'false');
    if (errorEl) errorEl.hidden = true;
    return;
  }

  form.hidden = false;
  success.hidden = true;
  success.setAttribute('aria-hidden', 'true');

  if (state === 'loading') {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando…';
    if (errorEl) errorEl.hidden = true;
    return;
  }

  submitBtn.disabled = false;
  submitBtn.textContent = submitLabel;

  if (state === 'error' && errorEl) {
    errorEl.textContent = errorMessage ?? 'Error al enviar el formulario.';
    errorEl.hidden = false;
    return;
  }

  if (errorEl) errorEl.hidden = true;
}

async function handleLeadSubmit(event: SubmitEvent) {
  const form = (event.target as HTMLElement | null)?.closest<HTMLFormElement>('[data-lead-form]');
  if (!form) return;

  const root = form.closest<HTMLElement>('[data-lead-root]');
  if (!root) return;

  const els = getLeadElements(root);
  if (!els) return;

  event.preventDefault();
  setLeadState(els, 'loading');

  const formData = new FormData(form);
  const payload = {
    nombre: String(formData.get('nombre') ?? '').trim(),
    negocio: String(formData.get('negocio') ?? '').trim(),
    telefono: String(formData.get('telefono') ?? '').trim(),
    email: String(formData.get('email') ?? '').trim(),
    mensaje: String(formData.get('mensaje') ?? '').trim(),
    website: String(formData.get('website') ?? '').trim(),
  };

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    let data: { ok?: boolean; error?: string } = {};
    const contentType = res.headers.get('content-type') ?? '';

    if (contentType.includes('application/json')) {
      data = await res.json();
    }

    if (!res.ok || data.ok !== true) {
      throw new Error(data.error ?? 'Error al enviar el formulario.');
    }

    setLeadState(els, 'success');
  } catch (err) {
    const message =
      err instanceof DOMException && err.name === 'AbortError'
        ? 'La solicitud tardó demasiado. Inténtalo de nuevo.'
        : err instanceof Error
          ? err.message
          : 'Error al enviar el formulario.';

    setLeadState(els, 'error', message);
  } finally {
    window.clearTimeout(timeoutId);
  }
}

let bound = false;

export function initLeadForm() {
  if (bound) return;
  bound = true;

  document.addEventListener('submit', handleLeadSubmit);

  document.addEventListener('astro:before-swap', () => {
    bound = false;
    document.removeEventListener('submit', handleLeadSubmit);
  });
}

function boot() {
  initLeadForm();

  document.querySelectorAll<HTMLElement>('[data-lead-root]').forEach((root) => {
    const els = getLeadElements(root);
    if (!els) return;
    setLeadState(els, 'idle');
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

document.addEventListener('astro:page-load', boot);
