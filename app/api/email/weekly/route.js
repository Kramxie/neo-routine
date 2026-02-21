import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import connectDB from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import User from '@/models/User';
import Routine from '@/models/Routine';
import CheckIn from '@/models/CheckIn';
import Goal from '@/models/Goal';
import Badge from '@/models/Badge';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * Weekly Progress Report Email API
 * Generates and sends beautiful weekly progress reports
 */

// Helper functions
function getDateISO(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function getWeekRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 6);
  
  return {
    startISO: getDateISO(start),
    endISO: getDateISO(end),
    startDate: start,
    endDate: end,
  };
}

// Create email transporter
const createTransporter = () => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    return null;
  }
  
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
    family: 4,
    tls: { rejectUnauthorized: false },
  });
};

// Get weekly stats for a user
async function getWeeklyStats(userId) {
  const { startISO, endISO, startDate, endDate } = getWeekRange();
  
  // Get routines
  const routines = await Routine.find({ userId, isArchived: false }).lean();
  
  // Get check-ins for the week
  const checkIns = await CheckIn.find({
    userId,
    dateISO: { $gte: startISO, $lte: endISO },
  }).lean();

  // Get goals
  const goals = await Goal.find({ userId, status: { $in: ['active', 'completed'] } }).lean();

  // Get badges earned this week
  const badges = await Badge.find({
    userId,
    earnedAt: { $gte: startDate, $lte: endDate },
  }).lean();

  // Calculate daily completion
  const dailyData = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateISO = getDateISO(date);
    const dayCheckIns = checkIns.filter(c => c.dateISO === dateISO).length;
    
    dailyData.push({
      date: dateISO,
      day: dayNames[date.getDay()],
      checkIns: dayCheckIns,
    });
  }

  // Calculate totals
  const totalCheckIns = checkIns.length;
  const totalTasks = routines.reduce(
    (sum, r) => sum + (r.tasks?.filter(t => t.isActive !== false).length || 0),
    0
  ) * 7;
  const completionRate = totalTasks > 0 ? Math.round((totalCheckIns / totalTasks) * 100) : 0;

  // Days with activity
  const activeDays = new Set(checkIns.map(c => c.dateISO)).size;

  // Routine performance
  const routineStats = routines.map(routine => {
    const routineCheckIns = checkIns.filter(
      c => String(c.routineId) === String(routine._id)
    ).length;
    const routineTasks = routine.tasks?.filter(t => t.isActive !== false).length || 0;
    const possible = routineTasks * 7;
    const rate = possible > 0 ? Math.round((routineCheckIns / possible) * 100) : 0;
    
    return {
      name: routine.title,
      completed: routineCheckIns,
      possible,
      rate,
    };
  }).sort((a, b) => b.rate - a.rate);

  // Goals progress
  const goalsProgress = goals.map(goal => ({
    title: goal.title,
    progress: goal.targetValue > 0 
      ? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100))
      : 0,
    status: goal.status,
  }));

  // Best day
  const bestDay = dailyData.reduce((best, day) => 
    day.checkIns > best.checkIns ? day : best
  , dailyData[0]);

  return {
    period: {
      start: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      end: endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    },
    summary: {
      totalCheckIns,
      completionRate,
      activeDays,
      routineCount: routines.length,
    },
    dailyData,
    routineStats,
    goalsProgress,
    badges,
    bestDay,
  };
}

