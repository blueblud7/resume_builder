import { NextRequest, NextResponse } from 'next/server';
import { getHistory, getHistoryEntry, deleteHistoryEntry, clearHistory } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single entry with full data
    if (id) {
      const entry = getHistoryEntry(Number(id));
      if (!entry) {
        return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, entry });
    }

    // List (without resume data for performance)
    const history = getHistory();
    return NextResponse.json({ success: true, history });
  } catch (error) {
    console.error('Failed to load history:', error);
    return NextResponse.json({ success: false, error: 'Failed to load history' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      deleteHistoryEntry(Number(id));
    } else {
      clearHistory();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete history:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete history' }, { status: 500 });
  }
}
