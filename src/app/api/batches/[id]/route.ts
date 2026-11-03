import { NextResponse } from 'next/server';
import { MasterDataService } from '@/server/services/MasterDataService';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const batch = MasterDataService.getBatchById(params.id);
  if (!batch) {
    return NextResponse.json({ error: `Batch ${params.id} not found` }, { status: 404 });
  }
  return NextResponse.json(batch, { status: 200 });
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    MasterDataService.deleteBatch(params.id);
    return NextResponse.json({ success: true, message: `Batch ${params.id} deleted` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 409 });
  }
}

