import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Routine from '@/models/Routine';
import { getCurrentUser } from '@/lib/auth';
import { validateRoutine, sanitizeString } from '@/lib/validators';

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

    return NextResponse.json(
      {
        message: 'Routines retrieved successfully',
        data: {
          routines: routines.map((routine) => ({
            id: routine._id,
            title: routine.title,
            description: routine.description,
            tasks: routine.tasks.map((task) => ({
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
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get routines error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch routines', data: { error: error.message } },
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

    // Parse request body
    const body = await request.json();

    // Sanitize inputs
    const data = {
      title: sanitizeString(body.title, 100),
      description: sanitizeString(body.description, 500),
      tasks: Array.isArray(body.tasks)
        ? body.tasks.map((task) => ({
            label: sanitizeString(task.label, 100),
            isActive: task.isActive !== false,
          }))
        : [],
      color: body.color || 'blue',
    };

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

    // Connect to database
    await connectDB();

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
          routine: routine.toSafeObject(),
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
