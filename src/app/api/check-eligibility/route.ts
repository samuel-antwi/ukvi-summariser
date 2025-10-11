import { NextRequest, NextResponse } from 'next/server';
import {
  fetchGovUkContent,
  extractTextContent,
  getGovUkUrl,
} from '@/lib/govuk';
import { assessEligibility } from '@/lib/llm';
import { VISA_ROUTES } from '@/lib/constants';
import { getEligibilityQuestions } from '@/lib/eligibilityQuestions';
import {
  EligibilityCheckResponse,
  EligibilityCheckRequest,
} from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as EligibilityCheckRequest;
    const { visaRouteId, answers } = body;

    // Validate visa route
    const visaRoute = VISA_ROUTES.find((route) => route.id === visaRouteId);
    if (!visaRoute) {
      return NextResponse.json<EligibilityCheckResponse>(
        {
          success: false,
          error: 'Invalid visa route selected',
        },
        { status: 400 }
      );
    }

    // Get questions for this visa type
    const questions = getEligibilityQuestions(visaRouteId);

    // Validate that all questions are answered
    const answeredQuestionIds = new Set(answers.map((a) => a.questionId));
    const allQuestionsAnswered = questions.every((q) =>
      answeredQuestionIds.has(q.id)
    );

    if (!allQuestionsAnswered) {
      return NextResponse.json<EligibilityCheckResponse>(
        {
          success: false,
          error: 'All questions must be answered',
        },
        { status: 400 }
      );
    }

    // Fetch GOV.UK content for reference
    const govUkContent = await fetchGovUkContent(visaRoute.path);
    const textContent = extractTextContent(govUkContent);
    const sourceUrl = getGovUkUrl(visaRoute.path);

    // Use LLM to assess eligibility
    const assessment = await assessEligibility(
      textContent,
      visaRoute.name,
      questions,
      answers,
      sourceUrl
    );

    return NextResponse.json<EligibilityCheckResponse>({
      success: true,
      data: assessment,
    });
  } catch (error) {
    console.error('Error in /api/check-eligibility:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred';

    return NextResponse.json<EligibilityCheckResponse>(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
