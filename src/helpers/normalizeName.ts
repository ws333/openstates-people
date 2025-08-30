// Name exceptions for better matching between fax file and legislators file
const nameExceptions: Record<string, { firstName: string; lastName: string }> =
  {
    // Nickname mappings
    'dick durbin': { firstName: 'richard', lastName: 'durbin' },
    'jim risch': { firstName: 'james', lastName: 'risch' },
    'chris coons': { firstName: 'christopher', lastName: 'coons' },
    'bill keating': { firstName: 'william', lastName: 'keating' },
    'bob latta': { firstName: 'robert', lastName: 'latta' },
    'rob wittman': { firstName: 'robert', lastName: 'wittman' },
    'don beyer': { firstName: 'donald', lastName: 'beyer' },
    'mike turner': { firstName: 'michael', lastName: 'turner' },
    'greg steube': { firstName: 'gregory', lastName: 'steube' },
    'jim baird': { firstName: 'james', lastName: 'baird' },
    'joe morelle': { firstName: 'joseph', lastName: 'morelle' },
    'dave joyce': { firstName: 'david', lastName: 'joyce' },

    // Special cases with different name formats
    'amata radewagen': { firstName: 'aumua', lastName: 'radewagen' },
    'g.t. thompson': { firstName: 'glenn', lastName: 'thompson' },
    'kim king-hinds': { firstName: 'kimberlyn', lastName: 'king-hinds' },
  };

/**
 * Normalizes a name by removing middle initials, titles, and extra whitespace
 * for better matching between different name formats
 */
export function normalizeName(name: string): {
  firstName: string;
  lastName: string;
} {
  // Check for exceptions first
  const lowerName = name.toLowerCase().trim();
  if (nameExceptions[lowerName]) {
    return nameExceptions[lowerName];
  }

  // Remove common prefixes and suffixes, and extra whitespace
  const cleaned = name
    .replace(/\b(Jr\.?|Sr\.?|III|II|IV|V)\b/gi, '') // Remove suffixes
    .replace(/\b[A-Z]\.\s*/g, '') // Remove middle initials like "D.", "F."
    .replace(/[,\.]+/g, '') // Remove commas and periods
    .trim()
    .replace(/\s+/g, ' '); // Normalize whitespace

  const parts = cleaned.split(' ').filter((part) => part.length > 0); // Filter out empty parts
  const firstName = parts[0] || '';
  const lastName = parts[parts.length - 1] || '';

  return {
    firstName: firstName.toLowerCase(),
    lastName: lastName.toLowerCase(),
  };
}
