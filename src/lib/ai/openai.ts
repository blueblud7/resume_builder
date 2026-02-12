import OpenAI from 'openai';
import { Resume } from '@/types/resume';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Convert unstructured resume text to structured Resume JSON
 */
export async function structureResume(rawText: string): Promise<Resume> {
  console.log('Starting resume structuring, text length:', rawText.length);

  const prompt = `You are a resume parsing expert. Convert the following resume text into a structured JSON format.

Return a JSON object matching this TypeScript interface:

interface Resume {
  personalInfo: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    linkedin?: string;
  };
  summary?: string;
  experience: {
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string[];
  }[];
  education: {
    institution: string;
    degree: string;
    field: string;
    graduationDate: string;
  }[];
  skills: string[];
  certifications?: {
    name: string;
    issuer: string;
    date: string;
  }[];
  projects?: {
    name: string;
    description: string;
    technologies: string[];
  }[];
}

Resume text:
${rawText}

Return ONLY valid JSON, no other text or markdown formatting.`;

  try {
    console.log('Calling OpenAI API for resume structuring...');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that converts resumes to structured JSON format. Always return valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 4000,
    });

    console.log('OpenAI API response received');

    const response = completion.choices[0].message.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Remove markdown code blocks if present
    let jsonText = response.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    console.log('Parsing JSON response...');
    const resume = JSON.parse(jsonText);
    console.log('Resume structured successfully');
    return resume as Resume;
  } catch (error) {
    console.error('Error structuring resume:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to structure resume: ${error.message}`);
    }
    throw new Error('Failed to structure resume with AI');
  }
}

/**
 * Modify resume to align with job description
 */
export async function modifyResumeForJob(
  resume: Resume,
  jobDescription: string
): Promise<Resume> {
  const prompt = `You are an expert resume writer. Modify the following resume to better align with the job description.

Guidelines:
- Maintain factual accuracy (do not fabricate experience)
- Highlight relevant skills and experiences
- Optimize keyword matching with JD
- Reorder sections to emphasize relevance
- Adjust summary/objective to match role
- Keep all dates, company names, and education exactly as provided
- Only rephrase descriptions to better match the job requirements

Current Resume (JSON):
${JSON.stringify(resume, null, 2)}

Job Description:
${jobDescription}

Return the modified resume as JSON with the same structure. Return ONLY valid JSON, no other text or markdown formatting.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a professional resume writer that optimizes resumes for job applications. Always return valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 4000,
    });

    const response = completion.choices[0].message.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Remove markdown code blocks if present
    let jsonText = response.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    const modifiedResume = JSON.parse(jsonText);
    return modifiedResume as Resume;
  } catch (error) {
    console.error('Error modifying resume:', error);
    throw new Error('Failed to modify resume with AI');
  }
}
