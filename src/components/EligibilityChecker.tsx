"use client";

import { useState } from "react";
import { VisaRouteId, EligibilityAnswer, EligibilityAssessment } from "@/types";
import { getEligibilityQuestions } from "@/lib/eligibilityQuestions";

interface EligibilityCheckerProps {
  visaRouteId: VisaRouteId;
  visaName: string;
}

export function EligibilityChecker({
  visaRouteId,
  visaName,
}: EligibilityCheckerProps) {
  const questions = getEligibilityQuestions(visaRouteId);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [assessment, setAssessment] = useState<EligibilityAssessment | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const allQuestionsAnswered = questions.every(
    (q) => answers[q.id] && answers[q.id].trim() !== ""
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!allQuestionsAnswered) {
      setError("Please answer all questions before submitting");
      return;
    }

    setLoading(true);
    setError(null);
    setAssessment(null);

    try {
      const eligibilityAnswers: EligibilityAnswer[] = Object.entries(
        answers
      ).map(([questionId, answer]) => ({
        questionId,
        answer,
      }));

      const response = await fetch("/api/check-eligibility", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          visaRouteId,
          answers: eligibilityAnswers,
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        setAssessment(data.data);
      } else {
        setError(data.error || "Failed to assess eligibility");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setAssessment(null);
    setError(null);
  };

  if (assessment) {
    return (
      <EligibilityResult
        assessment={assessment}
        visaName={visaName}
        onReset={handleReset}
      />
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="border-b border-foreground/10 pb-4">
        <h2 className="text-2xl font-bold mb-2">
          Check Your Eligibility: {visaName}
        </h2>
        <p className="text-foreground/70 text-sm">
          Answer the questions below to get an initial assessment of your
          eligibility. This is not official guidance - always check the full
          requirements on GOV.UK.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {questions.map((question, index) => (
          <div
            key={question.id}
            className="p-4 border border-foreground/10 rounded-lg bg-foreground/[0.02]"
          >
            <label className="block">
              <span className="font-medium text-foreground/90">
                {index + 1}. {question.question}
              </span>
              {question.helpText && (
                <p className="text-xs text-foreground/60 mt-1 mb-3">
                  ℹ️ {question.helpText}
                </p>
              )}

              {question.type === "yes-no" ? (
                <div className="mt-3 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={question.id}
                      value="yes"
                      checked={answers[question.id] === "yes"}
                      onChange={(e) =>
                        handleAnswerChange(question.id, e.target.value)
                      }
                      className="cursor-pointer"
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={question.id}
                      value="no"
                      checked={answers[question.id] === "no"}
                      onChange={(e) =>
                        handleAnswerChange(question.id, e.target.value)
                      }
                      className="cursor-pointer"
                    />
                    <span>No</span>
                  </label>
                </div>
              ) : (
                <select
                  value={answers[question.id] || ""}
                  onChange={(e) =>
                    handleAnswerChange(question.id, e.target.value)
                  }
                  className="mt-3 w-full px-3 py-2 border border-foreground/20 rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/50"
                >
                  <option value="">Select an option...</option>
                  {question.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )}
            </label>
          </div>
        ))}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={!allQuestionsAnswered || loading}
          className="w-full px-6 py-3 bg-[#1D71B8] text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Assessing Eligibility..." : "Check Eligibility"}
        </button>
      </form>
    </div>
  );
}

function EligibilityResult({
  assessment,
  visaName,
  onReset,
}: {
  assessment: EligibilityAssessment;
  visaName: string;
  onReset: () => void;
}) {
  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="border-b border-foreground/10 pb-4">
        <h2 className="text-2xl font-bold mb-2">Eligibility Assessment</h2>
        <p className="text-foreground/70 text-sm">{visaName}</p>
      </div>

      {/* Result Badge */}
      <div
        className={`p-6 rounded-lg border-2 ${
          assessment.eligible
            ? "bg-white border-green-600"
            : "bg-white border-orange-600"
        }`}
      >
        <div className="flex items-start gap-4">
          <div className="text-4xl">{assessment.eligible ? "✅" : "⚠️"}</div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2 text-black ">
              {assessment.eligible
                ? "You may be eligible"
                : "You may not meet all requirements"}
            </h3>
            <p className="text-black ">{assessment.summary}</p>
            <div className="mt-2">
              <span
                className={`inline-block px-3 py-1.5 rounded text-xs font-bold ${
                  assessment.confidence === "high"
                    ? "bg-green-700 text-white"
                    : assessment.confidence === "medium"
                    ? "bg-amber-600 text-white"
                    : "bg-orange-600 text-white"
                }`}
              >
                {assessment.confidence.toUpperCase()} CONFIDENCE
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Reasons */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Assessment Details</h3>
        <ul className="space-y-2">
          {assessment.reasons.map((reason, index) => (
            <li
              key={index}
              className="flex items-start gap-2 text-foreground/90"
            >
              <span className="text-foreground/60 mt-1">•</span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Warnings */}
      {assessment.warnings && assessment.warnings.length > 0 && (
        <div className="p-4 bg-white border-2 border-amber-500 rounded-lg">
          <h3 className="text-lg font-bold mb-3">Important Notes</h3>
          <ul className="space-y-2">
            {assessment.warnings.map((warning, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-black text-sm"
              >
                <span>⚠️</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Next Steps */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Next Steps</h3>
        <ol className="space-y-2">
          {assessment.nextSteps.map((step, index) => (
            <li
              key={index}
              className="flex items-start gap-3 text-foreground/90"
            >
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-foreground/10 flex items-center justify-center text-sm font-medium">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Official Guidance Link */}
      <div className="p-4 bg-white border-2 border-[#1D71B8] rounded-lg">
        <p className="text-sm mb-2 font-medium">
          📋 This is an initial assessment only. Always verify full requirements
          on the official GOV.UK guidance:
        </p>
        <a
          href={assessment.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline text-sm font-bold text-[#115293]"
        >
          View official guidance →
        </a>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onReset}
          className="flex-1 px-6 py-3 border border-foreground/20 text-foreground font-medium rounded-lg hover:bg-foreground/5 transition-colors"
        >
          Check Another Answer Set
        </button>
      </div>
    </div>
  );
}
