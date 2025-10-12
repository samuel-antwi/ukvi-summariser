import { NextRequest, NextResponse } from "next/server";
import {
  fetchGovUkContent,
  extractTextContent,
  extractSectionTitles,
  getGovUkUrl,
} from "@/lib/govuk";
import { summariseVisaGuidance } from "@/lib/llm";
import { VISA_ROUTES } from "@/lib/constants";
import { SummariseResponse, VisaRouteId } from "@/types";

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const stream = url.searchParams.get("stream") === "true";

  // If streaming is requested, return a streaming response
  if (stream) {
    return handleStreamingRequest(request);
  }

  // Otherwise, return the standard JSON response
  return handleStandardRequest(request);
}

async function handleStandardRequest(request: NextRequest) {
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

    // Extract text content and section titles
    const textContent = extractTextContent(govUkContent);
    const sectionTitles = extractSectionTitles(govUkContent);

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
      visaRoute.path, // Pass the base path for section-specific URLs
      undefined, // No streaming callback
      sectionTitles // Dynamic section titles from GOV.UK API
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

async function handleStreamingRequest(request: NextRequest) {
  try {
    const body = await request.json();
    const { visaRouteId } = body as { visaRouteId: VisaRouteId };

    // Validate visa route
    const visaRoute = VISA_ROUTES.find((route) => route.id === visaRouteId);
    if (!visaRoute) {
      return NextResponse.json(
        { error: "Invalid visa route selected" },
        { status: 400 }
      );
    }

    // Create a TransformStream for streaming the response
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Start the async process
    (async () => {
      try {
        // Send status update: fetching
        await writer.write(
          encoder.encode(
            `data: ${JSON.stringify({ type: "status", message: "Fetching latest guidance from GOV.UK..." })}\n\n`
          )
        );

        // Fetch content from GOV.UK
        const govUkContent = await fetchGovUkContent(visaRoute.path);
        const textContent = extractTextContent(govUkContent);
        const sectionTitles = extractSectionTitles(govUkContent);
        const sourceUrl = getGovUkUrl(visaRoute.path);
        const lastUpdated = govUkContent.public_updated_at
          ? new Date(govUkContent.public_updated_at).toLocaleDateString(
              "en-GB",
              {
                day: "numeric",
                month: "long",
                year: "numeric",
              }
            )
          : null;

        // Send status update: analysing
        await writer.write(
          encoder.encode(
            `data: ${JSON.stringify({ type: "status", message: "Analysing visa requirements with AI..." })}\n\n`
          )
        );

        // Generate summary with streaming
        const summary = await summariseVisaGuidance(
          textContent,
          visaRoute.name,
          sourceUrl,
          lastUpdated,
          visaRoute.path,
          async (chunk: string) => {
            // Send each chunk as it arrives
            await writer.write(
              encoder.encode(
                `data: ${JSON.stringify({ type: "chunk", text: chunk })}\n\n`
              )
            );
          },
          sectionTitles // Dynamic section titles from GOV.UK API
        );

        // Send the complete summary
        await writer.write(
          encoder.encode(
            `data: ${JSON.stringify({ type: "summary", data: summary })}\n\n`
          )
        );

        // Send completion signal
        await writer.write(
          encoder.encode(
            `data: ${JSON.stringify({ type: "done" })}\n\n`
          )
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred";
        await writer.write(
          encoder.encode(
            `data: ${JSON.stringify({ type: "error", message: errorMessage })}\n\n`
          )
        );
      } finally {
        await writer.close();
      }
    })();

    // Return the streaming response
    return new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
