#!/usr/bin/env node

/**
 * Seed Script — Template Marketplace
 * 
 * Populates the database with professionally crafted routine templates.
 * 
 * Usage:
 *   node scripts/seed-templates.js                   # uses first coach found
 *   node scripts/seed-templates.js coach@email.com   # uses specific coach
 * 
 * Requirements:
 *   - MONGO_URI in .env
 *   - At least one user with role 'coach' in the database
 */

import 'dotenv/config';
import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('[ERROR] MONGO_URI not found in environment. Create a .env file.');
  process.exit(1);
}

// ── Inline schemas (avoid Next.js import issues) ──────────────────────────

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
  coachProfile: { brandName: String },
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const TaskTemplateSchema = new mongoose.Schema({
  label: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, trim: true, maxlength: 300 },
  order: { type: Number, default: 0 },
});

const RoutineTemplateSchema = new mongoose.Schema(
  {
    coachId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 500 },
    tasks: { type: [TaskTemplateSchema], default: [] },
    category: { type: String, default: 'custom' },
    suggestedFrequency: { type: String, default: 'daily' },
    estimatedMinutes: { type: Number, default: 15 },
    difficulty: { type: String, default: 'beginner' },
    color: { type: String, default: 'blue' },
    tags: [{ type: String, trim: true, maxlength: 30 }],
    isPublic: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isPremium: { type: Boolean, default: false },
    stats: {
      adoptions: { type: Number, default: 0 },
      avgRating: { type: Number, default: 0 },
      ratingCount: { type: Number, default: 0 },
      views: { type: Number, default: 0 },
    },
    shareCode: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

RoutineTemplateSchema.pre('save', async function (next) {
  if (this.isNew && !this.shareCode) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.shareCode = code;
  }
  next();
});

const RoutineTemplate =
  mongoose.models.RoutineTemplate ||
  mongoose.model('RoutineTemplate', RoutineTemplateSchema);

// ── Seed Data ─────────────────────────────────────────────────────────────

