/**
 * Parse plain text file
 * @param buffer - Text file buffer
 * @returns Extracted text from file
 */
export async function parseTXT(buffer: Buffer): Promise<string> {
  try {
    return buffer.toString('utf-8');
  } catch (error) {
    console.error('Error parsing TXT:', error);
    throw new Error('Failed to parse TXT file');
  }
}
