'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '@/lib/alertsEngine';
import { Bell, AlertTriangle, Info, CheckCircle, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlertsPanelProps {
  initialAlerts?: Alert[];
}

export default function AlertsPanel({ initialAlerts = [] }: AlertsPanelProps) {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/alerts?limit=10');
      const data = await response.json();
      if (data.success) {
        setAlerts(data.data);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    }
  };

  const markAsRead = async (alertId: string) => {
    try {
      await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markRead', alertId }),
      });
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, read: true } : a));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark alert as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markAllRead' }),
      });
      setAlerts(prev => prev.map(a => ({ ...a, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all alerts as read:', error);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 15000);
    return () => clearInterval(interval);
  }, []);

  const getAlertIcon = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      default:
        return <Info className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'border-l-red-500 bg-red-500/10';
      case 'warning':
        return 'border-l-orange-500 bg-orange-500/10';
      case 'success':
        return 'border-l-green-500 bg-green-500/10';
      default:
        return 'border-l-cyan-500 bg-cyan-500/10';
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('ne-NP', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return timestamp;
    }
  };

  return (
    <Card className="glass-card h-full flex flex-col">
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm text-cyan-400 flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Alerts
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </CardTitle>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <Check className="w-3 h-3" />
              Mark all read
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-2">
        <div className="space-y-2 overflow-y-auto h-[calc(100vh-200px)] scrollbar-thin pr-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={cn(
                'relative p-3 rounded-lg border-l-4 glass transition-all duration-300',
                getSeverityColor(alert.severity),
                !alert.read && 'animate-pulse'
              )}
              onClick={() => !alert.read && markAsRead(alert.id)}
            >
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 mt-0.5">
                  {getAlertIcon(alert.severity)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-white">{alert.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {alert.message}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {alert.source && (
                      <span className="text-xs text-muted-foreground">{alert.source}</span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatTime(alert.timestamp)}
                    </span>
                  </div>
                </div>
                {!alert.read && (
                  <div className="w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0 animate-pulse" />
                )}
              </div>
            </div>
          ))}
          
          {alerts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No alerts yet</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
