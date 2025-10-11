'use client';

import { useState } from 'react';
import { VisaSelector } from '@/components/VisaSelector';
import { SummaryDisplay } from '@/components/SummaryDisplay';
import { LoadingState } from '@/components/LoadingState';
import { ErrorDisplay } from '@/components/ErrorDisplay';
import { VisaRouteId, VisaSummary } from '@/types';

export default function Home() {
  const [selectedVisa, setSelectedVisa] = useState<VisaRouteId | null>(null);
  const [summary, setSummary] = useState<VisaSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSummarise = async () => {
    if (!selectedVisa) return;

    setLoading(true);
    setError(null);
    setSummary(null);

    try {
      const response = await fetch('/api/summarise', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ visaRouteId: selectedVisa }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        setSummary(data.data);
      } else {
        setError(data.error || 'Failed to generate summary');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    handleSummarise();
  };

  return (
    <div className="min-h-screen p-8">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">
          UKVI Entry Guidance Summariser
        </h1>
        <p className="text-foreground/70 mb-8">
          Get clear, concise summaries of UK visa guidance
        </p>

        {/* Visa selector and submit button */}
        <div className="mb-8 space-y-4">
          <VisaSelector
            value={selectedVisa}
            onChange={setSelectedVisa}
            disabled={loading}
          />

          <button
            onClick={handleSummarise}
            disabled={!selectedVisa || loading}
            className="w-full px-6 py-3 bg-foreground text-background font-medium rounded-lg hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Generating Summary...' : 'Summarise'}
          </button>
        </div>

        {/* Display states */}
        {loading && <LoadingState />}
        {error && <ErrorDisplay message={error} onRetry={handleRetry} />}
        {summary && !loading && <SummaryDisplay summary={summary} />}
      </main>
    </div>
  );
}
