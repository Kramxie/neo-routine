'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

/**
 * Coach Dashboard
 * Overview of coaching activity, clients, and templates
 */
export default function CoachDashboard() {
  const [loading, setLoading] = useState(true);
  const [isCoach, setIsCoach] = useState(false);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCoachData();
  }, []);

  const fetchCoachData = async () => {
    try {
      // Check if user is a coach
      const profileRes = await fetch('/api/coach/profile');
      const profileData = await profileRes.json();

      if (!profileData.isCoach) {
        setIsCoach(false);
        setLoading(false);
        return;
      }

      setIsCoach(true);

      // Fetch stats
      const statsRes = await fetch('/api/coach/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (err) {
      console.error('Error fetching coach data:', err);
      setError('Failed to load coach dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neo-100 flex items-center justify-center animate-pulse">
            <svg className="w-8 h-8 text-neo-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C12 2 5 10 5 15C5 18.866 8.134 22 12 22C15.866 22 19 18.866 19 15C19 10 12 2 12 2Z" />
            </svg>
          </div>
          <p className="text-calm-500">Loading coach dashboard...</p>
        </div>
      </div>
    );
  }

  // Not a coach - show upgrade prompt
  if (!isCoach) {
    return <BecomeCoachPrompt />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-calm-800">
            Coach Dashboard
            {stats?.coachProfile?.isVerified && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-neo-100 text-neo-700">
                Verified
              </span>
            )}
          </h1>
          <p className="text-calm-500 mt-1 text-sm sm:text-base">
            Welcome back, {stats?.coachProfile?.brandName}
          </p>
        </div>
        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
          <Link
            href="/coach/templates/new"
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-neo-500 text-white rounded-lg hover:bg-neo-600 transition-colors text-center text-sm sm:text-base"
          >
            + New Template
          </Link>
          <Link
            href="/coach/clients"
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-calm-200 text-calm-700 rounded-lg hover:bg-calm-50 transition-colors text-center text-sm sm:text-base"
          >
            Manage Clients
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Active Clients"
          value={stats?.overview?.activeClients || 0}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          color="neo"
        />
        <StatCard
          label="Pending Requests"
          value={stats?.overview?.pendingClients || 0}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="orange"
        />
        <StatCard
          label="Templates"
          value={stats?.templates?.published || 0}
          subValue={`of ${stats?.templates?.total || 0}`}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
          }
          color="purple"
        />
        <StatCard
          label="Template Adoptions"
          value={stats?.templates?.totalAdoptions || 0}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          }
          color="green"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Client Activity */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Client Activity (7 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-calm-600">Total Check-ins</span>
                <span className="text-xl font-bold text-calm-800">
                  {stats?.activity?.clientCheckInsLast7Days || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-calm-600">Avg per Client</span>
                <span className="text-xl font-bold text-calm-800">
                  {stats?.activity?.avgCheckInsPerClient || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-calm-600">Engagement Rate</span>
                <span className="text-xl font-bold text-neo-600">
                  {stats?.overview?.engagementRate || 0}%
                </span>
              </div>
              <div className="pt-4 border-t border-calm-100">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-green-500">&uarr;</span>
                  <span className="text-calm-600">
                    {stats?.overview?.newClientsThisMonth || 0} new clients this month
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link
                href="/coach/templates"
                className="flex items-center justify-between p-3 rounded-lg bg-calm-50 hover:bg-calm-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-calm-800">Manage Templates</p>
                    <p className="text-sm text-calm-500">Create and edit routine blueprints</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-calm-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              <Link
                href="/coach/clients"
                className="flex items-center justify-between p-3 rounded-lg bg-calm-50 hover:bg-calm-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-neo-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-neo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-calm-800">View Clients</p>
                    <p className="text-sm text-calm-500">Track client progress and activity</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-calm-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              <Link
                href="/coach/profile"
                className="flex items-center justify-between p-3 rounded-lg bg-calm-50 hover:bg-calm-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-calm-800">Edit Profile</p>
                    <p className="text-sm text-calm-500">Update your coach branding</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-calm-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ label, value, subValue, icon, color }) {
  const colors = {
    neo: 'bg-neo-50 text-neo-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-calm-100">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-calm-800">
            {value}
            {subValue && (
              <span className="text-sm font-normal text-calm-400 ml-1">{subValue}</span>
            )}
          </p>
          <p className="text-sm text-calm-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

// Become a Coach Prompt Component
function BecomeCoachPrompt() {
  const [applying, setApplying] = useState(false);
  const [brandName, setBrandName] = useState('');
  const [bio, setBio] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true);
    setError('');

    try {
      const res = await fetch('/api/coach/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandName, bio }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to apply');
      }

      setSuccess(true);
      // Reload page after short delay
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setApplying(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-calm-800 mb-2">Welcome, Coach!</h2>
          <p className="text-calm-500">Setting up your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-12">
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-neo-100 flex items-center justify-center">
          <svg className="w-10 h-10 text-neo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-calm-800 mb-2">Become a Coach</h1>
        <p className="text-calm-500">
          Share your routines with others and help them build better habits.
        </p>
      </div>

      <Card variant="elevated">
        <CardContent className="p-6">
          <form onSubmit={handleApply} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-calm-700 mb-2">
                Brand Name *
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="How clients will see you"
                className="w-full px-4 py-3 rounded-lg border border-calm-200 focus:outline-none focus:ring-2 focus:ring-neo-400"
                required
                minLength={2}
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-calm-700 mb-2">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell potential clients about yourself..."
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-calm-200 focus:outline-none focus:ring-2 focus:ring-neo-400 resize-none"
                maxLength={500}
              />
            </div>

            <button
              type="submit"
              disabled={applying || !brandName.trim()}
              className="w-full py-3 bg-neo-500 text-white font-medium rounded-lg hover:bg-neo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {applying ? 'Applying...' : 'Become a Coach'}
            </button>

            <p className="text-xs text-calm-400 text-center">
              By becoming a coach, you agree to our community guidelines.
            </p>
          </form>
        </CardContent>
      </Card>

      {/* Benefits */}
      <div className="mt-8 space-y-4">
        <h3 className="font-medium text-calm-700 text-center">What you can do as a coach:</h3>
        <div className="grid gap-3">
          {[
            'Create and share routine templates',
            'Build a client roster',
            'Track client progress',
            'White-label your brand',
          ].map((benefit, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-calm-50 rounded-lg">
              <div className="w-6 h-6 rounded-full bg-neo-500 text-white flex items-center justify-center text-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-calm-700">{benefit}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
