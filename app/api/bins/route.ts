import { NextRequest, NextResponse } from 'next/server';
import { taskStore } from '@/lib/store';

export async function GET() {
  try {
    const bins = taskStore.getBins();
    return NextResponse.json({ success: true, data: bins });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bins' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskId, binId } = body;
    
    if (!taskId || !binId) {
      return NextResponse.json(
        { success: false, error: 'Missing taskId or binId' },
        { status: 400 }
      );
    }

    const moved = taskStore.moveTaskToBin(taskId, binId);
    
    if (!moved) {
      return NextResponse.json(
        { success: false, error: 'Failed to move task' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data: { taskId, binId } });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to move task' },
      { status: 500 }
    );
  }
}