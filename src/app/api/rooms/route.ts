import { NextResponse } from 'next/server';
import { MasterDataService } from '@/server/services/MasterDataService';

export async function GET() {
  const rooms = MasterDataService.getAllRooms();
  return NextResponse.json(rooms);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = MasterDataService.createRoom(body);
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

