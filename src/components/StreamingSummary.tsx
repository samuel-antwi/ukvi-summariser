'use client';

import { useEffect, useRef, useState } from 'react';
import { Citation, VisaSummary } from '@/types';
import { CitationReference } from './CitationReference';

interface StreamingSummaryProps {
  visaRouteId: string;
  basePath: string;
  onComplete: (success: boolean, summary?: VisaSummary, error?: string) => void;
}

export function StreamingSummary({
  visaRouteId,
  basePath,
  onComplete,
}: StreamingSummaryProps) {
  const [streamedText, setStreamedText] = useState<string>('');
  const [parsedCitations, setParsedCitations] = useState<Map<string, Citation>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const startStreaming = async () => {
      try {
        const response = await fetch('/api/summarise?stream=true', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ visaRouteId }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Failed to start streaming');
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error('No reader available');
        }

        let buffer = '';
        let receivedSummary: VisaSummary | undefined;

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'chunk') {
                // Append each chunk to display word-by-word
                setStreamedText(prev => {
                  const newText = prev + data.text;

                  // Parse citations as they appear
                  parseCitationsFromText(newText, setParsedCitations);

                  return newText;
                });
              } else if (data.type === 'summary') {
                receivedSummary = data.data;
              } else if (data.type === 'done') {
                onComplete(true, receivedSummary);
              } else if (data.type === 'error') {
                onComplete(false, undefined, data.message);
              }
            }
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          onComplete(false, undefined, error.message);
        }
      }
    };

    startStreaming();

    return () => {
      controller.abort();
    };
  }, [visaRouteId, onComplete]);

  // Convert markdown headings and make citations clickable
  const formatStreamedText = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Format citations [1], [2], etc. as CitationReference components
      const formatLineWithCitations = (text: string) => {
        const parts = text.split(/(\[\d+\])/g);
        return parts.map((part, j) => {
          const citationMatch = part.match(/\[(\d+)\]/);
          if (citationMatch) {
            const citationId = citationMatch[1];
            const citation = parsedCitations.get(citationId);

            if (citation) {
              return (
                <CitationReference
                  key={j}
                  citation={citation}
                  basePath={basePath}
                />
              );
            }

            // Citation not yet parsed - show placeholder
            return (
              <sup
                key={j}
                className="text-blue-600 font-medium mx-0.5"
              >
                [{citationId}]
              </sup>
            );
          }
          return <span key={j}>{part}</span>;
        });
      };

      if (line.startsWith('## ')) {
        return <h3 key={i} className="text-lg font-bold mt-6 mb-2">{line.replace('## ', '')}</h3>;
      } else if (line.startsWith('- ')) {
        return <li key={i} className="ml-4">{formatLineWithCitations(line.replace('- ', ''))}</li>;
      } else if (line.trim()) {
        return <p key={i} className="mb-2">{formatLineWithCitations(line)}</p>;
      }
      return <br key={i} />;
    });
  };

  return (
    <div className="w-full">
      {/* Streaming text display - word by word like ChatGPT */}
      <div className="p-6 bg-background border border-foreground/10 rounded-lg">
        <div className="text-foreground/90 leading-relaxed">
          {formatStreamedText(streamedText)}
          <span className="inline-block w-0.5 h-5 ml-0.5 bg-blue-500 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// Parse citations from the streamed text as they appear
function parseCitationsFromText(
  text: string,
  setParsedCitations: React.Dispatch<React.SetStateAction<Map<string, Citation>>>
) {
  const citationsMatch = text.match(/\*\*Citations:\*\*\s*\n([\s\S]*)/i);

  if (!citationsMatch) return;

  const citations = new Map<string, Citation>();
  const citationLines = citationsMatch[1].split('\n');

  citationLines.forEach(line => {
    // Match: 1. "quote" | Section: section name
    const match = line.match(/^(\d+)\.\s*"([^"]+)"\s*\|\s*Section:\s*(.+)/);
    if (match) {
      citations.set(match[1], {
        id: match[1],
        quote: match[2],
        section: 'general',
        sectionTitle: match[3].trim(),
      });
    } else {
      // Fallback to simple format
      const simpleMatch = line.match(/^(\d+)\.\s*"([^"]+)"/);
      if (simpleMatch) {
        citations.set(simpleMatch[1], {
          id: simpleMatch[1],
          quote: simpleMatch[2],
          section: 'general',
        });
      }
    }
  });

  setParsedCitations(citations);
}
