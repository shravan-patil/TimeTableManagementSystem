import { NextResponse } from 'next/server';
import { MasterDataService } from '@/server/services/MasterDataService';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const availability = MasterDataService.getFacultyAvailability(params.id);
  return NextResponse.json({ facultyId: params.id, availability });
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { slotId, isAvailable } = await req.json();
    MasterDataService.setFacultyAvailability(params.id, slotId, isAvailable);
    return NextResponse.json({ success: true, facultyId: params.id, slotId, isAvailable });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  return PUT(req, { params });
}

