'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ElectionResult, PartySummary } from '@/lib/ratopatiScraper';

interface NepalMapProps {
  results: ElectionResult[];
  parties: PartySummary[];
  onConstituencyClick?: (constituency: string) => void;
}

interface ConstituencyMarker {
  name: string;
  nameEn: string;
  lat: number;
  lng: number;
  leader: string;
  party: string;
  votes: number;
  margin: number;
}

const CONSTITUENCIES: ConstituencyMarker[] = [
  { name: 'काठमाडौं-१', nameEn: 'Kathmandu-1', lat: 27.7172, lng: 85.3240, leader: '', party: '', votes: 0, margin: 0 },
  { name: 'काठमाडौं-२', nameEn: 'Kathmandu-2', lat: 27.7272, lng: 85.3340, leader: '', party: '', votes: 0, margin: 0 },
  { name: 'काठमाडौं-३', nameEn: 'Kathmandu-3', lat: 27.7072, lng: 85.3140, leader: '', party: '', votes: 0, margin: 0 },
  { name: 'ललितपुर-१', nameEn: 'Lalitpur-1', lat: 27.4667, lng: 85.3000, leader: '', party: '', votes: 0, margin: 0 },
  { name: 'ललितपुर-२', nameEn: 'Lalitpur-2', lat: 27.4767, lng: 85.3100, leader: '', party: '', votes: 0, margin: 0 },
  { name: 'भक्तपुर-१', nameEn: 'Bhaktapur-1', lat: 27.6725, lng: 85.4260, leader: '', party: '', votes: 0, margin: 0 },
  { name: 'कास्की-१', nameEn: 'Kaski-1', lat: 28.2096, lng: 83.9856, leader: '', party: '', votes: 0, margin: 0 },
  { name: 'चितवन-₁', nameEn: 'Chitwan-1', lat: 27.5333, lng: 84.3333, leader: '', party: '', votes: 0, margin: 0 },
  { name: 'पोखरा-₁', nameEn: 'Pokhara-1', lat: 28.2096, lng: 83.9856, leader: '', party: '', votes: 0, margin: 0 },
  { name: 'बुटवल-₁', nameEn: 'Butwal-1', lat: 27.7000, lng: 83.4333, leader: '', party: '', votes: 0, margin: 0 },
  { name: 'जनकपुर-₁', nameEn: 'Janakpur-1', lat: 26.7278, lng: 85.8961, leader: '', party: '', votes: 0, margin: 0 },
  { name: 'विरगञ्ज-₁', nameEn: 'Birgunj-1', lat: 27.0078, lng: 84.8533, leader: '', party: '', votes: 0, margin: 0 },
  { name: 'धरान-₁', nameEn: 'Dharan-1', lat: 26.8125, lng: 87.2833, leader: '', party: '', votes: 0, margin: 0 },
  { name: 'इटहरी-₁', nameEn: 'Ithari-1', lat: 26.6667, lng: 87.4167, leader: '', party: '', votes: 0, margin: 0 },
  { name: 'हेटौंडा-₁', nameEn: 'Hetauda-1', lat: 27.4286, lng: 85.0308, leader: '', party: '', votes: 0, margin: 0 },
  { name: 'नवलपरासी-₁', nameEn: 'Nawalparasi-1', lat: 27.5333, lng: 83.9333, leader: '', party: '', votes: 0, margin: 0 },
];

const PARTY_COLORS: Record<string, string> = {
  'नेपाली कांग्रेस': '#2E7D32',
  'नेपाल कम्युनिष्ट पार्टी (माओवादी केन्द्र)': '#6A1B9A',
  'नेपाल कम्युनिष्ट पार्टी (एमाले)': '#DC143C',
  'जनता समाजवादी पार्टी, नेपाल': '#FF6F00',
  'राष्ट्रीय स्वतन्त्र पार्टी': '#00ACC1',
  'बहुजन समाजवादी पार्टी नेपाल': '#1565C0',
  'निर्वाचन स्वतन्त्र': '#9E9E9E',
};

