import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useAuth } from '../../context/AuthContext';
import { Card, Badge, ProgressTracker, Button } from '../../components';
import { Header, Sidebar } from '../../components';
import apiClient from '../../utils/apiClient';

/**
 * User Dashboard
 * Main hub for subscribed users with all key information
 */
export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    userProfile,
    subscription,
    scores,
    charity,
    fetchUserProfile,
    fetchSubscription,
    fetchScores,
    fetchCurrentCharity,
  } = useUser();
  const [activeNav, setActiveNav] = useState('overview');
  const [currentDraw, setCurrentDraw] = useState(null);
  const [drawLoading, setDrawLoading] = useState(true);

  const fetchCurrentDrawData = async () => {
    setDrawLoading(true);
    try {
      const response = await apiClient.get('/draws/current');
      const draw = response.data?.data ?? null;

      if (!draw) {
        setCurrentDraw(null);
        return;
      }

      let results = [];
      try {
        const resultsResponse = await apiClient.get(`/draws/${draw.id}/results`);
        results = resultsResponse.data?.data || [];
      } catch (error) {
        results = [];
      }

      const normalizedResults = results.length > 0 ? results : (draw.results ? [draw.results] : []);
      const numbers = normalizedResults.flatMap((entry) => entry?.winning_numbers || entry?.winningNumbers || []);

      setCurrentDraw({
        month: draw.draw_month,
        year: draw.draw_year,
        status: draw.status,
        poolSize: Number(draw.total_pool || 0),
        numbers,
        hasResults: numbers.length > 0,
      });
    } catch (error) {
      setCurrentDraw(null);
    } finally {
      setDrawLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchSubscription();
    fetchScores();
    fetchCurrentCharity();
    fetchCurrentDrawData();
  }, []);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: 'dashboard' },
    { id: 'subscription', label: 'Subscription', icon: 'workspace_premium' },
    { id: 'scores', label: 'Scores', icon: 'trending_up' },
    { id: 'draws', label: 'Draws', icon: 'card_giftcard' },
    { id: 'charity', label: 'Charity', icon: 'favorite' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  const handleSignOut = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <Header
        title="Ethereal Ledger"
        actions={
          <div className="flex items-center gap-4">
            <span className="text-label-md text-on-surface-variant">Welcome, {user?.fullName}</span>
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">account_circle</span>
            </div>
          </div>
        }
      />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar items={navItems} activeItem={activeNav} onSelect={setActiveNav} />

        {/* Main Content */}
        <main className="flex-1 p-8">
          {activeNav === 'overview' && (
            <OverviewSection
              userProfile={userProfile}
              subscription={subscription}
              scores={scores}
              onOpenSubscription={() => navigate('/subscription')}
              onOpenScoreEntry={() => navigate('/score-entry')}
              onOpenDraws={() => navigate('/draws')}
            />
          )}
          {activeNav === 'subscription' && (
            <SubscriptionSection
              subscription={subscription}
              onManageSubscription={() => navigate('/subscription')}
            />
          )}
          {activeNav === 'scores' && (
            <ScoresSection scores={scores} onAddScore={() => navigate('/score-entry')} />
          )}
          {activeNav === 'draws' && (
            <DrawsSection
              currentDraw={currentDraw}
              loading={drawLoading}
              onOpenDraws={() => navigate('/draws')}
            />
          )}
          {activeNav === 'charity' && (
            <CharitySection
              charity={charity}
              onChooseCharity={() => navigate('/charity')}
            />
          )}
          {activeNav === 'settings' && (
            <SettingsSection
              userProfile={userProfile}
              onSignOut={handleSignOut}
              onChangePassword={() => navigate('/change-password')}
            />
          )}
        </main>
      </div>
    </div>
  );
}

/**
 * Overview Section
 */
