'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

/**
 * Coach Clients Page
 * Manage client roster
 */
export default function CoachClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');
  const [inviteCode, setInviteCode] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchClients();
  }, [filter]);

  const fetchClients = async () => {
    try {
      const res = await fetch(`/api/coach/clients?status=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setClients(data.clients || []);
      }
    } catch (err) {
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateInvite = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/coach/clients', {
        method: 'POST',
      });

      if (res.ok) {
        const data = await res.json();
        setInviteCode(data.inviteCode);
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to generate invite');
      }
    } catch (err) {
      console.error('Error generating invite:', err);
    } finally {
      setGenerating(false);
    }
  };

  const updateClientStatus = async (clientId, status) => {
    try {
      const res = await fetch(`/api/coach/clients/${clientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        fetchClients();
      }
    } catch (err) {
      console.error('Error updating client:', err);
    }
  };

  const removeClient = async (clientId) => {
    if (!confirm('Remove this client? They will need a new invite to rejoin.')) return;

    try {
      const res = await fetch(`/api/coach/clients/${clientId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setClients(clients.filter((c) => c.id !== clientId));
      }
    } catch (err) {
      console.error('Error removing client:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Link href="/coach" className="text-sm text-neo-600 hover:text-neo-700 mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-calm-800">Clients</h1>
          <p className="text-calm-500 mt-1">Manage your client roster</p>
        </div>
        <button
          onClick={generateInvite}
          disabled={generating}
          className="px-4 py-2 bg-neo-500 text-white rounded-lg hover:bg-neo-600 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          {generating ? 'Generating...' : 'Invite Client'}
        </button>
      </div>

      {/* Invite Code Modal */}
      {inviteCode && (
        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-calm-800 mb-2">Share this invite code</h3>
                <p className="text-sm text-calm-500 mb-4">
                  Send this code to your client. They can use it during registration.
                </p>
                <div className="flex items-center gap-3">
                  <code className="px-4 py-3 bg-calm-50 text-calm-800 text-lg font-mono rounded-lg">
                    {inviteCode}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(inviteCode);
                      alert('Copied to clipboard!');
                    }}
                    className="px-4 py-3 bg-neo-100 text-neo-700 rounded-lg hover:bg-neo-200 transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <button
                onClick={() => setInviteCode('')}
                className="text-calm-400 hover:text-calm-600"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-calm-200">
        {[
          { value: 'active', label: 'Active' },
          { value: 'pending', label: 'Pending' },
          { value: 'all', label: 'All' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              filter === tab.value
                ? 'border-neo-500 text-neo-600'
                : 'border-transparent text-calm-500 hover:text-calm-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Clients List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-neo-100 animate-pulse" />
          <p className="text-calm-500">Loading clients...</p>
        </div>
      ) : clients.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-calm-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-calm-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-calm-600 mb-4">No {filter !== 'all' ? filter : ''} clients yet</p>
          <button
            onClick={generateInvite}
            className="text-neo-600 hover:text-neo-700 font-medium"
          >
            Generate an invite code →
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {clients.map((client) => (
            <Card key={client.id} variant="flat">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-neo-100 flex items-center justify-center">
                    <span className="text-neo-600 font-semibold text-lg">
                      {client.name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-calm-800">{client.name}</h3>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          client.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : client.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-calm-100 text-calm-600'
                        }`}
                      >
                        {client.status}
                      </span>
                      {client.stats?.activeToday && (
                        <span className="w-2 h-2 rounded-full bg-green-500" title="Active today" />
                      )}
                    </div>
                    <p className="text-sm text-calm-500">{client.email}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-calm-400">
                      <span>🔥 {client.stats?.currentStreak || 0} day streak</span>
                      <span>📊 {client.stats?.totalCheckIns || 0} check-ins</span>
                      <span>📝 {client.stats?.routineCount || 0} routines</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {client.status === 'pending' && (
                      <button
                        onClick={() => updateClientStatus(client.id, 'active')}
                        className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        Accept
                      </button>
                    )}
                    {client.status === 'active' && (
                      <button
                        onClick={() => updateClientStatus(client.id, 'paused')}
                        className="px-3 py-1.5 text-sm bg-calm-100 text-calm-600 rounded-lg hover:bg-calm-200 transition-colors"
                      >
                        Pause
                      </button>
                    )}
                    {client.status === 'paused' && (
                      <button
                        onClick={() => updateClientStatus(client.id, 'active')}
                        className="px-3 py-1.5 text-sm bg-neo-100 text-neo-600 rounded-lg hover:bg-neo-200 transition-colors"
                      >
                        Reactivate
                      </button>
                    )}
                    <Link
                      href={`/coach/clients/${client.id}`}
                      className="px-3 py-1.5 text-sm bg-neo-100 text-neo-700 rounded-lg hover:bg-neo-200 transition-colors"
                    >
                      Details
                    </Link>
                    <button
                      onClick={() => removeClient(client.id)}
                      className="p-1.5 text-calm-400 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary */}
      {clients.length > 0 && (
        <div className="text-center text-sm text-calm-400 pt-4">
          Showing {clients.length} client{clients.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
