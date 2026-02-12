import { NextRequest, NextResponse } from 'next/server';
import { generateCoverLetter } from '@/lib/ai/openai';
import { GenerateCoverLetterRequest, GenerateCoverLetterResponse } from '@/types/api';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body: GenerateCoverLetterRequest = await request.json();
    const { resume, jobDescription, companyName } = body;

    if (!resume) {
      return NextResponse.json<GenerateCoverLetterResponse>(
        { success: false, error: 'No resume provided' },
        { status: 400 }
      );
    }

    if (!jobDescription || jobDescription.trim().length === 0) {
      return NextResponse.json<GenerateCoverLetterResponse>(
        { success: false, error: 'No job description provided' },
        { status: 400 }
      );
    }

    const coverLetter = await generateCoverLetter(resume, jobDescription, companyName);

    return NextResponse.json<GenerateCoverLetterResponse>({
      success: true,
      coverLetter,
    });
  } catch (error) {
    console.error('Generate cover letter error:', error);
    return NextResponse.json<GenerateCoverLetterResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate cover letter',
      },
      { status: 500 }
    );
  }
}
