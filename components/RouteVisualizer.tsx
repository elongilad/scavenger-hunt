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
    const renderDiagram = async () => {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        securityLevel: 'loose',
      });

      // Create safe IDs by removing special characters
      const getSafeId = (id: string) => id.replace(/[^a-zA-Z0-9]/g, '_');

      const diagram = `graph TD
        ${Object.entries(stations).map(([stationId, station]) => 
          Object.values(station.routes).map(route => {
            const safeStationId = getSafeId(stationId);
            const safeNextStation = getSafeId(route.nextStation);
            return `${safeStationId}["${station.name}"] -->|"${route.password}"| ${safeNextStation}`;
          }).join('\n')
        ).join('\n')}
        classDef default fill:#2A303C,stroke:#475569,color:#fff;
        ${Object.keys(stations).map(stationId => `class ${getSafeId(stationId)} default;`).join('\n')}
      `;

      console.log('Generated diagram:', diagram);

      try {
        const element = document.getElementById(uniqueId);
        if (element) {
          element.innerHTML = '';
          const { svg } = await mermaid.render(uniqueId, diagram);
          element.innerHTML = svg;
        }
      } catch (error) {
        console.error('Failed to render mermaid diagram:', error);
        console.error('Diagram that failed:', diagram);
      }
    };

    renderDiagram();
  }, [stations, uniqueId]);

  return (
    <Card className="bg-zinc-900 text-white border border-zinc-800">
      <CardContent className="p-6">
        <div className="bg-zinc-800 p-4 rounded-lg overflow-x-auto">
          <div id={uniqueId} className="min-h-[200px] flex items-center justify-center" />
        </div>
      </CardContent>
    </Card>
  );
};

export default RouteVisualizer;