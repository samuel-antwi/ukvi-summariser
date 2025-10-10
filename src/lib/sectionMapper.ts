/**
 * Maps GOV.UK section/part titles to their URL slugs
 * GOV.UK pages often have multiple parts that are accessible via sub-URLs
 * e.g., "Apply for a Standard Visitor visa" -> "/apply-standard-visitor-visa"
 */

/**
 * Converts a GOV.UK section title to a URL slug
 * This is based on GOV.UK's URL structure patterns
 */
export function sectionTitleToSlug(sectionTitle: string): string {
  return sectionTitle
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Builds the full GOV.UK URL for a specific section
 * @param basePath - The base visa route path (e.g., '/standard-visitor')
 * @param sectionTitle - The section title (e.g., 'Apply for a Standard Visitor visa')
 * @returns Full GOV.UK URL to the specific section
 */
export function buildSectionUrl(basePath: string, sectionTitle: string | null): string {
  const baseUrl = `https://www.gov.uk${basePath}`;

  if (!sectionTitle || sectionTitle.toLowerCase() === 'overview') {
    // Overview is the base page
    return baseUrl;
  }

  const slug = getSectionSlug(sectionTitle); // Use known mappings first!
  return `${baseUrl}/${slug}`;
}

/**
 * Known section title patterns for common visa pages
 * This helps with special cases where automated slug generation might fail
 */
export const KNOWN_SECTION_MAPPINGS: Record<string, string> = {
  'Apply for a Standard Visitor visa': 'apply-standard-visitor-visa',
  'Visit on business': 'visit-on-business',
  'Visit to study': 'visit-to-study',
  'Visit as an academic': 'visit-as-an-academic',
  'Visit for a paid engagement or event': 'visit-for-a-paid-engagement-or-event',
  'Visit for medical reasons': 'visit-for-medical-reasons',
  "If you're under 18": 'if-youre-under-18',
  'When you can extend your stay': 'when-you-can-extend-your-stay',
};

/**
 * Gets the URL slug for a section, using known mappings when available
 */
export function getSectionSlug(sectionTitle: string): string {
  return KNOWN_SECTION_MAPPINGS[sectionTitle] || sectionTitleToSlug(sectionTitle);
}
