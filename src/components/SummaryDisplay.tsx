import { VisaSummary } from '@/types';

interface SummaryDisplayProps {
  summary: VisaSummary;
}

export function SummaryDisplay({ summary }: SummaryDisplayProps) {
  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="border-b border-foreground/10 pb-4">
        <h2 className="text-2xl font-bold mb-2">{summary.title}</h2>
        <div className="flex flex-wrap gap-4 text-sm text-foreground/70">
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
      </div>

      {/* Summary sections */}
      <div className="space-y-6">
        <SummarySection title="Eligibility" content={summary.eligibility} />

        <SummarySection
          title="Permitted Activities"
          content={summary.permittedActivities}
        />

        <SummarySection title="Restrictions" content={summary.restrictions} />

        <SummarySection
          title="Length of Stay"
          content={summary.lengthOfStay}
        />

        <SummarySection
          title="Required Documents"
          content={summary.requiredDocuments}
        />

        <SummarySection title="Fees" content={summary.fees} />

        <SummarySection
          title="Application Steps"
          content={summary.applicationSteps}
        />
      </div>

      {/* Disclaimer */}
      <div className="mt-8 p-4 bg-foreground/5 border border-foreground/10 rounded-lg">
        <p className="text-sm text-foreground/70 italic">{summary.disclaimer}</p>
      </div>
    </div>
  );
}

function SummarySection({ title, content }: { title: string; content: string }) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div className="text-foreground/90 prose prose-sm max-w-none whitespace-pre-wrap">
        {content}
      </div>
    </div>
  );
}
