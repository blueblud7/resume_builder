import { NextRequest, NextResponse } from 'next/server';
import { getResume, saveResume, deleteResume } from '@/lib/db';

export async function GET() {
  try {
    const stored = getResume();
    if (!stored) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({
      success: true,
      resume: stored.data,
      updatedAt: stored.updatedAt,
    });
  } catch (error) {
    console.error('Failed to load resume:', error);
    return NextResponse.json({ success: false, error: 'Failed to load resume' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.resume) {
      return NextResponse.json({ success: false, error: 'Resume data is required' }, { status: 400 });
    }
    const stored = saveResume(body.resume, body.label);
    return NextResponse.json({
      success: true,
      updatedAt: stored.updatedAt,
    });
  } catch (error) {
    console.error('Failed to save resume:', error);
    return NextResponse.json({ success: false, error: 'Failed to save resume' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    deleteResume();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete resume:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete resume' }, { status: 500 });
  }
}
