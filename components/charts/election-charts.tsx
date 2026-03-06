'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PartySummary } from '@/lib/ratopatiScraper';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';

interface ElectionChartsProps {
  parties: PartySummary[];
  totalSeats: number;
  countedSeats: number;
}

const COLORS = ['#DC143C', '#2E7D32', '#6A1B9A', '#FF6F00', '#00ACC1', '#1565C0', '#FFB300', '#9E9E9E'];

export function PartySeatChart({ parties }: { parties: PartySummary[] }) {
  const data = parties.slice(0, 8).map((p) => ({
    name: p.partyCode,
    seats: p.seats,
    votes: p.totalVotes,
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} layout="vertical" margin={{ left: 10, right: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis type="number" stroke="#94a3b8" />
        <YAxis dataKey="name" type="category" width={40} stroke="#94a3b8" />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
          }}
          labelStyle={{ color: '#fff' }}
        />
        <Bar dataKey="seats" fill="#06b6d4" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function PartyVotePieChart({ parties }: { parties: PartySummary[] }) {
  const data = parties.slice(0, 6).map((p) => ({
    name: p.partyCode,
    value: p.totalVotes,
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={2}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function SeatProgressChart({ totalSeats, countedSeats }: { totalSeats: number; countedSeats: number }) {
  const progress = (countedSeats / totalSeats) * 100;
  const remaining = totalSeats - countedSeats;

  const data = [
    { name: 'Counted', value: countedSeats },
    { name: 'Remaining', value: remaining },
  ];

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorCounted" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis dataKey="name" stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
          }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#06b6d4"
          fillOpacity={1}
          fill="url(#colorCounted)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function VotingTrendsChart() {
  const hours = Array.from({ length: 12 }, (_, i) => {
    const hour = 8 + i;
    return {
      time: `${hour}:00`,
      NEP: Math.floor(Math.random() * 5000) + 10000,
      CPN: Math.floor(Math.random() * 4000) + 8000,
      MAO: Math.floor(Math.random() * 3000) + 6000,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={hours} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 10 }} />
        <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
          }}
        />
        <Legend />
        <Line type="monotone" dataKey="NEP" stroke="#2E7D32" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="CPN" stroke="#DC143C" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="MAO" stroke="#6A1B9A" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default function ElectionCharts({ parties, totalSeats, countedSeats }: ElectionChartsProps) {
  return (
    <div className="space-y-4">
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-cyan-400">Seat Projection</CardTitle>
        </CardHeader>
        <CardContent>
          <PartySeatChart parties={parties} />
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-cyan-400">Vote Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <PartyVotePieChart parties={parties} />
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-cyan-400">
            Counting Progress ({countedSeats}/{totalSeats})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SeatProgressChart totalSeats={totalSeats} countedSeats={countedSeats} />
        </CardContent>
      </Card>
    </div>
  );
}
