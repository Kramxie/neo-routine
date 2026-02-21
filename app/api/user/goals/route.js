import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Goal from '@/models/Goal';
import { getCurrentUser } from '@/lib/auth';

/**
 * GET /api/user/goals
 * Get all goals for the authenticated user
 */
export async function GET(request) {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized', goals: [] },
        { status: 401 }
      );
    }

    // Demo mode - return empty array (no sample data)
    if (user.userId === 'demo-user-123') {
      return NextResponse.json({
        goals: [],
        isDemo: true,
      });
    }

    // Connect to database
    await connectDB();

    // Parse query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';
    const includeAll = searchParams.get('all') === 'true';

    // Build query
    const query = { userId: user.userId };
    if (!includeAll && status) {
      query.status = status;
    }

    // Fetch goals
    const goals = await Goal.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      goals: goals.map(goal => ({
        ...goal,
        _id: goal._id.toString(),
        userId: goal.userId.toString(),
        linkedRoutineId: goal.linkedRoutineId?.toString() || null,
      })),
    });
  } catch (error) {
    console.error('Get goals error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch goals', goals: [] },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/goals
 * Create a new goal
 */
export async function POST(request) {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Demo mode - simulate creation
    if (user.userId === 'demo-user-123') {
      const body = await request.json();
      return NextResponse.json({
        message: 'Goal created (demo mode)',
        goal: {
          _id: `demo-goal-${Date.now()}`,
          ...body,
          userId: user.userId,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        isDemo: true,
      });
    }

    // Connect to database
    await connectDB();

    // Parse request body
    const body = await request.json();
    const { title, description, category, timeframe, targetValue, currentValue, dueDate, linkedRoutineId } = body;

    // Validate required fields
    if (!title || !title.trim()) {
      return NextResponse.json(
        { message: 'Goal title is required' },
        { status: 400 }
      );
    }

    // Create goal
    const goal = await Goal.create({
      userId: user.userId,
      title: title.trim(),
      description: description?.trim() || '',
      category: category || 'other',
      timeframe: timeframe || 'monthly',
      targetValue: targetValue || 100,
      currentValue: currentValue || 0,
      dueDate: dueDate ? new Date(dueDate) : null,
      linkedRoutineId: linkedRoutineId || null,
      status: 'active',
    });

    return NextResponse.json({
      message: 'Goal created successfully',
      goal: {
        ...goal.toObject(),
        _id: goal._id.toString(),
        userId: goal.userId.toString(),
        linkedRoutineId: goal.linkedRoutineId?.toString() || null,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Create goal error:', error);
    return NextResponse.json(
      { message: 'Failed to create goal' },
      { status: 500 }
    );
  }
}
