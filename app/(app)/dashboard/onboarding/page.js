'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card, { CardContent } from '@/components/ui/Card';

/**
 * Onboarding Page
 * Multi-step wizard to guide new users through setup
 */

const ROUTINE_TEMPLATES = [
  {
    id: 'morning',
    name: 'Morning Routine',
    icon: '&#9728;', // sun
    description: 'Start your day right',
    tasks: [
      { name: 'Wake up early', duration: 5 },
      { name: 'Drink water', duration: 2 },
      { name: 'Stretch or exercise', duration: 15 },
      { name: 'Healthy breakfast', duration: 20 },
      { name: 'Plan your day', duration: 10 },
    ],
  },
  {
    id: 'fitness',
    name: 'Fitness Routine',
    icon: '&#128170;', // flexed bicep
    description: 'Stay active and healthy',
    tasks: [
      { name: 'Warm up', duration: 5 },
      { name: 'Cardio workout', duration: 20 },
      { name: 'Strength training', duration: 20 },
      { name: 'Cool down', duration: 5 },
      { name: 'Hydrate', duration: 2 },
    ],
  },
  {
    id: 'evening',
    name: 'Evening Wind-down',
    icon: '&#127769;', // moon
    description: 'Relax and recharge',
    tasks: [
      { name: 'Review the day', duration: 10 },
      { name: 'Prepare for tomorrow', duration: 10 },
      { name: 'Screen-free time', duration: 30 },
      { name: 'Read or meditate', duration: 15 },
      { name: 'Skincare routine', duration: 10 },
    ],
  },
  {
    id: 'productivity',
    name: 'Focus Session',
    icon: '&#127919;', // target
    description: 'Deep work routine',
    tasks: [
      { name: 'Clear workspace', duration: 5 },
      { name: 'Set goals', duration: 5 },
      { name: 'Focus block 1', duration: 25 },
      { name: 'Short break', duration: 5 },
      { name: 'Focus block 2', duration: 25 },
    ],
  },
  {
    id: 'custom',
    name: 'Create Your Own',
    icon: '&#10024;', // sparkles
    description: 'Build from scratch',
    tasks: [],
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [routineName, setRoutineName] = useState('');
  const [tasks, setTasks] = useState([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const totalSteps = 4;

  // Step 1: Welcome
  const renderWelcome = () => (
    <div className="text-center">
      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-neo-400 to-neo-600 flex items-center justify-center">
        <span className="text-4xl" dangerouslySetInnerHTML={{ __html: '&#128167;' }} />
      </div>
      <h1 className="text-3xl font-bold text-calm-800 dark:text-white mb-3">
        Welcome to Neo Routine
      </h1>
      <p className="text-lg text-calm-600 dark:text-calm-300 mb-8 max-w-md mx-auto">
        Build better habits with gentle, mindful routines. Let&apos;s set you up for success in just a few steps.
      </p>
      <div className="flex flex-col gap-3 max-w-xs mx-auto">
        <Button onClick={function() { setStep(2); }} size="lg">
          Get Started
        </Button>
        <button
          onClick={handleSkip}
          className="text-calm-500 hover:text-calm-700 dark:text-calm-400 dark:hover:text-calm-200 text-sm"
        >
          Skip for now
        </button>
      </div>
    </div>
  );

  // Step 2: Choose a template
  const renderTemplateSelection = () => (
    <div>
      <h2 className="text-2xl font-bold text-calm-800 dark:text-white mb-2 text-center">
        Choose Your First Routine
      </h2>
      <p className="text-calm-600 dark:text-calm-300 mb-6 text-center">
        Pick a template to start with, or create your own
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {ROUTINE_TEMPLATES.map(function(template) {
          const isSelected = selectedTemplate?.id === template.id;
          return (
            <button
              key={template.id}
              onClick={function() {
                setSelectedTemplate(template);
                setRoutineName(template.id === 'custom' ? '' : template.name);
                setTasks(template.tasks.map(function(t, i) {
                  return { id: i + 1, ...t };
                }));
              }}
              className={
                'p-4 rounded-xl border-2 text-left transition-all ' +
                (isSelected
                  ? 'border-neo-500 bg-neo-50 dark:bg-neo-900/30'
                  : 'border-calm-200 dark:border-calm-700 hover:border-neo-300 dark:hover:border-neo-600 bg-white dark:bg-calm-800')
              }
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl" dangerouslySetInnerHTML={{ __html: template.icon }} />
                <span className="font-semibold text-calm-800 dark:text-white">{template.name}</span>
              </div>
              <p className="text-sm text-calm-500 dark:text-calm-400">{template.description}</p>
            </button>
          );
        })}
      </div>
      <div className="flex justify-between mt-8 max-w-2xl mx-auto">
        <Button variant="secondary" onClick={function() { setStep(1); }}>
          Back
        </Button>
        <Button onClick={function() { setStep(3); }} disabled={!selectedTemplate}>
          Continue
        </Button>
      </div>
    </div>
  );

  // Step 3: Customize routine
  const renderCustomize = () => {
    const addTask = () => {
      const newId = tasks.length > 0 ? Math.max(...tasks.map(function(t) { return t.id; })) + 1 : 1;
      setTasks([...tasks, { id: newId, name: '', duration: 5 }]);
    };

    const updateTask = (id, field, value) => {
      setTasks(tasks.map(function(t) {
        return t.id === id ? { ...t, [field]: value } : t;
      }));
    };

    const removeTask = (id) => {
      setTasks(tasks.filter(function(t) { return t.id !== id; }));
    };

    return (
      <div>
        <h2 className="text-2xl font-bold text-calm-800 dark:text-white mb-2 text-center">
          Customize Your Routine
        </h2>
        <p className="text-calm-600 dark:text-calm-300 mb-6 text-center">
          Add, remove, or edit tasks to make it yours
        </p>
        <div className="max-w-lg mx-auto space-y-4">
          <Input
            label="Routine Name"
            value={routineName}
            onChange={function(e) { setRoutineName(e.target.value); }}
            placeholder="e.g., Morning Routine"
          />
          <div>
            <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
              Tasks
            </label>
            <div className="space-y-2">
              {tasks.map(function(task, index) {
                return (
                  <div key={task.id} className="flex gap-2 items-center">
                    <span className="text-calm-400 text-sm w-6">{index + 1}.</span>
                    <input
                      type="text"
                      value={task.name}
                      onChange={function(e) { updateTask(task.id, 'name', e.target.value); }}
                      placeholder="Task name"
                      className="flex-1 px-3 py-2 rounded-lg border border-calm-200 dark:border-calm-600 bg-white dark:bg-calm-800 text-calm-800 dark:text-white focus:outline-none focus:border-neo-400"
                    />
                    <input
                      type="number"
                      value={task.duration}
                      onChange={function(e) { updateTask(task.id, 'duration', parseInt(e.target.value) || 0); }}
                      className="w-16 px-2 py-2 rounded-lg border border-calm-200 dark:border-calm-600 bg-white dark:bg-calm-800 text-calm-800 dark:text-white focus:outline-none focus:border-neo-400 text-center"
                      min="1"
                    />
                    <span className="text-calm-500 dark:text-calm-400 text-sm">min</span>
                    <button
                      onClick={function() { removeTask(task.id); }}
                      className="p-1 text-calm-400 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
            <button
              onClick={addTask}
              className="mt-3 text-neo-600 dark:text-neo-400 hover:text-neo-700 dark:hover:text-neo-300 text-sm font-medium flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Task
            </button>
          </div>
        </div>
        <div className="flex justify-between mt-8 max-w-lg mx-auto">
          <Button variant="secondary" onClick={function() { setStep(2); }}>
            Back
          </Button>
          <Button
            onClick={function() { setStep(4); }}
            disabled={!routineName.trim() || tasks.length === 0 || tasks.some(function(t) { return !t.name.trim(); })}
          >
            Continue
          </Button>
        </div>
      </div>
    );
  };

  // Step 4: Notifications & Complete
  const renderComplete = () => {
    const handleEnableNotifications = async () => {
      if ('Notification' in window && navigator.serviceWorker) {
        try {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            setNotificationsEnabled(true);
            // Register push subscription
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
            });
            await fetch('/api/notifications/subscribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(subscription.toJSON()),
            });
          }
        } catch (err) {
          console.error('Push notification error:', err);
        }
      }
    };

    return (
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-calm-800 dark:text-white mb-2">
          You&apos;re All Set!
        </h2>
        <p className="text-calm-600 dark:text-calm-300 mb-6 max-w-md mx-auto">
          Your routine &quot;{routineName}&quot; is ready. Enable notifications to get gentle reminders.
        </p>

        {!notificationsEnabled && 'Notification' in window && (
          <Card className="max-w-sm mx-auto mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neo-100 dark:bg-neo-900/30 flex items-center justify-center">
                  <svg className="w-5 h-5 text-neo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-calm-800 dark:text-white text-sm">Enable Notifications</p>
                  <p className="text-xs text-calm-500 dark:text-calm-400">Get reminded at the right time</p>
                </div>
                <Button size="sm" onClick={handleEnableNotifications}>
                  Enable
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {notificationsEnabled && (
          <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 mb-6">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-medium">Notifications enabled</span>
          </div>
        )}

        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          <Button onClick={handleComplete} loading={loading} size="lg">
            Go to Dashboard
          </Button>
          <Button variant="secondary" onClick={function() { setStep(3); }}>
            Back
          </Button>
        </div>
      </div>
    );
  };

  // Save routine and mark onboarding complete
  const handleComplete = async () => {
    setLoading(true);
    try {
      // Create the routine
      const validTasks = tasks.filter(function(t) { return t.name.trim(); });
      if (routineName.trim() && validTasks.length > 0) {
        await fetch('/api/routines', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: routineName.trim(),
            tasks: validTasks.map(function(t) {
              return { name: t.name.trim(), duration: t.duration };
            }),
          }),
        });
      }

      // Mark onboarding complete
      await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: true }),
      });

      router.push('/dashboard');
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
      setLoading(false);
    }
  };

  // Skip onboarding
  const handleSkip = async () => {
    setLoading(true);
    try {
      await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: true }),
      });
      router.push('/dashboard');
    } catch (err) {
      console.error('Failed to skip onboarding:', err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neo-50 to-white dark:from-calm-900 dark:to-calm-800 flex flex-col">
      {/* Progress bar */}
      <div className="w-full px-4 pt-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-2">
            {Array.from({ length: totalSteps }).map(function(_, i) {
              return (
                <div
                  key={i}
                  className={
                    'h-1.5 flex-1 rounded-full transition-colors ' +
                    (i < step ? 'bg-neo-500' : 'bg-calm-200 dark:bg-calm-700')
                  }
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {step === 1 && renderWelcome()}
          {step === 2 && renderTemplateSelection()}
          {step === 3 && renderCustomize()}
          {step === 4 && renderComplete()}
        </div>
      </div>
    </div>
  );
}
