import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import RoutineTemplate from '@/models/RoutineTemplate';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';
import { sanitizeString } from '@/lib/validators';

/**
 * GET /api/coach/templates
 * Get all templates created by the current coach
 */
export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Verify coach status
    const dbUser = await User.findById(user.userId).select('role');
    if (!dbUser || (dbUser.role !== 'coach' && dbUser.role !== 'admin')) {
      return NextResponse.json(
        { message: 'Coach access required' },
        { status: 403 }
      );
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'published', 'draft', 'all'

    // Build query
    const query = { coachId: user.userId };
    if (status === 'published') {
      query.isPublished = true;
    } else if (status === 'draft') {
      query.isPublished = false;
    }

    const templates = await RoutineTemplate.find(query)
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json({
      templates: templates.map((t) => ({
        id: t._id,
        title: t.title,
        description: t.description,
        category: t.category,
        taskCount: t.tasks?.length || 0,
        difficulty: t.difficulty,
        color: t.color,
        isPublic: t.isPublic,
        isPublished: t.isPublished,
        shareCode: t.shareCode,
        stats: t.stats,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      })),
      total: templates.length,
    });
  } catch (error) {
    console.error('Get coach templates error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/coach/templates
 * Create a new routine template
 */
export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Verify coach status
    const dbUser = await User.findById(user.userId).select('role tier');
    if (!dbUser || (dbUser.role !== 'coach' && dbUser.role !== 'admin')) {
      return NextResponse.json(
        { message: 'Coach access required' },
        { status: 403 }
      );
    }

    // Check template limits based on tier
    const templateCount = await RoutineTemplate.countDocuments({ coachId: user.userId });
    const limits = {
      free: 3,
      premium: 15,
      premium_plus: Infinity,
    };
    const maxTemplates = limits[dbUser.tier] || 3;

    if (templateCount >= maxTemplates) {
      return NextResponse.json(
        {
          message: `Template limit reached (${maxTemplates}). Upgrade to create more!`,
          error: 'TEMPLATE_LIMIT_REACHED',
          upgradeRequired: true,
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate title
    if (!body.title || body.title.trim().length < 2) {
      return NextResponse.json(
        { message: 'Template title is required (min 2 characters)' },
        { status: 400 }
      );
    }

    // Create template
    const template = new RoutineTemplate({
      coachId: user.userId,
      title: sanitizeString(body.title, 100),
      description: sanitizeString(body.description || '', 500),
      tasks: Array.isArray(body.tasks)
        ? body.tasks.slice(0, 30).map((task, i) => ({
            label: sanitizeString(task.label, 100),
            description: sanitizeString(task.description || '', 300),
            order: task.order ?? i,
          }))
        : [],
      category: body.category || 'custom',
      suggestedFrequency: body.suggestedFrequency || 'daily',
      estimatedMinutes: Math.min(Math.max(body.estimatedMinutes || 15, 1), 480),
      difficulty: body.difficulty || 'beginner',
      color: body.color || 'blue',
      tags: Array.isArray(body.tags)
        ? body.tags.slice(0, 10).map((t) => sanitizeString(t, 30))
        : [],
      isPublic: Boolean(body.isPublic),
      isPublished: false, // Always start as draft
    });

    await template.save();

    return NextResponse.json(
      {
        message: 'Template created! Edit and publish when ready.',
        template: template.toSafeObject(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create template error:', error);
    return NextResponse.json(
      { message: 'Failed to create template' },
      { status: 500 }
    );
  }
}