// Generate weekly email HTML
function generateWeeklyEmailHTML(userName, stats) {
  const { period, summary, dailyData, routineStats, goalsProgress, badges, bestDay } = stats;
  
  // Calculate emoji for completion rate
  let emoji = '🌱';
  if (summary.completionRate >= 80) emoji = '🔥';
  else if (summary.completionRate >= 60) emoji = '⚡';
  else if (summary.completionRate >= 40) emoji = '💧';

  // Generate daily bars
  const maxCheckIns = Math.max(...dailyData.map(d => d.checkIns), 1);
  const dailyBars = dailyData.map(day => {
    const height = Math.max(10, Math.round((day.checkIns / maxCheckIns) * 60));
    const color = day.checkIns > 0 ? '#0ea5e9' : '#e2e8f0';
    return `
      <td style="vertical-align: bottom; padding: 0 4px; text-align: center;">
        <div style="width: 24px; height: ${height}px; background: ${color}; border-radius: 4px 4px 0 0; margin: 0 auto;"></div>
        <div style="font-size: 11px; color: #64748b; margin-top: 4px;">${day.day}</div>
        <div style="font-size: 10px; color: #94a3b8;">${day.checkIns}</div>
      </td>
    `;
  }).join('');

  // Generate routine stats rows
  const routineRows = routineStats.slice(0, 5).map(routine => `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
        <div style="font-weight: 600; color: #1e293b;">${routine.name}</div>
        <div style="color: #64748b; font-size: 12px;">${routine.completed}/${routine.possible} tasks</div>
      </td>
      <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; text-align: right;">
        <span style="display: inline-block; padding: 4px 12px; background: ${routine.rate >= 70 ? '#dcfce7' : routine.rate >= 40 ? '#fef3c7' : '#fee2e2'}; color: ${routine.rate >= 70 ? '#16a34a' : routine.rate >= 40 ? '#d97706' : '#dc2626'}; border-radius: 20px; font-weight: 600; font-size: 13px;">${routine.rate}%</span>
      </td>
    </tr>
  `).join('');

  // Generate goals rows
  const goalRows = goalsProgress.slice(0, 3).map(goal => `
    <tr>
      <td style="padding: 8px 0;">
        <div style="display: flex; align-items: center; gap: 8px;">
          ${goal.status === 'completed' ? '✅' : '🎯'}
          <span style="color: #1e293b;">${goal.title}</span>
        </div>
      </td>
      <td style="padding: 8px 0; text-align: right; color: #64748b; font-size: 13px;">
        ${goal.progress}%
      </td>
    </tr>
  `).join('');

  // Badge icons
  const badgeIcons = badges.slice(0, 3).map(b => {
    // Map badge IDs to emojis (simplified)
    const badgeEmojis = {
      streak_7: '🔥', streak_14: '⚡', streak_30: '🏆', streak_100: '👑',
      perfect_day: '✨', perfect_week: '🌊', first_checkin: '💧',
    };
    return badgeEmojis[b.badgeId] || '🏅';
  }).join(' ');

  // Generate motivational message
  let motivationalMessage = "Every drop counts. Keep flowing!";
  if (summary.completionRate >= 80) {
    motivationalMessage = "Outstanding week! You're on fire! 🔥";
  } else if (summary.completionRate >= 60) {
    motivationalMessage = "Great progress! Keep the momentum going! ⚡";
  } else if (summary.completionRate >= 40) {
    motivationalMessage = "You're building something great. Stay consistent! 💪";
  } else if (summary.activeDays > 0) {
    motivationalMessage = "Every step forward matters. You've got this! 🌱";
  }

  const currentYear = new Date().getFullYear();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Weekly Progress - Neo Routine</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f0f9ff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; -webkit-font-smoothing: antialiased;">
  
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f0f9ff;">
    <tr>
      <td style="padding: 40px 20px;">
        
        <!-- Main Card -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(14, 165, 233, 0.12); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); padding: 32px; text-align: center;">
              <div style="font-size: 40px; margin-bottom: 12px;">${emoji}</div>
              <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0;">
                Weekly Progress Report
              </h1>
              <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 8px 0 0 0;">
                ${period.start} - ${period.end}
              </p>
            </td>
          </tr>
          
          <!-- Greeting -->
          <tr>
            <td style="padding: 32px 32px 16px 32px;">
              <h2 style="color: #1e293b; font-size: 20px; margin: 0 0 8px 0;">
                Hi ${userName}! 👋
              </h2>
              <p style="color: #64748b; font-size: 15px; line-height: 1.6; margin: 0;">
                Here's how your week went. ${motivationalMessage}
              </p>
            </td>
          </tr>
          
          <!-- Stats Grid -->
          <tr>
            <td style="padding: 0 32px 32px 32px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="width: 33%; text-align: center; padding: 16px; background: #f8fafc; border-radius: 12px 0 0 12px;">
                    <div style="font-size: 28px; font-weight: 700; color: #0ea5e9;">${summary.totalCheckIns}</div>
                    <div style="font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Tasks Done</div>
                  </td>
                  <td style="width: 33%; text-align: center; padding: 16px; background: #f8fafc;">
                    <div style="font-size: 28px; font-weight: 700; color: #0ea5e9;">${summary.completionRate}%</div>
                    <div style="font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Completion</div>
                  </td>
                  <td style="width: 33%; text-align: center; padding: 16px; background: #f8fafc; border-radius: 0 12px 12px 0;">
                    <div style="font-size: 28px; font-weight: 700; color: #0ea5e9;">${summary.activeDays}/7</div>
                    <div style="font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Active Days</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Daily Chart -->
          <tr>
            <td style="padding: 0 32px 32px 32px;">
              <h3 style="color: #1e293b; font-size: 16px; margin: 0 0 16px 0;">Daily Activity</h3>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  ${dailyBars}
                </tr>
              </table>
              ${bestDay.checkIns > 0 ? `
                <p style="color: #64748b; font-size: 13px; margin: 16px 0 0 0; text-align: center;">
                  🌟 Best day: <strong>${bestDay.day}</strong> with ${bestDay.checkIns} tasks
                </p>
              ` : ''}
            </td>
          </tr>
          
          ${routineStats.length > 0 ? `
          <!-- Routine Performance -->
          <tr>
            <td style="padding: 0 32px 32px 32px;">
              <h3 style="color: #1e293b; font-size: 16px; margin: 0 0 16px 0;">Routine Performance</h3>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                ${routineRows}
              </table>
            </td>
          </tr>
          ` : ''}
          
          ${goalsProgress.length > 0 ? `
          <!-- Goals Progress -->
          <tr>
            <td style="padding: 0 32px 32px 32px;">
              <h3 style="color: #1e293b; font-size: 16px; margin: 0 0 16px 0;">Goals Progress</h3>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                ${goalRows}
              </table>
            </td>
          </tr>
          ` : ''}
          
          ${badges.length > 0 ? `
          <!-- Badges Earned -->
          <tr>
            <td style="padding: 0 32px 32px 32px;">
              <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 16px; text-align: center;">
                <div style="font-size: 32px; margin-bottom: 8px;">${badgeIcons}</div>
                <div style="font-weight: 600; color: #92400e;">
                  ${badges.length} New Badge${badges.length > 1 ? 's' : ''} Earned!
                </div>
              </div>
            </td>
          </tr>
          ` : ''}
          
          <!-- CTA -->
          <tr>
            <td style="padding: 0 32px 32px 32px; text-align: center;">
              <a href="${APP_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 14px rgba(14, 165, 233, 0.4);">
                View Full Dashboard
              </a>
            </td>
          </tr>
          
          <!-- Motivation -->
          <tr>
            <td style="padding: 0 32px 32px 32px;">
              <div style="background: #f8fafc; border-radius: 12px; padding: 20px; text-align: center;">
                <div style="font-size: 24px; margin-bottom: 8px;">💧</div>
                <p style="color: #64748b; font-size: 14px; font-style: italic; margin: 0;">
                  "Small drops fill the ocean. Keep showing up, and watch your progress compound."
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: #f8fafc; padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0 0 8px 0;">
                Sent with 💙 by <strong style="color: #64748b;">Neo Routine</strong>
              </p>
              <p style="color: #cbd5e1; font-size: 11px; margin: 0;">
                You're receiving this because you opted in to weekly summaries.
                <a href="${APP_URL}/dashboard/settings" style="color: #94a3b8;">Manage preferences</a>
              </p>
              <p style="color: #cbd5e1; font-size: 11px; margin: 12px 0 0 0;">
                © ${currentYear} Neo Routine. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
        
      </td>
    </tr>
  </table>
  
