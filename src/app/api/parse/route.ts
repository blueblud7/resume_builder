import { NextRequest, NextResponse } from 'next/server';
import { parsePDF } from '@/lib/parsers/pdfParser';
import { parseTXT } from '@/lib/parsers/txtParser';
import { parseJSON } from '@/lib/parsers/jsonParser';
import { structureResume } from '@/lib/ai/openai';
import { ParseResponse } from '@/types/api';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json<ParseResponse>(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size (10MB)
    const maxSize = parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '10485760');
    if (file.size > maxSize) {
      return NextResponse.json<ParseResponse>(
        { success: false, error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileType = file.name.split('.').pop()?.toLowerCase();

    let rawText = '';
    let resume;

    switch (fileType) {
      case 'pdf':
        rawText = await parsePDF(buffer);
        resume = await structureResume(rawText);
        break;

      case 'txt':
        rawText = await parseTXT(buffer);
        resume = await structureResume(rawText);
        break;

      case 'json':
        resume = await parseJSON(buffer);
        rawText = JSON.stringify(resume, null, 2);
        break;

      default:
        return NextResponse.json<ParseResponse>(
          { success: false, error: 'Unsupported file type. Please upload PDF, TXT, or JSON.' },
          { status: 400 }
        );
    }

    return NextResponse.json<ParseResponse>({
      success: true,
      resume,
      rawText,
    });
  } catch (error) {
    console.error('Parse error:', error);
    return NextResponse.json<ParseResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to parse file',
      },
      { status: 500 }
    );
  }
}
