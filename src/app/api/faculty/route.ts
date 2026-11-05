import { NextResponse } from 'next/server';
import { MasterDataService } from '@/server/services/MasterDataService';
import { WorkloadService } from '@/server/services/WorkloadService';

export async function GET() {
  const faculty = MasterDataService.getAllFaculty();
  const workloads = WorkloadService.getDepartmentWorkload();
  return NextResponse.json({ faculty, workloads }, { status: 200 });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = MasterDataService.createFaculty(body);
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

