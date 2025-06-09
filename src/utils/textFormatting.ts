
/**
 * Formats text to proper sentence case
 */
export const toSentenceCase = (text: string): string => {
  if (!text) return '';
  
  // Clean up the text
  const cleaned = text
    .trim()
    .toLowerCase()
    // Remove filler words
    .replace(/\b(um|uh|you know|like|actually)\b/gi, '')
    // Clean up extra spaces
    .replace(/\s+/g, ' ')
    .trim();
  
  // Capitalize first letter
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};

/**
 * Formats a company/client name to proper case
 */
export const toProperCase = (text: string): string => {
  if (!text) return '';
  
  return text
    .trim()
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Cleans and formats description text
 */
export const formatDescription = (text: string): string => {
  if (!text) return '';
  
  // Clean up the text
  let cleaned = text
    .trim()
    // Remove filler words
    .replace(/\b(um|uh|you know|like|actually)\b/gi, '')
    // Clean up extra spaces
    .replace(/\s+/g, ' ')
    // Fix common speech patterns
    .replace(/\bso\s+/gi, '')
    .replace(/\btry and\b/gi, 'try to')
    .trim();
  
  // Capitalize first letter and add period if needed
  if (cleaned) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    if (!cleaned.endsWith('.') && !cleaned.endsWith('!') && !cleaned.endsWith('?')) {
      cleaned += '.';
    }
  }
  
  return cleaned;
};
