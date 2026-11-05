import { NextResponse } from 'next/server';
import { MasterDataService } from '@/server/services/MasterDataService';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const sub = MasterDataService.getSubjectById(params.id);
  if (!sub) {
    return NextResponse.json({ error: `Subject ${params.id} not found` }, { status: 404 });
  }
  return NextResponse.json(sub, { status: 200 });
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    MasterDataService.deleteSubject(params.id);
    return NextResponse.json({ success: true, message: `Subject ${params.id} deleted` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 409 });
  }
}

