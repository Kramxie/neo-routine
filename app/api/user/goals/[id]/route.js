import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Goal from '@/models/Goal';
import { getCurrentUser } from '@/lib/auth';

/**
 * GET /api/user/goals/[id]
 * Get a specific goal by ID
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Demo mode
    if (user.userId === 'demo-user-123') {
      return NextResponse.json(
        { message: 'Goal not found (demo mode)' },
        { status: 404 }
      );
    }

    // Connect to database
    await connectDB();

    // Find goal
    const goal = await Goal.findOne({
      _id: id,
      userId: user.userId,
    }).lean();

    if (!goal) {
      return NextResponse.json(
        { message: 'Goal not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      goal: {
        ...goal,
        _id: goal._id.toString(),
        userId: goal.userId.toString(),
        linkedRoutineId: goal.linkedRoutineId?.toString() || null,
      },
    });
  } catch (error) {
    console.error('Get goal error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch goal' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user/goals/[id]
 * Update a goal
 */
export async function PUT(request, { params }) {
  try {
    const { id } = await params;

    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Demo mode
    if (user.userId === 'demo-user-123') {
      const body = await request.json();
      return NextResponse.json({
        message: 'Goal updated (demo mode)',
        goal: {
          _id: id,
          ...body,
          updatedAt: new Date().toISOString(),
        },
        isDemo: true,
      });
    }

    // Connect to database
    await connectDB();

    // Parse request body
    const body = await request.json();
    const { title, description, category, timeframe, targetValue, currentValue, dueDate, linkedRoutineId, status } = body;

    // Find and verify ownership
    const goal = await Goal.findOne({
      _id: id,
      userId: user.userId,
    });

    if (!goal) {
      return NextResponse.json(
        { message: 'Goal not found' },
        { status: 404 }
      );
    }

    // Update fields
    if (title !== undefined) goal.title = title.trim();
    if (description !== undefined) goal.description = description.trim();
    if (category !== undefined) goal.category = category;
    if (timeframe !== undefined) goal.timeframe = timeframe;
    if (targetValue !== undefined) goal.targetValue = targetValue;
    if (currentValue !== undefined) goal.currentValue = currentValue;
    if (dueDate !== undefined) goal.dueDate = dueDate ? new Date(dueDate) : null;
    if (linkedRoutineId !== undefined) goal.linkedRoutineId = linkedRoutineId || null;
    if (status !== undefined) goal.status = status;

    // Auto-complete if target reached
    if (goal.currentValue >= goal.targetValue && goal.status === 'active') {
      goal.status = 'completed';
      goal.completedAt = new Date();
    }

    await goal.save();

    return NextResponse.json({
      message: 'Goal updated successfully',
      goal: {
        ...goal.toObject(),
        _id: goal._id.toString(),
        userId: goal.userId.toString(),
        linkedRoutineId: goal.linkedRoutineId?.toString() || null,
      },
    });
  } catch (error) {
    console.error('Update goal error:', error);
    return NextResponse.json(
      { message: 'Failed to update goal' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/goals/[id]
 * Delete a goal
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Demo mode
    if (user.userId === 'demo-user-123') {
      return NextResponse.json({
        message: 'Goal deleted (demo mode)',
        isDemo: true,
      });
    }

    // Connect to database
    await connectDB();

    // Find and delete
    const goal = await Goal.findOneAndDelete({
      _id: id,
      userId: user.userId,
    });

    if (!goal) {
      return NextResponse.json(
        { message: 'Goal not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Goal deleted successfully',
    });
  } catch (error) {
    console.error('Delete goal error:', error);
    return NextResponse.json(
      { message: 'Failed to delete goal' },
      { status: 500 }
    );
  }
}
