'use client';

import { useState, useEffect } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

/**
 * Profile Page
 * User profile management, stats, and account info
 */

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    avatar: '',
  });

  // Fetch user profile and stats
  useEffect(() => {
    async function fetchProfile() {
      try {
        const [userRes, statsRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/insights/user'),
        ]);

        if (userRes.ok) {
          const userData = await userRes.json();
          const user = userData.data?.user;
          setUser(user);
          setFormData({
            name: user?.name || '',
            email: user?.email || '',
            bio: user?.bio || '',
            avatar: user?.avatar || '',
          });
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  // Handle save profile
  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          bio: formData.bio,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser({ ...user, ...data.user });
        setEditing(false);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Calculate membership duration
  const getMembershipDuration = (joinDate) => {
    if (!joinDate) return 'New member';
    const joined = new Date(joinDate);
    const now = new Date();
    const diffDays = Math.floor((now - joined) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 7) return `${diffDays} days`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
    return `${Math.floor(diffDays / 365)} years`;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="h-9 w-40 bg-calm-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
          <div className="h-5 w-64 bg-calm-100 dark:bg-slate-800 rounded animate-pulse" />
        </div>
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 rounded-full bg-calm-200 dark:bg-slate-700 animate-pulse" />
              <div className="space-y-3">
                <div className="h-7 w-48 bg-calm-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-5 w-32 bg-calm-100 dark:bg-slate-800 rounded animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-calm-800 dark:text-white mb-2">Profile</h1>
        <p className="text-calm-600 dark:text-calm-400">
          Manage your account and view your progress
        </p>
      </div>

      {/* Message */}
      {message.text && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Profile Card */}
      <Card className="mb-6">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-6 md:space-y-0">
            <div className="flex items-center space-x-6">
              {/* Avatar */}
              <div className="relative">
                {formData.avatar ? (
                  <img
                    src={formData.avatar}
                    alt={formData.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-neo-100"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-neo-400 to-neo-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-neo-100">
                    {getInitials(formData.name)}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-white dark:border-slate-800 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>

              {/* User Info */}
              <div>
                {editing ? (
                  <div className="space-y-3">
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your name"
                      className="text-xl font-bold"
                    />
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Tell us about yourself..."
                      rows={2}
                      className="w-full px-4 py-2 rounded-lg border border-calm-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-calm-800 dark:text-white focus:ring-2 focus:ring-neo-400 focus:border-transparent text-sm"
                    />
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-calm-800 dark:text-white">
                      {user?.name || 'User'}
                    </h2>
                    <p className="text-calm-600 dark:text-calm-400">{user?.email}</p>
                    {user?.bio && (
                      <p className="text-calm-600 dark:text-calm-400 mt-2 text-sm">
                        {user.bio}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 mt-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-neo-100 dark:bg-neo-900/30 text-neo-700 dark:text-neo-300">
                        {user?.subscription?.plan === 'premium' ? '⭐ Premium' : '🆓 Free Plan'}
                      </span>
                      <span className="text-sm text-calm-500 dark:text-calm-500">
                        Member for {getMembershipDuration(user?.createdAt)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Edit Button */}
            <div className="flex space-x-3">
              {editing ? (
                <>
                  <Button variant="ghost" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setEditing(true)}>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-neo-500 mb-1">
              {stats?.totalCheckIns || 0}
            </div>
            <div className="text-sm text-calm-600 dark:text-calm-400">Total Check-ins</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-orange-500 mb-1">
              {stats?.currentStreak || 0}
            </div>
            <div className="text-sm text-calm-600 dark:text-calm-400">Day Streak</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-500 mb-1">
              {stats?.routineCount || 0}
            </div>
            <div className="text-sm text-calm-600 dark:text-calm-400">Routines</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-500 mb-1">
              {stats?.completionRate || 0}%
            </div>
            <div className="text-sm text-calm-600 dark:text-calm-400">Completion Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Account Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-calm-100 dark:border-slate-700">
              <div>
                <div className="text-sm font-medium text-calm-500 dark:text-calm-500">Email Address</div>
                <div className="text-calm-800 dark:text-white">{user?.email}</div>
              </div>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">
                {user?.emailVerified ? 'Verified' : 'Unverified'}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-calm-100 dark:border-slate-700">
              <div>
                <div className="text-sm font-medium text-calm-500 dark:text-calm-500">Member Since</div>
                <div className="text-calm-800 dark:text-white">{formatDate(user?.createdAt)}</div>
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-calm-100 dark:border-slate-700">
              <div>
                <div className="text-sm font-medium text-calm-500 dark:text-calm-500">Subscription</div>
                <div className="text-calm-800 dark:text-white">
                  {user?.subscription?.plan === 'premium' ? 'Premium Plan' : 'Free Plan'}
                </div>
              </div>
              {user?.subscription?.plan !== 'premium' && (
                <Button href="/dashboard/upgrade" variant="primary" size="sm">
                  Upgrade
                </Button>
              )}
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <div className="text-sm font-medium text-calm-500 dark:text-calm-500">Timezone</div>
                <div className="text-calm-800 dark:text-white">
                  {user?.preferences?.timezone || 'UTC'}
                </div>
              </div>
              <Button href="/dashboard/settings" variant="ghost" size="sm">
                Change
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.recentActivity?.length > 0 ? (
              stats.recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 py-3 border-b border-calm-100 dark:border-slate-700 last:border-0"
                >
                  <div className="w-8 h-8 rounded-full bg-neo-100 dark:bg-neo-900/30 flex items-center justify-center">
                    <svg className="w-4 h-4 text-neo-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-calm-800 dark:text-white">{activity.description}</p>
                    <p className="text-sm text-calm-500 dark:text-calm-500">{formatDate(activity.date)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-calm-500 dark:text-calm-500">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>No recent activity to show</p>
                <p className="text-sm mt-1">Start checking in to your routines!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button href="/dashboard/settings" variant="outline" className="justify-start">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </Button>
            <Button href="/dashboard/achievements" variant="outline" className="justify-start">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              View Achievements
            </Button>
            <Button href="/dashboard/insights" variant="outline" className="justify-start">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              View Insights
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