</body>
</html>
  `.trim();
}

/**
 * GET /api/email/weekly - Preview weekly email for current user
 */
export async function GET() {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const user = await User.findById(authUser.userId).select('name email preferences');
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const stats = await getWeeklyStats(authUser.userId);
    const html = generateWeeklyEmailHTML(user.name?.split(' ')[0] || 'there', stats);

    // Return HTML preview
    return new Response(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error('[Weekly Email] Preview error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate preview' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/email/weekly - Send weekly email to user (or all users for cron)
 * Body: { userId?: string, sendToAll?: boolean }
 */
export async function POST(request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await request.json().catch(() => ({}));
    
    // For now, just send to the current user
    const userId = body.userId || authUser.userId;
    
    const user = await User.findById(userId).select('name email preferences');
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user wants weekly digest
    if (user.preferences?.weeklyDigest === false) {
      return NextResponse.json({
        success: true,
        data: { sent: false, reason: 'Weekly digest disabled' },
      });
    }

    const transporter = createTransporter();
    if (!transporter) {
      // Log to console in development
      const stats = await getWeeklyStats(userId);
      console.log('\n[Weekly Email] Would send to:', user.email);
      console.log('[Weekly Email] Stats:', JSON.stringify(stats.summary, null, 2));
      
      return NextResponse.json({
        success: true,
        data: { sent: false, reason: 'Email not configured (logged to console)' },
      });
    }

    const stats = await getWeeklyStats(userId);
    const html = generateWeeklyEmailHTML(user.name?.split(' ')[0] || 'there', stats);

    const mailOptions = {
      from: `"Neo Routine" <${process.env.GMAIL_USER}>`,
      to: user.email,
      subject: `📊 Your Weekly Progress - ${stats.summary.completionRate}% Completion`,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log('[Weekly Email] Sent to:', user.email);

    return NextResponse.json({
      success: true,
      data: { sent: true, to: user.email },
    });
  } catch (error) {
    console.error('[Weekly Email] Send error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
