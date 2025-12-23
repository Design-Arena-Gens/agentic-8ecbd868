import { NextResponse } from 'next/server';
import { getAuthorizationUrl } from '@/lib/youtube-uploader';

export async function GET() {
  try {
    const authUrl = getAuthorizationUrl();
    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
