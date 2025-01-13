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
    // Initialize mermaid at component mount
    mermaid.initialize({
      startOnLoad: true,
      theme: 'dark',
      sequence: { useMaxWidth: false },
      flowchart: { useMaxWidth: false },
      themeVariables: {
        nodeBorder: '#475569',
        mainBkg: '#2A303C',
        nodeTextColor: '#ffffff',
        lineColor: '#475569',
      }
    });

    const renderDiagram = async () => {
      const diagram = `graph TD
        ${Object.entries(stations).map(([stationId, station]) => 
          Object.values(station.routes).map(route => 
            `${stationId}["${station.name}"] -->"${route.password}"${route.nextStation}`
          ).join('\n')
        ).join('\n')}
      `;

      console.log('Generated diagram:', diagram);

      try {
        // Clear any existing content
        const element = document.getElementById('mermaid-diagram');
        if (element) {
          element.innerHTML = `<pre class="mermaid">${diagram}</pre>`;
          await mermaid.run();
        }
      } catch (error) {
        console.error('Failed to render mermaid diagram:', error);
      }
    };

    // Small delay to ensure DOM is ready
    setTimeout(() => {
      renderDiagram();
    }, 100);
  }, [stations]);

  return (
    <Card className="bg-zinc-900 text-white border border-zinc-800">
      <CardContent className="p-6">
        <div className="bg-zinc-800 p-4 rounded-lg overflow-x-auto">
          <div id="mermaid-diagram" className="min-h-[200px] flex items-center justify-center" />
        </div>
      </CardContent>
    </Card>
  );
};

export default RouteVisualizer;