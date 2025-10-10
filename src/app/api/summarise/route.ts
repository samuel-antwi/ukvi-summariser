import { NextRequest, NextResponse } from "next/server";
import {
  fetchGovUkContent,
  extractTextContent,
  getGovUkUrl,
} from "@/lib/govuk";
import { summariseVisaGuidance } from "@/lib/llm";
import { VISA_ROUTES } from "@/lib/constants";
import { SummariseResponse, VisaRouteId } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { visaRouteId } = body as { visaRouteId: VisaRouteId };

    // Validate visa route
    const visaRoute = VISA_ROUTES.find((route) => route.id === visaRouteId);
    if (!visaRoute) {
      return NextResponse.json<SummariseResponse>(
        {
          success: false,
          error: "Invalid visa route selected",
        },
        { status: 400 }
      );
    }

    // Fetch content from GOV.UK
    const govUkContent = await fetchGovUkContent(visaRoute.path);

    // Extract text content
    const textContent = extractTextContent(govUkContent);

    // Get metadata
    const sourceUrl = getGovUkUrl(visaRoute.path);
    const lastUpdated = govUkContent.public_updated_at
      ? new Date(govUkContent.public_updated_at).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : null;

    // Generate summary using LLM
    const summary = await summariseVisaGuidance(
      textContent,
      visaRoute.name,
      sourceUrl,
      lastUpdated,
      visaRoute.path // Pass the base path for section-specific URLs
    );

    return NextResponse.json<SummariseResponse>({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("Error in /api/summarize:", error);

    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";

    return NextResponse.json<SummariseResponse>(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
