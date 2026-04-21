import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Badge, SelectChip } from '../../components';
import { Header } from '../../components';
import apiClient from '../../utils/apiClient';
import { useUser } from '../../context/UserContext';
import { notifyError, notifySuccess } from '../../utils/toast';

/**
 * Philanthropy Page
 * Charity selection and contribution tracking
 */
export default function PhilanthropyPage() {
  const navigate = useNavigate();
  const { selectCharity } = useUser();
  const [charities, setCharities] = useState([]);
  const [selectedCharity, setSelectedCharity] = useState(null);
  const [contributionPercentage, setContributionPercentage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchCharities();
    fetchCurrentSelection();
  }, []);

  const fetchCharities = async () => {
    try {
      const response = await apiClient.get('/charities');
      setCharities(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch charities:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentSelection = async () => {
    try {
      const response = await apiClient.get('/charities/current');
      const selection = response.data?.data;
      if (selection?.charity_id) {
        setSelectedCharity(selection.charity_id);
        setContributionPercentage(selection.contribution_percentage || 10);
      }
    } catch (error) {
      console.error('Failed to fetch current charity selection:', error);
    }
  };

  const handleSelectCharity = (charityId) => {
    setSelectedCharity(charityId);
  };

  const handleConfirmSelection = async () => {
    if (!selectedCharity) return;

    setSaving(true);
    setMessage('');
    try {
      await selectCharity(selectedCharity, contributionPercentage);
      setMessage('Charity selection saved successfully.');
      notifySuccess('Charity selection saved successfully');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to save charity selection';
      setMessage(message);
      notifyError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleViewImpactReport = () => {
    const section = document.getElementById('impact-report');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const calculateMonthlyContribution = () => {
    return (49.99 * contributionPercentage) / 100;
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <Header
        title="Ethereal Ledger"
        actions={(
          <Button variant="secondary" size="sm" onClick={() => navigate('/dashboard')}>
            Back
          </Button>
        )}
      />

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-headline-lg font-headline font-bold text-on-surface mb-2">
            Your Charitable Impact
          </h1>
          <p className="text-body-md text-on-surface-variant">
            Every subscription includes a contribution to your chosen charity. Make a difference while you play.
          </p>
        </div>

        {/* Impact Summary */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card glow>
            <p className="text-label-sm text-on-surface-variant mb-2">Monthly Contribution</p>
            <h3 className="text-headline-md font-headline font-bold text-tertiary">
              ${calculateMonthlyContribution().toFixed(2)}
            </h3>
            <p className="text-label-sm text-on-surface-variant mt-2">
              {contributionPercentage}% of your subscription
            </p>
          </Card>

          <Card>
            <p className="text-label-sm text-on-surface-variant mb-2">Annual Impact</p>
            <h3 className="text-headline-md font-headline font-bold text-on-surface">
              ${(calculateMonthlyContribution() * 12).toFixed(2)}
            </h3>
            <p className="text-label-sm text-on-surface-variant mt-2">
              In yearly contribution
            </p>
          </Card>

          <Card>
            <p className="text-label-sm text-on-surface-variant mb-2">Charities Supported</p>
            <h3 className="text-headline-md font-headline font-bold text-on-surface">
              {charities.length}
            </h3>
            <p className="text-label-sm text-on-surface-variant mt-2">
              Choose one to support
            </p>
          </Card>
        </div>

        {/* Charity Selection */}
        <div className="mb-12">
          <h2 className="text-headline-md font-headline font-bold text-on-surface mb-6">
            Select Your Charity
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-on-surface-variant">Loading charities...</p>
            </div>
          ) : charities.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {charities.map((charity) => (
                <div
                  key={charity.id}
                  onClick={() => handleSelectCharity(charity.id)}
                  className="cursor-pointer"
                >
                  <Card
                    interactive
                    className={`h-full transition-all ${
                      selectedCharity === charity.id
                        ? 'ring-2 ring-primary shadow-glow-primary'
                        : ''
                    }`}
                  >
                    {charity.logo_url && (
                      <img
                        src={charity.logo_url}
                        alt={charity.name}
                        className="w-full h-32 object-cover rounded-lg mb-4"
                      />
                    )}

                    <h4 className="text-headline-sm font-headline font-bold text-on-surface mb-2">
                      {charity.name}
                    </h4>

                    {charity.is_featured && (
                      <Badge label="Featured" variant="primary" size="sm" className="mb-3" />
                    )}

                    <p className="text-body-sm text-on-surface-variant mb-4 line-clamp-2">
                      {charity.description}
                    </p>

                    {charity.website && (
                      <a
                        href={charity.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary text-label-sm hover:underline"
                      >
                        Learn More →
                      </a>
                    )}

                    {selectedCharity === charity.id && (
                      <div className="mt-4 pt-4 border-t border-outline-variant/20">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary">
                            check_circle
                          </span>
                          <p className="text-label-md font-semibold text-primary">
                            Selected
                          </p>
                        </div>
                      </div>
                    )}
                  </Card>
                </div>
              ))}
            </div>
          ) : (
            <Card>
              <p className="text-center text-on-surface-variant py-8">
                No charities available at this time
              </p>
            </Card>
          )}
        </div>

        {/* Contribution Adjustment */}
        {selectedCharity && (
          <Card glow className="p-8 md:p-10 mb-8">
            <h3 className="text-headline-sm font-headline font-bold text-on-surface mb-6">
              Customize Your Contribution
            </h3>

            <div className="space-y-6">
              <div>
                <p className="text-label-md font-semibold text-on-surface mb-4">
                  Contribution Percentage: {contributionPercentage}%
                </p>

                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={contributionPercentage}
                  onChange={(e) => setContributionPercentage(parseInt(e.target.value))}
                  className="w-full h-2 bg-surface-container rounded-full appearance-none cursor-pointer"
                />

                <div className="flex justify-between mt-2">
                  <span className="text-label-sm text-on-surface-variant">Minimum 10%</span>
                  <span className="text-label-sm text-on-surface-variant">Maximum 100%</span>
                </div>
              </div>

              <div className="bg-surface-container-low p-4 rounded-lg">
                <p className="text-label-sm text-on-surface-variant mb-1">
                  Your monthly contribution will be:
                </p>
                <p className="text-headline-md font-bold text-tertiary">
                  ${calculateMonthlyContribution().toFixed(2)}
                </p>
              </div>

              <Button variant="tertiary" size="lg" fullWidth onClick={handleConfirmSelection} disabled={saving}>
                {saving ? 'Saving...' : 'Confirm Selection'}
              </Button>
              {message && (
                <p className="text-label-md text-on-surface-variant">{message}</p>
              )}
            </div>
          </Card>
        )}

        {/* Impact Stories */}
        <Card className="p-8 md:p-10 bg-gradient-to-r from-tertiary/10 via-surface-container to-secondary/10">
          <div id="impact-report" />
          <h3 className="text-headline-md font-headline font-bold text-on-surface mb-4">
            Your Impact Matters
          </h3>
          <p className="text-body-md text-on-surface-variant mb-6">
            Last month, our community contributed over $50,000 to charities worldwide. Together, we're making a real difference.
          </p>
          <Button variant="secondary" onClick={handleViewImpactReport}>
            View Impact Report
          </Button>
        </Card>
      </main>
    </div>
  );
}
