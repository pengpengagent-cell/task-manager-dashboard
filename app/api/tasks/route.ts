import { NextRequest, NextResponse } from 'next/server';
import { taskStore } from '@/lib/store';
import { Task } from '@/lib/types';

export async function GET() {
  try {
    const tasks = taskStore.getTasks();
    return NextResponse.json({ success: true, data: tasks });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.description || !body.priority) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'> = {
      title: body.title,
      description: body.description,
      status: 'pending',
      priority: Math.min(5, Math.max(1, body.priority)),
      assignee: null,
      metadata: body.metadata || {},
    };

    const createdTask = taskStore.createTask(task);
    
    return NextResponse.json(
      { success: true, data: createdTask },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create task' },
      { status: 500 }
    );
  }
}