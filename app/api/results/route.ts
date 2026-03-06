import { NextResponse } from 'next/server';
import { getElectionResults, getPartySummary, getConstituencyResults } from '@/lib/ratopatiScraper';

export const dynamic = 'force-dynamic';

const RATE_LIMIT_WINDOW = 60000;
const MAX_REQUESTS = 30;

const requestCounts = new Map<string, { count: number; timestamp: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(ip);
  
  if (!record || now - record.timestamp > RATE_LIMIT_WINDOW) {
    requestCounts.set(ip, { count: 1, timestamp: now });
    return true;
  }
  
  if (record.count >= MAX_REQUESTS) {
    return false;
  }
  
  record.count++;
  return true;
}

function getClientIP(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0] || 
         request.headers.get('x-real-ip') || 
         'unknown';
}

export async function GET(request: Request) {
  const clientIP = getClientIP(request);
  
  if (!checkRateLimit(clientIP)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const query = searchParams.get('q');
  const constituency = searchParams.get('constituency');

  try {
    if (type === 'party') {
      const parties = await getPartySummary();
      return NextResponse.json({ success: true, data: parties });
    }

    if (type === 'constituency' && constituency) {
      const results = await getConstituencyResults(constituency);
      return NextResponse.json({ success: true, data: results });
    }

    const results = await getElectionResults();
    return NextResponse.json({ 
      success: true, 
      data: results,
      cached: false,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch election results',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const clientIP = getClientIP(request);
  
  if (!checkRateLimit(clientIP)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { type, ...params } = body;

    if (type === 'refresh') {
      const results = await getElectionResults();
      return NextResponse.json({ 
        success: true, 
        data: results,
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid request type' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
