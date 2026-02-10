import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import RoutineTemplate from '@/models/RoutineTemplate';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';
import { sanitizeString } from '@/lib/validators';

/**
 * GET /api/coach/templates/[id]
 * Get a specific template
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const template = await RoutineTemplate.findById(id);

    if (!template) {
      return NextResponse.json(
        { message: 'Template not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (template.coachId.toString() !== user.userId) {
      return NextResponse.json(
        { message: 'Not authorized to view this template' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      template: template.toSafeObject(),
    });
  } catch (error) {
    console.error('Get template error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch template' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/coach/templates/[id]
 * Update a template
 */
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const template = await RoutineTemplate.findById(id);

    if (!template) {
      return NextResponse.json(
        { message: 'Template not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (template.coachId.toString() !== user.userId) {
      return NextResponse.json(
        { message: 'Not authorized to edit this template' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Build updates
    if (body.title !== undefined) {
      template.title = sanitizeString(body.title, 100);
    }
    if (body.description !== undefined) {
      template.description = sanitizeString(body.description, 500);
    }
    if (body.tasks !== undefined) {
      template.tasks = Array.isArray(body.tasks)
        ? body.tasks.slice(0, 30).map((task, i) => ({
            label: sanitizeString(task.label, 100),
            description: sanitizeString(task.description || '', 300),
            order: task.order ?? i,
          }))
        : [];
    }
    if (body.category !== undefined) {
      template.category = body.category;
    }
    if (body.suggestedFrequency !== undefined) {
      template.suggestedFrequency = body.suggestedFrequency;
    }
    if (body.estimatedMinutes !== undefined) {
      template.estimatedMinutes = Math.min(Math.max(body.estimatedMinutes, 1), 480);
    }
    if (body.difficulty !== undefined) {
      template.difficulty = body.difficulty;
    }
    if (body.color !== undefined) {
      template.color = body.color;
    }
    if (body.tags !== undefined) {
      template.tags = Array.isArray(body.tags)
        ? body.tags.slice(0, 10).map((t) => sanitizeString(t, 30))
        : [];
    }
    if (body.isPublic !== undefined) {
      template.isPublic = Boolean(body.isPublic);
    }
    if (body.isPublished !== undefined) {
      // Can only publish if has at least one task
      if (body.isPublished && template.tasks.length === 0) {
        return NextResponse.json(
          { message: 'Cannot publish template with no tasks' },
          { status: 400 }
        );
      }
      template.isPublished = Boolean(body.isPublished);
    }

    await template.save();

    return NextResponse.json({
      message: template.isPublished ? 'Template published!' : 'Template updated',
      template: template.toSafeObject(),
    });
  } catch (error) {
    console.error('Update template error:', error);
    return NextResponse.json(
      { message: 'Failed to update template' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/coach/templates/[id]
 * Delete a template
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const template = await RoutineTemplate.findById(id);

    if (!template) {
      return NextResponse.json(
        { message: 'Template not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (template.coachId.toString() !== user.userId) {
      return NextResponse.json(
        { message: 'Not authorized to delete this template' },
        { status: 403 }
      );
    }

    await RoutineTemplate.findByIdAndDelete(id);

    return NextResponse.json({
      message: 'Template deleted',
    });
  } catch (error) {
    console.error('Delete template error:', error);
    return NextResponse.json(
      { message: 'Failed to delete template' },
      { status: 500 }
    );
  }
}
