import { NextResponse } from 'next/server';
import { SubstitutionService } from '@/server/services/SubstitutionService';
import { db } from '@/server/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const isOpen = searchParams.get('open') === 'true' || searchParams.get('status') === 'OPEN_FOR_CLAIM';
  const facultyId = searchParams.get('facultyId') || undefined;

  if (isOpen) {
    const openSubs = SubstitutionService.getOpenSubstitutions(facultyId);
    return NextResponse.json(openSubs);
  }

  const substitutions = Array.from(db.substitutions.values());
  return NextResponse.json(substitutions);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = SubstitutionService.confirmSubstitution({
      leaveId: body.leave_id,
      entryId: body.entry_id,
      substituteFacultyId: body.substitute_faculty_id,
      rescheduledSlotId: body.rescheduled_slot_id,
      rescheduledRoomId: body.rescheduled_room_id,
      action: body.action || 'Substituted',
      subDate: body.sub_date || new Date().toISOString().split('T')[0],
      coordinatorUserId: body.user_id || 'u-coord',
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

