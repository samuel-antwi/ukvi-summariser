'use client';

import { useState } from 'react';
import { Citation } from '@/types';
import { buildSectionUrl } from '@/lib/sectionMapper';

interface CitationReferenceProps {
  citation: Citation;
  basePath: string; // e.g., '/standard-visitor'
}

export function CitationReference({ citation, basePath }: CitationReferenceProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Build section-specific URL (e.g., /standard-visitor/apply-standard-visitor-visa)
  const verificationUrl = buildSectionUrl(basePath, citation.sectionTitle || null);

  return (
    <span className="relative inline-block">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium mx-0.5 cursor-pointer"
        aria-label={`View citation ${citation.id}`}
      >
        [{citation.id}]
      </button>

      {isExpanded && (
        <>
          {/* Backdrop to close on click */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsExpanded(false)}
          />

          {/* Citation quote tooltip */}
          <div className="absolute z-50 mt-2 w-96 p-4 bg-background border border-foreground/20 rounded-lg shadow-xl left-0">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-semibold text-foreground/70">
                Source Citation [{citation.id}]
              </span>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-foreground/50 hover:text-foreground"
                aria-label="Close citation"
              >
                ✕
              </button>
            </div>
            <blockquote className="text-sm text-foreground/90 italic border-l-2 border-blue-500 pl-3 mb-3">
              &ldquo;{citation.quote}&rdquo;
            </blockquote>

            {/* Verify on GOV.UK button */}
            <div className="pt-2 border-t border-foreground/10">
              <a
                href={verificationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-2 px-3 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded transition-colors"
              >
                <span>View on official GOV.UK page</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
              <p className="text-xs text-foreground/50 mt-1 px-3">
                Opens the relevant GOV.UK section. Use your browser&apos;s find function (Cmd/Ctrl+F) to search for the specific quote if needed.
              </p>
            </div>
          </div>
        </>
      )}
    </span>
  );
}
