import { NextResponse } from 'next/server';
import { getLatestNews, getElectionNews, searchNews } from '@/lib/rssFetcher';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const query = searchParams.get('q');
  const limit = parseInt(searchParams.get('limit') || '20');

  try {
    if (query) {
      const results = searchNews(query);
      return NextResponse.json({ 
        success: true, 
        data: results.slice(0, limit) 
      });
    }

    if (type === 'election') {
      const news = await getElectionNews();
      return NextResponse.json({ 
        success: true, 
        data: news.slice(0, limit) 
      });
    }

    const news = await getLatestNews(limit);
    return NextResponse.json({ 
      success: true, 
      data: news,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('RSS API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch RSS feeds',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, limit } = body;

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query is required' },
        { status: 400 }
      );
    }

    const results = searchNews(query);
    return NextResponse.json({ 
      success: true, 
      data: results.slice(0, limit || 20) 
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
