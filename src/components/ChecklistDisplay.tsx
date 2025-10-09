'use client';

import { useState } from 'react';
import { ChecklistItem } from '@/types';

interface ChecklistDisplayProps {
  items: ChecklistItem[];
  visaTitle: string;
  sourceUrl: string;
  lastUpdated: string | null;
}

export function ChecklistDisplay({
  items,
  visaTitle,
  sourceUrl,
  lastUpdated,
}: ChecklistDisplayProps) {
  const [checklistItems, setChecklistItems] = useState(items);

  const toggleItem = (id: string) => {
    setChecklistItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const groupedItems = checklistItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  const categoryLabels = {
    eligibility: 'Eligibility Requirements',
    documents: 'Document Preparation',
    financial: 'Financial Requirements',
    application: 'Application Process',
  };

  const completedCount = checklistItems.filter((item) => item.completed).length;
  const totalCount = checklistItems.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="border-b border-foreground/10 pb-4">
        <h2 className="text-2xl font-bold mb-2">{visaTitle} - Pre-Application Checklist</h2>
        <div className="flex flex-wrap gap-4 text-sm text-foreground/70">
          {lastUpdated && <span>Last updated: {lastUpdated}</span>}
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            View official guidance →
          </a>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-foreground/5 border border-foreground/10 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium">Progress</span>
          <span className="text-sm text-foreground/70">
            {completedCount} / {totalCount} completed
          </span>
        </div>
        <div className="w-full bg-foreground/10 rounded-full h-2.5">
          <div
            className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Checklist by category */}
      <div className="space-y-6">
        {Object.entries(groupedItems).map(([category, categoryItems]) => (
          <div key={category}>
            <h3 className="text-lg font-semibold mb-3">
              {categoryLabels[category as keyof typeof categoryLabels]}
            </h3>
            <div className="space-y-2">
              {categoryItems.map((item) => (
                <label
                  key={item.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-foreground/5 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleItem(item.id)}
                    className="mt-1 h-4 w-4 rounded border-foreground/30 cursor-pointer"
                  />
                  <span
                    className={`flex-1 ${
                      item.completed
                        ? 'line-through text-foreground/50'
                        : 'text-foreground/90'
                    }`}
                  >
                    {item.task}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Note */}
      <div className="mt-8 p-4 bg-foreground/5 border border-foreground/10 rounded-lg">
        <p className="text-sm text-foreground/70 italic">
          This checklist is generated from official guidance and serves as a general guide.
          Always verify requirements on the official GOV.UK page before applying.
        </p>
      </div>
    </div>
  );
}
