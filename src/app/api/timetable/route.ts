import { NextResponse } from 'next/server';
import { TimetableService } from '@/server/services/TimetableService';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const batchId = searchParams.get('batch') || undefined;
  const facultyId = searchParams.get('faculty') || undefined;
  const roomId = searchParams.get('room') || undefined;

  const schedule = TimetableService.getPublicSchedule({
    batchId,
    facultyId,
    roomId,
  });

  return NextResponse.json({ schedule }, { status: 200 });
}

