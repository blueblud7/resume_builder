import { NextRequest, NextResponse } from 'next/server';
import { modifyResumeForJob } from '@/lib/ai/openai';
import { ModifyResumeRequest, ModifyResumeResponse } from '@/types/api';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body: ModifyResumeRequest = await request.json();
    const { resume, jobDescription } = body;

    if (!resume) {
      return NextResponse.json<ModifyResumeResponse>(
        { success: false, error: 'No resume provided' },
        { status: 400 }
      );
    }

    if (!jobDescription || jobDescription.trim().length === 0) {
      return NextResponse.json<ModifyResumeResponse>(
        { success: false, error: 'No job description provided' },
        { status: 400 }
      );
    }

    const modifiedResume = await modifyResumeForJob(resume, jobDescription);

    return NextResponse.json<ModifyResumeResponse>({
      success: true,
      modifiedResume,
    });
  } catch (error) {
    console.error('Modify resume error:', error);
    return NextResponse.json<ModifyResumeResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to modify resume',
      },
      { status: 500 }
    );
  }
}