function OverviewSection({ subscription, scores, onOpenSubscription, onOpenScoreEntry, onOpenDraws }) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-headline-lg font-headline font-bold text-on-surface mb-2">
          Dashboard Overview
        </h1>
        <p className="text-body-md text-on-surface-variant">
          Track your progress, participate in draws, and support charity
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Subscription Status */}
        <Card glow={subscription?.status === 'active'}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-label-sm text-on-surface-variant mb-1">Subscription</p>
              <h3 className="text-headline-md font-headline font-bold text-on-surface">
                {subscription?.plan_type === 'monthly'
                  ? 'Monthly'
                  : subscription?.plan_type === 'yearly'
                  ? 'Yearly'
                  : 'Not Available'}
              </h3>
            </div>
            <Badge
              label={subscription?.status === 'active' ? 'Active' : 'Inactive'}
              variant={subscription?.status === 'active' ? 'success' : 'error'}
            />
          </div>
          <p className="text-label-md text-on-surface-variant">
            {subscription?.renewal_date
              ? `Renews ${new Date(subscription.renewal_date).toLocaleDateString()}`
              : 'Renewal date unavailable'}
          </p>
        </Card>

        {/* Scores */}
        <Card>
          <div className="mb-4">
            <p className="text-label-sm text-on-surface-variant mb-1">Latest Score</p>
            <h3 className="text-headline-md font-headline font-bold text-on-surface">
              {scores?.[0]?.score_value || '—'}
            </h3>
          </div>
          <p className="text-label-md text-on-surface-variant">
            {scores?.length || 0} of 5 scores recorded
          </p>
        </Card>

        {/* Total Winnings */}
        <Card glow>
          <div className="mb-4">
            <p className="text-label-sm text-on-surface-variant mb-1">Total Winnings</p>
            <h3 className="text-headline-md font-headline font-bold text-on-surface">
              $0.00
            </h3>
          </div>
          <p className="text-label-md text-on-surface-variant">
            0 active wins pending
          </p>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card interactive onClick={onOpenSubscription}>
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-headline-sm font-headline font-bold text-on-surface mb-1">
                Subscription
              </h4>
              <p className="text-body-sm text-on-surface-variant">
                Purchase or manage your plan
              </p>
            </div>
            <span className="material-symbols-outlined text-secondary text-2xl">workspace_premium</span>
          </div>
        </Card>

        <Card interactive onClick={onOpenScoreEntry}>
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-headline-sm font-headline font-bold text-on-surface mb-1">
                Add New Score
              </h4>
              <p className="text-body-sm text-on-surface-variant">
                Record your latest round
              </p>
            </div>
            <span className="material-symbols-outlined text-primary text-2xl">arrow_forward</span>
          </div>
        </Card>

        <Card interactive onClick={onOpenDraws}>
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-headline-sm font-headline font-bold text-on-surface mb-1">
                View Draws
              </h4>
              <p className="text-body-sm text-on-surface-variant">
                See this month's winning numbers
              </p>
            </div>
            <span className="material-symbols-outlined text-tertiary text-2xl">arrow_forward</span>
          </div>
        </Card>
      </div>
    </div>
  );
}

/**
 * Scores Section
 */
function ScoresSection({ scores, onAddScore }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-headline-lg font-headline font-bold text-on-surface mb-1">
          Your Golf Scores
        </h2>
        <p className="text-body-md text-on-surface-variant">
          Last 5 rounds in reverse chronological order
        </p>
      </div>

      <div className="space-y-3">
        {scores && scores.length > 0 ? (
          scores.map((score) => (
            <Card key={score.id} interactive className="flex justify-between items-center">
              <div>
                <h4 className="text-headline-sm font-headline font-bold text-on-surface">
                  Score: {score.score_value}
                </h4>
                <p className="text-label-md text-on-surface-variant">
                  {new Date(score.score_date).toLocaleDateString()} • {score.course || 'Unknown Course'}
                </p>
              </div>
              <Badge label={`${score.stableford_points || 0} pts`} variant="primary" />
            </Card>
          ))
        ) : (
          <Card>
            <p className="text-center text-on-surface-variant py-8">
              No scores recorded yet. Add your first score!
            </p>
          </Card>
        )}
      </div>

      <Button variant="primary" size="lg" icon="add" fullWidth onClick={onAddScore}>
        Add New Score
      </Button>
    </div>
  );
}

function SubscriptionSection({ subscription, onManageSubscription }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-headline-lg font-headline font-bold text-on-surface mb-1">
          Subscription
        </h2>
        <p className="text-body-md text-on-surface-variant">
          Purchase Razorpay-backed access before using scores, draws, or charity tools.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card glow={subscription?.status === 'active'}>
          <p className="text-label-sm text-on-surface-variant mb-2">Status</p>
          <h3 className="text-headline-md font-headline font-bold text-on-surface">
            {subscription?.status === 'active' ? 'Active' : 'Not Active'}
          </h3>
        </Card>

        <Card>
          <p className="text-label-sm text-on-surface-variant mb-2">Plan</p>
          <h3 className="text-headline-md font-headline font-bold text-on-surface">
            {subscription?.plan_type === 'monthly'
              ? 'Monthly'
              : subscription?.plan_type === 'yearly'
              ? 'Yearly'
              : 'No Plan'}
          </h3>
        </Card>

        <Card>
          <p className="text-label-sm text-on-surface-variant mb-2">Renewal</p>
          <h3 className="text-headline-md font-headline font-bold text-on-surface">
            {subscription?.renewal_date
              ? new Date(subscription.renewal_date).toLocaleDateString()
              : 'Unavailable'}
          </h3>
        </Card>
      </div>

      <Card className="p-6 bg-surface-container-low">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h4 className="text-headline-sm font-headline font-bold text-on-surface mb-1">
              Manage your plan
            </h4>
            <p className="text-body-sm text-on-surface-variant">
              Open the subscription purchase page to start or change your Razorpay subscription.
            </p>
          </div>
          <Button variant="primary" onClick={onManageSubscription}>
            {subscription?.status === 'active' ? 'Manage Subscription' : 'Purchase Subscription'}
          </Button>
        </div>
      </Card>
    </div>
  );
}

