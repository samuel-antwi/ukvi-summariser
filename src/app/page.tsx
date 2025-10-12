'use client';

import { useState } from 'react';
import { VisaSelector } from '@/components/VisaSelector';
import { SummaryDisplay } from '@/components/SummaryDisplay';
import { EligibilityChecker } from '@/components/EligibilityChecker';
import { StreamingSummary } from '@/components/StreamingSummary';
import { ErrorDisplay } from '@/components/ErrorDisplay';
import { VisaRouteId, VisaSummary } from '@/types';
import { VISA_ROUTES } from '@/lib/constants';

type ViewMode = 'summary' | 'eligibility';

export default function Home() {
  const [selectedVisa, setSelectedVisa] = useState<VisaRouteId | null>(null);
  const [summary, setSummary] = useState<VisaSummary | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('summary');
  const [streamingVisaId, setStreamingVisaId] = useState<string | null>(null);

  const handleSummarise = async () => {
    if (!selectedVisa) return;

    // Start streaming
    setIsStreaming(true);
    setError(null);
    setSummary(null);
    setStreamingVisaId(selectedVisa);
  };

  const handleStreamComplete = (
    success: boolean,
    summaryData?: VisaSummary,
    errorMessage?: string
  ) => {
    setIsStreaming(false);
    setStreamingVisaId(null);

    if (!success) {
      setError(errorMessage || 'Failed to generate summary');
      return;
    }

    if (summaryData) {
      setSummary(summaryData);
    } else {
      setError('No summary data received');
    }
  };

  const handleRetry = () => {
    setError(null);
    handleSummarise();
  };

  const selectedVisaRoute = VISA_ROUTES.find(
    (route) => route.id === selectedVisa
  );

  return (
    <div className="min-h-screen p-8">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">
          UKVI Entry Guidance Summariser
        </h1>
        <p className="text-foreground/70 mb-8">
          Get clear, concise summaries of UK visa guidance or check your
          eligibility
        </p>

        {/* Visa selector */}
        <div className="mb-6">
          <VisaSelector
            value={selectedVisa}
            onChange={setSelectedVisa}
            disabled={isStreaming}
          />
        </div>

        {/* Mode selector tabs */}
        {selectedVisa && (
          <div className="mb-6 flex gap-2 border-b border-foreground/10">
            <button
              onClick={() => setViewMode('summary')}
              className={`px-4 py-2 font-medium transition-colors ${
                viewMode === 'summary'
                  ? 'border-b-2 border-foreground text-foreground'
                  : 'text-foreground/60 hover:text-foreground'
              }`}
            >
              Get Summary
            </button>
            <button
              onClick={() => setViewMode('eligibility')}
              className={`px-4 py-2 font-medium transition-colors ${
                viewMode === 'eligibility'
                  ? 'border-b-2 border-foreground text-foreground'
                  : 'text-foreground/60 hover:text-foreground'
              }`}
            >
              Check Eligibility
            </button>
          </div>
        )}

        {/* Summary Mode */}
        {selectedVisa && viewMode === 'summary' && (
          <div className="space-y-6">
            <button
              onClick={handleSummarise}
              disabled={!selectedVisa || isStreaming}
              className="w-full px-6 py-3 bg-foreground text-background font-medium rounded-lg hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isStreaming ? 'Generating Summary...' : 'Summarise Guidance'}
            </button>

            {isStreaming && streamingVisaId && selectedVisaRoute && (
              <StreamingSummary
                visaRouteId={streamingVisaId}
                basePath={selectedVisaRoute.path}
                onComplete={handleStreamComplete}
              />
            )}
            {error && <ErrorDisplay message={error} onRetry={handleRetry} />}
            {summary && !isStreaming && <SummaryDisplay summary={summary} />}
          </div>
        )}

        {/* Eligibility Mode */}
        {selectedVisa && viewMode === 'eligibility' && selectedVisaRoute && (
          <EligibilityChecker
            visaRouteId={selectedVisa}
            visaName={selectedVisaRoute.name}
          />
        )}

        {/* No visa selected state */}
        {!selectedVisa && (
          <div className="text-center py-12 text-foreground/60">
            <p>Select a visa type above to get started</p>
          </div>
        )}
      </main>
    </div>
  );
}
