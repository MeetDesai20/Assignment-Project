import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Button, Card, Input } from '../../components';
import { Header } from '../../components';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../utils/apiClient';
import { notifyError, notifySuccess } from '../../utils/toast';

const tabItems = [
  { id: 'overview', label: 'Overview', icon: 'dashboard' },
  { id: 'draws', label: 'Draws', icon: 'card_giftcard' },
  { id: 'users', label: 'Users', icon: 'people' },
  { id: 'winners', label: 'Winners', icon: 'emoji_events' },
  { id: 'charities', label: 'Charities', icon: 'favorite' },
];

const initialDrawForm = {
  drawMonth: '',
  drawYear: '',
  logicType: 'random',
  totalPool: '',
  status: 'pending',
};

const initialCharityForm = {
  name: '',
  description: '',
  website: '',
  logoUrl: '',
  isFeatured: false,
};

/**
 * Admin Dashboard
 * Provides full admin operations with API-backed forms and listings
 */
export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    poolSize: 0,
    charityContributions: 0,
  });

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userFilters, setUserFilters] = useState({
    search: '',
    subscription: '',
    status: '',
  });

  const [draws, setDraws] = useState([]);
  const [drawForm, setDrawForm] = useState(initialDrawForm);
  const [editingDrawId, setEditingDrawId] = useState(null);

  const [pendingWinners, setPendingWinners] = useState([]);

  const [charities, setCharities] = useState([]);
  const [charityForm, setCharityForm] = useState(initialCharityForm);
  const [editingCharityId, setEditingCharityId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (message) {
      notifySuccess(message);
    }
  }, [message]);

  useEffect(() => {
    if (error) {
      notifyError(error);
    }
  }, [error]);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
    if (activeTab === 'draws') {
      fetchDraws();
    }
    if (activeTab === 'winners') {
      fetchPendingWinners();
    }
    if (activeTab === 'charities') {
      fetchCharities();
    }
  }, [activeTab]);

  const clearAlerts = () => {
    setMessage('');
    setError('');
  };

  const handleApiError = (err, fallbackMessage) => {
    setError(err.response?.data?.message || fallbackMessage);
  };

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/users/stats');
      setStats(response.data?.data || stats);
    } catch (err) {
      console.error('Failed to fetch admin stats', err);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    clearAlerts();
    try {
      const response = await apiClient.get('/users', {
        params: {
          search: userFilters.search || undefined,
          subscription: userFilters.subscription || undefined,
          status: userFilters.status || undefined,
        },
      });
      setUsers(response.data?.data?.users || []);
    } catch (err) {
      handleApiError(err, 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserById = async (userId) => {
    clearAlerts();
    try {
      const response = await apiClient.get(`/users/${userId}`);
      setSelectedUser(response.data?.data || null);
    } catch (err) {
      handleApiError(err, 'Failed to fetch user details');
    }
  };

  const fetchDraws = async () => {
    setLoading(true);
    clearAlerts();
    try {
      const response = await apiClient.get('/draws');
      setDraws(response.data?.data || []);
    } catch (err) {
      handleApiError(err, 'Failed to fetch draws');
    } finally {
      setLoading(false);
    }
  };

  const saveDraw = async (event) => {
    event.preventDefault();
    setLoading(true);
    clearAlerts();

    const payload = {
      drawMonth: Number(drawForm.drawMonth),
      drawYear: Number(drawForm.drawYear),
      logicType: drawForm.logicType,
      totalPool: Number(drawForm.totalPool || 0),
      status: drawForm.status,
    };

    try {
      if (editingDrawId) {
        await apiClient.put(`/draws/${editingDrawId}`, payload);
        setMessage('Draw updated successfully');
      } else {
        await apiClient.post('/draws', payload);
        setMessage('Draw created successfully');
      }

      setDrawForm(initialDrawForm);
      setEditingDrawId(null);
      await fetchDraws();
      await fetchStats();
    } catch (err) {
      handleApiError(err, 'Failed to save draw');
    } finally {
      setLoading(false);
    }
  };

  const startEditDraw = (draw) => {
    setEditingDrawId(draw.id);
    setDrawForm({
      drawMonth: String(draw.draw_month || ''),
      drawYear: String(draw.draw_year || ''),
      logicType: draw.logic_type || 'random',
      totalPool: String(draw.total_pool || 0),
      status: draw.status || 'pending',
    });
    clearAlerts();
  };

  const fetchPendingWinners = async () => {
    setLoading(true);
    clearAlerts();
    try {
      const response = await apiClient.get('/winners/pending');
      setPendingWinners(response.data?.data || []);
    } catch (err) {
      handleApiError(err, 'Failed to fetch pending winners');
    } finally {
      setLoading(false);
    }
  };

  const verifyWinner = async (winnerId, isVerified) => {
    setLoading(true);
    clearAlerts();
    try {
      await apiClient.put(`/winners/${winnerId}/verify`, { isVerified });
      setMessage(`Winner ${isVerified ? 'verified' : 'rejected'} successfully`);
      await fetchPendingWinners();
    } catch (err) {
      handleApiError(err, 'Failed to update winner verification');
    } finally {
      setLoading(false);
    }
  };

  const fetchCharities = async () => {
    setLoading(true);
    clearAlerts();
    try {
      const response = await apiClient.get('/charities');
      setCharities(response.data?.data || []);
    } catch (err) {
      handleApiError(err, 'Failed to fetch charities');
    } finally {
      setLoading(false);
    }
  };

  const saveCharity = async (event) => {
    event.preventDefault();
    setLoading(true);
    clearAlerts();

    const payload = {
      name: charityForm.name,
      description: charityForm.description,
      website: charityForm.website || null,
      logoUrl: charityForm.logoUrl || null,
      isFeatured: charityForm.isFeatured,
    };

    try {
      if (editingCharityId) {
        await apiClient.put(`/charities/${editingCharityId}`, payload);
        setMessage('Charity updated successfully');
      } else {
        await apiClient.post('/charities', payload);
        setMessage('Charity created successfully');
      }

      setCharityForm(initialCharityForm);
      setEditingCharityId(null);
      await fetchCharities();
    } catch (err) {
      handleApiError(err, 'Failed to save charity');
    } finally {
      setLoading(false);
    }
  };

  const startEditCharity = (charity) => {
    setEditingCharityId(charity.id);
    setCharityForm({
      name: charity.name || '',
      description: charity.description || '',
      website: charity.website || '',
      logoUrl: charity.logo_url || '',
      isFeatured: !!charity.is_featured,
    });
    clearAlerts();
  };

  const handleSignOut = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-surface">
      <Header
        title="Ethereal Ledger - Admin"
        actions={
          <div className="flex items-center gap-3">
            <Badge label="Administrator" variant="primary" />
            <Button variant="danger" size="sm" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        }
      />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabItems.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-smooth whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined text-base">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {message && (
          <Card className="p-4 bg-tertiary/10 border border-tertiary/30">
            <p className="text-label-md text-on-surface">{message}</p>
          </Card>
        )}
        {error && (
          <Card className="p-4 bg-error/10 border border-error/30">
            <p className="text-label-md text-error">{error}</p>
          </Card>
        )}

        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-4 gap-6">
            <Card glow>
              <p className="text-label-sm text-on-surface-variant mb-2">Total Users</p>
              <h3 className="text-headline-lg font-headline font-bold text-on-surface">
                {stats.totalUsers.toLocaleString()}
              </h3>
            </Card>
            <Card glow>
              <p className="text-label-sm text-on-surface-variant mb-2">Active Subscriptions</p>
              <h3 className="text-headline-lg font-headline font-bold text-primary">
                {stats.activeSubscriptions.toLocaleString()}
              </h3>
            </Card>
            <Card glow>
              <p className="text-label-sm text-on-surface-variant mb-2">Prize Pool</p>
              <h3 className="text-headline-lg font-headline font-bold text-secondary">
                ${Number(stats.poolSize || 0).toLocaleString()}
              </h3>
            </Card>
            <Card glow>
              <p className="text-label-sm text-on-surface-variant mb-2">Charity Contributions</p>
              <h3 className="text-headline-lg font-headline font-bold text-tertiary">
                ${Number(stats.charityContributions || 0).toLocaleString()}
              </h3>
            </Card>
          </div>
        )}

        {activeTab === 'draws' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="p-6 lg:col-span-1">
              <h2 className="text-headline-sm font-headline font-bold text-on-surface mb-4">
                {editingDrawId ? 'Edit Draw' : 'New Draw Form'}
              </h2>
              <form onSubmit={saveDraw} className="space-y-5">
                <Input
                  type="number"
                  label="Draw Month"
                  min="1"
                  max="12"
                  value={drawForm.drawMonth}
                  onChange={(e) => setDrawForm((prev) => ({ ...prev, drawMonth: e.target.value }))}
                  fullWidth
                  required
                />
                <Input
                  type="number"
                  label="Draw Year"
                  min="2024"
                  value={drawForm.drawYear}
                  onChange={(e) => setDrawForm((prev) => ({ ...prev, drawYear: e.target.value }))}
                  fullWidth
                  required
                />
                <Input
                  type="text"
                  label="Logic Type"
                  value={drawForm.logicType}
                  onChange={(e) => setDrawForm((prev) => ({ ...prev, logicType: e.target.value }))}
                  fullWidth
                />
                <Input
                  type="number"
                  label="Total Pool"
                  min="0"
                  value={drawForm.totalPool}
                  onChange={(e) => setDrawForm((prev) => ({ ...prev, totalPool: e.target.value }))}
                  fullWidth
                />
                <Input
                  type="text"
                  label="Status"
                  value={drawForm.status}
                  onChange={(e) => setDrawForm((prev) => ({ ...prev, status: e.target.value }))}
                  fullWidth
                />
                <div className="flex gap-3">
                  <Button variant="primary" disabled={loading}>
                    {editingDrawId ? 'Update Draw' : 'Create Draw'}
                  </Button>
                  {editingDrawId && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setEditingDrawId(null);
                        setDrawForm(initialDrawForm);
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </Card>

            <Card className="p-6 lg:col-span-2">
              <h2 className="text-headline-sm font-headline font-bold text-on-surface mb-4">All Draws</h2>
              {loading ? (
                <p className="text-on-surface-variant">Loading draws...</p>
              ) : draws.length === 0 ? (
                <p className="text-on-surface-variant">No draws available yet.</p>
              ) : (
                <div className="space-y-3">
                  {draws.map((draw) => (
                    <Card key={draw.id} className="p-4 bg-surface-container-low">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div>
                          <p className="text-body-md font-semibold text-on-surface">
                            {draw.draw_month}/{draw.draw_year}
                          </p>
                          <p className="text-label-sm text-on-surface-variant">
                            Logic: {draw.logic_type} | Pool: ${Number(draw.total_pool || 0).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge label={draw.status || 'pending'} variant="secondary" size="sm" />
                          <Button variant="secondary" size="sm" onClick={() => startEditDraw(draw)}>
                            Edit Draw
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-headline-sm font-headline font-bold text-on-surface mb-4">User Search</h2>
              <div className="grid md:grid-cols-4 gap-4">
                <Input
                  type="text"
                  label="Search (name, email, subscription, status)"
                  value={userFilters.search}
                  onChange={(e) => setUserFilters((prev) => ({ ...prev, search: e.target.value }))}
                  fullWidth
                />
                <Input
                  type="text"
                  label="Subscription (monthly/yearly)"
                  value={userFilters.subscription}
                  onChange={(e) => setUserFilters((prev) => ({ ...prev, subscription: e.target.value }))}
                  fullWidth
                />
                <Input
                  type="text"
                  label="Status (active/inactive)"
                  value={userFilters.status}
                  onChange={(e) => setUserFilters((prev) => ({ ...prev, status: e.target.value }))}
                  fullWidth
                />
                <div className="flex items-end">
                  <Button variant="primary" onClick={fetchUsers} disabled={loading}>
                    Search Users
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-headline-sm font-headline font-bold text-on-surface mb-4">Users</h2>
              {loading ? (
                <p className="text-on-surface-variant">Loading users...</p>
              ) : users.length === 0 ? (
                <p className="text-on-surface-variant">No users found for the selected filters.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-outline-variant/20">
                        <th className="text-left py-3 px-3 text-label-md font-semibold text-on-surface">Name</th>
                        <th className="text-left py-3 px-3 text-label-md font-semibold text-on-surface">Email</th>
                        <th className="text-left py-3 px-3 text-label-md font-semibold text-on-surface">Subscription</th>
                        <th className="text-left py-3 px-3 text-label-md font-semibold text-on-surface">Status</th>
                        <th className="text-left py-3 px-3 text-label-md font-semibold text-on-surface">View</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-outline-variant/10">
                          <td className="py-3 px-3 text-body-sm text-on-surface">{user.fullName}</td>
                          <td className="py-3 px-3 text-body-sm text-on-surface-variant">{user.email}</td>
                          <td className="py-3 px-3 text-body-sm text-on-surface">
                            {user.subscription?.planType || 'none'} ({user.subscription?.status || 'none'})
                          </td>
                          <td className="py-3 px-3 text-body-sm">
                            <Badge label={user.isActive ? 'Active' : 'Inactive'} variant={user.isActive ? 'success' : 'error'} size="sm" />
                          </td>
                          <td className="py-3 px-3">
                            <Button variant="secondary" size="sm" onClick={() => fetchUserById(user.id)}>
                              User View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            {selectedUser && (
              <Card className="p-6 bg-surface-container-low">
                <h3 className="text-headline-sm font-headline font-bold text-on-surface mb-3">Selected User</h3>
                <div className="grid md:grid-cols-2 gap-3 text-body-sm">
                  <p className="text-on-surface"><strong>Name:</strong> {selectedUser.fullName}</p>
                  <p className="text-on-surface"><strong>Email:</strong> {selectedUser.email}</p>
                  <p className="text-on-surface"><strong>Role:</strong> {selectedUser.role}</p>
                  <p className="text-on-surface"><strong>Status:</strong> {selectedUser.isActive ? 'Active' : 'Inactive'}</p>
                  <p className="text-on-surface"><strong>Subscription:</strong> {selectedUser.subscription?.planType || 'none'}</p>
                  <p className="text-on-surface"><strong>Sub Status:</strong> {selectedUser.subscription?.status || 'none'}</p>
                </div>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'winners' && (
          <Card className="p-6">
            <h2 className="text-headline-sm font-headline font-bold text-on-surface mb-4">
              Winner Verification Review
            </h2>
            {loading ? (
              <p className="text-on-surface-variant">Loading pending verifications...</p>
            ) : pendingWinners.length === 0 ? (
              <p className="text-on-surface-variant">No winners pending verification.</p>
            ) : (
              <div className="space-y-3">
                {pendingWinners.map((winner) => (
                  <Card key={winner.id} className="p-4 bg-surface-container-low">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div>
                        <p className="text-body-md font-semibold text-on-surface">
                          {winner.users?.full_name || 'Unknown User'} ({winner.users?.email || 'No email'})
                        </p>
                        <p className="text-label-sm text-on-surface-variant">
                          Match: {winner.match_type} | Prize: ${Number(winner.prize_amount || 0).toLocaleString()}
                        </p>
                        <p className="text-label-sm text-on-surface-variant">
                          Proof: {winner.proof_url || 'Not provided'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="tertiary" size="sm" onClick={() => verifyWinner(winner.id, true)}>
                          Verify
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => verifyWinner(winner.id, false)}>
                          Reject
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        )}

        {activeTab === 'charities' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="p-6 lg:col-span-1">
              <h2 className="text-headline-sm font-headline font-bold text-on-surface mb-4">
                {editingCharityId ? 'Edit Charity' : 'Add Charity'}
              </h2>
              <form onSubmit={saveCharity} className="space-y-5">
                <Input
                  type="text"
                  label="Name"
                  value={charityForm.name}
                  onChange={(e) => setCharityForm((prev) => ({ ...prev, name: e.target.value }))}
                  fullWidth
                  required
                />
                <Input
                  type="text"
                  label="Description"
                  value={charityForm.description}
                  onChange={(e) => setCharityForm((prev) => ({ ...prev, description: e.target.value }))}
                  fullWidth
                />
                <Input
                  type="url"
                  label="Website"
                  value={charityForm.website}
                  onChange={(e) => setCharityForm((prev) => ({ ...prev, website: e.target.value }))}
                  fullWidth
                />
                <Input
                  type="url"
                  label="Logo URL"
                  value={charityForm.logoUrl}
                  onChange={(e) => setCharityForm((prev) => ({ ...prev, logoUrl: e.target.value }))}
                  fullWidth
                />
                <label className="flex items-center gap-2 text-body-sm text-on-surface">
                  <input
                    type="checkbox"
                    checked={charityForm.isFeatured}
                    onChange={(e) => setCharityForm((prev) => ({ ...prev, isFeatured: e.target.checked }))}
                  />
                  Featured charity
                </label>
                <div className="flex gap-3">
                  <Button variant="primary" disabled={loading}>
                    {editingCharityId ? 'Update Charity' : 'Create Charity'}
                  </Button>
                  {editingCharityId && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setEditingCharityId(null);
                        setCharityForm(initialCharityForm);
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </Card>

            <Card className="p-6 lg:col-span-2">
              <h2 className="text-headline-sm font-headline font-bold text-on-surface mb-4">Charity List</h2>
              {loading ? (
                <p className="text-on-surface-variant">Loading charities...</p>
              ) : charities.length === 0 ? (
                <p className="text-on-surface-variant">No charities found.</p>
              ) : (
                <div className="space-y-3">
                  {charities.map((charity) => (
                    <Card key={charity.id} className="p-4 bg-surface-container-low">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div>
                          <p className="text-body-md font-semibold text-on-surface">{charity.name}</p>
                          <p className="text-label-sm text-on-surface-variant">{charity.description || 'No description'}</p>
                          <p className="text-label-sm text-on-surface-variant">{charity.website || 'No website'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {charity.is_featured && <Badge label="Featured" variant="primary" size="sm" />}
                          <Button variant="secondary" size="sm" onClick={() => startEditCharity(charity)}>
                            Edit Charity
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
