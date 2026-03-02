import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import RoutineTemplate from '@/models/RoutineTemplate';
import Routine from '@/models/Routine';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';

/**
 * GET /api/templates
 * Browse public templates
 */
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured') === 'true';
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

    // Build query
    const query = { isPublic: true, isPublished: true };

    if (category && category !== 'all') {
      query.category = category;
    }
    if (difficulty) {
      query.difficulty = difficulty;
    }
    if (featured) {
      query.isFeatured = true;
    }
    if (search) {
      // Escape special regex characters to prevent ReDoS attacks
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { title: { $regex: escapedSearch, $options: 'i' } },
        { description: { $regex: escapedSearch, $options: 'i' } },
        { tags: { $in: [new RegExp(escapedSearch, 'i')] } },
      ];
    }

    const templates = await RoutineTemplate.find(query)
      .populate('coachId', 'name coachProfile.brandName coachProfile.avatarUrl coachProfile.isVerified')
      .sort({ isFeatured: -1, 'stats.adoptions': -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      templates: templates.map((t) => ({
        id: t._id,
        title: t.title,
        description: t.description,
        category: t.category,
        taskCount: t.tasks?.length || 0,
        difficulty: t.difficulty,
        estimatedMinutes: t.estimatedMinutes,
        color: t.color,
        tags: t.tags,
        isFeatured: t.isFeatured,
        stats: {
          adoptions: t.stats?.adoptions || 0,
          avgRating: t.stats?.avgRating || 0,
        },
        coach: {
          id: t.coachId?._id,
          name: t.coachId?.coachProfile?.brandName || t.coachId?.name,
          avatarUrl: t.coachId?.coachProfile?.avatarUrl,
          isVerified: t.coachId?.coachProfile?.isVerified,
        },
        shareCode: t.shareCode,
      })),
    });
  } catch (error) {
    console.error('Get templates error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/templates
 * Adopt a template (create a routine from it)
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

    const body = await request.json();
    const { templateId, shareCode } = body;

    // Find template by ID or share code
    let template;
    if (templateId) {
      template = await RoutineTemplate.findById(templateId);
    } else if (shareCode) {
      template = await RoutineTemplate.findOne({ shareCode: shareCode.toUpperCase() });
    } else {
      return NextResponse.json(
        { message: 'Template ID or share code required' },
        { status: 400 }
      );
    }

    if (!template) {
      return NextResponse.json(
        { message: 'Template not found' },
        { status: 404 }
      );
    }

    // Check if template is available
    if (!template.isPublished) {
      return NextResponse.json(
        { message: 'This template is not available' },
        { status: 403 }
      );
    }

    // Check user's tier limits
    const dbUser = await User.findById(user.userId).select('tier subscription role');
    const currentRoutineCount = await Routine.countDocuments({
      userId: user.userId,
      isArchived: false,
    });

    // Import feature helper
    const { canCreateRoutine, canAddTask, getEffectiveTier } = await import('@/lib/features');
    const effectiveTier = getEffectiveTier(dbUser);
    const routineCheck = canCreateRoutine(effectiveTier, currentRoutineCount);

    if (!routineCheck.allowed) {
      return NextResponse.json(
        {
          message: `Routine limit reached (${routineCheck.limit}). Upgrade to adopt this template!`,
          error: 'ROUTINE_LIMIT_REACHED',
          upgradeRequired: true,
        },
        { status: 403 }
      );
    }

    // Check if template's task count exceeds user's tier limit
    const templateTaskCount = template.tasks ? template.tasks.length : 0;
    const taskCheck = canAddTask(effectiveTier, 0, templateTaskCount);
    if (!taskCheck.allowed) {
      return NextResponse.json(
        {
          message: `This template has ${templateTaskCount} tasks, but your plan allows up to ${taskCheck.limit}. Upgrade to adopt it!`,
          error: 'TASK_LIMIT_EXCEEDED',
          upgradeRequired: true,
        },
        { status: 403 }
      );
    }

    // Get next order number
    const lastRoutine = await Routine.findOne({ userId: user.userId })
      .sort({ order: -1 })
      .select('order')
      .lean();
    const nextOrder = lastRoutine ? lastRoutine.order + 1 : 0;

    // Create routine from template
    const routine = new Routine({
      userId: user.userId,
      title: template.title,
      description: template.description,
      tasks: template.tasks.map((t) => ({
        label: t.label,
        isActive: true,
      })),
      color: template.color,
      order: nextOrder,
      // Track source template
      sourceTemplate: template._id,
    });

    await routine.save();

    // Update template adoption stats
    await RoutineTemplate.findByIdAndUpdate(template._id, {
      $inc: { 'stats.adoptions': 1 },
    });

    return NextResponse.json({
      message: `"${template.title}" added to your routines!`,
      routine: routine.toSafeObject(),
    }, { status: 201 });
  } catch (error) {
    console.error('Adopt template error:', error);
    return NextResponse.json(
      { message: 'Failed to adopt template' },
      { status: 500 }
    );
  }
}
