import { NextRequest, NextResponse } from 'next/server';
import { taskStore } from '@/lib/store';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const timelineLimit = parseInt(searchParams.get('limit') || '50');

    const stats = taskStore.getActivityStats();
    const timeline = taskStore.getActivityTimeline(timelineLimit);

    return NextResponse.json({
      stats,
      timeline,
    });
  } catch (error) {
    console.error('Error fetching activity data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity data' },
      { status: 500 }
    );
  }
}
