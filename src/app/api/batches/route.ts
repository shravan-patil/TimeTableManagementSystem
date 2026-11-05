import { NextResponse } from 'next/server';
import { MasterDataService } from '@/server/services/MasterDataService';

export async function GET() {
  const batches = MasterDataService.getAllBatches();
  return NextResponse.json(batches);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = MasterDataService.createBatch(body);
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

