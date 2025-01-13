"use client"

import React, { useEffect, useId } from 'react';
import { Card, CardContent } from './ui/card';
import mermaid from 'mermaid';

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
  const uniqueId = useId().replace(/:/g, '');

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'dark',
      securityLevel: 'loose',
      flowchart: {
        curve: 'basis',
        defaultRenderer: 'dagre-wrapper'
      }
    });

    const diagram = `graph LR
      ${Object.entries(stations).map(([stationId, station]) => 
        Object.values(station.routes).map(route => 
          `${stationId}[${station.name}] -->|${route.password}| ${route.nextStation}`
        ).join('\n')
      ).join('\n')}
      
      classDef default fill:#2A303C,stroke:#475569,color:#fff
      classDef active fill:#1E40AF,stroke:#60A5FA,color:#fff
    `;

    try {
      // Clear the previous diagram
      const element = document.getElementById(uniqueId);
      if (element) {
        element.innerHTML = '';
      }
      
      // Render new diagram
      mermaid.render(uniqueId, diagram).then(({ svg }) => {
        if (element) {
          element.innerHTML = svg;
        }
      });
    } catch (error) {
      console.error('Failed to render mermaid diagram:', error);
    }
  }, [stations, uniqueId]);

  return (
    <Card className="bg-zinc-900 text-white border border-zinc-800">
      <CardContent className="p-6">
        <div className="bg-zinc-800 p-4 rounded-lg overflow-auto">
          <div id={uniqueId} />
        </div>
      </CardContent>
    </Card>
  );
};

export default RouteVisualizer;