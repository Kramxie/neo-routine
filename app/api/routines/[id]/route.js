import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Routine from '@/models/Routine';
import { getCurrentUser } from '@/lib/auth';
import { validateRoutine, sanitizeString } from '@/lib/validators';

/**
 * GET /api/routines/[id]
 * Get a specific routine by ID
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;

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

    // Find routine
    const routine = await Routine.findOne({
      _id: id,
      userId: user.userId,
    });

    if (!routine) {
      return NextResponse.json(
        { message: 'Routine not found', data: null },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Routine retrieved successfully',
        data: { routine: routine.toSafeObject() },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get routine error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch routine', data: { error: error.message } },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/routines/[id]
 * Update a routine (partial update)
 */
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;

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

    // Connect to database
    await connectDB();

    // Find existing routine
    const routine = await Routine.findOne({
      _id: id,
      userId: user.userId,
    });

    if (!routine) {
      return NextResponse.json(
        { message: 'Routine not found', data: null },
        { status: 404 }
      );
    }

    // Build update object (only include provided fields)
    const updates = {};

    if (body.title !== undefined) {
      updates.title = sanitizeString(body.title, 100);
    }

    if (body.description !== undefined) {
      updates.description = sanitizeString(body.description, 500);
    }

    if (body.tasks !== undefined) {
      updates.tasks = Array.isArray(body.tasks)
        ? body.tasks.map((task) => ({
            _id: task.id || task._id,
            label: sanitizeString(task.label, 100),
            isActive: task.isActive !== false,
          }))
        : routine.tasks;
    }

    if (body.color !== undefined) {
      const validColors = ['blue', 'green', 'purple', 'orange', 'pink'];
      updates.color = validColors.includes(body.color) ? body.color : routine.color;
    }

    if (body.order !== undefined) {
      updates.order = Number(body.order) || routine.order;
    }

    if (body.isArchived !== undefined) {
      updates.isArchived = Boolean(body.isArchived);
    }

    // Validate updates
    const validation = validateRoutine({
      title: updates.title || routine.title,
      description: updates.description ?? routine.description,
      tasks: updates.tasks || routine.tasks,
    });

    if (!validation.isValid) {
      return NextResponse.json(
        {
          message: 'Validation failed',
          data: { errors: validation.errors },
        },
        { status: 400 }
      );
    }

    // Apply updates
    Object.assign(routine, updates);
    await routine.save();

    return NextResponse.json(
      {
        message: 'Routine updated successfully',
        data: { routine: routine.toSafeObject() },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update routine error:', error);
    return NextResponse.json(
      { message: 'Failed to update routine', data: { error: error.message } },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/routines/[id]
 * Archive a routine (soft delete)
 * To permanently delete, use ?permanent=true query param
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized', data: null },
        { status: 401 }
      );
    }

    // Check for permanent delete
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get('permanent') === 'true';

    // Connect to database
    await connectDB();

    // Find routine
    const routine = await Routine.findOne({
      _id: id,
      userId: user.userId,
    });

    if (!routine) {
      return NextResponse.json(
        { message: 'Routine not found', data: null },
        { status: 404 }
      );
    }

    if (permanent) {
      // Permanent delete
      await routine.deleteOne();
      return NextResponse.json(
        {
          message: 'Routine permanently deleted',
          data: null,
        },
        { status: 200 }
      );
    } else {
      // Soft delete (archive)
      routine.isArchived = true;
      await routine.save();
      return NextResponse.json(
        {
          message: 'Routine archived. You can restore it anytime.',
          data: { routine: routine.toSafeObject() },
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Delete routine error:', error);
    return NextResponse.json(
      { message: 'Failed to delete routine', data: { error: error.message } },
      { status: 500 }
    );
  }
}
