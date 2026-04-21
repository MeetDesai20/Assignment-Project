import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Badge, ProgressTracker } from '../../components';
import { Header } from '../../components';
import apiClient from '../../utils/apiClient';

/**
 * Draws Page
 * Display monthly draw results and user participation
 */
export default function DrawsPage() {
  const navigate = useNavigate();
  const [currentDraw, setCurrentDraw] = useState(null);
  const [loading, setLoading] = useState(true);

  const normalizeResults = (draw) => {
    if (!draw) return [];
    if (Array.isArray(draw.results)) {
      return draw.results.flatMap((entry) => entry.winning_numbers || entry.winningNumbers || []);
    }
    if (Array.isArray(draw.results?.winningNumbers)) {
      return draw.results.winningNumbers;
    }
    if (Array.isArray(draw.results?.winning_numbers)) {
      return draw.results.winning_numbers;
    }
    return [];
  };

  const normalizePrizeBreakdown = (draw) => {
    if (Array.isArray(draw?.results) && draw.results.length > 0) {
      return draw.results.reduce((acc, entry) => {
        const key = String(entry.match_type || entry.matchType || '5');
        acc[key] = {
          count: Number(acc[key]?.count || 0) + 1,
          amount: Number(entry.pool_share || entry.poolShare || 0),
        };
        return acc;
      }, {});
    }

    if (draw?.results?.winningNumbers || draw?.results?.winning_numbers) {
      return {
        5: { count: 1, amount: Number(draw.total_pool || 0) * 0.6 },
        4: { count: 3, amount: Number(draw.total_pool || 0) * 0.3 },
        3: { count: 8, amount: Number(draw.total_pool || 0) * 0.1 },
      };
    }

    return {};
  };

  useEffect(() => {
    const fetchCurrentDraw = async () => {
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
          results = resultsResponse.data?.data ?? [];
        } catch (resultsError) {
          console.error('Failed to load draw results:', resultsError);
        }

        const drawWithResults = {
          ...draw,
          results: results.length > 0 ? results : draw.results,
        };

        const winningNumbers = normalizeResults(drawWithResults);
        const prizeBreakdown = normalizePrizeBreakdown(drawWithResults);

        setCurrentDraw({
          id: draw.id,
          month: draw.draw_month
            ? new Date(draw.draw_year, Number(draw.draw_month) - 1, 1).toLocaleString('en-US', { month: 'long' })
            : new Date(draw.draw_date).toLocaleString('en-US', { month: 'long' }),
          year: draw.draw_year,
          status: draw.status,
          isPublished: draw.is_published,
          numbers: winningNumbers,
          poolSize: Number(draw.total_pool || 0),
          maxPool: Math.max(Number(draw.total_pool || 0), 5000),
          prizes: prizeBreakdown,
          hasResults: winningNumbers.length > 0,
          drawDate: draw.draw_date,
        });
      } catch (error) {
        console.error('Failed to load current draw:', error);
        setCurrentDraw(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentDraw();
  }, []);

  const previousDraws = [];

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <Header
        title="Ethereal Ledger"
        actions={(
          <Button variant="secondary" size="sm" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        )}
      />

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-headline-lg font-headline font-bold text-on-surface mb-2">
            Monthly Draws
          </h1>
          <p className="text-body-md text-on-surface-variant">
            View the current draw status, winning numbers, and prize pool.
          </p>
        </div>

        {/* Current Draw - Hero */}
        <Card glow className="mb-12 p-10 md:p-12 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl" />

          <div className="relative">
            <div className="mb-8">
              <Badge label={currentDraw ? `${currentDraw.month} ${currentDraw.year} Draw` : 'Current Draw'} variant="primary" />
              <h2 className="text-display-md font-headline font-bold text-on-surface mt-4 mb-2">
                {currentDraw?.hasResults ? "This Month's Winning Numbers" : 'Current Draw Status'}
              </h2>
              {currentDraw?.drawDate && (
                <p className="text-label-md text-on-surface-variant">
                  Draw date: {new Date(currentDraw.drawDate).toLocaleDateString()}
                </p>
              )}
              <p className="text-label-md text-on-surface-variant mt-2">
                Status: {currentDraw?.status || 'unknown'}
              </p>
            </div>

            {/* Winning Numbers */}
            {loading ? (
              <p className="text-on-surface-variant mb-12">Loading current draw...</p>
            ) : currentDraw?.hasResults && currentDraw.numbers.length > 0 ? (
              <div className="flex flex-wrap gap-4 mb-12">
                {currentDraw.numbers.map((num) => (
                  <div
                    key={num}
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center"
                  >
                    <span className="text-2xl font-bold text-on-primary">{num}</span>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="mb-12 p-6 bg-surface-container-low">
                <p className="text-body-md text-on-surface-variant">
                  The current draw has not been published yet, or no results are available.
                </p>
              </Card>
            )}

            {/* Pool Progress */}
            <div className="grid md:grid-cols-2 gap-8">
              <ProgressTracker
                label="Prize Pool"
                value={currentDraw?.poolSize || 0}
                max={currentDraw?.maxPool || 5000}
                type="primary"
                showLabel={true}
              />

              <div className="space-y-4">
                <h4 className="text-headline-sm font-headline font-bold text-on-surface">
                  Prize Breakdown
                </h4>
                {Object.entries(currentDraw?.prizes || {}).length > 0 ? (
                  Object.entries(currentDraw.prizes).map(([match, data]) => (
                    <div key={match} className="flex justify-between items-center">
                      <p className="text-body-md text-on-surface">
                        {match}-Number Match ({data.count} winner{data.count !== 1 ? 's' : ''})
                      </p>
                      <Badge
                        label={`$${Number(data.amount || 0).toLocaleString()}`}
                        variant={match === '5' ? 'primary' : match === '4' ? 'secondary' : 'tertiary'}
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-body-md text-on-surface-variant">
                    Prize breakdown will appear after the draw is published.
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Previous Draws */}
        <div>
          <h3 className="text-headline-md font-headline font-bold text-on-surface mb-6">
            Previous Draws
          </h3>

          <Card className="p-6 bg-surface-container-low">
            <p className="text-body-md text-on-surface-variant">
              Previous draw history will appear here once more draws are published.
            </p>
          </Card>
        </div>

        {/* Draw Rules */}
        <Card className="mt-12 p-8 md:p-10 bg-surface-container-low">
          <h3 className="text-headline-md font-headline font-bold text-on-surface mb-4">
            How Draws Work
          </h3>
          <ul className="space-y-3">
            <li className="flex gap-3">
              <span className="material-symbols-outlined text-tertiary flex-shrink-0">
                check_circle
              </span>
              <p className="text-body-md text-on-surface">
                Every active subscriber is automatically entered into the monthly draw
              </p>
            </li>
            <li className="flex gap-3">
              <span className="material-symbols-outlined text-tertiary flex-shrink-0">
                check_circle
              </span>
              <p className="text-body-md text-on-surface">
                Winners are determined by matching your last 5 golf scores against the draw numbers
              </p>
            </li>
            <li className="flex gap-3">
              <span className="material-symbols-outlined text-tertiary flex-shrink-0">
                check_circle
              </span>
              <p className="text-body-md text-on-surface">
                Draws are published on the last day of each month
              </p>
            </li>
            <li className="flex gap-3">
              <span className="material-symbols-outlined text-tertiary flex-shrink-0">
                check_circle
              </span>
              <p className="text-body-md text-on-surface">
                Winners must submit proof and verification within 30 days
              </p>
            </li>
          </ul>
        </Card>
      </main>
    </div>
  );
}
