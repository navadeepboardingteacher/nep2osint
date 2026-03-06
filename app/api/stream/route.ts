import { NextResponse } from 'next/server';
import { getElectionResults } from '@/lib/ratopatiScraper';
import { getLatestNews } from '@/lib/rssFetcher';
import { checkAlerts, generateLiveUpdate, getAlerts } from '@/lib/alertsEngine';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: string) => {
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };

      const sendUpdate = async (type: string, payload: unknown) => {
        const event = JSON.stringify({
          type,
          timestamp: new Date().toISOString(),
          data: payload,
        });
        sendEvent(event);
      };

      sendUpdate('connected', { message: 'SSE stream connected' });

      let lastResults = null;
      let lastNews = null;
      let lastParties = null;
      let connectionActive = true;

      const cleanup = () => {
        connectionActive = false;
        try {
          controller.close();
        } catch {}
      };

      request.signal.addEventListener('abort', cleanup);

      const pollInterval = setInterval(async () => {
        if (!connectionActive) {
          clearInterval(pollInterval);
          return;
        }

        try {
          const results = await getElectionResults();
          const news = await getLatestNews(5);
          const parties = results.parties;

          const hasResultsChanged = JSON.stringify(results.results) !== JSON.stringify(lastResults);
          const hasNewsChanged = JSON.stringify(news.slice(0, 3)) !== JSON.stringify(lastNews?.slice(0, 3));

          if (hasResultsChanged || hasNewsChanged) {
            if (hasResultsChanged) {
              const alerts = checkAlerts(results.results, parties, news);
              const liveUpdate = generateLiveUpdate(results.results, parties);
              
              await sendUpdate('results', {
                results: results.results,
                parties: parties,
                totalSeats: results.totalSeats,
                countedSeats: results.countedSeats,
              });

              if (alerts.length > 0) {
                await sendUpdate('alerts', { alerts: alerts.slice(0, 5) });
              }

              await sendUpdate('liveUpdate', liveUpdate);
            }

            if (hasNewsChanged) {
              await sendUpdate('news', { items: news.slice(0, 5) });
            }

            lastResults = results.results;
            lastNews = news;
            lastParties = parties;
          }

          const currentAlerts = getAlerts(5, false);
          await sendUpdate('heartbeat', { 
            alerts: currentAlerts,
            timestamp: new Date().toISOString() 
          });

        } catch (error) {
          console.error('SSE poll error:', error);
        }
      }, 30000);

      const heartbeatInterval = setInterval(() => {
        if (!connectionActive) {
          clearInterval(heartbeatInterval);
          return;
        }
        sendEvent(': heartbeat\n\n');
      }, 15000);

      setTimeout(() => {
        clearInterval(pollInterval);
        clearInterval(heartbeatInterval);
        cleanup();
      }, 3600000);
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
