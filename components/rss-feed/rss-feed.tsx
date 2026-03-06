'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NewsItem } from '@/lib/rssFetcher';
import { ExternalLink, RefreshCw, Rss } from 'lucide-react';

interface RSSFeedProps {
  initialNews?: NewsItem[];
}

export default function RSSFeed({ initialNews = [] }: RSSFeedProps) {
  const [news, setNews] = useState<NewsItem[]>(initialNews);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchNews = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/rss?limit=15');
      const data = await response.json();
      if (data.success) {
        setNews(data.data);
        setLastUpdated(new Date().toLocaleTimeString('ne-NP'));
      }
    } catch (error) {
      console.error('Failed to fetch news:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / 60000);
      
      if (minutes < 1) return 'Just now';
      if (minutes < 60) return `${minutes}m ago`;
      
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      
      return date.toLocaleDateString('ne-NP');
    } catch {
      return dateString;
    }
  };

  const getSourceColor = (source: string) => {
    const colors: Record<string, string> = {
      Ratopati: 'text-red-400',
      Setopati: 'text-blue-400',
      OnlineKhabar: 'text-orange-400',
      Kantipur: 'text-yellow-400',
      AnnapurnaPost: 'text-green-400',
      NepalPress: 'text-purple-400',
    };
    return colors[source] || 'text-gray-400';
  };

  return (
    <Card className="glass-card h-full flex flex-col">
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm text-cyan-400 flex items-center gap-2">
            <Rss className="w-4 h-4" />
            Breaking News
          </CardTitle>
          <button
            onClick={fetchNews}
            disabled={loading}
            className="p-1 rounded hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        {lastUpdated && (
          <p className="text-xs text-muted-foreground">Updated: {lastUpdated}</p>
        )}
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-2">
        <div className="space-y-2 overflow-y-auto h-[calc(100vh-280px)] scrollbar-thin pr-2">
          {news.map((item, index) => (
            <a
              key={item.id || index}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <div className="glass-card p-3 rounded-lg hover:bg-white/10 transition-all duration-200 group-hover:border-cyan-500/30">
                <div className="flex items-start gap-2">
                  <span className="text-lg flex-shrink-0">{item.sourceIcon}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm text-white line-clamp-2 group-hover:text-cyan-300 transition-colors">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs ${getSourceColor(item.source)}`}>
                        {item.source}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(item.isoDate)}
                      </span>
                    </div>
                  </div>
                  <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
                </div>
              </div>
            </a>
          ))}
          
          {news.length === 0 && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              <Rss className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No news available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
