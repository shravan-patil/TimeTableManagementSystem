import { NextResponse } from 'next/server';
import { TimetableService } from '@/server/services/TimetableService';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json().catch(() => ({}));
    const result = TimetableService.publishTimetable(
      params.id,
      body.user_id || 'u-coord'
    );

    if (!result.success) {
      // TC-10: Publication blocked due to critical clashes
      return NextResponse.json(
        {
          error: 'Publication blocked: timetable contains critical scheduling clashes',
          conflicts: result.conflicts,
        },
        { status: 409 }
      );
    }

    return NextResponse.json({ success: true, timetable: result.timetable });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

