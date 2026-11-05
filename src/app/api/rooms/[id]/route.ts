import { NextResponse } from 'next/server';
import { MasterDataService } from '@/server/services/MasterDataService';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const room = MasterDataService.getRoomById(params.id);
  if (!room) {
    return NextResponse.json({ error: `Room ${params.id} not found` }, { status: 404 });
  }
  return NextResponse.json(room, { status: 200 });
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    MasterDataService.deleteRoom(params.id);
    return NextResponse.json({ success: true, message: `Room ${params.id} deleted` });
  } catch (error: any) {
    // TC-02: Returns 409 Conflict if actively referenced
    return NextResponse.json({ error: error.message }, { status: 409 });
  }
}

