import { errorResponse, successResponse } from '../../../_utils.js';

export async function onRequestPut(ctx) {
  const user = ctx.data.user;
  if (!user) return errorResponse('Unauthorized', 401);
  if (user.role !== 'admin') return errorResponse('Forbidden', 403);

  const id   = ctx.params.id;
  const body = await ctx.request.json();
  const { full_name, role, is_active } = body;

  if (Number(id) === Number(user.id) && is_active === 0)
    return errorResponse('Cannot deactivate your own account', 400);

  const fields = [];
  const vals   = [];

  if (full_name !== undefined) { fields.push('full_name = ?'); vals.push(full_name.trim()); }
  if (role !== undefined) {
    const valid = ['admin', 'doctor', 'nurse', 'pharmacist', 'frontdesk'];
    if (!valid.includes(role)) return errorResponse('Invalid role', 400);
    fields.push('role = ?'); vals.push(role);
  }
  if (is_active !== undefined) { fields.push('is_active = ?'); vals.push(is_active ? 1 : 0); }

  if (fields.length === 0) return errorResponse('Nothing to update', 400);

  vals.push(id);
  await ctx.env.DB.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`)
    .bind(...vals).run();

  return successResponse({ ok: true });
}
