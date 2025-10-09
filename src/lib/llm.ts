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
 * @returns A structured visa summary
 */
export async function summariseVisaGuidance(
  content: string,
  visaName: string,
  sourceUrl: string,
  lastUpdated: string | null
): Promise<VisaSummary> {
  const prompt = `You are an expert at analyzing UK visa guidance from GOV.UK. Your task is to create a clear, structured summary of the following visa guidance.

IMPORTANT INSTRUCTIONS:
- Extract information ONLY from the provided text - do not add information from your training data
- If a section's information is not clearly stated in the text, say "Not specified in the guidance"
- Be concise but accurate - focus on the most important points
- Use bullet points for clarity where appropriate
- Quote specific requirements or conditions when mentioned

Visa Type: ${visaName}

Original GOV.UK Content:
${content}

Please provide a structured summary with the following sections:

1. ELIGIBILITY: Who can apply for this visa? What are the basic eligibility requirements?

2. PERMITTED_ACTIVITIES: What can visa holders do in the UK? (e.g., work, study, business activities)

3. RESTRICTIONS: What are visa holders NOT allowed to do?

4. LENGTH_OF_STAY: How long can someone stay on this visa? Are there any conditions on the duration?

5. REQUIRED_DOCUMENTS: What documents are needed to apply?

6. FEES: What are the visa fees? Include any other costs mentioned (e.g., healthcare surcharge).

7. APPLICATION_STEPS: What are the high-level steps to apply for this visa?

8. CHECKLIST: Generate a concise pre-application checklist (5-10 actionable items) organized by category.

Format your response as valid JSON with this exact structure. IMPORTANT: Escape all newlines as \\n and use \\n\\n for paragraph breaks within string values:
{
  "eligibility": "string",
  "permittedActivities": "string",
  "restrictions": "string",
  "lengthOfStay": "string",
  "requiredDocuments": "string",
  "fees": "string",
  "applicationSteps": "string",
  "checklist": [
    {
      "category": "eligibility" | "documents" | "financial" | "application",
      "task": "string"
    }
  ]
}`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2000,
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
    const codeBlockMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1];
    } else {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }
    }

    if (!jsonText || (!jsonText.trim().startsWith('{') && !jsonText.includes('{'))) {
      throw new Error("Failed to parse LLM response as JSON");
    }

    const parsedSummary = JSON.parse(jsonText);

    // Process checklist items with unique IDs and completed state
    const checklist = parsedSummary.checklist?.map((item: any, index: number) => ({
      id: `checklist-${index}`,
      category: item.category,
      task: item.task,
      completed: false,
    })) || [];

    return {
      title: visaName,
      lastUpdated,
      sourceUrl,
      eligibility: parsedSummary.eligibility,
      permittedActivities: parsedSummary.permittedActivities,
      restrictions: parsedSummary.restrictions,
      lengthOfStay: parsedSummary.lengthOfStay,
      requiredDocuments: parsedSummary.requiredDocuments,
      fees: parsedSummary.fees,
      applicationSteps: parsedSummary.applicationSteps,
      disclaimer: SUMMARY_DISCLAIMER,
      checklist,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`LLM summarisation failed: ${error.message}`);
    }
    throw new Error("LLM summarisation failed: Unknown error");
  }
}
