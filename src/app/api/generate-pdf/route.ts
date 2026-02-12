import { NextRequest, NextResponse } from 'next/server';
import { generateResumePDF } from '@/lib/pdf/generator';
import { GeneratePDFRequest, GeneratePDFResponse } from '@/types/api';

export async function POST(request: NextRequest) {
  try {
    const body: GeneratePDFRequest = await request.json();
    const { resume } = body;

    if (!resume) {
      return NextResponse.json<GeneratePDFResponse>(
        { success: false, error: 'No resume provided' },
        { status: 400 }
      );
    }

    const pdfDataUri = generateResumePDF(resume);

    return NextResponse.json<GeneratePDFResponse>({
      success: true,
      pdfUrl: pdfDataUri,
    });
  } catch (error) {
    console.error('Generate PDF error:', error);
    return NextResponse.json<GeneratePDFResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate PDF',
      },
      { status: 500 }
    );
  }
}
