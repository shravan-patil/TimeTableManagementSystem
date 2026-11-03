import { NextResponse } from 'next/server';
import { GenerationService } from '@/server/services/GenerationService';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const result = GenerationService.generate({
      timetableId: body.timetableId || 'TT-2026-ODD',
      stepLimit: body.stepLimit || 100000,
      workingDays: body.workingDays,
      periodsPerDay: body.periodsPerDay,
    });
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

