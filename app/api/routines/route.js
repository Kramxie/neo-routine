import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Routine from '@/models/Routine';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';
import { validateRoutine, sanitizeString } from '@/lib/validators';
import { canCreateRoutine, canAddTask, getEffectiveTier } from '@/lib/features';

/**
 * GET /api/routines
 * Get all routines for the authenticated user
 */
export async function GET(request) {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized', data: null },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    // Parse query params
    const { searchParams } = new URL(request.url);
    const includeArchived = searchParams.get('archived') === 'true';

    // Build query
    const query = { userId: user.userId };
    if (!includeArchived) {
      query.isArchived = false;
    }

    // Fetch routines
    const routines = await Routine.find(query)
      .sort({ order: 1, createdAt: -1 })
      .lean();

    // Get user tier for limits info
    const dbUser = await User.findById(user.userId).select('tier subscription role');
    const effectiveTier = getEffectiveTier(dbUser);
    const routineLimit = canCreateRoutine(effectiveTier, routines.length);

    return NextResponse.json({
      routines: routines.map((routine) => ({
        _id: routine._id,
        id: routine._id,
        name: routine.title,
        title: routine.title,
        description: routine.description,
        tasks: routine.tasks.map((task) => ({
          _id: task._id,
          id: task._id,
          label: task.label,
          isActive: task.isActive,
        })),
        color: routine.color,
        order: routine.order,
        isArchived: routine.isArchived,
        createdAt: routine.createdAt,
        updatedAt: routine.updatedAt,
      })),
      limits: {
        canCreate: routineLimit.allowed,
        remaining: routineLimit.remaining,
        max: routineLimit.limit,
      },
      tier: effectiveTier,
    });
  } catch (error) {
    console.error('Get routines error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch routines' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/routines
 * Create a new routine
 */
export async function POST(request) {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized', data: null },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    // Get user and their current routine count
    const dbUser = await User.findById(user.userId).select('tier subscription role');
    const effectiveTier = getEffectiveTier(dbUser);
    const currentRoutineCount = await Routine.countDocuments({ 
      userId: user.userId, 
      isArchived: false 
    });

    // Check if user can create more routines
    const routineCheck = canCreateRoutine(effectiveTier, currentRoutineCount);
    if (!routineCheck.allowed) {
      return NextResponse.json(
        {
          message: `You've reached your routine limit (${routineCheck.limit}). Upgrade to create more!`,
          error: 'ROUTINE_LIMIT_REACHED',
          data: {
            limit: routineCheck.limit,
            current: currentRoutineCount,
            upgradeRequired: true,
          },
        },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Accept both 'name' and 'title' for backwards compatibility
    const title = body.title || body.name;

    // Sanitize inputs
    const data = {
      title: sanitizeString(title, 100),
      description: sanitizeString(body.description, 500),
      tasks: Array.isArray(body.tasks)
        ? body.tasks.map((task) => ({
            label: sanitizeString(task.label, 100),
            isActive: task.isActive !== false,
          }))
        : [],
      color: body.color || 'blue',
    };

    // Check task limit
    const taskCheck = canAddTask(effectiveTier, 0, data.tasks.length);
    if (!taskCheck.allowed) {
      return NextResponse.json(
        {
          message: `Too many tasks (max ${taskCheck.limit} for your plan). Upgrade for more!`,
          error: 'TASK_LIMIT_EXCEEDED',
          data: {
            limit: taskCheck.limit,
            requested: data.tasks.length,
            upgradeRequired: true,
          },
        },
        { status: 403 }
      );
    }

    // Validate input
    const validation = validateRoutine(data);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          message: 'Validation failed',
          data: { errors: validation.errors },
        },
        { status: 400 }
      );
    }

    // Get next order number
    const lastRoutine = await Routine.findOne({ userId: user.userId })
      .sort({ order: -1 })
      .select('order')
      .lean();
    const nextOrder = lastRoutine ? lastRoutine.order + 1 : 0;

    // Create routine
    const routine = new Routine({
      userId: user.userId,
      title: data.title,
      description: data.description,
      tasks: data.tasks,
      color: data.color,
      order: nextOrder,
    });

    await routine.save();

    return NextResponse.json(
      {
        message: 'Routine created successfully! Time to start your flow.',
        data: {
          routine: {
            ...routine.toSafeObject(),
            name: routine.title, // Include name alias
          },
        },
        limits: {
          canCreate: canCreateRoutine(effectiveTier, currentRoutineCount + 1).allowed,
          remaining: routineCheck.remaining - 1,
          max: routineCheck.limit,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create routine error:', error);
    return NextResponse.json(
      { message: 'Failed to create routine', data: { error: error.message } },
      { status: 500 }
    );
  }
}
