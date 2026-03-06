import { NextResponse } from 'next/server';
import { getAlerts, markAlertAsRead, markAllAlertsAsRead, clearAlerts, getUnreadCount } from '@/lib/alertsEngine';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const unreadOnly = searchParams.get('unread') === 'true';
  const limit = parseInt(searchParams.get('limit') || '20');

  try {
    const alerts = getAlerts(limit, unreadOnly);
    const unreadCount = getUnreadCount();

    return NextResponse.json({ 
      success: true, 
      data: alerts,
      unreadCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch alerts',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, alertId } = body;

    switch (action) {
      case 'markRead':
        if (alertId) {
          markAlertAsRead(alertId);
          return NextResponse.json({ success: true, message: 'Alert marked as read' });
        }
        break;

      case 'markAllRead':
        markAllAlertsAsRead();
        return NextResponse.json({ success: true, message: 'All alerts marked as read' });

      case 'clear':
        clearAlerts();
        return NextResponse.json({ success: true, message: 'Alerts cleared' });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
