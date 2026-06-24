import { errorResponse, successResponse } from '../../_utils.js';

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

export async function onRequestPost(ctx) {
  const user = ctx.data.user;
  if (!user) return errorResponse('Unauthorized', 401);

  const body = await ctx.request.json();
  const { current_password, new_password } = body;

  if (!current_password || !new_password)
    return errorResponse('current_password and new_password are required', 400);
  if (new_password.length < 8)
    return errorResponse('New password must be at least 8 characters', 400);
  if (current_password === new_password)
    return errorResponse('New password must differ from current password', 400);

  const row = await ctx.env.DB.prepare('SELECT id, password_hash FROM users WHERE id = ?')
    .bind(user.id).first();
  if (!row) return errorResponse('User not found', 404);

  const [salt, storedHash] = row.password_hash.split(':');
  const computed = await hashPassword(current_password, salt);
  if (computed !== storedHash) return errorResponse('Current password is incorrect', 400);

  const newSalt = crypto.randomUUID();
  const newHash = await hashPassword(new_password, newSalt);
  await ctx.env.DB.prepare('UPDATE users SET password_hash = ? WHERE id = ?')
    .bind(`${newSalt}:${newHash}`, user.id).run();

  return successResponse({ ok: true });
}
