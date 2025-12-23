import { NextResponse } from 'next/server';
import { runDailyAutomation } from '@/scripts/daily-automation';

export async function POST() {
  try {
    const result = await runDailyAutomation();

    return NextResponse.json({
      success: true,
      videoUrl: result.videoUrl,
      videoId: result.videoId,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
