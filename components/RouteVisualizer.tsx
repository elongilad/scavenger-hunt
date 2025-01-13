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
      console.log('Stations data:', stations);

      mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        securityLevel: 'loose',
      });

      const diagram = `graph TD
        ${Object.entries(stations).map(([stationId, station]) => 
          Object.values(station.routes).map(route => 
            `${stationId}("${station.name}") -->|"${route.password}"| ${route.nextStation}`
          ).join('\n')
        ).join('\n')}
        
        classDef default fill:#2A303C,stroke:#475569,color:#fff,rx:10,ry:10;
        class ${Object.keys(stations).join(',')} default;
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