import { Resume } from '@/types/resume';

/**
 * Parse JSON file and validate Resume structure
 * @param buffer - JSON file buffer
 * @returns Validated Resume object
 */
export async function parseJSON(buffer: Buffer): Promise<Resume> {
  try {
    const text = buffer.toString('utf-8');
    const data = JSON.parse(text);

    // Basic validation
    if (!data.personalInfo || !data.personalInfo.name || !data.personalInfo.email) {
      throw new Error('Invalid resume JSON: missing required personalInfo fields');
    }

    if (!Array.isArray(data.experience)) {
      throw new Error('Invalid resume JSON: experience must be an array');
    }

    if (!Array.isArray(data.education)) {
      throw new Error('Invalid resume JSON: education must be an array');
    }

    if (!Array.isArray(data.skills)) {
      throw new Error('Invalid resume JSON: skills must be an array');
    }

    return data as Resume;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON format');
    }
    throw error;
  }
}
