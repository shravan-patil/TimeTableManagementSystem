import { NextResponse } from 'next/server';
import { MasterDataService } from '@/server/services/MasterDataService';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const fac = MasterDataService.getFacultyById(params.id);
  if (!fac) {
    return NextResponse.json({ error: `Faculty ${params.id} not found` }, { status: 404 });
  }
  return NextResponse.json(fac, { status: 200 });
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    MasterDataService.deleteFaculty(params.id);
    return NextResponse.json({ success: true, message: `Faculty ${params.id} deleted` });
  } catch (error: any) {
    // TC-02: Returns 409 Conflict if actively referenced
    return NextResponse.json({ error: error.message }, { status: 409 });
  }
}

