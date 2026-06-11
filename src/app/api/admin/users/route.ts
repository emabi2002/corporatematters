import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Guard =
  | { ok: true; admin: ReturnType<typeof createAdminClient>; callerId: string }
  | { ok: false; status: number; error: string };

/** Verify the request comes from an authenticated admin user. */
async function requireAdmin(req: NextRequest): Promise<Guard> {
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!token) {
    return { ok: false, status: 401, error: 'Not authenticated' };
  }

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch (e: any) {
    return { ok: false, status: 500, error: e?.message || 'Server not configured' };
  }

  // Validate the caller's access token.
  const { data: userData, error: userErr } = await admin.auth.getUser(token);
  if (userErr || !userData?.user) {
    return { ok: false, status: 401, error: 'Invalid or expired session' };
  }

  // Confirm the caller has an admin role.
  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .single();

  const role = (profile?.role || '').toLowerCase();
  const isAdmin = role.includes('admin') || role.includes('system');
  if (!isAdmin) {
    return { ok: false, status: 403, error: 'Admin access required' };
  }

  return { ok: true, admin, callerId: userData.user.id };
}

/** Create a new user (auth account + profile + group membership). */
export async function POST(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }
  const { admin, callerId } = guard;

  try {
    const body = await req.json();
    const email: string = (body.email || '').trim();
    const password: string = body.password || '';
    const full_name: string = (body.full_name || '').trim();
    const department: string | null = body.department?.trim() || null;
    const group_id: string | null = body.group_id || null;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    // Create the auth account (email pre-confirmed).
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, department },
    });
    if (createErr) throw createErr;

    const newId = created.user?.id;
    if (!newId) throw new Error('User was not created');

    // Ensure the profile row reflects the supplied details (a DB trigger may
    // already create a bare profile; upsert keeps it in sync).
    await admin
      .from('profiles')
      .upsert(
        {
          id: newId,
          email,
          full_name: full_name || null,
          department,
          role: 'user',
          is_active: true,
        },
        { onConflict: 'id' }
      );

    // Assign to the selected group.
    if (group_id) {
      await admin.from('user_groups').insert({
        user_id: newId,
        group_id,
        assigned_by: callerId,
        is_active: true,
      });
    }

    return NextResponse.json({ ok: true, id: newId });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to create user' }, { status: 400 });
  }
}

/** Permanently delete a user (auth account + memberships). */
export async function DELETE(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }
  const { admin, callerId } = guard;

  try {
    const id = new URL(req.url).searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'User id is required' }, { status: 400 });
    }
    if (id === callerId) {
      return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 });
    }

    // Remove group memberships first, then delete the auth account.
    await admin.from('user_groups').delete().eq('user_id', id);

    const { error: delErr } = await admin.auth.admin.deleteUser(id);
    if (delErr) throw delErr;

    // Best-effort profile cleanup (in case there is no auth->profile cascade).
    await admin.from('profiles').delete().eq('id', id);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to delete user' }, { status: 400 });
  }
}
