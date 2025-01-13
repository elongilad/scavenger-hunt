"use client"

import React, { useEffect } from 'react';
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
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'dark',
      sequence: { useMaxWidth: false },
      flowchart: { useMaxWidth: false },
      themeVariables: {
        nodeBorder: '#475569',
        mainBkg: '#2A303C',
        nodeTextColor: '#ffffff',
      }
    });

    const renderDiagram = async () => {
      const colors = [
        '#FF6B6B',  // Red
        '#4ECDC4',  // Cyan
        '#FFD93D',  // Yellow
        '#95D44A',  // Green
        '#A78BFA'   // Purple
      ];

      let linkIndex = 0;

      const diagram = `graph TD
        %% Define nodes
        ${Object.keys(stations).map(stationId => 
          `${stationId}["${stations[stationId].name}"]`
        ).join('\n')}

        %% Define routes with colors
        ${Object.entries(stations).map(([stationId, station]) => 
          Object.entries(station.routes).map(([, route]) => {
            const color = colors[linkIndex++ % colors.length];
            return `linkStyle ${linkIndex - 1} stroke:${color},color:${color}
            ${stationId} -->|"${route.password}"| ${route.nextStation}`;
          }).join('\n')
        ).join('\n')}

        %% Node styling
        classDef default fill:#2A303C,stroke:#475569,color:#fff;
      `;

      console.log('Generated diagram:', diagram);

      try {
        const element = document.getElementById('mermaid-diagram');
        if (element) {
          element.innerHTML = `<pre class="mermaid">${diagram}</pre>`;
          await mermaid.run();
        }
      } catch (error) {
        console.error('Failed to render mermaid diagram:', error);
      }
    };

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