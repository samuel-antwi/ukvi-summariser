/**
 * Reusable prompt templates and components for LLM interactions
 * Centralizes prompt engineering patterns to maintain consistency
 */

/**
 * Common citation rules shared across all prompts
 * This ensures consistent citation behavior in both streaming and non-streaming modes
 */
export const CITATION_RULES = `
Citation rules - CRITICAL:
- After EACH factual claim, add a UNIQUE citation number [1], [2], [3], etc.
- NEVER reuse a citation number - each number can only appear ONCE
- Citation quotes MUST be:
  * EXACT word-for-word copies from the source
  * Short and specific (1 sentence or key phrase, max ~80 words)
  * Clean text only (no "..." ellipsis, no [brackets], no formatting)
- If information is NOT in the provided text, write "Not specified in the guidance"
- For section titles, use ONLY the exact main part titles from the GOV.UK page structure
`.trim();

/**
 * NOTE: Hardcoded section lists temporarily removed for testing.
 * Using dynamic extraction via extractSectionTitles() in govuk.ts
 * to verify it works correctly before adding fallback logic.
 */

/**
 * Grounding instructions to prevent hallucinations
 */
export const GROUNDING_INSTRUCTIONS = `
**CRITICAL GROUNDING**: Extract information ONLY from the provided text below.

DO NOT use:
- Information from your training data
- Information from other GOV.UK pages you know about
- General knowledge about UK visas
`.trim();

/**
 * Builds the citation format section for prompts
 * Kept as a function to allow customization while maintaining consistency
 * @param format - Output format (markdown or json)
 * @param sectionTitles - Array of section titles from GOV.UK API (dynamic extraction)
 */
export function buildCitationFormatInstructions(
  format: 'markdown' | 'json',
  sectionTitles: string[] = []
): string {
  // Use dynamic section titles extracted from GOV.UK API
  const sectionsGuide = sectionTitles.length > 0
    ? `Valid section titles for this page: ${sectionTitles.map(s => `"${s}"`).join(', ')}`
    : 'Use EXACT main part titles found in the source content (e.g., "Overview", "Apply for a [Visa Name] visa")';

  if (format === 'markdown') {
    return `
Then at the end, list all citations in this EXACT format:

---
**Citations:**
1. "exact word-for-word quote from source" | Section: Apply for a Standard Visitor visa
2. "exact word-for-word quote from source" | Section: Overview

**Section title requirements:**
- Use EXACT main part titles from the GOV.UK page (look for "Part X:" in source)
- ${sectionsGuide}
- Fee information is typically in "Apply for a [Visa Name] visa" section
- DO NOT make up section names like "visa-fees" or "costs"
`.trim();
  }

  return `
"citations": [
  {
    "id": "1",
    "quote": "exact quote from source text",
    "section": "eligibility",
    "sectionTitle": "Apply for a Standard Visitor visa"
  }
]

IMPORTANT: "sectionTitle" must be the exact heading/part title from the source.
${sectionsGuide}
`.trim();
}
