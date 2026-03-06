'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import NepalMap from '@/components/map/nepal-map';
import ElectionCharts from '@/components/charts/election-charts';
import RSSFeed from '@/components/rss-feed/rss-feed';
import AlertsPanel from '@/components/alerts/alerts-panel';
import CandidateTable from '@/components/candidate-table/candidate-table';
import { ElectionResult, PartySummary, getElectionResults } from '@/lib/ratopatiScraper';
import { getLatestNews } from '@/lib/rssFetcher';
import { checkAlerts, generateLiveUpdate, DEFAULT_THRESHOLDS } from '@/lib/alertsEngine';
import { 
  Vote, 
  Users, 
  TrendingUp, 
  RefreshCw, 
  Search,
  Menu,
  X,
  MapPin,
  Bell,
  Newspaper,
  BarChart3
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const PARTY_COLORS: Record<string, string> = {
  'नेपाली कांग्रेस': '#2E7D32',
  'नेपाल कम्युनिष्ट पार्टी (माओवादी केन्द्र)': '#6A1B9A',
  'नेपाल कम्युनिष्ट पार्टी (एमाले)': '#DC143C',
  'जनता समाजवादी पार्टी, नेपाल': '#FF6F00',
  'राष्ट्रीय स्वतन्त्र पार्टी': '#00ACC1',
};

export default function Dashboard() {
  const [results, setResults] = useState<ElectionResult[]>([]);
  const [parties, setParties] = useState<PartySummary[]>([]);
  const [totalSeats, setTotalSeats] = useState(275);
  const [countedSeats, setCountedSeats] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'map' | 'news' | 'alerts'>('all');

  const fetchData = useCallback(async () => {
    try {
      const data = await getElectionResults();
      const news = await getLatestNews(10);
      
      checkAlerts(data.results, data.parties, news, DEFAULT_THRESHOLDS);
      
      setResults(data.results);
      setParties(data.parties);
      setTotalSeats(data.totalSeats);
      setCountedSeats(data.countedSeats);
      setLastUpdated(new Date().toLocaleTimeString('ne-NP'));
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const filteredResults = searchQuery
    ? results.filter(
        (r) =>
          r.candidate.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.constituency.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.party.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : results;

  const leadingParty = parties[0];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 glass border-b border-white/10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-white/10 rounded-lg"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="text-cyan-400">🇳🇵</span>
                  Nepal Election OSINT
                  <span className="text-sm font-normal text-muted-foreground">2082</span>
                </h1>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    Live
                  </span>
                  <span>•</span>
                  <span>{countedSeats}/{totalSeats} seats counted</span>
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4">
              {parties.slice(0, 4).map((party) => (
                <div
                  key={party.partyCode}
                  className="flex items-center gap-2 glass px-3 py-1.5 rounded-lg"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: party.color }}
                  />
                  <span className="text-sm font-medium text-white">{party.partyCode}</span>
                  <span className="text-sm text-cyan-400 font-bold">{party.seats}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-48 bg-white/5 border-white/10"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={fetchData}
                disabled={loading}
                className="relative"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {leadingParty && (
            <div className="mt-3 flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">Leading:</span>
              <span className="font-bold text-white">{leadingParty.party}</span>
              <span className="text-cyan-400 font-bold">{leadingParty.seats} seats</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">
                Updated: {lastUpdated}
              </span>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className={`
            lg:col-span-3 space-y-4
            ${sidebarOpen ? 'block' : 'hidden lg:block'}
          `}>
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-cyan-400 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Party Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {parties.slice(0, 6).map((party, idx) => (
                    <div key={party.partyCode} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-4">{idx + 1}.</span>
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: party.color }}
                      />
                      <span className="text-sm text-white flex-1 truncate">
                        {party.partyCode}
                      </span>
                      <span className="text-sm font-bold text-cyan-400">
                        {party.seats}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="hidden lg:block">
              <ElectionCharts
                parties={parties}
                totalSeats={totalSeats}
                countedSeats={countedSeats}
              />
            </div>
          </aside>

          <div className="lg:col-span-6 space-y-6">
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-cyan-400 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Constituency Map
                </CardTitle>
              </CardHeader>
              <CardContent>
                <NepalMap
                  results={results}
                  parties={parties}
                  onConstituencyClick={(c) => setSearchQuery(c)}
                />
              </CardContent>
            </Card>

            <CandidateTable results={filteredResults} />
          </div>

          <aside className={`
            lg:col-span-3 space-y-4
            ${sidebarOpen ? 'block' : 'hidden lg:block'}
          `}>
            <div className="hidden lg:block">
              <RSSFeed />
            </div>
            <div className="hidden lg:block">
              <AlertsPanel />
            </div>
          </aside>
        </div>

        <div className="lg:hidden mt-6 space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-sm text-cyan-400">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button
                variant={activeTab === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('all')}
              >
                <BarChart3 className="w-4 h-4 mr-1" />
                All
              </Button>
              <Button
                variant={activeTab === 'map' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('map')}
              >
                <MapPin className="w-4 h-4 mr-1" />
                Map
              </Button>
              <Button
                variant={activeTab === 'news' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('news')}
              >
                <Newspaper className="w-4 h-4 mr-1" />
                News
              </Button>
              <Button
                variant={activeTab === 'alerts' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('alerts')}
              >
                <Bell className="w-4 h-4 mr-1" />
                Alerts
              </Button>
            </CardContent>
          </Card>

          {(activeTab === 'news' || activeTab === 'all') && <RSSFeed />}
          {(activeTab === 'alerts' || activeTab === 'all') && <AlertsPanel />}
          {(activeTab === 'map' || activeTab === 'all') && (
            <NepalMap results={results} parties={parties} />
          )}
        </div>
      </main>

      <footer className="border-t border-white/10 mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Nepal Election OSINT Dashboard | निर्वाचन 2082</p>
          <p className="mt-1">Data sourced from election.ratopati.com • RSS feeds from Nepali media</p>
        </div>
      </footer>
    </div>
  );
}
