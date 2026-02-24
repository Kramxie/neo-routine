import connectDB from '@/lib/db';
import Routine from '@/models/Routine';
import CheckIn from '@/models/CheckIn';
import Goal from '@/models/Goal';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';
import { success as _success, unauthorized, forbidden, error } from '@/lib/apiResponse';
import { hasFeature, getEffectiveTier } from '@/lib/features';

/**
 * GET /api/user/export
 * Export user data as JSON or CSV
 * Premium feature - requires premium or premium_plus tier
 * 
 * Query params:
 * - format: 'json' (default) or 'csv'
 * - include: comma-separated list of data types to include
 *   Options: routines, checkins, goals, profile (default: all)
 */
export async function GET(request) {
  try {
    // Authentication check
    const authUser = await getCurrentUser();
    if (!authUser) {
      return unauthorized('Authentication required');
    }

    // Demo mode not supported for export
    if (authUser.userId === 'demo-user-123') {
      return forbidden('Data export is not available in demo mode');
    }

    await connectDB();

    // Get user and check tier
    const user = await User.findById(authUser.userId).select('name email tier subscription preferences createdAt');
    if (!user) {
      return unauthorized('User not found');
    }

    const effectiveTier = getEffectiveTier(user);
    
    // Check if user has export feature access
    if (!hasFeature(effectiveTier, 'exportData')) {
      return forbidden('Data export is a Premium feature. Please upgrade to access this feature.');
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';
    const includeParam = searchParams.get('include') || 'routines,checkins,goals,profile';
    const includeTypes = includeParam.split(',').map(t => t.trim().toLowerCase());

    // Build export data
    const exportData = {
      exportedAt: new Date().toISOString(),
      user: null,
      routines: [],
      checkIns: [],
      goals: [],
    };

    // Export profile data
    if (includeTypes.includes('profile')) {
      exportData.user = {
        name: user.name,
        email: user.email,
        tier: effectiveTier,
        timezone: user.preferences?.timezone || 'UTC',
        memberSince: user.createdAt,
      };
    }

    // Export routines
    if (includeTypes.includes('routines')) {
      const routines = await Routine.find({ 
        userId: authUser.userId,
        isArchived: false 
      }).lean();

      exportData.routines = routines.map(routine => ({
        id: routine._id.toString(),
        title: routine.title,
        description: routine.description || '',
        color: routine.color,
        tasks: routine.tasks.map(task => ({
          id: task._id.toString(),
          label: task.label,
          isActive: task.isActive,
        })),
        createdAt: routine.createdAt,
        updatedAt: routine.updatedAt,
      }));
    }

    // Export check-ins
    if (includeTypes.includes('checkins')) {
      const checkIns = await CheckIn.find({ userId: authUser.userId })
        .sort({ dateISO: -1 })
        .limit(10000) // Reasonable limit
        .lean();

      exportData.checkIns = checkIns.map(checkIn => ({
        id: checkIn._id.toString(),
        routineId: checkIn.routineId.toString(),
        taskId: checkIn.taskId.toString(),
        date: checkIn.dateISO,
        note: checkIn.note || '',
        createdAt: checkIn.createdAt,
      }));
    }

    // Export goals
    if (includeTypes.includes('goals')) {
      const goals = await Goal.find({ 
        userId: authUser.userId,
        status: { $ne: 'archived' }
      }).lean();

      exportData.goals = goals.map(goal => ({
        id: goal._id.toString(),
        title: goal.title,
        description: goal.description || '',
        category: goal.category,
        timeframe: goal.timeframe,
        targetValue: goal.targetValue,
        currentValue: goal.currentValue,
        progressPercentage: goal.targetValue ? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100)) : 0,
        status: goal.status,
        dueDate: goal.dueDate,
        createdAt: goal.createdAt,
      }));
    }

    // Return based on format
    if (format === 'csv') {
      const csv = convertToCSV(exportData);
      return new Response(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="neoroutine-export-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    // Default: JSON format
    return new Response(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="neoroutine-export-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });

  } catch (err) {
    console.error('[Export API Error]', err);
    return error('Failed to export data. Please try again.', 500);
  }
}

/**
 * Convert export data to CSV format
 * Creates separate sections for each data type
 */
function convertToCSV(data) {
  const lines = [];
  const timestamp = data.exportedAt;

  // Header
  lines.push('# NeoRoutine Data Export');
  lines.push(`# Exported: ${timestamp}`);
  lines.push('');

  // Profile section
  if (data.user) {
    lines.push('## Profile');
    lines.push('Name,Email,Tier,Timezone,Member Since');
    lines.push([
      escapeCSV(data.user.name),
      escapeCSV(data.user.email),
      escapeCSV(data.user.tier),
      escapeCSV(data.user.timezone),
      escapeCSV(data.user.memberSince),
    ].join(','));
    lines.push('');
  }

  // Routines section
  if (data.routines.length > 0) {
    lines.push('## Routines');
    lines.push('ID,Title,Description,Color,Tasks Count,Created At');
    data.routines.forEach(routine => {
      lines.push([
        escapeCSV(routine.id),
        escapeCSV(routine.title),
        escapeCSV(routine.description),
        escapeCSV(routine.color),
        routine.tasks.length,
        escapeCSV(routine.createdAt),
      ].join(','));
    });
    lines.push('');

    // Tasks sub-section
    lines.push('## Tasks');
    lines.push('Routine ID,Routine Title,Task ID,Task Label,Is Active');
    data.routines.forEach(routine => {
      routine.tasks.forEach(task => {
        lines.push([
          escapeCSV(routine.id),
          escapeCSV(routine.title),
          escapeCSV(task.id),
          escapeCSV(task.label),
          task.isActive ? 'Yes' : 'No',
        ].join(','));
      });
    });
    lines.push('');
  }

  // Check-ins section
  if (data.checkIns.length > 0) {
    lines.push('## Check-Ins');
    lines.push('ID,Routine ID,Task ID,Date,Note,Created At');
    data.checkIns.forEach(checkIn => {
      lines.push([
        escapeCSV(checkIn.id),
        escapeCSV(checkIn.routineId),
        escapeCSV(checkIn.taskId),
        escapeCSV(checkIn.date),
        escapeCSV(checkIn.note),
        escapeCSV(checkIn.createdAt),
      ].join(','));
    });
    lines.push('');
  }

  // Goals section
  if (data.goals.length > 0) {
    lines.push('## Goals');
    lines.push('ID,Title,Category,Timeframe,Target,Current,Progress %,Status,Due Date,Created At');
    data.goals.forEach(goal => {
      lines.push([
        escapeCSV(goal.id),
        escapeCSV(goal.title),
        escapeCSV(goal.category),
        escapeCSV(goal.timeframe),
        goal.targetValue,
        goal.currentValue,
        goal.progressPercentage,
        escapeCSV(goal.status),
        escapeCSV(goal.dueDate || ''),
        escapeCSV(goal.createdAt),
      ].join(','));
    });
  }

  return lines.join('\n');
}

/**
 * Escape a value for CSV
 * Wraps in quotes and escapes internal quotes
 */
function escapeCSV(value) {
  if (value === null || value === undefined) {
    return '';
  }
  const str = String(value);
  // If contains comma, newline, or quote, wrap in quotes
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
