import { NextResponse } from 'next/server';
import { TimetableService } from '@/server/services/TimetableService';

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const result = TimetableService.moveEntry({
      entryId: params.id,
      newSlotId: body.slot_id,
      newRoomId: body.room_id,
      userId: body.user_id || 'u-coord',
      reason: body.reason,
    });

    if (!result.success) {
      // TC-09: Rejection with HTTP 409 Conflict
      return NextResponse.json(
        {
          error: 'Movement rejected due to scheduling clash',
          conflicts: result.conflicts,
        },
        { status: 409 }
      );
    }

    return NextResponse.json({ success: true, entry: result.entry });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