/**
 * Draws Section
 */
function DrawsSection({ currentDraw, loading, onOpenDraws }) {
  const drawLabel = currentDraw
    ? `${currentDraw.month}/${currentDraw.year}`
    : 'Current Draw';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-headline-lg font-headline font-bold text-on-surface mb-1">
          Monthly Draws
        </h2>
        <p className="text-body-md text-on-surface-variant">
          Track your participation and potential winnings
        </p>
      </div>

      <Card glow>
        <div className="mb-6">
          <p className="text-label-sm text-on-surface-variant mb-2">{drawLabel}</p>
          <h3 className="text-headline-md font-headline font-bold text-on-surface mb-4">
            Winning Numbers
          </h3>
          {loading ? (
            <p className="text-body-sm text-on-surface-variant">Loading draw values...</p>
          ) : currentDraw?.hasResults ? (
            <div className="flex gap-3 flex-wrap">
              {currentDraw.numbers.map((num, index) => (
                <div key={`${num}-${index}`} className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-label-md font-bold text-primary">{num}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-body-sm text-on-surface-variant">
              Draw numbers are not published yet.
            </p>
          )}
          {!loading && currentDraw?.status && (
            <p className="text-label-sm text-on-surface-variant mt-3">
              Status: {currentDraw.status}
            </p>
          )}
        </div>

        <ProgressTracker
          label="Prize Pool"
          value={Number(currentDraw?.poolSize || 0)}
          max={Math.max(Number(currentDraw?.poolSize || 0), 5000)}
          displayValue={Number(currentDraw?.poolSize || 0).toLocaleString()}
          displayMax={Math.max(Number(currentDraw?.poolSize || 0), 5000).toLocaleString()}
          type="primary"
        />

        <div className="mt-6">
          <Button variant="secondary" size="sm" onClick={onOpenDraws}>
            Open Full Draw Page
          </Button>
        </div>
      </Card>
    </div>
  );
}

/**
 * Charity Section
 */
function CharitySection({ charity, onChooseCharity }) {
  const charityData = charity?.charity || charity;
  const monthlyContribution = 49.99 * 0.1;
  const roundedMonthlyContribution = Number(monthlyContribution.toFixed(2));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-headline-lg font-headline font-bold text-on-surface mb-1">
          Your Charity Impact
        </h2>
        <p className="text-body-md text-on-surface-variant">
          Track your contributions and support
        </p>
      </div>

      {charityData ? (
        <Card glow>
          <div className="mb-6">
            <h3 className="text-headline-md font-headline font-bold text-on-surface mb-2">
              {charityData.name}
            </h3>
            <p className="text-body-md text-on-surface-variant mb-4">
              {charityData.description}
            </p>
          </div>

          <ProgressTracker
            label="Your Monthly Contribution"
            value={roundedMonthlyContribution}
            max={49.99}
            displayValue={roundedMonthlyContribution.toFixed(2)}
            displayMax={Number(49.99).toFixed(2)}
            type="tertiary"
          />

          <div className="mt-6">
            <Button variant="tertiary" size="lg" fullWidth onClick={onChooseCharity}>
              Update Charity Selection
            </Button>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-4xl text-tertiary mb-4 block">
              favorite
            </span>
            <p className="text-on-surface-variant mb-4">
              Select a charity to support with your subscription
            </p>
            <Button variant="tertiary" size="lg" onClick={onChooseCharity}>
              Choose Charity
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

/**
 * Settings Section
 */
function SettingsSection({ userProfile, onSignOut, onChangePassword }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-headline-lg font-headline font-bold text-on-surface mb-1">
          Settings
        </h2>
        <p className="text-body-md text-on-surface-variant">
          Manage your account and preferences
        </p>
      </div>

      <Card>
        <div className="space-y-6">
          <div>
            <p className="text-label-md text-on-surface-variant mb-2">Full Name</p>
            <p className="text-body-md text-on-surface">{userProfile?.fullName || '—'}</p>
          </div>
          <div>
            <p className="text-label-md text-on-surface-variant mb-2">Email</p>
            <p className="text-body-md text-on-surface">{userProfile?.email || '—'}</p>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        <Button variant="secondary" size="lg" fullWidth onClick={onChangePassword}>
          Change Password
        </Button>
        <Button variant="danger" size="lg" fullWidth onClick={onSignOut}>
          Sign Out
        </Button>
      </div>
    </div>
  );
}
