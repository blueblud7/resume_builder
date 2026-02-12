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

/**
 * Generate a cover letter based on resume and job description
 */
export async function generateCoverLetter(
  resume: Resume,
  jobDescription: string,
  companyName?: string
): Promise<string> {
  const companyRef = companyName ? `the ${companyName} team` : 'the hiring team';

  const prompt = `You are an expert cover letter writer. Write a professional, compelling cover letter based on the candidate's resume and the target job description.

Guidelines:
- Address to ${companyRef}
- Open with a strong hook that connects the candidate's background to the role
- Highlight 2-3 most relevant experiences/skills from the resume that match the JD
- Show enthusiasm for the specific role and company
- Keep it concise (3-4 paragraphs)
- Use professional but personable tone
- Do NOT fabricate any experience or skills not present in the resume
- Do NOT include placeholder brackets like [Your Name] — use the actual name from the resume
- End with a clear call to action

Candidate Resume:
${JSON.stringify(resume, null, 2)}

Job Description:
${jobDescription}

Write the cover letter as plain text. Do NOT include any markdown formatting.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a professional cover letter writer. Write compelling, tailored cover letters. Return plain text only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const response = completion.choices[0].message.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    return response.trim();
  } catch (error) {
    console.error('Error generating cover letter:', error);
    throw new Error('Failed to generate cover letter with AI');
  }
}