export default function NepalMap({ results, parties, onConstituencyClick }: NepalMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredConstituency, setHoveredConstituency] = useState<ConstituencyMarker | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2);
    gradient.addColorStop(0, '#1e293b');
    gradient.addColorStop(1, '#0f172a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    const leadingResults = results.filter(r => r.isLeading).slice(0, 20);
    
    const updatedConstituencies = CONSTITUENCIES.map((c, idx) => {
      const result = leadingResults[idx];
      if (result) {
        return {
          ...c,
          leader: result.candidate,
          party: result.party,
          votes: result.votes,
          margin: result.margin,
        };
      }
      return c;
    });

    const minLat = 26.3;
    const maxLat = 30.4;
    const minLng = 80.0;
    const maxLng = 88.2;

    const xScale = (lng: number) => ((lng - minLng) / (maxLng - minLng)) * (width - 80) + 40;
    const yScale = (lat: number) => ((maxLat - lat) / (maxLat - minLat)) * (height - 80) + 40;

    ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 10; i++) {
      ctx.beginPath();
      ctx.moveTo(40, 40 + i * ((height - 80) / 9));
      ctx.lineTo(width - 40, 40 + i * ((height - 80) / 9));
      ctx.stroke();
    }

    updatedConstituencies.forEach((c) => {
      const x = xScale(c.lng);
      const y = yScale(c.lat);
      const color = PARTY_COLORS[c.party] || '#9E9E9E';

      const isHovered = hoveredConstituency?.name === c.name;
      const radius = isHovered ? 14 : 10;

      ctx.beginPath();
      ctx.arc(x, y, radius + 4, 0, Math.PI * 2);
      ctx.fillStyle = `${color}33`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      const shortName = c.name.replace('-', '\n');
      ctx.fillText(shortName.split('\n')[0], x, y + radius + 14);
    });

  }, [results, hoveredConstituency]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const minLat = 26.3;
    const maxLat = 30.4;
    const minLng = 80.0;
    const maxLng = 88.2;

    const width = canvas.width;
    const height = canvas.height;

    const xScale = (lng: number) => ((lng - minLng) / (maxLng - minLng)) * (width - 80) + 40;
    const yScale = (lat: number) => ((maxLat - lat) / (maxLat - minLat)) * (height - 80) + 40;

    const leadingResults = results.filter(r => r.isLeading).slice(0, 20);

    let found = null;
    for (let i = 0; i < CONSTITUENCIES.length; i++) {
      const c = CONSTITUENCIES[i];
      const result = leadingResults[i];
      const cx = xScale(c.lng);
      const cy = yScale(c.lat);
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);

      if (dist < 20) {
        found = {
          ...c,
          leader: result?.candidate || '',
          party: result?.party || '',
          votes: result?.votes || 0,
          margin: result?.margin || 0,
        };
        break;
      }
    }

    setHoveredConstituency(found);
  };

  const handleClick = () => {
    if (hoveredConstituency && onConstituencyClick) {
      onConstituencyClick(hoveredConstituency.name);
    }
  };

  return (
    <Card className="glass-card h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-cyan-400 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          Nepal Constituency Map
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={400}
            height={450}
            className="w-full h-auto rounded-lg cursor-pointer"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredConstituency(null)}
            onClick={handleClick}
          />
          {hoveredConstituency && (
            <div className="absolute top-2 right-2 glass-card p-3 rounded-lg text-xs">
              <div className="font-bold text-cyan-400">{hoveredConstituency.name}</div>
              <div className="text-white mt-1">{hoveredConstituency.leader || 'TBD'}</div>
              <div className="text-muted-foreground">{hoveredConstituency.party || 'N/A'}</div>
              {hoveredConstituency.votes > 0 && (
                <>
                  <div className="text-cyan-300 mt-1">
                    {hoveredConstituency.votes.toLocaleString()} votes
                  </div>
                  <div className="text-orange-300">
                    +{hoveredConstituency.margin.toLocaleString()} margin
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
