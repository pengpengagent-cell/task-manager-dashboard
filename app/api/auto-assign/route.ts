import { NextRequest, NextResponse } from 'next/server';
import { taskStore } from '@/lib/store';

export async function POST(request: NextRequest) {
  try {
    const assignedTasks = taskStore.autoAssignTasks();
    
    return NextResponse.json({
      success: true,
      data: {
        assignedTasks,
        message: `Assigned ${assignedTasks.length} tasks to idle agents`
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to auto-assign tasks' },
      { status: 500 }
    );
  }
}