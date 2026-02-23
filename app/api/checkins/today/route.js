import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import CheckIn from "@/models/CheckIn";
import Routine from "@/models/Routine";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/auth";
import { getGentleMessage } from "@/lib/reminderEngine";
import { getTodayInTimezone } from "@/lib/timezone";

// Demo data for testing without database
const DEMO_TODAY_DATA = {
  date: new Date().toISOString().split("T")[0],
  checkIns: [],
  totalTasks: 5,
  completedCount: 0,
  completionPercent: 0,
  weeklyData: [
    { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], completed: 3, total: 5 },
    { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], completed: 4, total: 5 },
    { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], completed: 5, total: 5 },
    { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], completed: 2, total: 5 },
    { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], completed: 4, total: 5 },
    { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], completed: 5, total: 5 },
    { date: new Date().toISOString().split("T")[0], completed: 0, total: 5 },
  ],
  reminderMessage: "Welcome to Neo Routine! Each small ripple creates waves of change.",
  isDemo: true,
};

/**
 * UTC helpers (prevents Monday->Tuesday shift)
 */
function parseISODateToUTC(dateISO) {
  const [y, m, d] = dateISO.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)); // UTC midnight
}

function formatUTCToISODate(d) {
  return d.toISOString().slice(0, 10);
}

function getMondayISO(dateISO) {
  const dt = parseISODateToUTC(dateISO);
  const day = dt.getUTCDay(); // 0=Sun..6=Sat
  const diffToMonday = (day + 6) % 7; // 0 for Mon, 6 for Sun
  dt.setUTCDate(dt.getUTCDate() - diffToMonday);
  return formatUTCToISODate(dt);
}

/**
 * GET /api/checkins/today
 * Get all check-ins for today (or specified date)
 * Query params: ?date=YYYY-MM-DD (optional, defaults to today)
 */
export async function GET(request) {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized", data: null }, { status: 401 });
    }

    // Demo mode - return sample data
    if (user.userId === "demo-user-123") {
      return NextResponse.json(DEMO_TODAY_DATA);
    }

    // Connect to database
    await connectDB();

    // Get user's timezone preference
    const dbUser = await User.findById(user.userId).select('preferences.timezone');
    const userTimezone = dbUser?.preferences?.timezone || 'UTC';

    // Get date from query params or use today in user's timezone
    const { searchParams } = new URL(request.url);
    const dateISO = searchParams.get("date") || getTodayInTimezone(userTimezone);

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateISO)) {
      return NextResponse.json(
        { message: "Invalid date format. Use YYYY-MM-DD", data: null },
        { status: 400 }
      );
    }

    // Get today's check-ins
    const checkIns = await CheckIn.find({
      userId: user.userId,
      dateISO,
    }).lean();

    // Get user's active routines to calculate progress
    const routines = await Routine.find({
      userId: user.userId,
      isArchived: false,
    }).lean();

    // Build a set of currently-valid active routine_task keys.
    // Prevent "ghost" check-ins from deleted/inactive tasks affecting progress.
    const activeTaskKeys = new Set();
    routines.forEach((routine) => {
      const rid = String(routine._id);
      (routine.tasks || [])
        .filter((t) => t && t.isActive !== false)
        .forEach((t) => {
          activeTaskKeys.add(`${rid}_${String(t._id)}`);
        });
    });

    const totalTasks = activeTaskKeys.size;

    // Filter out check-ins that no longer correspond to active tasks
    const validTodayCheckIns = checkIns.filter((c) =>
      activeTaskKeys.has(`${String(c.routineId)}_${String(c.taskId)}`)
    );

    // Unique routine_task combos for today's checks
    const todayUnique = new Set(
      validTodayCheckIns.map((c) => `${String(c.routineId)}_${String(c.taskId)}`)
    );

    const completedCount = todayUnique.size;
    const completionPercent =
      totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

    /**
     * Weekly: compute ISO week (Mon-Sun) using UTC-safe math
     */
    const weekStartISO = getMondayISO(dateISO);
    const weekStartUTC = parseISODateToUTC(weekStartISO);

    const weeklyCheckIns = await CheckIn.find({
      userId: user.userId,
      dateISO: { $gte: weekStartISO, $lte: dateISO },
    }).lean();

    // Filter ghost check-ins
    const validWeeklyCheckIns = weeklyCheckIns.filter((c) =>
      activeTaskKeys.has(`${String(c.routineId)}_${String(c.taskId)}`)
    );

    // Group by date, dedupe per routine_task
    const checkInsByDate = {};
    validWeeklyCheckIns.forEach((c) => {
      if (!checkInsByDate[c.dateISO]) checkInsByDate[c.dateISO] = new Set();
      checkInsByDate[c.dateISO].add(`${String(c.routineId)}_${String(c.taskId)}`);
    });

    // Build weekly data Monday -> Sunday (UTC), no timezone drift
    const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const weeklyData = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStartUTC);
      d.setUTCDate(weekStartUTC.getUTCDate() + i);
      const iso = formatUTCToISODate(d);

      const daySet = checkInsByDate[iso] || new Set();
      const count = daySet.size || 0;
      const percent = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;

      weeklyData.push({
        date: iso,
        day: weekdayLabels[i],
        count,
        percent: Math.max(0, Math.min(100, percent)),
        isToday: iso === dateISO,
      });
    }

    // Weekly percent: total unique completions across week / (totalTasks * 7)
    let weeklyTotalUnique = 0;
    Object.values(checkInsByDate).forEach((s) => {
      weeklyTotalUnique += (s && s.size) || 0;
    });

    const weeklyPossible = totalTasks * 7;
    const weeklyPercent =
      weeklyPossible > 0 ? Math.round((weeklyTotalUnique / weeklyPossible) * 100) : 0;

    const gentleMessage = getGentleMessage(completionPercent, weeklyPercent);

    return NextResponse.json(
      {
        message: "Check-ins retrieved successfully",
        data: {
          date: dateISO,
          checkIns: validTodayCheckIns.map((c) => ({
            id: String(c._id),
            routineId: String(c.routineId),
            taskId: String(c.taskId),
            note: c.note,
            createdAt: c.createdAt,
          })),
          checkedTaskIds: Array.from(todayUnique).map(String),
          stats: {
            today: {
              completed: completedCount,
              total: totalTasks,
              percent: Math.max(0, Math.min(100, completionPercent)),
            },
            weekly: {
              completed: weeklyTotalUnique,
              possible: weeklyPossible,
              percent: Math.max(0, Math.min(100, weeklyPercent)),
              data: weeklyData,
            },
          },
          microMessage: gentleMessage,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get today check-ins error:", error);
    return NextResponse.json(
      { message: "Failed to fetch check-ins", data: { error: error.message } },
      { status: 500 }
    );
  }
}
