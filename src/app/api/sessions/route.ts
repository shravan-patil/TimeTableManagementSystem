import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { SessionEntity } from '@/server/types';

export async function GET() {
  const sessions = Array.from(db.sessions.values());
  return NextResponse.json(sessions);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const sessionId = `SESS-${String(db.sessions.size + 101)}`;
    const newSession: SessionEntity = {
      session_id: sessionId,
      timetable_id: body.timetable_id || 'TT-2026-ODD',
      subject_id: body.subject_id,
      faculty_id: body.faculty_id,
      room_id: body.room_id,
      session_type: body.session_type || 'Lecture',
      duration_slots: body.duration_slots || 1,
      weekly_frequency: body.weekly_frequency || 3,
      batch_ids: body.batch_ids || [],
    };
    db.sessions.set(sessionId, newSession);
    return NextResponse.json(newSession, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

