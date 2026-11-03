import { NextResponse } from 'next/server';
import { SubstitutionService } from '@/server/services/SubstitutionService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sub_id, faculty_id } = body;

    if (!sub_id || !faculty_id) {
      return NextResponse.json(
        { error: 'Missing sub_id or faculty_id in request body.' },
        { status: 400 }
      );
    }

    const result = SubstitutionService.claimOpenSubstitution({
      subId: sub_id,
      facultyId: faculty_id,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to claim substitution.' },
        { status: result.status || 400 }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

