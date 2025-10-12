import { GovUkContentResponse } from '@/types';
import { GOV_UK_API_BASE, GOV_UK_BASE_URL } from './constants';

/**
 * Fetches visa guidance content from GOV.UK Content API
 * @param path - The visa route path (e.g., '/standard-visitor')
 * @returns The content response from GOV.UK API
 * @throws Error if the fetch fails or returns non-200 status
 */
export async function fetchGovUkContent(
  path: string
): Promise<GovUkContentResponse> {
  const url = `${GOV_UK_API_BASE}${path}`;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
      // Cache for 1 hour to reduce API calls during development
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(
        `GOV.UK API returned ${response.status}: ${response.statusText}`
      );
    }

    const data: GovUkContentResponse = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch GOV.UK content: ${error.message}`);
    }
    throw new Error('Failed to fetch GOV.UK content: Unknown error');
  }
}

/**
 * Extracts text content from GOV.UK API response
 * Handles both single-page content and multi-part guides
 * @param content - The GOV.UK content response
 * @returns Extracted text content
 */
export function extractTextContent(content: GovUkContentResponse): string {
  const parts: string[] = [];

  // Add title and description
  parts.push(`# ${content.title}`);
  if (content.description) {
    parts.push(content.description);
  }

  // Extract body content
  if (content.details?.body) {
    parts.push(content.details.body);
  }

  // Handle multi-part guides (some visa pages have multiple sections)
  if (content.details?.parts && content.details.parts.length > 0) {
    content.details.parts.forEach((part) => {
      parts.push(`## ${part.title}`);
      parts.push(part.body);
    });
  }

  return parts.join('\n\n');
}

/**
 * Extracts section titles from GOV.UK API response
 * These titles are used to guide the LLM on valid section names for citations
 * @param content - The GOV.UK content response
 * @returns Array of section titles from the page
 */
export function extractSectionTitles(content: GovUkContentResponse): string[] {
  const titles: string[] = ['Overview']; // Overview is always the base page

  // Extract titles from multi-part guides
  if (content.details?.parts && content.details.parts.length > 0) {
    content.details.parts.forEach((part) => {
      if (part.title && part.title !== 'Overview') {
        titles.push(part.title);
      }
    });
  }

  return titles;
}

/**
 * Gets the full GOV.UK URL for a visa route
 * @param path - The visa route path
 * @returns The full URL to the GOV.UK page
 */
export function getGovUkUrl(path: string): string {
  return `${GOV_UK_BASE_URL}${path}`;
}
