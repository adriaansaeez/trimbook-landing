import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

interface ContactBody {
  nombre?: string;
  negocio?: string;
  telefono?: string;
  email?: string;
  mensaje?: string;
  website?: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const POST: APIRoute = async ({ request }) => {
  const apiKey = import.meta.env.RESEND_API_KEY;
  const toEmail = import.meta.env.CONTACT_TO_EMAIL;
  const fromEmail = import.meta.env.RESEND_FROM_EMAIL;

  if (!apiKey || !toEmail || !fromEmail) {
    return new Response(JSON.stringify({ error: 'Servicio de contacto no configurado.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: ContactBody;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Cuerpo de solicitud inválido.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (body.website) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const nombre = body.nombre?.trim() ?? '';
  const negocio = body.negocio?.trim() ?? '';
  const telefono = body.telefono?.trim() ?? '';
  const email = body.email?.trim() ?? '';
  const mensaje = body.mensaje?.trim() ?? '';

  if (!nombre || !negocio || !telefono || !email) {
    return new Response(JSON.stringify({ error: 'Completa todos los campos obligatorios.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!isValidEmail(email)) {
    return new Response(JSON.stringify({ error: 'Email no válido.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const resend = new Resend(apiKey);

  const html = `
    <h2>Nuevo contacto desde la landing</h2>
    <p><strong>Nombre:</strong> ${escapeHtml(nombre)}</p>
    <p><strong>Negocio:</strong> ${escapeHtml(negocio)}</p>
    <p><strong>Teléfono:</strong> ${escapeHtml(telefono)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Mensaje:</strong></p>
    <p>${escapeHtml(mensaje || '(sin mensaje)')}</p>
  `;

  const { error } = await resend.emails.send({
    from: fromEmail,
    to: toEmail,
    replyTo: email,
    subject: `[Trimbook Landing] Contacto de ${nombre} — ${negocio}`,
    html,
  });

  if (error) {
    console.error('Resend error:', error);
    return new Response(JSON.stringify({ error: 'No se pudo enviar el mensaje. Inténtalo más tarde.' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      Allow: 'POST, OPTIONS',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept',
    },
  });
};
