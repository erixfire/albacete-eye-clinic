import { errorResponse, successResponse } from '../../../_utils.js';

async function hashPassword(password, salt) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']);
  const derived = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: encoder.encode(salt), iterations: 100000, hash: 'SHA-256' },
    key, { name: 'AES-GCM', length: 256 }, true, ['encrypt']
  );
  const raw = await crypto.subtle.exportKey('raw', derived);
  return btoa(String.fromCharCode(...new Uint8Array(raw)));
}

export async function onRequestGet(ctx) {
  const user = ctx.data.user;
  if (!user) return errorResponse('Unauthorized', 401);
  if (user.role !== 'admin') return errorResponse('Forbidden', 403);

  const { results } = await ctx.env.DB.prepare(
    `SELECT id, full_name, email, role, is_active, specialization_id, created_at
     FROM users ORDER BY full_name ASC`
  ).all();

  return successResponse({ users: results });
}

export async function onRequestPost(ctx) {
  const user = ctx.data.user;
  if (!user) return errorResponse('Unauthorized', 401);
  if (user.role !== 'admin') return errorResponse('Forbidden', 403);

  const body = await ctx.request.json();
  const { full_name, email, password, role } = body;

  if (!full_name?.trim() || !email?.trim() || !password || !role)
    return errorResponse('full_name, email, password, and role are required', 400);

  const validRoles = ['admin', 'doctor', 'nurse', 'pharmacist', 'frontdesk'];
  if (!validRoles.includes(role)) return errorResponse('Invalid role', 400);
  if (password.length < 8) return errorResponse('Password must be at least 8 characters', 400);

  const existing = await ctx.env.DB.prepare('SELECT id FROM users WHERE email = ?')
    .bind(email.toLowerCase().trim()).first();
  if (existing) return errorResponse('Email already in use', 409);

  const salt = crypto.randomUUID();
  const hash = await hashPassword(password, salt);

  const { meta } = await ctx.env.DB.prepare(
    `INSERT INTO users (full_name, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, 1)`
  ).bind(full_name.trim(), email.toLowerCase().trim(), `${salt}:${hash}`, role).run();

  return successResponse({ id: meta.last_row_id }, 201);
}
