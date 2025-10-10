import Anthropic from "@anthropic-ai/sdk";
import { VisaSummary } from "@/types";
import { SUMMARY_DISCLAIMER } from "./constants";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Generates a structured summary of visa guidance using Claude
 * @param content - The raw text content from GOV.UK
 * @param visaName - The name of the visa route
 * @param sourceUrl - The URL to the original GOV.UK page
 * @param lastUpdated - The last updated date from GOV.UK
 * @param basePath - The GOV.UK base path (e.g., '/standard-visitor')
 * @returns A structured visa summary
 */
export async function summariseVisaGuidance(
  content: string,
  visaName: string,
  sourceUrl: string,
  lastUpdated: string | null,
  basePath: string
): Promise<VisaSummary> {
  const prompt = `You are an expert at analysing UK visa guidance from GOV.UK. Your task is to create a clear, structured summary of the following visa guidance with full source citations.

IMPORTANT INSTRUCTIONS:
- Extract information ONLY from the provided text - do not add information from your training data
- If a section's information is not clearly stated in the text, say "Not specified in the guidance"
- Be concise but accurate - focus on the most important points
- Use bullet points for clarity where appropriate
- Use British English spelling throughout (e.g., "summarise", "organised", "behaviour")

**CRITICAL GROUNDING REQUIREMENT - READ CAREFULLY**:
You MUST ONLY use information that appears in the "Original GOV.UK Content" section below.

DO NOT use:
- Information from your training data
- Information from other GOV.UK pages you know about
- General knowledge about UK visas
- Any facts not explicitly stated in the provided text

Citation rules - CRITICAL:
- After EACH factual claim, add a UNIQUE citation number [1], [2], [3], etc.
- NEVER reuse a citation number - each number can only appear ONCE in the entire summary
- If you write [5] in the text, there MUST be a citation with id: "5" in the citations array
- If information is NOT in the provided text, write "Not specified in the guidance" instead of making a claim
- Citation quotes MUST be:
  * EXACT word-for-word copies from the "Original GOV.UK Content" section below
  * Short and specific (1 sentence or key phrase, max ~80 words)
  * Clean text only (no "..." ellipsis, no [brackets], no formatting)
  * Continuous text from the source (don't skip words or join separate sentences)
- Create as many citations as needed - if you have 15 claims, create 15 citations
- The number of citations in the array MUST match the highest citation number used in the text
- If you cannot find exact text to cite, do not make the claim

EXAMPLE OF CORRECT CITATIONS:
Text: "The fee is £100 [1]. Healthcare surcharge is £624 per year [2]. You need a passport [3]."
Citations array: [
  {"id": "1", "quote": "The fee is £100", "section": "fees", "sectionTitle": "How much it costs"},
  {"id": "2", "quote": "Healthcare surcharge is £624 per year", "section": "fees", "sectionTitle": "How much it costs"},
  {"id": "3", "quote": "You need a passport", "section": "requiredDocuments", "sectionTitle": "Documents you'll need"}
]

VALIDATION CHECKLIST BEFORE RESPONDING:
- Count how many [X] citation markers you used in the text (e.g., [1], [2], [3]...)
- Ensure your citations array has EXACTLY that many entries
- Ensure each citation ID matches a number used in the text
- Ensure no citation number is used more than once in the text

Visa Type: ${visaName}

Original GOV.UK Content:
${content}

Please provide a structured summary with the following sections. Add numbered citations [1], [2] after each MAJOR claim or fact:

IMPORTANT: Keep each section concise (2-4 key points maximum). Only cite factual claims (numbers, requirements, restrictions). Do NOT cite general statements.

1. ELIGIBILITY: List 2-3 core eligibility requirements only. Each requirement should have a citation.

2. PERMITTED_ACTIVITIES: List 2-3 main allowed activities. Cite each one.

3. RESTRICTIONS: List 2-3 key restrictions. Cite each one.

4. LENGTH_OF_STAY: State the duration and any key conditions. Cite the specific duration.

5. REQUIRED_DOCUMENTS: List 3-4 essential documents only. Cite the document requirements.

6. FEES: State the main fee amounts. Cite each fee mentioned.

7. APPLICATION_STEPS: List 4-5 high-level steps. Cite steps that have specific requirements or timelines.

8. CHECKLIST: Generate a concise pre-application checklist (5-8 actionable items) organised by category. These do not need citations.

Format your response as STRICTLY VALID JSON with this exact structure:
{
  "eligibility": "string (with [1], [2] citations)",
  "permittedActivities": "string (with citations)",
  "restrictions": "string (with citations)",
  "lengthOfStay": "string (with citations)",
  "requiredDocuments": "string (with citations)",
  "fees": "string (with citations)",
  "applicationSteps": "string (with citations)",
  "checklist": [
    {
      "category": "eligibility" | "documents" | "financial" | "application",
      "task": "string"
    }
  ],
  "citations": [
    {
      "id": "1",
      "quote": "exact quote from source text",
      "section": "eligibility",
      "sectionTitle": "Overview or Apply for a Standard Visitor visa or Visit on business etc"
    }
  ]
}

IMPORTANT: For each citation, the "sectionTitle" must be the exact heading/part title from the source where you found the quote (e.g., "Overview", "Apply for a Standard Visitor visa", "Visit on business"). This helps users find the quote on the correct GOV.UK sub-page.

CRITICAL JSON FORMATTING RULES:
- Escape all double quotes inside strings with backslash: \\"
- Escape all newlines as \\n (use \\n\\n for paragraph breaks)
- Escape all backslashes as \\\\
- Do NOT include line breaks inside string values
- Ensure all strings are properly closed with matching quotes
- End each array element with a comma except the last one`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 8000, // Significantly increased for comprehensive citations
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Extract JSON from response (Claude might wrap it in markdown code blocks)
    let jsonText = responseText;

    // Remove markdown code blocks if present
    const codeBlockMatch = responseText.match(
      /```(?:json)?\s*([\s\S]*?)\s*```/
    );
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1];
    } else {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }
    }

    if (
      !jsonText ||
      (!jsonText.trim().startsWith("{") && !jsonText.includes("{"))
    ) {
      throw new Error("Failed to parse LLM response as JSON");
    }

    let parsedSummary;
    try {
      parsedSummary = JSON.parse(jsonText);
    } catch (parseError) {
      throw new Error(`JSON parsing failed: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }

    // Process checklist items with unique IDs and completed state
    const checklist =
      parsedSummary.checklist?.map(
        (
          item: { category: string; task: string },
          index: number
        ) => ({
          id: `checklist-${index}`,
          category: item.category,
          task: item.task,
          completed: false,
        })
      ) || [];

    // Process citations
    const citations: Array<{ id: string; quote: string; section: string; sectionTitle?: string }> =
      parsedSummary.citations?.map(
        (citation: { id: string; quote: string; section: string; sectionTitle?: string }) => ({
          id: citation.id,
          quote: citation.quote,
          section: citation.section,
          sectionTitle: citation.sectionTitle,
        })
      ) || [];


    return {
      title: visaName,
      lastUpdated,
      sourceUrl,
      basePath,
      eligibility: parsedSummary.eligibility,
      permittedActivities: parsedSummary.permittedActivities,
      restrictions: parsedSummary.restrictions,
      lengthOfStay: parsedSummary.lengthOfStay,
      requiredDocuments: parsedSummary.requiredDocuments,
      fees: parsedSummary.fees,
      applicationSteps: parsedSummary.applicationSteps,
      disclaimer: SUMMARY_DISCLAIMER,
      checklist,
      citations,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`LLM summarisation failed: ${error.message}`);
    }
    throw new Error("LLM summarisation failed: Unknown error");
  }
}
