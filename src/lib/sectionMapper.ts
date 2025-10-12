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
 * @param sectionMappings - Optional mapping of section titles to actual GOV.UK slugs
 * @returns Full GOV.UK URL to the specific section
 *
 * NOTE: Uses actual slugs from GOV.UK API when available via sectionMappings.
 * Falls back to automatic slug generation if mappings not provided (for backward compatibility).
 */
export function buildSectionUrl(
  basePath: string,
  sectionTitle: string | null,
  sectionMappings?: Record<string, string>
): string {
  const baseUrl = `https://www.gov.uk${basePath}`;

  if (!sectionTitle || sectionTitle.toLowerCase() === 'overview') {
    // Overview is the base page
    return baseUrl;
  }

  // Use actual slug from GOV.UK API if available
  const slug = sectionMappings?.[sectionTitle] || sectionTitleToSlug(sectionTitle);
  return `${baseUrl}/${slug}`;
}
