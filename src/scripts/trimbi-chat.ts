interface TrimbiMessage {
  side: 'in' | 'out';
  text: string;
  time: string;
  slots?: string[];
}

const MESSAGES: TrimbiMessage[] = [
  { side: 'in', text: 'Hola, ¿tienes hueco mañana para un degradado?', time: '14:02' },
  {
    side: 'out',
    text: '¡Hola Diego! 👋 Soy Trimbi, el asistente de Barbería Cortez. Mañana martes tengo estos huecos disponibles:',
    time: '14:02',
    slots: ['10:30', '12:00', '17:45'],
  },
  { side: 'in', text: 'Las 17:45 me viene perfecto', time: '14:03' },
  {
    side: 'out',
    text: '✅ Reserva confirmada — Mañana 22 abril a las 17:45 con Marcos. Te envío recordatorio una hora antes. ¡Hasta mañana!',
    time: '14:03',
  },
];

function renderMessage(msg: TrimbiMessage, index: number): string {
  const slotsHtml = msg.slots
    ? `<div class="trimbi-wa-slots">${msg.slots
        .map((s, j) => `<span class="trimbi-wa-slot${j === 2 ? ' selected' : ''}">${s}</span>`)
        .join('')}</div>`
    : '';

  const check = msg.side === 'in' ? '<span class="trimbi-wa-msg-check"> ✓✓</span>' : '';

  return `<div class="trimbi-wa-msg trimbi-wa-msg--${msg.side}" data-msg-index="${index}">
    ${msg.text}
    ${slotsHtml}
    <span class="trimbi-wa-msg-time">${msg.time}${check}</span>
  </div>`;
}

export function initTrimbiChat(root: HTMLElement) {
  if (root.dataset.trimbiInit === 'true') return;
  root.dataset.trimbiInit = 'true';

  const chat = root.querySelector<HTMLElement>('[data-trimbi-messages]');
  const typing = root.querySelector<HTMLElement>('[data-trimbi-typing]');
  if (!chat) return;

  let visible = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let cancelled = false;

  function render() {
    chat!.innerHTML = MESSAGES.slice(0, visible)
      .map((m, i) => renderMessage(m, i))
      .join('');

    if (typing) {
      typing.hidden = !(visible > 0 && visible < MESSAGES.length);
    }
  }

  function tick() {
    if (cancelled) return;

    if (visible < MESSAGES.length) {
      visible += 1;
      render();
      timeoutId = setTimeout(tick, 1400);
    } else {
      timeoutId = setTimeout(() => {
        if (cancelled) return;
        visible = 0;
        render();
        timeoutId = setTimeout(tick, 600);
      }, 4500);
    }
  }

  render();
  timeoutId = setTimeout(tick, 600);

  return () => {
    cancelled = true;
    if (timeoutId) clearTimeout(timeoutId);
  };
}
