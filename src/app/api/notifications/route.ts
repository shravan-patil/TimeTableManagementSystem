import { NextResponse } from 'next/server';
import { db } from '@/server/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const recipientId = searchParams.get('userId');

  let notifications = Array.from(db.notifications.values());
  if (recipientId) {
    notifications = notifications.filter((n) => n.recipient_id === recipientId);
  }

  // Sort descending by timestamp
  notifications.sort((a, b) => new Date(b.sent_on).getTime() - new Date(a.sent_on).getTime());

  return NextResponse.json(notifications);
}

