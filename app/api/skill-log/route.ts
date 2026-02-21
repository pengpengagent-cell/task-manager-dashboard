import { NextRequest, NextResponse } from 'next/server';
import { taskStore } from '@/lib/store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { skill, trigger, success, notes } = body;

    if (!skill || !trigger || typeof success !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required fields: skill, trigger, success' },
        { status: 400 }
      );
    }

    const log = taskStore.createSkillLog({
      skill,
      trigger,
      success,
      notes,
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error('Error creating skill log:', error);
    return NextResponse.json(
      { error: 'Failed to create skill log' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const logs = taskStore.getSkillLogs();
    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching skill logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skill logs' },
      { status: 500 }
    );
  }
}
