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

// Add type for team colors
type TeamColors = {
  teamA: string;
  teamB: string;
  teamC: string;
  teamD: string;
  teamE: string;
};

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
      // Define colors for different teams with proper typing
      const teamColors: TeamColors = {
        teamA: '#FF6B6B',  // Red
        teamB: '#4ECDC4',  // Cyan
        teamC: '#FFD93D',  // Yellow
        teamD: '#95D44A',  // Green
        teamE: '#A78BFA'   // Purple
      };

      const teamColorsList = Object.values(teamColors);
      let teamColorIndex = 0;
      const routeColors = new Map<string, string>();

      // Assign colors to routes starting from each station
      Object.keys(stations).forEach(stationId => {
        const routes = stations[stationId].routes;
        Object.keys(routes).forEach(fromStation => {
          if (fromStation.startsWith('START') || fromStation.startsWith('GROUP')) {
            const color = teamColorsList[teamColorIndex % teamColorsList.length];
            routeColors.set(fromStation, color);
            teamColorIndex++;
          }
        });
      });

      const diagram = `graph TD
        %% Define nodes
        ${Object.entries(stations).map(([stationId, station]) => 
          `${stationId}["${station.name}"]`
        ).join('\n')}

        %% Define routes with colors
        ${Object.entries(stations).map(([stationId, station]) => 
          Object.entries(station.routes).map(([fromStation, route]) => {
            const color = routeColors.get(fromStation) || '#666666';
            return `${stationId} -->|"${route.password}"| ${route.nextStation}
            style ${stationId}-${route.nextStation} stroke:${color},color:${color}`;
          }).join('\n')
        ).join('\n')}

        %% Node styling
        classDef default fill:#2A303C,stroke:#475569,color:#fff;
        ${Object.keys(stations).map(stationId => 
          `class ${stationId} default`
        ).join('\n')}
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