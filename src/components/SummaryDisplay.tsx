'use client';

import { useState } from 'react';
import { VisaSummary, Citation } from '@/types';
import { CitationReference } from './CitationReference';

interface SummaryDisplayProps {
  summary: VisaSummary;
}

export function SummaryDisplay({ summary }: SummaryDisplayProps) {
  const [showCitationHelper, setShowCitationHelper] = useState(true);

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="border-b border-foreground/10 pb-4">
        <h2 className="text-2xl font-bold mb-2">{summary.title}</h2>
        <div className="flex flex-wrap gap-4 text-sm text-foreground/70 mb-2">
          {summary.lastUpdated && (
            <span>Last updated: {summary.lastUpdated}</span>
          )}
          <a
            href={summary.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            View official guidance →
          </a>
        </div>
        {summary.citations && summary.citations.length > 0 && showCitationHelper && (
          <div className="relative text-xs text-foreground/70 bg-foreground/5 border border-foreground/10 px-3 py-2 rounded">
            <button
              onClick={() => setShowCitationHelper(false)}
              className="absolute top-1.5 right-1.5 text-foreground/40 hover:text-foreground/70 transition-colors"
              aria-label="Dismiss"
            >
              ✕
            </button>
            <span className="font-medium">📎 Grounded summary:</span> All claims in this summary are cited with quotes from the source page. Click any <span className="text-blue-600 dark:text-blue-400">[number]</span> to view the source quote.
          </div>
        )}
      </div>

      {/* Summary sections */}
      <div className="space-y-6">
        <SummarySection
          title="Eligibility"
          content={summary.eligibility}
          citations={summary.citations}
          basePath={summary.basePath}
        />

        <SummarySection
          title="Permitted Activities"
          content={summary.permittedActivities}
          citations={summary.citations}
          basePath={summary.basePath}
        />

        <SummarySection
          title="Restrictions"
          content={summary.restrictions}
          citations={summary.citations}
          basePath={summary.basePath}
        />

        <SummarySection
          title="Length of Stay"
          content={summary.lengthOfStay}
          citations={summary.citations}
          basePath={summary.basePath}
        />

        <SummarySection
          title="Required Documents"
          content={summary.requiredDocuments}
          citations={summary.citations}
          basePath={summary.basePath}
        />

        <SummarySection
          title="Fees"
          content={summary.fees}
          citations={summary.citations}
          basePath={summary.basePath}
        />

        <SummarySection
          title="Application Steps"
          content={summary.applicationSteps}
          citations={summary.citations}
          basePath={summary.basePath}
        />
      </div>

      {/* Disclaimer */}
      <div className="mt-8 p-4 bg-foreground/5 border border-foreground/10 rounded-lg">
        <p className="text-sm text-foreground/70 italic">{summary.disclaimer}</p>
      </div>
    </div>
  );
}

function SummarySection({
  title,
  content,
  citations,
  basePath,
}: {
  title: string;
  content: string;
  citations?: Citation[];
  basePath: string;
}) {
  // Parse content and replace citation markers with interactive components
  const renderContentWithCitations = () => {
    if (!citations || citations.length === 0) {
      return <div className="whitespace-pre-wrap">{content}</div>;
    }

    // Split content by citation markers [1], [2], etc.
    const parts: (string | React.ReactElement)[] = [];
    let lastIndex = 0;
    const citationRegex = /\[(\d+)\]/g;
    let match;

    while ((match = citationRegex.exec(content)) !== null) {
      // Add text before the citation
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index));
      }

      // Find the corresponding citation
      const citationId = match[1];
      const citation = citations.find((c) => c.id === citationId);

      if (citation) {
        parts.push(
          <CitationReference
            key={`citation-${citationId}-${match.index}`}
            citation={citation}
            basePath={basePath}
          />
        );
      } else {
        // If citation not found, just show the marker as plain text
        parts.push(match[0]);
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }

    return (
      <div className="whitespace-pre-wrap">
        {parts.map((part, index) =>
          typeof part === 'string' ? <span key={index}>{part}</span> : part
        )}
      </div>
    );
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div className="text-foreground/90 prose prose-sm max-w-none">
        {renderContentWithCitations()}
      </div>
    </div>
  );
}