const SEED_TEMPLATES = [
  // ─── MORNING (2) ───
  {
    title: 'Sunrise Energy Boost',
    description:
      'Start your day with intention and energy. This coach-designed routine combines hydration, movement, and mindset to help you feel unstoppable before 8 AM.',
    category: 'morning',
    difficulty: 'beginner',
    estimatedMinutes: 25,
    color: 'orange',
    tags: ['morning', 'energy', 'beginner-friendly'],
    isFeatured: true,
    tasks: [
      { label: 'Drink a full glass of water', description: 'Rehydrate after sleep — add lemon for extra freshness' },
      { label: '5-minute stretching', description: 'Gentle full-body stretch to wake your muscles' },
      { label: 'Write 3 things you\'re grateful for', description: 'Gratitude journaling sets a positive tone' },
      { label: 'Cold face wash', description: 'Splash cold water on your face to activate alertness' },
      { label: 'Set your top 3 priorities for the day', description: 'Identify what matters most today' },
    ],
  },
  {
    title: 'Mindful Morning Ritual',
    description:
      'A calm, intentional morning routine built around meditation, reading, and self-reflection. Perfect for those who want to start the day with clarity, not chaos.',
    category: 'morning',
    difficulty: 'intermediate',
    estimatedMinutes: 40,
    color: 'purple',
    tags: ['morning', 'meditation', 'journaling'],
    isPremium: true,
    tasks: [
      { label: '10-minute guided meditation', description: 'Use your favorite app or sit in silence' },
      { label: 'Journal for 5 minutes', description: 'Free-write your thoughts — no filter needed' },
      { label: 'Read for 15 minutes', description: 'Non-fiction or personal development books work best' },
      { label: 'Prepare a healthy breakfast', description: 'Something nourishing — avoid scrolling while eating' },
      { label: 'Review your calendar & intentions', description: 'Know what\'s ahead and set your mindset' },
      { label: 'Take 3 deep breaths before leaving', description: 'Ground yourself before stepping into the world' },
    ],
  },

  // ─── EVENING (2) ───
  {
    title: 'Wind-Down Evening Reset',
    description:
      'Disconnect from the day and prepare for deep, restorative sleep. This routine signals your body and mind that it\'s time to power down.',
    category: 'evening',
    difficulty: 'beginner',
    estimatedMinutes: 30,
    color: 'blue',
    tags: ['evening', 'sleep', 'relaxation'],
    isFeatured: true,
    tasks: [
      { label: 'Put phone on Do Not Disturb', description: 'Remove digital distractions 1 hour before bed' },
      { label: 'Light stretching or yoga', description: '5-10 minutes of gentle movement' },
      { label: 'Write a brain dump', description: 'Jot down anything on your mind to clear mental clutter' },
      { label: 'Prepare clothes for tomorrow', description: 'Reduce morning decision fatigue' },
      { label: 'Read for 15 minutes', description: 'Fiction or something calming — avoid work books' },
    ],
  },
  {
    title: 'Deep Recovery Night Routine',
    description:
      'An advanced evening protocol combining sleep hygiene, reflection, and body care. Designed for high-performers who take recovery as seriously as productivity.',
    category: 'evening',
    difficulty: 'advanced',
    estimatedMinutes: 50,
    color: 'purple',
    tags: ['evening', 'recovery', 'sleep-optimization'],
    isPremium: true,
    tasks: [
      { label: 'Review today\'s wins', description: 'Write 3 things that went well today' },
      { label: 'No screens 90 min before bed', description: 'Blue light disrupts melatonin — read or journal instead' },
      { label: 'Magnesium or sleeptime tea', description: 'Support natural sleep chemistry' },
      { label: 'Foam rolling or self-massage', description: '10 minutes to release tension from the day' },
      { label: 'Cold/lukewarm shower', description: 'Lower your core temperature for deeper sleep' },
      { label: 'Set room to 65-68°F / 18-20°C', description: 'Optimal temperature for sleep quality' },
      { label: 'Guided sleep meditation', description: 'Body scan or progressive relaxation' },
    ],
  },

  // ─── FITNESS (2) ───
  {
    title: 'Home Bodyweight Circuit',
    description:
      'No gym? No problem. This zero-equipment routine delivers a full-body workout you can do in your living room. Great for building consistency.',
    category: 'fitness',
    difficulty: 'intermediate',
    estimatedMinutes: 30,
    color: 'green',
    tags: ['fitness', 'bodyweight', 'home-workout'],
    isFeatured: true,
    tasks: [
      { label: 'Dynamic warm-up (5 min)', description: 'Jumping jacks, arm circles, high knees' },
      { label: '3 sets of push-ups', description: '10-15 reps. Modify on knees if needed' },
      { label: '3 sets of squats', description: '15-20 reps. Keep core tight, back straight' },
      { label: '3 sets of lunges', description: '10 per leg. Alternate legs each rep' },
      { label: 'Plank hold (3 rounds)', description: '30-60 seconds per round' },
      { label: 'Cool-down stretch (5 min)', description: 'Hamstring, quad, shoulder, chest stretches' },
    ],
  },
  {
    title: 'Runner\'s Daily Prep',
    description:
      'A pre/post-run routine covering warm-up, mobility, recovery, and tracking. Whether you\'re training for 5K or a marathon, consistency starts here.',
    category: 'fitness',
    difficulty: 'intermediate',
    estimatedMinutes: 20,
    color: 'green',
    tags: ['running', 'cardio', 'mobility'],
    isPremium: true,
    tasks: [
      { label: 'Dynamic leg swings (2 min)', description: 'Front-to-back and side-to-side swings' },
      { label: 'Ankle circles and calf raises', description: '15 reps each to prevent injury' },
      { label: 'Run (log distance & pace)', description: 'Follow your training plan — don\'t skip easy days' },
      { label: 'Post-run hamstring stretch', description: 'Hold each stretch 30 seconds' },
      { label: 'Foam roll IT band and quads', description: '2 minutes per leg' },
      { label: 'Hydrate and log your run', description: 'Track distance, time, and how you felt' },
    ],
  },

  // ─── PRODUCTIVITY (2) ───
  {
    title: 'Deep Work Power Block',
    description:
      'Structure your most important work into focused, distraction-free blocks. Based on Cal Newport\'s Deep Work principles, adapted into a daily habit.',
    category: 'productivity',
    difficulty: 'intermediate',
    estimatedMinutes: 35,
    color: 'blue',
    tags: ['productivity', 'focus', 'deep-work'],
    isFeatured: true,
    isPremium: true,
    tasks: [
      { label: 'Define your #1 deep work task', description: 'What single task will move the needle most today?' },
      { label: 'Close all unrelated tabs/apps', description: 'Eliminate digital distractions before starting' },
      { label: 'Set a 25-min Pomodoro timer', description: 'Full focus for 25 minutes, then 5-min break' },
      { label: 'Complete Pomodoro #2', description: 'Another 25-min block on the same task' },
      { label: 'Take a 10-min movement break', description: 'Walk, stretch, or get fresh air' },
      { label: 'Review what you accomplished', description: 'Log progress and decide: continue or switch tasks?' },
    ],
  },
  {
    title: 'Weekly Planning Session',
    description:
      'Spend 30 minutes every Sunday evening mapping out your week. This planning ritual keeps you proactive, not reactive.',
    category: 'productivity',
    difficulty: 'beginner',
    estimatedMinutes: 30,
    color: 'blue',
    suggestedFrequency: 'weekends',
    tags: ['planning', 'weekly-review', 'organization'],
    isPremium: true,
    tasks: [
      { label: 'Review last week\'s goals', description: 'What did you accomplish? What fell through?' },
      { label: 'Brain dump all upcoming tasks', description: 'Get everything out of your head onto paper' },
      { label: 'Set 3 key goals for the week', description: 'Focus on outcomes, not just activities' },
      { label: 'Block focus time on your calendar', description: 'Protect at least 2 hours of deep work daily' },
      { label: 'Prepare your workspace', description: 'Clean desk, charge devices, organized materials' },
    ],
  },

  // ─── MINDFULNESS (2) ───
  {
    title: 'Daily Calm & Breathwork',
    description:
      'A simple breathing and mindfulness practice for reducing anxiety, improving focus, and finding inner calm. Takes just 15 minutes.',
    category: 'mindfulness',
    difficulty: 'beginner',
    estimatedMinutes: 15,
    color: 'purple',
    tags: ['breathing', 'calm', 'anxiety-relief'],
    isFeatured: true,
    tasks: [
      { label: 'Find a quiet spot', description: 'Sit comfortably — floor, chair, or cushion' },
      { label: 'Box breathing (4 rounds)', description: '4 sec inhale, 4 sec hold, 4 sec exhale, 4 sec hold' },
      { label: '5-minute body scan', description: 'Notice tension from head to toes, then release it' },
      { label: 'Set an intention for the day', description: 'One word or phrase that guides your mindset' },
    ],
  },
  {
    title: 'Evening Gratitude & Reflection',
    description:
      'End your day by focusing on what went right. This gratitude practice rewires your brain for positivity and improves sleep quality.',
    category: 'mindfulness',
    difficulty: 'beginner',
    estimatedMinutes: 10,
    color: 'pink',
    tags: ['gratitude', 'reflection', 'journaling'],
    isPremium: true,
    tasks: [
      { label: 'Write 3 things you\'re grateful for', description: 'Big or small — be specific about why' },
      { label: 'Name one person you appreciate', description: 'Consider texting them a quick thank-you' },
      { label: 'Release one worry', description: 'Write it down, then consciously let it go for tonight' },
      { label: 'One thing you\'d do differently', description: 'Growth mindset — no judgment, just learning' },
    ],
  },

  // ─── HEALTH (2) ───
  {
    title: 'Hydration & Nutrition Tracker',
    description:
      'Stay on top of your daily water intake and nutrition with this simple checklist. Small habits compound into major health results.',
    category: 'health',
    difficulty: 'beginner',
    estimatedMinutes: 5,
    color: 'blue',
    tags: ['hydration', 'nutrition', 'daily-habits'],
    tasks: [
      { label: 'Morning glass of water', description: 'First thing after waking — before coffee' },
      { label: 'Eat a fruit or vegetable with breakfast', description: 'Add color to your first meal' },
      { label: 'Midday hydration check', description: 'Have you had at least 4 glasses of water by now?' },
      { label: 'Take vitamins/supplements', description: 'If prescribed — consistency is key' },
      { label: 'Evening water check (8 glasses goal)', description: 'Track your total intake for the day' },
    ],
  },
  {
    title: 'Posture & Desk Ergonomics',
    description:
      'Combat the damage of sitting all day. This routine includes posture checks, micro-movements, and ergonomic adjustments for desk workers.',
    category: 'health',
    difficulty: 'beginner',
    estimatedMinutes: 10,
    color: 'green',
    tags: ['posture', 'ergonomics', 'desk-workers'],
    isPremium: true,
    tasks: [
      { label: 'Morning posture check', description: 'Shoulders back, screen at eye level, feet flat' },
      { label: 'Set hourly stand-up reminder', description: 'Stand and walk for 2 minutes every hour' },
      { label: 'Neck rolls and shoulder shrugs', description: '10 reps each — release tension' },
      { label: 'Wrist and forearm stretches', description: 'Prevent carpal tunnel — extend arms and flex wrists' },
      { label: 'End-of-day spinal twist', description: 'Seated twist left and right, hold 15 seconds each' },
    ],
  },

  // ─── LEARNING (2) ───
  {
    title: 'Daily Learning Sprint',
    description:
      'Dedicate 20 minutes to learning something new every day. Whether it\'s a language, skill, or topic — consistency beats intensity.',
    category: 'learning',
    difficulty: 'beginner',
    estimatedMinutes: 20,
    color: 'blue',
    tags: ['learning', 'self-improvement', 'daily-habit'],
    isPremium: true,
    tasks: [
      { label: 'Choose today\'s topic or skill', description: 'Pick one specific thing to learn about' },
      { label: '10-min focused study session', description: 'Read, watch, or practice — no multitasking' },
      { label: 'Write a 3-sentence summary', description: 'Teach it to yourself in your own words' },
      { label: 'Note one practical application', description: 'How can you use this today or this week?' },
    ],
  },
  {
    title: 'Language Learning Routine',
    description:
      'A structured daily plan for language learning combining vocabulary, listening, speaking, and review. Designed for committed learners.',
    category: 'learning',
    difficulty: 'intermediate',
    estimatedMinutes: 30,
    color: 'purple',
    tags: ['language', 'vocabulary', 'structured-learning'],
    isPremium: true,
    tasks: [
      { label: 'Review 10 flashcards (Anki/Quizlet)', description: 'Spaced repetition is the most effective way to retain vocab' },
      { label: 'Listen to 5-min podcast in target language', description: 'Passive vs. active — try both' },
      { label: 'Practice speaking for 5 minutes', description: 'Shadowing, self-talk, or conversation with a partner' },
      { label: 'Write 3 sentences using new words', description: 'Apply vocabulary in context' },
      { label: 'Grammar exercise (5 min)', description: 'One concept per day — don\'t overload' },
      { label: 'Log what you learned today', description: 'Track vocab count and confidence level' },
    ],
  },

  // ─── CREATIVITY (2) ───
  {
    title: 'Creative Warm-Up',
    description:
      'Kickstart your creative flow before diving into projects. This routine loosens your mind through freewriting, sketching, and playful prompts.',
    category: 'creativity',
    difficulty: 'beginner',
    estimatedMinutes: 15,
    color: 'pink',
    tags: ['creativity', 'warm-up', 'freewriting'],
    isPremium: true,
    tasks: [
      { label: 'Freewrite for 5 minutes', description: 'Write anything — no editing, no stopping' },
      { label: 'Doodle or sketch for 3 minutes', description: 'Draw shapes, patterns, or random objects' },
      { label: 'Look at 3 inspiring images/works', description: 'Pinterest, art books, or nature photos' },
      { label: 'Write down 5 random "what if" ideas', description: '"What if cars could fly?" — let your mind play' },
    ],
  },
  {
    title: 'Content Creator\'s Daily Flow',
    description:
      'For writers, designers, and digital creators — a daily routine that structures ideation, creation, and publishing into manageable blocks.',
    category: 'creativity',
    difficulty: 'advanced',
    estimatedMinutes: 60,
    color: 'orange',
    tags: ['content-creation', 'writing', 'design'],
    isPremium: true,
    tasks: [
      { label: 'Review content calendar', description: 'Check what\'s due this week and today\'s focus' },
      { label: 'Brainstorm 3 content ideas', description: 'Topics, angles, or hooks — quantity over quality' },
      { label: 'Draft or create for 30 minutes', description: 'Write, design, record — just produce' },
      { label: 'Edit and refine', description: '15 minutes of polishing your draft' },
      { label: 'Schedule or publish', description: 'Ship it — done is better than perfect' },
      { label: 'Engage with your audience (5 min)', description: 'Reply to comments, DMs, or community posts' },
    ],
  },

  // ─── SOCIAL (2) ───
  {
    title: 'Daily Connection Habit',
    description:
      'Strengthen your relationships one small action at a time. Reach out, listen, and show up for the people who matter.',
    category: 'social',
    difficulty: 'beginner',
    estimatedMinutes: 10,
    color: 'pink',
    tags: ['social', 'relationships', 'connection'],
    isPremium: true,
    tasks: [
      { label: 'Reach out to one person', description: 'Text, call, or voice message someone you care about' },
      { label: 'Give a genuine compliment', description: 'In person or online — make someone\'s day' },
      { label: 'Practice active listening', description: 'In your next conversation, listen without planning your reply' },
      { label: 'Log your social energy level', description: 'Rate 1-5 — are you recharged or drained?' },
    ],
  },
  {
    title: 'Networking & Professional Growth',
    description:
      'Build your professional network deliberately. This weekly routine helps introverts and extroverts alike grow meaningful career connections.',
    category: 'social',
    difficulty: 'intermediate',
    estimatedMinutes: 20,
    color: 'blue',
    suggestedFrequency: 'weekdays',
    tags: ['networking', 'career', 'professional'],
    isPremium: true,
    tasks: [
      { label: 'Comment meaningfully on a LinkedIn post', description: 'Add value — not just "Great post!"' },
      { label: 'Send one connection request with a note', description: 'Personalize it — mention something specific' },
      { label: 'Share an insight or article', description: 'Position yourself as thoughtful in your field' },
      { label: 'Follow up with a recent contact', description: 'Check in on someone you connected with recently' },
      { label: 'Update one section of your profile', description: 'Keep your online presence fresh and current' },
    ],
  },
];

// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🌱 NeoRoutine — Template Marketplace Seeder\n');

  await mongoose.connect(MONGO_URI, { bufferCommands: false });
  console.log('[DB] Connected to MongoDB');

  // Find coach user
  const coachEmail = process.argv[2]; // optional CLI arg
  let coach;

  if (coachEmail) {
    coach = await User.findOne({ email: coachEmail });
    if (!coach) {
      console.error(`[ERROR] No user found with email: ${coachEmail}`);
      process.exit(1);
    }
    if (coach.role !== 'coach' && coach.role !== 'admin') {
      console.log(`[PROMOTE] Setting ${coach.email} role to "coach"...`);
      coach.role = 'coach';
      await coach.save();
    }
  } else {
    // Try to find existing coach/admin first
    coach = await User.findOne({ role: { $in: ['coach', 'admin'] } });
    if (!coach) {
      // No coach exists — promote the first user
      coach = await User.findOne({});
      if (!coach) {
        console.error('[ERROR] No users found in the database. Register an account first.');
        process.exit(1);
      }
      console.log(`[PROMOTE] No coach found. Promoting "${coach.name}" (${coach.email}) to coach role...`);
      coach.role = 'coach';
      await coach.save();
    }
  }

  console.log(`[COACH] Using: ${coach.name} (${coach.email}) — role: ${coach.role}`);

  // Check for existing seeded templates to avoid duplicates
  const existingTitles = await RoutineTemplate.find({ coachId: coach._id })
    .select('title')
    .lean();
  const existingSet = new Set(existingTitles.map((t) => t.title));

  let inserted = 0;
  let skipped = 0;

  for (const tpl of SEED_TEMPLATES) {
    if (existingSet.has(tpl.title)) {
      console.log(`  [SKIP] "${tpl.title}" — already exists`);
      skipped++;
      continue;
    }

    const template = new RoutineTemplate({
      coachId: coach._id,
      title: tpl.title,
      description: tpl.description,
      category: tpl.category,
      difficulty: tpl.difficulty || 'beginner',
      estimatedMinutes: tpl.estimatedMinutes || 15,
      color: tpl.color || 'blue',
      suggestedFrequency: tpl.suggestedFrequency || 'daily',
      tags: tpl.tags || [],
      isPublic: true,
      isPublished: true,
      isFeatured: tpl.isFeatured || false,
      isPremium: tpl.isPremium || false,
      tasks: tpl.tasks.map((task, i) => ({
        label: task.label,
        description: task.description || '',
        order: i,
      })),
    });

    await template.save();
    const badge = tpl.isPremium ? '💎 PRO' : tpl.isFeatured ? '⭐ Featured' : '   ';
    console.log(`  [ADD]  "${tpl.title}" (${tpl.category}) ${badge}`);
    inserted++;
  }

  console.log(`\n✅ Done! ${inserted} templates added, ${skipped} skipped (duplicates).`);
  console.log(`   Total templates in marketplace: ${await RoutineTemplate.countDocuments({ isPublic: true, isPublished: true })}`);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
