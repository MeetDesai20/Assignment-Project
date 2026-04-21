import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useAuth } from '../../context/AuthContext';
import { Button, Card, Input } from '../../components';
import { Header } from '../../components';
import { notifyError, notifySuccess } from '../../utils/toast';

/**
 * Score Entry Page
 * Dedicated page for entering golf scores
 */
export default function ScoreEntryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { scores, addScore } = useUser();
  const [formData, setFormData] = useState({
    scoreValue: '',
    scoreDate: new Date().toISOString().split('T')[0],
    course: '',
    holes: '18',
    stablefordPoints: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await addScore({
        scoreValue: parseInt(formData.scoreValue),
        scoreDate: formData.scoreDate,
        course: formData.course,
        holes: parseInt(formData.holes),
        stablefordPoints: parseInt(formData.stablefordPoints) || 0,
      });

      setSuccess('Score added successfully!');
      notifySuccess('Score added successfully');
      setFormData({
        scoreValue: '',
        scoreDate: new Date().toISOString().split('T')[0],
        course: '',
        holes: '18',
        stablefordPoints: '',
      });

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to add score';
      setError(message);
      notifyError(message);
    } finally {
      setLoading(false);
    }
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

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="md:col-span-2">
            <div className="mb-8">
              <h1 className="text-headline-lg font-headline font-bold text-on-surface mb-2">
                Record Your Score
              </h1>
              <p className="text-body-md text-on-surface-variant">
                Add your latest golf round. We keep your last 5 scores.
              </p>
            </div>

            <Card className="p-8 md:p-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Score Value */}
                <Input
                  type="number"
                  name="scoreValue"
                  label="Score (Stableford)"
                  placeholder="Enter score (1-45)"
                  value={formData.scoreValue}
                  onChange={handleChange}
                  min="1"
                  max="45"
                  required
                  fullWidth
                  icon="numbers"
                />

                {/* Score Date */}
                <Input
                  type="date"
                  name="scoreDate"
                  label="Date of Play"
                  value={formData.scoreDate}
                  onChange={handleChange}
                  required
                  fullWidth
                  icon="calendar_today"
                />

                {/* Course */}
                <Input
                  type="text"
                  name="course"
                  label="Course Name"
                  placeholder="e.g., Pebble Beach Golf Links"
                  value={formData.course}
                  onChange={handleChange}
                  fullWidth
                  icon="location_on"
                />

                {/* Holes */}
                <div>
                  <label className="text-label-md font-semibold text-on-surface mb-2 block">
                    Number of Holes
                  </label>
                  <div className="flex gap-3">
                    {['9', '18'].map((hole) => (
                      <button
                        key={hole}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, holes: hole }))}
                        className={`flex-1 py-3 rounded-full font-semibold transition-smooth ${
                          formData.holes === hole
                            ? 'bg-primary text-on-primary'
                            : 'bg-surface-container text-on-surface border border-outline-variant/30'
                        }`}
                      >
                        {hole} Holes
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stableford Points */}
                <Input
                  type="number"
                  name="stablefordPoints"
                  label="Stableford Points (Optional)"
                  placeholder="Auto-calculated if empty"
                  value={formData.stablefordPoints}
                  onChange={handleChange}
                  min="0"
                  fullWidth
                  icon="trending_up"
                />

                {/* Error Message */}
                {error && (
                  <div className="p-4 bg-error/10 border border-error/30 rounded-lg">
                    <p className="text-error text-label-md">{error}</p>
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="p-4 bg-tertiary/10 border border-tertiary/30 rounded-lg">
                    <p className="text-tertiary text-label-md">{success}</p>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={loading}
                  icon={loading ? undefined : 'check'}
                >
                  {loading ? 'Saving...' : 'Record Score'}
                </Button>
              </form>
            </Card>
          </div>

          {/* Sidebar - Recent Scores */}
          <div className="md:col-span-1">
            <h2 className="text-headline-md font-headline font-bold text-on-surface mb-6">
              Recent Scores
            </h2>

            <div className="space-y-3">
              {scores && scores.length > 0 ? (
                scores.map((score) => (
                  <Card key={score.id} className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-headline-sm font-bold text-on-surface">
                        {score.score_value}
                      </p>
                      <span className="text-label-sm text-on-surface-variant">
                        {score.stableford_points || 0} pts
                      </span>
                    </div>
                    <p className="text-label-sm text-on-surface-variant">
                      {new Date(score.score_date).toLocaleDateString()}
                    </p>
                    {score.course && (
                      <p className="text-label-xs text-on-surface-variant mt-1">
                        {score.course}
                      </p>
                    )}
                  </Card>
                ))
              ) : (
                <Card className="p-4 text-center">
                  <p className="text-on-surface-variant text-label-md">
                    No scores recorded yet
                  </p>
                </Card>
              )}
            </div>

            {/* Info Card */}
            <Card className="mt-6 p-4 bg-primary/10 border border-primary/20">
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-primary flex-shrink-0">
                  info
                </span>
                <div>
                  <p className="text-label-sm font-semibold text-on-surface mb-1">
                    Score Format
                  </p>
                  <p className="text-label-xs text-on-surface-variant">
                    Use Stableford scoring format (1-45 scale)
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
