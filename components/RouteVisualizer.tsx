"use client"

import React, { useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import mermaid from 'mermaid';

// Initialize mermaid with correct config options
mermaid.initialize({
  startOnLoad: true,
  theme: 'dark',
  securityLevel: 'loose',
  flowchart: {
    curve: 'basis',
    defaultRenderer: 'dagre-wrapper'  // Changed from 'dagre' to 'dagre-wrapper'
  }
});

interface StationRoute {
  nextStation: string;
  password: string;
  nextClue: string;
  videoUrl: string;
}

interface Station {
  id: string;
  name: string;
  routes: Record<string, StationRoute>;
}

interface RouteVisualizerProps {
  stations: Record<string, Station>;
}

const RouteVisualizer = ({ stations }: RouteVisualizerProps) => {
  useEffect(() => {
    mermaid.contentLoaded();
  }, [stations]);

  const generateMermaidDiagram = () => {
    const diagram = `graph LR
      ${Object.entries(stations).map(([stationId, station]) => 
        Object.values(station.routes).map(route => 
          `${stationId}[${station.name}] -->|${route.password}| ${route.nextStation}`
        ).join('\n')
      ).join('\n')}
      
      classDef default fill:#2A303C,stroke:#475569,color:#fff
      classDef active fill:#1E40AF,stroke:#60A5FA,color:#fff
    `;
    return diagram;
  };

  return (
    <Card className="bg-zinc-900 text-white border border-zinc-800">
      <CardContent className="p-6">
        <div className="bg-zinc-800 p-4 rounded-lg">
          <div className="mermaid">
            {generateMermaidDiagram()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RouteVisualizer;