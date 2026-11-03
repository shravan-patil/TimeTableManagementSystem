import { NextResponse } from 'next/server';
import { db } from '@/server/db';

export async function PUT(req: Request) {
  try {
    const { notifId, userId } = await req.json();

    if (notifId) {
      const n = db.notifications.get(notifId);
      if (n) n.is_read = true;
    } else if (userId) {
      // Mark all as read for user
      Array.from(db.notifications.values()).forEach((n) => {
        if (n.recipient_id === userId) n.is_read = true;
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

