import { NextResponse } from 'next/server';
import { SubstitutionService } from '@/server/services/SubstitutionService';
import { db } from '@/server/db';

export async function GET() {
  const leaves = Array.from(db.leaveRequests.values());
  return NextResponse.json(leaves);
}

export async function POST(req: Request) {
  try {
    const { facultyId, fromDate, toDate, reason } = await req.json();
    if (!facultyId || !fromDate || !toDate) {
      return NextResponse.json({ error: 'Missing required leave fields' }, { status: 400 });
    }

    const analysis = SubstitutionService.reportLeave(facultyId, fromDate, toDate, reason || 'Medical/Personal');
    return NextResponse.json(analysis, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

