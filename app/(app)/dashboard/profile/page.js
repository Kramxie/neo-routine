'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Card, { CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

/**
 * Profile Page
 * User profile management, stats, security settings, and account info
 * Features:
 * - Edit profile (name, bio)
 * - Password change via email reset link
 * - Account security overview
 * - Stats and achievements summary
 * - Recent activity
 */

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [passwordResetStatus, setPasswordResetStatus] = useState('idle'); // idle, loading, success, error
  const [passwordResetMessage, setPasswordResetMessage] = useState('');
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
          fetch('/api/insights/user?range=30'),
        ]);

        if (userRes.ok) {
          const userData = await userRes.json();
          const userInfo = userData.data?.user;
          setUser(userInfo);
          setFormData({
            name: userInfo?.name || '',
            email: userInfo?.email || '',
            bio: userInfo?.bio || '',
            avatar: userInfo?.avatar || '',
          });
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setMessage({ type: 'error', text: 'Failed to load profile data' });
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
          name: formData.name.trim(),
          bio: formData.bio.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser({ ...user, name: formData.name.trim(), bio: formData.bio.trim() });
        setEditing(false);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
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

  // Handle password reset request
  const handlePasswordReset = async () => {
    if (!user?.email) return;
    
    setPasswordResetStatus('loading');
    setPasswordResetMessage('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordResetStatus('success');
        setPasswordResetMessage('Password reset link sent! Check your email inbox.');
      } else {
        setPasswordResetStatus('error');
        setPasswordResetMessage(data.message || 'Failed to send reset link');
      }
    } catch (err) {
      setPasswordResetStatus('error');
      setPasswordResetMessage('An error occurred. Please try again.');
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

  // Format relative time
  const formatRelativeTime = (date) => {
    if (!date) return '';
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return formatDate(date);
  };

  // Calculate membership duration
  const getMembershipDuration = (joinDate) => {
    if (!joinDate) return 'New member';
    const joined = new Date(joinDate);
    const now = new Date();
    const diffDays = Math.floor((now - joined) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) return 'Today';
    if (diffDays === 1) return '1 day';
    if (diffDays < 7) return `${diffDays} days`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''}`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''}`;
    const years = Math.floor(diffDays / 365);
    return `${years} year${years > 1 ? 's' : ''}`;
  };

  // Get tier badge
  const getTierBadge = (tier) => {
    const badges = {
      free: { label: 'Free', icon: '🆓', color: 'bg-calm-100 dark:bg-slate-700 text-calm-700 dark:text-slate-300' },
      premium: { label: 'Premium', icon: '⭐', color: 'bg-neo-100 dark:bg-neo-900/30 text-neo-700 dark:text-neo-300' },
      premium_plus: { label: 'Premium+', icon: '👑', color: 'bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 text-amber-700 dark:text-amber-300' },
    };
    return badges[tier] || badges.free;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <div className="h-8 sm:h-9 w-32 sm:w-40 bg-calm-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
          <div className="h-4 sm:h-5 w-48 sm:w-64 bg-calm-100 dark:bg-slate-800 rounded animate-pulse" />
        </div>
        <Card>
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-calm-200 dark:bg-slate-700 animate-pulse" />
              <div className="space-y-3 w-full sm:w-auto text-center sm:text-left">
                <div className="h-6 sm:h-7 w-48 mx-auto sm:mx-0 bg-calm-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-4 sm:h-5 w-32 mx-auto sm:mx-0 bg-calm-100 dark:bg-slate-800 rounded animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tierBadge = getTierBadge(user?.tier || 'free');

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-calm-800 dark:text-white mb-2">Profile</h1>
        <p className="text-sm sm:text-base text-calm-600 dark:text-slate-400">
          Manage your account, security, and view your progress
        </p>
      </div>

      {/* Message */}
      {message.text && (
        <div
          className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
          }`}
        >
          {message.type === 'success' ? (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {message.text}
        </div>
      )}

      {/* Profile Card */}
      <Card className="mb-6">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {formData.avatar ? (
                  <img
                    src={formData.avatar}
                    alt={formData.name}
                    className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-neo-100 dark:border-neo-900/50"
                  />
                ) : (
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-neo-400 to-neo-600 flex items-center justify-center text-white text-2xl md:text-3xl font-bold border-4 border-neo-100 dark:border-neo-900/50">
                    {getInitials(formData.name)}
                  </div>
                )}
                {user?.isEmailVerified && (
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full border-3 border-white dark:border-slate-800 flex items-center justify-center" title="Verified Account">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                {editing ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-calm-600 dark:text-slate-400 mb-1">Name</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your name"
                        className="text-lg font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-calm-600 dark:text-slate-400 mb-1">Bio</label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Tell us about yourself..."
                        rows={2}
                        maxLength={200}
                        className="w-full px-4 py-2 rounded-lg border border-calm-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-calm-800 dark:text-white focus:ring-2 focus:ring-neo-400 focus:border-transparent text-sm resize-none"
                      />
                      <p className="text-xs text-calm-400 dark:text-slate-500 mt-1">{formData.bio.length}/200 characters</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl md:text-2xl font-bold text-calm-800 dark:text-white truncate">
                      {user?.name || 'User'}
                    </h2>
                    <p className="text-calm-600 dark:text-slate-400 truncate">{user?.email}</p>
                    {user?.bio && (
                      <p className="text-calm-600 dark:text-slate-400 mt-2 text-sm line-clamp-2">
                        {user.bio}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${tierBadge.color}`}>
                        <span>{tierBadge.icon}</span>
                        {tierBadge.label}
                      </span>
                      <span className="text-sm text-calm-500 dark:text-slate-500">
                        Member for {getMembershipDuration(user?.createdAt)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Edit Button */}
            <div className="flex gap-2 w-full md:w-auto">
              {editing ? (
                <>
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        ...formData,
                        name: user?.name || '',
                        bio: user?.bio || '',
                      });
                    }}
                    className="flex-1 md:flex-none"
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={handleSave} 
                    disabled={saving || !formData.name.trim()}
                    className="flex-1 md:flex-none"
                  >
                    {saving ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Saving...
                      </>
                    ) : 'Save Changes'}
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setEditing(true)} className="w-full md:w-auto">
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
          <CardContent className="p-4 md:p-6 text-center">
            <div className="text-2xl md:text-3xl font-bold text-neo-500 mb-1">
              {stats?.totalCheckIns || user?.analytics?.totalCheckIns || 0}
            </div>
            <div className="text-xs md:text-sm text-calm-600 dark:text-slate-400">Total Check-ins</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-6 text-center">
            <div className="text-2xl md:text-3xl font-bold text-orange-500 mb-1">
              {stats?.streaks?.current || user?.analytics?.currentStreak || 0}
            </div>
            <div className="text-xs md:text-sm text-calm-600 dark:text-slate-400">Day Streak</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-6 text-center">
            <div className="text-2xl md:text-3xl font-bold text-green-500 mb-1">
              {stats?.routineStats?.length || 0}
            </div>
            <div className="text-xs md:text-sm text-calm-600 dark:text-slate-400">Routines</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-6 text-center">
            <div className="text-2xl md:text-3xl font-bold text-purple-500 mb-1">
              {stats?.streaks?.longest || user?.analytics?.longestStreak || 0}
            </div>
            <div className="text-xs md:text-sm text-calm-600 dark:text-slate-400">Best Streak</div>
          </CardContent>
        </Card>
      </div>

      {/* Security & Password Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg className="w-5 h-5 text-neo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Security &amp; Password
          </CardTitle>
          <CardDescription>Manage your account security settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email Verification Status */}
          <div className="flex items-center justify-between py-3 border-b border-calm-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user?.isEmailVerified ? 'bg-green-100 dark:bg-green-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                {user?.isEmailVerified ? (
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
              </div>
              <div>
                <div className="font-medium text-calm-800 dark:text-white">Email Verification</div>
                <div className="text-sm text-calm-500 dark:text-slate-400">
                  {user?.isEmailVerified ? 'Your email is verified' : 'Please verify your email address'}
                </div>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              user?.isEmailVerified
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
            }`}>
              {user?.isEmailVerified ? 'Verified' : 'Pending'}
            </span>
          </div>

          {/* Change Password */}
          <div className="py-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-calm-100 dark:bg-slate-700 flex items-center justify-center">
                  <svg className="w-5 h-5 text-calm-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-calm-800 dark:text-white">Change Password</div>
                  <div className="text-sm text-calm-500 dark:text-slate-400">
                    We&apos;ll send a secure reset link to your email
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handlePasswordReset}
                disabled={passwordResetStatus === 'loading' || passwordResetStatus === 'success'}
                className="w-full md:w-auto"
              >
                {passwordResetStatus === 'loading' ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sending...
                  </>
                ) : passwordResetStatus === 'success' ? (
                  <>
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Email Sent!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Send Reset Link
                  </>
                )}
              </Button>
            </div>
            {passwordResetMessage && (
              <div className={`mt-3 p-3 rounded-lg text-sm ${
                passwordResetStatus === 'success'
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
              }`}>
                {passwordResetMessage}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Account Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            <div className="flex items-center justify-between py-4 border-b border-calm-100 dark:border-slate-700">
              <div>
                <div className="text-sm font-medium text-calm-500 dark:text-slate-400">Email Address</div>
                <div className="text-calm-800 dark:text-white">{user?.email}</div>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                user?.isEmailVerified
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                  : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
              }`}>
                {user?.isEmailVerified ? 'Verified' : 'Unverified'}
              </span>
            </div>
            <div className="flex items-center justify-between py-4 border-b border-calm-100 dark:border-slate-700">
              <div>
                <div className="text-sm font-medium text-calm-500 dark:text-slate-400">Member Since</div>
                <div className="text-calm-800 dark:text-white">{formatDate(user?.createdAt)}</div>
              </div>
            </div>
            <div className="flex items-center justify-between py-4 border-b border-calm-100 dark:border-slate-700">
              <div>
                <div className="text-sm font-medium text-calm-500 dark:text-slate-400">Subscription</div>
                <div className="flex items-center gap-2">
                  <span className="text-calm-800 dark:text-white">
                    {user?.tier === 'premium_plus' ? 'Premium+' : user?.tier === 'premium' ? 'Premium' : 'Free Plan'}
                  </span>
                  {user?.subscription?.status === 'active' && user?.subscription?.currentPeriodEnd && (
                    <span className="text-xs text-calm-500 dark:text-slate-500">
                      (renews {formatDate(user.subscription.currentPeriodEnd)})
                    </span>
                  )}
                </div>
              </div>
              {user?.tier === 'free' && (
                <Link href="/dashboard/upgrade">
                  <Button variant="primary" size="sm">
                    Upgrade
                  </Button>
                </Link>
              )}
            </div>
            <div className="flex items-center justify-between py-4 border-b border-calm-100 dark:border-slate-700">
              <div>
                <div className="text-sm font-medium text-calm-500 dark:text-slate-400">Timezone</div>
                <div className="text-calm-800 dark:text-white">
                  {user?.preferences?.timezone || 'UTC'}
                </div>
              </div>
              <Link href="/dashboard/settings">
                <Button variant="ghost" size="sm">
                  Change
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-between py-4">
              <div>
                <div className="text-sm font-medium text-calm-500 dark:text-slate-400">Last Active</div>
                <div className="text-calm-800 dark:text-white">
                  {user?.analytics?.lastActiveDate ? formatRelativeTime(user.analytics.lastActiveDate) : 'Now'}
                </div>
              </div>
            </div>
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
            <Link href="/dashboard/settings" className="block">
              <Button variant="outline" className="w-full justify-start">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </Button>
            </Link>
            <Link href="/dashboard/achievements" className="block">
              <Button variant="outline" className="w-full justify-start">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Achievements
              </Button>
            </Link>
            <Link href="/dashboard/insights" className="block">
              <Button variant="outline" className="w-full justify-start">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Insights
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
