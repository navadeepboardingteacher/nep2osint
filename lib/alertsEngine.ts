import { ElectionResult, PartySummary } from './ratopatiScraper';
import { NewsItem } from './rssFetcher';

export interface Alert {
  id: string;
  type: 'vote_lead_change' | 'new_news' | 'threshold_breach' | 'seat_projection' | 'live_update';
  severity: 'info' | 'warning' | 'critical' | 'success';
  title: string;
  message: string;
  timestamp: string;
  source?: string;
  metadata?: Record<string, unknown>;
  read: boolean;
}

export interface AlertThresholds {
  voteMarginThreshold: number;
  seatProjectionThreshold: number;
  newsKeywords: string[];
}

const DEFAULT_THRESHOLDS: AlertThresholds = {
  voteMarginThreshold: 1000,
  seatProjectionThreshold: 5,
  newsKeywords: ['निर्वाचन', 'मतगणना', 'election', 'vote', 'परिणाम'],
};

let previousResults: ElectionResult[] = [];
let previousParties: PartySummary[] = [];
let previousNews: NewsItem[] = [];
let alerts: Alert[] = [];
const MAX_ALERTS = 50;

function generateAlertId(): string {
  return `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function createAlert(
  type: Alert['type'],
  severity: Alert['severity'],
  title: string,
  message: string,
  source?: string,
  metadata?: Record<string, unknown>
): Alert {
  const alert: Alert = {
    id: generateAlertId(),
    type,
    severity,
    title,
    message,
    timestamp: new Date().toISOString(),
    source,
    metadata,
    read: false,
  };

  alerts.unshift(alert);
  
  if (alerts.length > MAX_ALERTS) {
    alerts = alerts.slice(0, MAX_ALERTS);
  }

  return alert;
}

export function analyzeVoteChanges(
  currentResults: ElectionResult[],
  thresholds: AlertThresholds = DEFAULT_THRESHOLDS
): Alert[] {
  const newAlerts: Alert[] = [];

  currentResults.forEach((current) => {
    const previous = previousResults.find(
      p => p.constituency === current.constituency && p.candidate === current.candidate
    );

    if (previous) {
      if (previous.isLeading !== current.isLeading) {
        createAlert(
          'vote_lead_change',
          'warning',
          `नयाँ अगाडि : ${current.candidate}`,
          `${current.constituencyName} मा ${current.candidate} ले ${previous.isLeading ? 'अगाडि' : 'पछाडि'}बाट ${current.isLeading ? 'अगाडि' : 'पछाडि'} आए`,
          'Election Data',
          { constituency: current.constituency, candidate: current.candidate }
        );
        newAlerts.push(alerts[0]);
      }

      if (current.isLeading) {
        const voteDiff = Math.abs(current.votes - (previous.votes || 0));
        if (voteDiff >= thresholds.voteMarginThreshold) {
          createAlert(
            'threshold_breach',
            'info',
            `मत अंतर : ${current.candidate}`,
            `${current.constituencyName} मा ${current.candidate} ले ${voteDiff.toLocaleString()} मतको अंतर बनाए`,
            'Election Data',
            { margin: voteDiff, constituency: current.constituency }
          );
          newAlerts.push(alerts[0]);
        }
      }
    }
  });

  previousResults = [...currentResults];
  return newAlerts;
}

export function analyzePartyChanges(
  currentParties: PartySummary[],
  thresholds: AlertThresholds = DEFAULT_THRESHOLDS
): Alert[] {
  const newAlerts: Alert[] = [];

  if (previousParties.length === 0) {
    previousParties = [...currentParties];
    return newAlerts;
  }

  currentParties.forEach((current) => {
    const previous = previousParties.find(p => p.partyCode === current.partyCode);
    
    if (previous) {
      const seatDiff = current.seats - previous.seats;
      
      if (seatDiff !== 0) {
        const direction = seatDiff > 0 ? 'बढे' : 'घटे';
        createAlert(
          'seat_projection',
          seatDiff >= thresholds.seatProjectionThreshold ? 'critical' : 'info',
          `स्थान : ${current.partyCode}`,
          `${current.party} को स्थान ${Math.abs(seatDiff)} ले ${direction}र ${current.seats} पुग्यो`,
          'Election Data',
          { party: current.party, seats: current.seats, change: seatDiff }
        );
        newAlerts.push(alerts[0]);
      }
    }
  });

  previousParties = [...currentParties];
  return newAlerts;
}

export function analyzeNews(
  currentNews: NewsItem[],
  thresholds: AlertThresholds = DEFAULT_THRESHOLDS
): Alert[] {
  const newAlerts: Alert[] = [];

  if (previousNews.length === 0) {
    previousNews = [...currentNews.slice(0, 10)];
    return newAlerts;
  }

  const newItems = currentNews.filter(
    news => !previousNews.some(prev => prev.id === news.id)
  );

  newItems.forEach((news) => {
    const isElectionNews = thresholds.newsKeywords.some(
      keyword => news.title.toLowerCase().includes(keyword.toLowerCase())
    );

    if (isElectionNews) {
      createAlert(
        'new_news',
        'info',
        `समाचार : ${news.source}`,
        news.title,
        news.source,
        { link: news.link }
      );
      newAlerts.push(alerts[0]);
    }
  });

  previousNews = [...currentNews.slice(0, 10)];
  return newAlerts;
}

export function generateLiveUpdate(
  results: ElectionResult[],
  parties: PartySummary[]
): Alert {
  const leadingParty = parties[0];
  const totalCounted = results.filter(r => r.isLeading).length;
  const totalSeats = 275;
  
  return createAlert(
    'live_update',
    'success',
    'लाइभ अपडेट',
    `${totalCounted}/${totalSeats} स्थानको मतगणना भइसकेको छ। ${leadingParty?.party || 'N/A'} ${leadingParty?.seats || 0} स्थानमा अगाडि छ।`,
    'System',
    { counted: totalCounted, total: totalSeats, leadingParty }
  );
}

export function checkAlerts(
  results: ElectionResult[],
  parties: PartySummary[],
  news: NewsItem[],
  thresholds?: AlertThresholds
): Alert[] {
  const allAlerts: Alert[] = [];

  allAlerts.push(...analyzeVoteChanges(results, thresholds));
  allAlerts.push(...analyzePartyChanges(parties, thresholds));
  allAlerts.push(...analyzeNews(news, thresholds));

  return allAlerts;
}

export function getAlerts(limit: number = 20, unreadOnly: boolean = false): Alert[] {
  if (unreadOnly) {
    return alerts.filter(a => !a.read).slice(0, limit);
  }
  return alerts.slice(0, limit);
}

export function markAlertAsRead(alertId: string): void {
  const alert = alerts.find(a => a.id === alertId);
  if (alert) {
    alert.read = true;
  }
}

export function markAllAlertsAsRead(): void {
  alerts.forEach(alert => {
    alert.read = true;
  });
}

export function clearAlerts(): void {
  alerts = [];
}

export function getUnreadCount(): number {
  return alerts.filter(a => !a.read).length;
}

export { DEFAULT_THRESHOLDS };
