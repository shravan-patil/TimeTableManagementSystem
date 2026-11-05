import { NextResponse } from 'next/server';
import { AuthService } from '@/server/services/AuthService';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const result = await AuthService.authenticate(email, password);
    if (!result) {
      return NextResponse.json({ error: 'Invalid institutional credentials' }, { status: 401 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Authentication error' }, { status: 500 });
  }
}

