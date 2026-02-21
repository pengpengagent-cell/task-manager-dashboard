import { NextRequest, NextResponse } from 'next/server';
import { taskStore } from '@/lib/store';

export async function GET() {
  try {
    const agents = taskStore.getAgents();
    return NextResponse.json({ success: true, data: agents });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskId, agentId } = body;
    
    if (!taskId || !agentId) {
      return NextResponse.json(
        { success: false, error: 'Missing taskId or agentId' },
        { status: 400 }
      );
    }

    const assigned = taskStore.assignTaskToAgent(taskId, agentId);
    
    if (!assigned) {
      return NextResponse.json(
        { success: false, error: 'Failed to assign task' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data: { taskId, agentId } });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to assign task' },
      { status: 500 }
    );
  }
}