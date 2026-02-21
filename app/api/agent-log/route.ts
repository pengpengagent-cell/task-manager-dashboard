import { NextRequest, NextResponse } from 'next/server';
import { taskStore } from '@/lib/store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agent, trigger, durationSeconds, success, notes } = body;

    if (!agent || !trigger || typeof success !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required fields: agent, trigger, success' },
        { status: 400 }
      );
    }

    const log = taskStore.createAgentLog({
      agent,
      trigger,
      durationSeconds,
      success,
      notes,
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error('Error creating agent log:', error);
    return NextResponse.json(
      { error: 'Failed to create agent log' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const logs = taskStore.getAgentLogs();
    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching agent logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent logs' },
      { status: 500 }
    );
  }
}
